import { createHash } from "node:crypto";
import { getStore } from "@netlify/blobs";

// Kept in sync by hand with the RUBRIC array in index.html — if you edit the
// rubric there, mirror the change here too.
const RUBRIC = [
  {
    key: "disclosure",
    name: "Disclosure and framing",
    ask: "Is it clear the user is interacting with AI, and are its capabilities and limits set before use, not discovered through failure?"
  },
  {
    key: "calibration",
    name: "Restraint at the moments that matter",
    ask: "Did the team resist automating something they clearly could have, keeping a human decision in the loop where the stakes were high — or did convenience win by default?"
  },
  {
    key: "control",
    name: "User control and reversibility",
    ask: "Can the user edit, undo, reject, or override the AI's output before its consequences land, especially for anything costly to reverse?"
  },
  {
    key: "uncertainty",
    name: "Uncertainty communication",
    ask: "Does the interface signal how confident the AI actually is, and avoid presenting guesses with the same authority as facts?"
  },
  {
    key: "explainability",
    name: "Explainability",
    ask: "Can the user see why the AI produced this output, at a level of depth appropriate to what's at stake?"
  },
  {
    key: "failure",
    name: "Graceful failure",
    ask: "When the AI is wrong, stuck, or missing information, is there a dignified fallback, or does the interface pretend that can't happen?"
  },
  {
    key: "feedback",
    name: "Feedback and correction loop",
    ask: "When a user corrects the AI, is that correction visibly used, or does it vanish with no effect on future behavior?"
  }
];

const PER_VISITOR_CAP = Number(process.env.FREE_AUDIT_PER_VISITOR_CAP) || 3;
const VISITOR_WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // rolling 30 days
const GLOBAL_MONTHLY_CAP = Number(process.env.FREE_AUDIT_GLOBAL_MONTHLY_CAP) || 500;

const MAX_DESC_CHARS = 8000;
const MAX_URLTEXT_CHARS = 20000;
const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // ~6MB raw, generous for a screenshot

const STORE_NAME = "candor-free-audit-usage";

export default async (req, context) => {
  if (req.method !== "POST") {
    return json({ error: "METHOD_NOT_ALLOWED" }, 405);
  }

  const apiKey = process.env.ANTHROPIC_SERVER_API_KEY;
  if (!apiKey) {
    // Never reveal *why* to the client — just that the free path isn't available.
    return json({ error: "FREE_TIER_UNAVAILABLE" }, 503);
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return json({ error: "BAD_REQUEST", message: "Malformed request." }, 400);
  }

  const desc = typeof body.desc === "string" ? body.desc.trim() : "";
  const url = typeof body.url === "string" ? body.url.trim() : "";
  const urlText = typeof body.urlText === "string" ? body.urlText : "";
  const imageBase64 = typeof body.imageBase64 === "string" ? body.imageBase64 : "";
  const imageMediaType = typeof body.imageMediaType === "string" ? body.imageMediaType : "";

  if (!desc && !imageBase64 && !url) {
    return json({ error: "BAD_REQUEST", message: "Describe the feature, paste a URL, or attach a screenshot." }, 400);
  }
  if (desc.length > MAX_DESC_CHARS || urlText.length > MAX_URLTEXT_CHARS) {
    return json({ error: "BAD_REQUEST", message: "That input is too long." }, 400);
  }
  if (imageBase64 && imageBase64.length * 0.75 > MAX_IMAGE_BYTES) {
    return json({ error: "BAD_REQUEST", message: "That screenshot is too large." }, 400);
  }

  const store = getStore(STORE_NAME);
  const now = Date.now();
  const monthKey = "global:" + new Date(now).toISOString().slice(0, 7); // e.g. "global:2026-08"

  const globalEntry = (await store.get(monthKey, { type: "json" })) || { count: 0 };
  if (globalEntry.count >= GLOBAL_MONTHLY_CAP) {
    return json({ error: "GLOBAL_CAP_REACHED" }, 429);
  }

  const ip = context.ip || "unknown";
  const visitorHash = hashVisitor(ip);
  const visitorKey = "visitor:" + visitorHash;

  const visitorEntry = await store.get(visitorKey, { type: "json" });
  const withinWindow = visitorEntry && (now - visitorEntry.windowStart) < VISITOR_WINDOW_MS;
  const visitorCount = withinWindow ? visitorEntry.count : 0;
  const windowStart = withinWindow ? visitorEntry.windowStart : now;

  if (visitorCount >= PER_VISITOR_CAP) {
    return json({ error: "VISITOR_CAP_REACHED" }, 429);
  }

  const rubricText = RUBRIC.map(r => "- " + r.key + " (" + r.name + "): " + r.ask).join("\n");
  const systemPrompt = "You are Candor, a rigorous AI interaction design auditor. You evaluate AI product features against a fixed 7-dimension rubric. You are not a cheerleader: if a dimension is genuinely absent, score it 0 and say so plainly. Score each dimension 0 (absent), 1 (partial), or 2 (strong), based only on what is described or shown, not assumptions about what might exist elsewhere in the product. Respond with ONLY valid JSON, no markdown fences, no commentary outside the JSON, matching exactly this shape:\n{\"summary\": \"one or two sentence overall verdict\", \"grade\": \"short label like 'Needs work' or 'Solid foundation' or 'Trustworthy by design'\", \"dimensions\": [{\"key\": \"disclosure\", \"score\": 0, \"rationale\": \"one to two sentences, specific to what was described\", \"fix\": \"one concrete, actionable fix, not generic advice\"}, ...one entry per rubric dimension in this order...]}\n\nRubric:\n" + rubricText;

  const content = [];
  if (desc) content.push({ type: "text", text: "Feature description:\n" + desc });
  if (urlText) content.push({ type: "text", text: "Extracted text content from " + url + " (readable text only, not a visual render, so judge layout-dependent dimensions cautiously):\n" + urlText });
  if (imageBase64) content.push({ type: "image", source: { type: "base64", media_type: imageMediaType, data: imageBase64 } });
  if (content.length === 1 && content[0].type === "image") content.unshift({ type: "text", text: "Audit the AI feature shown in this screenshot." });

  let parsed;
  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: "user", content: content }]
      })
    });

    if (!anthropicRes.ok) {
      // Log only the status — never the response body, which could echo request details.
      console.error("free-audit: Anthropic API error, status", anthropicRes.status);
      return json({ error: "UPSTREAM_ERROR" }, 502);
    }

    const data = await anthropicRes.json();
    const raw = data.content[0].text.trim();
    const jsonStr = raw.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "");
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    console.error("free-audit: request failed:", e.message);
    return json({ error: "UPSTREAM_ERROR" }, 502);
  }

  // Only spend the visitor's free quota on a successful audit.
  await incrementCounter(store, monthKey, { count: globalEntry.count }, entry => ({ count: entry.count + 1 }));
  await incrementCounter(store, visitorKey, { count: visitorCount, windowStart: windowStart }, entry => ({ count: entry.count + 1, windowStart: entry.windowStart }));

  parsed.freeRemaining = Math.max(0, PER_VISITOR_CAP - (visitorCount + 1));
  return json(parsed, 200);
};

function hashVisitor(ip) {
  const salt = process.env.FREE_AUDIT_IP_SALT || "candor-default-salt";
  return createHash("sha256").update(ip + ":" + salt).digest("hex");
}

// Best-effort compare-and-swap increment. Netlify Blobs isn't transactional,
// so under concurrent requests from the same key a couple of increments could
// race — acceptable slop given the small dollar amounts this caps. A lost
// conditional write returns {modified: false} rather than throwing, so we
// retry on that; after a few tries we fall back to a plain write so the
// count isn't silently lost.
async function incrementCounter(store, key, fallbackBase, mutate) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const existing = await store.getWithMetadata(key, { type: "json" });
    const base = existing ? existing.data : fallbackBase;
    const next = mutate(base);
    const options = existing && existing.etag ? { onlyIfMatch: existing.etag } : { onlyIfNew: true };
    const result = await store.setJSON(key, next, options);
    if (result.modified) return;
    // Lost the race (or the key already existed on an onlyIfNew attempt) — retry with fresh data.
  }
  const existing = await store.getWithMetadata(key, { type: "json" });
  const base = existing ? existing.data : fallbackBase;
  await store.setJSON(key, mutate(base));
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status,
    headers: { "content-type": "application/json" }
  });
}

export const config = { path: "/api/free-audit" };

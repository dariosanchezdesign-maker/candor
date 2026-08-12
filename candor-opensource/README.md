# Candor

An AI interaction auditor. Paste a description, a URL, or a screenshot of an AI feature and get a rubric-based critique — not a compliment.

Live: https://candor-ai.netlify.app

Doctrine: this tool is built on one belief — the best AI product design is defined by what it refuses to automate. The full argument is here: [`candor-doctrine.md`](./candor-doctrine.md). A follow-up piece on agent-consent design for MCP is here: [`candor-doctrine-mcp-consent.md`](./candor-doctrine-mcp-consent.md).

## Why this repo is public

Candor asks you to paste a real Anthropic API key into a form. That's a real trust ask, and Candor's whole argument is that trust should be provable, not just claimed. So here's the proof: this is the entire application. One HTML file. No backend, no build step, no server that ever sees your key.

Read `index.html` yourself, or open your browser's network tab while using the live site. You'll see exactly one outbound request per audit, straight to `https://api.anthropic.com/v1/messages`, with your key attached only as the `x-api-key` header on that request. Nothing is logged, nothing is stored server-side, because there is no server. The only persistence is `localStorage`, and only for two things: your audit history and your light/dark theme preference — never the key itself.

## The rubric

Every audit is scored against seven fixed dimensions:

- **Disclosure and framing** — is it clear the user is interacting with AI, before they find out the hard way
- **Restraint at the moments that matter** — did the team automate something that should have stayed a human decision
- **User control and reversibility** — can the user edit, undo, or override before consequences land
- **Uncertainty communication** — does the interface signal real confidence instead of presenting guesses as fact
- **Explainability** — can the user see why the AI produced this output
- **Graceful failure** — what happens when the AI is wrong, stuck, or missing information
- **Feedback and correction loop** — does a user's correction actually change future behavior

Each dimension is scored absent, partial, or strong, with a specific fix attached — never a generic one.

## Running it locally

There's nothing to install. Open `index.html` in a browser, or serve the folder with anything static:

```
npx serve .
```

You'll need your own Anthropic API key from [console.anthropic.com](https://console.anthropic.com) to run an audit — Candor doesn't provide one for you (see "Why this repo is public" above for exactly why, and where that key goes).

## License

MIT — see [LICENSE](./LICENSE).

# The SHOULD in the room

### MCP gave agents a way to ask permission. Nobody designed what asking well looks like.

By Darío Sánchez

The Model Context Protocol gave AI agents a real, working mechanism for pausing mid-task to ask a human something. It's called elicitation. A server can stop in the middle of an operation, send a structured request back through the client, and wait -- the user responds accept, decline, or cancel, and only then does the agent continue. Technically, it's a solved problem. An agent can ask before it acts.

Here's the sentence in the specification that matters more than the mechanism itself: there SHOULD always be a human in the loop with the ability to deny tool invocations. Not must. Should. The protocol built the door. It left the decision of whether to walk through it, and what the room on the other side looks like, entirely up to whoever builds the client.

That gap is where this doctrine lives.

## A SHOULD is not a design

Most of what gets built against a SHOULD ends up looking the same: one dialog box, one "Allow this action?", reused for every tool call regardless of what the tool is actually about to do. That single dialog is what elicitation degrades into when nobody designs past the minimum the spec requires. And a single undifferentiated confirmation, asked the same way every time, teaches people to stop reading it. This isn't a new failure -- it's the same one that turned browser permission prompts and cookie banners into muscle-memory clicks. The difference is the stakes. Approving a cookie banner wrong costs you a tracking pixel. Approving an agent's tool call wrong can cost you a sent email, a deleted file, a wire transfer, a message to the wrong person, at machine speed and often before you've finished reading the first line.

Candor's rubric calls this dimension restraint: does the friction in an interface actually scale with what's at risk, or does convenience win by default. Elicitation is restraint's technical substrate for agentic tool use -- the hook the protocol provides for a human to stay in the loop. Whether that hook produces real restraint or theater depends entirely on what gets built on top of it, and right now almost nothing has been.

## What asking well would actually require

Four things, none of them exotic, all of them currently optional because the spec never mandates them.

Friction has to scale with stakes. A read-only lookup -- list my upcoming events, check a balance -- should barely interrupt, if it interrupts at all. An irreversible write -- send this message, charge this amount, delete this record -- should force real attention: a harder stop, not just another modal shaped like the last nine the user clicked through.

The confirmation has to show the consequence, not the function signature. "Agent wants to call send_email -- Allow?" discloses what's about to run, not what's about to happen. Real consent means showing the actual draft, the actual recipient, the actual amount -- the thing a human would need to see to catch a mistake, not the API call that produces it. This is Candor's explainability dimension, applied to a permission dialog instead of a chat response.

Decline has to be a first-class path, not a buried one. If accepting is one tap and declining requires hunting for a smaller link in the corner, the interface is nudging toward approval regardless of what it claims to be doing. Consent designed to be technically present but practically discouraged isn't consent -- it's a liability shield wearing consent's clothes.

And elicitation has to know its own limits. The specification itself is explicit that this mechanism should never be used to collect passwords, payment credentials, or other sensitive data through a form -- that kind of request has to be handled outside the flow entirely, through a channel built for it. A consent mechanism that will ask for anything, including the things it shouldn't, has already failed the same restraint test it's supposed to enforce.

## The SHOULD succeeds or fails in the implementation

The protocol did its part. It gave every MCP client builder a real mechanism and a stated expectation that a human should stay in the loop. What it didn't do, and was never going to do, is design the moment itself -- because protocols specify what's possible, not what's good. That part was always going to be left to whoever builds the interface the human actually sees.

The agent tools that earn trust over the next few years won't be the ones that technically satisfied the SHOULD by shipping a dialog box. They'll be the ones where the dialog box was actually designed -- where a five-dollar action and a five-thousand-dollar action don't get the same box, where the thing on screen is the consequence and not the code, and where saying no is exactly as easy as saying yes. The protocol asked nicely. Somebody still has to build the room.

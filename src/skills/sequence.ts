export const sequencePrompt = `## Sequence Diagram Style Guide

Create precise, readable sequence diagrams with actor header boxes, vertical lifelines, and horizontal message arrows. Follow the layout rules strictly.

---

## Layout specification

### Actor header boxes (Row 1)
- Shape: \`rectangle\` with \`roundness: {"type": 3}\`
- Dimensions: \`width: 130, height: 50\`
- Horizontal spacing: place actors every **220px** apart (centers at x=65, 285, 505, 725, ...)
- Position: \`y: 80\` for all actor boxes
- Fill: \`backgroundColor: "#e5dbff"\`, \`strokeColor: "#8b5cf6"\`, \`strokeWidth: 2\`
- Label: \`fontSize: 15\`, actor name centered
- Actor ID naming: \`actor_1\`, \`actor_2\`, etc.

**Actor box snippet:**
\`\`\`json
{"type":"rectangle","id":"actor_1","x":0,"y":80,"width":130,"height":50,"backgroundColor":"#e5dbff","fillStyle":"solid","roundness":{"type":3},"strokeColor":"#8b5cf6","strokeWidth":2,"label":{"text":"Client","fontSize":15}}
\`\`\`

### Lifelines (vertical dashed lines)
- One lifeline per actor, centered on the actor box (x = actor_x + 65)
- Start at y=130 (bottom of actor box), extend down to y=750 or beyond as needed
- Shape: \`line\` element with points going straight down
- Style: \`strokeStyle: "dashed"\`, \`strokeColor: "#c0c0c0"\`, \`strokeWidth: 1\`

**Lifeline snippet:**
\`\`\`json
{"type":"line","id":"life_1","x":65,"y":130,"width":0,"height":620,"points":[[0,0],[0,620]],"strokeStyle":"dashed","strokeColor":"#c0c0c0","strokeWidth":1,"roughness":0}
\`\`\`

### Message arrows (horizontal)
- Y position: starts at y=180 for first message, increments by **70px** per message
- X: from source lifeline center to target lifeline center
- \`width\` = distance between lifelines (multiples of 220px)
- \`points\`: \`[[0,0],[width,0]]\` for left-to-right, \`[[0,0],[-width,0]]\` for right-to-left

**Synchronous call (solid blue arrow):**
\`\`\`json
{"type":"arrow","id":"msg_1","x":130,"y":215,"width":155,"height":0,"points":[[0,0],[155,0]],"strokeColor":"#4a9eed","strokeWidth":2,"endArrowhead":"arrow","roughness":0}
\`\`\`

**Return / response (dashed gray arrow):**
\`\`\`json
{"type":"arrow","id":"ret_1","x":285,"y":255,"width":-155,"height":0,"points":[[0,0],[-155,0]],"strokeColor":"#a0a0a0","strokeWidth":1,"strokeStyle":"dashed","endArrowhead":"arrow","roughness":0}
\`\`\`

**Error / alternative flow (solid red arrow):**
\`\`\`json
{"type":"arrow","id":"err_1","x":130,"y":325,"width":375,"height":0,"points":[[0,0],[375,0]],"strokeColor":"#ef4444","strokeWidth":2,"endArrowhead":"arrow","roughness":0}
\`\`\`

### Message labels
- Text element placed **above** the arrow, centered between source and target
- y = arrow_y - 16
- x = midpoint between source and target lifelines - (label_width / 2)
- fontSize: 13, strokeColor: "#4a4a4a"
- Keep labels under 20 characters

**Message label snippet:**
\`\`\`json
{"type":"text","id":"lbl_1","x":145,"y":199,"text":"GET /api/user","fontSize":13,"strokeColor":"#4a4a4a"}
\`\`\`

### Activation bars
- Thin rectangle on top of lifeline while actor is "active"
- Width: 12, height: 60 (or match the processing duration)
- x = lifeline_center - 6
- backgroundColor: "#e5dbff", strokeColor: "#8b5cf6", strokeWidth: 1

**Activation bar snippet:**
\`\`\`json
{"type":"rectangle","id":"act_1","x":59,"y":180,"width":12,"height":60,"backgroundColor":"#e5dbff","fillStyle":"solid","strokeColor":"#8b5cf6","strokeWidth":1,"roughness":0}
\`\`\`

---

## Color coding

| Element | Fill | Stroke |
|---------|------|--------|
| Actor boxes | #e5dbff | #8b5cf6 |
| Sync call arrows | — | #4a9eed |
| Return/response | — | #a0a0a0 (dashed) |
| Error/alt flow | — | #ef4444 |
| Lifelines | — | #c0c0c0 (dashed) |
| Activation bars | #e5dbff | #8b5cf6 |
| Diagram title | — | #1e1e1e |

---

## Camera: follow the sequence downward

- First stop: wide shot showing all actors (so the viewer sees the cast)
- Then pan DOWN following the message flow — 3–4 messages per camera stop
- End with a full pull-back showing the entire sequence from top to bottom

**Camera sequence:**
\`\`\`json
{"type":"cameraUpdate","width":800,"height":300,"x":-20,"y":60},
... all actor boxes and lifelines ...
{"type":"cameraUpdate","width":800,"height":450,"x":-20,"y":130},
... messages 1–4 ...
{"type":"cameraUpdate","width":800,"height":450,"x":-20,"y":380},
... messages 5–8 ...
{"type":"cameraUpdate","width":800,"height":900,"x":-20,"y":60}
\`\`\`

---

## Overlap prevention checklist

- Lifeline x = actor_x + 65 (exactly centered)
- Message arrows stay on their y row (no vertical drift)
- Labels are 16px above their arrow (y = arrow_y - 16)
- Activation bars are centered on lifelines (x = lifeline_x - 6)
- Minimum 70px between consecutive message rows
- All actors fit within the first camera frame
- Final camera shows full diagram height

---

## Common mistakes

- **Lifeline not centered** — Must be actor_x + half-width (65 for width=130)
- **Arrows not reaching target** — width must equal the distance between lifeline centers
- **Labels overlapping arrows** — Place label y 16px above arrow y
- **Too many messages at once** — Use camera stops to reveal 3–4 at a time
- **Right-to-left arrows wrong direction** — Use negative width with matching negative point endpoint
- **Missing activation bars** — Add them for actors that process a request`;

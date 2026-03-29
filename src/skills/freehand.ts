export const freehandPrompt = `## Freehand Sketch Style Guide

You are sketching on a whiteboard — not building a flowchart.
Think in IDEAS and POINTERS, not boxes and connections.

---

## The fundamental mindset shift

A flowchart asks: "What connects to what?"
A sketch asks: "What is the central idea, and what do I want to point at?"

Prefer this mental model:
- 1–3 PRIMARY nodes (the main things)
- Everything else is an ANNOTATION pointing at something
- Not every concept needs a box — many live as free text

---

## BEFORE YOU DRAW — mandatory planning

1. Identify the 1–3 most important concepts → these get shapes
2. Everything else → floating text + arrow pointing at the relevant shape
3. Decide layout: radial (one center, things around it) OR loose top-down (max 3 levels)
4. Estimate label lengths → shape width = chars × 11 + 24px
5. Mark where every annotation text will sit (30px+ from any shape edge)
6. Declare every arrow's source AND target before drawing — arrows with no clear target are forbidden
7. If an arrow would cross a text element, REPOSITION the text element instead of adding waypoints

---

## Shape variety — STOP using only rectangles

Vary shapes based on what they represent:

| Concept type | Shape to use |
|---|---|
| Central idea / system | ellipse, large rectangle |
| Process / action | rectangle with rounded corners |
| Person / actor | ellipse |
| Data / storage | rectangle (no roundness) |
| Decision / constraint | diamond |
| Key insight / note | angled sticky (rectangle, angle ±0.08) |
| Plain concept, no box needed | standalone text element, underlined |

**Underline pattern (no box needed):**
\`\`\`json
{"type":"text","id":"t1","x":100,"y":80,"text":"Session State","fontSize":18,"strokeColor":"#1e1e1e","angle":-0.01},
{"type":"rectangle","id":"t1_ul","x":98,"y":102,"width":134,"height":3,"backgroundColor":"#1e1e1e","fillStyle":"solid","strokeColor":"#1e1e1e","roughness":1,"strokeWidth":1}
\`\`\`

Underline y = text y + fontSize + 4px. Never use the same y as the text element.

---

## Annotation-first arrows

Most arrows should go FROM a floating annotation TO a shape — not shape to shape.

**Pattern:**
\`\`\`json
{"type":"text","id":"ann1","x":340,"y":95,"text":"routes tool calls","fontSize":13,"strokeColor":"#6965db","angle":-0.02},
{"type":"arrow","id":"a1","x":395,"y":108,"width":0,"height":55,
 "points":[[0,0],[0,55]],"strokeColor":"#6965db","strokeWidth":2,
 "roughness":2,"endArrowhead":"arrow"}
\`\`\`

Reserve shape-to-shape arrows ONLY for primary data flow (max 3 per diagram).

**Arrow collision rule:**
Never use multi-waypoint paths to route around text — they produce stray lines.
Instead, reposition the annotation text so the arrow path is clear before drawing.

---

## Layout patterns — pick one

### Radial (best for concept maps)
- One ellipse in the center
- 4–6 items arranged loosely around it
- Connecting arrows radiate outward
- Annotations hang off the connections

### Loose top-down (best for flows, max 3 levels)
- Level 1: 1–2 items
- Level 2: 2–4 items
- Level 3: annotations only (no new boxes)
- Horizontal spread: stagger positions by ±20px from even spacing

### Left-to-right narrative
- 3–5 concepts in a loose horizontal band
- Annotations above and below the band
- One "Why?" sticky note off to the side

---

## Sticky notes — use them aggressively

Every diagram should have 1–2 sticky notes for "why" or "key insight" content.
Make them feel thrown on the canvas:

\`\`\`json
{"type":"rectangle","id":"sticky1","x":40,"y":280,"width":170,"height":90,
 "backgroundColor":"#fff3bf","fillStyle":"hachure","hachureAngle":45,
 "roughness":2,"strokeColor":"#f59e0b","strokeWidth":2,"angle":-0.08,
 "label":{"text":"Why MCP?\\nStandard way to\\nplug LLMs into\\nreal systems","fontSize":13}}
\`\`\`

Rules:
- Always rotated ±0.05 to ±0.10 radians (more than regular shapes)
- At least one arrow pointing FROM the sticky TO something relevant
- Place them off to the side, never in the flow path

---

## Core visual rules

### Roughness and stroke
- \`roughness: 2\` on ALL shapes — mandatory, no exceptions
- \`strokeWidth: 2\` standard, \`strokeWidth: 3\` for the 1–2 most important shapes only
- \`strokeColor: "#1e1e1e"\` for all outlines
- \`fillStyle: "hachure"\` for filled shapes
- Alternate \`hachureAngle: 45\` and \`hachureAngle: -45\` between shapes

### Colors — minimal
- Primary shapes: \`"#ffffff"\` or \`"#fffef9"\`
- One accent shape (most important concept): \`"#e5dbff"\` or \`"#d3f9d8"\`
- Sticky notes: \`"#fff3bf"\`
- Never more than 2 fill colors plus white

### Organic placement
- Rotate most shapes slightly: \`angle: 0.01\` to \`-0.04\` (vary direction, never uniform)
- Stagger from "perfect" grid positions by 10–20px
- No swim lanes, no zone backgrounds
- Asymmetry is good — a diagram that looks "almost aligned" feels human

### Spacing — strict minimums
- 60px vertical gap between shape rows (bottom of shape to top of next)
- 40px horizontal gap between columns
- Annotation texts: 30px+ from any shape boundary
- Two text elements: never within 30px vertical of each other

---

## Text rules

- Free-floating annotations: fontSize 13–15, \`strokeColor: "#6965db"\` or \`"#888888"\`
- Primary labels inside shapes: fontSize 16–18
- Title: fontSize 22–26, top-left, \`angle: 0.01\`, no box
- Never fontSize below 13
- Use \`\\n\` to wrap long labels — never let text overflow its shape
- Shape width must be ≥ (longest line chars × 11) + 24px

---

## Arrow rules

- NEVER put a label property on an arrow — use separate text elements
- NEVER use multi-waypoint arrays to route around obstacles — reposition text instead
- Arrow annotations sit 18–22px perpendicular to arrow midpoint:
  - Horizontal arrow → annotation y − 18
  - Vertical arrow → annotation x + 20
  - Diagonal → offset away from nearby shapes
- \`roughness: 2\` on all arrows
- Shape-to-shape arrows: max 3 per diagram
- Annotation-to-shape arrows: use freely
- \`endArrowhead: null\` for loose associations
- \`endArrowhead: "arrow"\` for directed flow
- \`strokeStyle: "dashed"\` for return/optional paths
- All arrows use simple two-point paths: \`points: [[0,0],[dx,dy]]\` only

---

## Drawing order per cluster

1. cameraUpdate — pan to this section
2. Primary shapes (back to front)
3. Standalone underlined text labels
4. Sticky notes
5. Shape-to-shape arrows
6. Annotation texts
7. Annotation-to-shape arrows (drawn last, sit on top)

---

## Camera

- 3–5 stops, start zoomed in, end wide
- Pan diagonally sometimes — not always left→right
- Final: wide view with ~80px padding, valid 4:3 ratio only:
  \`400x300\`, \`600x450\`, \`800x600\`, \`1200x900\`, \`1600x1200\`

---

## Pre-draw checklist

- [ ] Max 2 fill colors used (plus white)
- [ ] At least 1 ellipse or diamond (not all rectangles)
- [ ] At least 1 standalone underlined text element (no shape)
- [ ] At least 1 sticky note at angle ±0.05–0.10
- [ ] No arrow has a label property
- [ ] No arrow uses more than 2 points — \`[[0,0],[dx,dy]]\` only
- [ ] All annotation texts are 30px+ from shape boundaries
- [ ] All shapes wide enough for labels (chars × 11 + 24px)
- [ ] Every arrow has a declared source AND target
- [ ] Annotation texts repositioned so arrow paths are clear
- [ ] Underline y = text y + fontSize + 4px
- [ ] Layout is radial or loosely top-down (not a rigid grid)
- [ ] At least 3 camera positions
- [ ] Final element is a wide cameraUpdate

---

## Snippets

**Ellipse (actor/central concept):**
\`\`\`json
{"type":"ellipse","id":"e1","x":80,"y":100,"width":150,"height":80,
 "backgroundColor":"#fffef9","fillStyle":"hachure","hachureAngle":45,
 "roughness":2,"strokeColor":"#1e1e1e","strokeWidth":2,"angle":-0.02,
 "label":{"text":"User","fontSize":17}}
\`\`\`

**Rounded rectangle (process):**
\`\`\`json
{"type":"rectangle","id":"r1","x":280,"y":100,"width":180,"height":80,
 "backgroundColor":"#ffffff","fillStyle":"hachure","hachureAngle":-45,
 "roughness":2,"strokeColor":"#1e1e1e","strokeWidth":3,"angle":0.02,
 "roundness":{"type":3},
 "label":{"text":"MCP Host\\n(tool router)","fontSize":16}}
\`\`\`

**Diamond (decision/constraint):**
\`\`\`json
{"type":"diamond","id":"d1","x":480,"y":95,"width":140,"height":100,
 "backgroundColor":"#ffffff","fillStyle":"hachure","hachureAngle":45,
 "roughness":2,"strokeColor":"#1e1e1e","strokeWidth":2,"angle":0.01,
 "label":{"text":"Policy /\\nPermissions","fontSize":14}}
\`\`\`

**Underlined text (no box):**
\`\`\`json
{"type":"text","id":"tx1","x":500,"y":90,"text":"Session State","fontSize":17,"strokeColor":"#1e1e1e","angle":-0.01},
{"type":"rectangle","id":"tx1_ul","x":498,"y":111,"width":130,"height":3,"backgroundColor":"#1e1e1e","fillStyle":"solid","strokeColor":"#1e1e1e","roughness":1,"strokeWidth":1}
\`\`\`

**Annotation + pointer:**
\`\`\`json
{"type":"text","id":"ann1","x":350,"y":75,"text":"tool calls + results","fontSize":13,"strokeColor":"#6965db","angle":-0.02},
{"type":"arrow","id":"ann1_ptr","x":375,"y":92,"width":0,"height":40,
 "points":[[0,0],[0,40]],"strokeColor":"#6965db","strokeWidth":2,
 "roughness":2,"endArrowhead":"arrow"}
\`\`\`

**Simple shape-to-shape arrow:**
\`\`\`json
{"type":"arrow","id":"a1","x":230,"y":140,"width":80,"height":0,
 "points":[[0,0],[80,0]],
 "strokeColor":"#1e1e1e","strokeWidth":2,"roughness":2,"endArrowhead":"arrow"}
\`\`\`

**Sticky note:**
\`\`\`json
{"type":"rectangle","id":"sticky1","x":40,"y":260,"width":165,"height":95,
 "backgroundColor":"#fff3bf","fillStyle":"hachure","hachureAngle":45,
 "roughness":2,"strokeColor":"#f59e0b","strokeWidth":2,"angle":-0.08,
 "label":{"text":"Why MCP?\\nStandard way\\nto plug LLMs\\ninto real systems","fontSize":13}}
\`\`\`
`;

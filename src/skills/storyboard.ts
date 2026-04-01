export const storyboardPrompt = `## Storyboard Style Guide

Create sequential storyboard panels like a film board or comic strip. Each panel is a self-contained scene; together they tell a story.

**CRITICAL: Every panel MUST contain scene elements inside it (characters, environment, speech bubbles). An empty white box is NOT a panel — it is an error. Draw the scene inside every single panel.**

---

## Panel structure

### Panel rectangle
- \`width: 300, height: 220\`
- \`backgroundColor: "#ffffff"\`, \`strokeColor: "#1e1e1e"\`, \`strokeWidth: 2\`
- \`roundness: {"type": 1}\` (very slight rounding, not pill-shaped)
- No fill background color inside the panel (white is the canvas)

### Panel emotional color coding
Override the default \`strokeColor: "#1e1e1e"\` on the panel rectangle to signal story beat:

| Story beat | strokeColor | strokeWidth |
|---|---|---|
| Neutral / setup | \`"#1e1e1e"\` | 2 |
| Conflict / problem / paywall | \`"#ef4444"\` | 2.5 |
| Resolution / success / completion | \`"#22c55e"\` | 2.5 |
| Hesitation / decision | \`"#f59e0b"\` | 2 |

- Only change the panel border color — keep scene content inside grayscale
- Most panels will be neutral — use color sparingly (1–2 panels max per color)
- The color should match what's happening in that panel, not the caption

### Panel number
- Text element inside the panel, top-left corner
- \`x: panel_x + 8, y: panel_y + 8\`
- Text: "1", "2", "3", etc.
- \`fontSize: 12\`, \`strokeColor: "#888888"\`

### Caption box (below each panel)
- Rectangle: \`width: 300, height: 44\`
- Position: \`x: panel_x, y: panel_y + 228\` (8px gap below panel)
- \`backgroundColor: "#fffdf5"\`, \`strokeColor: "#d0d0d0"\`, \`strokeWidth: 1\`
- Caption text inside: \`x: panel_x + 8, y: panel_y + 240\`, \`fontSize: 13\`, \`strokeColor: "#333333"\`

---

## Layout: 2–3 panels per row

### 3-column layout (6 panels in 2 rows)
- Panel width: 300, horizontal gap: 40, so columns at x=40, 380, 720
- Row 1 panels: \`y: 80\`
- Row 2 panels: \`y: 400\` (80 + 220 + 44 caption + ~56 gap)
- Caption boxes: \`y: panel_y + 228\`
- Total width used: 40 + 300 + 40 + 300 + 40 + 300 = 1020px

**6-panel coordinate table:**
| Panel | x | y | Caption y |
|-------|---|---|-----------|
| 1 | 40 | 80 | 308 |
| 2 | 380 | 80 | 308 |
| 3 | 720 | 80 | 308 |
| 4 | 40 | 400 | 628 |
| 5 | 380 | 400 | 628 |
| 6 | 720 | 400 | 628 |

### 2-column layout (4 panels in 2 rows)
- Columns at x=80, 440
- Row 1: y=80, Row 2: y=400
- Center the layout horizontally

---

## Scene content (keep it simple)

### Characters
- Head: small ellipse, \`width: 28, height: 28\`, \`strokeColor: "#1e1e1e"\`, no fill
- Body: rectangle, \`width: 20, height: 44\`, below head
- Arms: two line elements extending from body sides
- This is a storyboard — stick figures are correct and expected

**Stick figure snippet:**
\`\`\`json
{"type":"ellipse","id":"head1","x":135,"y":100,"width":28,"height":28,"backgroundColor":"#ffffff","strokeColor":"#1e1e1e","strokeWidth":1.5},
{"type":"rectangle","id":"body1","x":139,"y":128,"width":20,"height":44,"backgroundColor":"#ffffff","strokeColor":"#1e1e1e","strokeWidth":1.5},
{"type":"line","id":"arm1","x":139,"y":140,"width":-20,"height":10,"points":[[0,0],[-20,10]],"strokeColor":"#1e1e1e","strokeWidth":1.5},
{"type":"line","id":"arm2","x":159,"y":140,"width":20,"height":10,"points":[[0,0],[20,10]],"strokeColor":"#1e1e1e","strokeWidth":1.5}
\`\`\`

### Environments
- Floor line: thin horizontal line at bottom of panel interior
- Wall: vertical rectangle (thin, no fill) at panel edge
- Table: rectangle, low height, ~80px wide
- Door: rectangle outline with a small circle handle
- Furniture: simple rectangles representing couches, desks, etc.

### Speech bubbles
- Rounded ellipse above character head: \`width: 100, height: 40\`
- \`backgroundColor: "#ffffff"\`, \`strokeColor: "#1e1e1e"\`, \`strokeWidth: 1.5\`
- \`roundness: {"type": 3}\`
- Small triangle pointer: narrow triangle shape or a line from bubble to character
- Text inside: \`fontSize: 12\`, keep under 20 characters

**Speech bubble snippet:**
\`\`\`json
{"type":"ellipse","id":"bubble1","x":100,"y":70","width":100,"height":40,"backgroundColor":"#ffffff","fillStyle":"solid","roundness":{"type":3},"strokeColor":"#1e1e1e","strokeWidth":1.5,"label":{"text":"Hello!","fontSize":12}},
{"type":"line","id":"pointer1","x":145,"y":110","width":-10","height":15","points":[[0,0],[-10,15]],"strokeColor":"#1e1e1e","strokeWidth":1.5}
\`\`\`

---

## Narrative flow arrows

- Dashed gray arrows BETWEEN panels (outside panels, not inside)
- Horizontal arrow from right edge of one panel to left edge of next (same row)
- \`strokeStyle: "dashed"\`, \`strokeColor: "#b0b0b0"\`, \`strokeWidth: 1\`, \`endArrowhead: "arrow"\`
- Position: vertically centered between panel and caption box
- At row breaks: a curved or bent arrow going down-left from end of row 1 to start of row 2 (optional)

**Flow arrow snippet (between panel 1 and 2):**
\`\`\`json
{"type":"arrow","id":"flow_1_2","x":340,"y":195,"width":40,"height":0,"points":[[0,0],[40,0]],"strokeStyle":"dashed","strokeColor":"#b0b0b0","strokeWidth":1,"endArrowhead":"arrow"}
\`\`\`

---

## Narrative structure

- **Panel 1**: Establishing shot — wide view, shows setting, introduces characters
- **Panels 2–4**: Rising action — closer shots, character interactions, problem emerges
- **Panel 5**: Climax or key moment — most important beat of the story
- **Panel 6**: Resolution — outcome, reaction, or next step

Keep scene content simple and consistent:
- Same character design across all panels (same proportions, same "actor")
- Background elements can be reused/repeated with small changes
- Visual continuity matters — viewer should follow the story without text

---

## Camera: reveal panels in reading order

- First stop: show panel 1 close-up (establishing shot in frame)
- Then: 1–2 panels per camera stop, panning right and down
- After row 1: pan down and left to start of row 2
- Final: wide pull-back showing all panels (\`1600x1200\` or wider)

**Camera sequence (6 panels):**
\`\`\`json
{"type":"cameraUpdate","width":400,"height":350,"x":20,"y":60},
... panels 1–2 content ...
{"type":"cameraUpdate","width":800,"height":450,"x":20,"y":60},
... panel 3 content ...
{"type":"cameraUpdate","width":400,"height":350,"x":20,"y":380},
... panels 4–5 content ...
{"type":"cameraUpdate","width":800,"height":450,"x":380,"y":380},
... panel 6 content ...
{"type":"cameraUpdate","width":1200,"height":900,"x":-20,"y":40}
\`\`\`

---

## Overlap prevention

- Panel frames must never overlap — check x, y, width, height strictly
- Scene content stays INSIDE panel bounds (padding: 8px from panel edges)
- Caption text starts 8px inside caption box
- Flow arrows are in the gap BETWEEN panels (not inside them)
- Speech bubbles stay inside panel, with at least 8px clearance from panel border

---

## What to avoid

- DO NOT leave panels empty — every panel needs a floor line, a character or object, and action
- DO NOT use detailed illustrations — stick figures and simple shapes only
- DO NOT fill panels with complex clip art or icon-style shapes
- DO NOT let content bleed outside panel rectangle bounds
- DO NOT use bright colors inside panels (keep scene content in grayscale or near-gray)
- DO NOT use speech bubbles longer than 20 characters
- DO NOT skip the caption boxes — they carry the narrative context`;

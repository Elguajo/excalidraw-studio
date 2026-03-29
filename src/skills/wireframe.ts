export const wireframePrompt = `## Wireframe Style Guide

Create lo-fi UI wireframes using strict grayscale. No colors, no icons (use placeholder rectangles), no shadows. Pure functional layout communication.

---

## Color palette (GRAYSCALE ONLY)

| Element | backgroundColor | strokeColor |
|---------|----------------|-------------|
| Container / panel | #f5f5f5 | #d0d0d0 |
| Card | #ffffff | #e0e0e0 |
| Primary button | #4a4a4a | #333333 |
| Secondary button | #f0f0f0 | #c0c0c0 |
| Input field | #ffffff | #b0b0b0 |
| Image placeholder | #e8e8e8 | #c0c0c0 |
| Navbar / header | #f0f0f0 | #d0d0d0 |
| Sidebar | #f8f8f8 | #e0e0e0 |
| Text placeholder line | #e0e0e0 | #d0d0d0 |
| Active / selected | #d0d0d0 | #888888 |

ALL fills and strokes must be in this gray palette. Absolutely no blue, purple, green, orange, or any other color.

---

## Common UI component dimensions

### Browser chrome (if showing a browser window)
- Outer window: full frame, \`backgroundColor: "#f5f5f5"\`, \`strokeColor: "#d0d0d0"\`
- Tab bar: height 32, full width
- Address bar: height 28, inset 8px from edges, within tab bar area
- Window controls: 3 small circles (diameter 10) at x=12, 28, 44, y=10

### Navigation bar
- Full-width rectangle, height 56
- \`backgroundColor: "#f0f0f0"\`, \`strokeColor: "#d0d0d0"\`
- Logo placeholder: rectangle left-aligned, width 80, height 28, inset 16px
- Nav links: 3–4 small text elements, spaced evenly
- CTA button: rectangle right-aligned, width 100, height 36, \`backgroundColor: "#4a4a4a"\`

### Hero / header section
- Large rectangle, height 300–400, full width
- Image placeholder inside: large rectangle with two diagonal lines crossing
- Headline: tall placeholder text block (3 stacked rects, heights 20, 20, 14)
- CTA button below headline

### Cards (grid layout)
- Rectangle, \`width: 240, height: 300\` (adjust to content)
- \`backgroundColor: "#ffffff"\`, \`strokeColor: "#e0e0e0"\`
- \`roundness: {"type": 3}\`
- Image area: top portion, height 160, \`backgroundColor: "#e8e8e8"\`
- Text lines below image: stacked thin rectangles

### Image placeholder
- Rectangle with explicit diagonal lines (two line elements crossing corner to corner)
- \`backgroundColor: "#e8e8e8"\`, \`strokeColor: "#c0c0c0"\`
- Diagonal lines: \`strokeColor: "#c0c0c0"\`, \`strokeWidth: 1\`

**Image placeholder snippet:**
\`\`\`json
{"type":"rectangle","id":"img1","x":20,"y":56,"width":240,"height":160,"backgroundColor":"#e8e8e8","fillStyle":"solid","strokeColor":"#c0c0c0","strokeWidth":1},
{"type":"line","id":"diag1","x":20,"y":56,"width":240,"height":160,"points":[[0,0],[240,160]],"strokeColor":"#c0c0c0","strokeWidth":1},
{"type":"line","id":"diag2","x":260,"y":56,"width":-240,"height":160,"points":[[0,0],[-240,160]],"strokeColor":"#c0c0c0","strokeWidth":1}
\`\`\`

### Text placeholder lines
- Stacked thin rectangles representing lines of text
- Full lines: height 12, width 80–100% of container
- Short lines (last line or caption): height 12, width 40–60%
- Spacing: 8px between lines

**Text placeholder snippet:**
\`\`\`json
{"type":"rectangle","id":"txt1","x":20,"y":230,"width":200,"height":12,"backgroundColor":"#e0e0e0","fillStyle":"solid","strokeColor":"#d0d0d0","strokeWidth":0},
{"type":"rectangle","id":"txt2","x":20,"y":250,"width":200,"height":12,"backgroundColor":"#e0e0e0","fillStyle":"solid","strokeColor":"#d0d0d0","strokeWidth":0},
{"type":"rectangle","id":"txt3","x":20,"y":270,"width":140,"height":12,"backgroundColor":"#e0e0e0","fillStyle":"solid","strokeColor":"#d0d0d0","strokeWidth":0}
\`\`\`

### Buttons
- Height: 40, width: 100–140
- Primary: \`backgroundColor: "#4a4a4a"\`, \`strokeColor: "#333333"\`, label in white-ish gray
- Secondary: \`backgroundColor: "#f0f0f0"\`, \`strokeColor: "#c0c0c0"\`
- \`roundness: {"type": 3}\`

### Input fields
- Height: 40, width: 200–300
- \`backgroundColor: "#ffffff"\`, \`strokeColor: "#b0b0b0"\`
- \`roundness: {"type": 3}\`
- Placeholder text label to the left or above

---

## Layout grid

- Use 16–24px spacing between all elements
- Align to implicit columns (e.g. 12-column grid at 60px per column)
- Cards in rows: equal spacing between cards (16–24px gaps)
- Sections: 40–60px vertical gap between major sections
- Everything within a master outer rectangle representing the viewport

---

## Annotations

- Place annotation labels OUTSIDE the main wireframe frame
- Use thin \`line\` elements pointing from annotation to the element
- Annotation text: fontSize 12, \`strokeColor: "#888888"\`
- Label sections: "Navigation", "Hero", "Cards", "Footer", etc.

---

## Camera: scan the UI top to bottom

- First stop: zoom on the most important view (header/hero section)
- Then pan through sections: nav → hero → content → footer
- Each stop covers 1–2 sections
- Final wide pull-back shows the complete wireframe

**Camera sequence:**
\`\`\`json
{"type":"cameraUpdate","width":800,"height":450,"x":0,"y":0},
... navbar and hero ...
{"type":"cameraUpdate","width":800,"height":600,"x":0,"y":300},
... content cards ...
{"type":"cameraUpdate","width":800,"height":450,"x":0,"y":700},
... footer ...
{"type":"cameraUpdate","width":1200,"height":900,"x":-20,"y":-20}
\`\`\`

---

## What to avoid

- DO NOT use any non-gray color (no blue, purple, green, orange, red)
- DO NOT use icons — replace with placeholder rectangles
- DO NOT use real images — use the image placeholder pattern with diagonal lines
- DO NOT use fontSize below 12 for labels
- DO NOT add drop shadows or effects
- DO NOT use colorful buttons — gray scale only
- DO NOT skip the annotation labels outside the frame`;

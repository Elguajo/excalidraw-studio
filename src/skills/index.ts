import { structuredPrompt } from "./structured";
import { freehandPrompt } from "./freehand";
import { sequencePrompt } from "./sequence";
import { wireframePrompt } from "./wireframe";
import { storyboardPrompt } from "./storyboard";

export interface DiagramSkill {
  id: string;
  name: string;
  tagline: string;
  prompt: string;
}

export const SKILLS: DiagramSkill[] = [
  { id: "architecture", name: "Architecture", tagline: "Layers, zones, and how components connect", prompt: structuredPrompt },
  { id: "sequence", name: "Sequence Diagram", tagline: "Who calls what, and in what order", prompt: sequencePrompt },
  { id: "wireframe", name: "Wireframe", tagline: "Lo-fi UI layouts in grayscale", prompt: wireframePrompt },
  { id: "freehand", name: "Freehand Sketch", tagline: "Loose, hand-drawn style for quick ideas", prompt: freehandPrompt },
  { id: "storyboard", name: "Storyboard", tagline: "Step-by-step flows like a comic strip", prompt: storyboardPrompt },
];

export const DEFAULT_SKILL_ID = "architecture";

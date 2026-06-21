import type { MaterialItem } from "./materials";

export interface ConstructionPhase {
  id: string;
  order: number;
  name: string;
  description: string;
  duration: string;
  materials: MaterialItem[];
  phaseCost: number;
  tasks: string[];
}

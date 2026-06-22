import type { ProjectParameters } from "./parameters";
import type { BillOfMaterials } from "./materials";
import type { ConstructionPhase } from "./phases";

export interface PlanFile {
  name: string;
  type: string;
  dataUrl: string;
}

export interface LSFProject {
  id: string;
  name: string;
  createdAt: Date;
  parameters: ProjectParameters;
  planFile?: PlanFile;
  phases: ConstructionPhase[];
  bom: BillOfMaterials;
  totalCost: number;
  totalArea: number;
}

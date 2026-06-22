import type { ProjectParameters } from "@/types/parameters";
import type { ConstructionPhase } from "@/types/phases";
import type { BillOfMaterials, MaterialCategory, MaterialItem } from "@/types/materials";
import { resetIdCounter } from "./helpers";
import { calculateWallFraming } from "./walls";
import { calculateFloorSystem } from "./floor-system";
import { calculateRoofSystem } from "./roof";
import { calculateFoundation } from "./foundation";
import { calculateInsulation } from "./insulation";
import { calculateCladding } from "./cladding";
import { calculateFasteners } from "./fasteners";
import { calculateWaterproofing } from "./waterproofing";
import { calculateOpenings } from "./openings";
import { PHASE_DEFINITIONS } from "@/lib/phases/construction-phases";

export function calculateProject(params: ProjectParameters): {
  phases: ConstructionPhase[];
  bom: BillOfMaterials;
  totalCost: number;
} {
  resetIdCounter();

  const allItems: MaterialItem[] = [
    ...calculateFoundation(params),
    ...calculateWallFraming(params),
    ...calculateFloorSystem(params),
    ...calculateRoofSystem(params),
    ...calculateInsulation(params),
    ...calculateCladding(params),
    ...calculateFasteners(params),
    ...calculateWaterproofing(params),
    ...calculateOpenings(params),
  ];

  const phases = buildPhases(allItems, params);
  const bom = buildBOM(allItems);

  return { phases, bom, totalCost: bom.totalCost };
}

function buildPhases(
  items: MaterialItem[],
  params: ProjectParameters,
): ConstructionPhase[] {
  const phases: ConstructionPhase[] = [];

  for (const def of PHASE_DEFINITIONS) {
    if (def.condition && !def.condition(params)) continue;

    const phaseItems = items.filter((item) =>
      def.materialPhases.some((mp) => item.phase.includes(mp)),
    );

    const phaseCost = phaseItems.reduce((sum, item) => sum + item.totalPrice, 0);

    phases.push({
      id: def.id,
      order: def.order,
      name: def.name,
      description: def.description,
      duration: def.duration,
      materials: phaseItems,
      phaseCost: Math.ceil(phaseCost * 100) / 100,
      tasks: def.tasks,
    });
  }

  return phases.sort((a, b) => a.order - b.order);
}

function buildBOM(items: MaterialItem[]): BillOfMaterials {
  const categories: MaterialCategory[] = [
    "steel-profiles",
    "insulation",
    "exterior-cladding",
    "interior-cladding",
    "fasteners",
    "waterproofing",
    "foundation",
    "roofing",
    "openings",
    "miscellaneous",
  ];

  const costByCategory = {} as Record<MaterialCategory, number>;
  for (const cat of categories) {
    costByCategory[cat] = items
      .filter((i) => i.category === cat)
      .reduce((sum, i) => sum + i.totalPrice, 0);
    costByCategory[cat] = Math.ceil(costByCategory[cat] * 100) / 100;
  }

  const totalCost = items.reduce((sum, i) => sum + i.totalPrice, 0);

  return {
    items,
    totalCost: Math.ceil(totalCost * 100) / 100,
    costByCategory,
  };
}

import type { ProjectParameters } from "@/types/parameters";
import type { MaterialItem } from "@/types/materials";
import { createMaterialItem, m2ToSheets } from "./helpers";

export function calculateFloorSystem(
  params: ProjectParameters,
): MaterialItem[] {
  const items: MaterialItem[] = [];
  const { totalFloorArea, numberOfFloors, perimeterLength } = params;

  if (numberOfFloors <= 1) return items;

  const upperFloors = numberOfFloors - 1;
  const floorArea = totalFloorArea * upperFloors;

  const estimatedSpan = Math.sqrt(totalFloorArea) * 0.8;
  const estimatedLength = totalFloorArea / estimatedSpan;
  const joistCount = Math.ceil((estimatedLength * 1000) / 400 + 1) * upperFloors;

  items.push(
    createMaterialItem(
      "Solive de plancher C200 (1.5mm)",
      "steel-profiles",
      "pcs",
      Math.ceil(joistCount * 1.05),
      6.5 * estimatedSpan,
      "Plancher étage",
      `C200×1.5mm galvanisé, L=${Math.ceil(estimatedSpan * 1000)}mm`,
    ),
  );

  const rimTrackLength = perimeterLength * 2 * upperFloors;
  items.push(
    createMaterialItem(
      "Rail de rive U200 (1.5mm)",
      "steel-profiles",
      "ml",
      Math.ceil(rimTrackLength * 1.05),
      5.5,
      "Plancher étage",
      "Rail périphérique pour solives",
    ),
  );

  const bridgingCount = joistCount;
  items.push(
    createMaterialItem(
      "Entretoise de solive",
      "steel-profiles",
      "pcs",
      bridgingCount,
      3.2 * 0.4,
      "Plancher étage",
      "Entretoise mi-portée entre solives",
    ),
  );

  const osbSheets = m2ToSheets(floorArea, 1250, 2500);
  items.push(
    createMaterialItem(
      "OSB 18mm plancher",
      "exterior-cladding",
      "panneau",
      osbSheets,
      24.0,
      "Plancher étage",
      "1250×2500mm, panneau structural",
    ),
  );

  return items;
}

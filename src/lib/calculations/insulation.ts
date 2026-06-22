import type { ProjectParameters } from "@/types/parameters";
import type { MaterialItem } from "@/types/materials";
import { createMaterialItem, mmToM } from "./helpers";
import { getInsulationPrice } from "@/lib/materials/catalog";

export function calculateInsulation(
  params: ProjectParameters,
): MaterialItem[] {
  const items: MaterialItem[] = [];
  const {
    perimeterLength,
    interiorWallLength,
    wallHeight,
    numberOfFloors,
    totalFloorArea,
    insulationType,
    insulationThickness,
    hasAcousticInsulation,
    windows,
    doors,
  } = params;

  const wallHeightM = mmToM(wallHeight);

  let windowArea = 0;
  for (const w of windows) {
    windowArea += w.quantity * mmToM(w.width) * mmToM(w.height);
  }
  let doorArea = 0;
  for (const d of doors) {
    doorArea += d.quantity * mmToM(d.width) * mmToM(d.height);
  }

  const extWallArea =
    perimeterLength * wallHeightM * numberOfFloors - windowArea - doorArea;
  const unitPrice = getInsulationPrice(insulationType, insulationThickness);

  const insulationNames: Record<string, string> = {
    "rock-wool": "Laine de roche",
    "glass-wool": "Laine de verre",
    eps: "Polystyrène EPS",
    xps: "Polystyrène XPS",
  };

  items.push(
    createMaterialItem(
      `${insulationNames[insulationType]} ${insulationThickness}mm (murs ext.)`,
      "insulation",
      "m²",
      Math.ceil(extWallArea * 1.03),
      unitPrice,
      "Isolation",
      `Épaisseur ${insulationThickness}mm, murs extérieurs`,
    ),
  );

  const roofInsulationArea = totalFloorArea;
  items.push(
    createMaterialItem(
      `${insulationNames[insulationType]} ${insulationThickness + 100}mm (toiture)`,
      "insulation",
      "m²",
      Math.ceil(roofInsulationArea * 1.03),
      getInsulationPrice(insulationType, insulationThickness + 100),
      "Isolation",
      `Épaisseur ${insulationThickness + 100}mm, isolation combles/toiture`,
    ),
  );

  items.push(
    createMaterialItem(
      `${insulationNames[insulationType]} ${insulationThickness}mm (sol)`,
      "insulation",
      "m²",
      Math.ceil(totalFloorArea * 1.03),
      unitPrice,
      "Isolation",
      `Épaisseur ${insulationThickness}mm, isolation plancher bas`,
    ),
  );

  if (hasAcousticInsulation) {
    const intWallArea = interiorWallLength * wallHeightM * numberOfFloors;
    items.push(
      createMaterialItem(
        "Isolation acoustique cloisons (laine 50mm)",
        "insulation",
        "m²",
        Math.ceil(intWallArea * 1.03),
        5.5,
        "Isolation",
        "Laine de roche 50mm, cloisons intérieures",
      ),
    );
  }

  return items;
}

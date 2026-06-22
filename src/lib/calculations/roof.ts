import type { ProjectParameters } from "@/types/parameters";
import type { MaterialItem } from "@/types/materials";
import { createMaterialItem, degToRad, m2ToSheets } from "./helpers";

export function calculateRoofSystem(
  params: ProjectParameters,
): MaterialItem[] {
  const items: MaterialItem[] = [];
  const {
    totalFloorArea,
    roofType,
    roofPitch,
    roofOverhang,
    perimeterLength,
  } = params;

  const overhangM = roofOverhang / 1000;
  const buildingWidth = Math.sqrt(totalFloorArea) * 0.8;
  const buildingLength = totalFloorArea / buildingWidth;

  let roofArea: number;
  switch (roofType) {
    case "flat":
      roofArea =
        (buildingLength + overhangM * 2) *
        (buildingWidth + overhangM * 2);
      break;
    case "gable":
      roofArea =
        (totalFloorArea / Math.cos(degToRad(roofPitch))) +
        perimeterLength * overhangM;
      break;
    case "hip":
      roofArea =
        (totalFloorArea / Math.cos(degToRad(roofPitch))) * 1.05 +
        perimeterLength * overhangM;
      break;
    case "mono-pitch":
      roofArea =
        (totalFloorArea / Math.cos(degToRad(roofPitch))) +
        perimeterLength * overhangM * 0.5;
      break;
  }

  const rafterSpacing = 0.6;
  const rafterLength =
    roofType === "flat"
      ? buildingWidth + overhangM * 2
      : (buildingWidth / 2 + overhangM) / Math.cos(degToRad(roofPitch));
  const rafterCount = Math.ceil(buildingLength / rafterSpacing + 1);
  const totalRafters =
    roofType === "gable" || roofType === "hip"
      ? rafterCount * 2
      : rafterCount;

  items.push(
    createMaterialItem(
      "Chevron C150 toiture (1.2mm)",
      "steel-profiles",
      "pcs",
      Math.ceil(totalRafters * 1.05),
      4.1 * rafterLength,
      "Charpente toiture",
      `C150×1.2mm galvanisé, L=${Math.ceil(rafterLength * 1000)}mm`,
    ),
  );

  if (roofType === "gable" || roofType === "hip") {
    items.push(
      createMaterialItem(
        "Poutre faîtière U200",
        "steel-profiles",
        "ml",
        Math.ceil(buildingLength * 1.05),
        7.2,
        "Charpente toiture",
        "Rail faîtier, U200×2.0mm",
      ),
    );
  }

  if (roofType === "hip") {
    items.push(
      createMaterialItem(
        "Arêtier C150",
        "steel-profiles",
        "pcs",
        4,
        4.1 * rafterLength * 1.4,
        "Charpente toiture",
        "C150×1.2mm pour arêtes de toiture",
      ),
    );
  }

  const battenSpacing = 0.35;
  const battenRows = Math.ceil(rafterLength / battenSpacing);
  const totalBattenLength = battenRows * buildingLength * (roofType === "gable" || roofType === "hip" ? 2 : 1);
  items.push(
    createMaterialItem(
      "Liteau de toiture acier",
      "roofing",
      "ml",
      Math.ceil(totalBattenLength * 1.05),
      3.2,
      "Couverture toiture",
      "Support pour tôle de couverture",
    ),
  );

  const osbSheets = m2ToSheets(roofArea, 1250, 2500, 1.1);
  items.push(
    createMaterialItem(
      "OSB 12mm toiture",
      "roofing",
      "panneau",
      osbSheets,
      18.5,
      "Couverture toiture",
      "Volige 1250×2500mm",
    ),
  );

  items.push(
    createMaterialItem(
      "Tôle de toiture métallique",
      "roofing",
      "m²",
      Math.ceil(roofArea * 1.1),
      14.0,
      "Couverture toiture",
      "Tôle bac acier prélaqué",
    ),
  );

  items.push(
    createMaterialItem(
      "Membrane d'étanchéité sous-toiture",
      "waterproofing",
      "m²",
      Math.ceil(roofArea * 1.1),
      3.5,
      "Couverture toiture",
      "Écran sous-toiture HPV",
    ),
  );

  if (roofType !== "flat") {
    const ridgeLength = buildingLength;
    items.push(
      createMaterialItem(
        "Faîtière",
        "roofing",
        "ml",
        Math.ceil(ridgeLength * 1.1),
        8.5,
        "Couverture toiture",
        "Faîtière métallique",
      ),
    );
  }

  const fasciaLength = perimeterLength;
  items.push(
    createMaterialItem(
      "Bandeau de rive",
      "roofing",
      "ml",
      Math.ceil(fasciaLength * 1.05),
      6.5,
      "Couverture toiture",
      "Habillage en rive de toiture",
    ),
  );

  items.push(
    createMaterialItem(
      "Gouttière aluminium",
      "roofing",
      "ml",
      Math.ceil(perimeterLength * 0.6),
      12.0,
      "Couverture toiture",
      "Gouttière demi-ronde",
    ),
  );

  const downpipeCount = Math.ceil(perimeterLength / 12);
  items.push(
    createMaterialItem(
      "Descente de gouttière",
      "roofing",
      "pcs",
      downpipeCount,
      25.0,
      "Couverture toiture",
      "Descente Ø80mm",
    ),
  );

  return items;
}

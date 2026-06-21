import type { ProjectParameters } from "@/types/parameters";
import type { MaterialItem } from "@/types/materials";
import { createMaterialItem, mmToM } from "./helpers";

export function calculateWaterproofing(
  params: ProjectParameters,
): MaterialItem[] {
  const items: MaterialItem[] = [];
  const {
    perimeterLength,
    wallHeight,
    numberOfFloors,
    totalFloorArea,
    hasVaporBarrier,
    hasWaterproofingMembrane,
    windows,
    doors,
  } = params;

  const wallHeightM = mmToM(wallHeight);

  let openingArea = 0;
  for (const w of windows) {
    openingArea += w.quantity * mmToM(w.width) * mmToM(w.height);
  }
  for (const d of doors) {
    openingArea += d.quantity * mmToM(d.width) * mmToM(d.height);
  }

  const extWallArea =
    perimeterLength * wallHeightM * numberOfFloors - openingArea;

  if (hasVaporBarrier) {
    const vaporArea = extWallArea + totalFloorArea;
    items.push(
      createMaterialItem(
        "Pare-vapeur PE",
        "waterproofing",
        "m²",
        Math.ceil(vaporArea * 1.1),
        1.2,
        "Isolation",
        "Film polyéthylène, face intérieure des murs ext. + plafond",
      ),
    );
  }

  if (hasWaterproofingMembrane) {
    items.push(
      createMaterialItem(
        "Membrane pare-pluie",
        "waterproofing",
        "m²",
        Math.ceil(extWallArea * 1.1),
        3.5,
        "Enveloppe extérieure",
        "Membrane HPV, face extérieure de l'ossature",
      ),
    );
  }

  let flashingPerimeter = 0;
  for (const w of windows) {
    flashingPerimeter +=
      w.quantity * 2 * (mmToM(w.width) + mmToM(w.height));
  }
  for (const d of doors) {
    flashingPerimeter +=
      d.quantity * 2 * (mmToM(d.width) + mmToM(d.height));
  }
  const flashingRolls = Math.ceil(flashingPerimeter / 25);

  if (flashingRolls > 0) {
    items.push(
      createMaterialItem(
        "Bande d'étanchéité autocollante",
        "waterproofing",
        "rouleau",
        flashingRolls,
        18.0,
        "Enveloppe extérieure",
        "100mm × 25m, étanchéité autour des menuiseries",
      ),
    );
  }

  return items;
}

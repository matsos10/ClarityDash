import type { ProjectParameters } from "@/types/parameters";
import type { MaterialItem } from "@/types/materials";
import { getStudPrice, getTrackPrice } from "@/lib/materials/steel-profiles";
import { createMaterialItem, mmToM } from "./helpers";

export function calculateWallFraming(
  params: ProjectParameters,
): MaterialItem[] {
  const items: MaterialItem[] = [];
  const {
    perimeterLength,
    interiorWallLength,
    wallHeight,
    studSpacing,
    studProfile,
    steelThickness,
    numberOfFloors,
    windows,
    doors,
  } = params;

  const studPrice = getStudPrice(studProfile, steelThickness);
  const trackPrice = getTrackPrice(studProfile, steelThickness);
  const wallHeightM = mmToM(wallHeight);

  const totalExtWallLength = perimeterLength * numberOfFloors;
  const totalIntWallLength = interiorWallLength * numberOfFloors;

  const extStudCount =
    Math.ceil((perimeterLength * 1000) / studSpacing + 1) * numberOfFloors;
  const intStudCount =
    Math.ceil((interiorWallLength * 1000) / studSpacing + 1) * numberOfFloors;

  let extraStudsForOpenings = 0;
  const totalWindows = windows.reduce((sum, w) => sum + w.quantity, 0);
  const totalDoors = doors.reduce((sum, d) => sum + d.quantity, 0);
  extraStudsForOpenings += totalWindows * 4 * numberOfFloors;
  extraStudsForOpenings += totalDoors * 4 * numberOfFloors;

  const totalStuds = Math.ceil(
    (extStudCount + intStudCount + extraStudsForOpenings) * 1.05,
  );

  items.push(
    createMaterialItem(
      `Montant ${studProfile} (${steelThickness}mm)`,
      "steel-profiles",
      "pcs",
      totalStuds,
      studPrice * wallHeightM,
      "Ossature murale",
      `${studProfile}×${steelThickness}mm galvanisé, L=${wallHeight}mm`,
    ),
  );

  const totalTrackLength = (totalExtWallLength + totalIntWallLength) * 2;
  items.push(
    createMaterialItem(
      `Rail U${studProfile.slice(1)} (${steelThickness}mm)`,
      "steel-profiles",
      "ml",
      Math.ceil(totalTrackLength * 1.05),
      trackPrice,
      "Ossature murale",
      `Rail haut et bas, ${steelThickness}mm galvanisé`,
    ),
  );

  let headerTrackLength = 0;
  for (const w of windows) {
    headerTrackLength += w.quantity * (mmToM(w.width) + 0.3) * 2;
  }
  for (const d of doors) {
    headerTrackLength += d.quantity * (mmToM(d.width) + 0.3) * 2;
  }
  headerTrackLength *= numberOfFloors;

  if (headerTrackLength > 0) {
    items.push(
      createMaterialItem(
        `Linteau (rail ${studProfile.replace("C", "U")})`,
        "steel-profiles",
        "ml",
        Math.ceil(headerTrackLength * 1.05),
        trackPrice * 1.1,
        "Ossature murale",
        `Double rail pour linteaux au-dessus des ouvertures`,
      ),
    );
  }

  const noggingRows = Math.floor(wallHeight / 1200);
  const noggingLength =
    (totalExtWallLength + totalIntWallLength) * noggingRows;
  items.push(
    createMaterialItem(
      `Entretoises ${studProfile}`,
      "steel-profiles",
      "ml",
      Math.ceil(noggingLength * 1.05),
      studPrice * 0.8,
      "Ossature murale",
      `Entretoises horizontales entre montants`,
    ),
  );

  const bracingPanels = Math.ceil(perimeterLength / 4) * numberOfFloors;
  const bracingLength = bracingPanels * Math.sqrt(wallHeightM ** 2 + 1.2 ** 2);
  const bracingRolls = Math.ceil(bracingLength / 50);
  items.push(
    createMaterialItem(
      "Feuillard de contreventement",
      "fasteners",
      "rouleau",
      bracingRolls,
      35.0,
      "Ossature murale",
      "40×1.0mm, rouleau 50m",
    ),
  );

  return items;
}

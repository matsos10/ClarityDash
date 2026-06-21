import type { ProjectParameters } from "@/types/parameters";
import type { MaterialItem } from "@/types/materials";
import { createMaterialItem, mmToM } from "./helpers";

export function calculateFasteners(
  params: ProjectParameters,
): MaterialItem[] {
  const items: MaterialItem[] = [];
  const {
    perimeterLength,
    interiorWallLength,
    wallHeight,
    numberOfFloors,
    studSpacing,
    totalFloorArea,
    interiorCladding,
    windows,
    doors,
  } = params;

  const wallHeightM = mmToM(wallHeight);
  const totalWallLength = (perimeterLength + interiorWallLength) * numberOfFloors;
  const totalStuds = Math.ceil((totalWallLength * 1000) / studSpacing + 1);

  const steelScrews = totalStuds * 8;
  const steelScrewBoxes = Math.ceil((steelScrews * 1.1) / 1000);
  items.push(
    createMaterialItem(
      "Vis auto-perceuses 4.2×13",
      "fasteners",
      "boîte (1000)",
      steelScrewBoxes,
      28.0,
      "Ossature murale",
      "Acier-acier, tête hexagonale",
    ),
  );

  items.push(
    createMaterialItem(
      "Vis auto-perceuses 4.2×25",
      "fasteners",
      "boîte (1000)",
      Math.ceil(steelScrewBoxes * 0.5),
      32.0,
      "Ossature murale",
      "Acier-acier, assemblages renforcés",
    ),
  );

  const intWallBothSides = interiorWallLength * wallHeightM * numberOfFloors * 2;
  const extWallInteriorFace = perimeterLength * wallHeightM * numberOfFloors;
  const ceilingArea = totalFloorArea;
  const totalPlasterArea = intWallBothSides + extWallInteriorFace + ceilingArea;
  const layers = interiorCladding === "plasterboard-double" ? 2 : 1;
  const plasterScrews = totalPlasterArea * 25 * layers;
  const plasterScrewBoxes = Math.ceil((plasterScrews * 1.1) / 1000);

  if (interiorCladding !== "osb") {
    items.push(
      createMaterialItem(
        "Vis plaque de plâtre 3.5×35",
        "fasteners",
        "boîte (1000)",
        plasterScrewBoxes,
        12.0,
        "Finitions intérieures",
        "Vis phosphatées, filetage fin",
      ),
    );
  }

  const totalOpenings =
    windows.reduce((s, w) => s + w.quantity, 0) +
    doors.reduce((s, d) => s + d.quantity, 0);
  const holdDowns =
    Math.ceil(perimeterLength / 3) * 2 * numberOfFloors +
    totalOpenings * 2;
  items.push(
    createMaterialItem(
      "Équerre de maintien",
      "fasteners",
      "pcs",
      holdDowns,
      8.5,
      "Ossature murale",
      "Fixation haute résistance",
    ),
  );

  const angleBrackets = totalStuds;
  items.push(
    createMaterialItem(
      "Équerre d'assemblage 90×90×65",
      "fasteners",
      "pcs",
      Math.ceil(angleBrackets * 0.3),
      2.8,
      "Ossature murale",
      "Connexion montant-rail",
    ),
  );

  return items;
}

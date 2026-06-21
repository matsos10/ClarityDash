import type { ProjectParameters } from "@/types/parameters";
import type { MaterialItem } from "@/types/materials";
import { createMaterialItem, mmToM, m2ToSheets } from "./helpers";
import { getExteriorCladdingPrice } from "@/lib/materials/catalog";

export function calculateCladding(
  params: ProjectParameters,
): MaterialItem[] {
  const items: MaterialItem[] = [];
  const {
    perimeterLength,
    interiorWallLength,
    wallHeight,
    numberOfFloors,
    totalFloorArea,
    exteriorCladding,
    interiorCladding,
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

  const osbExtSheets = m2ToSheets(extWallArea, 1250, 2500);
  items.push(
    createMaterialItem(
      "OSB 12mm contreventement extérieur",
      "exterior-cladding",
      "panneau",
      osbExtSheets,
      18.5,
      "Enveloppe extérieure",
      "1250×2500mm, voile travaillant",
    ),
  );

  const claddingNames: Record<string, string> = {
    "fiber-cement": "Panneau fibro-ciment",
    "metal-panel": "Bardage métallique",
    etics: "Système ETICS (enduit sur isolant)",
    "brick-veneer": "Briquette de parement",
  };

  const claddingPrice = getExteriorCladdingPrice(exteriorCladding);
  if (exteriorCladding === "fiber-cement") {
    const sheets = m2ToSheets(extWallArea, 1200, 2400);
    items.push(
      createMaterialItem(
        claddingNames[exteriorCladding],
        "exterior-cladding",
        "panneau",
        sheets,
        22.0,
        "Enveloppe extérieure",
        "1200×2400mm, 8mm épaisseur",
      ),
    );
  } else {
    items.push(
      createMaterialItem(
        claddingNames[exteriorCladding],
        "exterior-cladding",
        "m²",
        Math.ceil(extWallArea * 1.08),
        claddingPrice,
        "Enveloppe extérieure",
      ),
    );
  }

  const intWallBothSides = interiorWallLength * wallHeightM * numberOfFloors * 2;
  const extWallInteriorFace = extWallArea;
  const ceilingArea = totalFloorArea;
  const totalInteriorArea = intWallBothSides + extWallInteriorFace + ceilingArea;

  const claddingInternalNames: Record<string, string> = {
    "plasterboard-single": "Plaque de plâtre BA13 (simple)",
    "plasterboard-double": "Plaque de plâtre BA13 (double)",
    osb: "OSB intérieur 12mm",
  };

  const layers = interiorCladding === "plasterboard-double" ? 2 : 1;
  const sheets = m2ToSheets(totalInteriorArea * layers, 1200, 2600);

  items.push(
    createMaterialItem(
      claddingInternalNames[interiorCladding],
      "interior-cladding",
      "plaque",
      sheets,
      interiorCladding === "osb" ? 18.5 : 5.8,
      "Finitions intérieures",
      interiorCladding === "osb"
        ? "1250×2500mm"
        : `1200×2600mm${layers === 2 ? " × 2 couches" : ""}`,
    ),
  );

  if (interiorCladding !== "osb") {
    const jointLength = totalInteriorArea * 1.5;
    const tapeRolls = Math.ceil(jointLength / 75);
    items.push(
      createMaterialItem(
        "Bande à joint",
        "interior-cladding",
        "rouleau",
        tapeRolls,
        4.5,
        "Finitions intérieures",
        "Rouleau 75m",
      ),
    );

    const compoundBags = Math.ceil((totalInteriorArea * 0.4 * layers) / 25);
    items.push(
      createMaterialItem(
        "Enduit à joint",
        "interior-cladding",
        "sac",
        compoundBags,
        12.0,
        "Finitions intérieures",
        "Sac 25kg",
      ),
    );

    const corners = Math.ceil(perimeterLength * 0.3 * numberOfFloors);
    const cornerBeadLength = corners * wallHeightM;
    items.push(
      createMaterialItem(
        "Baguette d'angle",
        "interior-cladding",
        "ml",
        Math.ceil(cornerBeadLength * 1.05),
        1.5,
        "Finitions intérieures",
        "Protection d'angle en acier galvanisé",
      ),
    );
  }

  return items;
}

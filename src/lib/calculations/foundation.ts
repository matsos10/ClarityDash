import type { ProjectParameters } from "@/types/parameters";
import type { MaterialItem } from "@/types/materials";
import { createMaterialItem } from "./helpers";

export function calculateFoundation(
  params: ProjectParameters,
): MaterialItem[] {
  const items: MaterialItem[] = [];
  const { totalFloorArea, perimeterLength, foundationType } = params;

  switch (foundationType) {
    case "slab-on-grade": {
      const slabThickness = 0.15;
      const concreteVolume = totalFloorArea * slabThickness;
      items.push(
        createMaterialItem(
          "Béton C25/30 (dalle)",
          "foundation",
          "m³",
          Math.ceil(concreteVolume * 1.05),
          95.0,
          "Fondation",
          "Dalle sur sol, épaisseur 150mm",
        ),
      );

      items.push(
        createMaterialItem(
          "Treillis soudé ST25",
          "foundation",
          "m²",
          Math.ceil(totalFloorArea * 1.1),
          6.5,
          "Fondation",
          "150×150×6mm, panneau 2.4×6m",
        ),
      );

      items.push(
        createMaterialItem(
          "Film polyéthylène (DPM)",
          "foundation",
          "m²",
          Math.ceil(totalFloorArea * 1.15),
          2.8,
          "Fondation",
          "Anti-remontées d'humidité, 200µm",
        ),
      );

      const gravelVolume = totalFloorArea * 0.2;
      items.push(
        createMaterialItem(
          "Gravier tout-venant",
          "foundation",
          "m³",
          Math.ceil(gravelVolume * 1.05),
          28.0,
          "Fondation",
          "Sous-couche compactée, ép. 200mm",
        ),
      );

      const perimeterInsulation = perimeterLength * 0.6;
      items.push(
        createMaterialItem(
          "Isolant périphérique XPS",
          "foundation",
          "m²",
          Math.ceil(perimeterInsulation * 1.05),
          12.0,
          "Fondation",
          "XPS 50mm en rive de dalle",
        ),
      );
      break;
    }
    case "strip-foundation": {
      const stripWidth = 0.5;
      const stripDepth = 0.8;
      const concreteVolume = perimeterLength * stripWidth * stripDepth;
      items.push(
        createMaterialItem(
          "Béton C25/30 (semelles)",
          "foundation",
          "m³",
          Math.ceil(concreteVolume * 1.05),
          95.0,
          "Fondation",
          `Semelles filantes ${stripWidth * 100}×${stripDepth * 100}cm`,
        ),
      );

      const formworkArea = perimeterLength * stripDepth * 2;
      items.push(
        createMaterialItem(
          "Coffrage fondation",
          "foundation",
          "m²",
          Math.ceil(formworkArea),
          15.0,
          "Fondation",
          "Coffrage bois réutilisable",
        ),
      );

      const rebarLength = perimeterLength * 4;
      items.push(
        createMaterialItem(
          "Armature HA12",
          "foundation",
          "ml",
          Math.ceil(rebarLength * 1.1),
          2.5,
          "Fondation",
          "4 barres HA12 filantes + cadres",
        ),
      );
      break;
    }
    case "pile-foundation": {
      const pileCount = Math.ceil(perimeterLength / 3) + 4;
      items.push(
        createMaterialItem(
          "Pieux forés Ø300",
          "foundation",
          "pcs",
          pileCount,
          180.0,
          "Fondation",
          "Pieu béton Ø300mm, prof. 3-6m",
        ),
      );

      const beamLength = perimeterLength * 1.3;
      const beamConcrete = beamLength * 0.3 * 0.4;
      items.push(
        createMaterialItem(
          "Béton C30/37 (longrines)",
          "foundation",
          "m³",
          Math.ceil(beamConcrete * 1.05),
          105.0,
          "Fondation",
          "Longrines 30×40cm sur pieux",
        ),
      );
      break;
    }
  }

  const anchorBolts = Math.ceil(perimeterLength / 0.6);
  items.push(
    createMaterialItem(
      "Boulon d'ancrage M12×160",
      "foundation",
      "pcs",
      anchorBolts,
      3.2,
      "Fondation",
      "Fixation lisse basse tous les 600mm",
    ),
  );

  return items;
}

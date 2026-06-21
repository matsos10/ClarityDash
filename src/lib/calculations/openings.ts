import type { ProjectParameters } from "@/types/parameters";
import type { MaterialItem } from "@/types/materials";
import { createMaterialItem } from "./helpers";

export function calculateOpenings(
  params: ProjectParameters,
): MaterialItem[] {
  const items: MaterialItem[] = [];
  const { windows, doors, numberOfFloors } = params;

  for (const w of windows) {
    const qty = w.quantity * numberOfFloors;
    const priceEstimate = 180 + (w.width * w.height) / 10000;
    items.push(
      createMaterialItem(
        `Fenêtre ${w.width}×${w.height}mm`,
        "openings",
        "pcs",
        qty,
        Math.ceil(priceEstimate),
        "Enveloppe extérieure",
        `Double vitrage, PVC, ${w.width}×${w.height}mm`,
      ),
    );
  }

  for (const d of doors) {
    const qty = d.quantity * (d.isExterior ? 1 : numberOfFloors);
    items.push(
      createMaterialItem(
        d.isExterior
          ? `Porte d'entrée ${d.width}×${d.height}mm`
          : `Porte intérieure ${d.width}×${d.height}mm`,
        "openings",
        "pcs",
        qty,
        d.isExterior ? 450 : 150,
        d.isExterior ? "Enveloppe extérieure" : "Finitions intérieures",
        d.isExterior
          ? `Porte sécurisée, ${d.width}×${d.height}mm`
          : `Porte alvéolaire, ${d.width}×${d.height}mm`,
      ),
    );
  }

  return items;
}

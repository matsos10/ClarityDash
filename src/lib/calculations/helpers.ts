import type { MaterialItem, MaterialCategory } from "@/types/materials";

let idCounter = 0;

export function createMaterialItem(
  name: string,
  category: MaterialCategory,
  unit: string,
  quantity: number,
  unitPrice: number,
  phase: string,
  specifications?: string,
): MaterialItem {
  idCounter++;
  return {
    id: `mat-${idCounter}-${Date.now()}`,
    name,
    category,
    unit,
    quantity: Math.ceil(quantity * 100) / 100,
    unitPrice,
    totalPrice: Math.ceil(quantity * unitPrice * 100) / 100,
    specifications,
    phase,
  };
}

export function resetIdCounter() {
  idCounter = 0;
}

export function mmToM(mm: number): number {
  return mm / 1000;
}

export function m2ToSheets(
  areaM2: number,
  sheetW_mm: number,
  sheetH_mm: number,
  wasteFactor: number = 1.08,
): number {
  const sheetArea = (sheetW_mm / 1000) * (sheetH_mm / 1000);
  return Math.ceil((areaM2 * wasteFactor) / sheetArea);
}

export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export type MaterialCategory =
  | "steel-profiles"
  | "insulation"
  | "exterior-cladding"
  | "interior-cladding"
  | "fasteners"
  | "waterproofing"
  | "foundation"
  | "roofing"
  | "openings"
  | "miscellaneous";

export interface MaterialItem {
  id: string;
  name: string;
  category: MaterialCategory;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specifications?: string;
  phase: string;
}

export interface BillOfMaterials {
  items: MaterialItem[];
  totalCost: number;
  costByCategory: Record<MaterialCategory, number>;
}

export const CATEGORY_LABELS: Record<MaterialCategory, string> = {
  "steel-profiles": "Profilés Acier",
  insulation: "Isolation",
  "exterior-cladding": "Revêtement Extérieur",
  "interior-cladding": "Revêtement Intérieur",
  fasteners: "Fixations & Quincaillerie",
  waterproofing: "Étanchéité",
  foundation: "Fondation",
  roofing: "Toiture",
  openings: "Menuiseries",
  miscellaneous: "Divers",
};

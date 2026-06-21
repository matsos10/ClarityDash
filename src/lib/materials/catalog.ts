import type { MaterialCategory } from "@/types/materials";

export interface CatalogItem {
  id: string;
  name: string;
  category: MaterialCategory;
  unit: string;
  unitPrice: number;
  specifications?: string;
}

export const MATERIAL_CATALOG: Record<string, CatalogItem> = {
  "rockwool-50": {
    id: "rockwool-50",
    name: "Laine de roche 50mm",
    category: "insulation",
    unit: "m²",
    unitPrice: 5.5,
  },
  "rockwool-100": {
    id: "rockwool-100",
    name: "Laine de roche 100mm",
    category: "insulation",
    unit: "m²",
    unitPrice: 9.8,
  },
  "rockwool-150": {
    id: "rockwool-150",
    name: "Laine de roche 150mm",
    category: "insulation",
    unit: "m²",
    unitPrice: 14.2,
  },
  "rockwool-200": {
    id: "rockwool-200",
    name: "Laine de roche 200mm",
    category: "insulation",
    unit: "m²",
    unitPrice: 18.5,
  },
  "glasswool-100": {
    id: "glasswool-100",
    name: "Laine de verre 100mm",
    category: "insulation",
    unit: "m²",
    unitPrice: 7.2,
  },
  "eps-100": {
    id: "eps-100",
    name: "Polystyrène expansé EPS 100mm",
    category: "insulation",
    unit: "m²",
    unitPrice: 8.5,
  },
  "xps-100": {
    id: "xps-100",
    name: "Polystyrène extrudé XPS 100mm",
    category: "insulation",
    unit: "m²",
    unitPrice: 12.0,
  },
  "osb-12": {
    id: "osb-12",
    name: "Panneau OSB 12mm (1250×2500)",
    category: "exterior-cladding",
    unit: "panneau",
    unitPrice: 18.5,
    specifications: "1250×2500mm",
  },
  "osb-18": {
    id: "osb-18",
    name: "Panneau OSB 18mm (1250×2500)",
    category: "exterior-cladding",
    unit: "panneau",
    unitPrice: 24.0,
    specifications: "1250×2500mm",
  },
  "plasterboard-12": {
    id: "plasterboard-12",
    name: "Plaque de plâtre BA13 (1200×2600)",
    category: "interior-cladding",
    unit: "plaque",
    unitPrice: 5.8,
    specifications: "1200×2600mm, 12.5mm",
  },
  "plasterboard-15": {
    id: "plasterboard-15",
    name: "Plaque de plâtre BA15 (1200×2600)",
    category: "interior-cladding",
    unit: "plaque",
    unitPrice: 7.2,
    specifications: "1200×2600mm, 15mm",
  },
  "fiber-cement-board": {
    id: "fiber-cement-board",
    name: "Panneau fibro-ciment 8mm (1200×2400)",
    category: "exterior-cladding",
    unit: "panneau",
    unitPrice: 22.0,
    specifications: "1200×2400mm",
  },
  "metal-panel": {
    id: "metal-panel",
    name: "Bardage métallique",
    category: "exterior-cladding",
    unit: "m²",
    unitPrice: 28.0,
  },
  "etics-system": {
    id: "etics-system",
    name: "Système ETICS (EPS + enduit)",
    category: "exterior-cladding",
    unit: "m²",
    unitPrice: 45.0,
  },
  "brick-veneer": {
    id: "brick-veneer",
    name: "Briquette de parement",
    category: "exterior-cladding",
    unit: "m²",
    unitPrice: 55.0,
  },
  "vapor-barrier": {
    id: "vapor-barrier",
    name: "Pare-vapeur PE",
    category: "waterproofing",
    unit: "m²",
    unitPrice: 1.2,
  },
  "waterproofing-membrane": {
    id: "waterproofing-membrane",
    name: "Membrane d'étanchéité",
    category: "waterproofing",
    unit: "m²",
    unitPrice: 3.5,
  },
  "screws-steel-13": {
    id: "screws-steel-13",
    name: "Vis auto-perceuses 4.2×13 (boîte 1000)",
    category: "fasteners",
    unit: "boîte",
    unitPrice: 28.0,
  },
  "screws-steel-25": {
    id: "screws-steel-25",
    name: "Vis auto-perceuses 4.2×25 (boîte 1000)",
    category: "fasteners",
    unit: "boîte",
    unitPrice: 32.0,
  },
  "screws-plasterboard": {
    id: "screws-plasterboard",
    name: "Vis plaque de plâtre 3.5×35 (boîte 1000)",
    category: "fasteners",
    unit: "boîte",
    unitPrice: 12.0,
  },
  "hold-down-bracket": {
    id: "hold-down-bracket",
    name: "Équerre de maintien",
    category: "fasteners",
    unit: "pcs",
    unitPrice: 8.5,
  },
  "angle-bracket": {
    id: "angle-bracket",
    name: "Équerre d'assemblage 90×90×65",
    category: "fasteners",
    unit: "pcs",
    unitPrice: 2.8,
  },
  "strap-bracing": {
    id: "strap-bracing",
    name: "Feuillard de contreventement 40×1.0mm (rouleau 50m)",
    category: "fasteners",
    unit: "rouleau",
    unitPrice: 35.0,
  },
  "joint-tape": {
    id: "joint-tape",
    name: "Bande à joint (rouleau 75m)",
    category: "interior-cladding",
    unit: "rouleau",
    unitPrice: 4.5,
  },
  "joint-compound": {
    id: "joint-compound",
    name: "Enduit à joint (sac 25kg)",
    category: "interior-cladding",
    unit: "sac",
    unitPrice: 12.0,
  },
  concrete: {
    id: "concrete",
    name: "Béton C25/30 (prêt à l'emploi)",
    category: "foundation",
    unit: "m³",
    unitPrice: 95.0,
  },
  "rebar-mesh": {
    id: "rebar-mesh",
    name: "Treillis soudé 150×150×6mm",
    category: "foundation",
    unit: "m²",
    unitPrice: 6.5,
  },
  "metal-roofing": {
    id: "metal-roofing",
    name: "Tôle de toiture métallique",
    category: "roofing",
    unit: "m²",
    unitPrice: 14.0,
  },
  "ridge-cap": {
    id: "ridge-cap",
    name: "Faîtière",
    category: "roofing",
    unit: "ml",
    unitPrice: 8.5,
  },
  "anchor-bolt": {
    id: "anchor-bolt",
    name: "Boulon d'ancrage M12×160",
    category: "foundation",
    unit: "pcs",
    unitPrice: 3.2,
  },
  "window-standard": {
    id: "window-standard",
    name: "Fenêtre standard",
    category: "openings",
    unit: "pcs",
    unitPrice: 280.0,
  },
  "door-interior": {
    id: "door-interior",
    name: "Porte intérieure standard",
    category: "openings",
    unit: "pcs",
    unitPrice: 150.0,
  },
  "door-exterior": {
    id: "door-exterior",
    name: "Porte d'entrée",
    category: "openings",
    unit: "pcs",
    unitPrice: 450.0,
  },
  "flashing-tape": {
    id: "flashing-tape",
    name: "Bande d'étanchéité 100mm (rouleau 25m)",
    category: "waterproofing",
    unit: "rouleau",
    unitPrice: 18.0,
  },
  "dpm-membrane": {
    id: "dpm-membrane",
    name: "Film polyéthylène anti-humidité",
    category: "foundation",
    unit: "m²",
    unitPrice: 2.8,
  },
  "sub-base-gravel": {
    id: "sub-base-gravel",
    name: "Gravier de fondation tout-venant",
    category: "foundation",
    unit: "m³",
    unitPrice: 28.0,
  },
  "corner-bead": {
    id: "corner-bead",
    name: "Baguette d'angle",
    category: "interior-cladding",
    unit: "ml",
    unitPrice: 1.5,
  },
  "roof-batten": {
    id: "roof-batten",
    name: "Liteau de toiture acier",
    category: "roofing",
    unit: "ml",
    unitPrice: 3.2,
  },
  "fascia-profile": {
    id: "fascia-profile",
    name: "Bandeau de rive",
    category: "roofing",
    unit: "ml",
    unitPrice: 6.5,
  },
  "gutter": {
    id: "gutter",
    name: "Gouttière aluminium",
    category: "roofing",
    unit: "ml",
    unitPrice: 12.0,
  },
  "downpipe": {
    id: "downpipe",
    name: "Descente de gouttière",
    category: "roofing",
    unit: "pcs",
    unitPrice: 25.0,
  },
};

export function getCatalogItem(id: string): CatalogItem | undefined {
  return MATERIAL_CATALOG[id];
}

export function getInsulationPrice(
  type: string,
  thicknessMm: number,
): number {
  const basePrice: Record<string, number> = {
    "rock-wool": 9.8,
    "glass-wool": 7.2,
    eps: 8.5,
    xps: 12.0,
  };
  const base = basePrice[type] ?? 9.8;
  return base * (thicknessMm / 100);
}

export function getExteriorCladdingPrice(type: string): number {
  const prices: Record<string, number> = {
    "fiber-cement": 22.0,
    "metal-panel": 28.0,
    etics: 45.0,
    "brick-veneer": 55.0,
  };
  return prices[type] ?? 22.0;
}

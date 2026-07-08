import type { SearchSpec } from "./types";

const COUNTRIES = ["PT", "ES"];
const OPERATIONS = ["sale", "rent"];
const PROPERTY_TYPES = ["apartment", "house", "land", "any"];
const CONDITIONS = ["new", "good", "to-renovate", "any"];

export function validateSpec(body: unknown): { spec: SearchSpec } | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Corps de requête invalide." };
  }
  const b = body as Record<string, unknown>;

  if (typeof b.country !== "string" || !COUNTRIES.includes(b.country)) {
    return { error: "Pays invalide. Valeurs acceptées : PT, ES." };
  }
  if (typeof b.location !== "string" || b.location.trim().length < 2) {
    return { error: "Localisation requise (ex: Lisboa, Madrid)." };
  }
  if (typeof b.operation !== "string" || !OPERATIONS.includes(b.operation)) {
    return { error: "Type d'opération invalide. Valeurs acceptées : sale, rent." };
  }
  if (typeof b.propertyType !== "string" || !PROPERTY_TYPES.includes(b.propertyType)) {
    return { error: "Type de bien invalide." };
  }

  const num = (v: unknown): number | undefined =>
    typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : undefined;

  if (b.condition !== undefined && (typeof b.condition !== "string" || !CONDITIONS.includes(b.condition))) {
    return { error: "État du bien invalide." };
  }

  const spec: SearchSpec = {
    country: b.country as SearchSpec["country"],
    location: (b.location as string).trim(),
    operation: b.operation as SearchSpec["operation"],
    propertyType: b.propertyType as SearchSpec["propertyType"],
    minPrice: num(b.minPrice),
    maxPrice: num(b.maxPrice),
    minBedrooms: num(b.minBedrooms),
    minSurface: num(b.minSurface),
    minLandSurface: num(b.minLandSurface),
    minConstructionYear: num(b.minConstructionYear),
    garden: b.garden === true,
    garage: b.garage === true,
    condition: (b.condition as SearchSpec["condition"]) ?? "any",
    maxPages: Math.min(Math.max(num(b.maxPages) ?? 3, 1), 5),
  };

  if (spec.minPrice !== undefined && spec.maxPrice !== undefined && spec.minPrice > spec.maxPrice) {
    return { error: "Le prix minimum ne peut pas dépasser le prix maximum." };
  }

  return { spec };
}

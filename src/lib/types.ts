export type Country = "PT" | "ES";

export type OperationType = "sale" | "rent";

export type PropertyType = "apartment" | "house" | "land" | "any";

export type PropertyCondition = "new" | "good" | "to-renovate" | "any";

/** Search specification filled in by the user. */
export interface SearchSpec {
  country: Country;
  location: string;
  operation: OperationType;
  propertyType: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minSurface?: number;
  // Advanced criteria
  minLandSurface?: number;
  minConstructionYear?: number;
  garden?: boolean;
  garage?: boolean;
  condition?: PropertyCondition;
  maxPages?: number;
}

/** A single normalized real-estate listing, regardless of source site. */
export interface Listing {
  id: string;
  source: string;
  url: string;
  title: string;
  price: number | null;
  currency: string;
  location: string;
  bedrooms: number | null;
  surface: number | null;
  pricePerSqm: number | null;
  propertyType: PropertyType | "unknown";
  condition?: string;
  imageUrl?: string;
  description?: string;
}

export interface ProviderError {
  source: string;
  message: string;
}

export interface SearchReport {
  spec: SearchSpec;
  generatedAt: string;
  listings: Listing[];
  stats: ReportStats;
  errors: ProviderError[];
}

export interface ReportStats {
  count: number;
  minPrice: number | null;
  maxPrice: number | null;
  avgPrice: number | null;
  medianPrice: number | null;
  avgPricePerSqm: number | null;
}

/** Interface every scraping/data provider must implement. */
export interface RealEstateProvider {
  id: string;
  name: string;
  supportsCountry(country: Country): boolean;
  search(spec: SearchSpec): Promise<Listing[]>;
}

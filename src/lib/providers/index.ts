import type { RealEstateProvider, Country } from "../types";
import { IdealistaProvider } from "./idealista";

const PROVIDERS: RealEstateProvider[] = [new IdealistaProvider()];

export function getProvidersForCountry(country: Country): RealEstateProvider[] {
  return PROVIDERS.filter((p) => p.supportsCountry(country));
}

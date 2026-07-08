import type { RealEstateProvider, Country } from "../types";
import { IdealistaProvider } from "./idealista";
import { CasaSapoProvider } from "./casaSapo";
import { OlxProvider } from "./olx";
import { FotocasaProvider } from "./fotocasa";
import { PisosComProvider } from "./pisosCom";

const PROVIDERS: RealEstateProvider[] = [
  new IdealistaProvider(),
  CasaSapoProvider,
  OlxProvider,
  FotocasaProvider,
  PisosComProvider,
];

export function getProvidersForCountry(country: Country): RealEstateProvider[] {
  return PROVIDERS.filter((p) => p.supportsCountry(country));
}

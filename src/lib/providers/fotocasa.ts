import type { OperationType, SearchSpec } from "../types";
import { createGenericProvider } from "./genericProvider";
import { slugifyLocation } from "./shared";

const BASE_URL = "https://www.fotocasa.es";

const OPERATION_SEGMENT: Record<OperationType, string> = {
  sale: "comprar",
  rent: "alquiler",
};

function buildCandidates(spec: SearchSpec, pageNum: number): string[] {
  const opSeg = OPERATION_SEGMENT[spec.operation];
  const loc = slugifyLocation(spec.location);
  const pageSuffix = pageNum > 1 ? `?pagina=${pageNum}` : "";

  return [
    `${BASE_URL}/es/${opSeg}/viviendas/${loc}/todas-las-zonas/l${pageSuffix}`,
    `${BASE_URL}/es/${opSeg}/viviendas/${loc}/l${pageSuffix}`,
  ];
}

export const FotocasaProvider = createGenericProvider({
  id: "fotocasa",
  name: "Fotocasa",
  country: "ES",
  baseUrl: BASE_URL,
  locale: "es-ES",
  hrefPattern: /\/\d{6,}\/(d|dp)?/,
  buildCandidates,
});

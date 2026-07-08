import type { OperationType, SearchSpec } from "../types";
import { createGenericProvider } from "./genericProvider";
import { slugifyLocation } from "./shared";

const BASE_URL = "https://www.pisos.com";

const OPERATION_SEGMENT: Record<OperationType, string> = {
  sale: "venta",
  rent: "alquiler",
};

function buildCandidates(spec: SearchSpec, pageNum: number): string[] {
  const opSeg = OPERATION_SEGMENT[spec.operation];
  const loc = slugifyLocation(spec.location);
  const pageSuffix = pageNum > 1 ? `${pageNum}/` : "";

  return [
    `${BASE_URL}/${opSeg}/pisos-${loc}/${pageSuffix}`,
    `${BASE_URL}/${opSeg}/viviendas-${loc}/${pageSuffix}`,
  ];
}

export const PisosComProvider = createGenericProvider({
  id: "pisos-com",
  name: "pisos.com",
  country: "ES",
  baseUrl: BASE_URL,
  locale: "es-ES",
  hrefPattern: /-\d{6,}\/?$/,
  buildCandidates,
});

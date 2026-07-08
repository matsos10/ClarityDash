import type { OperationType, PropertyType, SearchSpec } from "../types";
import { createGenericProvider } from "./genericProvider";
import { slugifyLocation } from "./shared";

const BASE_URL = "https://casa.sapo.pt";

const OPERATION_SEGMENT: Record<OperationType, string> = {
  sale: "comprar",
  rent: "arrendar",
};

const TYPE_SEGMENT: Record<PropertyType, string> = {
  apartment: "apartamentos",
  house: "moradias",
  land: "terrenos",
  any: "imoveis",
};

function buildCandidates(spec: SearchSpec, pageNum: number): string[] {
  const opSeg = OPERATION_SEGMENT[spec.operation];
  const typeSeg = TYPE_SEGMENT[spec.propertyType];
  const loc = slugifyLocation(spec.location);
  const pageSuffix = pageNum > 1 ? `?pn=${pageNum}` : "";

  return [
    `${BASE_URL}/${opSeg}-${typeSeg}/${loc}/${pageSuffix}`,
    `${BASE_URL}/${opSeg}/${loc}/${pageSuffix}`,
  ];
}

export const CasaSapoProvider = createGenericProvider({
  id: "casa-sapo",
  name: "Casa Sapo",
  country: "PT",
  baseUrl: BASE_URL,
  locale: "pt-PT",
  hrefPattern: /\/(comprar|arrendar)\/.*\d{6,}/i,
  buildCandidates,
});

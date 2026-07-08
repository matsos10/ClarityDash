import type { OperationType, SearchSpec } from "../types";
import { createGenericProvider } from "./genericProvider";
import { slugifyLocation } from "./shared";

const BASE_URL = "https://www.olx.pt";

const CATEGORY_SEGMENT: Record<OperationType, string> = {
  sale: "imoveis/apartamentos-moradias-venda",
  rent: "imoveis/apartamentos-moradias-arrendamento",
};

function buildCandidates(spec: SearchSpec, pageNum: number): string[] {
  const category = CATEGORY_SEGMENT[spec.operation];
  const loc = slugifyLocation(spec.location);
  const pageSuffix = pageNum > 1 ? `?page=${pageNum}` : "";

  return [
    `${BASE_URL}/${category}/${loc}/${pageSuffix}`,
    `${BASE_URL}/imoveis/${loc}/${pageSuffix}`,
  ];
}

export const OlxProvider = createGenericProvider({
  id: "olx-pt",
  name: "OLX Portugal",
  country: "PT",
  baseUrl: BASE_URL,
  locale: "pt-PT",
  hrefPattern: /-ID[a-zA-Z0-9]+\.html/,
  buildCandidates,
});

import type { Page } from "playwright-core";
import type { Country, Listing, OperationType, PropertyType, RealEstateProvider, SearchSpec } from "../types";
import {
  DEFAULT_USER_AGENT,
  cleanNavigationError,
  isBlockedPage,
  launchBrowser,
  passesFilters,
  slugifyLocation,
  type RawCard,
  cardToListing as sharedCardToListing,
} from "./shared";

const BASE_URL: Record<Country, string> = {
  PT: "https://www.idealista.pt",
  ES: "https://www.idealista.es",
};

// Idealista's generic "any home" search segment per country/operation.
// Property type is applied as a post-scrape filter because the exact URL
// taxonomy for sub-types is inconsistent across locales and changes over
// time - filtering on parsed card data is more robust than guessing slugs.
const SEARCH_SEGMENT: Record<Country, Record<OperationType, string>> = {
  PT: { sale: "comprar-casas", rent: "arrendar-casas" },
  ES: { sale: "venta-viviendas", rent: "alquiler-viviendas" },
};

const LAND_SEGMENT: Record<Country, string> = {
  PT: "comprar-terrenos",
  ES: "venta-terrenos",
};

function buildSearchUrl(spec: SearchSpec, page: number): string {
  const base = BASE_URL[spec.country];
  const segment =
    spec.propertyType === "land" ? LAND_SEGMENT[spec.country] : SEARCH_SEGMENT[spec.country][spec.operation];
  const locationSlug = slugifyLocation(spec.location);
  const path = `${segment}/${locationSlug}/`;
  return page <= 1 ? `${base}/${path}` : `${base}/${path}pagina-${page}.htm`;
}

async function extractCards(page: Page): Promise<RawCard[]> {
  return page.$$eval("article.item, article[data-element-id]", (nodes) =>
    nodes.map((node) => {
      const linkEl = node.querySelector<HTMLAnchorElement>(
        "a.item-link, a.item-title-link, a[href*='/imovel/'], a[href*='/inmueble/']"
      );
      const priceEl = node.querySelector(".item-price, .price-row .item-price, span.item-price");
      const detailEls = Array.from(node.querySelectorAll(".item-detail-char .item-detail, .item-detail"));
      const imgEl = node.querySelector("img");

      return {
        href: linkEl ? linkEl.getAttribute("href") : null,
        title: linkEl ? linkEl.getAttribute("title") || linkEl.textContent : null,
        price: priceEl ? priceEl.textContent : null,
        details: detailEls.map((el) => el.textContent?.trim() ?? "").filter(Boolean),
        image: imgEl ? imgEl.getAttribute("src") || imgEl.getAttribute("data-src") : null,
      };
    })
  );
}

export class IdealistaProvider implements RealEstateProvider {
  id = "idealista";
  name = "Idealista";

  supportsCountry(country: Country): boolean {
    return country === "PT" || country === "ES";
  }

  async search(spec: SearchSpec): Promise<Listing[]> {
    const maxPages = Math.min(Math.max(spec.maxPages ?? 3, 1), 5);
    const source = spec.country === "PT" ? "idealista.pt" : "idealista.es";
    const locale = spec.country === "PT" ? "pt-PT" : "es-ES";
    const baseUrl = BASE_URL[spec.country];

    const browser = await launchBrowser();
    const listings: Listing[] = [];

    try {
      const context = await browser.newContext({
        locale,
        userAgent: DEFAULT_USER_AGENT,
        viewport: { width: 1366, height: 900 },
      });
      const page = await context.newPage();

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const url = buildSearchUrl(spec, pageNum);
        let response;
        try {
          response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        } catch (err) {
          throw new Error(cleanNavigationError(source, err));
        }

        if (!response || response.status() === 404) break;

        if (response.status() === 403 || (await isBlockedPage(page))) {
          throw new Error(
            `${source} a bloqué la requête automatisée (protection anti-bot). Réessayez plus tard ou réduisez le nombre de pages.`
          );
        }

        if (!response.ok() && response.status() !== 200) {
          throw new Error(`${source} a répondu avec le statut ${response.status()}.`);
        }

        const cards = await extractCards(page);
        if (cards.length === 0) break;

        for (const card of cards) {
          const parsed = sharedCardToListing(card, spec, source, baseUrl);
          if (!parsed || !passesFilters(spec, parsed)) continue;
          listings.push({
            id: parsed.id,
            source,
            url: parsed.url,
            title: parsed.title,
            price: parsed.price,
            currency: "EUR",
            location: spec.location,
            bedrooms: parsed.bedrooms,
            surface: parsed.surface,
            pricePerSqm: parsed.price && parsed.surface ? Math.round(parsed.price / parsed.surface) : null,
            propertyType: parsed.propertyType as PropertyType,
            imageUrl: parsed.image,
          });
        }

        await page.waitForTimeout(1200 + Math.random() * 800);
      }
    } finally {
      await browser.close();
    }

    return listings;
  }
}

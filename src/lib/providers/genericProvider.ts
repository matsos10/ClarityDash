import type { Country, Listing, PropertyType, RealEstateProvider, SearchSpec } from "../types";
import {
  DEFAULT_USER_AGENT,
  cardToListing,
  cleanNavigationError,
  extractCardsGeneric,
  isBlockedPage,
  launchBrowser,
  passesFilters,
} from "./shared";

export interface GenericProviderConfig {
  id: string;
  name: string;
  country: Country;
  baseUrl: string;
  locale: string;
  /** href pattern identifying a listing detail link on this site. */
  hrefPattern: RegExp;
  /** Builds one or more candidate search URLs to try for a given page number, in order of likelihood. */
  buildCandidates(spec: SearchSpec, pageNum: number): string[];
}

/**
 * Generic scraping provider for sites whose exact markup isn't known ahead
 * of time. Uses text/link heuristics (see extractCardsGeneric) instead of
 * hardcoded CSS classes, and tries several candidate search-URL shapes
 * since real estate portals' URL taxonomies vary and change over time.
 *
 * Best-effort: if a site's actual URL scheme or markup differs from the
 * guessed candidates, this provider simply contributes zero listings for
 * that source rather than throwing - other providers/sources still run.
 */
export function createGenericProvider(config: GenericProviderConfig): RealEstateProvider {
  return {
    id: config.id,
    name: config.name,
    supportsCountry(country: Country) {
      return country === config.country;
    },
    async search(spec: SearchSpec): Promise<Listing[]> {
      const maxPages = Math.min(Math.max(spec.maxPages ?? 3, 1), 5);
      const listings: Listing[] = [];
      const browser = await launchBrowser();

      try {
        const context = await browser.newContext({
          locale: config.locale,
          userAgent: DEFAULT_USER_AGENT,
          viewport: { width: 1366, height: 900 },
        });
        const page = await context.newPage();

        let workingCandidateIndex: number | null = null;
        let lastError: Error | null = null;

        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
          const candidates = config.buildCandidates(spec, pageNum);
          const indices: number[] =
            workingCandidateIndex !== null ? [workingCandidateIndex] : candidates.map((_, i) => i);

          let foundOnThisPage = false;

          for (const idx of indices) {
            const url = candidates[idx];
            let response;
            try {
              response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
            } catch (err) {
              lastError = new Error(cleanNavigationError(config.name, err));
              continue;
            }

            if (!response || response.status() === 404) continue;

            if (response.status() === 403 || (await isBlockedPage(page))) {
              lastError = new Error(
                `${config.name} a bloqué la requête automatisée (protection anti-bot).`
              );
              continue;
            }

            const cards = await extractCardsGeneric(page, config.hrefPattern);
            if (cards.length === 0) continue;

            workingCandidateIndex = idx;
            foundOnThisPage = true;

            for (const card of cards) {
              const parsed = cardToListing(card, spec, config.name, config.baseUrl);
              if (!parsed || !passesFilters(spec, parsed)) continue;
              listings.push({
                id: parsed.id,
                source: config.name,
                url: parsed.url,
                title: parsed.title,
                price: parsed.price,
                currency: "EUR",
                location: spec.location,
                bedrooms: parsed.bedrooms,
                surface: parsed.surface,
                pricePerSqm:
                  parsed.price && parsed.surface ? Math.round(parsed.price / parsed.surface) : null,
                propertyType: parsed.propertyType as PropertyType,
                imageUrl: parsed.image,
              });
            }
            break;
          }

          if (!foundOnThisPage) break;
          await page.waitForTimeout(1200 + Math.random() * 800);
        }

        // Only surface an error if we never found anything AND every
        // candidate genuinely failed (network/blocked) rather than just
        // returning an empty (but valid) result set.
        if (listings.length === 0 && lastError && workingCandidateIndex === null) {
          throw lastError;
        }
      } finally {
        await browser.close();
      }

      return listings;
    },
  };
}

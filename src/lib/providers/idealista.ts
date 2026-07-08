import { chromium, type Browser, type Page } from "playwright-core";
import type {
  Country,
  Listing,
  OperationType,
  PropertyType,
  RealEstateProvider,
  SearchSpec,
} from "../types";

const CHROMIUM_EXECUTABLE = process.env.CHROMIUM_PATH;

const BASE_URL: Record<Country, string> = {
  PT: "https://www.idealista.pt",
  ES: "https://www.idealista.es",
};

// Idealista's generic "any home" search segment per country/operation.
// Property type is applied as a post-scrape filter (see matchesPropertyType)
// because the exact URL taxonomy for sub-types is inconsistent across
// locales and changes over time - filtering on parsed card data is more
// robust than guessing URL slugs.
const SEARCH_SEGMENT: Record<Country, Record<OperationType, string>> = {
  PT: { sale: "comprar-casas", rent: "arrendar-casas" },
  ES: { sale: "venta-viviendas", rent: "alquiler-viviendas" },
};

const LAND_SEGMENT: Record<Country, string> = {
  PT: "comprar-terrenos",
  ES: "venta-terrenos",
};

const BLOCKED_MARKERS = [
  "datadome",
  "captcha",
  "access denied",
  "acesso negado",
  "acceso denegado",
  "request unsuccessful",
];

function slugifyLocation(location: string): string {
  return location
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildSearchUrl(spec: SearchSpec, page: number): string {
  const base = BASE_URL[spec.country];
  const segment =
    spec.propertyType === "land"
      ? LAND_SEGMENT[spec.country]
      : SEARCH_SEGMENT[spec.country][spec.operation];
  const locationSlug = slugifyLocation(spec.location);
  const path = `${segment}/${locationSlug}/`;
  return page <= 1 ? `${base}/${path}` : `${base}/${path}pagina-${page}.htm`;
}

/** Parses a localized price/area string like "350.000 €" or "90 m²" into a number. */
function parseLocalizedNumber(text: string): number | null {
  const cleaned = text.replace(/[^\d.,]/g, "");
  if (!cleaned) return null;
  // Idealista (pt/es) uses "." as thousands separator and "," as decimal.
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  const value = parseFloat(normalized);
  return Number.isFinite(value) ? value : null;
}

function detectPropertyType(text: string): PropertyType {
  const t = text.toLowerCase();
  if (/(terreno|land|lote)/.test(t)) return "land";
  if (/(apartamento|piso|flat|t\d|estúdio|studio)/.test(t)) return "apartment";
  if (/(moradia|casa|chalet|villa|quinta|townhouse)/.test(t)) return "house";
  return "any";
}

function matchesPropertyType(spec: SearchSpec, detected: PropertyType): boolean {
  if (spec.propertyType === "any") return true;
  if (detected === "any") return true; // unknown -> don't exclude
  return spec.propertyType === detected;
}

function matchesAdvancedFilters(spec: SearchSpec, text: string): boolean {
  const t = text.toLowerCase();
  if (spec.garden && !/(jardim|jardin|garden)/.test(t)) return false;
  if (spec.garage && !/(garagem|garaje|estacionamento|parking)/.test(t)) return false;
  if (
    spec.condition === "new" &&
    !/(novo|nuevo|obra nova|obra nueva|new)/.test(t)
  )
    return false;
  if (
    spec.condition === "to-renovate" &&
    !/(renovar|reformar|para reforma|a reformar|fixer)/.test(t)
  )
    return false;
  return true;
}

interface RawCard {
  href: string | null;
  title: string | null;
  price: string | null;
  details: string[];
  image: string | null;
}

async function extractCards(page: Page): Promise<RawCard[]> {
  return page.$$eval("article.item, article[data-element-id]", (nodes) =>
    nodes.map((node) => {
      const linkEl = node.querySelector<HTMLAnchorElement>(
        "a.item-link, a.item-title-link, a[href*='/imovel/'], a[href*='/inmueble/']"
      );
      const priceEl = node.querySelector(
        ".item-price, .price-row .item-price, span.item-price"
      );
      const detailEls = Array.from(
        node.querySelectorAll(".item-detail-char .item-detail, .item-detail")
      );
      const imgEl = node.querySelector("img");

      return {
        href: linkEl ? linkEl.getAttribute("href") : null,
        title: linkEl
          ? linkEl.getAttribute("title") || linkEl.textContent
          : null,
        price: priceEl ? priceEl.textContent : null,
        details: detailEls
          .map((el) => el.textContent?.trim() ?? "")
          .filter(Boolean),
        image: imgEl
          ? imgEl.getAttribute("src") || imgEl.getAttribute("data-src")
          : null,
      };
    })
  );
}

async function isBlockedPage(page: Page): Promise<boolean> {
  const title = (await page.title()).toLowerCase();
  if (BLOCKED_MARKERS.some((m) => title.includes(m))) return true;
  const bodyText = (await page.textContent("body").catch(() => "")) ?? "";
  const lower = bodyText.slice(0, 2000).toLowerCase();
  return BLOCKED_MARKERS.some((m) => lower.includes(m));
}

function cardToListing(card: RawCard, spec: SearchSpec, source: string): Listing | null {
  if (!card.href || !card.title) return null;

  const url = card.href.startsWith("http")
    ? card.href
    : `${BASE_URL[spec.country]}${card.href}`;
  const idMatch = card.href.match(/(\d{5,})/);
  const id = idMatch ? idMatch[1] : url;

  const price = card.price ? parseLocalizedNumber(card.price) : null;

  let bedrooms: number | null = null;
  let surface: number | null = null;
  for (const detail of card.details) {
    const d = detail.toLowerCase();
    if (bedrooms === null && /(quarto|dorm|hab|bed|t\d)/.test(d)) {
      const n = detail.match(/\d+/);
      if (n) bedrooms = parseInt(n[0], 10);
    }
    if (surface === null && /m²|m2/.test(d)) {
      surface = parseLocalizedNumber(detail);
    }
  }

  const fullText = `${card.title} ${card.details.join(" ")}`;
  const detectedType = detectPropertyType(fullText);

  return {
    id,
    source,
    url,
    title: card.title.trim(),
    price,
    currency: "EUR",
    location: spec.location,
    bedrooms,
    surface,
    pricePerSqm: price && surface ? Math.round(price / surface) : null,
    propertyType: detectedType,
    imageUrl: card.image ?? undefined,
  };
}

function cleanNavigationError(source: string, err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const firstLine = raw.split("\n")[0];
  if (/ERR_TUNNEL_CONNECTION_FAILED|ERR_CONNECTION|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED/.test(raw)) {
    return `Impossible de joindre ${source} (pas de connexion sortante disponible).`;
  }
  if (/Timeout|timeout/.test(raw)) {
    return `${source} n'a pas répondu à temps.`;
  }
  return `Erreur lors de la récupération des annonces sur ${source} : ${firstLine}`;
}

async function launchBrowser(): Promise<Browser> {
  return chromium.launch({
    headless: true,
    executablePath: CHROMIUM_EXECUTABLE,
    args: ["--disable-blink-features=AutomationControlled"],
  });
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

    const browser = await launchBrowser();
    const listings: Listing[] = [];

    try {
      const context = await browser.newContext({
        locale,
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        viewport: { width: 1366, height: 900 },
      });
      const page = await context.newPage();

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const url = buildSearchUrl(spec, pageNum);
        let response;
        try {
          response = await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
          });
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
          const listing = cardToListing(card, spec, source);
          if (!listing) continue;
          if (!matchesPropertyType(spec, listing.propertyType as PropertyType)) continue;
          if (spec.minPrice && listing.price !== null && listing.price < spec.minPrice) continue;
          if (spec.maxPrice && listing.price !== null && listing.price > spec.maxPrice) continue;
          if (spec.minBedrooms && listing.bedrooms !== null && listing.bedrooms < spec.minBedrooms) continue;
          if (spec.minSurface && listing.surface !== null && listing.surface < spec.minSurface) continue;
          if (!matchesAdvancedFilters(spec, listing.title)) continue;
          listings.push(listing);
        }

        await page.waitForTimeout(1200 + Math.random() * 800);
      }
    } finally {
      await browser.close();
    }

    return listings;
  }
}

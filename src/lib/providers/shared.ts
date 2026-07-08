import { chromium, type Browser, type Page } from "playwright-core";
import type { PropertyType, SearchSpec } from "../types";

const CHROMIUM_EXECUTABLE = process.env.CHROMIUM_PATH;

export const BLOCKED_MARKERS = [
  "datadome",
  "captcha",
  "access denied",
  "acesso negado",
  "acceso denegado",
  "request unsuccessful",
  "attention required",
  "just a moment",
];

export function slugifyLocation(location: string): string {
  return location
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Parses a localized price/area string like "350.000 €" or "90 m²" into a number. */
export function parseLocalizedNumber(text: string): number | null {
  const cleaned = text.replace(/[^\d.,]/g, "");
  if (!cleaned) return null;
  // pt/es real-estate sites use "." as thousands separator and "," as decimal.
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  const value = parseFloat(normalized);
  return Number.isFinite(value) ? value : null;
}

export function detectPropertyType(text: string): PropertyType {
  const t = text.toLowerCase();
  if (/(terreno|land|lote)/.test(t)) return "land";
  if (/(apartamento|piso|flat|t\d|estúdio|studio)/.test(t)) return "apartment";
  if (/(moradia|casa|chalet|villa|quinta|townhouse)/.test(t)) return "house";
  return "any";
}

export function matchesPropertyType(spec: SearchSpec, detected: PropertyType): boolean {
  if (spec.propertyType === "any") return true;
  if (detected === "any") return true; // unknown -> don't exclude
  return spec.propertyType === detected;
}

export function matchesAdvancedFilters(spec: SearchSpec, text: string): boolean {
  const t = text.toLowerCase();
  if (spec.garden && !/(jardim|jardin|garden)/.test(t)) return false;
  if (spec.garage && !/(garagem|garaje|estacionamento|parking)/.test(t)) return false;
  if (spec.condition === "new" && !/(novo|nuevo|obra nova|obra nueva|new)/.test(t)) return false;
  if (
    spec.condition === "to-renovate" &&
    !/(renovar|reformar|para reforma|a reformar|fixer)/.test(t)
  )
    return false;
  return true;
}

export async function isBlockedPage(page: Page): Promise<boolean> {
  const title = (await page.title().catch(() => "")).toLowerCase();
  if (BLOCKED_MARKERS.some((m) => title.includes(m))) return true;
  const bodyText = (await page.textContent("body").catch(() => "")) ?? "";
  const lower = bodyText.slice(0, 2000).toLowerCase();
  return BLOCKED_MARKERS.some((m) => lower.includes(m));
}

export function cleanNavigationError(source: string, err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const firstLine = raw.split("\n")[0];
  if (
    /ERR_TUNNEL_CONNECTION_FAILED|ERR_CONNECTION|ERR_NAME_NOT_RESOLVED|ERR_INTERNET_DISCONNECTED/.test(
      raw
    )
  ) {
    return `Impossible de joindre ${source} (pas de connexion sortante disponible).`;
  }
  if (/Timeout|timeout/.test(raw)) {
    return `${source} n'a pas répondu à temps.`;
  }
  return `Erreur lors de la récupération des annonces sur ${source} : ${firstLine}`;
}

export async function launchBrowser(): Promise<Browser> {
  return chromium.launch({
    headless: true,
    executablePath: CHROMIUM_EXECUTABLE,
    args: ["--disable-blink-features=AutomationControlled"],
  });
}

export const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export interface RawCard {
  href: string | null;
  title: string | null;
  price: string | null;
  details: string[];
  image: string | null;
}

/**
 * Generic fallback extraction: finds every link whose href matches
 * `hrefPattern`, climbs to the nearest ancestor whose visible text looks
 * like a listing card (contains a currency symbol, reasonable length), and
 * pulls price/surface/bedroom hints out of that block's free text.
 *
 * Used for sites whose exact markup/class names aren't known ahead of time -
 * it's less precise than dedicated selectors but far more resilient to
 * markup changes since it doesn't depend on specific class names.
 */
export async function extractCardsGeneric(
  page: Page,
  hrefPattern: RegExp
): Promise<RawCard[]> {
  const raw = await page.evaluate(
    ({ patternSource, patternFlags }) => {
      const regex = new RegExp(patternSource, patternFlags);
      const anchors = Array.from(document.querySelectorAll("a[href]")) as HTMLAnchorElement[];
      const seen = new Set<string>();
      const out: { href: string; title: string; text: string; image: string | null }[] = [];

      for (const a of anchors) {
        const href = a.getAttribute("href") || "";
        if (!href || !regex.test(href) || seen.has(href)) continue;

        let container: HTMLElement | null = a;
        let text = (container.innerText || "").trim();
        for (let i = 0; i < 5 && container; i++) {
          text = (container.innerText || "").trim();
          if (/[€$]/.test(text) && text.length > 15 && text.length < 1500) break;
          container = container.parentElement;
        }
        if (!container) container = a;

        seen.add(href);
        const img = container.querySelector("img");
        const title = a.getAttribute("title") || a.textContent?.trim() || "";

        out.push({
          href,
          title,
          text,
          image: img ? img.getAttribute("src") || img.getAttribute("data-src") : null,
        });
      }
      return out;
    },
    { patternSource: hrefPattern.source, patternFlags: hrefPattern.flags }
  );

  return raw.map((item) => {
    const priceMatch = item.text.match(/([\d.,]+)\s*€/);
    const surfaceMatch = item.text.match(/([\d.,]+)\s*m[²2]/i);
    const bedroomMatch = item.text.match(/(\d+)\s*(?:quartos?|dorm\.?|dormitorios?|hab\.?|t\d)/i);

    return {
      href: item.href || null,
      title: item.title || null,
      price: priceMatch ? priceMatch[0] : null,
      details: [surfaceMatch ? surfaceMatch[0] : "", bedroomMatch ? bedroomMatch[0] : ""].filter(
        Boolean
      ),
      image: item.image,
    };
  });
}

export function cardToListing(
  card: RawCard,
  spec: SearchSpec,
  source: string,
  baseUrl: string
): { id: string; url: string; title: string; price: number | null; bedrooms: number | null; surface: number | null; propertyType: PropertyType; image?: string } | null {
  if (!card.href || !card.title) return null;

  const url = card.href.startsWith("http") ? card.href : `${baseUrl}${card.href}`;
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
    if (surface === null && /m²|m2/i.test(d)) {
      surface = parseLocalizedNumber(detail);
    }
  }

  const fullText = `${card.title} ${card.details.join(" ")}`;
  const detectedType = detectPropertyType(fullText);

  return {
    id,
    url,
    title: card.title.trim(),
    price,
    bedrooms,
    surface,
    propertyType: detectedType,
    image: card.image ?? undefined,
  };
}

/** Applies the shared SearchSpec filters (type/price/bedrooms/surface/advanced) to a raw card. */
export function passesFilters(
  spec: SearchSpec,
  parsed: NonNullable<ReturnType<typeof cardToListing>>
): boolean {
  if (!matchesPropertyType(spec, parsed.propertyType)) return false;
  if (spec.minPrice && parsed.price !== null && parsed.price < spec.minPrice) return false;
  if (spec.maxPrice && parsed.price !== null && parsed.price > spec.maxPrice) return false;
  if (spec.minBedrooms && parsed.bedrooms !== null && parsed.bedrooms < spec.minBedrooms)
    return false;
  if (spec.minSurface && parsed.surface !== null && parsed.surface < spec.minSurface) return false;
  if (!matchesAdvancedFilters(spec, parsed.title)) return false;
  return true;
}

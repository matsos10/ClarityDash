import type { Listing, ReportStats } from "./types";

export function computeStats(listings: Listing[]): ReportStats {
  const prices = listings
    .map((l) => l.price)
    .filter((p): p is number => p !== null && p > 0)
    .sort((a, b) => a - b);

  const pricesPerSqm = listings
    .map((l) => l.pricePerSqm)
    .filter((p): p is number => p !== null && p > 0);

  if (prices.length === 0) {
    return {
      count: listings.length,
      minPrice: null,
      maxPrice: null,
      avgPrice: null,
      medianPrice: null,
      avgPricePerSqm: null,
    };
  }

  const sum = prices.reduce((a, b) => a + b, 0);
  const mid = Math.floor(prices.length / 2);
  const median =
    prices.length % 2 === 0
      ? (prices[mid - 1] + prices[mid]) / 2
      : prices[mid];

  const avgPricePerSqm =
    pricesPerSqm.length > 0
      ? pricesPerSqm.reduce((a, b) => a + b, 0) / pricesPerSqm.length
      : null;

  return {
    count: listings.length,
    minPrice: prices[0],
    maxPrice: prices[prices.length - 1],
    avgPrice: Math.round(sum / prices.length),
    medianPrice: Math.round(median),
    avgPricePerSqm: avgPricePerSqm !== null ? Math.round(avgPricePerSqm) : null,
  };
}

export function listingsToCsv(listings: Listing[]): string {
  const headers = [
    "title",
    "price",
    "currency",
    "location",
    "bedrooms",
    "surface",
    "pricePerSqm",
    "propertyType",
    "source",
    "url",
  ];

  const escape = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };

  const rows = listings.map((l) =>
    [
      l.title,
      l.price ?? "",
      l.currency,
      l.location,
      l.bedrooms ?? "",
      l.surface ?? "",
      l.pricePerSqm ?? "",
      l.propertyType,
      l.source,
      l.url,
    ]
      .map(escape)
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

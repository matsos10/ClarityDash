"use client";

import type { SearchReport } from "@/lib/types";
import { listingsToCsv } from "@/lib/report";

interface ReportProps {
  report: SearchReport;
}

const OPERATION_LABEL: Record<string, string> = { sale: "achat", rent: "location" };
const COUNTRY_LABEL: Record<string, string> = { PT: "Portugal", ES: "Espagne" };

function formatPrice(value: number | null): string {
  if (value === null) return "—";
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value) + " €";
}

function downloadCsv(report: SearchReport) {
  const csv = listingsToCsv(report.listings);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rapport-immobilier-${report.spec.country}-${report.spec.location}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Report({ report }: ReportProps) {
  const { spec, stats, listings, errors } = report;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">
          {COUNTRY_LABEL[spec.country]} · {spec.location} · {OPERATION_LABEL[spec.operation]}
        </h2>
        <p className="text-xs text-black/50 dark:text-white/50">
          Rapport généré le {new Date(report.generatedAt).toLocaleString("fr-FR")}
        </p>
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-800 dark:text-amber-300">
          {errors.map((err, i) => (
            <p key={i}>
              ⚠️ {err.source} : {err.message}
            </p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile label="Biens trouvés" value={String(stats.count)} />
        <StatTile label="Prix médian" value={formatPrice(stats.medianPrice)} />
        <StatTile label="Prix min — max" value={`${formatPrice(stats.minPrice)} — ${formatPrice(stats.maxPrice)}`} />
        <StatTile label="Prix moyen / m²" value={stats.avgPricePerSqm ? `${stats.avgPricePerSqm} €` : "—"} />
      </div>

      {listings.length > 0 && (
        <button
          onClick={() => downloadCsv(report)}
          className="text-sm font-medium rounded-lg border border-black/15 dark:border-white/20 px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10 transition"
        >
          Exporter en CSV
        </button>
      )}

      {listings.length === 0 && errors.length === 0 && (
        <p className="text-sm text-black/60 dark:text-white/60">
          Aucun bien trouvé pour ces critères. Essayez d&apos;élargir la recherche.
        </p>
      )}

      <ul className="space-y-3">
        {listings.map((listing) => (
          <li
            key={listing.id}
            className="rounded-lg border border-black/10 dark:border-white/15 p-4 flex gap-4"
          >
            {listing.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.imageUrl}
                alt=""
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-md object-cover shrink-0 bg-black/5 dark:bg-white/10"
              />
            )}
            <div className="min-w-0 flex-1">
              <a
                href={listing.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-sm hover:underline line-clamp-2"
              >
                {listing.title}
              </a>
              <p className="text-emerald-700 dark:text-emerald-400 font-semibold mt-1">
                {formatPrice(listing.price)}
                {listing.pricePerSqm && (
                  <span className="text-xs font-normal text-black/50 dark:text-white/50">
                    {" "}
                    ({listing.pricePerSqm} €/m²)
                  </span>
                )}
              </p>
              <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                {[
                  listing.bedrooms !== null ? `${listing.bedrooms} ch.` : null,
                  listing.surface !== null ? `${listing.surface} m²` : null,
                  listing.source,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-black/10 dark:border-white/15 p-3">
      <p className="text-[11px] uppercase tracking-wide text-black/50 dark:text-white/50">{label}</p>
      <p className="text-sm font-semibold mt-1 break-words">{value}</p>
    </div>
  );
}

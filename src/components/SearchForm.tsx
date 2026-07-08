"use client";

import { useState } from "react";
import type { SearchSpec } from "@/lib/types";

interface SearchFormProps {
  onSubmit: (spec: SearchSpec) => void;
  isLoading: boolean;
}

const DEFAULT_SPEC: SearchSpec = {
  country: "PT",
  location: "",
  operation: "sale",
  propertyType: "any",
  condition: "any",
  maxPages: 3,
};

const inputClass =
  "w-full rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-white/5 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500/60 transition";

const labelClass = "block text-xs font-medium text-black/60 dark:text-white/60 mb-1";

export default function SearchForm({ onSubmit, isLoading }: SearchFormProps) {
  const [spec, setSpec] = useState<SearchSpec>(DEFAULT_SPEC);
  const [showAdvanced, setShowAdvanced] = useState(false);

  function update<K extends keyof SearchSpec>(key: K, value: SearchSpec[K]) {
    setSpec((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!spec.location.trim()) return;
    onSubmit(spec);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Pays</label>
          <select
            className={inputClass}
            value={spec.country}
            onChange={(e) => update("country", e.target.value as SearchSpec["country"])}
          >
            <option value="PT">Portugal</option>
            <option value="ES">Espagne</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Opération</label>
          <select
            className={inputClass}
            value={spec.operation}
            onChange={(e) => update("operation", e.target.value as SearchSpec["operation"])}
          >
            <option value="sale">Achat</option>
            <option value="rent">Location</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Ville / localisation</label>
        <input
          type="text"
          required
          placeholder="ex : Lisboa, Porto, Madrid, Valencia..."
          className={inputClass}
          value={spec.location}
          onChange={(e) => update("location", e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass}>Type de bien</label>
        <select
          className={inputClass}
          value={spec.propertyType}
          onChange={(e) => update("propertyType", e.target.value as SearchSpec["propertyType"])}
        >
          <option value="any">Indifférent</option>
          <option value="apartment">Appartement</option>
          <option value="house">Maison</option>
          <option value="land">Terrain</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Prix min (€)</label>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            className={inputClass}
            value={spec.minPrice ?? ""}
            onChange={(e) => update("minPrice", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
        <div>
          <label className={labelClass}>Prix max (€)</label>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            className={inputClass}
            value={spec.maxPrice ?? ""}
            onChange={(e) => update("maxPrice", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Chambres min</label>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            className={inputClass}
            value={spec.minBedrooms ?? ""}
            onChange={(e) => update("minBedrooms", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
        <div>
          <label className={labelClass}>Surface min (m²)</label>
          <input
            type="number"
            min={0}
            inputMode="numeric"
            className={inputClass}
            value={spec.minSurface ?? ""}
            onChange={(e) => update("minSurface", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="text-sm font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
      >
        {showAdvanced ? "▾" : "▸"} Critères avancés
      </button>

      {showAdvanced && (
        <div className="space-y-4 rounded-lg border border-black/10 dark:border-white/15 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Surface terrain min (m²)</label>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                className={inputClass}
                value={spec.minLandSurface ?? ""}
                onChange={(e) =>
                  update("minLandSurface", e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
            <div>
              <label className={labelClass}>Année construction min</label>
              <input
                type="number"
                min={1800}
                inputMode="numeric"
                className={inputClass}
                value={spec.minConstructionYear ?? ""}
                onChange={(e) =>
                  update("minConstructionYear", e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>État du bien</label>
            <select
              className={inputClass}
              value={spec.condition}
              onChange={(e) => update("condition", e.target.value as SearchSpec["condition"])}
            >
              <option value="any">Indifférent</option>
              <option value="new">Neuf</option>
              <option value="good">Bon état</option>
              <option value="to-renovate">À rénover</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={spec.garden ?? false}
                onChange={(e) => update("garden", e.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
              Jardin
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={spec.garage ?? false}
                onChange={(e) => update("garage", e.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
              Garage / parking
            </label>
          </div>

          <div>
            <label className={labelClass}>Pages à explorer par source (1-5)</label>
            <input
              type="number"
              min={1}
              max={5}
              inputMode="numeric"
              className={inputClass}
              value={spec.maxPages ?? 3}
              onChange={(e) => update("maxPages", Number(e.target.value))}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 text-sm transition"
      >
        {isLoading ? "Recherche en cours…" : "Rechercher et générer le rapport"}
      </button>
    </form>
  );
}

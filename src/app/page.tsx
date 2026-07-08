"use client";

import { useState } from "react";
import SearchForm from "@/components/SearchForm";
import Report from "@/components/Report";
import type { SearchReport, SearchSpec } from "@/lib/types";

export default function Home() {
  const [report, setReport] = useState<SearchReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(spec: SearchSpec) {
    setIsLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spec),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }
      setReport(data as SearchReport);
    } catch {
      setError("Impossible de contacter le serveur. Vérifiez votre connexion.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-6 sm:py-10">
      <header className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">ClarityDash</h1>
        <p className="text-sm text-black/60 dark:text-white/60 mt-1">
          Recherchez des biens immobiliers au Portugal et en Espagne selon vos critères, et
          obtenez un rapport détaillé.
        </p>
      </header>

      <section className="rounded-xl border border-black/10 dark:border-white/15 p-4 sm:p-6 bg-black/[0.02] dark:bg-white/[0.02]">
        <SearchForm onSubmit={handleSearch} isLoading={isLoading} />
      </section>

      {error && (
        <p className="mt-4 rounded-lg border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      {report && (
        <section className="mt-8">
          <Report report={report} />
        </section>
      )}

      <footer className="mt-10 text-[11px] text-black/40 dark:text-white/40 leading-relaxed">
        Les annonces sont récupérées en direct depuis plusieurs sites publics (Idealista, Casa
        Sapo, OLX, Fotocasa, pisos.com selon le pays). Cet outil est destiné à un usage personnel
        de recherche ; le contenu affiché appartient à ses propriétaires respectifs. La
        disponibilité des résultats dépend de la protection anti-robot des sites sources.
      </footer>
    </main>
  );
}

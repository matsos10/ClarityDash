"use client";

import type { LSFProject } from "@/types/project";
import type { MaterialCategory } from "@/types/materials";
import { CATEGORY_LABELS } from "@/types/materials";
import { TrendingUp, EuroIcon, BarChart3 } from "lucide-react";

const COLORS = [
  "#1e40af",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#2563eb",
  "#1d4ed8",
  "#3730a3",
  "#4f46e5",
  "#6366f1",
  "#818cf8",
];

export function CostSummary({ project }: { project: LSFProject }) {
  const costPerM2 = Math.ceil(project.totalCost / project.totalArea);

  const sortedCategories = (
    Object.entries(project.bom.costByCategory) as [MaterialCategory, number][]
  )
    .filter(([, cost]) => cost > 0)
    .sort(([, a], [, b]) => b - a);

  const top3 = sortedCategories.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-border rounded-xl p-5 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <EuroIcon className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Coût total</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {project.totalCost.toLocaleString("fr-FR")} €
          </p>
        </div>
        <div className="border border-border rounded-xl p-5 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Coût au m²</span>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {costPerM2.toLocaleString("fr-FR")} €
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            sur {project.totalArea} m² construits
          </p>
        </div>
        <div className="border border-border rounded-xl p-5 bg-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              Top 3 postes de coût
            </span>
          </div>
          <div className="space-y-1">
            {top3.map(([cat, cost], i) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-sm text-foreground">
                  {i + 1}. {CATEGORY_LABELS[cat]}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {((cost / project.totalCost) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual bar chart */}
      <div className="border border-border rounded-xl p-6 bg-white">
        <h3 className="font-semibold text-foreground mb-6">
          Répartition des coûts par catégorie
        </h3>
        <div className="space-y-4">
          {sortedCategories.map(([cat, cost], i) => {
            const pct = (cost / project.totalCost) * 100;
            return (
              <div key={cat} className="flex items-center gap-4">
                <div className="w-40 text-sm text-foreground truncate">
                  {CATEGORY_LABELS[cat]}
                </div>
                <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all flex items-center justify-end pr-2"
                    style={{
                      width: `${Math.max(pct, 3)}%`,
                      backgroundColor: COLORS[i % COLORS.length],
                    }}
                  >
                    {pct > 8 && (
                      <span className="text-xs font-medium text-white">
                        {pct.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-28 text-right text-sm font-medium text-foreground">
                  {cost.toLocaleString("fr-FR")} €
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase cost table */}
      <div className="border border-border rounded-xl bg-white overflow-hidden">
        <div className="p-6 pb-0">
          <h3 className="font-semibold text-foreground">
            Coût par phase de construction
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm mt-4">
            <thead>
              <tr className="text-left text-muted-foreground bg-muted/50">
                <th className="px-6 py-3 font-medium">#</th>
                <th className="px-6 py-3 font-medium">Phase</th>
                <th className="px-6 py-3 font-medium">Durée</th>
                <th className="px-6 py-3 font-medium text-right">Matériaux</th>
                <th className="px-6 py-3 font-medium text-right">Coût</th>
                <th className="px-6 py-3 font-medium text-right">% Total</th>
              </tr>
            </thead>
            <tbody>
              {project.phases.map((phase) => (
                <tr
                  key={phase.id}
                  className="border-t border-border hover:bg-muted/20"
                >
                  <td className="px-6 py-3 font-medium text-primary">
                    {phase.order}
                  </td>
                  <td className="px-6 py-3 text-foreground font-medium">
                    {phase.name}
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">
                    {phase.duration}
                  </td>
                  <td className="px-6 py-3 text-right text-muted-foreground">
                    {phase.materials.length} postes
                  </td>
                  <td className="px-6 py-3 text-right font-semibold text-foreground">
                    {phase.phaseCost.toLocaleString("fr-FR")} €
                  </td>
                  <td className="px-6 py-3 text-right text-muted-foreground">
                    {((phase.phaseCost / project.totalCost) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/30">
                <td colSpan={4} className="px-6 py-3 font-bold text-foreground">
                  TOTAL
                </td>
                <td className="px-6 py-3 text-right font-bold text-primary text-lg">
                  {project.totalCost.toLocaleString("fr-FR")} €
                </td>
                <td className="px-6 py-3 text-right font-bold text-foreground">
                  100%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

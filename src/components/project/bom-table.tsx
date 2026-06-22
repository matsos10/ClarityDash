"use client";

import { useState } from "react";
import type { LSFProject } from "@/types/project";
import type { MaterialCategory } from "@/types/materials";
import { CATEGORY_LABELS } from "@/types/materials";
import { Search, ChevronDown, ChevronUp } from "lucide-react";

export function BOMTable({ project }: { project: LSFProject }) {
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(
    new Set(Object.keys(CATEGORY_LABELS)),
  );

  const toggleCat = (cat: string) => {
    const next = new Set(expandedCats);
    if (next.has(cat)) {
      next.delete(cat);
    } else {
      next.add(cat);
    }
    setExpandedCats(next);
  };

  const categories = (
    Object.keys(CATEGORY_LABELS) as MaterialCategory[]
  ).filter((cat) => project.bom.items.some((i) => i.category === cat));

  const filteredItems = search
    ? project.bom.items.filter(
        (i) =>
          i.name.toLowerCase().includes(search.toLowerCase()) ||
          (i.specifications ?? "")
            .toLowerCase()
            .includes(search.toLowerCase()),
      )
    : project.bom.items;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un article..."
            className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredItems.length} articles —{" "}
          <span className="font-semibold text-foreground">
            {project.bom.totalCost.toLocaleString("fr-FR")} €
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => {
          const items = filteredItems.filter((i) => i.category === cat);
          if (items.length === 0) return null;
          const isExpanded = expandedCats.has(cat);
          const catTotal = items.reduce((s, i) => s + i.totalPrice, 0);

          return (
            <div
              key={cat}
              className="border border-border rounded-xl bg-white overflow-hidden"
            >
              <button
                onClick={() => toggleCat(cat)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {items.length}
                  </span>
                  <h3 className="font-semibold text-foreground">
                    {CATEGORY_LABELS[cat]}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">
                    {catTotal.toLocaleString("fr-FR")} €
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-muted-foreground bg-muted/50">
                          <th className="px-4 py-2.5 font-medium">Article</th>
                          <th className="px-4 py-2.5 font-medium">
                            Spécifications
                          </th>
                          <th className="px-4 py-2.5 font-medium text-right">
                            Qté
                          </th>
                          <th className="px-4 py-2.5 font-medium">Unité</th>
                          <th className="px-4 py-2.5 font-medium text-right">
                            P.U.
                          </th>
                          <th className="px-4 py-2.5 font-medium text-right">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item) => (
                          <tr
                            key={item.id}
                            className="border-t border-border/50 hover:bg-muted/20"
                          >
                            <td className="px-4 py-2.5 text-foreground font-medium">
                              {item.name}
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground text-xs">
                              {item.specifications ?? "—"}
                            </td>
                            <td className="px-4 py-2.5 text-right text-foreground">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground">
                              {item.unit}
                            </td>
                            <td className="px-4 py-2.5 text-right text-muted-foreground">
                              {item.unitPrice.toFixed(2)} €
                            </td>
                            <td className="px-4 py-2.5 text-right font-semibold text-foreground">
                              {item.totalPrice.toLocaleString("fr-FR")} €
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-border bg-muted/30">
                          <td
                            colSpan={5}
                            className="px-4 py-2.5 text-right font-semibold text-foreground"
                          >
                            Sous-total
                          </td>
                          <td className="px-4 py-2.5 text-right font-bold text-primary">
                            {catTotal.toLocaleString("fr-FR")} €
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

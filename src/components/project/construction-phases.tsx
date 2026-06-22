"use client";

import { useState } from "react";
import type { LSFProject } from "@/types/project";
import {
  Clock,
  EuroIcon,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Package,
} from "lucide-react";

export function ConstructionPhases({ project }: { project: LSFProject }) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>(
    project.phases[0]?.id ?? null,
  );

  return (
    <div className="space-y-4">
      {project.phases.map((phase) => {
        const isExpanded = expandedPhase === phase.id;
        return (
          <div
            key={phase.id}
            className="border border-border rounded-xl bg-white overflow-hidden"
          >
            <button
              onClick={() =>
                setExpandedPhase(isExpanded ? null : phase.id)
              }
              className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {phase.order}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">
                    {phase.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {phase.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {phase.duration}
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                    <EuroIcon className="h-3.5 w-3.5" />
                    {phase.phaseCost.toLocaleString("fr-FR")} €
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-border px-5 py-4 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Tâches
                  </h4>
                  <ul className="space-y-1.5 ml-6">
                    {phase.tasks.map((task, i) => (
                      <li
                        key={i}
                        className="text-sm text-foreground flex items-start gap-2"
                      >
                        <span className="text-muted-foreground mt-0.5">•</span>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>

                {phase.materials.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      Matériaux ({phase.materials.length} postes)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-muted-foreground border-b border-border">
                            <th className="pb-2 pr-4">Article</th>
                            <th className="pb-2 pr-4">Qté</th>
                            <th className="pb-2 pr-4">Unité</th>
                            <th className="pb-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {phase.materials.map((mat) => (
                            <tr
                              key={mat.id}
                              className="border-b border-border/50"
                            >
                              <td className="py-2 pr-4 text-foreground">
                                {mat.name}
                              </td>
                              <td className="py-2 pr-4 text-foreground">
                                {mat.quantity}
                              </td>
                              <td className="py-2 pr-4 text-muted-foreground">
                                {mat.unit}
                              </td>
                              <td className="py-2 text-right font-medium text-foreground">
                                {mat.totalPrice.toLocaleString("fr-FR")} €
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-2 text-sm sm:hidden">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {phase.duration}
                  </span>
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <EuroIcon className="h-3.5 w-3.5" />
                    {phase.phaseCost.toLocaleString("fr-FR")} €
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

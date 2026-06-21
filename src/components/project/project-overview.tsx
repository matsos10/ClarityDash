"use client";

import type { LSFProject } from "@/types/project";
import {
  Building2,
  Ruler,
  Layers,
  EuroIcon,
  Package,
  Clock,
} from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="border border-border rounded-xl p-5 bg-white">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export function ProjectOverview({ project }: { project: LSFProject }) {
  const costPerM2 = Math.ceil(project.totalCost / project.totalArea);
  const totalMaterials = project.bom.items.length;
  const totalPhases = project.phases.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={EuroIcon}
          label="Coût total estimé"
          value={`${project.totalCost.toLocaleString("fr-FR")} €`}
          sub={`${costPerM2.toLocaleString("fr-FR")} €/m²`}
        />
        <StatCard
          icon={Building2}
          label="Surface construite"
          value={`${project.totalArea} m²`}
          sub={`${project.parameters.numberOfFloors} étage(s) × ${project.parameters.totalFloorArea} m²`}
        />
        <StatCard
          icon={Ruler}
          label="Périmètre"
          value={`${project.parameters.perimeterLength} m`}
          sub={`Hauteur murs : ${project.parameters.wallHeight} mm`}
        />
        <StatCard
          icon={Package}
          label="Articles au devis"
          value={`${totalMaterials}`}
          sub="Nombre de postes du devis quantitatif"
        />
        <StatCard
          icon={Layers}
          label="Phases de construction"
          value={`${totalPhases}`}
          sub="Étapes de réalisation"
        />
        <StatCard
          icon={Clock}
          label="Durée estimée"
          value={`${10 + (project.parameters.numberOfFloors - 1) * 3}-${16 + (project.parameters.numberOfFloors - 1) * 4} sem.`}
          sub="Estimation hors aléas"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-border rounded-xl p-6 bg-white">
          <h3 className="font-semibold text-foreground mb-4">
            Répartition des coûts
          </h3>
          <div className="space-y-3">
            {Object.entries(project.bom.costByCategory)
              .filter(([, cost]) => cost > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, cost]) => {
                const pct = (cost / project.totalCost) * 100;
                const labels: Record<string, string> = {
                  "steel-profiles": "Profilés Acier",
                  insulation: "Isolation",
                  "exterior-cladding": "Revêt. Extérieur",
                  "interior-cladding": "Revêt. Intérieur",
                  fasteners: "Fixations",
                  waterproofing: "Étanchéité",
                  foundation: "Fondation",
                  roofing: "Toiture",
                  openings: "Menuiseries",
                  miscellaneous: "Divers",
                };
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground">
                        {labels[cat] ?? cat}
                      </span>
                      <span className="text-muted-foreground">
                        {cost.toLocaleString("fr-FR")} € ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="border border-border rounded-xl p-6 bg-white">
          <h3 className="font-semibold text-foreground mb-4">
            Coût par phase
          </h3>
          <div className="space-y-3">
            {project.phases.map((phase) => {
              const pct = (phase.phaseCost / project.totalCost) * 100;
              return (
                <div key={phase.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">
                      {phase.order}. {phase.name}
                    </span>
                    <span className="text-muted-foreground">
                      {phase.phaseCost.toLocaleString("fr-FR")} €
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary/70 h-2 rounded-full transition-all"
                      style={{ width: `${Math.max(pct, 1)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

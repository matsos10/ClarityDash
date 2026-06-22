"use client";

import { useState } from "react";
import { useProjectStore } from "@/lib/store/project-store";
import { ProjectOverview } from "./project-overview";
import { ConstructionPhases } from "./construction-phases";
import { BOMTable } from "./bom-table";
import { CostSummary } from "./cost-summary";
import { PDFExportButton } from "@/components/export/pdf-export-button";
import {
  LayoutDashboard,
  ListChecks,
  ClipboardList,
  PieChart,
  ArrowLeft,
} from "lucide-react";

const TABS = [
  { id: "overview", label: "Vue d'ensemble", icon: LayoutDashboard },
  { id: "phases", label: "Phases", icon: ListChecks },
  { id: "bom", label: "Matériaux", icon: ClipboardList },
  { id: "costs", label: "Coûts", icon: PieChart },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ProjectStep() {
  const { project, setStep } = useProjectStore();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">
          Aucun projet généré. Retournez aux paramètres.
        </p>
        <button
          onClick={() => setStep(1)}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-lg"
        >
          Paramètres
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {project.name}
          </h2>
          <p className="text-muted-foreground">
            {project.totalArea} m² — {project.parameters.numberOfFloors}{" "}
            étage(s) — Coût total :{" "}
            <span className="font-semibold text-primary">
              {project.totalCost.toLocaleString("fr-FR")} €
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Modifier
          </button>
          <PDFExportButton project={project} />
        </div>
      </div>

      <div className="border-b border-border">
        <nav className="flex gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div>
        {activeTab === "overview" && <ProjectOverview project={project} />}
        {activeTab === "phases" && <ConstructionPhases project={project} />}
        {activeTab === "bom" && <BOMTable project={project} />}
        {activeTab === "costs" && <CostSummary project={project} />}
      </div>
    </div>
  );
}

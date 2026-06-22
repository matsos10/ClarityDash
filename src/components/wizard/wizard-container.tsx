"use client";

import { useProjectStore } from "@/lib/store/project-store";
import { UploadStep } from "@/components/upload/upload-step";
import { ParameterStep } from "@/components/parameters/parameter-step";
import { ProjectStep } from "@/components/project/project-step";
import { Check } from "lucide-react";

const STEPS = [
  { label: "Plan", description: "Upload du plan" },
  { label: "Paramètres", description: "Dimensions & options" },
  { label: "Projet", description: "Résultats & export" },
];

export function WizardContainer() {
  const { currentStep, setStep, project } = useProjectStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <nav className="flex items-center justify-center">
          {STEPS.map((step, idx) => {
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep;
            const isClickable = idx <= currentStep || (idx === 2 && project);
            return (
              <div key={step.label} className="flex items-center">
                <button
                  onClick={() => isClickable && setStep(idx)}
                  disabled={!isClickable}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-md"
                      : isCompleted
                        ? "bg-primary/10 text-primary cursor-pointer"
                        : isClickable
                          ? "bg-muted text-muted-foreground cursor-pointer hover:bg-muted/80"
                          : "bg-muted/50 text-muted-foreground/50 cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      isActive
                        ? "bg-white text-primary"
                        : isCompleted
                          ? "bg-primary text-white"
                          : "bg-muted-foreground/20 text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <div className="text-left hidden sm:block">
                    <div className="text-sm font-semibold">{step.label}</div>
                    <div
                      className={`text-xs ${isActive ? "text-white/80" : "text-muted-foreground"}`}
                    >
                      {step.description}
                    </div>
                  </div>
                </button>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${isCompleted ? "bg-primary" : "bg-border"}`}
                  />
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="min-h-[60vh]">
        {currentStep === 0 && <UploadStep />}
        {currentStep === 1 && <ParameterStep />}
        {currentStep === 2 && <ProjectStep />}
      </div>
    </div>
  );
}

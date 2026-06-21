import { create } from "zustand";
import type { ProjectParameters } from "@/types/parameters";
import { DEFAULT_PARAMETERS } from "@/types/parameters";
import type { LSFProject } from "@/types/project";
import type { PlanFile } from "@/types/project";
import { calculateProject } from "@/lib/calculations";

interface ProjectStore {
  currentStep: number;
  setStep: (step: number) => void;

  planFile: PlanFile | null;
  setPlanFile: (file: PlanFile) => void;
  clearPlanFile: () => void;

  parameters: ProjectParameters;
  updateParameters: (partial: Partial<ProjectParameters>) => void;
  resetParameters: () => void;

  project: LSFProject | null;
  generateProject: () => void;
  clearProject: () => void;

  isGenerating: boolean;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  currentStep: 0,
  setStep: (step) => set({ currentStep: step }),

  planFile: null,
  setPlanFile: (file) => set({ planFile: file }),
  clearPlanFile: () => set({ planFile: null }),

  parameters: { ...DEFAULT_PARAMETERS },
  updateParameters: (partial) =>
    set((state) => ({
      parameters: { ...state.parameters, ...partial },
    })),
  resetParameters: () => set({ parameters: { ...DEFAULT_PARAMETERS } }),

  project: null,
  isGenerating: false,

  generateProject: () => {
    set({ isGenerating: true });

    setTimeout(() => {
      const state = get();
      const { parameters, planFile } = state;
      const result = calculateProject(parameters);

      const project: LSFProject = {
        id: `proj-${Date.now()}`,
        name: parameters.projectName,
        createdAt: new Date(),
        parameters,
        planFile: planFile ?? undefined,
        phases: result.phases,
        bom: result.bom,
        totalCost: result.totalCost,
        totalArea: parameters.totalFloorArea * parameters.numberOfFloors,
      };

      set({ project, isGenerating: false, currentStep: 2 });
    }, 500);
  },

  clearProject: () => set({ project: null }),
}));

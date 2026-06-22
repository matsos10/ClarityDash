import { create } from "zustand";
import type { ProjectParameters } from "@/types/parameters";
import { DEFAULT_PARAMETERS } from "@/types/parameters";
import type { LSFProject } from "@/types/project";
import type { PlanFile } from "@/types/project";
import type { PlanAnalysisResult } from "@/types/analysis";
import type { AIProvider } from "@/lib/ai/types";
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

  selectedProvider: AIProvider;
  availableProviders: AIProvider[];
  setProvider: (provider: AIProvider) => void;
  fetchProviders: () => Promise<void>;

  analysisResult: PlanAnalysisResult | null;
  isAnalyzing: boolean;
  analysisError: string | null;
  detectedFields: Set<string>;
  analyzePlan: () => Promise<void>;
  applyAnalysis: () => void;
  clearAnalysis: () => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  currentStep: 0,
  setStep: (step) => set({ currentStep: step }),

  planFile: null,
  setPlanFile: (file) =>
    set({ planFile: file, analysisResult: null, analysisError: null, detectedFields: new Set() }),
  clearPlanFile: () =>
    set({ planFile: null, analysisResult: null, analysisError: null, detectedFields: new Set() }),

  parameters: { ...DEFAULT_PARAMETERS },
  updateParameters: (partial) =>
    set((state) => ({
      parameters: { ...state.parameters, ...partial },
    })),
  resetParameters: () =>
    set({ parameters: { ...DEFAULT_PARAMETERS }, detectedFields: new Set() }),

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

  selectedProvider: "anthropic",
  availableProviders: [],
  setProvider: (provider) => set({ selectedProvider: provider }),
  fetchProviders: async () => {
    try {
      const res = await fetch("/api/analyze-plan");
      const data = await res.json();
      const providers: AIProvider[] = data.providers ?? [];
      set({
        availableProviders: providers,
        selectedProvider: providers[0] ?? "anthropic",
      });
    } catch {
      set({ availableProviders: [] });
    }
  },

  analysisResult: null,
  isAnalyzing: false,
  analysisError: null,
  detectedFields: new Set(),

  analyzePlan: async () => {
    const { planFile, selectedProvider } = get();
    if (!planFile) return;

    set({ isAnalyzing: true, analysisError: null });

    try {
      const res = await fetch("/api/analyze-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataUrl: planFile.dataUrl,
          fileType: planFile.type,
          provider: selectedProvider,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        set({ isAnalyzing: false, analysisError: data.error });
        return;
      }

      set({
        isAnalyzing: false,
        analysisResult: data.analysis,
      });
    } catch (err) {
      set({
        isAnalyzing: false,
        analysisError:
          err instanceof Error ? err.message : "Erreur de connexion",
      });
    }
  },

  applyAnalysis: () => {
    const { analysisResult } = get();
    if (!analysisResult) return;

    const detected = new Set<string>();
    const updates: Partial<ProjectParameters> = {};

    if (analysisResult.projectName && analysisResult.projectName !== "Mon Projet LSF") {
      updates.projectName = analysisResult.projectName;
      detected.add("projectName");
    }

    if (analysisResult.totalFloorArea) {
      updates.totalFloorArea = Math.round(analysisResult.totalFloorArea);
      detected.add("totalFloorArea");
    }

    if (analysisResult.numberOfFloors) {
      updates.numberOfFloors = analysisResult.numberOfFloors;
      detected.add("numberOfFloors");
    }

    if (analysisResult.perimeterLength) {
      updates.perimeterLength = Math.round(analysisResult.perimeterLength);
      detected.add("perimeterLength");
    }

    if (analysisResult.interiorWallLength) {
      updates.interiorWallLength = Math.round(analysisResult.interiorWallLength);
      detected.add("interiorWallLength");
    }

    if (analysisResult.wallHeight) {
      const closest = [2500, 2700, 3000, 3300].reduce((prev, curr) =>
        Math.abs(curr - analysisResult.wallHeight!) < Math.abs(prev - analysisResult.wallHeight!)
          ? curr
          : prev,
      );
      updates.wallHeight = closest;
      detected.add("wallHeight");
    }

    if (analysisResult.windows && analysisResult.windows.length > 0) {
      updates.windows = analysisResult.windows.map((w) => ({
        width: w.width,
        height: w.height,
        quantity: w.quantity,
      }));
      detected.add("windows");
    }

    if (analysisResult.doors && analysisResult.doors.length > 0) {
      updates.doors = analysisResult.doors.map((d) => ({
        width: d.width,
        height: d.height,
        quantity: d.quantity,
        isExterior: d.isExterior,
      }));
      detected.add("doors");
    }

    if (analysisResult.roofType) {
      updates.roofType = analysisResult.roofType;
      detected.add("roofType");
    }

    if (analysisResult.roofPitch) {
      updates.roofPitch = analysisResult.roofPitch;
      detected.add("roofPitch");
    }

    set((state) => ({
      parameters: { ...state.parameters, ...updates },
      detectedFields: detected,
      currentStep: 1,
    }));
  },

  clearAnalysis: () =>
    set({ analysisResult: null, analysisError: null, detectedFields: new Set() }),
}));

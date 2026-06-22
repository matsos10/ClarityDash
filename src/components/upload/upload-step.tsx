"use client";

import { useCallback, useEffect, useState } from "react";
import { useProjectStore } from "@/lib/store/project-store";
import { AI_PROVIDERS } from "@/lib/ai/types";
import {
  Upload,
  FileImage,
  X,
  ArrowRight,
  ScanSearch,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Home,
  DoorOpen,
  SquareIcon,
  Ruler,
  Bot,
} from "lucide-react";

export function UploadStep() {
  const {
    planFile,
    setPlanFile,
    clearPlanFile,
    setStep,
    analyzePlan,
    applyAnalysis,
    analysisResult,
    isAnalyzing,
    analysisError,
    selectedProvider,
    availableProviders,
    setProvider,
    fetchProviders,
  } = useProjectStore();
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setPlanFile({
          name: file.name,
          type: file.type,
          dataUrl: e.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    },
    [setPlanFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const totalWindows =
    analysisResult?.windows?.reduce((s, w) => s + w.quantity, 0) ?? 0;
  const totalDoors =
    analysisResult?.doors?.reduce((s, d) => s + d.quantity, 0) ?? 0;
  const extDoors =
    analysisResult?.doors
      ?.filter((d) => d.isExterior)
      .reduce((s, d) => s + d.quantity, 0) ?? 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">
          Charger le plan d&apos;architecture
        </h2>
        <p className="text-muted-foreground mt-2">
          Chargez votre plan en PDF ou image. L&apos;IA analysera
          automatiquement le plan pour extraire les dimensions, pièces, fenêtres
          et portes.
        </p>
      </div>

      {!planFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50"
          }`}
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground">
            Glissez-déposez votre plan ici
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            ou cliquez pour parcourir (PDF, PNG, JPG)
          </p>
          <input
            id="file-input"
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Plan preview */}
          <div className="border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileImage className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{planFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {planFile.type}
                  </p>
                </div>
              </div>
              <button
                onClick={clearPlanFile}
                className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {planFile.type.startsWith("image/") && (
              <div className="rounded-lg overflow-hidden border border-border bg-muted/30">
                <img
                  src={planFile.dataUrl}
                  alt="Plan d'architecture"
                  className="w-full h-auto max-h-80 object-contain"
                />
              </div>
            )}
            {planFile.type === "application/pdf" && (
              <div className="rounded-lg border border-border bg-muted/30 p-8 text-center">
                <FileImage className="mx-auto h-16 w-16 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Aperçu PDF chargé</p>
              </div>
            )}
          </div>

          {/* Analysis section */}
          {!analysisResult && !isAnalyzing && (
            <div className="border border-primary/30 rounded-xl p-6 bg-primary/5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-shrink-0 p-3 rounded-full bg-primary/10">
                    <ScanSearch className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-semibold text-foreground">
                      Analyser le plan avec l&apos;IA
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      L&apos;IA va scanner votre plan pour détecter les pièces,
                      fenêtres, portes, dimensions et pré-remplir les paramètres
                      automatiquement.
                    </p>
                  </div>
                </div>

                {/* Provider selector */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-foreground mb-1.5 flex items-center gap-1">
                      <Bot className="h-3.5 w-3.5" />
                      Modèle d&apos;IA
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {AI_PROVIDERS.map((p) => {
                        const isAvailable = availableProviders.includes(p.id);
                        const isSelected = selectedProvider === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => isAvailable && setProvider(p.id)}
                            disabled={!isAvailable}
                            className={`relative text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                              isSelected
                                ? "border-primary bg-white ring-2 ring-primary/20"
                                : isAvailable
                                  ? "border-border bg-white hover:border-primary/50 cursor-pointer"
                                  : "border-border/50 bg-muted/30 opacity-50 cursor-not-allowed"
                            }`}
                          >
                            <div className="font-medium text-foreground">
                              {p.name}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {isAvailable ? p.description : "Clé API non configurée"}
                            </div>
                            {isSelected && isAvailable && (
                              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  onClick={analyzePlan}
                  disabled={availableProviders.length === 0}
                  className="w-full sm:w-auto self-end flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ScanSearch className="h-4 w-4" />
                  Analyser le plan
                </button>
              </div>

              {availableProviders.length === 0 && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Aucune clé API configurée
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      Ajoutez au moins une clé dans votre fichier{" "}
                      <code className="bg-amber-100 px-1 rounded">.env.local</code> :
                      <br />
                      <code className="text-[11px]">ANTHROPIC_API_KEY=sk-ant-...</code>{" "}
                      ou{" "}
                      <code className="text-[11px]">OPENAI_API_KEY=sk-...</code>{" "}
                      ou{" "}
                      <code className="text-[11px]">DEEPSEEK_API_KEY=sk-...</code>
                    </p>
                  </div>
                </div>
              )}

              {analysisError && (
                <div className="mt-4 flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">
                      Erreur d&apos;analyse
                    </p>
                    <p className="text-sm text-destructive/80">
                      {analysisError}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading state */}
          {isAnalyzing && (
            <div className="border border-primary/30 rounded-xl p-8 bg-primary/5 text-center">
              <Loader2 className="mx-auto h-10 w-10 text-primary animate-spin mb-4" />
              <h3 className="font-semibold text-foreground">
                Analyse en cours...
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                L&apos;IA examine votre plan d&apos;architecture pour détecter
                les éléments constructifs. Cela peut prendre quelques secondes.
              </p>
            </div>
          )}

          {/* Analysis results */}
          {analysisResult && (
            <div className="border border-green-300 rounded-xl p-6 bg-green-50">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">
                  Analyse terminée
                </h3>
              </div>

              {/* Detected rooms */}
              {analysisResult.detectedRooms.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-1.5">
                    <Home className="h-4 w-4" />
                    Pièces détectées ({analysisResult.detectedRooms.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.detectedRooms.map((room, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-sm text-green-800 border border-green-200"
                      >
                        {room.name}
                        {room.estimatedArea && (
                          <span className="text-green-600">
                            ~{room.estimatedArea}m²
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {analysisResult.totalFloorArea && (
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-1 text-xs text-green-700 mb-1">
                      <SquareIcon className="h-3 w-3" />
                      Surface
                    </div>
                    <p className="font-semibold text-green-900">
                      {analysisResult.totalFloorArea} m²
                    </p>
                  </div>
                )}
                {analysisResult.perimeterLength && (
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-1 text-xs text-green-700 mb-1">
                      <Ruler className="h-3 w-3" />
                      Périmètre
                    </div>
                    <p className="font-semibold text-green-900">
                      {analysisResult.perimeterLength} m
                    </p>
                  </div>
                )}
                {totalWindows > 0 && (
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-1 text-xs text-green-700 mb-1">
                      <SquareIcon className="h-3 w-3" />
                      Fenêtres
                    </div>
                    <p className="font-semibold text-green-900">
                      {totalWindows} unité(s)
                    </p>
                  </div>
                )}
                {totalDoors > 0 && (
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="flex items-center gap-1 text-xs text-green-700 mb-1">
                      <DoorOpen className="h-3 w-3" />
                      Portes
                    </div>
                    <p className="font-semibold text-green-900">
                      {totalDoors} ({extDoors} ext.)
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {analysisResult.notes && (
                <div className="bg-white rounded-lg p-3 border border-green-200 mb-4">
                  <p className="text-sm text-green-800">
                    <span className="font-medium">Notes : </span>
                    {analysisResult.notes}
                  </p>
                </div>
              )}

              <button
                onClick={applyAnalysis}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                Appliquer et continuer aux paramètres
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setStep(1)}
          className="flex items-center gap-2 px-6 py-3 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
        >
          {planFile ? "Passer sans analyser" : "Passer cette étape"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

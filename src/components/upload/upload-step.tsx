"use client";

import { useCallback, useState } from "react";
import { useProjectStore } from "@/lib/store/project-store";
import { Upload, FileImage, X, ArrowRight } from "lucide-react";

export function UploadStep() {
  const { planFile, setPlanFile, clearPlanFile, setStep } = useProjectStore();
  const [isDragging, setIsDragging] = useState(false);

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">
          Charger le plan d&apos;architecture
        </h2>
        <p className="text-muted-foreground mt-2">
          Chargez votre plan en PDF ou image pour référence visuelle.
          Cette étape est optionnelle — vous pouvez passer directement aux
          paramètres.
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
                className="w-full h-auto max-h-96 object-contain"
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
      )}

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setStep(1)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          {planFile ? "Continuer" : "Passer cette étape"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

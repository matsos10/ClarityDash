"use client";

import { useState } from "react";
import type { LSFProject } from "@/types/project";
import { generateProjectPDF } from "@/lib/export/pdf-generator";
import { Download, Loader2 } from "lucide-react";

export function PDFExportButton({ project }: { project: LSFProject }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await generateProjectPDF(project);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.name.replace(/\s+/g, "_")}_LSF_Projet.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Export...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Exporter PDF
        </>
      )}
    </button>
  );
}

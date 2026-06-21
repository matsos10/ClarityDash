import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { LSFProject } from "@/types/project";
import { CATEGORY_LABELS } from "@/types/materials";
import type { MaterialCategory } from "@/types/materials";

export async function generateProjectPDF(project: LSFProject): Promise<Blob> {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;

  addCoverPage(doc, project, pageWidth, margin);
  doc.addPage();
  addParametersSummary(doc, project, pageWidth, margin);
  doc.addPage();
  addConstructionPhases(doc, project, pageWidth, margin);
  doc.addPage();
  addBOMTable(doc, project, margin);
  doc.addPage();
  addCostSummary(doc, project, pageWidth, margin);

  return doc.output("blob");
}

function addCoverPage(
  doc: jsPDF,
  project: LSFProject,
  pageWidth: number,
  margin: number,
) {
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageWidth, 80, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.text("ClarityDash", margin, 35);
  doc.setFontSize(14);
  doc.text("Projet de Construction LSF", margin, 50);

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.text(project.name, margin, 105);

  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  const date = project.createdAt.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(`Date : ${date}`, margin, 120);

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  const summaryY = 145;
  const summaryData = [
    ["Surface totale", `${project.totalArea} m²`],
    ["Nombre d'étages", `${project.parameters.numberOfFloors}`],
    ["Type de toiture", project.parameters.roofType],
    ["Coût total estimé", `${project.totalCost.toLocaleString("fr-FR")} €`],
    [
      "Coût au m²",
      `${Math.ceil(project.totalCost / project.totalArea).toLocaleString("fr-FR")} €/m²`,
    ],
  ];

  autoTable(doc, {
    startY: summaryY,
    head: [["Paramètre", "Valeur"]],
    body: summaryData,
    margin: { left: margin, right: margin },
    theme: "grid",
    headStyles: { fillColor: [30, 64, 175] },
    styles: { fontSize: 11 },
  });
}

function addParametersSummary(
  doc: jsPDF,
  project: LSFProject,
  _pageWidth: number,
  margin: number,
) {
  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175);
  doc.text("Paramètres du projet", margin, 25);

  const p = project.parameters;
  const data = [
    ["Nom du projet", p.projectName],
    ["Surface par étage", `${p.totalFloorArea} m²`],
    ["Nombre d'étages", `${p.numberOfFloors}`],
    ["Hauteur des murs", `${p.wallHeight} mm`],
    ["Périmètre extérieur", `${p.perimeterLength} m`],
    ["Cloisons intérieures", `${p.interiorWallLength} m`],
    ["Profil montant", p.studProfile],
    ["Épaisseur acier", `${p.steelThickness} mm`],
    ["Entraxe montants", `${p.studSpacing} mm`],
    ["Type de toiture", p.roofType],
    ["Pente toiture", `${p.roofPitch}°`],
    ["Type fondation", p.foundationType],
    ["Type isolation", p.insulationType],
    ["Épaisseur isolation", `${p.insulationThickness} mm`],
    ["Bardage extérieur", p.exteriorCladding],
    ["Revêtement intérieur", p.interiorCladding],
    ["Fenêtres", `${p.windows.reduce((s, w) => s + w.quantity, 0)} unités`],
    [
      "Portes",
      `${p.doors.reduce((s, d) => s + d.quantity, 0)} unités (${p.doors.filter((d) => d.isExterior).reduce((s, d) => s + d.quantity, 0)} ext.)`,
    ],
  ];

  autoTable(doc, {
    startY: 35,
    head: [["Paramètre", "Valeur"]],
    body: data,
    margin: { left: margin, right: margin },
    theme: "striped",
    headStyles: { fillColor: [30, 64, 175] },
    styles: { fontSize: 10 },
  });
}

function addConstructionPhases(
  doc: jsPDF,
  project: LSFProject,
  _pageWidth: number,
  margin: number,
) {
  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175);
  doc.text("Phases de construction", margin, 25);

  let y = 35;

  for (const phase of project.phases) {
    if (y > 250) {
      doc.addPage();
      y = 25;
    }

    doc.setFontSize(13);
    doc.setTextColor(30, 64, 175);
    doc.text(`${phase.order}. ${phase.name}`, margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Durée estimée : ${phase.duration}`, margin, y);
    y += 5;

    doc.setTextColor(60, 60, 60);
    doc.text(phase.description, margin, y, {
      maxWidth: 180,
    });
    y += 8;

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    for (const task of phase.tasks) {
      if (y > 275) {
        doc.addPage();
        y = 25;
      }
      doc.text(`  • ${task}`, margin + 2, y);
      y += 5;
    }

    doc.setFontSize(10);
    doc.setTextColor(30, 64, 175);
    doc.text(
      `Coût phase : ${phase.phaseCost.toLocaleString("fr-FR")} €`,
      margin,
      y,
    );
    y += 10;
  }
}

function addBOMTable(doc: jsPDF, project: LSFProject, margin: number) {
  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175);
  doc.text("Devis quantitatif (BOM)", margin, 25);

  const categories = Object.keys(CATEGORY_LABELS) as MaterialCategory[];
  let startY = 35;

  for (const cat of categories) {
    const items = project.bom.items.filter((i) => i.category === cat);
    if (items.length === 0) continue;

    if (startY > 240) {
      doc.addPage();
      startY = 25;
    }

    doc.setFontSize(12);
    doc.setTextColor(30, 64, 175);
    doc.text(CATEGORY_LABELS[cat], margin, startY);
    startY += 2;

    const tableData = items.map((item) => [
      item.name,
      item.specifications ?? "",
      item.quantity.toString(),
      item.unit,
      `${item.unitPrice.toFixed(2)} €`,
      `${item.totalPrice.toFixed(2)} €`,
    ]);

    autoTable(doc, {
      startY,
      head: [["Article", "Spécifications", "Qté", "Unité", "P.U.", "Total"]],
      body: tableData,
      margin: { left: margin, right: margin },
      theme: "striped",
      headStyles: { fillColor: [30, 64, 175], fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 45 },
        4: { halign: "right" },
        5: { halign: "right" },
      },
    });

    startY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY + 8;
  }
}

function addCostSummary(
  doc: jsPDF,
  project: LSFProject,
  _pageWidth: number,
  margin: number,
) {
  doc.setFontSize(18);
  doc.setTextColor(30, 64, 175);
  doc.text("Récapitulatif des coûts", margin, 25);

  const categories = Object.keys(CATEGORY_LABELS) as MaterialCategory[];
  const data = categories
    .filter((cat) => project.bom.costByCategory[cat] > 0)
    .map((cat) => {
      const cost = project.bom.costByCategory[cat];
      const pct = ((cost / project.bom.totalCost) * 100).toFixed(1);
      return [CATEGORY_LABELS[cat], `${cost.toLocaleString("fr-FR")} €`, `${pct}%`];
    });

  data.push([
    "TOTAL",
    `${project.bom.totalCost.toLocaleString("fr-FR")} €`,
    "100%",
  ]);

  autoTable(doc, {
    startY: 35,
    head: [["Catégorie", "Coût", "% du total"]],
    body: data,
    margin: { left: margin, right: margin },
    theme: "grid",
    headStyles: { fillColor: [30, 64, 175] },
    styles: { fontSize: 11 },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
    },
    didParseCell: (hookData) => {
      if (hookData.row.index === data.length - 1) {
        hookData.cell.styles.fontStyle = "bold";
        hookData.cell.styles.fillColor = [241, 245, 249];
      }
    },
  });
}

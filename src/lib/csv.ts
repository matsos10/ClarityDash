type Cell = string | number | boolean | Date | null | undefined | { toString(): string };

function cell(v: Cell): string {
  if (v == null) return "";
  const s = v instanceof Date ? v.toISOString() : String(v);
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV RFC 4180 avec BOM UTF-8 (import direct dans Google Sheets / Excel). */
export function toCsv(header: string[], rows: Cell[][]): string {
  return "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}

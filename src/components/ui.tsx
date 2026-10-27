import type { Domain } from "@prisma/client";
import Link from "next/link";
import type { ReactNode } from "react";
import { DOMAIN_COLOR, DOMAIN_LABEL } from "@/lib/labels";

export function PageHeader({ title, sub, right, back }: { title: string; sub?: ReactNode; right?: ReactNode; back?: string }) {
  return (
    <header className="mb-4 flex items-end justify-between gap-3">
      <div className="min-w-0">
        {back && (
          <Link href={back} className="mb-1 block text-xs text-muted">
            ← Retour
          </Link>
        )}
        <h1 className="truncate text-xl font-semibold">{title}</h1>
        {sub && <div className="text-sm text-muted">{sub}</div>}
      </div>
      {right}
    </header>
  );
}

export function Section({ title, right, children, className = "" }: { title?: string; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card mb-3 ${className}`}>
      {(title || right) && (
        <div className="mb-2 flex items-center justify-between gap-2">
          {title && <h2 className="h2 mb-0">{title}</h2>}
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function DomainDot({ domain }: { domain: Domain }) {
  return <span title={DOMAIN_LABEL[domain]} className={`inline-block h-2 w-2 shrink-0 rounded-full ${DOMAIN_COLOR[domain]}`} />;
}

export function Badge({ tone = "muted", children }: { tone?: "muted" | "good" | "bad" | "warn" | "accent"; children: ReactNode }) {
  const cls = {
    muted: "bg-line text-muted",
    good: "bg-good/15 text-good",
    bad: "bg-bad/15 text-bad",
    warn: "bg-warn/15 text-warn",
    accent: "bg-accent/15 text-accent",
  }[tone];
  return <span className={`badge ${cls}`}>{children}</span>;
}

export function Progress({ value, tone = "accent" }: { value: number; tone?: "accent" | "good" | "bad" | "warn" }) {
  const bg = { accent: "bg-accent", good: "bg-good", bad: "bg-bad", warn: "bg-warn" }[tone];
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
      <div className={`h-full ${bg}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: "good" | "bad" | "warn" }) {
  const c = tone ? { good: "text-good", bad: "text-bad", warn: "text-warn" }[tone] : "";
  return (
    <div className="min-w-0">
      <div className="truncate text-[11px] text-muted">{label}</div>
      <div className={`num truncate text-base font-semibold ${c}`}>{value}</div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-2 text-sm text-muted">{children}</p>;
}

export function scoreTone(s: number): "good" | "warn" | "bad" {
  return s >= 0.7 ? "good" : s >= 0.4 ? "warn" : "bad";
}

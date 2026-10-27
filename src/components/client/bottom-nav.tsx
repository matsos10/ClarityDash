"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CaptureButton } from "./capture";

const tabs = [
  { href: "/today", label: "Aujourd'hui", icon: "M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0-1.414-1.414M7.05 7.05 5.636 5.636M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" },
  { href: "/week", label: "Semaine", icon: "M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" },
  null,
  { href: "/trading", label: "Trading", icon: "M3 17l6-6 4 4 8-8M15 7h6v6" },
  { href: "/more", label: "Plus", icon: "M4 6h16M4 12h16M4 18h16" },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {tabs.map((t, i) =>
          t ? (
            <li key={t.href}>
              <Link
                href={t.href}
                className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] ${path.startsWith(t.href) ? "text-accent" : "text-muted"}`}
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d={t.icon} />
                </svg>
                {t.label}
              </Link>
            </li>
          ) : (
            <li key={i} className="flex items-center justify-center">
              <CaptureButton />
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}

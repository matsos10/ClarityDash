"use client";

import Link from "next/link";
import { Building2 } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">
              ClarityDash
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Accueil
            </Link>
            <Link
              href="/project"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Nouveau Projet
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

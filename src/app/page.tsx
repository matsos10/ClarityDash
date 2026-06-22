import Link from "next/link";
import {
  Building2,
  Upload,
  Calculator,
  FileDown,
  ArrowRight,
  Layers,
  Shield,
  Ruler,
} from "lucide-react";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Building2 className="h-4 w-4" />
            Construction LSF (Light Steel Framing)
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
            Du plan d&apos;architecte au
            <br />
            <span className="text-primary">projet de construction complet</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            ClarityDash transforme votre plan d&apos;architecture en un projet LSF
            détaillé : phases de construction, liste complète des matériaux,
            quantités précises et estimation des coûts.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/project"
              className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
            >
              Créer un projet
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-foreground mb-12">
            Comment ça marche
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Upload,
                title: "1. Chargez votre plan",
                desc: "Importez votre plan d'architecture en PDF ou image comme référence visuelle.",
              },
              {
                icon: Calculator,
                title: "2. Définissez les paramètres",
                desc: "Renseignez les dimensions, le type de structure, la toiture, les matériaux et les menuiseries.",
              },
              {
                icon: FileDown,
                title: "3. Obtenez votre projet",
                desc: "Recevez un projet complet : phases, devis quantitatif, coûts et export PDF professionnel.",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="text-center p-6 rounded-xl border border-border bg-white"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-foreground mb-12">
            Tout pour votre projet LSF
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Layers,
                title: "10 phases de construction",
                desc: "De la fondation aux finitions, chaque étape est détaillée avec ses tâches et matériaux.",
              },
              {
                icon: Ruler,
                title: "Calculs précis",
                desc: "Montants, rails, entraxe, linteaux, entretoises — toutes les quantités sont calculées selon les normes LSF.",
              },
              {
                icon: Shield,
                title: "Catalogue complet",
                desc: "Profilés C89/C150/C200, isolation, bardage, plâtre, fixations, étanchéité et menuiseries.",
              },
              {
                icon: Calculator,
                title: "Estimation des coûts",
                desc: "Prix unitaires réalistes pour chaque poste, avec répartition par catégorie et par phase.",
              },
              {
                icon: Building2,
                title: "Multi-étage",
                desc: "Support des constructions R+1 et R+2 avec calcul automatique du plancher intermédiaire.",
              },
              {
                icon: FileDown,
                title: "Export PDF professionnel",
                desc: "Exportez l'intégralité du projet en document PDF prêt à partager avec vos équipes.",
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="p-5 rounded-xl border border-border bg-white"
              >
                <feat.icon className="h-6 w-6 text-primary mb-3" />
                <h3 className="font-semibold text-foreground mb-1">
                  {feat.title}
                </h3>
                <p className="text-sm text-muted-foreground">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Prêt à démarrer ?
          </h2>
          <p className="text-muted-foreground mb-8">
            Créez votre premier projet LSF en quelques minutes.
          </p>
          <Link
            href="/project"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
          >
            Nouveau projet
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

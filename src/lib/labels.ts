import type { Domain, ObjectiveArea, ProjectStatus } from "@prisma/client";

export const DOMAIN_LABEL: Record<Domain, string> = {
  BUSINESS: "Business",
  TRADING: "Trading",
  HOME: "Maison",
  FAMILY: "Famille",
  PERSONAL: "Perso",
};

export const DOMAIN_COLOR: Record<Domain, string> = {
  BUSINESS: "bg-blue-500",
  TRADING: "bg-amber-500",
  HOME: "bg-emerald-600",
  FAMILY: "bg-pink-500",
  PERSONAL: "bg-violet-500",
};

export const AREA_LABEL: Record<ObjectiveArea, string> = {
  AUTONOMOUS_INCOME: "Revenu autonome",
  DREAM_PROPERTY: "Propriété de rêve",
  NET_WORTH: "Patrimoine net",
  HEALTH: "Santé",
  SOCIAL_IMPACT: "Impact social",
};

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  ACTIVE: "En cours",
  WAITING: "En attente",
  BLOCKED: "Bloqué",
  DONE: "Terminé",
  ARCHIVED: "Archivé",
};

export const DAY_SHORT = ["L", "M", "M", "J", "V", "S", "D"];

export const EMOTION_LABEL: Record<string, string> = {
  CALM: "Calme",
  CONFIDENT: "Confiant",
  FOMO: "FOMO",
  FEAR: "Peur",
  REVENGE: "Revanche",
  BORED: "Ennui",
  TIRED: "Fatigue",
  EUPHORIC: "Euphorie",
};

export const eur = (n: number, currency = "EUR") =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);

export const money = (n: number, currency = "USD") =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);

export const signed = (n: number, currency = "USD") => (n > 0 ? "+" : "") + money(n, currency);

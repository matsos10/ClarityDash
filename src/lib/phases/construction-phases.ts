import type { ProjectParameters } from "@/types/parameters";

export interface PhaseDefinition {
  id: string;
  order: number;
  name: string;
  description: string;
  duration: string;
  tasks: string[];
  materialPhases: string[];
  condition?: (params: ProjectParameters) => boolean;
}

export const PHASE_DEFINITIONS: PhaseDefinition[] = [
  {
    id: "foundation",
    order: 1,
    name: "Préparation du site et fondation",
    description:
      "Terrassement, mise en place des fondations et ancrage pour la structure LSF.",
    duration: "2-3 semaines",
    tasks: [
      "Nettoyage et nivellement du terrain",
      "Implantation et traçage des fondations",
      "Terrassement et excavation",
      "Mise en place du film anti-humidité (DPM)",
      "Pose du hérisson (gravier tout-venant)",
      "Coulage du béton de fondation",
      "Mise en place des boulons d'ancrage",
      "Temps de séchage (minimum 7 jours)",
    ],
    materialPhases: ["Fondation"],
  },
  {
    id: "ground-floor-framing",
    order: 2,
    name: "Ossature du rez-de-chaussée",
    description:
      "Montage des panneaux muraux LSF du rez-de-chaussée : murs extérieurs et cloisons intérieures.",
    duration: "1-2 semaines",
    tasks: [
      "Pose des rails bas (lisses basses) sur la fondation",
      "Montage des panneaux de murs extérieurs",
      "Montage des cloisons intérieures",
      "Installation des contreventements (feuillards diagonaux)",
      "Aplomb et alignement de tous les murs",
      "Fixation des équerres de maintien",
      "Pose des entretoises horizontales",
    ],
    materialPhases: ["Ossature murale"],
  },
  {
    id: "upper-floor-system",
    order: 3,
    name: "Plancher de l'étage",
    description:
      "Installation du système de plancher intermédiaire avec solives acier et plancher OSB.",
    duration: "1 semaine",
    tasks: [
      "Pose des rails de rive périphériques",
      "Mise en place des solives de plancher",
      "Installation des entretoises de solives",
      "Pose des raidisseurs d'âme aux appuis",
      "Fixation du plancher OSB 18mm",
    ],
    materialPhases: ["Plancher étage"],
    condition: (p) => p.numberOfFloors > 1,
  },
  {
    id: "upper-floor-framing",
    order: 4,
    name: "Ossature de l'étage",
    description:
      "Montage de l'ossature murale de l'étage supérieur.",
    duration: "1-2 semaines",
    tasks: [
      "Pose des rails bas sur le plancher",
      "Montage des panneaux de murs extérieurs d'étage",
      "Montage des cloisons intérieures d'étage",
      "Contreventement et alignement",
    ],
    materialPhases: ["Ossature étage"],
    condition: (p) => p.numberOfFloors > 1,
  },
  {
    id: "roof-structure",
    order: 5,
    name: "Charpente de toiture",
    description:
      "Installation de la structure de toiture en profilés acier.",
    duration: "1-2 semaines",
    tasks: [
      "Pose des rails de chaînage haut",
      "Montage des chevrons / fermes de toiture",
      "Installation de la poutre faîtière",
      "Pose des liteaux / pannes",
      "Contreventement de la charpente",
    ],
    materialPhases: ["Charpente toiture"],
  },
  {
    id: "roof-covering",
    order: 6,
    name: "Couverture et étanchéité toiture",
    description:
      "Mise hors d'eau de la toiture avec volige, membrane et couverture.",
    duration: "1 semaine",
    tasks: [
      "Pose de la volige OSB sur chevrons",
      "Application de la membrane sous-toiture HPV",
      "Pose de la tôle bac acier",
      "Installation des faîtières et solins",
      "Pose du bandeau de rive et habillage",
      "Installation des gouttières et descentes",
    ],
    materialPhases: ["Couverture toiture"],
  },
  {
    id: "exterior-envelope",
    order: 7,
    name: "Enveloppe extérieure",
    description:
      "Fermeture de l'enveloppe avec contreventement OSB, pare-pluie, bardage et menuiseries.",
    duration: "2-3 semaines",
    tasks: [
      "Pose du voile travaillant OSB extérieur",
      "Application de la membrane pare-pluie",
      "Installation du système de bardage extérieur",
      "Pose des bandes d'étanchéité autour des ouvertures",
      "Pose des fenêtres",
      "Pose des portes extérieures",
    ],
    materialPhases: ["Enveloppe extérieure"],
  },
  {
    id: "insulation",
    order: 8,
    name: "Isolation thermique et acoustique",
    description:
      "Mise en place de l'isolation dans les murs, la toiture et le plancher.",
    duration: "1-2 semaines",
    tasks: [
      "Pose de l'isolation dans les cavités des murs extérieurs",
      "Pose de l'isolation de toiture / combles",
      "Pose de l'isolation de plancher bas",
      "Isolation acoustique des cloisons (si applicable)",
      "Pose du pare-vapeur côté intérieur",
    ],
    materialPhases: ["Isolation"],
  },
  {
    id: "interior-finishing",
    order: 9,
    name: "Finitions intérieures",
    description:
      "Pose du plâtre, jointoiement, portes intérieures et habillages.",
    duration: "2-3 semaines",
    tasks: [
      "Pose des plaques de plâtre aux plafonds",
      "Pose des plaques de plâtre aux murs",
      "Pose de la seconde couche (si doublage prévu)",
      "Jointoiement et enduit de finition",
      "Pose des baguettes d'angle",
      "Installation des portes intérieures",
      "Pose des plinthes et chambranles",
    ],
    materialPhases: ["Finitions intérieures"],
  },
  {
    id: "final",
    order: 10,
    name: "Finitions et réception",
    description:
      "Dernières finitions, contrôles et réception du chantier.",
    duration: "1-2 semaines",
    tasks: [
      "Premiers et seconds fixs MEP (électricité, plomberie, CVC)",
      "Revêtements de sol",
      "Peinture et finitions murales",
      "Nettoyage de chantier",
      "Contrôle final et levée de réserves",
      "Réception des travaux",
    ],
    materialPhases: ["Finitions finales"],
  },
];

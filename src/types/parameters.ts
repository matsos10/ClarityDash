export type RoofType = "flat" | "gable" | "hip" | "mono-pitch";
export type FoundationType =
  | "slab-on-grade"
  | "strip-foundation"
  | "pile-foundation";
export type InsulationType = "rock-wool" | "glass-wool" | "eps" | "xps";
export type ExteriorCladding =
  | "fiber-cement"
  | "metal-panel"
  | "etics"
  | "brick-veneer";
export type InteriorCladding =
  | "plasterboard-single"
  | "plasterboard-double"
  | "osb";
export type StudSpacing = 400 | 600;
export type StudProfile = "C89" | "C150" | "C200";

export interface WindowConfig {
  width: number;
  height: number;
  quantity: number;
}

export interface DoorConfig {
  width: number;
  height: number;
  quantity: number;
  isExterior: boolean;
}

export interface ProjectParameters {
  projectName: string;
  totalFloorArea: number;
  numberOfFloors: number;
  wallHeight: number;
  perimeterLength: number;
  interiorWallLength: number;
  studSpacing: StudSpacing;
  steelThickness: number;
  studProfile: StudProfile;
  windows: WindowConfig[];
  doors: DoorConfig[];
  roofType: RoofType;
  roofPitch: number;
  roofOverhang: number;
  foundationType: FoundationType;
  insulationType: InsulationType;
  insulationThickness: number;
  exteriorCladding: ExteriorCladding;
  interiorCladding: InteriorCladding;
  hasVaporBarrier: boolean;
  hasWaterproofingMembrane: boolean;
  hasAcousticInsulation: boolean;
}

export const DEFAULT_PARAMETERS: ProjectParameters = {
  projectName: "Maison LSF",
  totalFloorArea: 120,
  numberOfFloors: 1,
  wallHeight: 2700,
  perimeterLength: 44,
  interiorWallLength: 20,
  studSpacing: 600,
  steelThickness: 1.0,
  studProfile: "C89",
  windows: [{ width: 1200, height: 1400, quantity: 6 }],
  doors: [
    { width: 1000, height: 2100, quantity: 1, isExterior: true },
    { width: 900, height: 2100, quantity: 5, isExterior: false },
  ],
  roofType: "gable",
  roofPitch: 25,
  roofOverhang: 400,
  foundationType: "slab-on-grade",
  insulationType: "rock-wool",
  insulationThickness: 100,
  exteriorCladding: "fiber-cement",
  interiorCladding: "plasterboard-single",
  hasVaporBarrier: true,
  hasWaterproofingMembrane: true,
  hasAcousticInsulation: false,
};

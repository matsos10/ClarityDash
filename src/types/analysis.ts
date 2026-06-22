export interface DetectedRoom {
  name: string;
  estimatedArea: number | null;
}

export interface PlanAnalysisResult {
  projectName: string;
  detectedRooms: DetectedRoom[];
  totalFloorArea: number | null;
  perimeterLength: number | null;
  interiorWallLength: number | null;
  wallHeight: number | null;
  numberOfFloors: number | null;
  windows: { width: number; height: number; quantity: number }[];
  doors: {
    width: number;
    height: number;
    quantity: number;
    isExterior: boolean;
  }[];
  roofType: "gable" | "hip" | "mono-pitch" | "flat" | null;
  roofPitch: number | null;
  buildingWidth: number | null;
  buildingLength: number | null;
  notes: string;
}

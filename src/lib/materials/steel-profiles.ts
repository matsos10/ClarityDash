export interface SteelProfile {
  name: string;
  webDepth: number;
  flangeWidth: number;
  lipLength: number;
  weightPerMeter: Record<number, number>;
  pricePerMeter: Record<number, number>;
  standardLengths: number[];
}

export interface TrackProfile {
  name: string;
  matchesStud: string;
  webDepth: number;
  flangeWidth: number;
  weightPerMeter: Record<number, number>;
  pricePerMeter: Record<number, number>;
}

export const STEEL_PROFILES: Record<string, SteelProfile> = {
  C89: {
    name: "Montant C89",
    webDepth: 89,
    flangeWidth: 43,
    lipLength: 14,
    weightPerMeter: { 0.8: 1.12, 1.0: 1.39, 1.2: 1.66 },
    pricePerMeter: { 0.8: 2.1, 1.0: 2.65, 1.2: 3.2 },
    standardLengths: [2700, 3000, 3600, 4200, 6000],
  },
  C150: {
    name: "Montant C150",
    webDepth: 150,
    flangeWidth: 45,
    lipLength: 15,
    weightPerMeter: { 1.0: 1.94, 1.2: 2.32, 1.5: 2.89, 2.0: 3.83 },
    pricePerMeter: { 1.0: 3.5, 1.2: 4.1, 1.5: 5.2, 2.0: 6.8 },
    standardLengths: [2700, 3000, 3600, 4200, 6000],
  },
  C200: {
    name: "Montant C200",
    webDepth: 200,
    flangeWidth: 50,
    lipLength: 18,
    weightPerMeter: { 1.2: 2.92, 1.5: 3.63, 2.0: 4.82 },
    pricePerMeter: { 1.2: 5.3, 1.5: 6.5, 2.0: 8.5 },
    standardLengths: [3000, 3600, 4200, 6000],
  },
};

export const TRACK_PROFILES: Record<string, TrackProfile> = {
  U89: {
    name: "Rail U89",
    matchesStud: "C89",
    webDepth: 92,
    flangeWidth: 40,
    weightPerMeter: { 0.8: 0.88, 1.0: 1.1, 1.2: 1.31 },
    pricePerMeter: { 0.8: 1.8, 1.0: 2.3, 1.2: 2.8 },
  },
  U150: {
    name: "Rail U150",
    matchesStud: "C150",
    webDepth: 153,
    flangeWidth: 40,
    weightPerMeter: { 1.0: 1.5, 1.2: 1.8, 1.5: 2.24, 2.0: 2.97 },
    pricePerMeter: { 1.0: 2.9, 1.2: 3.5, 1.5: 4.4, 2.0: 5.8 },
  },
  U200: {
    name: "Rail U200",
    matchesStud: "C200",
    webDepth: 203,
    flangeWidth: 40,
    weightPerMeter: { 1.2: 2.25, 1.5: 2.8, 2.0: 3.72 },
    pricePerMeter: { 1.2: 4.5, 1.5: 5.5, 2.0: 7.2 },
  },
};

export function getStudProfile(profileId: string) {
  return STEEL_PROFILES[profileId];
}

export function getMatchingTrack(profileId: string) {
  const trackId = profileId.replace("C", "U");
  return TRACK_PROFILES[trackId];
}

export function getStudPrice(profileId: string, thickness: number): number {
  const profile = STEEL_PROFILES[profileId];
  return profile?.pricePerMeter[thickness] ?? 3.0;
}

export function getTrackPrice(profileId: string, thickness: number): number {
  const trackId = profileId.replace("C", "U");
  const track = TRACK_PROFILES[trackId];
  return track?.pricePerMeter[thickness] ?? 2.5;
}

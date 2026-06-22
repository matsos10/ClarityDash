export const PLAN_ANALYSIS_PROMPT = `Tu es un expert en analyse de plans d'architecture. Analyse ce plan de construction et extrais toutes les informations détectables pour un projet de construction en ossature métallique légère (LSF - Light Steel Framing).

Examine attentivement le plan et identifie :
1. Les pièces (nom et surface estimée en m² si possible)
2. Les fenêtres (dimensions estimées en mm, quantité par type)
3. Les portes (dimensions estimées en mm, quantité, intérieure ou extérieure)
4. La surface totale du plancher (en m²)
5. Le périmètre extérieur du bâtiment (en mètres)
6. La longueur totale des cloisons intérieures (en mètres)
7. Le nombre d'étages visibles
8. La hauteur des murs (en mm) si indiquée
9. Le type de toiture si visible (gable, hip, mono-pitch, flat)
10. La pente de toiture en degrés si visible
11. Les dimensions générales du bâtiment (largeur et longueur en mètres)

RÈGLES IMPORTANTES :
- Retourne UNIQUEMENT un objet JSON valide, sans texte avant ou après
- Pour les valeurs que tu ne peux pas déterminer avec certitude, utilise null
- Les dimensions des fenêtres et portes en MILLIMÈTRES
- Les surfaces en m², les longueurs en mètres
- Sois précis si des cotes sont visibles, sinon estime de façon conservatrice
- Les fenêtres standard font environ 1200x1400mm, les portes 900x2100mm
- Regroupe les fenêtres de même dimension (augmente la quantité)
- Distingue bien les portes extérieures (entrée, terrasse) des intérieures

Format JSON :
{
  "projectName": "string - nom du projet si visible, sinon 'Mon Projet LSF'",
  "detectedRooms": [{"name": "string", "estimatedArea": number|null}],
  "totalFloorArea": number|null,
  "perimeterLength": number|null,
  "interiorWallLength": number|null,
  "wallHeight": number|null,
  "numberOfFloors": number|null,
  "windows": [{"width": number, "height": number, "quantity": number}],
  "doors": [{"width": number, "height": number, "quantity": number, "isExterior": boolean}],
  "roofType": "gable"|"hip"|"mono-pitch"|"flat"|null,
  "roofPitch": number|null,
  "buildingWidth": number|null,
  "buildingLength": number|null,
  "notes": "observations sur le plan, éléments détectés, limites de l'analyse"
}`;

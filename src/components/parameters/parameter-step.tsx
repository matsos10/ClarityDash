"use client";

import { useProjectStore } from "@/lib/store/project-store";
import {
  ArrowLeft,
  Calculator,
  Building2,
  Ruler,
  Home,
  DoorOpen,
  Layers,
  Shield,
  Loader2,
  ScanSearch,
} from "lucide-react";
import type {
  StudProfile,
  StudSpacing,
  RoofType,
  FoundationType,
  InsulationType,
  ExteriorCladding,
  InteriorCladding,
  WindowConfig,
  DoorConfig,
} from "@/types/parameters";

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-xl p-6 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
  detected,
}: {
  label: string;
  children: React.ReactNode;
  detected?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {label}
        {detected && (
          <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
            <ScanSearch className="h-3 w-3" />
            Auto-détecté
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2 border border-input rounded-lg bg-white text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-shadow";
const selectClass = inputClass;

export function ParameterStep() {
  const { parameters, updateParameters, setStep, generateProject, isGenerating, detectedFields } =
    useProjectStore();

  const isDetected = (field: string) => detectedFields.has(field);

  const updateWindow = (index: number, field: keyof WindowConfig, value: number) => {
    const windows = [...parameters.windows];
    windows[index] = { ...windows[index], [field]: value };
    updateParameters({ windows });
  };

  const addWindow = () => {
    updateParameters({
      windows: [...parameters.windows, { width: 1200, height: 1400, quantity: 1 }],
    });
  };

  const removeWindow = (index: number) => {
    updateParameters({
      windows: parameters.windows.filter((_, i) => i !== index),
    });
  };

  const updateDoor = (
    index: number,
    field: keyof DoorConfig,
    value: number | boolean,
  ) => {
    const doors = [...parameters.doors];
    doors[index] = { ...doors[index], [field]: value };
    updateParameters({ doors });
  };

  const addDoor = () => {
    updateParameters({
      doors: [
        ...parameters.doors,
        { width: 900, height: 2100, quantity: 1, isExterior: false },
      ],
    });
  };

  const removeDoor = (index: number) => {
    updateParameters({
      doors: parameters.doors.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">
          Paramètres du projet
        </h2>
        <p className="text-muted-foreground mt-2">
          Renseignez les dimensions et options de votre construction LSF.
        </p>
      </div>

      <div className="space-y-6">
        {/* Project Name */}
        <div className="border border-border rounded-xl p-6 bg-white">
          <Field label="Nom du projet">
            <input
              type="text"
              className={inputClass}
              value={parameters.projectName}
              onChange={(e) => updateParameters({ projectName: e.target.value })}
            />
          </Field>
        </div>

        {/* Building Dimensions */}
        <SectionCard title="Dimensions du bâtiment" icon={Ruler}>
          <Field label="Surface par étage (m²)" detected={isDetected("totalFloorArea")}>
            <input
              type="number"
              className={inputClass}
              value={parameters.totalFloorArea}
              onChange={(e) =>
                updateParameters({ totalFloorArea: Number(e.target.value) })
              }
              min={20}
              max={1000}
            />
          </Field>
          <Field label="Nombre d'étages" detected={isDetected("numberOfFloors")}>
            <select
              className={selectClass}
              value={parameters.numberOfFloors}
              onChange={(e) =>
                updateParameters({ numberOfFloors: Number(e.target.value) })
              }
            >
              <option value={1}>1 (plain-pied)</option>
              <option value={2}>2 (R+1)</option>
              <option value={3}>3 (R+2)</option>
            </select>
          </Field>
          <Field label="Hauteur des murs (mm)" detected={isDetected("wallHeight")}>
            <select
              className={selectClass}
              value={parameters.wallHeight}
              onChange={(e) =>
                updateParameters({ wallHeight: Number(e.target.value) })
              }
            >
              <option value={2500}>2500 mm</option>
              <option value={2700}>2700 mm</option>
              <option value={3000}>3000 mm</option>
              <option value={3300}>3300 mm</option>
            </select>
          </Field>
          <Field label="Périmètre extérieur (m)" detected={isDetected("perimeterLength")}>
            <input
              type="number"
              className={inputClass}
              value={parameters.perimeterLength}
              onChange={(e) =>
                updateParameters({ perimeterLength: Number(e.target.value) })
              }
              min={10}
              max={200}
            />
          </Field>
          <Field label="Longueur cloisons intérieures (m)" detected={isDetected("interiorWallLength")}>
            <input
              type="number"
              className={inputClass}
              value={parameters.interiorWallLength}
              onChange={(e) =>
                updateParameters({ interiorWallLength: Number(e.target.value) })
              }
              min={0}
              max={200}
            />
          </Field>
        </SectionCard>

        {/* Structure */}
        <SectionCard title="Structure LSF" icon={Building2}>
          <Field label="Profil des montants">
            <select
              className={selectClass}
              value={parameters.studProfile}
              onChange={(e) =>
                updateParameters({ studProfile: e.target.value as StudProfile })
              }
            >
              <option value="C89">C89 (cloisons, murs légers)</option>
              <option value="C150">C150 (murs porteurs standard)</option>
              <option value="C200">C200 (murs porteurs, multi-étage)</option>
            </select>
          </Field>
          <Field label="Épaisseur acier (mm)">
            <select
              className={selectClass}
              value={parameters.steelThickness}
              onChange={(e) =>
                updateParameters({ steelThickness: Number(e.target.value) })
              }
            >
              <option value={0.8}>0.8 mm</option>
              <option value={1.0}>1.0 mm</option>
              <option value={1.2}>1.2 mm</option>
              <option value={1.5}>1.5 mm</option>
              <option value={2.0}>2.0 mm</option>
            </select>
          </Field>
          <Field label="Entraxe des montants">
            <select
              className={selectClass}
              value={parameters.studSpacing}
              onChange={(e) =>
                updateParameters({
                  studSpacing: Number(e.target.value) as StudSpacing,
                })
              }
            >
              <option value={400}>400 mm (haute résistance)</option>
              <option value={600}>600 mm (standard)</option>
            </select>
          </Field>
        </SectionCard>

        {/* Roof */}
        <SectionCard title="Toiture" icon={Home}>
          <Field label="Type de toiture" detected={isDetected("roofType")}>
            <select
              className={selectClass}
              value={parameters.roofType}
              onChange={(e) =>
                updateParameters({ roofType: e.target.value as RoofType })
              }
            >
              <option value="gable">À deux pentes (pignon)</option>
              <option value="hip">Quatre pentes (croupe)</option>
              <option value="mono-pitch">Mono-pente (shed)</option>
              <option value="flat">Toit plat</option>
            </select>
          </Field>
          <Field label="Pente (degrés)" detected={isDetected("roofPitch")}>
            <input
              type="number"
              className={inputClass}
              value={parameters.roofPitch}
              onChange={(e) =>
                updateParameters({ roofPitch: Number(e.target.value) })
              }
              min={2}
              max={45}
            />
          </Field>
          <Field label="Débord de toiture (mm)">
            <input
              type="number"
              className={inputClass}
              value={parameters.roofOverhang}
              onChange={(e) =>
                updateParameters({ roofOverhang: Number(e.target.value) })
              }
              min={0}
              max={1000}
            />
          </Field>
        </SectionCard>

        {/* Openings */}
        <div className="border border-border rounded-xl p-6 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <DoorOpen className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Menuiseries
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm text-foreground">
                  Fenêtres
                  {isDetected("windows") && (
                    <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
                      <ScanSearch className="h-3 w-3" />
                      Auto-détecté
                    </span>
                  )}
                </h4>
                <button
                  onClick={addWindow}
                  className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                >
                  + Ajouter un type
                </button>
              </div>
              {parameters.windows.map((w, i) => (
                <div
                  key={i}
                  className="grid grid-cols-4 gap-2 mb-2 items-end"
                >
                  <Field label="Largeur (mm)">
                    <input
                      type="number"
                      className={inputClass}
                      value={w.width}
                      onChange={(e) =>
                        updateWindow(i, "width", Number(e.target.value))
                      }
                    />
                  </Field>
                  <Field label="Hauteur (mm)">
                    <input
                      type="number"
                      className={inputClass}
                      value={w.height}
                      onChange={(e) =>
                        updateWindow(i, "height", Number(e.target.value))
                      }
                    />
                  </Field>
                  <Field label="Quantité">
                    <input
                      type="number"
                      className={inputClass}
                      value={w.quantity}
                      onChange={(e) =>
                        updateWindow(i, "quantity", Number(e.target.value))
                      }
                      min={0}
                    />
                  </Field>
                  <button
                    onClick={() => removeWindow(i)}
                    className="px-3 py-2 text-destructive text-sm hover:bg-destructive/10 rounded-lg transition-colors"
                    disabled={parameters.windows.length <= 1}
                  >
                    Suppr.
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm text-foreground">
                  Portes
                  {isDetected("doors") && (
                    <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
                      <ScanSearch className="h-3 w-3" />
                      Auto-détecté
                    </span>
                  )}
                </h4>
                <button
                  onClick={addDoor}
                  className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"
                >
                  + Ajouter un type
                </button>
              </div>
              {parameters.doors.map((d, i) => (
                <div
                  key={i}
                  className="grid grid-cols-5 gap-2 mb-2 items-end"
                >
                  <Field label="Largeur (mm)">
                    <input
                      type="number"
                      className={inputClass}
                      value={d.width}
                      onChange={(e) =>
                        updateDoor(i, "width", Number(e.target.value))
                      }
                    />
                  </Field>
                  <Field label="Hauteur (mm)">
                    <input
                      type="number"
                      className={inputClass}
                      value={d.height}
                      onChange={(e) =>
                        updateDoor(i, "height", Number(e.target.value))
                      }
                    />
                  </Field>
                  <Field label="Quantité">
                    <input
                      type="number"
                      className={inputClass}
                      value={d.quantity}
                      onChange={(e) =>
                        updateDoor(i, "quantity", Number(e.target.value))
                      }
                      min={0}
                    />
                  </Field>
                  <Field label="Type">
                    <select
                      className={selectClass}
                      value={d.isExterior ? "ext" : "int"}
                      onChange={(e) =>
                        updateDoor(i, "isExterior", e.target.value === "ext")
                      }
                    >
                      <option value="int">Intérieure</option>
                      <option value="ext">Extérieure</option>
                    </select>
                  </Field>
                  <button
                    onClick={() => removeDoor(i)}
                    className="px-3 py-2 text-destructive text-sm hover:bg-destructive/10 rounded-lg transition-colors"
                    disabled={parameters.doors.length <= 1}
                  >
                    Suppr.
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Materials */}
        <SectionCard title="Matériaux" icon={Layers}>
          <Field label="Type de fondation">
            <select
              className={selectClass}
              value={parameters.foundationType}
              onChange={(e) =>
                updateParameters({
                  foundationType: e.target.value as FoundationType,
                })
              }
            >
              <option value="slab-on-grade">Dalle sur sol</option>
              <option value="strip-foundation">Semelles filantes</option>
              <option value="pile-foundation">Pieux</option>
            </select>
          </Field>
          <Field label="Type d'isolation">
            <select
              className={selectClass}
              value={parameters.insulationType}
              onChange={(e) =>
                updateParameters({
                  insulationType: e.target.value as InsulationType,
                })
              }
            >
              <option value="rock-wool">Laine de roche</option>
              <option value="glass-wool">Laine de verre</option>
              <option value="eps">Polystyrène EPS</option>
              <option value="xps">Polystyrène XPS</option>
            </select>
          </Field>
          <Field label="Épaisseur isolation (mm)">
            <select
              className={selectClass}
              value={parameters.insulationThickness}
              onChange={(e) =>
                updateParameters({
                  insulationThickness: Number(e.target.value),
                })
              }
            >
              <option value={50}>50 mm</option>
              <option value={100}>100 mm</option>
              <option value={150}>150 mm</option>
              <option value={200}>200 mm</option>
            </select>
          </Field>
          <Field label="Bardage extérieur">
            <select
              className={selectClass}
              value={parameters.exteriorCladding}
              onChange={(e) =>
                updateParameters({
                  exteriorCladding: e.target.value as ExteriorCladding,
                })
              }
            >
              <option value="fiber-cement">Fibro-ciment</option>
              <option value="metal-panel">Bardage métallique</option>
              <option value="etics">ETICS (enduit sur isolant)</option>
              <option value="brick-veneer">Briquettes de parement</option>
            </select>
          </Field>
          <Field label="Revêtement intérieur">
            <select
              className={selectClass}
              value={parameters.interiorCladding}
              onChange={(e) =>
                updateParameters({
                  interiorCladding: e.target.value as InteriorCladding,
                })
              }
            >
              <option value="plasterboard-single">
                Plaque de plâtre (simple)
              </option>
              <option value="plasterboard-double">
                Plaque de plâtre (double)
              </option>
              <option value="osb">OSB intérieur</option>
            </select>
          </Field>
        </SectionCard>

        {/* Waterproofing */}
        <SectionCard title="Étanchéité & Options" icon={Shield}>
          <Field label="Pare-vapeur">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-input text-primary focus:ring-ring"
                checked={parameters.hasVaporBarrier}
                onChange={(e) =>
                  updateParameters({ hasVaporBarrier: e.target.checked })
                }
              />
              <span className="text-sm text-foreground">
                Inclure un pare-vapeur
              </span>
            </label>
          </Field>
          <Field label="Membrane pare-pluie">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-input text-primary focus:ring-ring"
                checked={parameters.hasWaterproofingMembrane}
                onChange={(e) =>
                  updateParameters({
                    hasWaterproofingMembrane: e.target.checked,
                  })
                }
              />
              <span className="text-sm text-foreground">
                Inclure une membrane pare-pluie
              </span>
            </label>
          </Field>
          <Field label="Isolation acoustique cloisons">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-input text-primary focus:ring-ring"
                checked={parameters.hasAcousticInsulation}
                onChange={(e) =>
                  updateParameters({
                    hasAcousticInsulation: e.target.checked,
                  })
                }
              />
              <span className="text-sm text-foreground">
                Isolation acoustique dans les cloisons
              </span>
            </label>
          </Field>
        </SectionCard>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={() => setStep(0)}
          className="flex items-center gap-2 px-6 py-3 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
        <button
          onClick={generateProject}
          disabled={isGenerating}
          className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Calcul en cours...
            </>
          ) : (
            <>
              <Calculator className="h-4 w-4" />
              Générer le projet
            </>
          )}
        </button>
      </div>
    </div>
  );
}

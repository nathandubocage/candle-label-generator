"use client";

import { useRef } from "react";
import type { LabelData } from "@/types/label";

interface LabelFormProps {
  data: LabelData;
  onChange: (data: LabelData) => void;
  onExport: () => void;
  exporting: boolean;
}

export function LabelForm({ data, onChange, onExport, exporting }: LabelFormProps) {
  const leftInputRef = useRef<HTMLInputElement>(null);
  const rightInputRef = useRef<HTMLInputElement>(null);

  const update = (partial: Partial<LabelData>) => {
    onChange({ ...data, ...partial });
  };

  const handleImage =
    (field: "leftImage" | "rightImage") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => update({ [field]: ev.target?.result as string });
      reader.readAsDataURL(file);
    };

  const resetImage = (field: "leftImage" | "rightImage", defaultSrc: string) => {
    update({ [field]: defaultSrc });
    if (field === "leftImage" && leftInputRef.current) leftInputRef.current.value = "";
    if (field === "rightImage" && rightInputRef.current) rightInputRef.current.value = "";
  };

  const waxPercent = Math.max(0, 100 - data.perfumePercent);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-stone-200">
        <h1
          className="text-xl font-semibold text-stone-800"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Bougie Label Maker
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Éditeur d&apos;étiquettes pour bougies artisanales
        </p>
      </div>

      {/* Form body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* Section: Bougie info */}
        <Section title="Informations de la bougie">
          <Field label="Nom de la bougie">
            <input
              type="text"
              value={data.title}
              onChange={(e) => update({ title: e.target.value })}
              className="input-field"
              placeholder="Ex: Aigue Marine"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Poids (g)">
              <input
                type="number"
                min={1}
                value={data.weight}
                onChange={(e) => update({ weight: Math.max(1, Number(e.target.value)) })}
                className="input-field"
              />
            </Field>
            <Field label="% Parfum">
              <input
                type="number"
                min={0}
                max={100}
                value={data.perfumePercent}
                onChange={(e) =>
                  update({
                    perfumePercent: Math.min(100, Math.max(0, Number(e.target.value))),
                  })
                }
                className="input-field"
              />
            </Field>
          </div>

          <Field label={`% Cire de Soja (calculé : ${waxPercent}%)`}>
            <div className="input-field bg-stone-100 text-stone-500 cursor-not-allowed">
              {waxPercent}%
            </div>
          </Field>
        </Section>

        {/* Section: Illustrations */}
        <Section title="Illustrations">
          <div className="grid grid-cols-2 gap-4">
            <ImageUpload
              label="Gauche"
              src={data.leftImage}
              inputRef={leftInputRef}
              onChange={handleImage("leftImage")}
              onReset={() => resetImage("leftImage", "/images/rose.svg")}
            />
            <ImageUpload
              label="Droite"
              src={data.rightImage}
              inputRef={rightInputRef}
              onChange={handleImage("rightImage")}
              onReset={() => resetImage("rightImage", "/images/branch.svg")}
            />
          </div>
        </Section>

        {/* Section: Composition */}
        <Section title="Composition">
          <Field label="Liste des ingrédients">
            <textarea
              value={data.ingredients}
              onChange={(e) => update({ ingredients: e.target.value })}
              rows={5}
              className="input-field resize-y"
              placeholder="Ex: linalool, citronellol, ..."
            />
          </Field>
        </Section>

        {/* Section: Dimensions */}
        <Section title="Dimensions de l'étiquette">
          <Field label={`Largeur : ${data.labelWidth} mm`}>
            <input
              type="range"
              min={80}
              max={190}
              value={data.labelWidth}
              onChange={(e) => {
                const newW = Number(e.target.value);
                const maxX = 210 - newW;
                update({
                  labelWidth: newW,
                  labelX: Math.min(data.labelX, Math.max(0, maxX)),
                });
              }}
              className="w-full accent-amber-700"
            />
            <div className="flex justify-between text-xs text-stone-400 mt-1">
              <span>80 mm</span>
              <span>190 mm</span>
            </div>
          </Field>
          <Field label={`Hauteur : ${data.labelHeight} mm`}>
            <input
              type="range"
              min={50}
              max={280}
              value={data.labelHeight}
              onChange={(e) => {
                const newH = Number(e.target.value);
                const maxY = 297 - newH;
                update({
                  labelHeight: newH,
                  labelY: Math.min(data.labelY, Math.max(0, maxY)),
                });
              }}
              className="w-full accent-amber-700"
            />
            <div className="flex justify-between text-xs text-stone-400 mt-1">
              <span>50 mm</span>
              <span>280 mm</span>
            </div>
          </Field>
        </Section>

        {/* Section: Position */}
        <Section title="Position sur la page A4">
          <div className="grid grid-cols-2 gap-4">
            <Field label={`X : ${data.labelX} mm`}>
              <input
                type="range"
                min={0}
                max={Math.max(0, 210 - data.labelWidth)}
                value={data.labelX}
                onChange={(e) => update({ labelX: Number(e.target.value) })}
                className="w-full accent-amber-700"
              />
            </Field>
            <Field label={`Y : ${data.labelY} mm`}>
              <input
                type="range"
                min={0}
                max={Math.max(0, 297 - data.labelHeight)}
                value={data.labelY}
                onChange={(e) => update({ labelY: Number(e.target.value) })}
                className="w-full accent-amber-700"
              />
            </Field>
          </div>
          <button
            type="button"
            onClick={() =>
              update({
                labelX: Math.round((210 - data.labelWidth) / 2),
                labelY: Math.round((297 - data.labelHeight) / 2),
              })
            }
            className="w-full py-2 text-sm rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50 transition-colors cursor-pointer"
          >
            Recentrer l&apos;étiquette
          </button>
          <p className="text-xs text-stone-400">
            Vous pouvez aussi glisser-déposer l&apos;étiquette directement sur la page A4.
          </p>
        </Section>
      </div>

      {/* Export button */}
      <div className="px-6 py-4 border-t border-stone-200">
        <button
          onClick={onExport}
          disabled={exporting}
          className="w-full py-3 rounded-lg bg-amber-700 hover:bg-amber-800 disabled:opacity-60 disabled:cursor-wait text-white font-medium transition-colors cursor-pointer"
        >
          {exporting ? "Génération en cours..." : "Télécharger le PDF"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-amber-800 uppercase tracking-wider">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

function ImageUpload({
  label,
  src,
  inputRef,
  onChange,
  onReset,
}: {
  label: string;
  src: string | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-600 mb-1">{label}</label>
      <div className="relative border-2 border-dashed border-stone-300 rounded-lg p-3 text-center hover:border-amber-600 transition-colors">
        {src ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={label}
              className="h-20 mx-auto object-contain"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onReset();
              }}
              className="absolute -top-1 -right-1 z-10 w-5 h-5 rounded-full bg-stone-600 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="py-3 text-stone-400 text-sm">Aucune image</div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

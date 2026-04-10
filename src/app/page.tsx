"use client";

import { useState, useRef, useCallback } from "react";
import type { LabelData } from "@/types/label";
import { defaultLabels, createLabel } from "@/lib/defaults";
import { exportToPdf } from "@/lib/pdf";
import { LabelForm } from "@/components/LabelForm";
import { A4Page } from "@/components/A4Page";

export default function Home() {
  const [labels, setLabels] = useState<LabelData[]>(defaultLabels);
  const [selectedId, setSelectedId] = useState(defaultLabels[0].id);
  const [exporting, setExporting] = useState(false);
  const a4Ref = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!a4Ref.current || exporting) return;
    setExporting(true);
    try {
      await exportToPdf(a4Ref.current, "planche_etiquettes.pdf");
    } finally {
      setExporting(false);
    }
  };

  const handleUpdateLabel = useCallback((updated: LabelData) => {
    setLabels((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  }, []);

  const handleLabelChange = useCallback(
    (id: string, x: number, y: number, w: number, h: number) => {
      setLabels((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, labelX: x, labelY: y, labelWidth: w, labelHeight: h }
            : l,
        ),
      );
    },
    [],
  );

  const handleAddLabel = useCallback(() => {
    const offset = labels.length * 10;
    const newLabel = createLabel({
      labelX: Math.min(70, 10 + offset),
      labelY: Math.min(200, 10 + offset),
    });
    setLabels((prev) => [...prev, newLabel]);
    setSelectedId(newLabel.id);
  }, [labels.length]);

  const handleDuplicateLabel = useCallback(
    (id: string) => {
      const source = labels.find((l) => l.id === id);
      if (!source) return;
      const dup = createLabel({
        ...source,
        labelX: Math.min(210 - source.labelWidth, source.labelX + 10),
        labelY: Math.min(297 - source.labelHeight, source.labelY + 10),
      });
      setLabels((prev) => [...prev, dup]);
      setSelectedId(dup.id);
    },
    [labels],
  );

  const handleRotateLabel = useCallback(
    (id: string, rotation: 0 | 90 | 180 | 270) => {
      setLabels((prev) =>
        prev.map((l) => (l.id === id ? { ...l, rotation } : l)),
      );
    },
    [],
  );

  const handleRemoveLabel = useCallback(
    (id: string) => {
      setLabels((prev) => {
        if (prev.length <= 1) return prev;
        const next = prev.filter((l) => l.id !== id);
        if (id === selectedId) {
          setSelectedId(next[0].id);
        }
        return next;
      });
    },
    [selectedId],
  );

  return (
    <div className="flex h-full">
      <aside className="w-[380px] min-w-[340px] border-r border-stone-200 bg-white flex flex-col shrink-0">
        <LabelForm
          labels={labels}
          selectedId={selectedId}
          onSelectLabel={setSelectedId}
          onUpdateLabel={handleUpdateLabel}
          onAddLabel={handleAddLabel}
          onDuplicateLabel={handleDuplicateLabel}
          onRemoveLabel={handleRemoveLabel}
          onExport={handleExport}
          exporting={exporting}
        />
      </aside>

      <main className="flex-1 flex items-center justify-center overflow-auto p-4 bg-stone-100">
        <A4Page
          ref={a4Ref}
          labels={labels}
          selectedId={selectedId}
          onSelectLabel={setSelectedId}
          onLabelChange={handleLabelChange}
          onRotateLabel={handleRotateLabel}
        />
      </main>
    </div>
  );
}

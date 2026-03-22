"use client";

import { useState, useRef } from "react";
import type { LabelData } from "@/types/label";
import { defaultLabelData } from "@/lib/defaults";
import { exportToPdf } from "@/lib/pdf";
import { LabelForm } from "@/components/LabelForm";
import { LabelPreview } from "@/components/LabelPreview";
import { A4Page } from "@/components/A4Page";

export default function Home() {
  const [labelData, setLabelData] = useState<LabelData>(defaultLabelData);
  const [exporting, setExporting] = useState(false);
  const a4Ref = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!a4Ref.current || exporting) return;
    setExporting(true);
    try {
      const safeName = (labelData.title || "etiquette")
        .replace(/[^a-zA-Z0-9À-ÿ\s-]/g, "")
        .trim()
        .replace(/\s+/g, "_");
      await exportToPdf(a4Ref.current, `${safeName}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Left panel — Form */}
      <aside className="w-[380px] min-w-[340px] border-r border-stone-200 bg-white flex flex-col shrink-0">
        <LabelForm
          data={labelData}
          onChange={setLabelData}
          onExport={handleExport}
          exporting={exporting}
        />
      </aside>

      {/* Right panel — A4 Preview */}
      <main className="flex-1 flex items-center justify-center overflow-auto p-4 bg-stone-100">
        <A4Page
          ref={a4Ref}
          labelX={labelData.labelX}
          labelY={labelData.labelY}
          labelWidth={labelData.labelWidth}
          labelHeight={labelData.labelHeight}
          onPositionChange={(x, y) =>
            setLabelData((prev) => ({ ...prev, labelX: x, labelY: y }))
          }
        >
          <LabelPreview data={labelData} />
        </A4Page>
      </main>
    </div>
  );
}

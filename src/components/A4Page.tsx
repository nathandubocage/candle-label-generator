"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
} from "react";
import type { LabelData } from "@/types/label";
import { LabelPreview } from "./LabelPreview";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const PX_PER_MM = A4_WIDTH / 210;

const MIN_W = 80;
const MAX_W = 190;
const MIN_H = 50;
const MAX_H = 280;

type Handle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const HANDLE_CURSORS: Record<Handle, string> = {
  nw: "nwse-resize",
  se: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
};

// Curseurs pivotés de 90° (valable pour 90° et 270° car les curseurs diagonaux sont symétriques)
const HANDLE_CURSORS_90: Record<Handle, string> = {
  nw: "nesw-resize",
  ne: "nwse-resize",
  se: "nesw-resize",
  sw: "nwse-resize",
  n: "ew-resize",
  s: "ew-resize",
  e: "ns-resize",
  w: "ns-resize",
};

function getHandleCursor(h: Handle, rotation: 0 | 90 | 180 | 270): string {
  // 180° : les curseurs diagonaux/orthogonaux sont identiques à 0° (symétrie)
  if (rotation === 90 || rotation === 270) return HANDLE_CURSORS_90[h];
  return HANDLE_CURSORS[h];
}

interface A4PageProps {
  labels: LabelData[];
  selectedId: string;
  onSelectLabel: (id: string) => void;
  onLabelChange: (id: string, x: number, y: number, w: number, h: number) => void;
  onRotateLabel: (id: string, rotation: 0 | 90 | 180 | 270) => void;
}

export const A4Page = forwardRef<HTMLDivElement, A4PageProps>(
  function A4Page({ labels, selectedId, onSelectLabel, onLabelChange, onRotateLabel }, ref) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.5);

    const interaction = useRef<{
      type: "drag" | "resize";
      labelId: string;
      handle?: Handle;
      mouseX: number;
      mouseY: number;
      originX: number;
      originY: number;
      originW: number;
      originH: number;
      rotation: 0 | 90 | 180 | 270;
    } | null>(null);

    useEffect(() => {
      const update = () => {
        const parent = wrapperRef.current?.parentElement;
        if (!parent) return;
        const pad = 32;
        const sx = (parent.clientWidth - pad) / A4_WIDTH;
        const sy = (parent.clientHeight - pad) / A4_HEIGHT;
        setScale(Math.min(sx, sy, 1));
      };
      update();
      const ro = new ResizeObserver(update);
      if (wrapperRef.current?.parentElement) {
        ro.observe(wrapperRef.current.parentElement);
      }
      return () => ro.disconnect();
    }, []);

    const startDrag = useCallback(
      (label: LabelData, e: React.MouseEvent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();
        onSelectLabel(label.id);
        interaction.current = {
          type: "drag",
          labelId: label.id,
          mouseX: e.clientX,
          mouseY: e.clientY,
          originX: label.labelX,
          originY: label.labelY,
          originW: label.labelWidth,
          originH: label.labelHeight,
          rotation: label.rotation,
        };
        document.body.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
      },
      [onSelectLabel],
    );

    const startResize = useCallback(
      (label: LabelData, handle: Handle, e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        interaction.current = {
          type: "resize",
          labelId: label.id,
          handle,
          mouseX: e.clientX,
          mouseY: e.clientY,
          originX: label.labelX,
          originY: label.labelY,
          originW: label.labelWidth,
          originH: label.labelHeight,
          rotation: label.rotation,
        };
        document.body.style.cursor = getHandleCursor(handle, label.rotation);
        document.body.style.userSelect = "none";
      },
      [],
    );

    useEffect(() => {
      const onMouseMove = (e: MouseEvent) => {
        const i = interaction.current;
        if (!i) return;

        const dxMm = (e.clientX - i.mouseX) / scale / PX_PER_MM;
        const dyMm = (e.clientY - i.mouseY) / scale / PX_PER_MM;

        if (i.type === "drag") {
          // Pour 90°/270°, l'empreinte visuelle est (originH × originW) au lieu de (originW × originH).
          // Le centre reste à (labelX + originW/2, labelY + originH/2), donc les bornes de labelX/Y
          // doivent garantir que la boîte visuelle reste dans la page A4.
          let minX, maxX, minY, maxY;
          if (i.rotation === 90 || i.rotation === 270) {
            minX = (i.originH - i.originW) / 2;
            maxX = 210 - (i.originW + i.originH) / 2;
            minY = (i.originW - i.originH) / 2;
            maxY = 297 - (i.originW + i.originH) / 2;
          } else {
            minX = 0; maxX = 210 - i.originW;
            minY = 0; maxY = 297 - i.originH;
          }
          onLabelChange(
            i.labelId,
            Math.round(Math.max(minX, Math.min(maxX, i.originX + dxMm))),
            Math.round(Math.max(minY, Math.min(maxY, i.originY + dyMm))),
            i.originW,
            i.originH,
          );
          return;
        }

        // Transformer le delta écran en delta local à l'étiquette selon sa rotation
        let ldx = dxMm;
        let ldy = dyMm;
        if (i.rotation === 90)  { ldx =  dyMm; ldy = -dxMm; }
        if (i.rotation === 180) { ldx = -dxMm; ldy = -dyMm; }
        if (i.rotation === 270) { ldx = -dyMm; ldy =  dxMm; }

        const h = i.handle!;
        let w = i.originW;
        let ht = i.originH;

        if (h.includes("e")) w = i.originW + ldx;
        if (h.includes("w")) w = i.originW - ldx;
        if (h.includes("s")) ht = i.originH + ldy;
        if (h.includes("n")) ht = i.originH - ldy;

        w = Math.max(MIN_W, Math.min(MAX_W, w));
        ht = Math.max(MIN_H, Math.min(MAX_H, ht));

        let x = i.originX;
        let y = i.originY;
        if (h.includes("w")) x = i.originX + i.originW - w;
        if (h.includes("n")) y = i.originY + i.originH - ht;

        // Même logique que pour le drag : bornes adaptées à l'empreinte visuelle réelle
        if (i.rotation === 90 || i.rotation === 270) {
          x = Math.max((ht - w) / 2, Math.min(210 - (w + ht) / 2, x));
          y = Math.max((w - ht) / 2, Math.min(297 - (w + ht) / 2, y));
        } else {
          x = Math.max(0, Math.min(210 - w, x));
          y = Math.max(0, Math.min(297 - ht, y));
        }

        onLabelChange(i.labelId, Math.round(x), Math.round(y), Math.round(w), Math.round(ht));
      };

      const onMouseUp = () => {
        if (!interaction.current) return;
        interaction.current = null;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };
    }, [scale, onLabelChange]);

    const hs = 12;

    return (
      <div
        ref={wrapperRef}
        style={{
          width: A4_WIDTH * scale,
          height: A4_HEIGHT * scale,
          flexShrink: 0,
        }}
      >
        <div
          ref={ref}
          style={{
            width: A4_WIDTH,
            height: A4_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          className="bg-white shadow-xl relative"
        >
          {labels.map((label) => {
            const leftPx = label.labelX * PX_PER_MM;
            const topPx = label.labelY * PX_PER_MM;
            const wPx = label.labelWidth * PX_PER_MM;
            const hPx = label.labelHeight * PX_PER_MM;
            const isSelected = label.id === selectedId;

            return (
              <div
                key={label.id}
                style={{
                  position: "absolute",
                  left: leftPx,
                  top: topPx,
                  width: wPx,
                  height: hPx,
                  transform: label.rotation ? `rotate(${label.rotation}deg)` : undefined,
                  transformOrigin: "center center",
                }}
              >
                {/* Label content (captured in PDF) */}
                <LabelPreview data={label} />

                {/* Interaction overlay (excluded from PDF) */}
                <div
                  data-no-export
                  onMouseDown={(e) => startDrag(label, e)}
                  onDoubleClick={() => onSelectLabel(label.id)}
                  style={{
                    position: "absolute",
                    left: -1,
                    top: -1,
                    width: wPx + 2,
                    height: hPx + 2,
                    cursor: "grab",
                    border: isSelected
                      ? "1.5px dashed #4A90D9"
                      : "1.5px dashed transparent",
                    boxSizing: "content-box",
                    zIndex: isSelected ? 20 : 10,
                  }}
                >
                  {isSelected &&
                    (["nw", "n", "ne", "w", "e", "sw", "s", "se"] as Handle[]).map(
                      (h) => {
                        const pos = handlePosition(h, wPx + 2, hPx + 2);
                        return (
                          <div
                            key={h}
                            onMouseDown={(e) => startResize(label, h, e)}
                            style={{
                              position: "absolute",
                              width: hs,
                              height: hs,
                              left: pos.left,
                              top: pos.top,
                              cursor: getHandleCursor(h, label.rotation),
                              backgroundColor: "#fff",
                              border: "1.5px solid #4A90D9",
                              borderRadius: 2,
                              transform: "translate(-50%, -50%)",
                              zIndex: 30,
                            }}
                          />
                        );
                      },
                    )}
                </div>

                {/* Toolbar de rotation (excluded from PDF) */}
                {isSelected && (
                  <div
                    data-no-export
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: 0,
                      transform: "translate(-50%, calc(-100% - 10px))",
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      background: "white",
                      borderRadius: 6,
                      padding: "3px 5px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
                      border: "1.5px solid #4A90D9",
                      zIndex: 40,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <RotateButton
                      title="Rotation antihoraire (−90°)"
                      onClick={() => {
                        const next = (((label.rotation - 90) % 360 + 360) % 360) as 0 | 90 | 180 | 270;
                        onRotateLabel(label.id, next);
                      }}
                    >
                      ↺
                    </RotateButton>
                    <span style={{ fontSize: 11, color: "#4A90D9", fontWeight: 600, userSelect: "none", minWidth: 28, textAlign: "center" }}>
                      {label.rotation}°
                    </span>
                    <RotateButton
                      title="Rotation horaire (+90°)"
                      onClick={() => {
                        const next = ((label.rotation + 90) % 360) as 0 | 90 | 180 | 270;
                        onRotateLabel(label.id, next);
                      }}
                    >
                      ↻
                    </RotateButton>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

function RotateButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      title={title}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        width: 22,
        height: 22,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "none",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        fontSize: 15,
        color: "#4A90D9",
        padding: 0,
        lineHeight: 1,
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#e8f0fb"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
    >
      {children}
    </button>
  );
}

function handlePosition(
  h: Handle,
  w: number,
  ht: number,
): { left: number; top: number } {
  const mx = w / 2;
  const my = ht / 2;
  switch (h) {
    case "nw": return { left: 0, top: 0 };
    case "n":  return { left: mx, top: 0 };
    case "ne": return { left: w, top: 0 };
    case "w":  return { left: 0, top: my };
    case "e":  return { left: w, top: my };
    case "sw": return { left: 0, top: ht };
    case "s":  return { left: mx, top: ht };
    case "se": return { left: w, top: ht };
  }
}

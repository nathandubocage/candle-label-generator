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

interface A4PageProps {
  labels: LabelData[];
  selectedId: string;
  onSelectLabel: (id: string) => void;
  onLabelChange: (id: string, x: number, y: number, w: number, h: number) => void;
}

export const A4Page = forwardRef<HTMLDivElement, A4PageProps>(
  function A4Page({ labels, selectedId, onSelectLabel, onLabelChange }, ref) {
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
        };
        document.body.style.cursor = HANDLE_CURSORS[handle];
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
          const maxX = 210 - i.originW;
          const maxY = 297 - i.originH;
          onLabelChange(
            i.labelId,
            Math.round(Math.max(0, Math.min(maxX, i.originX + dxMm))),
            Math.round(Math.max(0, Math.min(maxY, i.originY + dyMm))),
            i.originW,
            i.originH,
          );
          return;
        }

        const h = i.handle!;
        let w = i.originW;
        let ht = i.originH;

        if (h.includes("e")) w = i.originW + dxMm;
        if (h.includes("w")) w = i.originW - dxMm;
        if (h.includes("s")) ht = i.originH + dyMm;
        if (h.includes("n")) ht = i.originH - dyMm;

        w = Math.max(MIN_W, Math.min(MAX_W, w));
        ht = Math.max(MIN_H, Math.min(MAX_H, ht));

        let x = i.originX;
        let y = i.originY;
        if (h.includes("w")) x = i.originX + i.originW - w;
        if (h.includes("n")) y = i.originY + i.originH - ht;

        x = Math.max(0, Math.min(210 - w, x));
        y = Math.max(0, Math.min(297 - ht, y));

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
              <div key={label.id}>
                {/* Label content (captured in PDF) */}
                <div style={{ position: "absolute", left: leftPx, top: topPx }}>
                  <LabelPreview data={label} />
                </div>

                {/* Interaction overlay (excluded from PDF) */}
                <div
                  data-no-export
                  onMouseDown={(e) => startDrag(label, e)}
                  style={{
                    position: "absolute",
                    left: leftPx - 1,
                    top: topPx - 1,
                    width: wPx + 2,
                    height: hPx + 2,
                    cursor: "grab",
                    border: isSelected
                      ? "1.5px dashed #4A90D9"
                      : "1.5px dashed transparent",
                    boxSizing: "content-box",
                    zIndex: isSelected ? 20 : 10,
                  }}
                  onDoubleClick={() => onSelectLabel(label.id)}
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
                              cursor: HANDLE_CURSORS[h],
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
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

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

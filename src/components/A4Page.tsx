"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  forwardRef,
  type ReactNode,
} from "react";

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const PX_PER_MM = A4_WIDTH / 210;

interface A4PageProps {
  children: ReactNode;
  labelX: number;
  labelY: number;
  labelWidth: number;
  labelHeight: number;
  onPositionChange: (x: number, y: number) => void;
}

export const A4Page = forwardRef<HTMLDivElement, A4PageProps>(
  function A4Page(
    { children, labelX, labelY, labelWidth, labelHeight, onPositionChange },
    ref,
  ) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.5);
    const dragging = useRef(false);
    const dragStart = useRef({ mouseX: 0, mouseY: 0, originX: 0, originY: 0 });

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

    const clamp = useCallback(
      (x: number, y: number): [number, number] => {
        const maxX = 210 - labelWidth;
        const maxY = 297 - labelHeight;
        return [
          Math.round(Math.max(0, Math.min(maxX, x))),
          Math.round(Math.max(0, Math.min(maxY, y))),
        ];
      },
      [labelWidth, labelHeight],
    );

    const onMouseDown = useCallback(
      (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        dragging.current = true;
        dragStart.current = {
          mouseX: e.clientX,
          mouseY: e.clientY,
          originX: labelX,
          originY: labelY,
        };
        document.body.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
      },
      [labelX, labelY],
    );

    useEffect(() => {
      const onMouseMove = (e: MouseEvent) => {
        if (!dragging.current) return;
        const dx = (e.clientX - dragStart.current.mouseX) / scale / PX_PER_MM;
        const dy = (e.clientY - dragStart.current.mouseY) / scale / PX_PER_MM;
        const [nx, ny] = clamp(
          dragStart.current.originX + dx,
          dragStart.current.originY + dy,
        );
        onPositionChange(nx, ny);
      };

      const onMouseUp = () => {
        if (!dragging.current) return;
        dragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };
    }, [scale, clamp, onPositionChange]);

    const leftPx = labelX * PX_PER_MM;
    const topPx = labelY * PX_PER_MM;

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
          <div
            onMouseDown={onMouseDown}
            style={{
              position: "absolute",
              left: leftPx,
              top: topPx,
              cursor: "grab",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    );
  },
);

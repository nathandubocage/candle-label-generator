/* eslint-disable @next/next/no-img-element */
import type { LabelData } from "@/types/label";
import { FIXED_CONTACT } from "@/lib/defaults";

const PX_PER_MM = 794 / 210;
const REF_WIDTH = 140;

interface LabelPreviewProps {
  data: LabelData;
}

export function LabelPreview({ data }: LabelPreviewProps) {
  const w = data.labelWidth * PX_PER_MM;
  const h = data.labelHeight * PX_PER_MM;
  const s = data.labelWidth / REF_WIDTH;

  const fs = (base: number) => base * s;
  const px = (base: number) => base * s;

  return (
    <div
      style={{
        width: w,
        height: h,
        position: "relative",
        backgroundColor: "#fff",
        fontFamily: "var(--font-garamond)",
        overflow: "hidden",
      }}
    >
      {/* Outer border */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          border: `${Math.max(1, 1.2 * s)}px solid #3C3C3C`,
          borderRadius: px(3),
        }}
      />

      {/* Inner border */}
      <div
        style={{
          position: "absolute",
          inset: px(4),
          border: `${Math.max(0.8, 0.9 * s)}px solid #3C3C3C`,
          borderRadius: px(2),
        }}
      />

      {/* Corner decorations */}
      <CornerDot s={s} top={px(4)} left={px(4)} />
      <CornerDot s={s} top={px(4)} right={px(4)} />
      <CornerDot s={s} bottom={px(4)} left={px(4)} />
      <CornerDot s={s} bottom={px(4)} right={px(4)} />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          inset: px(4),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: `${px(8)}px ${px(14)}px ${px(8)}px`,
          overflow: "hidden",
        }}
      >
        {/* Title row with illustrations and decorative lines */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            marginTop: px(2),
            gap: px(4),
          }}
        >
          {/* Left illustration */}
          {data.leftImage && (
            <img
              src={data.leftImage}
              alt=""
              style={{
                height: px(72),
                width: "auto",
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
          )}

          {/* Left decorative line */}
          <div
            style={{
              flex: 1,
              height: Math.max(1, 1.2 * s),
              backgroundColor: "#3C3C3C",
              minWidth: px(10),
            }}
          />

          {/* Title */}
          <span
            style={{
              fontFamily: "var(--font-boston-angel)",
              fontSize: fs(28),
              color: "#3C3C3C",
              whiteSpace: "nowrap",
              letterSpacing: px(1.1),
              lineHeight: 1.2,
              flexShrink: 0,
              padding: `0 ${px(4)}px`,
            }}
          >
            {data.title || "\u00A0"}
          </span>

          {/* Right decorative line */}
          <div
            style={{
              flex: 1,
              height: Math.max(1, 1.2 * s),
              backgroundColor: "#3C3C3C",
              minWidth: px(10),
            }}
          />

          {/* Right illustration */}
          {data.rightImage && (
            <img
              src={data.rightImage}
              alt=""
              style={{
                height: px(72),
                width: "auto",
                objectFit: "contain",
                flexShrink: 0,
              }}
            />
          )}
        </div>

        {/* "Fait main en France" */}
        <span
          style={{
            fontFamily: "var(--font-great-vibes)",
            fontSize: fs(18),
            color: "#bd8e89",
            marginTop: px(0),
            lineHeight: 1.2,
          }}
        >
          Fait main en France
        </span>

        {/* Specs line */}
        <span
          style={{
            fontFamily: "var(--font-carollo-plays)",
            fontSize: fs(14),
            color: "#3C3C3C",
            marginTop: px(2),
            lineHeight: 1.3,
            whiteSpace: "nowrap",
            fontWeight: 400,
          }}
        >
          {data.weight} Grammes &nbsp;&nbsp;&nbsp;| {data.perfumePercent}%
          Parfum |&nbsp;&nbsp;&nbsp; {100 - data.perfumePercent}% Cire de Soja
        </span>

        {/* Dot separator */}
        <div
          style={{
            marginTop: px(2),
            fontSize: fs(5),
            letterSpacing: px(2.2),
            color: "#3C3C3C",
            lineHeight: 1,
          }}
        >
          {"●".repeat(Math.max(10, Math.round(26 * s)))}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, minHeight: px(4) }} />

        {/* P102 safety notice */}
        <div
          style={{
            fontFamily: "var(--font-bebas-neue)",
            fontSize: fs(9),
            fontWeight: 700,
            color: "#bd8e89",
            textTransform: "uppercase",
            textAlign: "center",
            letterSpacing: px(0.4),
            lineHeight: 1.4,
          }}
        >
          P102 - Tenir hors de portée des enfants
        </div>

        {/* Ingredients */}
        <div
          style={{
            fontFamily: "var(--font-alice)",
            width: "100%",
            marginTop: px(3),
            fontSize: fs(8.5),
            color: "#3C3C3C",
            lineHeight: 1.35,
            textAlign: "left",
          }}
        >
          <span
            style={{
              color: "#bd8e89",
              fontWeight: 700,
              textDecoration: "underline",
              textUnderlineOffset: px(1.5),
            }}
          >
            Contient :
          </span>{" "}
          {data.ingredients}
        </div>

        {/* Allergy warning */}
        <div
          style={{
            fontFamily: "var(--font-alice)",
            width: "100%",
            marginTop: px(2),
            fontSize: fs(8.5),
            fontWeight: 700,
            color: "#000",
            lineHeight: 1.4,
            textAlign: "left",
          }}
        >
          Peut produire une réaction allergique.
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, minHeight: px(4) }} />

        {/* CLP regulation */}
        <div
          style={{
            fontFamily: "var(--font-bebas-neue)",
            fontSize: fs(7.5),
            fontWeight: 700,
            color: "#bd8e89",
            textTransform: "uppercase",
            textAlign: "center",
            letterSpacing: px(0.3),
            lineHeight: 1.4,
          }}
        >
          Étiquetage selon le règlement (CE) N°1272/2008 [CLP]
        </div>

        {/* Contact info */}
        <div
          style={{
            fontFamily: "var(--font-alice)",
            fontSize: fs(7.5),
            color: "#3C3C3C",
            textAlign: "center",
            lineHeight: 1.5,
            marginTop: px(2),
          }}
        >
          <div>
            {FIXED_CONTACT.email} - Tel: {FIXED_CONTACT.phone}
          </div>
          <div>{FIXED_CONTACT.address}</div>
        </div>
      </div>
    </div>
  );
}

function CornerDot({
  s,
  top,
  bottom,
  left,
  right,
}: {
  s: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}) {
  const size = Math.max(4, 5 * s);
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        top: top != null ? top - size / 2 : undefined,
        bottom: bottom != null ? bottom - size / 2 : undefined,
        left: left != null ? left - size / 2 : undefined,
        right: right != null ? right - size / 2 : undefined,
        transform: "rotate(45deg)",
        border: `${Math.max(0.8, 0.9 * s)}px solid #3C3C3C`,
        backgroundColor: "#fff",
        zIndex: 2,
      }}
    />
  );
}

import { PRISM_SECTIONS, type PrismSection } from "@/lib/prismSections";

/** Total fan spread in degrees (0 = right, negative = up). */
export const SPECTRUM_SPAN = { start: -40, end: 40 } as const;

/** Flatter fan for the corner nav — stays in viewport when expanded. */
export const NAV_SPECTRUM_SPAN = { start: -28, end: 28 } as const;

export type SpectrumSpan = { start: number; end: number };

export interface SpectrumWedge extends PrismSection {
  index: number;
  startDeg: number;
  endDeg: number;
  midDeg: number;
}

export function getSpectrumWedges(span: SpectrumSpan = SPECTRUM_SPAN): SpectrumWedge[] {
  const n = PRISM_SECTIONS.length;
  const step = (span.end - span.start) / n;

  return PRISM_SECTIONS.map((section, index) => {
    const startDeg = span.start + index * step;
    const endDeg = startDeg + step;
    return {
      ...section,
      index,
      startDeg,
      endDeg,
      midDeg: (startDeg + endDeg) / 2,
      angle: (startDeg + endDeg) / 2,
    };
  });
}

/** Convert degrees (0 = east) to SVG point. */
export function polar(deg: number, radius: number, originX = 0, originY = 0) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: originX + Math.cos(rad) * radius,
    y: originY + Math.sin(rad) * radius,
  };
}

/** Solid wedge from apex — adjacent wedges share exact border rays. */
export function wedgePath(
  startDeg: number,
  endDeg: number,
  radius: number,
  originX = 0,
  originY = 0,
) {
  const a = polar(startDeg, radius, originX, originY);
  const b = polar(endDeg, radius, originX, originY);
  return `M ${originX} ${originY} L ${a.x} ${a.y} L ${b.x} ${b.y} Z`;
}

/** ViewBox sized so the full fan fits with padding (no clipping). */
export function spectrumViewBox(radius: number, pad = 20, span: SpectrumSpan = SPECTRUM_SPAN) {
  const maxRad =
    (Math.max(Math.abs(span.start), Math.abs(span.end)) * Math.PI) / 180;
  const extentY = radius * Math.sin(maxRad) + pad;
  const extentX = radius + pad;
  return {
    w: extentX,
    h: extentY * 2,
    apexX: 0,
    apexY: extentY,
  };
}

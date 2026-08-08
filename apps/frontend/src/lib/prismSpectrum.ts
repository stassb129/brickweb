import { PRISM_SECTIONS, type PrismSection } from "@/lib/prismSections";

/** Total fan spread in degrees (0 = right, negative = up). */
export const SPECTRUM_SPAN = { start: -50, end: 50 } as const;

/** Flatter fan for the corner nav — stays in viewport when expanded. */
export const NAV_SPECTRUM_SPAN = { start: -20, end: 20 } as const;

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

/**
 * Expanding trapezoid band — narrow near the prism, wide at the menu end.
 * Adjacent bands share exact edges (clean neon dividers, no color bleed).
 */
export function bandTrapezoidPath(
  index: number,
  count: number,
  nearX: number,
  farX: number,
  nearHalfH: number,
  farHalfH: number,
  midY: number,
) {
  const t0 = index / count;
  const t1 = (index + 1) / count;
  const y0n = midY - nearHalfH + t0 * nearHalfH * 2;
  const y1n = midY - nearHalfH + t1 * nearHalfH * 2;
  const y0f = midY - farHalfH + t0 * farHalfH * 2;
  const y1f = midY - farHalfH + t1 * farHalfH * 2;
  return `M ${nearX} ${y0n} L ${farX} ${y0f} L ${farX} ${y1f} L ${nearX} ${y1n} Z`;
}

/** Shared edge between band `index` and `index + 1` (or outer edge). */
export function bandEdge(
  edgeIndex: number,
  count: number,
  nearX: number,
  farX: number,
  nearHalfH: number,
  farHalfH: number,
  midY: number,
) {
  const t = edgeIndex / count;
  const yn = midY - nearHalfH + t * nearHalfH * 2;
  const yf = midY - farHalfH + t * farHalfH * 2;
  return { x1: nearX, y1: yn, x2: farX, y2: yf };
}

/** Tip triangles that connect the prism apex to the trapezoid near-edge. */
export function tipWedgePath(
  index: number,
  count: number,
  apexX: number,
  apexY: number,
  nearX: number,
  nearHalfH: number,
) {
  const t0 = index / count;
  const t1 = (index + 1) / count;
  const y0 = apexY - nearHalfH + t0 * nearHalfH * 2;
  const y1 = apexY - nearHalfH + t1 * nearHalfH * 2;
  return `M ${apexX} ${apexY} L ${nearX} ${y0} L ${nearX} ${y1} Z`;
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

/** ViewBox for the continuous tip→menu trapezoid spectrum. */
export function richSpectrumViewBox(
  length: number,
  farHalfH: number,
  pad = 24,
) {
  return {
    w: length + pad,
    h: farHalfH * 2 + pad * 2,
    apexX: 0,
    apexY: farHalfH + pad,
  };
}

export interface MenuBandBox {
  index: number;
  /** Top Y of this menu strip (at hitX and along the plate). */
  y0: number;
  /** Bottom Y of this menu strip. */
  y1: number;
  midY: number;
}

/**
 * Layout script: equal menu strips centered on the apex.
 * Spectrum edges are then aimed at each strip’s top/bottom corners.
 */
export function layoutMenuBands(
  count: number,
  apexY: number,
  plateHalfH: number,
): MenuBandBox[] {
  return Array.from({ length: count }, (_, index) => {
    const y0 = apexY - plateHalfH + (index / count) * plateHalfH * 2;
    const y1 = apexY - plateHalfH + ((index + 1) / count) * plateHalfH * 2;
    return { index, y0, y1, midY: (y0 + y1) / 2 };
  });
}

/** Straight triangle: apex → menu top-left → menu bottom-left. */
export function beamIntoMenuPath(
  apexX: number,
  apexY: number,
  hitX: number,
  y0: number,
  y1: number,
) {
  return `M ${apexX} ${apexY} L ${hitX} ${y0} L ${hitX} ${y1} Z`;
}

/** Horizontal plate from the menu entry to the screen edge. */
export function plateFromMenuPath(
  hitX: number,
  farX: number,
  y0: number,
  y1: number,
) {
  return `M ${hitX} ${y0} L ${farX} ${y0} L ${farX} ${y1} L ${hitX} ${y1} Z`;
}

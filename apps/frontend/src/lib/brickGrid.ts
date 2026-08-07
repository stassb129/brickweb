/**
 * Geometry helpers for the SVG brick wall — The Wall sleeve style:
 * hand-drawn outline rectangles in a running bond, not shaded 3D masonry.
 *
 * Randomness is seeded so (row, col) always yields the same brick.
 */

export interface BrickGeometry {
  brickWidth: number;
  brickHeight: number;
  mortar: number;
}

export interface BrickCell {
  row: number;
  col: number;
  x: number;
  y: number;
  variant: number;
  tone: number;
}

export interface BrickLayout {
  cols: number;
  rows: number;
  pitchX: number;
  pitchY: number;
  startX: number;
  cells: BrickCell[];
}

export interface BrickVariant {
  /** Closed path for the brick face + outline. */
  face: string;
  /** Rare hairline mark on the face, album-sleeve wear. */
  scratch?: string;
}

export const VARIANT_COUNT = 14;
export const TONE_COUNT = 5;

export const DESKTOP_GEOMETRY: BrickGeometry = {
  brickWidth: 140,
  brickHeight: 58,
  mortar: 0,
};

export const MOBILE_GEOMETRY: BrickGeometry = {
  brickWidth: 96,
  brickHeight: 42,
  mortar: 0,
};

const MAX_CELLS = 4200;

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function cellHash(row: number, col: number): number {
  let h = Math.imul(row + 1, 73856093) ^ Math.imul(col + 1, 19349663);
  h = Math.imul(h ^ (h >>> 13), 0x5bd1e995);
  return (h ^ (h >>> 15)) >>> 0;
}

export function computeLayout(
  width: number,
  height: number,
  geometry: BrickGeometry,
): BrickLayout {
  const pitchX = geometry.brickWidth + geometry.mortar;
  const pitchY = geometry.brickHeight + geometry.mortar;

  const cols = Math.max(1, Math.ceil(width / pitchX) + 2);
  const rows = Math.max(
    1,
    Math.min(Math.ceil(height / pitchY) + 1, Math.floor(MAX_CELLS / cols)),
  );
  const startX = -pitchX;

  const cells: BrickCell[] = [];

  for (let row = 0; row < rows; row += 1) {
    const rowOffset = row % 2 === 1 ? pitchX / 2 : 0;

    for (let col = 0; col < cols; col += 1) {
      const hash = cellHash(row, col);

      cells.push({
        row,
        col,
        x: startX + col * pitchX + rowOffset,
        y: row * pitchY,
        variant: hash % VARIANT_COUNT,
        tone: (hash >>> 5) % TONE_COUNT,
      });
    }
  }

  return { cols, rows, pitchX, pitchY, startX, cells };
}

export function cellIndexAt(
  layout: BrickLayout,
  localX: number,
  localY: number,
): number | null {
  const row = Math.floor(localY / layout.pitchY);
  if (row < 0 || row >= layout.rows) return null;

  const rowOffset = row % 2 === 1 ? layout.pitchX / 2 : 0;
  const col = Math.floor((localX - layout.startX - rowOffset) / layout.pitchX);
  if (col < 0 || col >= layout.cols) return null;

  return row * layout.cols + col;
}

const round = (value: number) => Math.round(value * 100) / 100;

/** Midpoint with a small lateral wobble — the sleeve's shaky pen line. */
function wobbleTo(
  from: [number, number],
  to: [number, number],
  wobble: number,
  along: number,
): string {
  const mx = from[0] + (to[0] - from[0]) * along;
  const my = from[1] + (to[1] - from[1]) * along;
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  // Perpendicular offset keeps the stroke looking hand-drawn, not ballooned.
  const nx = (-dy / len) * wobble;
  const ny = (dx / len) * wobble;
  return `Q${round(mx + nx)} ${round(my + ny)} ${round(to[0])} ${round(to[1])}`;
}

/**
 * One sleeve brick: nearly rectangular, corners slightly off, edges bowed
 * with a single mid-stroke wobble — like Gerald Scarfe's ink grid.
 */
export function buildVariant(
  index: number,
  width: number,
  height: number,
): BrickVariant {
  const rnd = mulberry32(index * 2654435761 + 1013904223);
  const jitter = (amount: number) => (rnd() - 0.5) * amount;

  // Tiny inset so neighbouring strokes don't perfectly cancel each other.
  const inset = 0.35;
  const topLeft: [number, number] = [
    inset + jitter(2.4),
    inset + jitter(1.8),
  ];
  const topRight: [number, number] = [
    width - inset + jitter(2.4),
    inset + jitter(1.8),
  ];
  const bottomRight: [number, number] = [
    width - inset + jitter(2.4),
    height - inset + jitter(1.8),
  ];
  const bottomLeft: [number, number] = [
    inset + jitter(2.4),
    height - inset + jitter(1.8),
  ];

  const face = [
    `M${round(topLeft[0])} ${round(topLeft[1])}`,
    wobbleTo(topLeft, topRight, (rnd() - 0.5) * 2.2, 0.35 + rnd() * 0.3),
    wobbleTo(topRight, bottomRight, (rnd() - 0.5) * 1.8, 0.4 + rnd() * 0.25),
    wobbleTo(bottomRight, bottomLeft, (rnd() - 0.5) * 2.2, 0.35 + rnd() * 0.3),
    wobbleTo(bottomLeft, topLeft, (rnd() - 0.5) * 1.8, 0.4 + rnd() * 0.25),
    "Z",
  ].join(" ");

  let scratch: string | undefined;
  if (rnd() > 0.82) {
    const x0 = 8 + rnd() * (width - 20);
    const y0 = 10 + rnd() * (height - 20);
    scratch = [
      `M${round(x0)} ${round(y0)}`,
      `L${round(x0 + 6 + rnd() * 10)} ${round(y0 + (rnd() - 0.5) * 4)}`,
    ].join(" ");
  }

  return { face, scratch };
}

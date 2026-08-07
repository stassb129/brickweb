"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  buildVariant,
  cellIndexAt,
  computeLayout,
  DESKTOP_GEOMETRY,
  TONE_COUNT,
  VARIANT_COUNT,
  type BrickGeometry,
} from "@/lib/brickGrid";
import styles from "./BrickField.module.scss";

export interface Graffiti {
  text: string;
  /** Anchor as fractions of the grid, so it lands on-screen at any size. */
  at: [colFraction: number, rowFraction: number];
  size?: number;
  rotate?: number;
}

interface BrickFieldProps {
  geometry?: BrickGeometry;
  /** Bricks warm up under the pointer. */
  interactive?: boolean;
  /** Knocking shakes the struck brick and its neighbours. */
  knockable?: boolean;
  graffiti?: Graffiti[];
  className?: string;
}

const NEIGHBOUR_OFFSETS = [-1, 1];

export default function BrickField({
  geometry = DESKTOP_GEOMETRY,
  interactive = true,
  knockable = true,
  graffiti = [],
  className,
}: BrickFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const brickGroupRef = useRef<SVGGElement>(null);
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9-]/g, "");

  const [size, setSize] = useState({ width: 1600, height: 900 });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((current) =>
        Math.abs(current.width - width) < 2 && Math.abs(current.height - height) < 2
          ? current
          : { width, height },
      );
    });

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const layout = useMemo(
    () => computeLayout(size.width, size.height, geometry),
    [size.width, size.height, geometry],
  );

  const variants = useMemo(
    () =>
      Array.from({ length: VARIANT_COUNT }, (_, index) =>
        buildVariant(index, geometry.brickWidth, geometry.brickHeight),
      ),
    [geometry.brickWidth, geometry.brickHeight],
  );

  const inscriptions = useMemo(
    () =>
      graffiti.map((item) => {
        const col = Math.round(layout.cols * item.at[0]);
        const row = Math.round(layout.rows * item.at[1]);
        const rowOffset = row % 2 === 1 ? layout.pitchX / 2 : 0;

        return {
          ...item,
          x: layout.startX + col * layout.pitchX + rowOffset + 8,
          y: row * layout.pitchY + geometry.brickHeight * 0.72,
        };
      }),
    [graffiti, layout, geometry.brickHeight],
  );

  useEffect(() => {
    if (!interactive && !knockable) return;

    const root = rootRef.current;
    const group = brickGroupRef.current;
    if (!root || !group) return;

    if (
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const bricks = group.children;
    let hotIndex: number | null = null;
    let frame = 0;
    let pending: { x: number; y: number } | null = null;

    const around = (index: number) => {
      const row = Math.floor(index / layout.cols);
      const col = index % layout.cols;
      const result: number[] = [];

      for (const step of NEIGHBOUR_OFFSETS) {
        if (col + step >= 0 && col + step < layout.cols) {
          result.push(index + step);
        }
        if (row + step >= 0 && row + step < layout.rows) {
          result.push(index + step * layout.cols);
        }
      }

      return result;
    };

    const paint = (index: number | null, add: boolean) => {
      if (index === null) return;

      bricks[index]?.classList.toggle(styles.hot, add);
      for (const neighbour of around(index)) {
        bricks[neighbour]?.classList.toggle(styles.warm, add);
      }
    };

    const flush = () => {
      frame = 0;
      if (!pending) return;

      const rect = root.getBoundingClientRect();
      const next = cellIndexAt(layout, pending.x - rect.left, pending.y - rect.top);
      if (next === hotIndex) return;

      paint(hotIndex, false);
      paint(next, true);
      hotIndex = next;
    };

    const handleMove = (event: MouseEvent) => {
      // Quiet zone under the prism spectrum — no hot/warm brick flicker there.
      if ((event.target as Element | null)?.closest?.("[data-mute-bricks]")) {
        if (hotIndex !== null) {
          paint(hotIndex, false);
          hotIndex = null;
        }
        return;
      }

      pending = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(flush);
    };

    const handleKnock = () => {
      if (!knockable || hotIndex === null) return;

      const struck = [hotIndex, ...around(hotIndex)];
      struck.forEach((index, order) => {
        const brick = bricks[index];
        if (!brick) return;

        brick.classList.remove(styles.knock);
        void (brick as SVGGraphicsElement).getBBox();
        (brick as SVGElement).style.setProperty("--knock-delay", `${order * 45}ms`);
        brick.classList.add(styles.knock);

        window.setTimeout(() => brick.classList.remove(styles.knock), 700);
      });
    };

    if (interactive) window.addEventListener("mousemove", handleMove, { passive: true });
    if (knockable) window.addEventListener("pointerdown", handleKnock, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("pointerdown", handleKnock);
      if (frame) cancelAnimationFrame(frame);
      paint(hotIndex, false);
    };
  }, [interactive, knockable, layout]);

  return (
    <div ref={rootRef} className={`${styles.root} ${className ?? ""}`} aria-hidden>
      <svg
        className={styles.svg}
        width={size.width}
        height={size.height}
        viewBox={`0 0 ${size.width} ${size.height}`}
        preserveAspectRatio="none"
      >
        <defs>
          {variants.map((variant, index) => (
            <g id={`${uid}-b${index}`} key={index}>
              <path className={styles.face} d={variant.face} />
              <path className={styles.outline} d={variant.face} />
              {variant.scratch && (
                <path className={styles.scratch} d={variant.scratch} />
              )}
            </g>
          ))}
        </defs>

        <rect className={styles.mortar} width={size.width} height={size.height} />

        <g ref={brickGroupRef}>
          {layout.cells.map((cell) => (
            <use
              key={`${cell.row}-${cell.col}`}
              href={`#${uid}-b${cell.variant}`}
              x={cell.x}
              y={cell.y}
              className={`${styles.brick} ${styles[`t${cell.tone % TONE_COUNT}`]}`}
            />
          ))}
        </g>

        {inscriptions.map((item, index) => (
          <text
            key={index}
            className={styles.graffiti}
            x={item.x}
            y={item.y}
            fontSize={item.size ?? 22}
            transform={item.rotate ? `rotate(${item.rotate} ${item.x} ${item.y})` : undefined}
          >
            {item.text}
          </text>
        ))}
      </svg>
    </div>
  );
}

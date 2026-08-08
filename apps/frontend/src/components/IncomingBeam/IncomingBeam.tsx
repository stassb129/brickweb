"use client";

import { useId, type CSSProperties } from "react";
import styles from "./IncomingBeam.module.scss";

type IncomingBeamProps = {
  open: boolean;
  /** Hide on small screens (hero). */
  hideOnNarrow?: boolean;
};

/**
 * Fixed white beam into the prism left face (viewBox 0–100, same as prism SVG).
 * Does not tilt with the prism. Tip + soft flare sit on the стык.
 */
export default function IncomingBeam({ open, hideOnNarrow = false }: IncomingBeamProps) {
  const uid = useId().replace(/:/g, "");
  const neonId = `incoming-neon-${uid}`;
  // Left face @ y=50 ≈ x=28.9; tip reaches the stroke.
  const x2 = 29.6;
  const y2 = 50;
  // Longer run from further below-left.
  const x1 = -22;
  const y1 = 68;
  const len = Math.hypot(x2 - x1, y2 - y1);

  return (
    <svg
      className={[
        styles.root,
        open ? styles.open : "",
        hideOnNarrow ? styles.hideOnNarrow : "",
      ]
        .filter(Boolean)
        .join(" ")}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
      style={{ "--len": len } as CSSProperties}
    >
      <defs>
        <filter
          id={neonId}
          x="-80%"
          y="-80%"
          width="260%"
          height="260%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="0.5" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Soft flare only — no hard disc (blur-only, no SourceGraphic). */}
        <radialGradient id={`flare-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="30%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="65%" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id={`fade-${uid}`}
          gradientUnits="userSpaceOnUse"
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
        >
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="22%" stopColor="#fff" stopOpacity="0.25" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <linearGradient
          id={`bloom-fade-${uid}`}
          gradientUnits="userSpaceOnUse"
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
        >
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="28%" stopColor="#fff" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.55" />
        </linearGradient>
      </defs>

      <line
        className={styles.bloom}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={`url(#bloom-fade-${uid})`}
        strokeWidth="0.7"
        strokeLinecap="butt"
        filter={`url(#${neonId})`}
        pathLength={len}
      />
      <line
        className={styles.core}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={`url(#fade-${uid})`}
        strokeWidth="0.22"
        strokeLinecap="butt"
        filter={`url(#${neonId})`}
        pathLength={len}
      />
      {/* Soft glow at стык — radial fade, not a solid circle */}
      <circle
        className={styles.flare}
        cx={x2}
        cy={y2}
        r="5.5"
        fill={`url(#flare-${uid})`}
      />
    </svg>
  );
}

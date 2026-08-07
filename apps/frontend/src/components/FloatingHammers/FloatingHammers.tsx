import type { CSSProperties } from "react";
import styles from "./FloatingHammers.module.scss";

interface Hammer {
  top: string;
  left: string;
  size: number;
  from: number;
  to: number;
  duration: number;
  delay: number;
}

// Hand-scattered rather than Math.random(): the layer is server-rendered, and
// random values would differ between server and client markup.
const HAMMERS: Hammer[] = [
  { top: "8%", left: "6%", size: 140, from: -14, to: 8, duration: 38, delay: 0 },
  { top: "22%", left: "76%", size: 180, from: 12, to: -10, duration: 46, delay: -6 },
  { top: "52%", left: "12%", size: 110, from: -6, to: 16, duration: 34, delay: -12 },
  { top: "66%", left: "60%", size: 156, from: 18, to: -4, duration: 52, delay: -3 },
  { top: "38%", left: "40%", size: 96, from: -20, to: 6, duration: 42, delay: -18 },
  { top: "82%", left: "28%", size: 128, from: 8, to: -16, duration: 48, delay: -9 },
  { top: "6%", left: "48%", size: 100, from: -10, to: 14, duration: 36, delay: -22 },
];

/**
 * Side-view claw hammer: face → poll → V-claw on top, thick handle below.
 * Drawn bold so the silhouette still reads at ~20% opacity over brickwork.
 */
function ClawHammer() {
  return (
    <g>
      {/* Metal head */}
      <path d="M2 10h26v16H2z" />
      {/* Striking face plate */}
      <path d="M0 8h4v20H0z" />
      {/* Claw */}
      <path d="M28 10h10l6 4-4 4h-6l-4 4H28z" />
      {/* Neck + handle */}
      <path d="M12 26h6v48c0 4-2 6-5 6h-2c-3 0-5-2-5-6V26z" />
      {/* Handle knob */}
      <path d="M8 76h14v6c0 3-2 5-5 5h-4c-3 0-5-2-5-5z" />
    </g>
  );
}

// The Wall emblem: two hammers crossed at mid-handle.
function HammerIcon() {
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-hidden
    >
      <g transform="translate(50 55) rotate(-35) translate(-14 -42)">
        <ClawHammer />
      </g>
      <g transform="translate(50 55) rotate(35) translate(-14 -42)">
        <ClawHammer />
      </g>
    </svg>
  );
}

export default function FloatingHammers() {
  return (
    <div className={styles.layer} aria-hidden>
      {HAMMERS.map((hammer, index) => (
        <span
          key={index}
          className={styles.hammer}
          style={
            {
              top: hammer.top,
              left: hammer.left,
              width: `${hammer.size}px`,
              height: `${hammer.size}px`,
              "--from": `${hammer.from}deg`,
              "--to": `${hammer.to}deg`,
              "--duration": `${hammer.duration}s`,
              "--delay": `${hammer.delay}s`,
            } as CSSProperties
          }
        >
          <HammerIcon />
        </span>
      ))}
    </div>
  );
}

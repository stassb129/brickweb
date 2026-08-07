"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PrismSpectrum from "@/components/PrismSpectrum/PrismSpectrum";
import { PRISM_TAGLINE } from "@/lib/prismSections";
import { playPrismSound } from "@/lib/sound";
import styles from "./HomeHeroPrism.module.scss";

/** Large decorative prism for the home hero — independent from the corner nav. */
export default function HomeHeroPrism() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const soundPlayed = useRef(false);

  const onPrismEnter = useCallback(() => {
    setOpen(true);
    if (!soundPlayed.current) {
      soundPlayed.current = true;
      void playPrismSound();
    }
  }, []);

  const onStageLeave = useCallback(() => {
    setOpen(false);
    soundPlayed.current = false;
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let latest: { x: number; y: number } | null = null;

    const flush = () => {
      frame = 0;
      if (!latest) return;
      const rect = root.getBoundingClientRect();
      const ox = (latest.x - rect.left) / rect.width - 0.5;
      const oy = (latest.y - rect.top) / rect.height - 0.5;
      root.style.setProperty("--tilt-y", `${ox * 16}deg`);
      root.style.setProperty("--tilt-x", `${oy * -12}deg`);
    };

    const onMove = (event: MouseEvent) => {
      latest = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(flush);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={styles.wrap}>
      <div
        ref={rootRef}
        className={`${styles.stage} ${open ? styles.open : ""}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={onStageLeave}
      >
        <p className={styles.tagline}>{PRISM_TAGLINE}</p>

        {/* Fixed: spectrum + outer incoming beam. */}
        <PrismSpectrum open={open} size="hero" interactive />
        <span className={styles.incoming} aria-hidden />

        {/* Tilts: triangle + inner beam + soft exit glow. */}
        <div className={styles.rig}>
          <span className={styles.core} aria-hidden />
          <span className={styles.exitGlow} aria-hidden />

          <button
            type="button"
            className={styles.prism}
            aria-expanded={open}
            aria-label="Показать разделы"
            onMouseEnter={onPrismEnter}
            onClick={() => setOpen((was) => !was)}
          >
            <svg className={styles.prismSvg} viewBox="0 0 100 100" aria-hidden>
              <polygon
                points="50,12 90,84 10,84"
                fill="rgba(255,255,255,0.04)"
                stroke="#ffffff"
                strokeWidth="1.85"
                strokeLinejoin="miter"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

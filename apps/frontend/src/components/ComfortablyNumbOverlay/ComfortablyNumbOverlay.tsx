"use client";

import { useEffect } from "react";
import FloatingLyrics from "@/components/FloatingLyrics/FloatingLyrics";
import { useIdleTimer } from "@/hooks/useIdleTimer";
import { startNumbDrone, stopNumbDrone } from "@/lib/sound";
import styles from "./ComfortablyNumbOverlay.module.scss";

const IDLE_MS = 15_000;

/**
 * Global Comfortably Numb easter egg: after 15s of stillness the UI cools,
 * blurs, slows (--global-speed), and floats Pink Floyd lyrics.
 */
export default function ComfortablyNumbOverlay() {
  const isIdle = useIdleTimer(IDLE_MS);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const root = document.documentElement;
    root.dataset.numb = isIdle ? "true" : "false";
    root.style.setProperty("--global-speed", isIdle ? "0.3" : "1");

    if (isIdle) {
      void startNumbDrone().catch(() => {});
    } else {
      stopNumbDrone();
    }

    return () => {
      root.dataset.numb = "false";
      root.style.setProperty("--global-speed", "1");
      stopNumbDrone();
    };
  }, [isIdle]);

  return (
    <div
      className={`${styles.overlay} ${isIdle ? styles.active : ""}`}
      aria-hidden={!isIdle}
    >
      {isIdle && <FloatingLyrics />}
    </div>
  );
}

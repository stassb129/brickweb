"use client";

import { useEffect, useState } from "react";
import BrickField, { type Graffiti } from "@/components/BrickField/BrickField";
import { DESKTOP_GEOMETRY, MOBILE_GEOMETRY } from "@/lib/brickGrid";
import styles from "./AnimatedWallBackground.module.scss";

interface AnimatedWallBackgroundProps {
  /** Warmer masonry tint used on the About page. */
  tint?: "default" | "warm";
  /** When true, the wall is scoped to a page section instead of the document. */
  local?: boolean;
}

// Only a couple of sleeve marks, parked at the margins so they never sit
// under the centred title / project grid.
const GRAFFITI: Graffiti[] = [
  { text: "another brick", at: [0.04, 0.18], size: 28, rotate: -6 },
  { text: "hey you", at: [0.78, 0.55], size: 34, rotate: 4 },
  { text: "is there anybody out there?", at: [0.06, 0.88], size: 20, rotate: -2 },
];

const LOCAL_GRAFFITI: Graffiti[] = [
  { text: "the thin ice", at: [0.72, 0.35], size: 22, rotate: 3 },
];

export default function AnimatedWallBackground({
  tint = "default",
  local = false,
}: AnimatedWallBackgroundProps) {
  const [lite, setLite] = useState(false);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 1024px)");
    const coarse = window.matchMedia("(pointer: coarse)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncLite = () => {
      setLite(narrow.matches || coarse.matches || reducedMotion.matches);
    };
    syncLite();

    narrow.addEventListener("change", syncLite);
    coarse.addEventListener("change", syncLite);
    reducedMotion.addEventListener("change", syncLite);

    return () => {
      narrow.removeEventListener("change", syncLite);
      coarse.removeEventListener("change", syncLite);
      reducedMotion.removeEventListener("change", syncLite);
    };
  }, []);

  return (
    <div
      className={`${styles.root} ${tint === "warm" ? styles.warm : ""} ${
        local ? styles.local : ""
      }`}
      aria-hidden
    >
      <BrickField
        geometry={lite ? MOBILE_GEOMETRY : DESKTOP_GEOMETRY}
        interactive={!lite}
        knockable={!lite}
        graffiti={local ? LOCAL_GRAFFITI : GRAFFITI}
      />
      {!lite && <div className={styles.noise} />}
    </div>
  );
}

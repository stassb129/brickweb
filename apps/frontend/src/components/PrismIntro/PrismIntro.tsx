"use client";

import { useEffect, useState, type CSSProperties } from "react";
import IncomingBeam from "@/components/IncomingBeam/IncomingBeam";
import PrismSpectrum from "@/components/PrismSpectrum/PrismSpectrum";
import { PRISM_TAGLINE } from "@/lib/prismSections";
import styles from "./PrismIntro.module.scss";

const LETTERS = "BRICKWEB".split("");

/** Survives SPA navigations; resets on full reload. */
let introPlayedThisLoad = false;

type Phase = "boot" | "title" | "assemble" | "beam" | "leaving" | "done";

/**
 * Full-screen intro only. Unmounts when finished — does not become the navigator.
 */
export default function PrismIntro() {
  const [phase, setPhase] = useState<Phase>(() =>
    introPlayedThisLoad ? "done" : "boot",
  );

  useEffect(() => {
    if (introPlayedThisLoad) {
      document.documentElement.dataset.intro = "done";
      return;
    }

    if (window.location.pathname !== "/" && window.location.pathname !== "") {
      introPlayedThisLoad = true;
      setPhase("done");
      document.documentElement.dataset.intro = "done";
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];

    document.documentElement.dataset.intro = "playing";
    document.body.style.overflow = "hidden";
    const previousRestoration = history.scrollRestoration;
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    const finish = () => {
      introPlayedThisLoad = true;
      setPhase("leaving");
      document.documentElement.dataset.intro = "done";
      document.body.style.overflow = "";
      if ("scrollRestoration" in history) {
        history.scrollRestoration = previousRestoration || "auto";
      }
      window.scrollTo(0, 0);
      timers.push(
        window.setTimeout(() => {
          setPhase("done");
        }, 700),
      );
    };

    if (reduced) {
      setPhase("assemble");
      timers.push(window.setTimeout(finish, 500));
    } else {
      setPhase("title");
      timers.push(window.setTimeout(() => setPhase("assemble"), 1400));
      timers.push(
        window.setTimeout(() => {
          setPhase("beam");
        }, 2400),
      );
      // Beam sequence is 2× slower on intro (~0.8s) — hold the reveal longer.
      timers.push(window.setTimeout(finish, 4600));
    }

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      document.body.style.overflow = "";
    };
  }, []);

  if (phase === "done" || phase === "boot") {
    if (phase === "boot" && !introPlayedThisLoad) {
      return <div className={styles.curtain} aria-hidden />;
    }
    return null;
  }

  const showTitle = phase === "title";
  const showPrism = phase === "assemble" || phase === "beam" || phase === "leaving";
  const raysOpen = phase === "beam" || phase === "leaving";

  return (
    <div
      className={`${styles.root} ${phase === "leaving" ? styles.leaving : ""}`}
      aria-hidden={phase === "leaving"}
    >
      <div className={styles.curtain} />

      {showTitle && (
        <div className={styles.titleOverlay}>
          <div className={styles.word} aria-label="BrickWeb">
            {LETTERS.map((letter, index) => (
              <span
                key={`${letter}-${index}`}
                className={styles.letter}
                style={{ animationDelay: `${0.08 + index * 0.08}s` } as CSSProperties}
              >
                {letter}
              </span>
            ))}
          </div>
        </div>
      )}

      {showPrism && (
        <div className={`${styles.stage} ${raysOpen ? styles.open : ""}`}>
          <p className={styles.tagline}>{PRISM_TAGLINE}</p>
          <IncomingBeam open={raysOpen} />
          <span className={styles.core} />
          <span className={styles.exitGlow} />

          <div className={styles.prism} aria-hidden>
            <svg className={styles.prismSvg} viewBox="0 0 100 100">
              <polygon
                points="50,12 90,84 10,84"
                fill="rgba(255,255,255,0.04)"
                stroke="#ffffff"
                strokeWidth="2.4"
                strokeLinejoin="miter"
              />
            </svg>
          </div>

          <PrismSpectrum open={raysOpen} size="intro" interactive={false} />
        </div>
      )}
    </div>
  );
}

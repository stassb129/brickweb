"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, useState, useSyncExternalStore } from "react";
import styles from "./BrickLoader.module.scss";

const LETTERS = "BRICKWEB".split("");
const PANEL_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];
const SESSION_KEY = "brickweb:loader-seen";

const wordVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.15 },
  },
};

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 60, rotateX: -70 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

type Phase = "building" | "opening" | "done";

interface BrickLoaderProps {
  onFinish?: () => void;
}

function readSeen(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function markLoaderSeen(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // Private mode / blocked storage — ignore.
  }
}

// sessionStorage is external to React; useSyncExternalStore keeps SSR
 // (getServerSnapshot → false) and the hydrated client in sync without a mismatch.
function useLoaderSeen(): boolean {
  return useSyncExternalStore(
    () => () => {},
    readSeen,
    () => false,
  );
}

export default function BrickLoader({ onFinish }: BrickLoaderProps) {
  const seenThisSession = useLoaderSeen();
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("building");

  const skip = seenThisSession || prefersReducedMotion === true;

  useEffect(() => {
    if (skip || phase !== "done") return;
    markLoaderSeen();
    onFinish?.();
  }, [skip, phase, onFinish]);

  useEffect(() => {
    if (skip || phase === "done") return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [skip, phase]);

  if (skip || phase === "done") return null;

  return (
    <div className={styles.root}>
      <motion.div
        className={`${styles.panel} ${styles.panelLeft}`}
        initial={{ x: 0 }}
        animate={{ x: phase === "opening" ? "-100%" : 0 }}
        transition={{ duration: 0.9, ease: PANEL_EASE }}
        onAnimationComplete={() => {
          if (phase === "opening") setPhase("done");
        }}
      />
      <motion.div
        className={`${styles.panel} ${styles.panelRight}`}
        initial={{ x: 0 }}
        animate={{ x: phase === "opening" ? "100%" : 0 }}
        transition={{ duration: 0.9, ease: PANEL_EASE }}
      />

      <motion.div
        className={styles.word}
        variants={wordVariants}
        initial="hidden"
        animate={phase === "building" ? "visible" : "hidden"}
        onAnimationComplete={(definition) => {
          if (definition === "visible") {
            window.setTimeout(() => setPhase("opening"), 420);
          }
        }}
      >
        {LETTERS.map((letter, index) => (
          <motion.span
            key={`${letter}-${index}`}
            className={styles.letter}
            variants={letterVariants}
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}

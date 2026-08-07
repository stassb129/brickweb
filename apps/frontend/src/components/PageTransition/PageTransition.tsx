"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import styles from "./PageTransition.module.scss";

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={styles.wrapper}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={pathname} className={styles.wrapper}>
        {/* Spectrum slit that wipes across — the prism’s dispersion as a page turn. */}
        <motion.div
          className={styles.spectrum}
          initial={{ scaleX: 1, opacity: 1 }}
          animate={{
            scaleX: 0,
            opacity: 0,
            transition: { duration: 0.55, ease: EASE, delay: 0.05 },
          }}
          exit={{
            scaleX: 1,
            opacity: 1,
            transition: { duration: 0.4, ease: EASE },
          }}
          aria-hidden
        />

        <motion.div
          className={styles.veil}
          initial={{ opacity: 1 }}
          animate={{ opacity: 0, transition: { duration: 0.45, delay: 0.12 } }}
          exit={{ opacity: 1, transition: { duration: 0.28 } }}
          aria-hidden
        />

        <motion.div
          initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration: 0.5, delay: 0.18, ease: EASE },
          }}
          exit={{
            opacity: 0,
            y: -8,
            filter: "blur(4px)",
            transition: { duration: 0.22 },
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

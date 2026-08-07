"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import styles from "./PageTransition.module.scss";

const CURTAIN_EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

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
    // `initial={false}` keeps the curtain still on first paint — BrickLoader
    // already owns the entrance, and running both looks like a stutter.
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={pathname} className={styles.wrapper}>
        <motion.div
          className={styles.curtain}
          // Enter: the wall that covered the old page slides down and away.
          initial={{ y: 0 }}
          animate={{ y: "100%" }}
          // Exit: a wall climbs from the bottom to hide the outgoing page.
          exit={{ y: 0 }}
          transition={{ duration: 0.55, ease: CURTAIN_EASE }}
          aria-hidden
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.2 } }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

"use client";

import { motion } from "framer-motion";
import { NUMB_QUOTES } from "@/lib/numb-lyrics";
import styles from "./FloatingLyrics.module.scss";

// Hand-placed so SSR/client markup stays identical.
const PLACEMENTS = [
  { top: "12%", left: "8%", dx: 40, dy: -30, delay: 0 },
  { top: "22%", left: "55%", dx: -50, dy: 20, delay: 0.4 },
  { top: "38%", left: "18%", dx: 30, dy: 40, delay: 0.8 },
  { top: "48%", left: "62%", dx: -35, dy: -25, delay: 1.1 },
  { top: "62%", left: "10%", dx: 45, dy: 15, delay: 1.5 },
  { top: "70%", left: "48%", dx: -20, dy: -40, delay: 1.9 },
  { top: "78%", left: "72%", dx: -40, dy: 25, delay: 2.2 },
  { top: "30%", left: "35%", dx: 25, dy: -15, delay: 2.6 },
];

export default function FloatingLyrics() {
  return (
    <div className={styles.layer} aria-hidden>
      {NUMB_QUOTES.map((quote, index) => {
        const place = PLACEMENTS[index % PLACEMENTS.length];

        return (
          <motion.p
            key={quote}
            className={styles.line}
            style={{ top: place.top, left: place.left }}
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 0.55, 0.35, 0.5],
              x: [0, place.dx, place.dx * 0.4, place.dx],
              y: [0, place.dy, place.dy * 0.5, place.dy],
            }}
            transition={{
              duration: 18,
              delay: place.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {quote}
          </motion.p>
        );
      })}
    </div>
  );
}

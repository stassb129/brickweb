"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useRef, type ReactNode } from "react";
import styles from "./WallSection.module.scss";

interface WallSectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

function useWallReveal(scrollYProgress: MotionValue<number>, reduce: boolean | null) {
  // Bricks "grow" out of the wall: rise from below and gain opacity as they
  // enter the viewport. Skipped entirely when the user asks for less motion.
  const y = useTransform(scrollYProgress, [0, 0.35], reduce ? [0, 0] : [80, 0]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.25],
    reduce ? [1, 1] : [0, 1],
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.4],
    reduce ? [1, 1] : [0.96, 1],
  );

  return { y, opacity, scale };
}

export default function WallSection({ children, className, id }: WallSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const { y, opacity, scale } = useWallReveal(scrollYProgress, prefersReducedMotion);

  return (
    <motion.section
      id={id}
      ref={ref}
      className={`${styles.section} ${className ?? ""}`}
      style={{ y, opacity, scale }}
    >
      {children}
    </motion.section>
  );
}

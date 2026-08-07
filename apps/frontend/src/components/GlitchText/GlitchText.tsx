"use client";

import { useEffect, useState } from "react";
import styles from "./GlitchText.module.scss";

interface GlitchTextProps {
  text: string;
  className?: string;
  /** Characters typed per second once the effect starts. */
  cps?: number;
  as?: "h1" | "h2" | "p" | "span";
}

export default function GlitchText({
  text,
  className,
  cps = 28,
  as: Tag = "h1",
}: GlitchTextProps) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let index = 0;

    const interval = window.setInterval(() => {
      index += 1;
      setShown(text.slice(0, index));
      if (index >= text.length) {
        window.clearInterval(interval);
        setDone(true);
      }
    }, 1000 / cps);

    return () => window.clearInterval(interval);
  }, [text, cps]);

  return (
    <Tag
      className={`${styles.root} ${done ? styles.done : ""} ${className ?? ""}`}
      data-text={shown}
    >
      {shown}
      {!done && <span className={styles.caret} aria-hidden />}
    </Tag>
  );
}

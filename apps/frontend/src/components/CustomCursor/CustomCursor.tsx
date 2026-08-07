"use client";

import { useEffect, useRef } from "react";
import styles from "./CustomCursor.module.scss";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    const cursor = cursorRef.current;
    if (!cursor) return;

    // Writing the transform straight to the node keeps the cursor off React's
    // render path — a state update per mousemove event visibly lags.
    const handleMove = (event: MouseEvent) => {
      cursor.style.transform = `translate3d(${event.clientX - 6}px, ${event.clientY - 6}px, 0)`;
      cursor.classList.add(styles.visible);
    };

    const handleLeave = () => cursor.classList.remove(styles.visible);

    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return <div ref={cursorRef} className={styles.cursor} aria-hidden />;
}

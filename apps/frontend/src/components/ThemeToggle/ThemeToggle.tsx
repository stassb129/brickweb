"use client";

import { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.scss";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "brickweb-theme";

/**
 * Runs before paint so the wall never flashes the wrong colour. Kept as a
 * string because it is injected into the document head.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');var t=s==='light'||s==='dark'?s:(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`;

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === "light" ? "light" : "dark");
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    setTheme(next);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode: the choice simply will not survive a reload.
    }
  };

  const isLight = theme === "light";

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={isLight ? "Включить тёмную стену" : "Включить светлую стену"}
      aria-pressed={mounted ? isLight : undefined}
      title={isLight ? "Night wall" : "Album wall"}
    >
      <span className={styles.face}>
        <span className={`${styles.icon} ${isLight ? styles.iconHidden : ""}`}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="4.4" fill="currentColor" />
            <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M12 2.4v2.6M12 19v2.6M2.4 12h2.6M19 12h2.6" />
              <path d="M5.2 5.2l1.9 1.9M16.9 16.9l1.9 1.9M18.8 5.2l-1.9 1.9M7.1 16.9l-1.9 1.9" />
            </g>
          </svg>
        </span>
        <span className={`${styles.icon} ${isLight ? "" : styles.iconHidden}`}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M20 14.2A8.4 8.4 0 019.8 4a8.6 8.6 0 102.8 16.7 8.6 8.6 0 007.4-6.5z"
              fill="currentColor"
            />
          </svg>
        </span>
      </span>
      <span className={styles.label}>{isLight ? "day" : "night"}</span>
    </button>
  );
}

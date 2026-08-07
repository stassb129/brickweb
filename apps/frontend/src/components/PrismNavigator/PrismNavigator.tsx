"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { playPrismSound } from "@/lib/sound";
import styles from "./PrismNavigator.module.scss";

interface Section {
  label: string;
  href: string;
  angle: number;
  color: string;
  length: number;
  match: (path: string) => boolean;
}

const SECTIONS: Section[] = [
  {
    label: "Проекты",
    href: "/",
    angle: -32,
    color: "#5ce1ff",
    length: 140,
    match: (path) => path === "/",
  },
  {
    label: "Обо мне",
    href: "/about",
    angle: -12,
    color: "#7dd3fc",
    length: 155,
    match: (path) => path.startsWith("/about"),
  },
  {
    label: "Lab",
    href: "/lab",
    angle: 8,
    color: "#a78bfa",
    length: 145,
    match: (path) => path.startsWith("/lab"),
  },
  {
    label: "Контакты",
    href: "/contact",
    angle: 26,
    color: "#9b6dff",
    length: 150,
    match: (path) => path.startsWith("/contact"),
  },
];

export default function PrismNavigator() {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  const activate = useCallback(() => {
    setIsActive((wasActive) => {
      if (!wasActive) void playPrismSound();
      return true;
    });
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return;

    let frame = 0;
    let latest: { x: number; y: number } | null = null;

    const flush = () => {
      frame = 0;
      if (!latest) return;

      const offsetX = latest.x / window.innerWidth - 0.5;
      const offsetY = latest.y / window.innerHeight - 0.5;

      root.style.setProperty("--tilt-y", `${offsetX * 26}deg`);
      root.style.setProperty("--tilt-x", `${offsetY * -18}deg`);
      root.style.setProperty("--sway", `${offsetY * 5}deg`);
    };

    const handleMove = (event: MouseEvent) => {
      latest = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(flush);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${isActive ? styles.active : ""}`}
      onMouseEnter={activate}
      onMouseLeave={() => setIsActive(false)}
      onFocus={activate}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsActive(false);
        }
      }}
    >
      <span className={styles.incoming} aria-hidden />

      <button
        type="button"
        className={styles.prism}
        aria-expanded={isActive}
        aria-label="Открыть навигацию"
        onClick={() => (isActive ? setIsActive(false) : activate())}
      >
        <svg className={styles.prismSvg} viewBox="0 0 100 100" aria-hidden>
          <defs>
            <linearGradient id="prism-face" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
              <stop offset="50%" stopColor="#8a8a8a" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.06" />
            </linearGradient>
            <linearGradient id="prism-edge" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#5ce1ff" />
              <stop offset="35%" stopColor="#7dd3fc" />
              <stop offset="70%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#9b6dff" />
            </linearGradient>
          </defs>

          <polygon
            points="50,10 92,84 8,84"
            fill="url(#prism-face)"
            stroke="url(#prism-edge)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <polyline
            points="50,10 50,84"
            stroke="url(#prism-edge)"
            strokeWidth="1"
            strokeOpacity="0.35"
            fill="none"
          />
        </svg>
      </button>

      <nav className={styles.rays} aria-label="Разделы">
        {SECTIONS.map((section, index) => {
          const isCurrent = section.match(pathname);

          return (
            <Link
              key={section.href}
              href={section.href}
              className={`${styles.ray} ${isCurrent ? styles.rayActive : ""}`}
              tabIndex={isActive ? 0 : -1}
              aria-current={isCurrent ? "page" : undefined}
              onClick={() => void playPrismSound()}
              style={
                {
                  "--angle": `${section.angle}deg`,
                  "--ray-color": section.color,
                  "--length": `${section.length}px`,
                  "--delay": `${index * 0.07}s`,
                } as CSSProperties
              }
            >
              <span className={styles.beam} aria-hidden />
              <span className={styles.label}>{section.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

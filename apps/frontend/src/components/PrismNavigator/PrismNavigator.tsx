"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import PrismSpectrum from "@/components/PrismSpectrum/PrismSpectrum";
import styles from "./PrismNavigator.module.scss";

/**
 * Always-docked corner navigator — independent from intro / hero prisms.
 * On `/` it stays hidden while the large hero prism is on screen, then
 * animates in as you scroll toward the projects wall — with the white beam.
 *
 * Root is a large invisible hit pad over the bottom-left corner.
 * Desktop: hover opens. Mobile: click/tap toggles.
 */
export default function PrismNavigator() {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [docked, setDocked] = useState(pathname !== "/");
  const [projectsLit, setProjectsLit] = useState(false);
  const [clickOnly, setClickOnly] = useState(false);

  const onRootLeave = useCallback(() => {
    setIsActive(false);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(
      "(hover: none), (pointer: coarse), (max-width: 1024px)",
    );
    const sync = () => setClickOnly(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setDocked(true);
      setProjectsLit(false);
      return;
    }

    const hero = document.getElementById("home-hero");
    if (!hero) {
      setDocked(true);
      return;
    }

    const update = () => {
      const rect = hero.getBoundingClientRect();
      setDocked(rect.bottom < window.innerHeight * 0.45);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/" || !docked) {
      setProjectsLit(false);
      return;
    }

    const projects = document.getElementById("projects");
    if (!projects) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setProjectsLit(entry.isIntersecting && entry.intersectionRatio >= 0.12);
      },
      { threshold: [0, 0.12, 0.35, 0.6] },
    );
    io.observe(projects);
    return () => io.disconnect();
  }, [pathname, docked]);

  // Mobile: tap outside closes.
  useEffect(() => {
    if (!clickOnly || !isActive) return;

    const onPointerDown = (event: PointerEvent) => {
      const root = rootRef.current;
      if (!root || root.contains(event.target as Node)) return;
      setIsActive(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [clickOnly, isActive]);

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
      root.style.setProperty("--tilt-y", `${offsetX * 22}deg`);
      root.style.setProperty("--tilt-x", `${offsetY * -16}deg`);
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

  const beamOn = isActive || projectsLit;
  const spectrumOpen = isActive || projectsLit;
  const soloHref = isActive ? null : projectsLit ? "/" : null;
  const activeHref =
    pathname === "/" && projectsLit
      ? "/"
      : pathname === "/"
        ? null
        : pathname.startsWith("/about")
          ? "/about"
          : pathname.startsWith("/lab")
            ? "/lab"
            : pathname.startsWith("/contact")
              ? "/contact"
              : null;

  const toggleActive = () => setIsActive((was) => !was);

  return (
    <div
      ref={rootRef}
      className={[
        styles.root,
        docked ? styles.docked : styles.stowed,
        isActive ? styles.active : "",
        projectsLit ? styles.projectsLit : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseEnter={() => {
        if (!clickOnly) setIsActive(true);
      }}
      onMouseLeave={() => {
        if (!clickOnly) onRootLeave();
      }}
      onClick={(event) => {
        if (!clickOnly) return;
        const target = event.target as Element | null;
        if (target?.closest("a")) return;
        toggleActive();
      }}
      onFocus={() => {
        if (!clickOnly) setIsActive(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsActive(false);
        }
      }}
      aria-hidden={!docked}
    >
      <div className={styles.dock}>
        <nav className={styles.menu} aria-label="Разделы">
          <PrismSpectrum
            // Remount on full open so every ray grows together (no half-awake solo state).
            key={isActive ? "nav-full" : projectsLit ? "nav-solo" : "nav-off"}
            open={spectrumOpen}
            size="nav"
            interactive
            soloHref={soloHref}
            activeHref={activeHref}
          />
        </nav>

        {/* Outer beam — fixed. */}
        <span
          className={`${styles.incoming} ${beamOn ? styles.incomingOn : ""}`}
          aria-hidden
        />

        {/* Triangle + inner beam — tilt. */}
        <div className={styles.rig}>
          <span
            className={`${styles.core} ${beamOn ? styles.coreOn : ""}`}
            aria-hidden
          />
          <span
            className={`${styles.exitGlow} ${beamOn ? styles.exitGlowOn : ""}`}
            aria-hidden
          />

          <button
            type="button"
            className={styles.prism}
            aria-expanded={isActive}
            aria-label="Открыть навигацию"
            tabIndex={docked ? 0 : -1}
            onClick={(event) => {
              // Desktop: button click still toggles; stop bubble so pad doesn't double-fire on mobile.
              event.stopPropagation();
              toggleActive();
            }}
          >
            <svg className={styles.prismSvg} viewBox="0 0 100 100" aria-hidden>
              <polygon
                points="50,12 90,84 10,84"
                fill="rgba(255,255,255,0.04)"
                stroke="#ffffff"
                strokeWidth="2.4"
                strokeLinejoin="miter"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

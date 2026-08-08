"use client";

import {
  useId,
  useMemo,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";
import SpectrumIcon from "@/components/PrismSpectrum/SpectrumIcon";
import {
  beamIntoMenuPath,
  getSpectrumWedges,
  layoutMenuBands,
  NAV_SPECTRUM_SPAN,
  polar,
  SPECTRUM_SPAN,
  spectrumViewBox,
  wedgePath,
  type SpectrumWedge,
} from "@/lib/prismSpectrum";
import { handleHashNavigation } from "@/lib/smoothScroll";
import styles from "./PrismSpectrum.module.scss";

type SpectrumSize = "hero" | "nav" | "intro";

interface PrismSpectrumProps {
  open: boolean;
  size?: SpectrumSize;
  interactive?: boolean;
  activeHref?: string | null;
  soloHref?: string | null;
}

const NAV_RADIUS = 200;

/** Beam run (apex → menu entry) in SVG units. */
const BEAM_RUN: Record<"hero" | "intro", number> = {
  hero: 280,
  intro: 240,
};

/** Menu plate length only — ray stops at the end of the item. */
const MENU_RUN: Record<"hero" | "intro", number> = {
  hero: 420,
  intro: 360,
};

/** Half-height of the full menu stack — compact rows, still readable. */
const PLATE_HALF: Record<"hero" | "intro", number> = {
  hero: 268,
  intro: 230,
};

function sectionHref(wedge: SpectrumWedge) {
  if (wedge.href === "/") return "#projects";
  return wedge.href;
}

export default function PrismSpectrum({
  open,
  size = "hero",
  interactive = true,
  activeHref = null,
  soloHref = null,
}: PrismSpectrumProps) {
  const uid = useId().replace(/:/g, "");
  const isNav = size === "nav";
  const rich = !isNav;
  const span = isNav ? NAV_SPECTRUM_SPAN : SPECTRUM_SPAN;
  const wedges = useMemo(() => getSpectrumWedges(span), [span]);
  const neonId = `spectrum-neon-${uid}`;
  const neonBloomId = `spectrum-neon-bloom-${uid}`;
  const smokeId = `spectrum-smoke-${uid}`;
  const count = wedges.length;

  const onNavigate = (event: ReactMouseEvent, href: string) => {
    event.preventDefault();
    if (href.startsWith("#")) {
      handleHashNavigation(href, { offset: 8 });
    } else {
      window.location.assign(href);
    }
  };

  if (rich) {
    const kind = size as "hero" | "intro";
    const pad = 24;
    const hitX = BEAM_RUN[kind];
    const menuEndX = hitX + MENU_RUN[kind];
    const plateHalf = PLATE_HALF[kind];
    const w = menuEndX + pad;
    const h = plateHalf * 2 + pad * 2;
    const apexX = 0;
    const apexY = h / 2;
    // Menu boxes first → rays aim at their top/bottom corners.
    const bands = layoutMenuBands(count, apexY, plateHalf);

    return (
      <div
        className={[
          styles.root,
          styles[size],
          styles.rich,
          open ? styles.open : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden={!open}
        style={{ "--n": count } as CSSProperties}
        data-mute-bricks={open ? "" : undefined}
      >
        <div className={styles.board}>
          <svg
            className={styles.svg}
            viewBox={`0 0 ${w} ${h}`}
            preserveAspectRatio="none"
            overflow="visible"
          >
            <defs>
              {/* Soft smoke inside the band. */}
              <filter
                id={smokeId}
                x="-15%"
                y="-35%"
                width="130%"
                height="170%"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur stdDeviation="4.5" result="s" />
                <feMerge>
                  <feMergeNode in="s" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Moderate line glow — weaker than the overblown pass. */}
              <filter
                id={neonBloomId}
                x="-140%"
                y="-140%"
                width="380%"
                height="380%"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur stdDeviation="3.6" result="wide" />
                <feMerge>
                  <feMergeNode in="wide" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter
                id={neonId}
                x="-80%"
                y="-80%"
                width="260%"
                height="260%"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur stdDeviation="1.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Smoke pulls color from the ribs inward; mid stays lighter. */}
              {wedges.map((wedge, i) => {
                const id = `track-${uid}-${i}`;
                return (
                  <linearGradient
                    key={id}
                    id={id}
                    gradientUnits="objectBoundingBox"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={wedge.color} stopOpacity="0.38" />
                    <stop offset="22%" stopColor={wedge.color} stopOpacity="0.16" />
                    <stop offset="50%" stopColor={wedge.color} stopOpacity="0.08" />
                    <stop offset="78%" stopColor={wedge.color} stopOpacity="0.16" />
                    <stop offset="100%" stopColor={wedge.color} stopOpacity="0.38" />
                  </linearGradient>
                );
              })}
            </defs>

            <g className={styles.beam}>
              {wedges.map((wedge, i) => {
                const box = bands[i];
                return (
                  <path
                    key={wedge.href}
                    d={beamIntoMenuPath(
                      apexX,
                      apexY,
                      hitX,
                      box.y0,
                      box.y1,
                    )}
                    fill={`url(#track-${uid}-${i})`}
                    className={styles.fill}
                    filter={`url(#${smokeId})`}
                  />
                );
              })}
            </g>

            <g className={styles.neons} filter={`url(#${neonBloomId})`}>
              {wedges.map((wedge, i) => {
                const box = bands[i];
                const edges = [
                  [apexX, apexY, hitX, box.y0],
                  [apexX, apexY, hitX, box.y1],
                  [hitX, box.y0, menuEndX, box.y0],
                  [hitX, box.y1, menuEndX, box.y1],
                ] as const;
                return (
                  <g key={`bloom-${wedge.href}`}>
                    {edges.map(([x1, y1, x2, y2], ei) => (
                      <line
                        key={ei}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={wedge.color}
                        className={styles.neonBloom}
                      />
                    ))}
                  </g>
                );
              })}
            </g>

            <g className={styles.neons} filter={`url(#${neonId})`}>
              {wedges.map((wedge, i) => {
                const box = bands[i];
                const edges = [
                  [apexX, apexY, hitX, box.y0],
                  [apexX, apexY, hitX, box.y1],
                  [hitX, box.y0, menuEndX, box.y0],
                  [hitX, box.y1, menuEndX, box.y1],
                ] as const;
                return (
                  <g key={wedge.href}>
                    {edges.map(([x1, y1, x2, y2], ei) => (
                      <line
                        key={`n-${ei}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={wedge.color}
                        className={styles.neon}
                      />
                    ))}
                    {edges.map(([x1, y1, x2, y2], ei) => (
                      <line
                        key={`c-${ei}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        className={styles.neonCore}
                      />
                    ))}
                  </g>
                );
              })}
            </g>
          </svg>

          <div className={styles.menu} role={interactive ? "list" : undefined}>
            {wedges.map((wedge, i) => {
              const box = bands[i];
              const href = sectionHref(wedge);
              const title = wedge.mock
                ? `${wedge.label} · скоро`
                : wedge.label;
              const isActive =
                activeHref != null && wedge.href === activeHref;
              const dormant = Boolean(soloHref && wedge.href !== soloHref);

              const rowStyle = {
                "--c": wedge.color,
                "--i": wedge.index,
                "--band-h": `${((box.y1 - box.y0) / h) * 100}%`,
                left: `${(hitX / w) * 100}%`,
                top: `${(box.midY / h) * 100}%`,
                width: `${((menuEndX - hitX) / w) * 100}%`,
              } as CSSProperties;

              const inner = (
                <>
                  <span className={styles.rowGlow} aria-hidden />
                  <span className={styles.icon}>
                    <SpectrumIcon name={wedge.icon} />
                  </span>
                  <span className={styles.copy}>
                    <span className={styles.title}>{title}</span>
                    <span className={styles.desc}>{wedge.description}</span>
                  </span>
                </>
              );

              const className = [
                styles.row,
                wedge.mock ? styles.rowMock : "",
                isActive ? styles.rowActive : "",
                dormant ? styles.rowDormant : "",
              ]
                .filter(Boolean)
                .join(" ");

              if (!interactive || wedge.mock || dormant) {
                return (
                  <div
                    key={wedge.href}
                    className={className}
                    style={rowStyle}
                    role={interactive ? "listitem" : undefined}
                  >
                    {inner}
                  </div>
                );
              }

              return (
                <a
                  key={wedge.href}
                  href={href}
                  className={className}
                  style={rowStyle}
                  role="listitem"
                  onClick={(event) => onNavigate(event, href)}
                >
                  {inner}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- Corner nav: compact polar wedges + labels ---------------------
  const radius = NAV_RADIUS;
  const { apexX, apexY, w, h } = spectrumViewBox(radius, 36, span);
  const bloomId = `spectrum-bloom-${uid}`;
  const softId = `spectrum-soft-${uid}`;

  return (
    <div
      className={[styles.root, styles.nav, open ? styles.open : ""]
        .filter(Boolean)
        .join(" ")}
      aria-hidden={!open}
      style={{ aspectRatio: `${w} / ${h}` }}
      data-mute-bricks={open ? "" : undefined}
    >
      <svg
        className={styles.svg}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMinYMid meet"
        overflow="visible"
      >
        <defs>
          <filter
            id={bloomId}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation={4.5} />
          </filter>
          <filter
            id={softId}
            x="-35%"
            y="-35%"
            width="170%"
            height="170%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation={2.2} />
          </filter>
        </defs>

        {wedges.map((wedge, index) => {
          const softD = wedgePath(
            wedge.startDeg - 1.1,
            wedge.endDeg + 1.1,
            radius,
            apexX,
            apexY,
          );
          const bloomD = wedgePath(
            wedge.startDeg - 2.4,
            wedge.endDeg + 2.4,
            radius * 1.04,
            apexX,
            apexY,
          );
          const hitD = wedgePath(
            wedge.startDeg,
            wedge.endDeg,
            radius,
            apexX,
            apexY,
          );
          const labelAt = polar(wedge.midDeg, radius * 0.55, apexX, apexY);
          const href = sectionHref(wedge);
          const label = wedge.mock ? `${wedge.label} · скоро` : wedge.label;
          const dormant = Boolean(soloHref && wedge.href !== soloHref);
          const rayStyle = { "--i": index, "--n": count } as CSSProperties;

          const body = (
            <>
              <path
                d={bloomD}
                fill={wedge.color}
                filter={`url(#${bloomId})`}
                className={styles.bloom}
              />
              <path
                d={softD}
                fill={wedge.color}
                filter={`url(#${softId})`}
                className={styles.soft}
              />
              <path
                d={hitD}
                className={[
                  styles.hit,
                  wedge.mock || dormant ? styles.hitMock : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
              <text
                x={labelAt.x}
                y={labelAt.y}
                className={`${styles.label} ${wedge.mock ? styles.labelMock : ""}`}
                transform={`rotate(${wedge.midDeg} ${labelAt.x} ${labelAt.y})`}
                textAnchor="start"
                dominantBaseline="middle"
              >
                {label}
              </text>
            </>
          );

          const grow = (
            <g transform={`translate(${apexX} ${apexY})`}>
              <g
                className={`${styles.ray} ${dormant ? styles.rayDormant : ""}`}
                style={rayStyle}
              >
                <g transform={`translate(${-apexX} ${-apexY})`}>{body}</g>
              </g>
            </g>
          );

          if (!interactive || wedge.mock || dormant) {
            return (
              <g key={wedge.href} className={styles.group}>
                {grow}
              </g>
            );
          }

          return (
            <a
              key={wedge.href}
              href={href}
              className={styles.link}
              onClick={(event) => onNavigate(event, href)}
            >
              {grow}
            </a>
          );
        })}
      </svg>
    </div>
  );
}

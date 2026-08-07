"use client";

import { useId, useMemo, type CSSProperties, type MouseEvent as ReactMouseEvent } from "react";
import {
  getSpectrumWedges,
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
  /**
   * When set, other wedges stay mounted but dormant (scale 0) so they can
   * animate in when this clears — used by the docked nav “projects lit” state.
   */
  soloHref?: string | null;
}

const RADIUS: Record<SpectrumSize, number> = {
  hero: 420,
  intro: 400,
  nav: 200,
};

const BLOOM_EXPAND = 2.4;
const SOFT_EXPAND = 1.1;

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
  const wedges = useMemo(() => getSpectrumWedges(SPECTRUM_SPAN), []);
  const bloomId = `spectrum-bloom-${uid}`;
  const softId = `spectrum-soft-${uid}`;
  const fadeId = `spectrum-fade-${uid}`;
  const maskId = `spectrum-mask-${uid}`;
  const radius = RADIUS[size];
  const { apexX, apexY, w, h } = spectrumViewBox(radius, isNav ? 36 : 52, SPECTRUM_SPAN);
  const count = wedges.length;

  return (
    <div
      className={[styles.root, styles[size], open ? styles.open : ""].filter(Boolean).join(" ")}
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
            <feGaussianBlur stdDeviation={isNav ? 4.5 : 14} />
          </filter>
          <filter
            id={softId}
            x="-35%"
            y="-35%"
            width="170%"
            height="170%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation={isNav ? 2.2 : 5.5} />
          </filter>
          <linearGradient id={fadeId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="58%" stopColor="#fff" stopOpacity="1" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id={maskId}>
            <rect width={w} height={h} fill={`url(#${fadeId})`} />
          </mask>
        </defs>

        {wedges.map((wedge, index) => {
          const softD = wedgePath(
            wedge.startDeg - SOFT_EXPAND,
            wedge.endDeg + SOFT_EXPAND,
            radius,
            apexX,
            apexY,
          );
          const bloomD = wedgePath(
            wedge.startDeg - BLOOM_EXPAND,
            wedge.endDeg + BLOOM_EXPAND,
            radius * 1.04,
            apexX,
            apexY,
          );
          const hitD = wedgePath(wedge.startDeg, wedge.endDeg, radius, apexX, apexY);
          const labelAt = polar(wedge.midDeg, radius * 0.5, apexX, apexY);
          const href = sectionHref(wedge);
          const isHash = href.startsWith("#");
          const label = wedge.mock ? `${wedge.label} · скоро` : wedge.label;
          const isActive = activeHref != null && wedge.href === activeHref;
          const dormant = Boolean(soloHref && wedge.href !== soloHref);

          const rayStyle = {
            "--i": index,
            "--n": count,
          } as CSSProperties;

          const body = (
            <>
              <path
                d={bloomD}
                fill={wedge.color}
                filter={`url(#${bloomId})`}
                className={styles.bloom}
                mask={`url(#${maskId})`}
              />
              <path
                d={softD}
                fill={wedge.color}
                filter={`url(#${softId})`}
                mask={`url(#${maskId})`}
                className={[
                  styles.soft,
                  wedge.mock ? styles.softMock : "",
                  isActive ? styles.softActive : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
              <path
                d={hitD}
                className={[styles.hit, wedge.mock || dormant ? styles.hitMock : ""]
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

          const onClick = (event: ReactMouseEvent) => {
            event.preventDefault();
            if (isHash) {
              handleHashNavigation(href, { offset: 8 });
            } else {
              window.location.assign(href);
            }
          };

          return (
            <a
              key={wedge.href}
              href={href}
              className={styles.link}
              onClick={onClick}
            >
              {grow}
            </a>
          );
        })}
      </svg>
    </div>
  );
}

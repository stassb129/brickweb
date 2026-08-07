import type { CSSProperties } from "react";
import styles from "./WallScrawl.module.scss";

interface WallScrawlProps {
  children: string;
  /** Degrees of rotation, sleeve-style. */
  rotate?: number;
  size?: "sm" | "md" | "lg";
  align?: "left" | "right" | "center";
  className?: string;
}

/** Red marker line that sits next to content and scrolls with the page. */
export default function WallScrawl({
  children,
  rotate = -3,
  size = "md",
  align = "left",
  className,
}: WallScrawlProps) {
  return (
    <p
      className={`${styles.scrawl} ${styles[size]} ${styles[align]} ${className ?? ""}`}
      style={{ "--scrawl-rotate": `${rotate}deg` } as CSSProperties}
      aria-hidden
    >
      {children}
    </p>
  );
}

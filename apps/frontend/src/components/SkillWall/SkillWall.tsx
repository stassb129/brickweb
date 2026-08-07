"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { fetchSkills, type Skill } from "@/lib/api";
import styles from "./SkillWall.module.scss";

const CATEGORY_CLASS: Record<string, string> = {
  Backend: styles.Backend,
  Frontend: styles.Frontend,
  Database: styles.Database,
  Tools: styles.Tools,
};

const ICON_GLYPH: Record<string, string> = {
  node: "⬡",
  nest: "▣",
  next: "▲",
  react: "◈",
  ts: "TS",
  postgres: "▤",
  docker: "▣",
  git: "⎇",
  cicd: "⟳",
  audio: "♫",
};

function sizeFor(level: number) {
  const width = 100 + level * 1.2;
  const height = 56 + level * 0.55;
  return { width, height };
}

export default function SkillWall() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { once: true, amount: 0.2 });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;

    fetchSkills()
      .then((data) => {
        if (!cancelled) setSkills(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.masonry}>
      {isLoading && <p className={styles.status}>Кладём стену навыков...</p>}
      {!isLoading && skills.length === 0 && (
        <p className={styles.status}>Навыки ещё не завезли.</p>
      )}

      {skills.map((skill, index) => {
        const { width, height } = sizeFor(skill.level);
        const categoryClass = CATEGORY_CLASS[skill.category] ?? styles.Tools;

        return (
          <motion.button
            key={skill.id}
            type="button"
            className={`${styles.brick} ${categoryClass}`}
            style={{
              width: `min(100%, ${width}px)`,
              minHeight: height,
            }}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 48, scaleY: 0.4 }}
            animate={
              inView
                ? { opacity: 1, y: 0, scaleY: 1 }
                : prefersReducedMotion
                  ? undefined
                  : { opacity: 0, y: 48, scaleY: 0.4 }
            }
            transition={{
              duration: 0.55,
              delay: prefersReducedMotion ? 0 : index * 0.07,
              ease: [0.16, 1, 0.3, 1],
            }}
            aria-label={`${skill.name}, ${skill.category}, ${skill.level}%`}
          >
            <span className={styles.inner}>
              <span className={styles.meta}>
                <span className={styles.icon}>
                  {ICON_GLYPH[skill.iconName] ?? skill.iconName}
                </span>
                <span className={styles.levelLabel}>{skill.level}%</span>
              </span>
              <h3 className={styles.name}>{skill.name}</h3>
              <span className={styles.levelBar} aria-hidden>
                <span
                  className={styles.levelFill}
                  style={{ width: `${skill.level}%` }}
                />
              </span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

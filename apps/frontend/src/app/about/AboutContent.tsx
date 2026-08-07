"use client";

import AnimatedWallBackground from "@/components/AnimatedWallBackground/AnimatedWallBackground";
import GlitchText from "@/components/GlitchText/GlitchText";
import SkillWall from "@/components/SkillWall/SkillWall";
import TimelineWall from "@/components/TimelineWall/TimelineWall";
import styles from "./page.module.scss";

export default function AboutContent() {
  return (
    <main className={styles.page}>
      <AnimatedWallBackground tint="warm" local />

      <div className={styles.inner}>
        <header className={styles.hero}>
          <GlitchText key="hero-glitch" text="Я строю цифровые стены" as="h1" />
          <p className={styles.lead}>
            Каждый навык — кирпич. Каждый год — ряд кладки. Собираю fullstack так,
            чтобы интерфейс ощущался как пространство, а не как таблица.
          </p>
        </header>

        <section id="skills" className={styles.section}>
          <h2 className={styles.heading}>Стена навыков</h2>
          <p className={styles.sectionLead}>
            Размер кирпича растёт с уровнем. Цвет — категория: Backend, Frontend,
            Database, Tools.
          </p>
          <SkillWall />
        </section>

        <section id="timeline" className={styles.section}>
          <h2 className={styles.heading}>Путь</h2>
          <p className={styles.sectionLead}>
            Годы уложены в полосу. Кликни кирпич — раскроется описание.
          </p>
          <TimelineWall />
        </section>
      </div>
    </main>
  );
}

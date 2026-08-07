import Link from "next/link";
import BrickWall from "@/components/BrickWall/BrickWall";
import HomeHeroPrism from "@/components/HomeHeroPrism/HomeHeroPrism";
import styles from "./page.module.scss";

export default function Home() {
  return (
    <main className={styles.main}>
      <section id="home-hero" className={styles.hero}>
        <HomeHeroPrism />
      </section>

      <div className={styles.content}>
        <h1 className={styles.srOnly}>BrickWeb — проекты</h1>

        <BrickWall />

        <section id="about" className={styles.section}>
          <h2 className={styles.sectionTitle}>Обо мне</h2>
          <p className={styles.sectionText}>
            Собираю fullstack-продукты из кирпичей: Nest.js и PostgreSQL внизу,
            Next.js и анимации сверху.{" "}
            <Link className={styles.contactLink} href="/about">
              Полная стена навыков →
            </Link>
          </p>
        </section>

        <section id="contacts" className={styles.section}>
          <h2 className={styles.sectionTitle}>Контакты</h2>
          <p className={styles.sectionText}>
            Пишите, если нужна стена, которая выдержит нагрузку.
          </p>
          <Link className={styles.contactLink} href="/contact">
            Связаться →
          </Link>
        </section>
      </div>
    </main>
  );
}

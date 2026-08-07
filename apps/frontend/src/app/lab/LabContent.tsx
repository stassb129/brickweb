"use client";

import dynamic from "next/dynamic";
import styles from "./page.module.scss";

const SynthesizerWall = dynamic(
  () => import("@/components/SynthesizerWall/SynthesizerWall"),
  {
    ssr: false,
    loading: () => <p className={styles.badge}>Загружаем стену…</p>,
  },
);

export default function LabContent() {
  return (
    <main className={styles.page}>
      <p className={styles.badge}>Lab · Play The Wall</p>
      <SynthesizerWall />
    </main>
  );
}

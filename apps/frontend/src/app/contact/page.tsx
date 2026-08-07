import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm/ContactForm";
import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "Контакты · BrickWeb",
  description: "Свяжитесь со мной — построим сообщение из кирпичей",
};

export default function ContactPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Свяжитесь со мной</h1>
      <p className={styles.lead}>
        Уложите три кирпича на площадке — имя, email и сообщение. Когда стена
        готова, нажмите «Построить».
      </p>
      <ContactForm />
      <a className={styles.mail} href="mailto:hello@brickweb.dev">
        или напишите напрямую: hello@brickweb.dev
      </a>
    </main>
  );
}

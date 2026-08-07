"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import styles from "./ContactForm.module.scss";
import { postContact } from "@/lib/api";

interface FormState {
  name: string;
  email: string;
  message: string;
}

type Phase = "editing" | "flying" | "success";

const INITIAL: FormState = { name: "", email: "", message: "" };

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [phase, setPhase] = useState<Phase>("editing");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const laid = useMemo(
    () => ({
      name: form.name.trim().length >= 2,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()),
      message: form.message.trim().length >= 10,
    }),
    [form],
  );

  const wallReady = laid.name && laid.email && laid.message;

  const onChange =
    (key: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
      setError(null);
    };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!wallReady || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await postContact({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setPhase("flying");
      window.setTimeout(() => {
        setPhase("success");
        setForm(INITIAL);
        setSubmitting(false);
      }, 900);
    } catch {
      setError("Не удалось отправить. Проверьте поля и попробуйте снова.");
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.root}>
      <AnimatePresence mode="wait">
        {phase === "success" ? (
          <motion.div
            key="success"
            className={styles.success}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <h2 className={styles.successTitle}>Сообщение отправлено</h2>
            <p className={styles.successText}>
              Стена собрана. Я отвечу, как только раствор высохнет.
            </p>
            <button
              type="button"
              className={styles.submit}
              onClick={() => setPhase("editing")}
            >
              Построить ещё
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            className={styles.yard}
            onSubmit={onSubmit}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={`${styles.wall} ${phase === "flying" ? styles.flying : ""}`}>
              {(
                [
                  {
                    key: "name" as const,
                    label: "Имя",
                    ready: laid.name,
                    node: (
                      <input
                        className={styles.input}
                        name="name"
                        autoComplete="name"
                        placeholder="Как к вам обращаться"
                        value={form.name}
                        onChange={onChange("name")}
                        required
                        minLength={2}
                      />
                    ),
                  },
                  {
                    key: "email" as const,
                    label: "Email",
                    ready: laid.email,
                    node: (
                      <input
                        className={styles.input}
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={onChange("email")}
                        required
                      />
                    ),
                  },
                  {
                    key: "message" as const,
                    label: "Сообщение",
                    ready: laid.message,
                    node: (
                      <textarea
                        className={styles.textarea}
                        name="message"
                        placeholder="Что строим?"
                        value={form.message}
                        onChange={onChange("message")}
                        required
                        minLength={10}
                      />
                    ),
                  },
                ] as const
              ).map((field, index) => (
                <motion.label
                  key={field.key}
                  className={`${styles.fieldBrick} ${field.ready ? styles.laid : ""}`}
                  initial={{ x: -80, opacity: 0 }}
                  animate={
                    phase === "flying"
                      ? {
                          y: -240 - index * 40,
                          x: (index - 1) * 60,
                          rotate: (index - 1) * 18,
                          opacity: 0,
                        }
                      : field.ready
                        ? { x: 0, opacity: 1, y: 0 }
                        : { x: -24, opacity: 0.85, y: 0 }
                  }
                  transition={{
                    duration: phase === "flying" ? 0.8 : 0.45,
                    delay: phase === "flying" ? index * 0.08 : index * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <span className={styles.label}>{field.label}</span>
                  {field.node}
                </motion.label>
              ))}
            </div>

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.submit}
                disabled={!wallReady || submitting || phase === "flying"}
              >
                Построить
              </button>
              <p className={`${styles.status} ${error ? styles.error : ""}`}>
                {error
                  ? error
                  : wallReady
                    ? "Стена готова к отправке."
                    : "Заполните три кирпича — стена сложится сама."}
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchTimeline, type TimelineEvent } from "@/lib/api";
import styles from "./TimelineWall.module.scss";

const TYPE_LABEL: Record<TimelineEvent["type"], string> = {
  work: "работа",
  education: "учёба",
  achievement: "достижение",
};

export default function TimelineWall() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchTimeline()
      .then((data) => {
        if (!cancelled) setEvents(data);
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
    <div className={styles.track}>
      <span className={styles.mortar} aria-hidden />

      {isLoading && <p className={styles.status}>Раствор ещё сохнет...</p>}
      {!isLoading && events.length === 0 && (
        <p className={styles.status}>Событий пока нет.</p>
      )}

      {events.map((event) => {
        const isOpen = openId === event.id;

        return (
          <button
            key={event.id}
            type="button"
            className={`${styles.brick} ${isOpen ? styles.open : ""}`}
            aria-expanded={isOpen}
            onClick={() => setOpenId(isOpen ? null : event.id)}
          >
            <span className={styles.body}>
              <span className={styles.year}>{event.year}</span>
              <h3 className={styles.title}>{event.title}</h3>
              <span className={styles.type}>{TYPE_LABEL[event.type]}</span>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.p
                    key="desc"
                    className={styles.description}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {event.description}
                  </motion.p>
                )}
              </AnimatePresence>
            </span>
          </button>
        );
      })}
    </div>
  );
}

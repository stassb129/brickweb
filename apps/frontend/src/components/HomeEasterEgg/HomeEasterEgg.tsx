"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import styles from "./HomeEasterEgg.module.scss";

const EasterEggHammers = dynamic(
  () => import("@/components/EasterEggHammers/EasterEggHammers"),
  { ssr: false },
);

const CLICKS_NEEDED = 3;

/**
 * Tiny near-invisible brick in the corner. Three clicks summon the marching hammers.
 * Pointer events only on the brick itself so the rest of the page stays normal.
 */
export default function HomeEasterEgg() {
  const [clicks, setClicks] = useState(0);
  const [active, setActive] = useState(false);

  const onBrickClick = () => {
    if (active) return;
    setClicks((n) => {
      const next = n + 1;
      if (next >= CLICKS_NEEDED) {
        setActive(true);
        return 0;
      }
      return next;
    });
  };

  const onComplete = useCallback(() => {
    setActive(false);
  }, []);

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-label="Hidden brick"
        title=""
        onClick={onBrickClick}
        data-progress={clicks}
      />
      <EasterEggHammers active={active} onComplete={onComplete} />
    </>
  );
}

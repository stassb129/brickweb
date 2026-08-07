"use client";

import { useEffect, useRef, useState } from "react";

const IDLE_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "wheel",
] as const;

/**
 * Fires `true` after `timeoutMs` of no pointer/keyboard activity,
 * and `false` as soon as the user moves again.
 */
export function useIdleTimer(timeoutMs = 15_000): boolean {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const clear = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const arm = () => {
      clear();
      timerRef.current = window.setTimeout(() => {
        setIsIdle(true);
      }, timeoutMs);
    };

    const onActivity = () => {
      // Only wake React when we were actually idle — avoids a render on every move.
      setIsIdle((wasIdle) => (wasIdle ? false : wasIdle));
      arm();
    };

    arm();

    for (const event of IDLE_EVENTS) {
      window.addEventListener(event, onActivity, { passive: true });
    }

    return () => {
      clear();
      for (const event of IDLE_EVENTS) {
        window.removeEventListener(event, onActivity);
      }
    };
  }, [timeoutMs]);

  return isIdle;
}

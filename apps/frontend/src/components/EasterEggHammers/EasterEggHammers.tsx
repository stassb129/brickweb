"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./EasterEggHammers.module.scss";

const DURATION_MS = 6200;
const STOMP_MS = 480;
const COLUMNS = 7;
const HAMMERS_PER_COLUMN = 6;

const QUOTE = "We don't need no education...";

interface EasterEggHammersProps {
  active: boolean;
  onComplete: () => void;
}

function ClawHammer() {
  return (
    <g>
      <path d="M2 10h26v16H2z" />
      <path d="M0 8h4v20H0z" />
      <path d="M28 10h10l6 4-4 4h-6l-4 4H28z" />
      <path d="M12 26h6v48c0 4-2 6-5 6h-2c-3 0-5-2-5-6V26z" />
      <path d="M8 76h14v6c0 3-2 5-5 5h-4c-3 0-5-2-5-5z" />
    </g>
  );
}

function MarchingHammerIcon() {
  return (
    <svg className={styles.hammer} viewBox="0 0 100 100" fill="currentColor" aria-hidden>
      <g transform="translate(50 55) rotate(-35) translate(-14 -42)">
        <ClawHammer />
      </g>
      <g transform="translate(50 55) rotate(35) translate(-14 -42)">
        <ClawHammer />
      </g>
    </svg>
  );
}

/** Short noise-burst stomp (no external sample). */
function playStomp(context: AudioContext) {
  const duration = 0.09;
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * duration), context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i += 1) {
    const t = i / data.length;
    data[i] = (Math.random() * 2 - 1) * (1 - t) ** 1.6;
  }

  const source = context.createBufferSource();
  source.buffer = buffer;

  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 420;

  const gain = context.createGain();
  gain.gain.setValueAtTime(0.55, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start();
}

export default function EasterEggHammers({ active, onComplete }: EasterEggHammersProps) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) return;

    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) {
      const timer = window.setTimeout(() => onCompleteRef.current(), DURATION_MS);
      return () => window.clearTimeout(timer);
    }

    const context = new Ctor();
    let intervalId = 0;
    let doneId = 0;
    let closed = false;

    const closeAudio = () => {
      if (closed) return;
      closed = true;
      if (context.state !== "closed") {
        void context.close().catch(() => undefined);
      }
    };

    const kick = () => {
      if (closed) return;
      void context.resume().then(() => {
        if (!closed && context.state === "running") playStomp(context);
      });
    };

    kick();
    intervalId = window.setInterval(kick, STOMP_MS);
    doneId = window.setTimeout(() => {
      window.clearInterval(intervalId);
      closeAudio();
      onCompleteRef.current();
    }, DURATION_MS);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(doneId);
      closeAudio();
    };
  }, [active]);

  if (!active) return null;

  return (
    <div className={`${styles.overlay} ${styles.visible}`} role="dialog" aria-label="Easter egg">
      <div className={styles.field} aria-hidden>
        {Array.from({ length: COLUMNS }, (_, col) => (
          <div
            key={col}
            className={styles.column}
            style={
              {
                left: `${6 + col * 13}%`,
                "--delay": `${(col % 3) * -0.35}s`,
              } as CSSProperties
            }
          >
            {Array.from({ length: HAMMERS_PER_COLUMN }, (_, row) => (
              <MarchingHammerIcon key={row} />
            ))}
          </div>
        ))}
      </div>
      <p className={styles.quote}>{QUOTE}</p>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { useSynth, type WaveShape, type SynthNote } from "@/hooks/useSynth";
import styles from "./SynthesizerWall.module.scss";

const WAVES: { id: WaveShape; label: string }[] = [
  { id: "sine", label: "Sin" },
  { id: "triangle", label: "Tri" },
  { id: "sawtooth", label: "Saw" },
  { id: "square", label: "Sqr" },
];

function volumeFromEvent(event: PointerEvent<HTMLButtonElement>): number {
  const target = event.currentTarget;
  if (!target) return 0.55;

  const rect = target.getBoundingClientRect();
  if (rect.width <= 0) return 0.55;
  return Math.min(0.95, Math.max(0.08, (event.clientX - rect.left) / rect.width));
}

function usePhoneOctaves(): number {
  const [octaves, setOctaves] = useState(3);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const sync = () => setOctaves(mq.matches ? 2 : 3);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return octaves;
}

export default function SynthesizerWall() {
  const octaves = usePhoneOctaves();
  const {
    ready,
    wave,
    heldId,
    notes,
    startAudio,
    setWaveShape,
    playNote,
    stopNote,
    setNoteVolume,
  } = useSynth(octaves);

  const holdingRef = useRef<string | null>(null);
  const lastHoverRef = useRef<string | null>(null);

  const rows = useMemo(() => {
    const map = new Map<number, SynthNote[]>();
    for (const note of notes) {
      const list = map.get(note.row) ?? [];
      list.push(note);
      map.set(note.row, list);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, list]) => list[0]);
  }, [notes]);

  const wallRows = useMemo(() => {
    const bricksPerRow = 10;
    return rows.map((note, rowIndex) =>
      Array.from({ length: bricksPerRow }, (_, col) => ({
        ...note,
        brickKey: `${note.id}-c${col}`,
        shade:
          (rowIndex + col) % 3 === 0
            ? ("red" as const)
            : (rowIndex + col) % 3 === 1
              ? ("dark" as const)
              : ("gray" as const),
      })),
    );
  }, [rows]);

  const onEnter = (event: PointerEvent<HTMLButtonElement>, note: SynthNote) => {
    if (!ready) return;
    if (holdingRef.current && holdingRef.current !== note.id) return;
    if (holdingRef.current === note.id) {
      setNoteVolume(note.id, volumeFromEvent(event));
      return;
    }
    if (lastHoverRef.current === note.id) return;
    lastHoverRef.current = note.id;
    void playNote(note, volumeFromEvent(event), false);
  };

  const onLeaveRow = (noteId: string) => {
    if (holdingRef.current === noteId) return;
    if (lastHoverRef.current === noteId) {
      lastHoverRef.current = null;
    }
  };

  const onDown = (event: PointerEvent<HTMLButtonElement>, note: SynthNote) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    holdingRef.current = note.id;
    void (async () => {
      if (!ready) await startAudio();
      await playNote(note, volumeFromEvent(event), true);
    })();
  };

  const onMove = (event: PointerEvent<HTMLButtonElement>, note: SynthNote) => {
    if (holdingRef.current !== note.id) return;
    setNoteVolume(note.id, volumeFromEvent(event));
  };

  const onUp = (event: PointerEvent<HTMLButtonElement>, note: SynthNote) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (holdingRef.current === note.id) {
      holdingRef.current = null;
      stopNote(note.id);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <h1 className={styles.title}>Synthesizer Wall</h1>
        <div className={styles.controls}>
          {!ready && (
            <button
              type="button"
              className={styles.unlock}
              onClick={() => void startAudio()}
            >
              Start Audio
            </button>
          )}
          {WAVES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.waveBtn} ${wave === item.id ? styles.waveActive : ""}`}
              onClick={() => setWaveShape(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <p className={styles.hint}>
        {ready
          ? "Наведение — короткий звук. Зажми кирпич — нота держится. Громкость слева→справа."
          : "Нажми Start Audio или любой кирпич — браузер разблокирует звук только по клику."}
      </p>

      <div className={styles.wall} aria-label="Кирпичный синтезатор">
        {wallRows.map((rowBricks, rowIndex) => (
          <div
            key={rows[rowIndex].id}
            className={styles.row}
            onPointerLeave={() => onLeaveRow(rows[rowIndex].id)}
          >
            {rowBricks.map((brick) => (
              <button
                key={brick.brickKey}
                type="button"
                className={`${styles.brick} ${styles[brick.shade]} ${
                  heldId === brick.id ? styles.held : ""
                }`}
                aria-label={`Нота ${brick.label}`}
                onPointerEnter={(event) => onEnter(event, brick)}
                onPointerDown={(event) => onDown(event, brick)}
                onPointerMove={(event) => onMove(event, brick)}
                onPointerUp={(event) => onUp(event, brick)}
                onPointerCancel={(event) => onUp(event, brick)}
              >
                <span className={styles.label}>{brick.label}</span>
                <span className={styles.ripple} aria-hidden />
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

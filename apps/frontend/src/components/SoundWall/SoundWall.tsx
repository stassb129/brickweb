"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import {
  ensureAudio,
  isAudioReady,
  playNoteOnce,
  startNote,
  stopNote,
  type WaveType,
} from "@/lib/sound";
import styles from "./SoundWall.module.scss";

interface NoteBrick {
  id: string;
  label: string;
  frequency: number;
  color: string;
}

interface Row {
  id: string;
  label: string;
  wave: WaveType;
  notes: NoteBrick[];
}

interface RecordedHit {
  noteId: string;
  frequency: number;
  wave: WaveType;
  time: number;
}

const SPECTRUM = [
  "#5ce1ff",
  "#38bdf8",
  "#818cf8",
  "#9b6dff",
  "#a78bfa",
  "#c4b5fd",
  "#7c3aed",
  "#22d3ee",
];

function buildPentatonic(baseHz: number): number[] {
  const ratios = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2];
  return ratios.map((ratio) => Math.round(baseHz * ratio));
}

const ROWS: Row[] = [
  {
    id: "sine",
    label: "Sine · soft wall",
    wave: "sine",
    notes: buildPentatonic(110).map((frequency, index) => ({
      id: `sine-${index}`,
      label: ["A", "B", "C#", "E", "F#", "A"][index],
      frequency,
      color: SPECTRUM[index],
    })),
  },
  {
    id: "triangle",
    label: "Triangle · mid wall",
    wave: "triangle",
    notes: buildPentatonic(165).map((frequency, index) => ({
      id: `tri-${index}`,
      label: ["E", "F#", "G#", "B", "C#", "E"][index],
      frequency,
      color: SPECTRUM[(index + 2) % SPECTRUM.length],
    })),
  },
  {
    id: "saw",
    label: "Saw · hard wall",
    wave: "sawtooth",
    notes: buildPentatonic(220).map((frequency, index) => ({
      id: `saw-${index}`,
      label: ["A", "B", "C#", "E", "F#", "A"][index],
      frequency,
      color: SPECTRUM[(index + 4) % SPECTRUM.length],
    })),
  },
];

export default function SoundWall() {
  // Lazy init avoids a sync setState-in-effect; on SSR this is always false.
  const [audioReady, setAudioReady] = useState(() =>
    typeof window !== "undefined" ? isAudioReady() : false,
  );
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tape, setTape] = useState<RecordedHit[]>([]);
  const recordStartedAt = useRef(0);
  const playTimers = useRef<number[]>([]);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const unlockAudio = useCallback(async () => {
    const context = await ensureAudio();
    setAudioReady(Boolean(context));
    return Boolean(context);
  }, []);

  const press = useCallback(async (note: NoteBrick, wave: WaveType) => {
    // pointerdown is a real gesture — this both unlocks and starts the note.
    const context = await ensureAudio();
    if (!context) return;

    setAudioReady(true);
    await startNote(note.frequency, wave, note.id);
    setActiveKeys((prev) => new Set(prev).add(note.id));

    if (isRecordingRef.current) {
      setTape((prev) => [
        ...prev,
        {
          noteId: note.id,
          frequency: note.frequency,
          wave,
          time: performance.now() - recordStartedAt.current,
        },
      ]);
    }
  }, []);

  const release = useCallback((noteId: string) => {
    stopNote(noteId);
    setActiveKeys((prev) => {
      const next = new Set(prev);
      next.delete(noteId);
      return next;
    });
  }, []);

  const onKeyPointerDown = (
    event: PointerEvent<HTMLButtonElement>,
    note: NoteBrick,
    wave: WaveType,
  ) => {
    event.preventDefault();
    // Capture so pointerup still fires if the cursor leaves the brick.
    event.currentTarget.setPointerCapture(event.pointerId);
    void press(note, wave);
  };

  const onKeyPointerUp = (
    event: PointerEvent<HTMLButtonElement>,
    noteId: string,
  ) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    release(noteId);
  };

  const toggleRecord = async () => {
    if (!(await unlockAudio())) return;

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setTape([]);
    recordStartedAt.current = performance.now();
    setIsRecording(true);
  };

  const playTape = async () => {
    if (tape.length === 0 || isPlaying) return;
    if (!(await unlockAudio())) return;

    setIsPlaying(true);
    playTimers.current = [];

    for (const hit of tape) {
      const timer = window.setTimeout(() => {
        void playNoteOnce(hit.frequency, hit.wave, 0.4);
        setActiveKeys((prev) => new Set(prev).add(hit.noteId));
        window.setTimeout(() => {
          setActiveKeys((prev) => {
            const next = new Set(prev);
            next.delete(hit.noteId);
            return next;
          });
        }, 280);
      }, hit.time);

      playTimers.current.push(timer);
    }

    const last = tape[tape.length - 1];
    const done = window.setTimeout(() => setIsPlaying(false), last.time + 500);
    playTimers.current.push(done);
  };

  useEffect(() => {
    return () => {
      for (const timer of playTimers.current) {
        window.clearTimeout(timer);
      }
      for (const row of ROWS) {
        for (const note of row.notes) {
          stopNote(note.id);
        }
      }
    };
  }, []);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.title}>Play The Wall</h1>
        <div className={styles.controls}>
          {!audioReady && (
            <button
              type="button"
              className={`${styles.button} ${styles.unlock}`}
              onClick={() => void unlockAudio()}
            >
              Enable Audio
            </button>
          )}
          <button
            type="button"
            className={`${styles.button} ${isRecording ? styles.recording : ""}`}
            onClick={() => void toggleRecord()}
          >
            {isRecording ? "Stop" : "Record"}
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={() => void playTape()}
            disabled={tape.length === 0 || isPlaying}
          >
            Play
          </button>
          <button
            type="button"
            className={styles.button}
            onClick={() => setTape([])}
            disabled={tape.length === 0}
          >
            Clear
          </button>
        </div>
      </div>

      <p className={styles.hint}>
        {audioReady
          ? "Зажми кирпич — услышишь ноту. Несколько сразу дают аккорд."
          : "Сначала нажми Enable Audio или любой кирпич — браузер блокирует звук без клика."}
        {tape.length > 0 ? ` Записано: ${tape.length}` : ""}
      </p>

      {ROWS.map((row) => (
        <div key={row.id} className={styles.row}>
          <p className={styles.rowLabel}>{row.label}</p>
          {row.notes.map((note) => (
            <button
              key={note.id}
              type="button"
              className={`${styles.key} ${activeKeys.has(note.id) ? styles.active : ""}`}
              style={{ "--note-color": note.color } as CSSProperties}
              onPointerDown={(event) => onKeyPointerDown(event, note, row.wave)}
              onPointerUp={(event) => onKeyPointerUp(event, note.id)}
              onPointerCancel={(event) => onKeyPointerUp(event, note.id)}
            >
              {note.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

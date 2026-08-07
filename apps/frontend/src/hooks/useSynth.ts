"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type WaveShape = "sine" | "triangle" | "sawtooth" | "square";

export interface SynthNote {
  id: string;
  label: string;
  frequency: number;
  row: number;
  shade: "red" | "dark" | "gray";
}

// C major pentatonic across ~2.5 octaves — pleasant in any order.
const PENTATONIC_RATIOS = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3];
const BASE_HZ = 98; // G2-ish, then climb
const DEFAULT_OCTAVES = 3;

export function buildBrickNotes(octaves = DEFAULT_OCTAVES): SynthNote[] {
  const notes: SynthNote[] = [];
  const names = ["C", "D", "E", "G", "A"];
  let row = 0;

  for (let octave = 0; octave < octaves; octave += 1) {
    for (let i = 0; i < PENTATONIC_RATIOS.length; i += 1) {
      const frequency = Math.round(BASE_HZ * 2 ** octave * PENTATONIC_RATIOS[i]);
      const shade: SynthNote["shade"] =
        row % 3 === 0 ? "red" : row % 3 === 1 ? "dark" : "gray";

      notes.push({
        id: `n-${octave}-${i}`,
        label: `${names[i]}${octave + 3}`,
        frequency,
        row,
        shade,
      });
      row += 1;
    }
  }

  return notes;
}

interface Voice {
  osc: OscillatorNode;
  gain: GainNode;
}

function createImpulse(context: AudioContext, seconds = 1.8): AudioBuffer {
  const rate = context.sampleRate;
  const length = Math.floor(rate * seconds);
  const buffer = context.createBuffer(2, length, rate);

  for (let channel = 0; channel < 2; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2.2;
    }
  }

  return buffer;
}

export function useSynth(octaves = DEFAULT_OCTAVES) {
  const contextRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const reverbRef = useRef<ConvolverNode | null>(null);
  const dryRef = useRef<GainNode | null>(null);
  const wetRef = useRef<GainNode | null>(null);
  const voicesRef = useRef<Map<string, Voice>>(new Map());
  const waveRef = useRef<WaveShape>("sine");

  const [ready, setReady] = useState(false);
  const [wave, setWave] = useState<WaveShape>("sine");
  const [heldId, setHeldId] = useState<string | null>(null);

  const ensureGraph = useCallback(async (): Promise<AudioContext | null> => {
    const Ctor =
      typeof window !== "undefined"
        ? window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext
        : undefined;

    if (!Ctor) return null;

    contextRef.current ??= new Ctor();
    const context = contextRef.current;

    if (!masterRef.current) {
      const master = context.createGain();
      master.gain.value = 0.85;

      const dry = context.createGain();
      dry.gain.value = 0.72;

      const wet = context.createGain();
      wet.gain.value = 0.38;

      const convolver = context.createConvolver();
      convolver.buffer = createImpulse(context);

      dry.connect(master);
      wet.connect(master);
      convolver.connect(wet);
      master.connect(context.destination);

      masterRef.current = master;
      dryRef.current = dry;
      wetRef.current = wet;
      reverbRef.current = convolver;
    }

    if (context.state === "suspended") {
      await context.resume();
    }

    const running = context.state === "running";
    setReady(running);
    return running ? context : null;
  }, []);

  const startAudio = useCallback(async () => {
    return Boolean(await ensureGraph());
  }, [ensureGraph]);

  const setWaveShape = useCallback((next: WaveShape) => {
    waveRef.current = next;
    setWave(next);
    for (const voice of voicesRef.current.values()) {
      voice.osc.type = next;
    }
  }, []);

  const stopNote = useCallback((id: string) => {
    const voice = voicesRef.current.get(id);
    const context = contextRef.current;
    if (!voice || !context) return;

    const now = context.currentTime;
    voice.gain.gain.cancelScheduledValues(now);
    voice.gain.gain.setValueAtTime(Math.max(voice.gain.gain.value, 0.0001), now);
    voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    window.setTimeout(() => {
      try {
        voice.osc.stop();
        voice.osc.disconnect();
        voice.gain.disconnect();
      } catch {
        // already stopped
      }
    }, 260);

    voicesRef.current.delete(id);
    setHeldId((current) => (current === id ? null : current));
  }, []);

  const playNote = useCallback(
    async (note: SynthNote, volume = 0.55, hold = false) => {
      const context = await ensureGraph();
      if (!context || !dryRef.current || !reverbRef.current) return;

      // One sustained voice per brick id; restart if already sounding.
      stopNote(note.id);

      const osc = context.createOscillator();
      const gain = context.createGain();

      osc.type = waveRef.current;
      osc.frequency.value = note.frequency;

      const level = Math.min(0.9, Math.max(0.05, volume)) * 0.22;
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(level, context.currentTime + 0.025);

      osc.connect(gain);
      gain.connect(dryRef.current);
      gain.connect(reverbRef.current);

      osc.start();
      voicesRef.current.set(note.id, { osc, gain });

      if (hold) {
        setHeldId(note.id);
      } else {
        // Brief hover pluck.
        gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);
        window.setTimeout(() => stopNote(note.id), 380);
      }
    },
    [ensureGraph, stopNote],
  );

  const setNoteVolume = useCallback((id: string, volume: number) => {
    const voice = voicesRef.current.get(id);
    const context = contextRef.current;
    if (!voice || !context) return;

    const level = Math.min(0.9, Math.max(0.05, volume)) * 0.22;
    voice.gain.gain.setTargetAtTime(level, context.currentTime, 0.04);
  }, []);

  const releaseAll = useCallback(() => {
    for (const id of [...voicesRef.current.keys()]) {
      stopNote(id);
    }
  }, [stopNote]);

  useEffect(() => {
    return () => {
      releaseAll();
      void contextRef.current?.close();
      contextRef.current = null;
      masterRef.current = null;
      dryRef.current = null;
      wetRef.current = null;
      reverbRef.current = null;
    };
  }, [releaseAll]);

  const notes = useMemo(() => buildBrickNotes(octaves), [octaves]);

  return {
    ready,
    wave,
    heldId,
    notes,
    startAudio,
    setWaveShape,
    playNote,
    stopNote,
    setNoteVolume,
    releaseAll,
  };
}

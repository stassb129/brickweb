let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const AudioContextCtor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (!AudioContextCtor) return null;

  // A single context is reused: browsers cap how many can exist per page, and
  // creating one per sound eventually throws.
  audioContext ??= new AudioContextCtor();
  return audioContext;
}

/**
 * Ensures the shared AudioContext exists and is running.
 * Must be called from a real user gesture (click / pointerdown / keydown) —
 * hover alone will not unlock autoplay policy.
 */
export async function ensureAudio(): Promise<AudioContext | null> {
  const context = getAudioContext();
  if (!context) return null;

  if (context.state === "suspended") {
    try {
      await context.resume();
    } catch {
      return null;
    }
  }

  return context.state === "running" ? context : null;
}

/** Sync peek for callers that already unlocked audio in this session. */
export function getRunningAudio(): AudioContext | null {
  const context = getAudioContext();
  return context?.state === "running" ? context : null;
}

export function isAudioReady(): boolean {
  return getAudioContext()?.state === "running";
}

/**
 * Prism hover chime — file in /public/sounds.
 * Hover alone may be blocked until the browser sees a prior gesture;
 * we unlock quietly on the first pointer/key interaction.
 */
const PRISM_SOUND_SRC = "/sounds/shine_sound.mp3";

let prismAudio: HTMLAudioElement | null = null;
let prismAudioUnlocked = false;

function getPrismAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!prismAudio) {
    prismAudio = new Audio(PRISM_SOUND_SRC);
    prismAudio.preload = "auto";
    prismAudio.volume = 0.55;
  }
  return prismAudio;
}

function unlockPrismAudio() {
  if (prismAudioUnlocked) return;
  const audio = getPrismAudio();
  if (!audio) return;

  const tryUnlock = () => {
    const wasMuted = audio.muted;
    audio.muted = true;
    void audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = wasMuted;
        prismAudioUnlocked = true;
      })
      .catch(() => {
        audio.muted = wasMuted;
      });
  };

  const onGesture = () => {
    tryUnlock();
    window.removeEventListener("pointerdown", onGesture);
    window.removeEventListener("keydown", onGesture);
  };

  window.addEventListener("pointerdown", onGesture, { once: true });
  window.addEventListener("keydown", onGesture, { once: true });
}

if (typeof window !== "undefined") {
  unlockPrismAudio();
}

/** Played only when the pointer enters the prism triangle itself. */
export async function playPrismSound(): Promise<void> {
  const audio = getPrismAudio();
  if (!audio) return;

  try {
    audio.pause();
    audio.currentTime = 0;
    await audio.play();
    prismAudioUnlocked = true;
  } catch {
    // Autoplay policy — ignore until unlocked by a gesture.
  }
}

/** Soft thud when a skill brick lands in the wall. */
export async function playBrickSound(): Promise<void> {
  const context = await ensureAudio();
  if (!context) return;

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(180, now);
  oscillator.frequency.exponentialRampToValueAtTime(55, now + 0.12);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(420, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.045, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.2);
}

let numbDrone: {
  osc: OscillatorNode;
  gain: GainNode;
  lfo: OscillatorNode;
  lfoGain: GainNode;
} | null = null;

/** Low pulsing drone for the Comfortably Numb idle state. */
export async function startNumbDrone(): Promise<void> {
  const context = await ensureAudio();
  if (!context || numbDrone) return;

  const osc = context.createOscillator();
  const gain = context.createGain();
  const lfo = context.createOscillator();
  const lfoGain = context.createGain();

  osc.type = "sine";
  osc.frequency.value = 55;

  lfo.type = "sine";
  lfo.frequency.value = 0.18;
  lfoGain.gain.value = 0.012;

  gain.gain.value = 0.0001;
  gain.gain.linearRampToValueAtTime(0.025, context.currentTime + 2.5);

  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);
  osc.connect(gain);
  gain.connect(context.destination);

  osc.start();
  lfo.start();

  numbDrone = { osc, gain, lfo, lfoGain };
}

export function stopNumbDrone(): void {
  if (!numbDrone || !audioContext) return;

  const { osc, gain, lfo } = numbDrone;
  const now = audioContext.currentTime;

  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), now);
  gain.gain.linearRampToValueAtTime(0.0001, now + 1.2);

  window.setTimeout(() => {
    try {
      osc.stop();
      lfo.stop();
      osc.disconnect();
      lfo.disconnect();
      gain.disconnect();
    } catch {
      // Already stopped.
    }
    numbDrone = null;
  }, 1300);
}

export type WaveType = OscillatorType;

const activeNotes = new Map<string, { osc: OscillatorNode; gain: GainNode }>();

/** Start a sustained note (for the lab keyboard). Returns a stop handle key. */
export async function startNote(
  frequency: number,
  type: WaveType = "sine",
  key?: string,
): Promise<string> {
  const noteKey = key ?? `${type}:${frequency}`;
  const context = await ensureAudio();
  if (!context) return noteKey;

  stopNote(noteKey);

  const osc = context.createOscillator();
  const gain = context.createGain();

  osc.type = type;
  osc.frequency.value = frequency;

  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.14, context.currentTime + 0.03);

  osc.connect(gain);
  gain.connect(context.destination);
  osc.start();

  activeNotes.set(noteKey, { osc, gain });
  return noteKey;
}

export function stopNote(key: string): void {
  const voice = activeNotes.get(key);
  if (!voice || !audioContext) return;

  const now = audioContext.currentTime;
  voice.gain.gain.cancelScheduledValues(now);
  voice.gain.gain.setValueAtTime(Math.max(voice.gain.gain.value, 0.0001), now);
  voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  window.setTimeout(() => {
    try {
      voice.osc.stop();
      voice.osc.disconnect();
      voice.gain.disconnect();
    } catch {
      // Already stopped.
    }
  }, 220);

  activeNotes.delete(key);
}

/** One-shot note for playback of a recorded sequence. */
export async function playNoteOnce(
  frequency: number,
  type: WaveType = "sine",
  duration = 0.35,
): Promise<void> {
  const context = await ensureAudio();
  if (!context) return;

  const now = context.currentTime;
  const osc = context.createOscillator();
  const gain = context.createGain();

  osc.type = type;
  osc.frequency.value = frequency;

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.14, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(context.destination);
  osc.start(now);
  osc.stop(now + duration + 0.05);
}

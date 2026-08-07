import type Lenis from "lenis";

const EASE_IN_OUT = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

let lenis: Lenis | null = null;
let activeFrame = 0;
let cancelListeners: Array<() => void> = [];

export function setSmoothScroller(instance: Lenis | null) {
  lenis = instance;
}

export function getSmoothScroller() {
  return lenis;
}

function stopNativeTween() {
  if (activeFrame) {
    cancelAnimationFrame(activeFrame);
    activeFrame = 0;
  }
  cancelListeners.forEach((off) => off());
  cancelListeners = [];
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function nativeScrollToY(endY: number, durationSec: number) {
  const startY = window.scrollY;
  const distance = endY - startY;
  if (Math.abs(distance) < 1) {
    window.scrollTo(0, endY);
    return;
  }

  stopNativeTween();

  if (prefersReducedMotion()) {
    window.scrollTo(0, endY);
    return;
  }

  const ms = Math.min(
    1300,
    Math.max(500, durationSec * 1000 * Math.min(1.4, Math.abs(distance) / 800)),
  );
  const started = performance.now();

  const abort = () => stopNativeTween();
  window.addEventListener("wheel", abort, { passive: true });
  window.addEventListener("touchstart", abort, { passive: true });
  window.addEventListener("keydown", abort);
  cancelListeners.push(() => {
    window.removeEventListener("wheel", abort);
    window.removeEventListener("touchstart", abort);
    window.removeEventListener("keydown", abort);
  });

  const tick = (now: number) => {
    const t = Math.min(1, (now - started) / ms);
    window.scrollTo(0, startY + distance * EASE_IN_OUT(t));
    if (t < 1) {
      activeFrame = requestAnimationFrame(tick);
    } else {
      activeFrame = 0;
      stopNativeTween();
    }
  };

  activeFrame = requestAnimationFrame(tick);
}

/** Smoothly scroll the window to an absolute Y position. */
export function smoothScrollToY(targetY: number, duration = 1.1) {
  const maxY = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  const endY = Math.max(0, Math.min(targetY, maxY));

  if (prefersReducedMotion()) {
    window.scrollTo(0, endY);
    return;
  }

  if (lenis) {
    // Intro may have stopped Lenis — force the programmatic scroll anyway.
    lenis.start();
    lenis.scrollTo(endY, { duration, immediate: false, force: true, programmatic: true });
    return;
  }

  nativeScrollToY(endY, duration);
}

function resolveElement(target: string | Element): HTMLElement | null {
  if (typeof target !== "string") {
    return target instanceof HTMLElement ? target : null;
  }
  const id = target.replace(/^#/, "");
  return document.getElementById(id);
}

/** Resolve a hash / id / element and scroll to it (works even if hash is unchanged). */
export function smoothScrollTo(
  target: string | Element,
  options: { offset?: number; duration?: number } = {},
) {
  const offset = options.offset ?? 0;
  const duration = options.duration ?? 1.15;
  const el = resolveElement(target);

  if (!el) return false;

  // Unlock any leftover intro lock.
  document.body.style.overflow = "";

  const y = el.getBoundingClientRect().top + window.scrollY - offset;

  if (lenis && !prefersReducedMotion()) {
    lenis.start();
    lenis.scrollTo(el, {
      offset: -offset,
      duration,
      force: true,
      programmatic: true,
    });
  } else {
    nativeScrollToY(y, duration);
  }

  return true;
}

/** Handle in-page hash navigation; returns true if the click was consumed. */
export function handleHashNavigation(
  href: string,
  options: { offset?: number; duration?: number; updateHash?: boolean } = {},
): boolean {
  if (!href.startsWith("#") || href === "#") return false;

  const scrolled = smoothScrollTo(href, options);
  if (!scrolled) return false;

  if (options.updateHash !== false) {
    const next = `${window.location.pathname}${window.location.search}${href}`;
    if (window.location.hash !== href) {
      history.pushState(null, "", next);
    } else {
      history.replaceState(null, "", next);
    }
  }

  return true;
}

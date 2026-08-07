"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  handleHashNavigation,
  setSmoothScroller,
  smoothScrollToY,
} from "@/lib/smoothScroll";

/**
 * Global smooth scrolling via Lenis + reliable hash / home re-clicks.
 *
 * Hash clicks are handled in the *capture* phase so Next.js <Link>
 * cannot swallow them with preventDefault before we scroll.
 */
export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const instance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.1,
      autoRaf: false,
    });

    setSmoothScroller(instance);

    const syncIntro = () => {
      const playing = document.documentElement.dataset.intro === "playing";
      if (playing) instance.stop();
      else instance.start();
    };
    syncIntro();
    const introObserver = new MutationObserver(syncIntro);
    introObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-intro"],
    });

    let frame = 0;
    const raf = (time: number) => {
      instance.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      introObserver.disconnect();
      setSmoothScroller(null);
      instance.destroy();
    };
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const hrefAttr = anchor.getAttribute("href");
      if (!hrefAttr) return;

      // In-page hash — capture before Next.js Link eats the event.
      if (hrefAttr.startsWith("#")) {
        event.preventDefault();
        event.stopPropagation();
        handleHashNavigation(hrefAttr, { offset: 8 });
        return;
      }

      try {
        const url = new URL(hrefAttr, window.location.href);
        const sameOrigin = url.origin === window.location.origin;
        const onHome = pathname === "/";
        const toHome = url.pathname === "/" || url.pathname === "";

        // /#projects from a Link that Next rewrote, or explicit hash on home.
        if (sameOrigin && toHome && url.hash && onHome) {
          event.preventDefault();
          event.stopPropagation();
          handleHashNavigation(url.hash, { offset: 8 });
          return;
        }

        // Already on home, plain `/` — ease back to top.
        if (sameOrigin && toHome && !url.hash && onHome) {
          event.preventDefault();
          event.stopPropagation();
          smoothScrollToY(0);
          history.pushState(null, "", "/");
        }
      } catch {
        // Ignore malformed hrefs.
      }
    };

    // Capture phase is required: Next <Link> preventDefaults in bubble.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  useEffect(() => {
    if (!window.location.hash) return;
    const id = window.location.hash;
    const timer = window.setTimeout(() => {
      handleHashNavigation(id, { offset: 8, updateHash: false });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return null;
}

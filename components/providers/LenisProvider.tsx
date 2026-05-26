"use client";

import { ReactNode, useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setRawProgress } from "@/lib/scroll/scrollStore";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * LenisProvider — owns the virtual scroll and broadcasts progress.
 *
 *  Lenis (smooth virtual scroll)
 *      │
 *      ├─► GSAP ticker (so ScrollTrigger reads virtual position)
 *      └─► scrollStore.raw (so every R3F component reads the SAME value)
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.55,
      // Custom expo-out — gives the dolly-camera that "weighty" feel
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
      lerp: 0.085,
    });
    lenisRef.current = lenis;

    function tickerUpdate(time: number) {
      lenis.raf(time * 1000);
    }
    gsap.ticker.add(tickerUpdate);
    gsap.ticker.lagSmoothing(0);

    // Single subscription updates the shared store. Every R3F component
    // reads from this store inside useFrame — no per-component window.scrollY.
    lenis.on("scroll", (e: { progress: number }) => {
      setRawProgress(e.progress);
      ScrollTrigger.update();
    });

    // Initialize progress immediately (in case scroll already happened)
    setRawProgress(lenis.progress ?? 0);

    return () => {
      gsap.ticker.remove(tickerUpdate);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}

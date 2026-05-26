"use client";

import { useEffect, useRef } from "react";

/**
 * CustomCursor — two-layer cursor (dot + halo).
 *
 * Implementation notes:
 *   - DOES NOT use React state. Position updates happen via direct
 *     transform mutation in rAF — zero re-renders, ~free.
 *   - Halo lags behind dot with eased lerp for that classic Awwwards feel.
 *   - Disabled on touch devices via `(pointer: coarse)` media query.
 *   - Cursor color flips to gold on `a, button` hover via mutation-free
 *     pointerover/pointerout listeners on the document.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: 0, y: 0 });
  const dotRef2 = useRef({ x: 0, y: 0 });
  const haloRef2 = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    // Hide native cursor — but only while custom cursor is mounted
    document.documentElement.style.cursor = "none";

    const onMove = (e: PointerEvent) => {
      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;
    };
    window.addEventListener("pointermove", onMove);

    const onOver = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      const interactive = t?.closest("a, button, [data-cursor='hover']");
      if (haloRef.current && dotRef.current) {
        if (interactive) {
          haloRef.current.dataset.hover = "true";
          dotRef.current.dataset.hover = "true";
        } else {
          haloRef.current.dataset.hover = "false";
          dotRef.current.dataset.hover = "false";
        }
      }
    };
    document.addEventListener("pointerover", onOver);

    let raf = 0;
    const tick = () => {
      // Dot follows target tightly
      dotRef2.current.x += (targetRef.current.x - dotRef2.current.x) * 0.5;
      dotRef2.current.y += (targetRef.current.y - dotRef2.current.y) * 0.5;
      // Halo lags
      haloRef2.current.x += (targetRef.current.x - haloRef2.current.x) * 0.15;
      haloRef2.current.y += (targetRef.current.y - haloRef2.current.y) * 0.15;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotRef2.current.x}px, ${dotRef2.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (haloRef.current) {
        haloRef.current.style.transform = `translate3d(${haloRef2.current.x}px, ${haloRef2.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      cancelAnimationFrame(raf);
      document.documentElement.style.cursor = "";
    };
  }, []);

  return (
    <>
      <div
        ref={haloRef}
        data-hover="false"
        className="pointer-events-none fixed left-0 top-0 z-[90] h-9 w-9 rounded-full border border-[var(--color-cyan)]/65 transition-[width,height,background-color,border-color] duration-200 data-[hover=true]:h-12 data-[hover=true]:w-12 data-[hover=true]:border-[var(--color-gold)] data-[hover=true]:bg-[var(--color-gold)]/10"
      />
      <div
        ref={dotRef}
        data-hover="false"
        className="pointer-events-none fixed left-0 top-0 z-[91] h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] shadow-[0_0_8px_rgba(54,232,255,0.9)] transition-colors duration-150 data-[hover=true]:bg-[var(--color-gold)] data-[hover=true]:shadow-[0_0_10px_rgba(245,210,124,0.9)]"
      />
    </>
  );
}

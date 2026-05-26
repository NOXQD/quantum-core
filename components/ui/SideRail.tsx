"use client";

import { useEffect, useRef } from "react";
import { scrollStore } from "@/lib/scroll/scrollStore";

/**
 * SideRail — fixed left-side navigation indicator.
 *
 * Reads scroll progress every frame via rAF (NOT React state) so it never
 * causes re-renders. The active section is computed from scroll progress,
 * and the visual highlight is moved by direct DOM mutation.
 *
 * Costs near-zero CPU. Sits outside the canvas; doesn't compete with 3D.
 */
const SECTIONS = [
  { id: "hero", label: "Пролог" },
  { id: "about", label: "Ядро" },
  { id: "technology", label: "Технология" },
  { id: "capabilities", label: "Возможности" },
  { id: "roadmap", label: "Будущее" },
  { id: "community", label: "Сообщество" },
];

export function SideRail() {
  const railRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    let rafId = 0;
    const tick = () => {
      const p = scrollStore.smooth;
      const idx = Math.min(
        SECTIONS.length - 1,
        Math.floor(p * SECTIONS.length)
      );
      if (railRef.current) {
        const items = railRef.current.children;
        for (let i = 0; i < items.length; i++) {
          const el = items[i] as HTMLElement;
          el.dataset.active = i === idx ? "true" : "false";
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <nav
      aria-label="Разделы"
      className="pointer-events-none fixed left-6 top-1/2 z-30 -translate-y-1/2"
    >
      <ul ref={railRef} className="flex flex-col gap-5">
        {SECTIONS.map((s) => (
          <li
            key={s.id}
            data-active="false"
            className="group/item pointer-events-auto flex items-center gap-3 transition-opacity data-[active=false]:opacity-50 data-[active=true]:opacity-100"
          >
            <a
              href={`#${s.id}`}
              className="flex items-center gap-3"
              aria-label={s.label}
            >
              <span
                className="h-px w-6 bg-white/60 transition-all group-data-[active=true]/item:w-10 group-data-[active=true]/item:bg-[var(--color-cyan)] group-data-[active=true]/item:shadow-[0_0_10px_rgba(54,232,255,0.8)]"
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/70 transition-colors group-data-[active=true]/item:text-white">
                {s.label}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

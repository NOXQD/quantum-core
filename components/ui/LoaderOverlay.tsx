"use client";

import { useEffect, useRef, useState } from "react";

/**
 * LoaderOverlay — opening curtain.
 *
 * Shows a full-screen black overlay with the brand mark + a determinate-ish
 * progress bar driven by a synthetic schedule (0 → 92% in ~1.6s, then waits
 * for `requestIdleCallback` to finish at 100%). Once dismissed it fades out
 * with a slight blur lift and is removed from the DOM (no leftover layer
 * fighting with pointer events).
 *
 * We don't tie progress to actual Suspense/Canvas readiness — that signal
 * is noisy and varies across devices. A short scripted reveal feels more
 * cinematic and is what premium sites do.
 */
export function LoaderOverlay() {
  const [progress, setProgress] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [removed, setRemoved] = useState(false);
  const rafRef = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const RAMP_MS = 1600;

    const tick = (now: number) => {
      const elapsed = now - start;
      // Ease-out cubic from 0 to 0.92
      const t = Math.min(1, elapsed / RAMP_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(eased * 92);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Final 92 → 100 on idle (or after a short fallback delay)
        const finish = () => {
          setProgress(100);
          setTimeout(() => setDismissed(true), 220);
          setTimeout(() => setRemoved(true), 1100);
        };
        if ("requestIdleCallback" in window) {
          (window as Window & {
            requestIdleCallback?: (cb: () => void) => void;
          }).requestIdleCallback?.(finish);
          // Fallback in case idle never fires within reasonable time
          setTimeout(finish, 350);
        } else {
          setTimeout(finish, 300);
        }
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  if (removed) return null;

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 z-[100] grid place-items-center bg-[var(--color-void)] transition-all duration-[850ms] ease-out ${
        dismissed ? "opacity-0 [filter:blur(12px)]" : "opacity-100"
      }`}
    >
      <div className="flex w-[280px] flex-col items-center gap-7">
        {/* Brand mark */}
        <div className="relative grid h-14 w-14 place-items-center">
          <span className="absolute inset-0 animate-[loader-pulse_2.4s_ease-in-out_infinite] rounded-full bg-[var(--color-violet)]/30 blur-xl" />
          <span className="relative grid h-10 w-10 place-items-center rounded-sm border border-[var(--color-violet)]/70">
            <span className="block h-3 w-3 rounded-full bg-[var(--color-cyan)] shadow-[0_0_18px_rgba(54,232,255,1)]" />
          </span>
        </div>

        <div className="w-full">
          <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.4em] text-white/60">
            <span>Инициализация ядра</span>
            <span className="tabular-nums">{Math.floor(progress)}%</span>
          </div>
          <div className="mt-3 h-px w-full overflow-hidden bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-[var(--color-violet)] via-[var(--color-cyan)] to-[var(--color-cyan)] shadow-[0_0_10px_rgba(54,232,255,0.8)]"
              style={{
                width: `${progress}%`,
                transition: "width 120ms linear",
              }}
            />
          </div>
        </div>

        <span className="font-mono text-[9px] uppercase tracking-[0.5em] text-white/35">
          Lumina · Quantum
        </span>
      </div>

      <style jsx>{`
        @keyframes loader-pulse {
          0%, 100% {
            transform: scale(0.85);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
}

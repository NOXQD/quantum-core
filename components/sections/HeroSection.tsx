"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

/**
 * HeroSection — first viewport. Reveals the title in three coordinated waves:
 *   1. Eyebrow ("LUMINA QUANTUM · 2026") slides up from below
 *   2. Massive "КВАНТОВОЕ ЯДРО" splits-letter reveal with gradient sweep
 *   3. Subtitle + scroll cue fade in with slight blur lift
 *
 * As the user scrolls past hero, the whole stack pins briefly then fades,
 * timed so the camera dolly begins just as the words dissolve.
 */
export function HeroSection() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Intro choreography on mount
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-eyebrow", { y: 24, opacity: 0, duration: 0.9 }, 0.2)
        .from(
          ".hero-title .letter",
          {
            yPercent: 110,
            opacity: 0,
            duration: 1.1,
            stagger: 0.045,
            ease: "expo.out",
          },
          0.45
        )
        .from(
          ".hero-subtitle",
          { y: 18, opacity: 0, duration: 1.0 },
          "-=0.5"
        )
        .from(
          ".hero-scroll",
          { y: -10, opacity: 0, duration: 0.8 },
          "-=0.4"
        );

      // Scroll-driven fade-out of the hero text so it dissolves as the
      // camera begins its approach toward the chandelier
      gsap.to(".hero-fade-block", {
        opacity: 0,
        y: -40,
        filter: "blur(8px)",
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      });
    },
    { scope: root }
  );

  const title = "КВАНТОВОЕ ЯДРО";

  return (
    <section
      ref={root}
      className="relative z-10 flex h-screen w-full items-center justify-center px-6"
    >
      <div className="hero-fade-block flex flex-col items-center text-center">
        <span className="hero-eyebrow font-mono text-[11px] uppercase tracking-[0.45em] text-[var(--color-cyan)]/80">
          Lumina Quantum · MMXXVI
        </span>

        <h1
          className="hero-title mt-6 font-display text-[clamp(2.6rem,9vw,8.5rem)] font-extrabold uppercase leading-[0.95] tracking-tight"
          aria-label={title}
        >
          {title.split("").map((ch, i) => (
            <span
              key={`${ch}-${i}`}
              className="letter inline-block"
              style={{
                color: "transparent",
                background:
                  "linear-gradient(180deg, #ffffff 0%, #c9b8ff 38%, #8a5cff 65%, #36e8ff 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                textShadow: "0 0 60px rgba(138,92,255,0.35)",
              }}
            >
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </h1>

        <p className="hero-subtitle mt-10 max-w-xl font-display text-base leading-relaxed text-[var(--color-ghost)] sm:text-lg">
          Машина, считающая реальность. Кубиты, запутанные сквозь геометрию
          света. Войди внутрь — и увидь, как вычисляется будущее.
        </p>

        <div className="hero-scroll mt-16 flex flex-col items-center gap-3 font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--color-ghost)]/60">
          <span>Прокрути, чтобы войти</span>
          <div className="relative h-12 w-px overflow-hidden bg-white/15">
            <span className="absolute left-0 top-0 h-4 w-px animate-[scroll-cue_1.8s_ease-in-out_infinite] bg-[var(--color-cyan)]" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-cue {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            transform: translateY(300%);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}

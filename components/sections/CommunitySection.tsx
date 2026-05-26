"use client";

/**
 * CommunitySection — final beat. Centered narrow CTA so it reads as a
 * "post-credits" moment after the camera settles into orbit.
 */
export function CommunitySection() {
  return (
    <section
      id="community"
      className="relative z-10 flex min-h-screen items-center justify-center px-8 pb-32"
    >
      <div className="max-w-md text-center">
        <span data-reveal className="font-mono text-[10px] uppercase tracking-[0.5em] text-[var(--color-cyan)]/80">
          Глава V · Сообщество
        </span>

        <h2 data-reveal className="mt-5 font-display text-[clamp(2.2rem,5vw,4rem)] font-bold leading-[1.02] tracking-tight text-white text-glow-violet">
          Кодируй<br />
          <span className="text-[var(--color-cyan)]">вселенную</span>
        </h2>

        <p data-reveal className="mx-auto mt-6 max-w-sm font-display text-[15px] leading-relaxed text-[var(--color-ghost)]">
          Исследователи. Инженеры. Дизайнеры реальности. Открытый ранний
          доступ к платформе и к команде, которая её строит.
        </p>

        <div data-reveal className="mt-10 flex items-center justify-center gap-4">
          <a
            href="#"
            className="group pointer-events-auto relative inline-flex items-center gap-2 rounded-full bg-[var(--color-violet)] px-6 py-3 font-mono text-[11px] uppercase tracking-[0.3em] text-white transition-all hover:bg-white hover:text-[var(--color-violet-deep)] hover:shadow-[var(--shadow-glow-violet)]"
          >
            Запросить доступ
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>
          <a
            href="#"
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.3em] text-white transition-all hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)]"
          >
            Документация
          </a>
        </div>

        <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--color-ghost)]/40">
          Lumina Quantum · Berlin · Цюрих · Сингапур
        </p>
      </div>
    </section>
  );
}

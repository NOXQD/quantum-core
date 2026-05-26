"use client";

/**
 * RoadmapSection — right-aligned vertical timeline.
 *
 * Each milestone is one row; an SVG-free dot rail is rendered via CSS
 * pseudo-elements so the timeline costs nothing beyond layout.
 */
const MILESTONES = [
  {
    year: "2026",
    title: "Lumina Q1",
    body: "Первая публичная демонстрация. 256 логических кубитов в когерентности 3 минуты.",
    done: true,
  },
  {
    year: "2027",
    title: "Lumina Q4",
    body: "1024 кубита. Коммерческий доступ через защищённое квантовое облако.",
    done: false,
  },
  {
    year: "2029",
    title: "Mesh",
    body: "Решётка из 12 ядер, связанных квантовой запутанностью на 400 км.",
    done: false,
  },
  {
    year: "2032",
    title: "Planetary",
    body: "Глобальная когерентная сеть. Любая точка планеты — один процессор.",
    done: false,
  },
];

export function RoadmapSection() {
  return (
    <section
      id="roadmap"
      className="relative z-10 flex min-h-screen items-center justify-end px-8 sm:px-14"
    >
      <div className="max-w-sm">
        <span data-reveal className="font-mono text-[10px] uppercase tracking-[0.5em] text-[var(--color-cyan)]/80">
          Глава IV · Карта будущего
        </span>

        <h2 data-reveal className="mt-5 font-display text-[clamp(2rem,4.5vw,3.6rem)] font-bold leading-[1.05] tracking-tight text-white text-glow-violet">
          От ядра<br />до планеты
        </h2>

        <ol data-reveal className="mt-10 relative flex flex-col gap-7 border-l border-[var(--color-violet)]/30 pl-6">
          {MILESTONES.map((m) => (
            <li key={m.year} className="relative">
              <span
                className={`absolute -left-[31px] top-1.5 grid h-2.5 w-2.5 place-items-center rounded-full ${
                  m.done
                    ? "bg-[var(--color-cyan)] shadow-[0_0_12px_rgba(54,232,255,0.9)]"
                    : "bg-[var(--color-violet)]/40 ring-1 ring-[var(--color-violet)]"
                }`}
              />
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-[11px] tracking-[0.25em] text-[var(--color-cyan)]/85">
                  {m.year}
                </span>
                <h3 className="font-display text-base font-semibold text-white">
                  {m.title}
                </h3>
              </div>
              <p className="mt-1.5 font-display text-[13px] leading-relaxed text-[var(--color-ghost)]/80">
                {m.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

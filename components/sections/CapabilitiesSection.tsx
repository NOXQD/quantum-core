"use client";

/**
 * CapabilitiesSection — 4 capability tiles in a vertical left column.
 * Each tile is intentionally narrow so the chandelier remains the focal
 * point of the frame.
 */
const ITEMS = [
  {
    glyph: "⌬",
    title: "Молекулярный дизайн",
    body: "Симуляция новых лекарств и материалов на уровне атомных орбиталей.",
  },
  {
    glyph: "⛓",
    title: "Криптография",
    body: "Алгоритм Шора ломает RSA за минуты. И строит постквантовую защиту.",
  },
  {
    glyph: "❉",
    title: "Климат-модель",
    body: "Прогноз планетарных систем с разрешением до отдельных вихрей атмосферы.",
  },
  {
    glyph: "✶",
    title: "AGI-обучение",
    body: "Параллельный поиск весов нейросети в 2^N измерениях гиперпространства.",
  },
];

export function CapabilitiesSection() {
  return (
    <section
      id="capabilities"
      className="relative z-10 flex min-h-screen items-center px-8 sm:px-14"
    >
      <div className="max-w-md">
        <span data-reveal className="font-mono text-[10px] uppercase tracking-[0.5em] text-[var(--color-cyan)]/80">
          Глава III · Возможности
        </span>

        <h2 data-reveal className="mt-5 font-display text-[clamp(2rem,4.5vw,3.6rem)] font-bold leading-[1.05] tracking-tight text-white text-glow-violet">
          Что<br />становится<br />возможным
        </h2>

        <ul data-reveal className="mt-10 flex flex-col gap-5">
          {ITEMS.map((it) => (
            <li
              key={it.title}
              className="group grid grid-cols-[auto_1fr] gap-x-4 border-l border-[var(--color-violet)]/30 pl-4 transition-colors hover:border-[var(--color-cyan)]"
            >
              <span className="font-display text-2xl leading-none text-[var(--color-cyan)] transition-colors group-hover:text-[var(--color-gold)]">
                {it.glyph}
              </span>
              <div>
                <h3 className="font-display text-base font-semibold text-white">
                  {it.title}
                </h3>
                <p className="mt-1 font-display text-[13px] leading-relaxed text-[var(--color-ghost)]/80">
                  {it.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

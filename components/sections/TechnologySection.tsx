"use client";

/**
 * TechnologySection — content lives in a slim right-aligned column during
 * the camera's mid-flythrough phase. Three principles stacked as
 * numbered cards (qubit, entanglement, superposition).
 */
export function TechnologySection() {
  return (
    <section
      id="technology"
      className="relative z-10 flex min-h-screen items-center justify-end px-8 sm:px-14"
    >
      <div className="max-w-sm">
        <span data-reveal className="font-mono text-[10px] uppercase tracking-[0.5em] text-[var(--color-cyan)]/80">
          Глава II · Технология
        </span>

        <h2 data-reveal className="mt-5 font-display text-[clamp(2rem,4.5vw,3.6rem)] font-bold leading-[1.05] tracking-tight text-white text-glow-violet">
          Три закона<br />новой логики
        </h2>

        <ol data-reveal className="mt-10 flex flex-col gap-7">
          <Principle
            num="01"
            title="Кубит"
            body="Единица, которая одновременно — ноль и единица. Не выбирает, пока не посмотришь."
          />
          <Principle
            num="02"
            title="Запутанность"
            body="Две частицы связаны быстрее света. Измерь одну — вторая мгновенно знает ответ."
          />
          <Principle
            num="03"
            title="Суперпозиция"
            body="N кубитов = 2^N состояний одновременно. 64 кубита считают параллельно 18 квинтиллионов вариантов."
          />
        </ol>
      </div>
    </section>
  );
}

function Principle({
  num,
  title,
  body,
}: {
  num: string;
  title: string;
  body: string;
}) {
  return (
    <li className="grid grid-cols-[auto_1fr] gap-x-4">
      <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--color-cyan)]/70">
        {num}
      </span>
      <div>
        <h3 className="font-display text-lg font-semibold text-white">
          {title}
        </h3>
        <p className="mt-1.5 font-display text-[13.5px] leading-relaxed text-[var(--color-ghost)]/85">
          {body}
        </p>
      </div>
    </li>
  );
}

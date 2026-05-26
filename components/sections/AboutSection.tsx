"use client";

/**
 * AboutSection — left-anchored content panel.
 *
 * Design philosophy:
 *   - All copy/UI lives in the LEFT THIRD of the viewport so the central
 *     2/3 stays clear for the 3D scene.
 *   - Compact metric chips give the page substance without visual weight.
 *   - Pure CSS — no R3F, no GSAP — keeps section render cost ~zero.
 */
export function AboutSection() {
  return (
    <section
      id="about"
      className="relative z-10 flex min-h-screen items-center px-8 sm:px-14"
    >
      <div className="max-w-md">
        <span data-reveal className="font-mono text-[10px] uppercase tracking-[0.5em] text-[var(--color-cyan)]/80">
          Глава I · О ядре
        </span>

        <h2 data-reveal className="mt-5 font-display text-[clamp(2rem,5vw,4rem)] font-bold leading-[1.02] tracking-tight text-white text-glow-violet">
          Не компьютер.<br />
          <span className="text-[var(--color-cyan)]">Конденсат света.</span>
        </h2>

        <p data-reveal className="mt-6 font-display text-[15px] leading-relaxed text-[var(--color-ghost)]">
          КВАНТОВОЕ ЯДРО — машина, удерживающая вычисления на грани
          вероятности. Здесь логика — не цепь, а волна. Состояние — не
          выбор, а суперпозиция всех возможных миров одновременно.
        </p>

        <dl data-reveal className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5">
          <Metric value="1 024" label="логических кубита" />
          <Metric value="10⁻³ K" label="рабочая температура" />
          <Metric value="99.97%" label="точность вентилей" />
          <Metric value="∞" label="параллельных миров" />
        </dl>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-l border-[var(--color-violet)]/40 pl-3">
      <dt className="font-display text-2xl font-semibold tracking-tight text-white">
        {value}
      </dt>
      <dd className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-ghost)]/65">
        {label}
      </dd>
    </div>
  );
}

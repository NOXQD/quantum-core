"use client";

/**
 * TopBar — minimal logo + status indicator. Sits at top, doesn't cover
 * the chandelier. Adds presence without weight.
 */
export function TopBar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between px-6 py-5 sm:px-10">
      <div className="flex items-center gap-3">
        <div
          className="grid h-6 w-6 place-items-center rounded-sm border border-[var(--color-violet)]/60"
          aria-hidden
        >
          <span className="block h-2 w-2 rounded-full bg-[var(--color-cyan)] shadow-[0_0_10px_rgba(54,232,255,0.9)]" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/85">
          Lumina · Quantum
        </span>
      </div>

      <div className="hidden items-center gap-3 sm:flex">
        <span className="relative flex h-2 w-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-[var(--color-cyan)]/60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-cyan)]" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/70">
          Когерентность · стабильна
        </span>
      </div>
    </header>
  );
}

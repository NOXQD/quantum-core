/**
 * Lightweight runtime tier detection. Heavy postFX/particles scale down on
 * low-end devices so we stay at 60fps.
 */
export type PerfTier = "low" | "mid" | "high";

export function detectTier(): PerfTier {
  if (typeof window === "undefined") return "high";

  // Hardware concurrency + device memory are coarse but reliable hints.
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  if (isMobile || cores <= 4 || mem <= 2) return "low";
  if (cores <= 6 || mem <= 4) return "mid";
  return "high";
}

export function dprForTier(tier: PerfTier): [number, number] {
  switch (tier) {
    case "low":
      return [1, 1.25];
    case "mid":
      return [1, 1.5];
    case "high":
      return [1, 2];
  }
}

export function particleCountForTier(tier: PerfTier, base: number): number {
  switch (tier) {
    case "low":
      return Math.round(base * 0.25);
    case "mid":
      return Math.round(base * 0.55);
    case "high":
      return base;
  }
}

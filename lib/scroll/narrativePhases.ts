/**
 * Cinematic narrative phases for the scroll-driven exploded-view sequence.
 *
 *   0.00 – 0.15  IDLE         chandelier whole, slow ceremonial rotation
 *   0.15 – 0.40  EXPLODE      parts fly outward radially, forming the tunnel
 *   0.40 – 0.65  FLYTHROUGH   camera inside tunnel, parts in formation, fx peak
 *   0.65 – 0.88  REASSEMBLE   parts pull back together behind camera
 *   0.88 – 1.00  RESOLVE      chandelier whole again, gentle orbit
 *
 * Helpers below map global progress p (0..1) → per-phase normalized t (0..1),
 * with smoothstep easing so transitions land soft, not snappy.
 */

export const PHASE = {
  idleEnd: 0.15,
  explodeEnd: 0.4,
  flythroughEnd: 0.65,
  reassembleEnd: 0.88,
} as const;

/** Standard smoothstep, used everywhere for cinematic blends. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Classic ease-in-out cubic — slightly stronger curve than smoothstep. */
export function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/** Ease-out expo — used for parts arriving into final positions. */
export function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

/**
 * Explode amount 0..1. Rises during EXPLODE, holds at 1 across FLYTHROUGH,
 * falls back to 0 during REASSEMBLE.
 */
export function explodeAmount(p: number): number {
  if (p < PHASE.idleEnd) return 0;
  if (p < PHASE.explodeEnd) {
    return easeInOutCubic(smoothstep(PHASE.idleEnd, PHASE.explodeEnd, p));
  }
  if (p < PHASE.flythroughEnd) return 1;
  if (p < PHASE.reassembleEnd) {
    return 1 - easeInOutCubic(
      smoothstep(PHASE.flythroughEnd, PHASE.reassembleEnd, p)
    );
  }
  return 0;
}

/**
 * Flythrough envelope — peaks at exactly mid-flythrough. Drives effect
 * intensities (warp streaks, energy arcs, chromatic aberration).
 */
export function flythroughEnvelope(p: number): number {
  if (p < PHASE.explodeEnd) return 0;
  if (p < PHASE.flythroughEnd) {
    const t = smoothstep(PHASE.explodeEnd, PHASE.flythroughEnd, p);
    // bell curve: 0 at edges, 1 at middle
    return Math.sin(t * Math.PI);
  }
  return 0;
}

/** True if we're inside the camera-flythrough window. */
export function isFlythrough(p: number): boolean {
  return p >= PHASE.explodeEnd && p <= PHASE.flythroughEnd;
}

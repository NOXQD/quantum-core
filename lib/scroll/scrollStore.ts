/**
 * Single source of truth for scroll progress.
 *
 * Why a module-level mutable ref instead of React state?
 *   - Every <Canvas> child wants the current scroll value per frame.
 *   - Putting it in React state would cause a re-render of the whole tree
 *     on every frame (catastrophic flicker + GC pressure).
 *   - Sharing via context-with-ref still forces re-subscribe noise.
 *   - A plain module object read inside useFrame is the cheapest option.
 *
 * Two values:
 *   raw    — latest unsmoothed progress (0..1), written by LenisProvider
 *   smooth — frame-lerped value, written by CameraRig in its useFrame
 *
 * Every animating component reads `smooth` so they all see the SAME value
 * within one frame → no cross-component jitter.
 */
export const scrollStore = {
  raw: 0,
  smooth: 0,
};

/** Set from LenisProvider on every Lenis scroll event. */
export function setRawProgress(p: number) {
  // Clamp defensively — Lenis can briefly overshoot at boundaries
  scrollStore.raw = Math.min(1, Math.max(0, p));
}

/** Called once per frame by CameraRig to advance the smoothed value. */
export function tickSmoothProgress(damp = 0.12) {
  scrollStore.smooth += (scrollStore.raw - scrollStore.smooth) * damp;
}

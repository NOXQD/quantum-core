import { CatmullRomCurve3, Vector3 } from "three";
import { PHASE } from "./narrativePhases";

/**
 * Camera path tuned to the exploded-view narrative.
 *
 * Z axis is the tunnel axis. The chandelier sits at origin; parts explode
 * outward along XY while the camera dollies forward along -Z, passes
 * through the tunnel, then rotates to face back at the reassembling
 * chandelier and finally settles into an orbit.
 *
 * Curve type is "centripetal" — eliminates overshoot/cusps that the
 * default "catmullrom" produced near waypoints (the visual "crookedness"
 * during flight). Centripetal parameterization is the standard for
 * cinematic / spline-driven cameras.
 *
 * Density is biased near tunnel entry (extra waypoint at z≈5) so the
 * arc-length parameterization (getPointAt) naturally SLOWS the camera
 * as it approaches the core — heavier, more realistic entry.
 */

export const CAMERA_POSITION_CURVE = new CatmullRomCurve3(
  [
    new Vector3(0.0, 1.5, 22.0), //  0.00 IDLE start (wide hold)
    new Vector3(0.0, 1.3, 14.5), //  0.13 IDLE end
    new Vector3(0.15, 0.85, 9.5), // 0.24 mid-explode — tiny offset for life
    new Vector3(0.0, 0.35, 5.2), //  0.33 APPROACH slowdown waypoint (NEW)
    new Vector3(0.0, 0.0, 2.6), //   0.40 TUNNEL ENTRY
    new Vector3(-0.12, -0.05, 0.0), // 0.52 TUNNEL MID (subtle drift)
    new Vector3(0.12, 0.05, -3.2), // 0.61 inside, drifting back
    new Vector3(0.6, 0.25, -5.6), //  0.68 TUNNEL EXIT (early swing start)
    new Vector3(3.8, 0.7, -6.4), //   0.76 swing out smooth
    new Vector3(8.8, 1.15, -2.5), // 0.88 orbit-in
    new Vector3(13.0, 1.3, 5.0), //  1.00 orbit end
  ],
  false,
  "centripetal"
);

export const CAMERA_TARGET_CURVE = new CatmullRomCurve3(
  [
    new Vector3(0.0, 0.4, 0.0), //  IDLE: chandelier center
    new Vector3(0.0, 0.45, 0.0), // IDLE end
    new Vector3(0.0, 0.3, -1.2), // mid-explode: lean forward
    new Vector3(0.0, 0.1, -3.0), // approach: look deeper (NEW pair)
    new Vector3(0.0, 0.0, -5.0), // tunnel entry: pointed straight in
    new Vector3(0.0, 0.0, -7.0), // tunnel mid
    new Vector3(0.0, 0.0, -8.5), // post-mid
    new Vector3(0.0, 0.15, -7.5), // exit: still mostly forward
    new Vector3(0.0, 0.35, -3.5), // swing: look back at cavity
    new Vector3(0.0, 0.4, -0.5), // orbit-in: reframe
    new Vector3(0.0, 0.4, 0.0), //  orbit end
  ],
  false,
  "centripetal"
);

/**
 * FOV envelope — dolly-zoom feel.
 * Eased with smoothstep so transitions are buttery, never linear-ramp.
 */
function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function fovForProgress(p: number): number {
  if (p < PHASE.idleEnd) return 38;
  if (p < PHASE.explodeEnd) {
    // 38 → 58, eased
    const t = smoothstep(PHASE.idleEnd, PHASE.explodeEnd, p);
    return 38 + t * 20;
  }
  if (p < PHASE.flythroughEnd) {
    // Bell curve: 58 → 72 (peak mid) → 50 (exit), eased
    const t = (p - PHASE.explodeEnd) / (PHASE.flythroughEnd - PHASE.explodeEnd);
    const bell = Math.sin(t * Math.PI); // 0..1..0
    const tail = smoothstep(0.5, 1.0, t); // ramp down only after peak
    return 58 + bell * 14 - tail * 8;
  }
  if (p < PHASE.reassembleEnd) {
    // 50 → 44, eased
    const t = smoothstep(PHASE.flythroughEnd, PHASE.reassembleEnd, p);
    return 50 - t * 6;
  }
  return 44;
}

/**
 * Banking roll — single gentle arc through the tunnel, not a zigzag.
 * Plus a counter-bank during reassemble swing so the camera "leans into"
 * the arc as it pivots around to look back. Subtle: max ±0.10 rad ≈ 5.7°.
 */
export function rollForProgress(p: number): number {
  if (p < PHASE.explodeEnd) return 0;
  if (p < PHASE.flythroughEnd) {
    // Single bell-curve bank, one direction only
    const t = (p - PHASE.explodeEnd) / (PHASE.flythroughEnd - PHASE.explodeEnd);
    return Math.sin(t * Math.PI) * 0.09;
  }
  if (p < PHASE.reassembleEnd) {
    // Counter-bank into the right swing
    const t =
      (p - PHASE.flythroughEnd) / (PHASE.reassembleEnd - PHASE.flythroughEnd);
    return Math.sin(t * Math.PI) * -0.07;
  }
  return 0;
}

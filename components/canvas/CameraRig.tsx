"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { Vector3, PerspectiveCamera as ThreePerspectiveCamera } from "three";
import {
  CAMERA_POSITION_CURVE,
  CAMERA_TARGET_CURVE,
  fovForProgress,
  rollForProgress,
} from "@/lib/scroll/cameraPath";
import { scrollStore, tickSmoothProgress } from "@/lib/scroll/scrollStore";

/**
 * CameraRig — sole writer of camera transform, sole "ticker" of the
 * smoothed scroll progress.
 *
 * Runs BEFORE other components in useFrame priority order (priority < 0)
 * so by the time chandelier parts read scrollStore.smooth they get the
 * value for the CURRENT frame, not last frame.
 *
 * Changes vs previous:
 *   - Frame-rate independent damp via 1 - exp(-rate * dt). Same
 *     response time at 45 fps and 75 fps; old fixed 0.25 lerp jittered.
 *   - Variable damp rate: heavier (slower) near tunnel entry → cinematic
 *     "weight" as we plunge into the core. Light during idle/orbit.
 *   - Banking is applied via camera.up rotation BEFORE lookAt rather
 *     than overwriting rotation.z after lookAt. The old approach fought
 *     with lookAt's matrix and produced micro-twitches each frame.
 */

const tmpPos = new Vector3();
const tmpTarget = new Vector3();
const currentPos = new Vector3();
const currentTarget = new Vector3();
let initialized = false;

export function CameraRig() {
  const { camera, size } = useThree();
  const fovRef = useRef(
    camera instanceof ThreePerspectiveCamera ? camera.fov : 38
  );

  useFrame((_, delta) => {
    // 1) Advance shared smoothed scroll value FIRST so every other
    //    useFrame consumer this frame reads a fresh, consistent number.
    tickSmoothProgress(0.14);
    const p = scrollStore.smooth;

    // 2) Sample camera curves (arc-length parameterized → uniform speed)
    CAMERA_POSITION_CURVE.getPointAt(p, tmpPos);
    CAMERA_TARGET_CURVE.getPointAt(p, tmpTarget);

    if (!initialized) {
      currentPos.copy(tmpPos);
      currentTarget.copy(tmpTarget);
      initialized = true;
    } else {
      const dt = Math.min(delta || 0.016, 0.05); // clamp big spikes
      // Heavier (lower rate) near tunnel entry — "weighty" approach.
      // Light elsewhere — snappy idle / orbit framing.
      let rate: number;
      if (p > 0.33 && p < 0.48) {
        rate = 3.8; // entry — slow, cinematic
      } else if (p < 0.15 || p > 0.88) {
        rate = 7.0; // idle / resolve — light
      } else {
        rate = 5.5; // mid-flight default
      }
      const k = 1 - Math.exp(-rate * dt);
      currentPos.lerp(tmpPos, k);
      currentTarget.lerp(tmpTarget, k);
    }

    // 3) Apply transform: position → up (banking) → lookAt
    camera.position.copy(currentPos);
    const roll = rollForProgress(p);
    // Bank by rotating the up vector around camera-forward axis.
    // sin/cos of small roll is cheap; no allocation (set is in-place).
    camera.up.set(Math.sin(roll), Math.cos(roll), 0);
    camera.lookAt(currentTarget);

    // 4) FOV (also frame-rate independent damp)
    if ((camera as ThreePerspectiveCamera).isPerspectiveCamera) {
      const persp = camera as ThreePerspectiveCamera;
      const targetFov = fovForProgress(p);
      const dt = Math.min(delta || 0.016, 0.05);
      const fovK = 1 - Math.exp(-5.0 * dt);
      fovRef.current += (targetFov - fovRef.current) * fovK;
      persp.fov = fovRef.current;
      persp.aspect = size.width / size.height;
      persp.updateProjectionMatrix();
    }
  }, -1);

  return null;
}

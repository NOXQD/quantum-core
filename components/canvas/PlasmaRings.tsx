"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  DoubleSide,
  Group,
  Mesh,
  ShaderMaterial,
  TorusGeometry,
  Vector3,
} from "three";
import { plasmaFragment, plasmaVertex } from "./shaders/plasmaShader";
import { PALETTE } from "@/lib/three/colors";
import { scrollStore } from "@/lib/scroll/scrollStore";
import {
  explodeAmount,
  flythroughEnvelope,
} from "@/lib/scroll/narrativePhases";

interface RingConfig {
  radius: number;
  tube: number;
  // Whole-state tilt
  tilt: [number, number, number];
  // Final tunnel-state tilt — all rings align perpendicular to z to form
  // a barrel of light around the camera path
  tunnelTilt: [number, number, number];
  // Final tunnel z-position (distributed along the tunnel)
  tunnelZ: number;
  color: keyof typeof PALETTE;
  speed: number;
  rotSpeed: [number, number, number];
  expandScale: number;
}

const RINGS: RingConfig[] = [
  {
    radius: 2.4,
    tube: 0.045,
    tilt: [0, 0, 0],
    tunnelTilt: [Math.PI / 2, 0, 0],
    tunnelZ: 2.5,
    color: "cyan",
    speed: 0.8,
    rotSpeed: [0, 0.35, 0],
    expandScale: 1.4,
  },
  {
    radius: 2.9,
    tube: 0.05,
    tilt: [Math.PI / 2.4, 0, 0],
    tunnelTilt: [Math.PI / 2, 0, 0],
    tunnelZ: 0.0,
    color: "violet",
    speed: -1.1,
    rotSpeed: [0.18, 0, 0.2],
    expandScale: 1.55,
  },
  {
    radius: 3.4,
    tube: 0.04,
    tilt: [0, 0, Math.PI / 2.7],
    tunnelTilt: [Math.PI / 2, 0, 0],
    tunnelZ: -2.5,
    color: "azure",
    speed: 1.4,
    rotSpeed: [0, -0.22, 0.18],
    expandScale: 1.7,
  },
  {
    radius: 3.9,
    tube: 0.04,
    tilt: [Math.PI / 3.5, Math.PI / 3, 0],
    tunnelTilt: [Math.PI / 2, 0, 0],
    tunnelZ: -5.0,
    color: "violet",
    speed: -0.6,
    rotSpeed: [0.05, 0.1, -0.15],
    expandScale: 1.85,
  },
];

// Pre-allocated vec for lerp math
const tmpVec = new Vector3();

/**
 * PlasmaRings — counter-rotating energy rings.
 *
 * Whole state: rings tilt artistically around the core.
 * Exploded state: rings re-orient perpendicular to z, expand outward, and
 * distribute along the tunnel axis — together they form a "barrel of light"
 * the camera flies through.
 */
export function PlasmaRings() {
  const groupRef = useRef<Group>(null);

  const rings = useMemo(
    () =>
      RINGS.map((cfg) => {
        const geometry = new TorusGeometry(cfg.radius, cfg.tube, 16, 256);
        const material = new ShaderMaterial({
          vertexShader: plasmaVertex,
          fragmentShader: plasmaFragment,
          uniforms: {
            uTime: { value: 0 },
            uColor: { value: PALETTE[cfg.color].clone() },
            uSpeed: { value: cfg.speed },
            uIntensity: { value: 2.2 },
          },
          transparent: true,
          blending: AdditiveBlending,
          depthWrite: false,
          side: DoubleSide,
        });
        return { cfg, geometry, material };
      }),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const p = scrollStore.smooth;
    const ex = explodeAmount(p);
    const fly = flythroughEnvelope(p);

    rings.forEach(({ material }) => {
      material.uniforms.uTime.value = t;
      // Intensity ramps up during flythrough — the barrel glows brightest
      // when the camera is inside it
      material.uniforms.uIntensity.value = 2.2 + fly * 3.0 + ex * 0.6;
    });

    if (!groupRef.current) return;

    groupRef.current.children.forEach((mesh, i) => {
      const cfg = RINGS[i];

      // --- Rotation ---
      // Whole-state continuous spin (cheap & smooth)
      const rx0 = cfg.rotSpeed[0] * t;
      const ry0 = cfg.rotSpeed[1] * t;
      const rz0 = cfg.rotSpeed[2] * t;

      // Whole-state tilt (lerped → tunnelTilt during explode)
      const targetRx = cfg.tilt[0] + (cfg.tunnelTilt[0] - cfg.tilt[0]) * ex;
      const targetRy = cfg.tilt[1] + (cfg.tunnelTilt[1] - cfg.tilt[1]) * ex;
      const targetRz = cfg.tilt[2] + (cfg.tunnelTilt[2] - cfg.tilt[2]) * ex;

      // Apply: when whole, free spin; when exploded, locked to tunnelTilt
      // (plus subtle wobble for life)
      const spinDamp = 1 - ex;
      mesh.rotation.x = targetRx + rx0 * spinDamp * 0.3;
      mesh.rotation.y = targetRy + ry0 * spinDamp * 0.3;
      mesh.rotation.z = targetRz + rz0 * spinDamp * 0.3 + ex * t * 0.4 * Math.sign(cfg.speed);

      // --- Position ---
      tmpVec.set(0, 0, 0);
      const targetZ = cfg.tunnelZ;
      tmpVec.z = targetZ * ex;
      // Slight axial wobble during flythrough
      tmpVec.z += Math.sin(t * 1.2 + i) * 0.05 * fly;
      mesh.position.copy(tmpVec);

      // --- Scale ---
      const scale = 1 + (cfg.expandScale - 1) * ex;
      mesh.scale.setScalar(scale);
    });

    // Group-level slow drift only when whole — locked when exploded
    if (groupRef.current) {
      groupRef.current.rotation.z = (1 - ex) * Math.sin(t * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {rings.map(({ cfg, geometry, material }, i) => (
        <mesh
          key={i}
          geometry={geometry}
          material={material}
          rotation={cfg.tilt}
        />
      ))}
    </group>
  );
}

"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  Color,
  Euler,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  OctahedronGeometry,
  Quaternion,
  Vector3,
} from "three";
import { PALETTE } from "@/lib/three/colors";
import { scrollStore } from "@/lib/scroll/scrollStore";
import {
  easeInOutCubic,
  explodeAmount,
  flythroughEnvelope,
  smoothstep,
} from "@/lib/scroll/narrativePhases";

/**
 * Optimized chandelier crystals.
 *
 * Major perf wins vs previous version:
 *   1. InstancedMesh: 1 draw call instead of ~58
 *   2. MeshStandardMaterial + emissive instead of MeshPhysicalMaterial with
 *      transmission — transmission requires rendering scene to a target
 *      per material every frame; emissive is free.
 *   3. Single OctahedronGeometry (no per-shard variant switching).
 *   4. Pre-allocated reusable Object3D/Quaternion/Euler/Vector3 — zero
 *      allocations per frame.
 *   5. Material color updated once per frame, not per shard.
 */

const SHARD_COUNT = 50;

interface Shard {
  whole: [number, number, number];
  baseRot: [number, number, number];
  scale: number;
  tunnel: [number, number, number];
  stagger: number;
  spinSpeed: [number, number, number];
}

function generateShards(): Shard[] {
  const shards: Shard[] = [];
  const RINGS = [
    { count: 12, y: 2.4, r: 5.2, scale: 0.55 },
    { count: 16, y: 0.6, r: 6.4, scale: 0.7 },
    { count: 14, y: -1.6, r: 5.6, scale: 0.5 },
    { count: 8, y: -3.4, r: 3.8, scale: 0.42 },
  ];
  RINGS.forEach((ring, ringIdx) => {
    for (let i = 0; i < ring.count; i++) {
      const a = (i / ring.count) * Math.PI * 2 + Math.random() * 0.15;
      const jitter = (Math.random() - 0.5) * 0.6;
      const whole: [number, number, number] = [
        Math.cos(a) * (ring.r + jitter),
        ring.y + (Math.random() - 0.5) * 0.6,
        Math.sin(a) * (ring.r + jitter),
      ];

      const outR = 6.5 + Math.random() * 2.0;
      const tunnelZ =
        -6 + (ringIdx / RINGS.length) * 10 + (Math.random() - 0.5) * 1.8;
      const tunnelAngle = a + (Math.random() - 0.5) * 0.4;
      const tunnel: [number, number, number] = [
        Math.cos(tunnelAngle) * outR,
        Math.sin(tunnelAngle) * outR * 0.7 + ring.y * 0.3,
        tunnelZ,
      ];

      shards.push({
        whole,
        baseRot: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ],
        scale: ring.scale * (0.75 + Math.random() * 0.6),
        tunnel,
        stagger: Math.random() * 0.5,
        spinSpeed: [
          (Math.random() - 0.5) * 1.4,
          (Math.random() - 0.5) * 1.4,
          (Math.random() - 0.5) * 1.4,
        ],
      });
    }
  });
  return shards;
}

// Module-level reusables — never reallocate inside useFrame
const dummy = new Object3D();
const tmpEuler = new Euler();
const tmpQuat = new Quaternion();
const tmpVec = new Vector3();
const tmpColor = new Color();

export function ChandelierCrystals() {
  const meshRef = useRef<InstancedMesh>(null);
  const shards = useMemo(generateShards, []);
  const geometry = useMemo(() => new OctahedronGeometry(1, 0), []);

  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: new Color("#dcd5ff"),
        metalness: 0.6,
        roughness: 0.25,
        emissive: PALETTE.violet.clone(),
        emissiveIntensity: 0.45,
        // No transmission, no clearcoat — keeps it cheap
      }),
    []
  );

  // Place initial transforms ONCE after mount
  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < shards.length; i++) {
      const s = shards[i];
      dummy.position.set(...s.whole);
      dummy.rotation.set(...s.baseRot);
      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [shards]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.elapsedTime;
    const p = scrollStore.smooth;
    const exGlobal = explodeAmount(p);
    const fly = flythroughEnvelope(p);

    for (let i = 0; i < shards.length; i++) {
      const s = shards[i];
      const localEx = easeInOutCubic(
        smoothstep(s.stagger, s.stagger + 0.55, exGlobal)
      );

      // Position lerp whole → tunnel
      tmpVec.set(
        s.whole[0] + (s.tunnel[0] - s.whole[0]) * localEx,
        s.whole[1] + (s.tunnel[1] - s.whole[1]) * localEx,
        s.whole[2] + (s.tunnel[2] - s.whole[2]) * localEx
      );

      // Rotation: base + mid-explode tumble + tunnel slow spin
      const tumblePhase = localEx * (1 - localEx) * 4;
      const tumble = tumblePhase * 2.4;
      tmpEuler.set(
        s.baseRot[0] + tumble + t * s.spinSpeed[0] * 0.5 * localEx,
        s.baseRot[1] + tumble * 0.7 + t * s.spinSpeed[1] * 0.5 * localEx,
        s.baseRot[2] + tumble * 0.5 + t * s.spinSpeed[2] * 0.5 * localEx
      );
      tmpQuat.setFromEuler(tmpEuler);

      const scalePop = 1 + Math.sin(localEx * Math.PI) * 0.12;

      dummy.position.copy(tmpVec);
      dummy.quaternion.copy(tmpQuat);
      dummy.scale.setScalar(s.scale * scalePop);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;

    // Material updates ONCE per frame (not per shard)
    tmpColor.copy(PALETTE.violet).lerp(PALETTE.cyan, fly * 0.6);
    material.emissive.copy(tmpColor);
    material.emissiveIntensity = 0.45 + fly * 0.9;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, SHARD_COUNT]}
      frustumCulled={false}
    />
  );
}

"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  Color,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  ShaderMaterial,
} from "three";
import { coreFragment, coreVertex } from "./shaders/coreShader";
import { PALETTE } from "@/lib/three/colors";
import { scrollStore } from "@/lib/scroll/scrollStore";
import {
  explodeAmount,
  flythroughEnvelope,
} from "@/lib/scroll/narrativePhases";

/**
 * CoreOrb — central iridescent shader sphere PLUS a halo of orbiting shard
 * fragments that emerge from the core during the explode phase. When the
 * camera flies through, the shards rotate around the camera path forming
 * an inner debris field.
 */

// Pre-allocated reusables (NEVER allocate in useFrame)
const dummy = new Object3D();
const tmpColor = new Color();

const SHARD_COUNT = 36;

interface Shard {
  baseAngle: number;
  baseTilt: number;
  baseRadius: number;
  spinAxis: [number, number, number];
  spinSpeed: number;
  finalZ: number;
  finalRadius: number;
}

function generateShards(): Shard[] {
  const arr: Shard[] = [];
  for (let i = 0; i < SHARD_COUNT; i++) {
    arr.push({
      baseAngle: (i / SHARD_COUNT) * Math.PI * 2 + Math.random() * 0.4,
      baseTilt: (Math.random() - 0.5) * 0.8,
      baseRadius: 0.4 + Math.random() * 0.3,
      spinAxis: [Math.random(), Math.random(), Math.random()],
      spinSpeed: 0.4 + Math.random() * 1.2,
      // Distribute shards along the tunnel z range
      finalZ: -4 + Math.random() * 8,
      finalRadius: 1.4 + Math.random() * 1.2,
    });
  }
  return arr;
}

export function CoreOrb() {
  const meshRef = useRef<Mesh>(null);
  const shardGroupRef = useRef<Group>(null);

  // High-poly icosahedron lets vertex shader sculpt smooth bulges
  const geometry = useMemo(() => new IcosahedronGeometry(1.6, 48), []);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: coreVertex,
        fragmentShader: coreFragment,
        uniforms: {
          uTime: { value: 0 },
          uColorA: { value: PALETTE.violet.clone() },
          uColorB: { value: PALETTE.cyan.clone() },
          uColorC: { value: PALETTE.gold.clone() },
          uIntensity: { value: 1.4 },
        },
        transparent: false,
      }),
    []
  );

  // Tiny additive shards orbiting the core
  const shards = useMemo(generateShards, []);
  const shardGeo = useMemo(() => new IcosahedronGeometry(0.08, 0), []);
  const shardMat = useMemo(
    () =>
      new MeshBasicMaterial({
        color: PALETTE.cyan,
        transparent: true,
        opacity: 0.95,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const p = scrollStore.smooth;
    const ex = explodeAmount(p);
    const fly = flythroughEnvelope(p);

    material.uniforms.uTime.value = t;
    // During flythrough the core's intensity dimmer (it's been "broken open")
    material.uniforms.uIntensity.value = 1.4 - ex * 0.8;

    if (meshRef.current) {
      // Dynamic rotation: layered axes, sped up during explode
      const baseSpeed = 0.08 + ex * 0.4;
      meshRef.current.rotation.y = t * baseSpeed;
      meshRef.current.rotation.x =
        Math.sin(t * 0.2) * 0.12 + Math.sin(t * 0.7) * 0.04;
      meshRef.current.rotation.z = Math.cos(t * 0.13) * 0.06;
      // Core shrinks as it "shatters open" then re-forms
      const scale = 1 - ex * 0.7;
      meshRef.current.scale.setScalar(Math.max(0.05, scale));
    }

    // Update shards: orbit around core when whole, stretch into tunnel
    // formation when exploded
    if (shardGroupRef.current) {
      const meshes = shardGroupRef.current.children;
      for (let i = 0; i < meshes.length; i++) {
        const s = shards[i];
        const mesh = meshes[i] as Mesh;

        // Whole-state position: orbit close to core
        const angle = s.baseAngle + t * 0.3;
        const wholeX = Math.cos(angle) * s.baseRadius;
        const wholeY = Math.sin(angle * 1.3) * s.baseRadius * 0.5 + s.baseTilt;
        const wholeZ = Math.sin(angle) * s.baseRadius;

        // Exploded-state position: ring formation along tunnel z
        const tunnelAngle = s.baseAngle + t * s.spinSpeed * 0.4;
        const expX = Math.cos(tunnelAngle) * s.finalRadius;
        const expY = Math.sin(tunnelAngle) * s.finalRadius;
        const expZ = s.finalZ;

        mesh.position.set(
          wholeX + (expX - wholeX) * ex,
          wholeY + (expY - wholeY) * ex,
          wholeZ + (expZ - wholeZ) * ex
        );

        // Spin each shard
        mesh.rotation.x = t * s.spinAxis[0] * s.spinSpeed;
        mesh.rotation.y = t * s.spinAxis[1] * s.spinSpeed;
        mesh.rotation.z = t * s.spinAxis[2] * s.spinSpeed;

        // Pulse brighter during flythrough
        const mat = mesh.material as MeshBasicMaterial;
        const heat = 0.6 + fly * 0.4 + ex * 0.2;
        tmpColor.copy(PALETTE.cyan).lerp(PALETTE.violet, fly * 0.7);
        mat.color.copy(tmpColor);
        mat.opacity = Math.min(1, 0.5 + heat);
      }
    }

    void dummy; // keep import warm; reused by other components
  });

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry} material={material} />
      <group ref={shardGroupRef}>
        {shards.map((_, i) => (
          <mesh
            key={i}
            geometry={shardGeo}
            material={shardMat.clone()}
          />
        ))}
      </group>
    </group>
  );
}

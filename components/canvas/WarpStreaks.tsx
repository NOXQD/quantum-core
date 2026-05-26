"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  LineSegments,
  ShaderMaterial,
} from "three";
import { PALETTE } from "@/lib/three/colors";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { flythroughEnvelope } from "@/lib/scroll/narrativePhases";

/**
 * WarpStreaks — GPU-driven radial line streaks during the flythrough.
 *
 * Optimization notes:
 *   - One LineSegments, one shader pass.
 *   - Vertex shader scrolls z over time → no CPU-side buffer rewrites.
 *   - Whole material.visible toggled when fly ≈ 0 → renderer skips it.
 *   - Count reduced 380 → 200 (mid-tier devices benefit, look unchanged).
 */

const STREAK_COUNT = 200;
const TUNNEL_LENGTH = 14;
const RADIUS_MIN = 1.4;
const RADIUS_MAX = 4.5;

const vert = /* glsl */ `
  attribute float aSpeed;
  attribute float aPhase;
  varying float vAlpha;
  uniform float uTime;
  uniform float uEnvelope;

  void main() {
    vec3 p = position;
    float zShift = mod(uTime * aSpeed + aPhase * 14.0, 14.0);
    p.z = mod(p.z + 7.0 + zShift, 14.0) - 7.0;
    vAlpha = uEnvelope;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const frag = /* glsl */ `
  varying float vAlpha;
  uniform vec3 uColor;
  void main() {
    gl_FragColor = vec4(uColor * vAlpha, vAlpha);
  }
`;

export function WarpStreaks() {
  const ref = useRef<LineSegments>(null);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(STREAK_COUNT * 2 * 3);
    const speeds = new Float32Array(STREAK_COUNT * 2);
    const phases = new Float32Array(STREAK_COUNT * 2);

    for (let i = 0; i < STREAK_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = RADIUS_MIN + Math.random() * (RADIUS_MAX - RADIUS_MIN);
      const z = -TUNNEL_LENGTH / 2 + Math.random() * TUNNEL_LENGTH;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      const length = 0.6 + Math.random() * 1.6;
      const speed = 6 + Math.random() * 14;
      const phase = Math.random();

      const o = i * 6;
      positions[o + 0] = x;
      positions[o + 1] = y;
      positions[o + 2] = z;
      positions[o + 3] = x;
      positions[o + 4] = y;
      positions[o + 5] = z - length;

      speeds[i * 2] = speed;
      speeds[i * 2 + 1] = speed;
      phases[i * 2] = phase;
      phases[i * 2 + 1] = phase;
    }

    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    geo.setAttribute("aSpeed", new BufferAttribute(speeds, 1));
    geo.setAttribute("aPhase", new BufferAttribute(phases, 1));

    const mat = new ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        uTime: { value: 0 },
        uEnvelope: { value: 0 },
        uColor: { value: new Color(PALETTE.cyan).multiplyScalar(1.6) },
      },
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });

    return { geometry: geo, material: mat };
  }, []);

  useFrame(({ clock }) => {
    const fly = flythroughEnvelope(scrollStore.smooth);
    material.uniforms.uTime.value = clock.elapsedTime;
    material.uniforms.uEnvelope.value = fly;

    // Skip rendering entirely outside flythrough window
    if (ref.current) ref.current.visible = fly > 0.01;
  });

  return <lineSegments ref={ref} geometry={geometry} material={material} />;
}

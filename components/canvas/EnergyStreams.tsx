"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  ShaderMaterial,
} from "three";
import { PALETTE } from "@/lib/three/colors";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { explodeAmount } from "@/lib/scroll/narrativePhases";

/**
 * EnergyStreams — drifting glowy points that flow around the chandelier
 * while it is in WHOLE state. Each point traces a slow orbital arc and
 * is colored cyan→violet by its phase. Provides ambient life so the
 * scene isn't visually static when idle.
 *
 * Performance:
 *   - Single Points object, single draw call.
 *   - Vertex shader does ALL motion (orbital trig) — no CPU per-frame work.
 *   - Visibility toggled OFF during explode/flythrough — frees GPU during
 *     the heaviest narrative beats.
 */

const PARTICLE_COUNT = 280;

const vert = /* glsl */ `
  attribute float aRadius;
  attribute float aTilt;
  attribute float aAngle;
  attribute float aSpeed;
  attribute float aPhase;
  attribute float aSize;
  varying float vPhase;

  uniform float uTime;

  void main() {
    float a = aAngle + uTime * aSpeed;
    // Orbital ring with axial wobble
    vec3 p = vec3(
      cos(a) * aRadius,
      sin(a * 1.3 + aPhase) * aRadius * 0.5 + sin(uTime * 0.6 + aPhase) * 0.2,
      sin(a) * aRadius
    );
    // Tilt the orbit plane per-particle
    float c = cos(aTilt);
    float s = sin(aTilt);
    vec3 tilted = vec3(p.x, p.y * c - p.z * s, p.y * s + p.z * c);

    vec4 mv = modelViewMatrix * vec4(tilted, 1.0);
    gl_Position = projectionMatrix * mv;
    // Distance-attenuated size
    gl_PointSize = aSize * (300.0 / -mv.z);
    vPhase = aPhase;
  }
`;

const frag = /* glsl */ `
  varying float vPhase;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;

  void main() {
    // Soft round point sprite
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float alpha = smoothstep(0.5, 0.0, d);
    vec3 col = mix(uColorA, uColorB, fract(vPhase));
    gl_FragColor = vec4(col, alpha * uOpacity);
  }
`;

export function EnergyStreams() {
  const ref = useRef<Points>(null);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const radii = new Float32Array(PARTICLE_COUNT);
    const tilts = new Float32Array(PARTICLE_COUNT);
    const angles = new Float32Array(PARTICLE_COUNT);
    const speeds = new Float32Array(PARTICLE_COUNT);
    const phases = new Float32Array(PARTICLE_COUNT);
    const sizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Position attribute is unused (computed in shader) but must exist
      positions[i * 3 + 0] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      radii[i] = 3.0 + Math.random() * 2.4;
      tilts[i] = (Math.random() - 0.5) * Math.PI;
      angles[i] = Math.random() * Math.PI * 2;
      speeds[i] = (0.15 + Math.random() * 0.5) * (Math.random() > 0.5 ? 1 : -1);
      phases[i] = Math.random();
      sizes[i] = 0.6 + Math.random() * 1.4;
    }

    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    geo.setAttribute("aRadius", new BufferAttribute(radii, 1));
    geo.setAttribute("aTilt", new BufferAttribute(tilts, 1));
    geo.setAttribute("aAngle", new BufferAttribute(angles, 1));
    geo.setAttribute("aSpeed", new BufferAttribute(speeds, 1));
    geo.setAttribute("aPhase", new BufferAttribute(phases, 1));
    geo.setAttribute("aSize", new BufferAttribute(sizes, 1));

    const mat = new ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0.75 },
        uColorA: { value: new Color(PALETTE.cyan) },
        uColorB: { value: new Color(PALETTE.violet) },
      },
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });

    return { geometry: geo, material: mat };
  }, []);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
    const ex = explodeAmount(scrollStore.smooth);
    // Streams fade out as the chandelier explodes — they belong to the
    // whole-state aesthetic only
    const wholeness = 1 - ex;
    material.uniforms.uOpacity.value = wholeness * 0.75;
    if (ref.current) ref.current.visible = wholeness > 0.02;
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}

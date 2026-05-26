"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  PointsMaterial,
} from "three";
import { PALETTE } from "@/lib/three/colors";

/**
 * Starfield — procedural deep-space background. Two layers:
 *   - dust: large faint cloud of small white-blue points
 *   - sparks: smaller count of brighter violet/cyan tinted points
 *
 * Wrapped at far distance so the camera never reaches them visually,
 * even during the flythrough.
 */

const DUST_COUNT = 3500;
const SPARK_COUNT = 700;
const FAR = 90;

function randomShellPositions(count: number, near: number, far: number) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = near + Math.random() * (far - near);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.cos(phi);
    arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  return arr;
}

export function Starfield() {
  const dustRef = useRef<Points>(null);
  const sparkRef = useRef<Points>(null);

  const dustGeo = useMemo(() => {
    const geo = new BufferGeometry();
    geo.setAttribute(
      "position",
      new BufferAttribute(randomShellPositions(DUST_COUNT, 30, FAR), 3)
    );
    return geo;
  }, []);

  const sparkGeo = useMemo(() => {
    const geo = new BufferGeometry();
    geo.setAttribute(
      "position",
      new BufferAttribute(randomShellPositions(SPARK_COUNT, 18, FAR * 0.85), 3)
    );
    return geo;
  }, []);

  const dustMat = useMemo(
    () =>
      new PointsMaterial({
        color: new Color("#9fb0ff"),
        size: 0.06,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    []
  );

  const sparkMat = useMemo(
    () =>
      new PointsMaterial({
        color: PALETTE.cyan,
        size: 0.14,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (dustRef.current) dustRef.current.rotation.y = t * 0.005;
    if (sparkRef.current) {
      sparkRef.current.rotation.y = -t * 0.008;
      // Twinkle
      sparkMat.opacity = 0.7 + Math.sin(t * 1.4) * 0.2;
    }
  });

  return (
    <>
      <points ref={dustRef} geometry={dustGeo} material={dustMat} />
      <points ref={sparkRef} geometry={sparkGeo} material={sparkMat} />
    </>
  );
}

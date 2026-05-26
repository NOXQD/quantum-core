"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  LineSegments,
} from "three";
import { PALETTE } from "@/lib/three/colors";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { flythroughEnvelope } from "@/lib/scroll/narrativePhases";

/**
 * Electric arcs that crackle in the tunnel only during flythrough.
 *
 * Optimizations:
 *   - Hidden + skipped entirely when fly < 0.02.
 *   - Bolt count reduced 6 → 4.
 *   - Redraw interval raised 70ms → 95ms.
 *   - Initial draw via useEffect (correct lifecycle).
 */

const ARC_COUNT = 4;
const SEGMENTS_PER_ARC = 12;
const TUNNEL_LENGTH = 14;
const TUNNEL_R = 3.4;
const REDRAW_INTERVAL = 0.095;

function randomPointInTunnel(out: number[]) {
  const a = Math.random() * Math.PI * 2;
  const r = TUNNEL_R * (0.6 + Math.random() * 0.4);
  out[0] = Math.cos(a) * r;
  out[1] = Math.sin(a) * r;
  out[2] = -TUNNEL_LENGTH / 2 + Math.random() * TUNNEL_LENGTH;
}

export function EnergyArcs() {
  const ref = useRef<LineSegments>(null);
  const lastRedrawRef = useRef(0);

  const { geometry, material, positions } = useMemo(() => {
    const verts = ARC_COUNT * SEGMENTS_PER_ARC * 2;
    const positions = new Float32Array(verts * 3);
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    const mat = new LineBasicMaterial({
      color: new Color(PALETTE.cyan).multiplyScalar(2.5),
      transparent: true,
      opacity: 0,
      blending: AdditiveBlending,
      depthWrite: false,
    });
    return { geometry: geo, material: mat, positions };
  }, []);

  const startBuf = useMemo(() => [0, 0, 0], []);
  const endBuf = useMemo(() => [0, 0, 0], []);

  function redrawArcs() {
    for (let a = 0; a < ARC_COUNT; a++) {
      randomPointInTunnel(startBuf);
      randomPointInTunnel(endBuf);
      const sx = startBuf[0], sy = startBuf[1], sz = startBuf[2];
      const ex = endBuf[0], ey = endBuf[1], ez = endBuf[2];

      let prevX = sx, prevY = sy, prevZ = sz;

      for (let s = 0; s < SEGMENTS_PER_ARC; s++) {
        const t2 = (s + 1) / SEGMENTS_PER_ARC;
        const jitter = Math.sin(t2 * Math.PI) * 0.6;
        const nx = sx + (ex - sx) * t2 + (Math.random() - 0.5) * jitter;
        const ny = sy + (ey - sy) * t2 + (Math.random() - 0.5) * jitter;
        const nz = sz + (ez - sz) * t2 + (Math.random() - 0.5) * jitter;
        const o = (a * SEGMENTS_PER_ARC + s) * 6;
        positions[o + 0] = prevX;
        positions[o + 1] = prevY;
        positions[o + 2] = prevZ;
        positions[o + 3] = nx;
        positions[o + 4] = ny;
        positions[o + 5] = nz;
        prevX = nx; prevY = ny; prevZ = nz;
      }
    }
    (geometry.getAttribute("position") as BufferAttribute).needsUpdate = true;
  }

  // Proper init lifecycle
  useEffect(() => {
    redrawArcs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(({ clock }) => {
    const fly = flythroughEnvelope(scrollStore.smooth);

    if (fly < 0.02) {
      if (ref.current) ref.current.visible = false;
      return;
    }
    if (ref.current) ref.current.visible = true;

    material.opacity = fly * (0.55 + Math.random() * 0.4);

    const now = clock.elapsedTime;
    if (now - lastRedrawRef.current > REDRAW_INTERVAL) {
      lastRedrawRef.current = now;
      redrawArcs();
    }
  });

  return <lineSegments ref={ref} geometry={geometry} material={material} />;
}

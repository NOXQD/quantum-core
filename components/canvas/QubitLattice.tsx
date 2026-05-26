"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  MeshBasicMaterial,
  Object3D,
  OctahedronGeometry,
} from "three";
import { PALETTE } from "@/lib/three/colors";
import { scrollStore } from "@/lib/scroll/scrollStore";
import {
  explodeAmount,
  flythroughEnvelope,
} from "@/lib/scroll/narrativePhases";

const NODE_COUNT = 150;
const RADIUS_INNER = 4.2;
const RADIUS_OUTER = 7.2;
const LINK_DISTANCE = 1.7;

interface NodeData {
  // Whole-state position (spherical shell)
  whole: [number, number, number];
  // Tunnel-state position (cylindrical shell along z)
  tunnel: [number, number, number];
  scale: number;
  phase: number;
}

function generateNodes(): NodeData[] {
  const arr: NodeData[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    // --- Whole state: lens-squashed sphere ---
    const r =
      RADIUS_INNER + Math.cbrt(Math.random()) * (RADIUS_OUTER - RADIUS_INNER);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const whole: [number, number, number] = [
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi) * 0.65,
      r * Math.sin(phi) * Math.sin(theta),
    ];

    // --- Tunnel state: cylinder around z axis, length spans -6..+4 ---
    const tunnelAngle = (i / NODE_COUNT) * Math.PI * 2 * 7; // tight helix
    const tunnelR = 2.4 + Math.random() * 1.6;
    const tunnelZ = -6 + (i / NODE_COUNT) * 10 + (Math.random() - 0.5) * 0.4;
    const tunnel: [number, number, number] = [
      Math.cos(tunnelAngle) * tunnelR,
      Math.sin(tunnelAngle) * tunnelR,
      tunnelZ,
    ];

    arr.push({
      whole,
      tunnel,
      scale: 0.04 + Math.random() * 0.07,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return arr;
}

// Pre-allocate to avoid GC pressure inside useFrame
const dummy = new Object3D();
const tmpColor = new Color();

/**
 * QubitLattice — node cloud + entanglement lines.
 *
 *  Whole state:    spherical shell around the core
 *  Exploded state: helical cylinder along the tunnel axis
 *  Flythrough:     nodes flicker brighter, lines pulse with energy
 */
export function QubitLattice() {
  const groupRef = useRef<Group>(null);
  const meshRef = useRef<InstancedMesh>(null);
  const linesRef = useRef<LineSegments>(null);

  const nodes = useMemo(generateNodes, []);
  const nodeGeometry = useMemo(() => new OctahedronGeometry(1, 0), []);
  const nodeMaterial = useMemo(
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

  // Build entanglement lines based on whole-state positions
  const { lineGeometry, lineWholeA, lineWholeB, lineTunnelA, lineTunnelB } =
    useMemo(() => {
      const wholeA: number[] = [];
      const wholeB: number[] = [];
      const tunA: number[] = [];
      const tunB: number[] = [];
      for (let i = 0; i < nodes.length; i++) {
        let linked = 0;
        for (let j = i + 1; j < nodes.length && linked < 2; j++) {
          const a = nodes[i].whole;
          const b = nodes[j].whole;
          const d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
          if (d < LINK_DISTANCE) {
            wholeA.push(...a);
            wholeB.push(...b);
            tunA.push(...nodes[i].tunnel);
            tunB.push(...nodes[j].tunnel);
            linked++;
          }
        }
      }
      const segCount = wholeA.length / 3;
      const positions = new Float32Array(segCount * 2 * 3);
      const geo = new BufferGeometry();
      geo.setAttribute("position", new BufferAttribute(positions, 3));
      return {
        lineGeometry: geo,
        lineWholeA: new Float32Array(wholeA),
        lineWholeB: new Float32Array(wholeB),
        lineTunnelA: new Float32Array(tunA),
        lineTunnelB: new Float32Array(tunB),
      };
    }, [nodes]);

  const lineMaterial = useMemo(
    () =>
      new LineBasicMaterial({
        color: new Color(PALETTE.violet).multiplyScalar(0.85),
        transparent: true,
        opacity: 0.22,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  // Place initial instances ONCE after mount (useEffect, not useMemo —
  // ref is null during memo body on first render)
  useEffect(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      dummy.position.set(...n.whole);
      dummy.scale.setScalar(n.scale);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [nodes]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const p = scrollStore.smooth;
    const ex = explodeAmount(p);
    const fly = flythroughEnvelope(p);

    // Group rotates slowly when whole; locked when exploded
    if (groupRef.current) {
      groupRef.current.rotation.y = (1 - ex) * t * 0.04;
      groupRef.current.rotation.x = (1 - ex) * Math.sin(t * 0.15) * 0.05;
    }

    // Update instance transforms
    if (meshRef.current) {
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const w = n.whole;
        const tu = n.tunnel;

        // Lerp whole → tunnel
        const x = w[0] + (tu[0] - w[0]) * ex;
        const y = w[1] + (tu[1] - w[1]) * ex;
        const z = w[2] + (tu[2] - w[2]) * ex;

        // Pulse + extra pop during flythrough
        const pulse =
          0.85 + Math.sin(t * 2.4 + n.phase) * 0.35 + fly * 0.4;
        dummy.position.set(x, y, z);
        dummy.scale.setScalar(n.scale * pulse);
        dummy.rotation.set(t * 0.5 + n.phase, t * 0.3, 0);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
      }
      meshRef.current.instanceMatrix.needsUpdate = true;

      // Node color shifts violet-warm during flythrough
      tmpColor.copy(PALETTE.cyan).lerp(PALETTE.violet, fly * 0.6);
      (meshRef.current.material as MeshBasicMaterial).color.copy(tmpColor);
    }

    // Update line geometry: lerp whole→tunnel endpoints
    if (linesRef.current) {
      const posAttr = lineGeometry.getAttribute("position") as BufferAttribute;
      const arr = posAttr.array as Float32Array;
      const segCount = arr.length / 6;
      for (let s = 0; s < segCount; s++) {
        const o3 = s * 3;
        const o6 = s * 6;
        // A endpoint
        arr[o6 + 0] =
          lineWholeA[o3 + 0] + (lineTunnelA[o3 + 0] - lineWholeA[o3 + 0]) * ex;
        arr[o6 + 1] =
          lineWholeA[o3 + 1] + (lineTunnelA[o3 + 1] - lineWholeA[o3 + 1]) * ex;
        arr[o6 + 2] =
          lineWholeA[o3 + 2] + (lineTunnelA[o3 + 2] - lineWholeA[o3 + 2]) * ex;
        // B endpoint
        arr[o6 + 3] =
          lineWholeB[o3 + 0] + (lineTunnelB[o3 + 0] - lineWholeB[o3 + 0]) * ex;
        arr[o6 + 4] =
          lineWholeB[o3 + 1] + (lineTunnelB[o3 + 1] - lineWholeB[o3 + 1]) * ex;
        arr[o6 + 5] =
          lineWholeB[o3 + 2] + (lineTunnelB[o3 + 2] - lineWholeB[o3 + 2]) * ex;
      }
      posAttr.needsUpdate = true;

      const m = linesRef.current.material as LineBasicMaterial;
      m.opacity = 0.18 + Math.sin(t * 1.7) * 0.08 + fly * 0.4;
      tmpColor.copy(PALETTE.violet).lerp(PALETTE.cyan, fly * 0.5);
      m.color.copy(tmpColor);
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[nodeGeometry, nodeMaterial, NODE_COUNT]}
      />
      <lineSegments
        ref={linesRef}
        geometry={lineGeometry}
        material={lineMaterial}
      />
    </group>
  );
}

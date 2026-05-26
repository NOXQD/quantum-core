"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Group } from "three";
import { CoreOrb } from "./CoreOrb";
import { PlasmaRings } from "./PlasmaRings";
import { QubitLattice } from "./QubitLattice";
import { ChandelierCrystals } from "./ChandelierCrystals";
import { WarpStreaks } from "./WarpStreaks";
import { EnergyArcs } from "./EnergyArcs";
import { EnergyStreams } from "./EnergyStreams";
import { scrollStore } from "@/lib/scroll/scrollStore";
import { explodeAmount } from "@/lib/scroll/narrativePhases";

/**
 * QuantumChandelier — composite parent. All sub-parts read scrollStore
 * independently; the group itself adds a layered ceremonial rotation
 * (multi-axis, slightly chaotic — much richer than a flat Y-spin).
 *
 * Rotation gets DAMPENED during explode/flythrough so each part's own
 * motion reads clearly. Rotation returns during reassemble/resolve.
 */
export function QuantumChandelier() {
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    const ex = explodeAmount(scrollStore.smooth);
    const wholeness = 1 - ex;

    // Layered tri-axis rotation when whole — feels alive, not robotic
    ref.current.rotation.y = t * 0.05 * wholeness + t * 0.012;
    ref.current.rotation.x =
      Math.sin(t * 0.18) * 0.08 * wholeness +
      Math.sin(t * 0.41) * 0.02 * wholeness;
    ref.current.rotation.z = Math.cos(t * 0.23) * 0.05 * wholeness;
  });

  return (
    <group ref={ref}>
      <CoreOrb />
      <PlasmaRings />
      <QubitLattice />
      <ChandelierCrystals />
      {/* Ambient (whole-state only) */}
      <EnergyStreams />
      {/* Flythrough-only effects, render last so they additive-overlay */}
      <WarpStreaks />
      <EnergyArcs />
    </group>
  );
}

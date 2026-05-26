"use client";

import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents, Preload } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { QuantumChandelier } from "./QuantumChandelier";
import { Starfield } from "./Starfield";
import { CameraRig } from "./CameraRig";
import { PostFX } from "./PostFX";
import { detectTier, dprForTier } from "@/lib/three/performance";

/**
 * QuantumScene — persistent 3D layer (optimized pass).
 *
 * Removed since previous version:
 *   - drei <Environment preset="night" /> HDRI cubemap → expensive load
 *     and unused now that crystals use emissive MeshStandardMaterial.
 *
 * Added:
 *   - document.visibilityState gate: when tab is hidden we set
 *     frameloop="never" so the GPU goes idle (saves laptop battery and
 *     prevents the "background tab" stutter when re-focusing).
 *   - dpr capped harder; antialias off (bloom + tone mapping hide aliasing).
 */
export function QuantumScene() {
  const tier = useMemo(() => detectTier(), []);
  const dpr = useMemo(() => dprForTier(tier), [tier]);

  // Pause render loop when tab not visible — saves CPU/GPU
  const [active, setActive] = useState(true);
  useEffect(() => {
    const onVis = () => setActive(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <div
      className="fixed inset-0 -z-0"
      style={{ pointerEvents: "none", background: "#03020a" }}
      aria-hidden
    >
      <Canvas
        dpr={dpr}
        frameloop={active ? "always" : "never"}
        gl={{
          antialias: false,
          alpha: false,
          stencil: false,
          depth: true,
          powerPreference: "high-performance",
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          outputColorSpace: SRGBColorSpace,
        }}
        camera={{ position: [0, 1.4, 22], fov: 38, near: 0.05, far: 200 }}
        onCreated={({ gl }) => {
          gl.setClearColor("#03020a", 1);
        }}
      >
        <Suspense fallback={null}>
          {/* Cheap procedural lighting only — no HDRI cubemap */}
          <ambientLight intensity={0.25} color="#3a2f7a" />
          <hemisphereLight
            args={["#5a4cff", "#0a0820", 0.4]}
          />
          <directionalLight
            position={[8, 12, 6]}
            intensity={1.0}
            color="#a48cff"
          />
          <pointLight
            position={[-6, -2, 4]}
            intensity={2.6}
            distance={22}
            color="#36e8ff"
          />
          <pointLight
            position={[6, 4, -8]}
            intensity={1.9}
            distance={20}
            color="#8a5cff"
          />

          <Starfield />
          <QuantumChandelier />

          <CameraRig />
          <PostFX tier={tier} />

          <Preload all />
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute inset-0 bg-radial-vignette" />
    </div>
  );
}

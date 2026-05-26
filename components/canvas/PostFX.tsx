"use client";

import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import { PerfTier } from "@/lib/three/performance";

/**
 * PostFX — cinematic look, perf-tuned.
 *
 * ChromaticAberration removed entirely — even at low offset it produced
 * visible RGB-split fringing on bloomed pixels (red+blue ghosting around
 * green core) which read as "color flicker" during scroll.
 *
 * Notes:
 *   - Bloom: smaller kernel (MEDIUM not LARGE), mipmapBlur only on high tier.
 *   - No Noise (flicker source previously).
 *   - No CA (this fix).
 */

export function PostFX({ tier }: { tier: PerfTier }) {
  if (tier === "low") {
    return (
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom
          intensity={0.8}
          luminanceThreshold={0.4}
          luminanceSmoothing={0.85}
          kernelSize={KernelSize.SMALL}
        />
        <Vignette eskil={false} offset={0.3} darkness={0.85} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={1.0}
        luminanceThreshold={0.35}
        luminanceSmoothing={0.9}
        kernelSize={tier === "high" ? KernelSize.LARGE : KernelSize.MEDIUM}
        mipmapBlur={tier === "high"}
      />
      <Vignette eskil={false} offset={0.25} darkness={0.9} />
    </EffectComposer>
  );
}

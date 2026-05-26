import { QuantumScene } from "@/components/canvas/QuantumScene";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { TechnologySection } from "@/components/sections/TechnologySection";
import { CapabilitiesSection } from "@/components/sections/CapabilitiesSection";
import { RoadmapSection } from "@/components/sections/RoadmapSection";
import { CommunitySection } from "@/components/sections/CommunitySection";
import { SectionReveal } from "@/components/sections/SectionReveal";
import { TopBar } from "@/components/ui/TopBar";
import { SideRail } from "@/components/ui/SideRail";
import { LoaderOverlay } from "@/components/ui/LoaderOverlay";
import { CustomCursor } from "@/components/ui/CustomCursor";

/**
 * Home — top-level cinematic composition.
 *
 * Layering (bottom → top):
 *   1. <QuantumScene>    fixed 3D layer, owns the chandelier + camera rig
 *   2. <main>            scroll content (Hero + 5 chapters), each chapter
 *                        wrapped in <SectionReveal> for entrance/exit anim
 *   3. <TopBar>          brand mark + coherence indicator
 *   4. <SideRail>        chapter navigation (left edge)
 *   5. <CustomCursor>    two-layer cursor (premium polish)
 *   6. <LoaderOverlay>   opening curtain, self-dismisses after ~1.6s
 */
export default function Home() {
  return (
    <>
      <QuantumScene />

      <TopBar />
      <SideRail />

      <main className="relative z-10 flex w-full flex-col">
        <HeroSection />
        <SectionReveal align="left">
          <AboutSection />
        </SectionReveal>
        <SectionReveal align="right">
          <TechnologySection />
        </SectionReveal>
        <SectionReveal align="left">
          <CapabilitiesSection />
        </SectionReveal>
        <SectionReveal align="right">
          <RoadmapSection />
        </SectionReveal>
        <SectionReveal align="center">
          <CommunitySection />
        </SectionReveal>
      </main>

      <CustomCursor />
      <LoaderOverlay />
    </>
  );
}

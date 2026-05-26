"use client";

import { ReactNode, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

/**
 * SectionReveal — drop-in wrapper that animates section internals as the
 * user scrolls into view.
 *
 * Marks any descendant with `data-reveal` and staggers them up with a
 * blur-lift. Then as user scrolls PAST the section, the whole block
 * eases out (slight blur + lift) so chapters feel like film scenes —
 * established, then released to the next.
 *
 * Why a wrapper instead of per-section GSAP code: each Section component
 * gets the same cinematic entrance/exit "for free", no copy-paste.
 */
export function SectionReveal({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right" | "center";
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const targets = el.querySelectorAll<HTMLElement>("[data-reveal]");
      if (!targets.length) return;

      // Enter: stagger lift + blur
      gsap.from(targets, {
        y: 40,
        opacity: 0,
        filter: "blur(10px)",
        duration: 0.9,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 75%",
          end: "top 25%",
          toggleActions: "play none none reverse",
        },
      });

      // Exit: gentle fade out as user leaves
      gsap.to(el, {
        opacity: 0.0,
        filter: "blur(6px)",
        y: -30,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "bottom 40%",
          end: "bottom top",
          scrub: 0.4,
        },
      });
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      data-align={align}
      className="contents"
    >
      {children}
    </div>
  );
}

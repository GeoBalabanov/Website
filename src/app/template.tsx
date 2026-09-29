"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { prefersReducedMotion } from "@/lib/motion";

/** Re-mounts on every navigation: a short fade keeps page changes calm. */
export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // Skip while a shared-element transition covers the screen: the overlay handles the reveal.
    if (!ref.current || prefersReducedMotion() || document.documentElement.dataset.flip === "on") return;
    const tween = gsap.fromTo(ref.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "power2.out" });
    return () => {
      tween.kill();
    };
  }, []);

  return (
    <div ref={ref} className="relative z-10">
      {children}
    </div>
  );
}

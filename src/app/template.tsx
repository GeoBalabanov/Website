"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { prefersReducedMotion } from "@/lib/motion";

/** Re-mounts on every navigation: a short fade keeps page changes calm. */
export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
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

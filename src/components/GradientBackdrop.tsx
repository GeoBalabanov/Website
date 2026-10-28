"use client";

import { usePathname } from "next/navigation";
import { useGradient } from "@/lib/look-store";
import s from "./GradientBackdrop.module.css";

/**
 * Dirty-white gradient rising from the bottom of the page, with soft smudges drifting in it.
 * Works on light and dark (the haze colours follow the theme). Fades with the Plain / Gradient switch.
 */
export function GradientBackdrop() {
  const gradient = useGradient();
  const pathname = usePathname();
  // Project pages have their own colors.
  const on = gradient && !pathname.startsWith("/projects/");
  return (
    <div aria-hidden="true" className={s.root} data-on={on ? "" : undefined} style={{ opacity: on ? 1 : 0 }}>
      <span className={`${s.smudge} ${s.s1}`} />
      <span className={`${s.smudge} ${s.s2}`} />
      <span className={`${s.smudge} ${s.s3}`} />
    </div>
  );
}

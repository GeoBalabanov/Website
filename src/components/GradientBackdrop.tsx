"use client";

import { usePathname } from "next/navigation";
import { useLook } from "@/lib/look-store";

/** Soft dirty-white gradient rising from the bottom of the page. Fades with the Plain / Gradient / Dark switch. */
export function GradientBackdrop() {
  const gradient = useLook() === "gradient";
  const pathname = usePathname();
  // Project pages have their own colors.
  const on = gradient && !pathname.startsWith("/projects/");
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-0 h-[55dvh] transition-opacity duration-[1200ms] ease-out-soft"
      style={{
        opacity: on ? 1 : 0,
        background:
          "linear-gradient(to bottom, rgb(247 247 242 / 0) 0%, var(--color-cream) 18%, var(--color-dust) 62%, var(--color-smudge) 100%)",
      }}
    />
  );
}

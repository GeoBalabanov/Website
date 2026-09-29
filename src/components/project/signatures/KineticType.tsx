"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import type { Project, Signature } from "@/data/projects";
import { useScene } from "@/lib/use-scene";
import { SectionLabel } from "../bits";

type Data = Extract<Signature, { type: "kinetic-type" }>;

const RADIUS = 220;

/**
 * Giant words whose letters scatter away from the cursor (or finger) and
 * spring back. Scrolling slides the lines against each other.
 */
export function KineticType({ data }: { project: Project; data: Data }) {
  const root = useRef<HTMLElement>(null);
  const pinned = useRef<HTMLDivElement>(null);

  useScene(root, ({ reduced, mobile }) => {
    if (reduced) return;
    const q = gsap.utils.selector(root);
    const lines = q("[data-line]");
    const letters = q("[data-letter]") as HTMLElement[];

    // Scroll: lines drift in alternating directions while pinned.
    const tl = gsap.timeline({
      scrollTrigger: { trigger: pinned.current, start: "top top", end: mobile ? "+=120%" : "+=170%", pin: true, scrub: 0.7 },
    });
    lines.forEach((line, i) => {
      tl.fromTo(line, { xPercent: i % 2 ? -18 : 18 }, { xPercent: i % 2 ? 12 : -12, ease: "none" }, 0);
    });

    // Pointer: each letter pushes away from the pointer, strength falling off with distance.
    const movers = letters.map((el) => ({
      el,
      x: gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" }),
      y: gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" }),
      r: gsap.quickTo(el, "rotation", { duration: 0.8, ease: "power3.out" }),
      s: gsap.quickTo(el, "scale", { duration: 0.6, ease: "power3.out" }),
    }));
    let px = -9999;
    let py = -9999;
    let frame = 0;
    const update = () => {
      frame = 0;
      for (const m of movers) {
        const r = m.el.getBoundingClientRect();
        // Measure from the letter's resting centre (subtract its current offset).
        const cx = r.left + r.width / 2 - Number(gsap.getProperty(m.el, "x"));
        const cy = r.top + r.height / 2 - Number(gsap.getProperty(m.el, "y"));
        const dx = cx - px;
        const dy = cy - py;
        const d = Math.hypot(dx, dy) || 1;
        const f = Math.max(0, 1 - d / RADIUS);
        const push = f * f * (mobile ? 70 : 110);
        m.x((dx / d) * push);
        m.y((dy / d) * push);
        m.r((dx / d) * f * 25);
        m.s(1 + f * 0.35);
      }
    };
    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onLeave = () => {
      px = py = -9999;
      if (!frame) frame = requestAnimationFrame(update);
    };
    const el = pinned.current!;
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerdown", onMove);
    el.addEventListener("pointerleave", onLeave);
    const onUp = (e: PointerEvent) => e.pointerType === "touch" && onLeave();
    el.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerup", onUp);
    };
  });

  return (
    <section ref={root} aria-labelledby="kinetic-title">
      <div ref={pinned} className="relative flex h-dvh touch-pan-y flex-col justify-center overflow-hidden px-4 pt-20 select-none md:px-10">
        <div className="absolute top-28 left-4 md:top-28 md:left-10">
          <SectionLabel index="02">What we match on</SectionLabel>
        </div>
        <h2 id="kinetic-title" className="sr-only">
          {data.words.join(", ")}
        </h2>
        <div aria-hidden="true" className="font-display flex flex-col items-center leading-[0.86] font-extrabold tracking-[-0.04em] uppercase">
          {data.words.map((word, i) => (
            <div key={word} data-line className="whitespace-nowrap will-change-transform" style={{ fontSize: `clamp(3rem, ${Math.min(22, 150 / word.length)}vw, 17rem)` }}>
              {word.split("").map((ch, j) => (
                <span
                  key={j}
                  data-letter
                  className="inline-block will-change-transform"
                  style={{ color: (i + j) % 7 === 0 ? "var(--p-accent)" : (i + j) % 11 === 3 ? "var(--p-accent-2)" : undefined }}
                >
                  {ch}
                </span>
              ))}
            </div>
          ))}
        </div>
        <p className="absolute right-4 bottom-8 max-w-[26ch] text-right font-mono text-xs tracking-wide text-[var(--p-muted)] uppercase md:right-10">
          {data.caption}
        </p>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import type { Project } from "@/data/projects";
import { useScene } from "@/lib/use-scene";
import { OpenProjectLink } from "@/components/transition/OpenProjectLink";
import { useProjectTransition } from "@/components/transition/ProjectTransition";
import { prefersReducedMotion } from "@/lib/motion";
import { CorsaStage } from "./hero-scenes/CorsaStage";

/**
 * The end of the page: the next project's image grows with scroll. When it
 * fills the screen you're pulled straight into that project (or click it).
 */
export function NextProject({ next }: { next: Project }) {
  const root = useRef<HTMLElement>(null);
  const preview = useRef<HTMLDivElement>(null);
  const { open } = useProjectTransition();

  // A project with a live 3D hero plays it here too, while this section is on screen.
  const [live, setLive] = useState(false);
  useEffect(() => {
    if (next.heroScene !== "corsa-head" || prefersReducedMotion()) return;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { rootMargin: "200px" });
    io.observe(root.current!);
    return () => io.disconnect();
  }, [next.heroScene]);

  useScene(
    root,
    ({ reduced }) => {
      if (reduced) {
        gsap.set(preview.current, { scale: 0.6 });
        return;
      }
      let fired = false;
      const bar = root.current!.querySelector("[data-bar]");
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.4,
            onUpdate: (self) => {
              if (self.progress < 0.9) fired = false;
              if (!fired && self.progress > 0.985) {
                fired = true;
                open(next.slug, preview.current!);
              }
            },
          },
        })
        .fromTo(preview.current, { scale: 0.32 }, { scale: 1, ease: "power1.in" }, 0)
        .fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0)
        .fromTo("[data-next-title]", { yPercent: 0 }, { yPercent: -30, ease: "none" }, 0);
    },
    [next.slug],
  );

  return (
    <section ref={root} aria-label="Next project" className="relative h-[240vh] motion-reduce:h-dvh">
      {/* Sticky creates a stacking context: give it the page background so the difference-blended title has something to invert. */}
      <div className="sticky top-0 h-dvh overflow-hidden bg-[var(--p-bg)]">
        <div ref={preview} className="absolute inset-0 will-change-transform" style={{ transform: "scale(0.32)" }}>
          <OpenProjectLink project={next} className="block h-full w-full" label={`Next project: ${next.title}`}>
            <div className="relative h-full w-full">
              <Image
                src={next.images[0].src}
                alt=""
                fill
                sizes="100vw"
                unoptimized={next.images[0].src.endsWith(".svg")}
                className="object-cover"
              />
              {live && <CorsaStage />}
            </div>
          </OpenProjectLink>
        </div>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center text-white mix-blend-difference">
          <p className="font-mono text-xs tracking-widest uppercase">{next.kind ? `Next — ${next.kind}` : `Next project — ${next.number}`}</p>
          <p data-next-title className="font-display mt-4 text-[clamp(3rem,12vw,13rem)] leading-[0.85] tracking-[-0.04em]">
            {next.title}
          </p>
          <p className="mt-6 font-mono text-xs tracking-widest uppercase opacity-80 motion-reduce:hidden">Keep scrolling</p>
        </div>

        <div aria-hidden="true" className="absolute inset-x-4 bottom-6 h-px bg-current/20 md:inset-x-10">
          <div data-bar className="h-full origin-left bg-current" />
        </div>
      </div>
    </section>
  );
}

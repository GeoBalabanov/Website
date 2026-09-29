"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import type { Project } from "@/data/projects";
import { useScene } from "@/lib/use-scene";
import { SectionLabel } from "./bits";

/** Intro paragraph: each line brightens in turn as you scroll through it. */
export function Intro({ project }: { project: Project }) {
  const root = useRef<HTMLElement>(null);

  useScene(root, ({ reduced }) => {
    const text = root.current!.querySelector<HTMLElement>("[data-intro]")!;
    if (reduced) {
      gsap.from(text, { autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: text, start: "top 85%" } });
      return;
    }
    const split = SplitText.create(text, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 100,
          autoAlpha: 0,
          stagger: 0.35,
          ease: "power2.out",
          scrollTrigger: { trigger: text, start: "top 85%", end: "bottom 55%", scrub: 0.6 },
        }),
    });
    return () => split.revert();
  });

  return (
    <section ref={root} className="px-4 py-[18vh] md:px-10">
      <SectionLabel index="01" placeholder>
        About the project
      </SectionLabel>
      <p data-intro className="mt-8 max-w-[26ch] text-[clamp(1.75rem,4.2vw,4.25rem)] leading-[1.08] font-medium tracking-[-0.02em] md:max-w-[30ch]">
        {project.intro}
      </p>
    </section>
  );
}

"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "@/data/projects";
import { useScene } from "@/lib/use-scene";
import { SectionLabel } from "./bits";

/**
 * A use scenario as a road: the line draws as you scroll, each moment lights up
 * as it's reached, then the personas it was designed for.
 * Reduced motion: everything is shown, fully drawn.
 */
export function Drive({ project, index }: { project: Project; index: string }) {
  const root = useRef<HTMLElement>(null);
  const road = useRef<HTMLOListElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const drive = project.drive!;

  useScene(root, ({ reduced }) => {
    const moments = gsap.utils.toArray<HTMLElement>("[data-moment]");
    const quotes = gsap.utils.toArray<HTMLElement>("[data-quote]");
    if (reduced) {
      moments.forEach((m) => m.setAttribute("data-on", ""));
      line.current!.style.transform = "scaleY(1)";
      return;
    }
    gsap.fromTo(line.current, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: road.current, start: "top 60%", end: "bottom 60%", scrub: 0.5 } });
    moments.forEach((m) => {
      // Lit from the moment it is reached, until you scroll back above it.
      ScrollTrigger.create({ trigger: m, start: "top 60%", end: "max", onToggle: (self) => m.toggleAttribute("data-on", self.isActive) });
      gsap.from(m.querySelector("[data-body]"), { y: 40, autoAlpha: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: m, start: "top 80%" } });
    });
    gsap.from(quotes, { y: 50, autoAlpha: 0, duration: 1, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: quotes[0], start: "top 85%" } });
  });

  return (
    <section ref={root} aria-labelledby="drive-title" className="px-4 py-[16vh] md:px-10">
      <div className="grid gap-12 md:grid-cols-12 md:gap-6">
        <div className="md:col-span-4">
          <div className="md:sticky md:top-32">
            <SectionLabel index={index}>The scenario</SectionLabel>
            <h2 id="drive-title" className="font-display mt-4 max-w-[12ch] text-[clamp(1.75rem,3.6vw,3.5rem)] leading-[1.05] font-bold tracking-[0.01em] uppercase">
              {drive.title}
            </h2>
          </div>
        </div>

        <ol ref={road} className="relative md:col-span-7 md:col-start-6">
          {/* The road: a faint track, and the drawn line on top of it. */}
          <div aria-hidden="true" className="absolute top-2 bottom-2 left-[7px] w-[2px] bg-[var(--p-fg)]/10">
            <div ref={line} className="h-full w-full origin-top bg-[var(--p-accent)] shadow-[0_0_12px_var(--p-accent)]" style={{ transform: "scaleY(0)" }} />
          </div>
          {drive.moments.map((m, i) => (
            <li key={m.title} data-moment className="group relative pb-16 pl-10 last:pb-0 md:pb-24 md:pl-16">
              <span
                aria-hidden="true"
                className="absolute top-1 left-0 h-4 w-4 rounded-full border-2 border-[var(--p-fg)]/25 bg-[var(--p-bg)] transition-[border-color,background-color,box-shadow] duration-500 group-data-[on]:border-[var(--p-accent)] group-data-[on]:bg-[var(--p-accent)] group-data-[on]:shadow-[0_0_16px_var(--p-accent)]"
              />
              <div data-body>
                <p className="font-mono text-xs tracking-widest text-[var(--p-muted)] uppercase transition-colors duration-500 group-data-[on]:text-[var(--p-accent)]">
                  {String(i + 1).padStart(2, "0")} · {m.kicker}
                </p>
                <h3 className="font-display mt-3 text-[clamp(1.4rem,2.6vw,2.4rem)] leading-[1.05] font-bold tracking-[0.01em] uppercase">{m.title}</h3>
                <p className="mt-4 max-w-[46ch] text-[var(--p-muted)] md:text-lg">{m.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-[14vh]">
        <p className="font-mono text-xs tracking-widest text-[var(--p-muted)] uppercase">Designed for</p>
        <ul className="mt-8 grid gap-10 md:grid-cols-3 md:gap-6">
          {drive.people.map((p) => (
            <li key={p.name} data-quote className="border-t border-[var(--p-fg)]/15 pt-6">
              <blockquote className="text-[clamp(1.25rem,1.9vw,1.75rem)] leading-[1.25] font-medium tracking-[-0.01em]">
                <span aria-hidden="true" className="text-[var(--p-accent)]">“</span>
                {p.quote}
                <span aria-hidden="true" className="text-[var(--p-accent)]">”</span>
              </blockquote>
              <p className="mt-5 font-mono text-xs tracking-wide text-[var(--p-muted)] uppercase">
                {p.name} · {p.about}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import type { Project, Signature } from "@/data/projects";
import { useScene } from "@/lib/use-scene";
import { SectionLabel } from "../bits";

type Data = Extract<Signature, { type: "progress-journey" }>;

/**
 * "Loading a semester": scrolling fills a progress bar from 0 to 100 % while a
 * big counter ticks up and the story steps through its milestones.
 * Reduced motion: a plain list of the milestones with a full bar.
 */
export function ProgressJourney({ data }: { project: Project; data: Data }) {
  const root = useRef<HTMLElement>(null);
  const pinned = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const ms = data.milestones;

  useScene(root, ({ reduced }) => {
    const el = root.current!;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-milestone]"));
    const ticks = Array.from(el.querySelectorAll<HTMLElement>("[data-tick]"));
    let shown = -1;
    const show = (i: number) => {
      if (i === shown) return;
      shown = i;
      items.forEach((m, j) => m.toggleAttribute("data-on", j === i));
      ticks.forEach((t, j) => t.toggleAttribute("data-on", j <= i));
    };

    if (reduced) {
      el.setAttribute("data-static", "");
      return () => el.removeAttribute("data-static");
    }

    show(0);
    const state = { p: 0 };
    gsap.to(state, {
      p: 100,
      ease: "none",
      scrollTrigger: { trigger: pinned.current, start: "top top", end: () => `+=${window.innerHeight * 2.6}`, pin: true, scrub: 0.5 },
      onUpdate: () => {
        const p = state.p;
        count.current!.textContent = String(Math.round(p));
        bar.current!.style.transform = `scaleX(${p / 100})`;
        // The latest milestone reached (a little early, so each is readable before the next).
        let i = 0;
        ms.forEach((m, j) => {
          if (p + 2 >= m.pct) i = j;
        });
        show(i);
      },
    });
  });

  return (
    <section ref={root} aria-labelledby="journey-title" className="group/journey">
      <div ref={pinned} className="relative flex min-h-dvh flex-col justify-between overflow-hidden px-4 pt-28 pb-10 md:px-10 md:pb-14 group-data-[static]/journey:min-h-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionLabel index="02">The journey</SectionLabel>
            <h2 id="journey-title" className="font-display mt-4 text-[clamp(2rem,4.5vw,4.5rem)] leading-[0.95] font-bold tracking-[-0.03em]">
              Loading a semester
            </h2>
          </div>
          <p className="font-mono text-xs text-[var(--p-muted)] uppercase group-data-[static]/journey:hidden">Keep scrolling ↓</p>
        </div>

        <div className="grid items-end gap-8 py-10 md:grid-cols-[1.1fr_1fr] md:gap-16 group-data-[static]/journey:hidden">
          {/* The counter. */}
          <p aria-hidden="true" className="font-display leading-[0.8] font-bold tracking-[-0.05em] text-[var(--p-accent)]">
            <span ref={count} className="text-[clamp(6rem,22vw,20rem)] tabular-nums">
              0
            </span>
            <span className="text-[clamp(3rem,9vw,8rem)]">%</span>
            <span className="mt-4 block font-mono text-xs font-normal tracking-[0.3em] text-[var(--p-muted)] md:text-sm">LOADED</span>
          </p>

          {/* The current milestone (stacked; the active one is shown). */}
          <div className="relative min-h-[15rem] md:min-h-[17rem]">
            {ms.map((m) => (
              <article
                key={m.title}
                data-milestone
                className="absolute inset-x-0 bottom-0 translate-y-4 opacity-0 transition-[opacity,transform] duration-500 ease-out data-[on]:translate-y-0 data-[on]:opacity-100"
              >
                <p className="font-mono text-xs tracking-wide text-[var(--p-accent-2)] uppercase">
                  {m.pct}% · {m.kicker}
                </p>
                <h3 className="font-display mt-3 text-[clamp(1.75rem,3.2vw,3rem)] leading-[1] font-bold tracking-[-0.02em]">{m.title}</h3>
                <p className="mt-4 max-w-[46ch] text-[var(--p-muted)] md:text-lg">{m.text}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Reduced motion: every milestone as a list. */}
        <ol className="hidden gap-10 py-10 group-data-[static]/journey:grid md:grid-cols-2">
          {ms.map((m) => (
            <li key={m.title}>
              <p className="font-mono text-xs tracking-wide text-[var(--p-accent-2)] uppercase">
                {m.pct}% · {m.kicker}
              </p>
              <h3 className="font-display mt-2 text-2xl font-bold">{m.title}</h3>
              <p className="mt-2 max-w-[46ch] text-[var(--p-muted)]">{m.text}</p>
            </li>
          ))}
        </ol>

        {/* The progress bar with a tick per milestone. */}
        <div aria-hidden="true" className="relative">
          <div className="h-2 overflow-hidden rounded-full bg-[var(--p-fg)]/10">
            <div
              ref={bar}
              className="h-full origin-left rounded-full bg-linear-to-r from-[var(--p-accent-2)] to-[var(--p-accent)] group-data-[static]/journey:!scale-x-100"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
          <div className="relative mt-3 h-10">
            {ms.map((m) => (
              <div
                key={m.title}
                data-tick
                className={`absolute top-0 -translate-x-1/2 text-center ${[0, 50, 100].includes(m.pct) ? "" : "max-md:hidden"} text-[var(--p-muted)] transition-colors duration-300 data-[on]:text-[var(--p-fg)] first:translate-x-0 first:text-left last:-translate-x-full last:text-right`}
                style={{ left: `${m.pct}%` }}
              >
                <span className="font-mono text-[10px] md:text-xs">{m.pct}%</span>
                <span className="hidden font-mono text-[10px] tracking-wide uppercase lg:block">{m.kicker}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import type { Project, Signature } from "@/data/projects";
import { useScene } from "@/lib/use-scene";
import { SectionLabel } from "../bits";

type Data = Extract<Signature, { type: "horizontal-steps" }>;

/** Vertical scroll drives a horizontal track of process steps. */
export function HorizontalSteps({ data }: { project: Project; data: Data }) {
  const root = useRef<HTMLElement>(null);
  const pinned = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);

  useScene(root, ({ reduced }) => {
    if (reduced) return; // Reduced motion: the track stays a normal horizontally scrollable list.
    const el = track.current!;
    const distance = () => el.scrollWidth - el.clientWidth;
    const move = gsap.to(el, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: pinned.current,
        start: "top top",
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
    gsap.fromTo("[data-steps-bar]", { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { trigger: pinned.current, start: "top top", end: () => `+=${distance()}`, scrub: 0.6 } });

    // Each card's illustration pops as the card slides into view.
    gsap.utils.toArray<HTMLElement>("[data-step]").forEach((card) => {
      gsap.from(card.querySelector("[data-illo]"), {
        scale: 0.5,
        rotate: -12,
        autoAlpha: 0,
        ease: "back.out(1.6)",
        scrollTrigger: { trigger: card, containerAnimation: move, start: "left 85%", end: "left 45%", scrub: true },
      });
    });
  });

  return (
    <section ref={root} aria-labelledby="steps-title">
      <div ref={pinned} className="flex h-dvh flex-col overflow-hidden pt-28 pb-8 md:pt-28">
        <div className="flex flex-wrap items-end justify-between gap-4 px-4 md:px-10">
          <div>
            <SectionLabel index="02">
              How it works
            </SectionLabel>
            <h2 id="steps-title" className="font-display mt-4 text-[clamp(2rem,4.5vw,4.5rem)] leading-[0.95] font-bold tracking-[-0.03em]">
              From case file to board game
            </h2>
          </div>
          <p className="font-mono text-xs text-[var(--p-muted)] uppercase">{data.steps.length} steps →</p>
        </div>

        <ol
          ref={track}
          className="scrollbar-none mt-8 flex min-h-0 flex-1 snap-x gap-4 overflow-x-auto px-4 motion-safe:overflow-x-visible md:mt-12 md:gap-6 md:px-10"
        >
          {data.steps.map((step, i) => (
            <li
              key={step.title}
              data-step
              className="flex w-[78vw] shrink-0 snap-start flex-col justify-between rounded-2xl border border-[var(--p-fg)]/10 bg-white p-6 shadow-[0_20px_60px_-30px_rgba(16,19,43,0.35)] will-change-transform sm:w-[48vw] md:w-[32vw] md:p-8 lg:w-[26vw]"
            >
              <div className="flex items-start justify-between">
                <span className="font-display text-[clamp(3.5rem,7vw,6.5rem)] leading-none font-bold tracking-[-0.05em] text-[var(--p-accent)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div data-illo className="h-20 w-24 md:h-24 md:w-28">
                  <StepIllustration index={i} />
                </div>
              </div>
              <div>
                <h3 className="font-display text-[clamp(1.5rem,2.4vw,2.25rem)] font-bold tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-2 max-w-[30ch] text-[var(--p-muted)]">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div aria-hidden="true" className="mx-4 mt-6 h-[3px] rounded-full bg-[var(--p-fg)]/10 motion-reduce:hidden md:mx-10">
          <div data-steps-bar className="h-full origin-left rounded-full bg-[var(--p-accent)]" />
        </div>
      </div>
    </section>
  );
}

function StepIllustration({ index }: { index: number }) {
  const stroke = { fill: "none", stroke: "var(--p-accent)", strokeWidth: 2.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const doc = <rect x="30" y="8" width="50" height="66" rx="4" {...stroke} />;
  const shapes = [
    <g key="upload">
      {doc}
      <path d="M55 58 V28 M44 39 L55 28 L66 39" {...stroke} />
    </g>,
    <g key="analyse">
      {doc}
      <path d="M38 20 H70 M38 30 H64 M38 40 H58" {...stroke} strokeWidth={2} />
      <circle cx="72" cy="54" r="13" {...stroke} fill="#fff" />
      <path d="M81.5 63.5 L94 76" {...stroke} strokeWidth={4} />
    </g>,
    <g key="gen">
      <path d="M55 6 C57 28 62 33 84 35 C62 37 57 42 55 64 C53 42 48 37 26 35 C48 33 53 28 55 6 Z" {...stroke} />
      <path d="M88 60 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 Z" fill="var(--p-accent-2)" />
    </g>,
    <g key="review">
      {doc}
      <circle cx="78" cy="62" r="16" fill="var(--p-accent)" />
      <path d="M70 62 l6 6 10 -12" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </g>,
    <g key="export">
      {doc}
      <path d="M55 22 V52 M44 41 L55 52 L66 41" {...stroke} />
      <path d="M40 62 H70" {...stroke} strokeWidth={3} />
    </g>,
  ];
  return (
    <svg viewBox="0 0 110 82" className="h-full w-full" aria-hidden="true">
      {shapes[index % shapes.length]}
    </svg>
  );
}

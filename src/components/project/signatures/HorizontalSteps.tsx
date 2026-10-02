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
              {data.heading ?? "From case file to board game"}
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
                  <StepIllustration index={i} set={data.icons} />
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

function StepIllustration({ index, set = "documents" }: { index: number; set?: Data["icons"] }) {
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
  // Engineering: learn (book), map (diagram), fix (multimeter), automate (fill/drain loop), document.
  const engineering = [
    <g key="learn">
      <path d="M55 20 C45 12 30 12 20 16 V66 C30 62 45 62 55 70 C65 62 80 62 90 66 V16 C80 12 65 12 55 20 Z M55 20 V70" {...stroke} />
      <path d="M28 28 H46 M28 38 H46 M64 28 H82 M64 38 H82" {...stroke} strokeWidth={2} />
    </g>,
    <g key="map">
      <rect x="14" y="10" width="26" height="18" rx="3" {...stroke} />
      <rect x="70" y="10" width="26" height="18" rx="3" {...stroke} />
      <rect x="42" y="54" width="26" height="18" rx="3" fill="var(--p-accent)" />
      <path d="M27 28 V40 H55 V54 M83 28 V40 H55" {...stroke} />
    </g>,
    <g key="fix">
      <rect x="36" y="6" width="38" height="56" rx="6" {...stroke} />
      <rect x="43" y="13" width="24" height="12" rx="2" fill="var(--p-accent-2)" />
      <circle cx="55" cy="42" r="9" {...stroke} />
      <path d="M55 42 L60 36" {...stroke} />
      <path d="M46 62 C40 72 26 70 18 76 M64 62 C70 72 84 70 92 76" {...stroke} strokeWidth={2} />
    </g>,
    <g key="automate">
      <path d="M30 41 A25 25 0 0 1 76 27 M80 41 A25 25 0 0 1 34 55" {...stroke} />
      <path d="M70 18 L77 27 L67 31 M40 64 L33 55 L43 51" {...stroke} />
      <path d="M55 30 C50 38 47 42 47 47 A8 8 0 0 0 63 47 C63 42 60 38 55 30 Z" fill="var(--p-accent-2)" />
    </g>,
    <g key="document">
      <path d="M32 6 H66 L80 20 V76 H32 Z M66 6 V20 H80" {...stroke} />
      <path d="M40 34 H72 M40 44 H72 M40 54 H62" {...stroke} strokeWidth={2} />
      <circle cx="82" cy="64" r="14" fill="var(--p-accent)" />
      <path d="M75 64 l5 5 9 -10" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </g>,
  ];
  const list = set === "engineering" ? engineering : shapes;
  return (
    <svg viewBox="0 0 110 82" className="h-full w-full" aria-hidden="true">
      {list[index % list.length]}
    </svg>
  );
}

"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Fact, Project } from "@/data/projects";
import { useScene } from "@/lib/use-scene";
import { SectionLabel } from "./bits";

const format = (f: Fact, v: number) =>
  `${f.prefix ?? ""}${v.toLocaleString("en-US", { minimumFractionDigits: f.decimals ?? 0, maximumFractionDigits: f.decimals ?? 0 })}${f.suffix ?? ""}`;

/** Key numbers that count up from zero when they scroll into view. */
export function Facts({ project }: { project: Project }) {
  const root = useRef<HTMLElement>(null);

  useScene(root, ({ reduced }) => {
    const items = gsap.utils.toArray<HTMLElement>("[data-fact]");
    if (reduced) return;
    const resets: (() => void)[] = [];
    items.forEach((el, i) => {
      const fact = project.facts[i];
      const out = el.querySelector("[data-value]")!;
      const counter = { v: 0 };
      out.textContent = format(fact, 0);
      gsap.from(el, { y: 30, autoAlpha: 0, duration: 0.8, ease: "power2.out", delay: i * 0.08, scrollTrigger: { trigger: root.current, start: "top 75%" } });
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 75%",
        once: true,
        onEnter: () =>
          gsap.to(counter, {
            v: fact.value,
            duration: 1.8,
            delay: i * 0.08,
            ease: "power3.out",
            onUpdate: () => {
              out.textContent = format(fact, counter.v);
            },
          }),
      });
      resets.push(() => {
        out.textContent = format(fact, fact.value);
      });
    });
    return () => resets.forEach((r) => r());
  });

  return (
    <section ref={root} className="px-4 py-[16vh] md:px-10">
      <SectionLabel index="04" placeholder>
        In numbers
      </SectionLabel>
      <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-4">
        {project.facts.map((f) => (
          // dt comes first for screen readers; flex-col-reverse shows the number on top.
          <div key={f.label} data-fact className="flex flex-col-reverse border-t border-current/20 pt-5">
            <dt className="mt-3 text-sm text-[var(--p-muted)] md:text-base">{f.label}</dt>
            <dd data-value className="font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-none tracking-[-0.03em] tabular-nums text-[var(--p-accent)]">
              {format(f, f.value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

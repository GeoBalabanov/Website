"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import type { Project } from "@/data/projects";
import { useScene } from "@/lib/use-scene";
import s from "./Skills.module.css";

/**
 * "Built with", right under the poster: the project's skills as a big ticker in
 * the project's display font, then grouped (design, code, tools…) as a spec sheet
 * whose chips pop in as it scrolls into view.
 */
export function Skills({ project }: { project: Project }) {
  const root = useRef<HTMLElement>(null);
  const groups = project.skills ?? [];

  useScene(root, ({ reduced }) => {
    if (reduced) return;
    gsap.utils.toArray<HTMLElement>("[data-skill-row]").forEach((row) => {
      gsap.from(row.querySelectorAll("[data-chip]"), {
        autoAlpha: 0,
        y: 18,
        scale: 0.9,
        duration: 0.6,
        stagger: 0.06,
        ease: "back.out(1.8)",
        scrollTrigger: { trigger: row, start: "top 88%" },
      });
    });
  });

  if (groups.length === 0) return null;
  const all = groups.flatMap((g) => g.items);
  // One run of the ticker: every skill, alternating solid and outlined, with a star between.
  const run = (copy: number) => (
    <div className={s.run} aria-hidden={copy > 0 ? "true" : undefined}>
      {all.map((item, i) => (
        <span key={`${copy}-${item}`} className="flex items-center gap-[0.5em]">
          <span className={i % 2 ? s.ghost : undefined}>{item}</span>
          <span className={s.star}>✱</span>
        </span>
      ))}
    </div>
  );

  return (
    <section ref={root} aria-labelledby="skills-title" className="pt-[10vh] pb-[4vh]">
      <div className="flex items-baseline justify-between gap-4 px-4 pb-5 md:px-10">
        <h2 id="skills-title" className="font-mono text-xs tracking-wide text-[var(--p-muted)] uppercase">
          {project.kind ? "What it trained" : "Built with"}
        </h2>
        <p className="font-mono text-xs tracking-wide text-[var(--p-muted)] uppercase">
          {all.length} {project.kind ? "skills" : "skills & tools"}
        </p>
      </div>

      <div className={s.ticker}>
        <div className={s.track}>
          {run(0)}
          {run(1)}
        </div>
      </div>

      <dl className="mt-10 grid gap-x-10 gap-y-8 px-4 md:mt-14 md:grid-cols-3 md:px-10">
        {groups.map((g, i) => (
          <div key={g.label} data-skill-row>
            <dt className="flex items-center gap-3 border-t border-[var(--p-fg)]/15 pt-4 font-mono text-xs tracking-wide text-[var(--p-muted)] uppercase">
              <span className="text-[var(--p-accent)]">{String(i + 1).padStart(2, "0")}</span>
              {g.label}
            </dt>
            <dd className="mt-4 flex flex-wrap gap-2">
              {g.items.map((item) => (
                <span key={item} data-chip className={s.chip}>
                  {item}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

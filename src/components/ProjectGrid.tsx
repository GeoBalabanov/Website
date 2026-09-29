"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "@/data/projects";
import { prefersReducedMotion } from "@/lib/motion";
import { ProjectImage } from "./ProjectImage";

gsap.registerPlugin(ScrollTrigger);

export function ProjectGrid({ projects }: { projects: Project[] }) {
  const list = useRef<HTMLUListElement>(null);

  // Items fade up in small staggered batches as they scroll into view.
  useLayoutEffect(() => {
    if (!list.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>("[data-grid-item]");
      gsap.set(items, { autoAlpha: 0, y: 16 });
      ScrollTrigger.batch(items, {
        start: "top 92%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.06, overwrite: true }),
      });
    }, list);
    return () => ctx.revert();
  }, []);

  return (
    <ul
      ref={list}
      className="grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 sm:gap-x-[7%] sm:gap-y-20 lg:grid-cols-5 lg:gap-x-[9%] lg:gap-y-28"
    >
      {projects.flatMap((project) =>
        project.images.map((image, i) => {
          const first = i === 0;
          const media = (
            <div className="relative aspect-[3/4] overflow-hidden bg-ink/5">
              <ProjectImage
                image={image}
                sizes="(min-width: 1024px) 14vw, (min-width: 640px) 26vw, 46vw"
                className="transition-transform duration-[900ms] ease-out-soft group-hover:scale-[1.04] group-focus-visible:scale-[1.04]"
              />
            </div>
          );
          return (
            <li key={image.src} data-grid-item className="group">
              {project.link ? (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${project.title}, image ${i + 1} (opens in a new tab)`}
                  className="block"
                >
                  {media}
                </a>
              ) : (
                media
              )}
              <p className="mt-2.5 text-[13px] font-medium sm:text-sm">
                <span className="sr-only">Project </span>
                {project.number}.
              </p>
              {first && (
                <div className="mt-2.5 text-[13px] leading-snug sm:text-sm">
                  <h2 className="font-semibold">{project.title}</h2>
                  <p className="mt-0.5 text-mute-ink">{project.subtitle}</p>
                </div>
              )}
            </li>
          );
        }),
      )}
    </ul>
  );
}

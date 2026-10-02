"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project, ProjectImage as ProjectImageType } from "@/data/projects";
import { prefersReducedMotion } from "@/lib/motion";
import { ProjectImage } from "./ProjectImage";
import { OpenProjectLink } from "./transition/OpenProjectLink";
import type { ProjectSection } from "./transition/ProjectTransition";
import { LivingCover } from "./living-cover/LivingCover";
import { CornerTape } from "./CornerTape";

gsap.registerPlugin(ScrollTrigger);

// What each project's signature section is called on its page.
const STORY_LABEL: Record<Project["signature"]["type"], string> = {
  "route-map": "The route",
  "pulse-results": "Race results",
  "horizontal-steps": "How it works",
  "kinetic-type": "The concept",
  "webgl-distort": "The interface",
  "bloom-garden": "The garden",
  "progress-journey": "The journey",
};

/** Each image of a project opens a different part of it: the top, its signature section, its gallery. */
function destination(project: Project, i: number): { section?: ProjectSection; label: string } {
  if (i === 0) return { label: "Overview" };
  if (i === 1) return { section: "story", label: STORY_LABEL[project.signature.type] };
  return { section: "gallery", label: "Gallery" };
}

export function ProjectGrid({ projects }: { projects: Project[] }) {
  const list = useRef<HTMLUListElement>(null);

  // Items fade up in small staggered batches as they scroll into view.
  useLayoutEffect(() => {
    // Skip when returning from a project: the shared-element transition lands on a visible grid.
    if (!list.current || prefersReducedMotion() || document.documentElement.dataset.flip === "on") return;
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
          const to = destination(project, i);
          return (
            <li key={image.src} data-grid-item className="group">
              <OpenProjectLink project={project} section={to.section} label={`Open ${project.title}: ${to.label}`}>
                <div data-flip-id={first ? project.slug : undefined} className="relative aspect-[3/4] overflow-hidden bg-ink/5">
                  <GridMedia image={image} project={project} cover={first} />
                </div>
              </OpenProjectLink>
              <p className="mt-2.5 text-[13px] font-medium sm:text-sm">
                {/* Personal work is named by its kind, once (under its first image). */}
                {project.kind ? (
                  first && project.kind
                ) : (
                  <>
                    <span className="sr-only">Project </span>
                    {project.number}.
                  </>
                )}
                {!first && (
                  <span className={`font-normal text-mute-ink transition-colors group-hover:text-ink ${project.kind ? "" : "ml-2"}`}>
                    {to.label}
                    <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">
                      {" "}→
                    </span>
                  </span>
                )}
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

/**
 * One grid image. Every image with a motion (a project's cover via `coverMotion`,
 * the others via their own `motion`) comes alive, but only while it is on screen.
 */
function GridMedia({ image, project, cover }: { image: ProjectImageType; project: Project; cover: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const motion = cover ? project.coverMotion : image.motion;
  const animated = !!motion;

  useEffect(() => {
    if (!animated || !ref.current) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "10% 0px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [animated]);

  return (
    <div
      ref={ref}
      className="absolute inset-0 transition-transform duration-[900ms] ease-out-soft group-hover:scale-[1.04] group-focus-within:scale-[1.04]"
    >
      <ProjectImage image={image} sizes="(min-width: 1024px) 14vw, (min-width: 640px) 26vw, 46vw" />
      {motion && <LivingCover motion={motion} src={image.src} active={inView} />}
      {cover && project.underConstruction && <CornerTape bg={project.theme.accent} fg={project.theme.bg} />}
    </div>
  );
}

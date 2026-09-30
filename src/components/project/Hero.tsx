"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import type { Project } from "@/data/projects";
import { useScene } from "@/lib/use-scene";
import { useProjectTransition } from "@/components/transition/ProjectTransition";
import { prefersReducedMotion } from "@/lib/motion";
import { CorsaStage } from "./hero-scenes/CorsaStage";
import { FlagWave } from "@/components/living-cover/FlagWave";

export function Hero({ project }: { project: Project }) {
  const root = useRef<HTMLElement>(null);
  const { heroReady } = useProjectTransition();
  const light = project.theme.heroTone === "light";
  const cover = project.images[0];
  const hero = project.hero ?? cover;
  // A theme may bring its own title size (wide faces need smaller type).
  const custom = project.theme.titleClass ?? "";
  const titleClass = custom.includes("text-[") ? custom : `text-[clamp(3.25rem,11vw,11.5rem)] ${custom}`;

  // Live 3D hero (if the project has one): mounts after hydration, fades in over the
  // still (a render of its first frame) and only runs while the hero is on screen.
  const [scene, setScene] = useState({ on: false, visible: true, wide: true });
  useEffect(() => {
    if (!project.heroScene || prefersReducedMotion()) return;
    const el = root.current!;
    let inView = true;
    const update = () => setScene({ on: true, visible: inView && !document.hidden, wide: window.matchMedia("(min-width: 768px)").matches });
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      update();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [project.heroScene]);

  useScene(root, ({ reduced }) => {
    const title = root.current!.querySelector<HTMLElement>("[data-title]")!;
    const meta = root.current!.querySelectorAll("[data-meta]");
    // Arriving through the shared-element transition: wait for the overlay to clear.
    const delay = document.documentElement.dataset.flip === "on" ? 0.55 : 0.2;

    if (reduced) {
      gsap.from([title, ...meta], { autoAlpha: 0, duration: 0.6, delay: 0.1 });
      return;
    }

    const split = SplitText.create(title, { type: "chars,words", mask: "chars", charsClass: "hero-char will-change-transform" });
    gsap.from(split.chars, { yPercent: 115, duration: 1.1, ease: "expo.out", stagger: 0.028, delay });
    gsap.from(meta, { autoAlpha: 0, y: 12, duration: 0.8, ease: "power2.out", stagger: 0.08, delay: delay + 0.35 });

    // Scroll away: image drifts and zooms, title lifts.
    const media = root.current!.querySelector("[data-hero-img]");
    gsap.to(media, {
      yPercent: 12,
      scale: 1.12,
      ease: "none",
      scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
    });
    gsap.to("[data-hero-copy]", {
      yPercent: -40,
      autoAlpha: 0.2,
      ease: "none",
      scrollTrigger: { trigger: root.current, start: "20% top", end: "bottom top", scrub: true },
    });
  });

  return (
    <section
      ref={root}
      className={`relative h-dvh min-h-[34rem] overflow-hidden ${light ? "bg-[var(--p-bg)] text-[var(--p-fg)]" : "bg-black text-white"}`}
    >
      <div data-hero-media className="absolute inset-0">
        <div data-hero-img className="absolute inset-0 will-change-transform">
          {/* A project with a separate wide hero uses it from tablet width up; phones keep the portrait cover. */}
          {project.hero && (
            <Image
              src={cover.src}
              alt={cover.alt}
              fill
              priority
              sizes="100vw"
              unoptimized={cover.src.endsWith(".svg")}
              className="object-cover md:hidden"
              onLoad={() => heroReady(project.slug)}
            />
          )}
          <Image
            src={hero.src}
            alt={hero.alt}
            fill
            priority
            sizes="100vw"
            unoptimized={hero.src.endsWith(".svg")}
            className={`object-cover ${project.hero ? "max-md:hidden" : ""}`}
            onLoad={() => heroReady(project.slug)}
          />
          {scene.on && project.heroScene === "corsa-head" && <CorsaStage paused={!scene.visible} />}
          {scene.on && project.heroScene === "flag-wind" && (
            <FlagWave key={scene.wide ? "wide" : "tall"} src={scene.wide ? hero.src : cover.src} running={scene.visible} rasterWidth={scene.wide ? 1800 : 1000} />
          )}
        </div>
      </div>
      {light ? (
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-[var(--p-bg)]/90 via-[var(--p-bg)]/40 to-transparent md:hidden" />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-black/30" />
      )}

      <div data-hero-copy className="absolute inset-x-0 bottom-0 px-4 pb-8 md:px-10 md:pb-12">
        <p data-meta className="mb-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs tracking-wide uppercase opacity-85 md:text-sm">
          <span>{project.number}</span>
          <span>{project.year}</span>
          <span>{project.role}</span>
          <span>{project.location}</span>
        </p>
        <h1
          data-title
          className={`font-display max-w-[14ch] leading-[0.88] tracking-[-0.03em] text-balance ${titleClass}`}
        >
          {project.title}
        </h1>
        <div data-meta className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm opacity-85">
          <span className="max-w-[40ch]">{project.subtitle}</span>
          {project.link && (
            <a href={project.link} target="_blank" rel="noreferrer" className="nav-link">
              Visit live ↗<span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>

      <p data-meta aria-hidden="true" className="absolute right-4 bottom-8 font-mono text-xs uppercase opacity-70 md:right-10 md:bottom-12">
        Scroll ↓
      </p>
    </section>
  );
}

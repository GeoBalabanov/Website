"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "@/data/projects";
import { projectFont } from "@/lib/project-fonts";
import { useProjectTransition } from "@/components/transition/ProjectTransition";
import { scrollToImmediate } from "@/components/SmoothScroll";
import { Hero } from "./Hero";
import { Intro } from "./Intro";
import { Gallery } from "./Gallery";
import { Facts } from "./Facts";
import { NextProject } from "./NextProject";
import { SignatureSection } from "./signatures";

export function ProjectPage({ project, next }: { project: Project; next: Project }) {
  const { close, sectionReady } = useProjectTransition();
  const font = projectFont(project.theme.font);
  const t = project.theme;

  // Paint the whole document in the project's colors (overscroll, behind the header).
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.background;
    html.style.background = t.bg;
    document.body.style.background = t.bg;
    return () => {
      html.style.background = prev;
      document.body.style.background = "";
    };
  }, [t.bg]);

  // Pinned sections need final measurements: refresh once fonts and images have settled.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    const id = window.setTimeout(refresh, 1200);
    return () => {
      window.removeEventListener("load", refresh);
      window.clearTimeout(id);
    };
  }, [project.slug]);

  // Opened on a section (/projects/slug#gallery): land there once the pinned sections are measured.
  // Runs after the smooth-scroll reset to the top; the transition overlay waits for this.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      ScrollTrigger.refresh();
      scrollToImmediate(target.getBoundingClientRect().top + window.scrollY);
      ScrollTrigger.update();
      requestAnimationFrame(() => sectionReady(project.slug));
    };
    const timer = window.setTimeout(go, 320);
    return () => {
      window.clearTimeout(timer);
      done = true;
    };
  }, [project.slug, sectionReady]);

  // Escape goes back to the index.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(project.slug);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, project.slug]);

  return (
    <main
      id="main"
      tabIndex={-1}
      className={`${font.className} relative overflow-x-clip bg-[var(--p-bg)] text-[var(--p-fg)] outline-none`}
      style={
        {
          "--p-bg": t.bg,
          "--p-fg": t.fg,
          "--p-muted": t.muted,
          "--p-accent": t.accent,
          "--p-accent-2": t.accent2,
          "--p-display": font.family,
          // Anton ships one (heavy) weight: never fake a bolder one on top of it.
          ...(t.font === "anton" ? { fontSynthesisWeight: "none" } : {}),
        } as React.CSSProperties
      }
    >
      <Hero project={project} />
      <Intro project={project} />
      <div id="story">
        <SignatureSection project={project} />
      </div>
      <Gallery project={project} />
      <Facts project={project} />
      <NextProject next={next} />

      <button
        type="button"
        onClick={() => close(project.slug)}
        aria-label="Back to projects"
        className="fixed bottom-4 left-4 z-30 rounded-full bg-[var(--p-fg)] px-4 py-3 text-sm font-medium text-[var(--p-bg)] shadow-lg transition-transform duration-300 hover:scale-105 md:bottom-6 md:left-6"
      >
        <span aria-hidden="true">← </span>
        Back<span className="hidden md:inline"> to projects</span>
      </button>
    </main>
  );
}

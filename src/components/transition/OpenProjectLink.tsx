"use client";

import Link from "next/link";
import type { Project } from "@/data/projects";
import { useProjectTransition } from "./ProjectTransition";

type Props = {
  project: Pick<Project, "slug" | "title">;
  children: React.ReactNode;
  className?: string;
  tabIndex?: number;
  label?: string;
};

/**
 * A normal link to /projects/[slug] (so cmd-click, prefetch and no-JS work)
 * that plays the shared-element transition on a plain click.
 */
export function OpenProjectLink({ project, children, className = "block", tabIndex, label }: Props) {
  const { open } = useProjectTransition();
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={className}
      tabIndex={tabIndex}
      aria-label={label ?? `Open project: ${project.title}`}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        open(project.slug, e.currentTarget);
      }}
    >
      {children}
    </Link>
  );
}

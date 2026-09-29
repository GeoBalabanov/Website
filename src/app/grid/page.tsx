import type { Metadata } from "next";
import { ProjectGrid } from "@/components/ProjectGrid";
import { projects } from "@/data/projects";

export const metadata: Metadata = { title: "Projects" };

export default function GridPage() {
  return (
    <main id="main" tabIndex={-1} className="px-4 pt-32 pb-32 outline-none md:px-[4.5vw] md:pt-40">
      <h1 className="sr-only">Projects</h1>
      <ProjectGrid projects={projects} />
    </main>
  );
}

import { ProjectSlider } from "@/components/ProjectSlider";
import { projects } from "@/data/projects";

export default function Home() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <ProjectSlider projects={projects} />
    </main>
  );
}

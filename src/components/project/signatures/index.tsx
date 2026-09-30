import type { Project } from "@/data/projects";
import { RouteMap } from "./RouteMap";
import { PulseResults } from "./PulseResults";
import { HorizontalSteps } from "./HorizontalSteps";
import { KineticType } from "./KineticType";
import { WebGLDistort } from "./WebGLDistort";
import { BloomGarden } from "./BloomGarden";
import { ProgressJourney } from "./ProgressJourney";

/**
 * Picks the signature section from `project.signature.type`.
 * To add a new style: create a component in this folder, add its type to
 * `Signature` in src/data/projects.ts and a case here.
 */
export function SignatureSection({ project }: { project: Project }) {
  const s = project.signature;
  switch (s.type) {
    case "route-map":
      return <RouteMap project={project} data={s} />;
    case "pulse-results":
      return <PulseResults project={project} data={s} />;
    case "horizontal-steps":
      return <HorizontalSteps project={project} data={s} />;
    case "kinetic-type":
      return <KineticType project={project} data={s} />;
    case "webgl-distort":
      return <WebGLDistort project={project} data={s} />;
    case "bloom-garden":
      return <BloomGarden project={project} data={s} />;
    case "progress-journey":
      return <ProgressJourney project={project} data={s} />;
  }
}

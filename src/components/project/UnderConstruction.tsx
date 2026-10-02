import type { Project } from "@/data/projects";
import { SectionLabel } from "./bits";
import s from "./UnderConstruction.module.css";

/**
 * Stands in for the gallery while a project is still being made: two tapes in
 * the project's accents cross the page, scrolling "Under construction", and a
 * voice note in the middle keeps recording. CSS only (transform and opacity);
 * reduced motion holds it still.
 */

const TAPE = ["Under construction", "Coming soon", "Work in progress", "Still recording"];
// Bar heights for the waveform (0–1), drawn once and animated with offsets.
const BARS = [0.35, 0.6, 0.9, 0.5, 0.75, 1, 0.65, 0.4, 0.8, 0.55, 0.95, 0.7, 0.45, 0.85, 0.6, 0.3, 0.7, 0.9, 0.5, 0.65, 0.4, 0.75, 0.55, 0.35];

function Tape({ className }: { className: string }) {
  const run = TAPE.flatMap((t) => [t, "✱"]);
  return (
    <div className={`${s.tape} ${className}`} aria-hidden="true">
      <div className={s.track}>
        {[0, 1].map((k) => (
          <span key={k} className={s.run}>
            {run.map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

export function UnderConstruction({ project, index }: { project: Project; index: string }) {
  return (
    <section id="gallery" className="relative overflow-hidden px-4 py-[14vh] md:px-10">
      <SectionLabel index={index}>Gallery</SectionLabel>

      <div className={s.stage}>
        <Tape className={s.tapeA} />
        <Tape className={s.tapeB} />

        <div className={s.card}>
          <p className={s.cardTop}>
            <span className={s.rec} aria-hidden="true" />
            <span>Rec</span>
            <span className={s.cardName}>{project.title}</span>
          </p>
          <div className={s.wave} aria-hidden="true">
            {BARS.map((h, i) => (
              <span key={i} style={{ "--h": h, animationDelay: `${-((i * 0.37) % 1.4)}s` } as React.CSSProperties} />
            ))}
          </div>
          <div className={s.progress} aria-hidden="true">
            <span />
          </div>
          <h2 className={s.title}>Under construction</h2>
          <p className={s.note}>{project.underConstruction}</p>
        </div>
      </div>
    </section>
  );
}

import s from "./CornerTape.module.css";

/**
 * A small "Under construction" tape across the top-right corner of a cover,
 * for projects that are still being made. Its text scrolls slowly along the
 * tape (CSS only; reduced motion holds it still). The frame must clip it.
 */
export function CornerTape({ bg, fg }: { bg: string; fg: string }) {
  const run = Array.from({ length: 4 }, () => ["Under construction", "✱"]).flat();
  return (
    <div className={s.root} aria-hidden="true">
      <div className={s.tape} style={{ background: bg, color: fg }}>
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
    </div>
  );
}

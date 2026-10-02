import s from "./AdvantechPoster.module.css";

/**
 * Advantech internship cover, "Remote mode": the Demo Box as a poster. A glass
 * tank on an engineering grid fills and drains by itself, forever. The level
 * sensor's thresholds (17.2 mA, 5.6 mA) glow as they're reached, the fill and
 * drain pumps take turns, and the 4–20 mA signal traces the loop below.
 *
 * Code-drawn (sharp at any size) and cheap: everything only moves or fades.
 * `portrait` (3:4) for the slider and grid, `wide` (16:10) for the page hero.
 * The stills (advantech-1.jpg, advantech-hero.jpg) are screenshots of the
 * first frame.
 */

const WAVE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 20' preserveAspectRatio='none'%3E%3Cpath d='M0 10 Q25 2 50 10 T100 10 V20 H0Z' fill='%2378d6f5'/%3E%3C/svg%3E")`;
const TRACE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 100' preserveAspectRatio='none'%3E%3Cpath d='M0 82 C100 82 100 18 200 18 C300 18 300 82 400 82' fill='none' stroke='%234cc3ef' stroke-opacity='0.25' stroke-width='9'/%3E%3Cpath d='M0 82 C100 82 100 18 200 18 C300 18 300 82 400 82' fill='none' stroke='%2378d6f5' stroke-width='2.5'/%3E%3C/svg%3E")`;

export function AdvantechPoster({ variant }: { variant: "portrait" | "wide" }) {
  return (
    <div className={`${s.root} ${variant === "wide" ? s.wide : s.portrait}`} aria-hidden="true">
      <div className={s.scene}>
        <div className={s.grid} />
        <div className={`${s.glow} ${s.glowBrick}`} />
        <div className={`${s.glow} ${s.glowCyan}`} />

        <p className={`${s.label} ${s.title}`}>Advantech · Demo Box</p>
        <p className={`${s.label} ${s.mode}`}>
          <span className={s.dot} /> Remote mode
        </p>

        {/* Pipes and the two pumps taking turns (fill, then drain). */}
        <div className={`${s.pipe} ${s.pipeIn}`} />
        <div className={`${s.pipe} ${s.pipeOut}`} />
        <Pump className={s.pumpIn} activeClass={s.fillOn} />
        <Pump className={s.pumpOut} activeClass={s.drainOn} />

        <div className={s.tank}>
          <div className={s.liquid}>
            <div className={s.wave} style={{ backgroundImage: WAVE }} />
            <div className={s.body} />
            {[18, 36, 54, 72].map((x, i) => (
              <span key={x} className={s.bubble} style={{ left: `${x}%`, animationDelay: `${-i * 1.3}s` }} />
            ))}
          </div>
          <div className={s.probe} />
          <div className={s.probeHead} />
        </div>

        {/* The two thresholds the GCL rules react to. */}
        <div className={`${s.threshold} ${s.high}`}>
          <span>17.2 mA</span>
        </div>
        <div className={`${s.threshold} ${s.low}`}>
          <span>5.6 mA</span>
        </div>

        {/* The 4–20 mA signal, tracing the same loop. */}
        <div className={s.signal}>
          <div className={s.trace} style={{ backgroundImage: TRACE }} />
        </div>
        <p className={`${s.label} ${s.signalLabel}`}>AI2 · 4–20 mA</p>
      </div>
    </div>
  );
}

function Pump({ className, activeClass }: { className: string; activeClass: string }) {
  return (
    <div className={`${s.pump} ${className}`}>
      <div className={`${s.pumpRing} ${activeClass}`} />
      <div className={s.rotor} />
      <div className={`${s.rotor} ${s.rotorSpin} ${activeClass}`} />
    </div>
  );
}

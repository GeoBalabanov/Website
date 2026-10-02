import s from "./AdvantechSky.module.css";

/**
 * Advantech internship cover: a painted version of the building in front of
 * a living sky, through a day that loops forever: day → sunset → night →
 * dawn → day. The sun arcs across, soft clouds drift behind the buildings,
 * birds fly by in daylight, and at night the stars come out and windows glow.
 *
 * Built for speed: every layer is a plain element that only moves (transform)
 * or fades (opacity), so the GPU composites it without repainting. The
 * building's sunset and night colours are pre-rendered images that crossfade
 * (advantech-ground-dusk/-night.webp), not live blend modes.
 *
 * Laid out in the photo's own pixel coordinates (998 × 668), shared with the
 * script that rendered the stills (advantech-1.jpg, advantech-hero.jpg), so
 * the first frame (midday) matches them exactly.
 */

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

const VIEW = {
  portrait: { x: 110, y: -497, w: 880, h: 1165 },
  wide: { x: 0, y: 0, w: 998, h: 668 },
};
const TILE = 1400;
const SKY_TOP = -479;
const HORIZON = 330;

// Sky gradients from the top of the extended sky down to the horizon.
const SKIES = {
  day: ["#516899", "#6e87b4", "#849ec7", "#97b3d9", "#a9c6e9"],
  dawn: ["#4a5590", "#8c7fb0", "#d99aaa", "#f5bfa4", "#ffd9ad"],
  sunset: ["#2e2f6b", "#6b4a8a", "#c4648a", "#f08a6e", "#ffb862"],
  night: ["#060a1f", "#0b1330", "#131d45", "#1c2855", "#2a3767"],
};

// One static image of stars (no per-star animation).
const STARS = (() => {
  const dots = Array.from({ length: 70 }, (_, i) => {
    const x = ((i * 137.5) % 1300) - 150 + 150;
    const y = (i * 89.3) % 760;
    const r = 0.6 + ((i * 7) % 5) * 0.25;
    return `<circle cx='${x.toFixed(1)}' cy='${y.toFixed(1)}' r='${r}' fill='%23e8ecff' opacity='${0.5 + (i % 3) * 0.25}'/>`;
  }).join("");
  return `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1300 760'>${dots}</svg>")`;
})();

export function AdvantechSky({ variant }: { variant: "portrait" | "wide" }) {
  const v = VIEW[variant];
  // Photo units → CSS: the scene box is a size container, so 1 unit = 100cqw / view width.
  const u = (n: number) => `calc(${n} * var(--u))`;
  const sky = (stops: string[]) => {
    // Gradient positions in the scene box, from the photo's coordinates.
    const at = (y: number) => `${(((y - v.y) / v.h) * 100).toFixed(2)}%`;
    return `linear-gradient(to bottom, ${stops.map((c, i) => `${c} ${at(SKY_TOP + ((HORIZON - SKY_TOP) * i) / (stops.length - 1))}`).join(", ")})`;
  };
  return (
    <div className={s.root} aria-hidden="true">
      <div className={s.scene} style={{ aspectRatio: `${v.w} / ${v.h}`, "--vw": v.w, "--ar": v.w / v.h } as Vars}>
        <div className={s.fill} style={{ background: sky(SKIES.day) }} />
        <div className={`${s.fill} ${s.dawn}`} style={{ background: sky(SKIES.dawn) }} />
        <div className={`${s.fill} ${s.sunset}`} style={{ background: sky(SKIES.sunset) }} />
        <div className={`${s.fill} ${s.night}`} style={{ background: sky(SKIES.night) }} />

        {/* Everything below is placed in photo coordinates, from the photo's origin. */}
        <div className={s.world} style={{ left: u(-v.x), top: u(-v.y) }}>
          <div className={`${s.stars} ${s.night}`} style={{ left: u(-150), top: u(-490), width: u(1300), height: u(760), backgroundImage: STARS }} />
          <div className={s.moon} />
          <div className={s.sun} />

          <div className={s.clouds}>
            <div className={s.drift} style={{ top: u(110), width: u(TILE * 2), height: u(260), backgroundImage: "url(/projects/advantech-clouds-far.webp)", backgroundSize: `${u(TILE)} 100%`, animationDuration: "220s" }} />
            <div className={s.drift} style={{ top: u(-470), width: u(TILE * 2), height: u(620), backgroundImage: "url(/projects/advantech-clouds-near.webp)", backgroundSize: `${u(TILE)} 100%`, animationDuration: "120s" }} />
          </div>

          <div className={s.daylight}>
            <svg className={s.flock} viewBox="-90 -40 120 80" style={{ width: u(120), height: u(80) }}>
              {[
                [0, 0, 1],
                [-34, 14, 0.85],
                [-22, -16, 0.8],
                [-60, 26, 0.7],
                [-70, -4, 0.75],
              ].map(([x, y, sc], i) => (
                <path key={i} transform={`translate(${x} ${y}) scale(${sc})`} d="M-9 0 Q-5 -5 0 0 Q5 -5 9 0" fill="none" stroke="#1d2433" strokeWidth="1.6" strokeLinecap="round" />
              ))}
            </svg>
          </div>

          <div className={s.ground} style={{ backgroundImage: "url(/projects/advantech-ground.webp)" }} />
          <div className={`${s.ground} ${s.dusk}`} style={{ backgroundImage: "url(/projects/advantech-ground-dusk.webp)" }} />
          <div className={`${s.ground} ${s.night}`} style={{ backgroundImage: "url(/projects/advantech-ground-night.webp)" }} />
        </div>
      </div>
    </div>
  );
}

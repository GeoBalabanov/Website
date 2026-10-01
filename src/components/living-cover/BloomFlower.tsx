import s from "./BloomFlow.module.css";

/**
 * One Bloom flower (SVG), swaying slowly on its stem while its petals turn.
 * `open` 0 → 1: a closed bud → a full bloom (eased by CSS, so changing it animates).
 */

export type Palette = { a: string; b: string; centre: string; glow?: string };

export const PALETTES = {
  full: { a: "#f472b6", b: "#fb8a7e", centre: "#facc15", glow: "#c026d3" },
  half: { a: "#db2777", b: "#e11d48", centre: "#f59e0b", glow: "#10b981" },
  rest: { a: "#1f3b2a", b: "#294a33", centre: "#27412f" },
  sun: { a: "#d9f99d", b: "#fde047", centre: "#facc15", glow: "#eab308" },
  sea: { a: "#5eead4", b: "#86efac", centre: "#fbbf24", glow: "#22c55e" },
  sky: { a: "#7dd3fc", b: "#93c5fd", centre: "#fbbf24", glow: "#3b82f6" },
  lilac: { a: "#c084fc", b: "#e879f9", centre: "#fde047", glow: "#a855f7" },
} satisfies Record<string, Palette>;

type Vars = React.CSSProperties & Record<`--${string}`, string>;

export function Flower({
  palette,
  open = 1,
  sway = 6,
  delay = 0,
  glow = true,
  className = "",
  style,
}: {
  palette: Palette;
  open?: number;
  /** Seconds per sway. */
  sway?: number;
  delay?: number;
  glow?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const petals = Array.from({ length: 8 }, (_, i) => i);
  return (
    <svg viewBox="0 0 100 150" aria-hidden="true" className={className} style={style}>
      {/* The light on the ground. */}
      {palette.glow && glow && <ellipse cx="50" cy="140" rx="24" ry="5" fill={palette.glow} opacity={0.35 * open} className={s.ease} />}
      <g className={s.sway} style={{ "--sway": `${sway}s`, "--delay": `${-delay}s` } as Vars}>
        <path d="M50 138 C49 115 52 92 50 58" fill="none" stroke="#2f7d4a" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M50 108 C42 100 36 102 33 104 C39 109 45 110 50 108 Z" fill="#2f7d4a" />
        {palette.glow && glow && (
          // The wrapper fades the halo with the bloom; the circle itself breathes.
          <g opacity={open} className={s.ease}>
            <circle cx="50" cy="50" r="34" fill={palette.glow} opacity={0.22} className={s.halo} />
          </g>
        )}
        {/* The bud shows while the flower is closed. */}
        <ellipse cx="50" cy="52" rx="7" ry="13" fill={palette.a} opacity={Math.max(0, 1 - open * 1.6)} className={s.ease} />
        <g className={s.ease} style={{ transform: `scale(${0.15 + 0.85 * open})`, transformOrigin: "50px 50px", opacity: Math.min(1, open * 2) }}>
          <g className={s.spin} style={{ "--delay": `${-delay * 3}s` } as Vars}>
            {petals.map((i) => (
              <ellipse key={i} cx="50" cy="32" rx="8.5" ry="17" fill={i % 2 ? palette.b : palette.a} opacity="0.92" transform={`rotate(${i * 45} 50 50)`} />
            ))}
          </g>
          <circle cx="50" cy="50" r="8" fill={palette.centre} />
        </g>
      </g>
    </svg>
  );
}

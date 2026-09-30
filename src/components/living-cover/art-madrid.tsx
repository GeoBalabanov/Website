"use client";

import { useId } from "react";
import { Blob, Frame, svgProps } from "./art";
import { MADRID_DUNES, MADRID_HAZE, MADRID_HILL_AREA, MADRID_HILL_LINE, MADRID_RING, MADRID_SKY, MADRID_SLATS } from "./madrid-shapes";
import s from "./LivingCover.module.css";

/**
 * 07 Madrid: living versions of public/projects/madrid-exchange-{1,2,3}.svg.
 * Geometry comes from madrid-shapes.ts (generated together with the stills).
 */

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;
const vars = (v: Record<string, string | number>) => v as Vars;

const SKY = `linear-gradient(180deg, ${MADRID_SKY.map(([o, c]) => `${c} ${Number(o) * 100}%`).join(", ")})`;

/** A little bird: two arcs that flap. */
function Bird({ y, scale, delay, dur }: { y: number; scale: number; delay: number; dur: number }) {
  return (
    <g className={s.bird} style={vars({ "--delay": `${delay}s`, "--dur": `${dur}s` })}>
      <g transform={`translate(-60 ${y}) scale(${scale})`}>
        <path className={s.flap} d="M -12 0 Q -6 -7 0 0 Q 6 -7 12 0" fill="none" stroke="#3d0b0a" strokeWidth="2.4" strokeLinecap="round" />
      </g>
    </g>
  );
}

/* ---------------- Cover: a retro sunset over the Sahara dunes ---------------- */
export function SunsetCover() {
  const id = useId().replace(/:/g, "");
  return (
    <Frame bg={SKY} grain={0.1} vignette speed={{ blob: 2 }}>
      {MADRID_HAZE.map((h, i) => (
        <Blob key={i} sigma={90} spec={h} drift={{ dx: i ? "-14%" : "16%", dy: i ? "10%" : "-8%", ds: 1.1, dxDur: 15 + i * 4, dyDur: 19 - i * 3 }} />
      ))}
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${id}-sun`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe08a" />
            <stop offset="1" stopColor="#ff6a2b" />
          </linearGradient>
          <radialGradient id={`${id}-glow`}>
            <stop offset="0" stopColor="#ffb46b" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffb46b" stopOpacity="0" />
          </radialGradient>
          {/* The slats stay put; the sun slides behind them, so the stripes seem to travel over it. */}
          <mask id={`${id}-slats`} maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="1200">
            <rect width="900" height="1200" fill="#fff" />
            {MADRID_SLATS.map((l) => (
              <rect key={l.y} x="0" y={l.y} width="900" height={l.h} fill="#000" />
            ))}
          </mask>
        </defs>
        <g className={s.breathe} style={{ transformBox: "view-box", transformOrigin: "450px 690px" }}>
          <circle cx="450" cy="690" r="400" fill={`url(#${id}-glow)`} />
        </g>
        <g mask={`url(#${id}-slats)`}>
          <g className={s.sunset}>
            <circle cx="450" cy="690" r="230" fill={`url(#${id}-sun)`} />
          </g>
        </g>
        <Bird y={360} scale={1.2} delay={1.5} dur={20} />
        <Bird y={410} scale={0.9} delay={2.4} dur={23} />
        <Bird y={300} scale={0.7} delay={11} dur={26} />
        {MADRID_DUNES.map((d) => (
          <path key={d.color} d={d.d} fill={d.color} className={s.dunes} style={vars({ "--dur": `${d.dur}s` })} />
        ))}
      </svg>
    </Frame>
  );
}

/* ---------------- 2: the Madrid Half Marathon's hills, a runner climbing ---------------- */
export function HillsCover() {
  const id = useId().replace(/:/g, "");
  return (
    <Frame bg="linear-gradient(180deg, #ffc36b 0%, #ff6a2b 100%)" grain={0.08} speed={{ blob: 2 }}>
      <Blob sigma={110} wrap={s.breathe} spec={{ cx: 640, cy: 260, rx: 260, ry: 220, color: "#fff1c2", opacity: 0.7 }} drift={{ dx: "-8%", dy: "8%", dxDur: 14, dyDur: 18 }} />
      <Blob sigma={110} spec={{ cx: 200, cy: 520, rx: 220, ry: 200, color: "#ff4d6d", opacity: 0.35 }} drift={{ dx: "20%", dy: "-10%", dxDur: 17, dyDur: 13 }} />
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${id}-hill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9f1f17" />
            <stop offset="1" stopColor="#3d0b0a" />
          </linearGradient>
        </defs>
        <path d={MADRID_HILL_AREA} fill={`url(#${id}-hill)`} />
        <path d={MADRID_HILL_LINE} fill="none" stroke="#fff1e6" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
        {/* The runner: a glowing dot with a short trail, up every climb. */}
        <path d={MADRID_HILL_LINE} pathLength={1} className={s.runner} style={vars({ "--dur": "7s" })} fill="none" stroke="#ffc15e" strokeWidth="12" strokeLinecap="round" />
        <path d={MADRID_HILL_LINE} pathLength={1} className={s.dot} style={vars({ "--dur": "7s" })} fill="none" stroke="#fff1e6" strokeWidth="24" strokeLinecap="round" />
        <circle cx="70" cy="870" r="10" fill="#fff1e6" />
        <g className={s.pulse} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <circle cx="840" cy="460" r="14" fill="none" stroke="#fff1e6" strokeWidth="4" />
        </g>
      </svg>
    </Frame>
  );
}

/* ---------------- 3: the semester loading, 0 → 100 % ---------------- */
export function LoadedCover() {
  const id = useId().replace(/:/g, "");
  const { cx, cy, r, d } = MADRID_RING;
  const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";
  return (
    <Frame bg="#2a0c07" grain={0.09} vignette speed={{ blob: 2 }}>
      <Blob sigma={110} wrap={s.pulse} spec={{ cx: 450, cy: 560, rx: 300, ry: 300, color: "#ff6a2b", opacity: 0.45 }} drift={{ dx: "3%", dy: "-3%", dxDur: 9, dyDur: 11 }} />
      <Blob sigma={110} spec={{ cx: 250, cy: 1000, rx: 300, ry: 200, color: "#9f1f17", opacity: 0.7 }} drift={{ dx: "18%", dy: "-8%", dxDur: 16, dyDur: 12 }} />
      <svg {...svgProps}>
        <defs>
          <linearGradient id={`${id}-arc`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffc15e" />
            <stop offset="1" stopColor="#ff3d2e" />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#fff1e6" strokeOpacity="0.12" strokeWidth="18" />
        {/* Starts half full (like the still), fills to 100 % and loops. */}
        <path d={d} pathLength={100} fill="none" stroke={`url(#${id}-arc)`} strokeWidth="18" strokeLinecap="round" strokeDasharray="100" className={s.arc} />
        <g className={s.orbit} style={{ transformBox: "view-box", transformOrigin: `${cx}px ${cy}px` }}>
          <circle cx={cx} cy={cy - r} r="16" fill="#fff1e6" />
        </g>
        <text x="450" y="578" textAnchor="middle" fontFamily={mono} fontSize="44" letterSpacing="12" fill="#fff1e6">
          LOADED
        </text>
        <text x="450" y="930" textAnchor="middle" fontFamily={mono} fontSize="24" letterSpacing="6" fill="#f0b89a">
          EINDHOVEN → MADRID
        </text>
      </svg>
    </Frame>
  );
}

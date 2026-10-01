"use client";

import { useId } from "react";
import s from "./AdvantechSky.module.css";

/**
 * Advantech internship cover: a painted version of the building
 * (advantech-ground.webp, sky cut out) in front of a living sky, through a
 * day that loops forever: day → sunset → night → dawn → day. The sun arcs
 * across, soft clouds drift behind the buildings (screen-blended, so they
 * take on the colour of the hour), birds fly by in daylight, cloud shadows
 * slide over the facades, and at night the stars come out and the windows
 * light up.
 *
 * Laid out in the photo's own pixel coordinates (998 × 668), shared with the
 * script that rendered the stills (advantech-1.jpg, advantech-hero.jpg), so
 * the first frame (midday) matches them exactly.
 */

const VIEW = { portrait: "110 -497 880 1165", wide: "0 0 998 668" };
const TILE = 1400;

// Sky gradients from the top of the extended sky (y -479) to the horizon (y 330).
// Day uses the photo's own blue with the k^0.8 curve the stills were rendered with.
const SKIES = {
  day: ["#516899", "#6e87b4", "#849ec7", "#97b3d9", "#a9c6e9"],
  dawn: ["#4a5590", "#8c7fb0", "#d99aaa", "#f5bfa4", "#ffd9ad"],
  sunset: ["#2e2f6b", "#6b4a8a", "#c4648a", "#f08a6e", "#ffb862"],
  night: ["#060a1f", "#0b1330", "#131d45", "#1c2855", "#2a3767"],
};

const BIRDS = [
  { x: 0, y: 0, s: 1, d: 0 },
  { x: -34, y: 14, s: 0.85, d: 0.15 },
  { x: -22, y: -16, s: 0.8, d: 0.3 },
  { x: -60, y: 26, s: 0.7, d: 0.1 },
  { x: -70, y: -4, s: 0.75, d: 0.4 },
];

// Deterministic stars across the sky.
const STARS = Array.from({ length: 70 }, (_, i) => ({
  x: ((i * 137.5) % 1300) - 150,
  y: -490 + ((i * 89.3) % 760),
  r: 0.6 + ((i * 7) % 5) * 0.25,
  d: (i % 7) * 0.6,
}));

export function AdvantechSky({ variant }: { variant: "portrait" | "wide" }) {
  // Unique per copy: the slider renders desktop and mobile copies, and a reference
  // into a hidden (display: none) copy would not resolve.
  const id = useId().replace(/:/g, "");
  const u = (name: string) => `${name}-${id}`;
  return (
    <svg viewBox={VIEW[variant]} preserveAspectRatio="xMidYMid slice" className={s.root} aria-hidden="true">
      <defs>
        {Object.entries(SKIES).map(([name, stops]) => (
          <linearGradient key={name} id={u(`sky-${name}`)} x1="0" y1="-479" x2="0" y2="330" gradientUnits="userSpaceOnUse">
            {stops.map((c, i) => (
              <stop key={i} offset={i / (stops.length - 1)} stopColor={c} />
            ))}
          </linearGradient>
        ))}
        <radialGradient id={u("sun")}>
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="0.18" stopColor="#fff3d6" />
          <stop offset="0.22" stopColor="#ffe7b8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffd9a0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={u("moon")}>
          <stop offset="0" stopColor="#f4f1ff" />
          <stop offset="0.2" stopColor="#e9e6fb" />
          <stop offset="0.25" stopColor="#cfd6ff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#cfd6ff" stopOpacity="0" />
        </radialGradient>
        {/* Light and shade only fall on the buildings, not the sky. */}
        <mask id={u("ground")} style={{ maskType: "alpha" }}>
          <image href="/projects/advantech-ground.webp" width="998" height="668" />
        </mask>
        <radialGradient id={u("shadow")}>
          <stop offset="0" stopColor="#0a1428" stopOpacity="0.3" />
          <stop offset="1" stopColor="#0a1428" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* The sky through the day: each later gradient fades in over the one below. */}
      <rect x="-300" y="-600" width="1600" height="1400" fill={`url(#${u("sky-day")})`} />
      <rect className={s.dawn} x="-300" y="-600" width="1600" height="1400" fill={`url(#${u("sky-dawn")})`} />
      <rect className={s.sunset} x="-300" y="-600" width="1600" height="1400" fill={`url(#${u("sky-sunset")})`} />
      <rect className={s.night} x="-300" y="-600" width="1600" height="1400" fill={`url(#${u("sky-night")})`} />

      <g className={s.stars}>
        {STARS.map((st, i) => (
          <circle key={i} className={s.twinkle} cx={st.x} cy={st.y} r={st.r} fill="#e8ecff" style={{ animationDelay: `${-st.d}s` }} />
        ))}
      </g>
      <circle className={s.moon} r="70" fill={`url(#${u("moon")})`} />
      <circle className={s.sun} r="150" fill={`url(#${u("sun")})`} />

      {/* Soft clouds, screen-blended so they glow in the colour of the hour. Two tiles loop seamlessly. */}
      <g className={s.clouds}>
        <g className={s.drift} style={{ animationDuration: "220s" }}>
          <image href="/projects/advantech-clouds-far.webp" x="0" y="110" width={TILE} height="260" />
          <image href="/projects/advantech-clouds-far.webp" x={TILE} y="110" width={TILE} height="260" />
        </g>
        <g className={s.drift} style={{ animationDuration: "120s" }}>
          <image href="/projects/advantech-clouds-near.webp" x="0" y="-470" width={TILE} height="620" />
          <image href="/projects/advantech-clouds-near.webp" x={TILE} y="-470" width={TILE} height="620" />
        </g>
      </g>

      {/* Birds, in daylight only. */}
      <g className={s.daylight}>
        <g className={s.flock}>
          {BIRDS.map((b, i) => (
            <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
              <g className={s.bob} style={{ animationDelay: `${-b.d * 3}s` }}>
                <path className={s.wings} style={{ animationDelay: `${-b.d}s` }} d="M-9 0 Q-5 -5 0 0 Q5 -5 9 0" fill="none" stroke="#1d2433" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>
          ))}
        </g>
      </g>

      <image href="/projects/advantech-ground.webp" width="998" height="668" />

      {/* The light of the hour on the buildings: warm at dawn and sunset, deep blue at night. */}
      <rect className={s.grade} mask={`url(#${u("ground")})`} width="998" height="668" />
      <image className={s.windows} href="/projects/advantech-windows.webp" width="998" height="668" />

      {/* Cloud shadows passing over the buildings in daylight. */}
      <g className={s.daylight} mask={`url(#${u("ground")})`} style={{ mixBlendMode: "multiply" }}>
        <ellipse className={s.shadow} cx="0" cy="260" rx="260" ry="150" fill={`url(#${u("shadow")})`} style={{ animationDuration: "48s", animationDelay: "-30s" }} />
        <ellipse className={s.shadow} cx="0" cy="470" rx="320" ry="170" fill={`url(#${u("shadow")})`} style={{ animationDuration: "64s", animationDelay: "-8s" }} />
      </g>
    </svg>
  );
}

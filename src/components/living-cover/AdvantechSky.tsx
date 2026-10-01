"use client";

import { useId } from "react";
import s from "./AdvantechSky.module.css";

/**
 * Advantech internship cover: the building photo with its sky cut out
 * (advantech-ground.webp) in front of a living sky. Two layers of clouds
 * drift past at different speeds, behind the buildings; a small flock of
 * birds crosses now and then; cloud shadows slide over the facades.
 *
 * Everything is laid out in the photo's own pixel coordinates (998 × 668),
 * shared with the script that rendered the stills (advantech-1.jpg and
 * advantech-hero.jpg), so the first frame matches them exactly.
 * `portrait` shows nearly the whole photo with extra sky above it (3:4);
 * `wide` shows the photo as is.
 */

const VIEW = { portrait: "110 -497 880 1165", wide: "0 0 998 668" };
// Sky gradient (sampled from the photo's own blue), from the top of the
// extended sky down to the horizon.
// (k^0.8 easing, the same curve the stills were rendered with.)
const SKY_STOPS: [number, string][] = [[0, "#516899"], [0.25, "#6e87b4"], [0.5, "#849ec7"], [0.75, "#97b3d9"], [1, "#a9c6e9"]];
const TILE = 1400;

const BIRDS = [
  { x: 0, y: 0, s: 1, d: 0 },
  { x: -34, y: 14, s: 0.85, d: 0.15 },
  { x: -22, y: -16, s: 0.8, d: 0.3 },
  { x: -60, y: 26, s: 0.7, d: 0.1 },
  { x: -70, y: -4, s: 0.75, d: 0.4 },
];

export function AdvantechSky({ variant }: { variant: "portrait" | "wide" }) {
  // Unique per copy: the slider renders desktop and mobile copies, and a reference
  // into a hidden (display: none) copy would not resolve.
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox={VIEW[variant]} preserveAspectRatio="xMidYMid slice" className={s.root} aria-hidden="true">
      <defs>
        <linearGradient id={`adv-sky-${id}`} x1="0" y1="-479" x2="0" y2="330" gradientUnits="userSpaceOnUse">
          {SKY_STOPS.map(([o, c]) => (
            <stop key={o} offset={o} stopColor={c} />
          ))}
        </linearGradient>
        {/* Shadows and light only fall on the buildings, not the sky. */}
        <mask id={`adv-ground-${id}`} style={{ maskType: "alpha" }}>
          <image href="/projects/advantech-ground.webp" width="998" height="668" />
        </mask>
        <radialGradient id={`adv-shadow-${id}`}>
          <stop offset="0" stopColor="#0a1428" stopOpacity="0.38" />
          <stop offset="1" stopColor="#0a1428" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="-200" y="-600" width="1400" height="1400" fill={`url(#adv-sky-${id})`} />

      {/* Far clouds: small and flat near the horizon, slow. Two tiles side by side loop seamlessly. */}
      <g className={s.drift} style={{ animationDuration: "220s" }}>
        <image href="/projects/advantech-clouds-far.webp" x="0" y="110" width={TILE} height="260" />
        <image href="/projects/advantech-clouds-far.webp" x={TILE} y="110" width={TILE} height="260" />
      </g>
      {/* Near clouds: big, high, faster. */}
      <g className={s.drift} style={{ animationDuration: "120s" }}>
        <image href="/projects/advantech-clouds-near.webp" x="0" y="-470" width={TILE} height="620" />
        <image href="/projects/advantech-clouds-near.webp" x={TILE} y="-470" width={TILE} height="620" />
      </g>

      {/* A small flock crossing the sky every so often. */}
      <g className={s.flock}>
        {BIRDS.map((b, i) => (
          <g key={i} transform={`translate(${b.x} ${b.y}) scale(${b.s})`}>
            <g className={s.bob} style={{ animationDelay: `${-b.d * 3}s` }}>
              <path className={s.wings} style={{ animationDelay: `${-b.d}s` }} d="M-9 0 Q-5 -5 0 0 Q5 -5 9 0" fill="none" stroke="#1d2433" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        ))}
      </g>

      <image href="/projects/advantech-ground.webp" width="998" height="668" />

      {/* Cloud shadows passing over the buildings. */}
      <g mask={`url(#adv-ground-${id})`} style={{ mixBlendMode: "multiply" }}>
        <ellipse className={s.shadow} cx="0" cy="260" rx="260" ry="150" fill={`url(#adv-shadow-${id})`} style={{ animationDuration: "48s", animationDelay: "-30s" }} />
        <ellipse className={s.shadow} cx="0" cy="470" rx="320" ry="170" fill={`url(#adv-shadow-${id})`} style={{ animationDuration: "64s", animationDelay: "-8s" }} />
      </g>
    </svg>
  );
}

"use client";

import { Blob, Frame, svgProps, useSpeakingBars } from "./art";
import s from "./LivingCover.module.css";

/**
 * Living versions of each project's other grid images (public/projects/*-2.svg,
 * *-3.svg): same colours, shapes and composition as the stills, animated.
 */

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;
const vars = (v: Record<string, string | number>) => v as Vars;

/* ---------------- 01 Plovdiv · 2: the route being run ---------------- */
const ROUTE = "M 180 980 C 240 860, 150 760, 300 700 S 520 720, 560 600 S 440 420, 600 360 S 760 300, 700 200";

export function RouteCover() {
  return (
    <Frame bg="#efe9dd" grain={0.06} speed={{ blob: 2 }}>
      <Blob sigma={110} spec={{ cx: 700, cy: 250, rx: 300, ry: 260, color: "#f4c7a1", opacity: 0.8 }} drift={{ dx: "-10%", dy: "12%", dxDur: 17, dyDur: 21 }} />
      <Blob sigma={110} spec={{ cx: 150, cy: 1000, rx: 280, ry: 260, color: "#f1d8c4", opacity: 0.9 }} drift={{ dx: "14%", dy: "-10%", dxDur: 19, dyDur: 15 }} />
      <svg {...svgProps}>
        {/* The dotted course marches forward… */}
        <path d={ROUTE} className={s.march} fill="none" stroke="#c2410c" strokeWidth="5" strokeLinecap="round" strokeDasharray="1 16" />
        {/* …while a runner (a bright dot with a short trail) runs it from start to finish. */}
        <path d={ROUTE} pathLength={1} className={s.runner} style={vars({ "--dur": "6s" })} fill="none" stroke="#c2410c" strokeOpacity="0.35" strokeWidth="10" strokeLinecap="round" />
        <path d={ROUTE} pathLength={1} className={s.dot} style={vars({ "--dur": "6s" })} fill="none" stroke="#c2410c" strokeWidth="22" strokeLinecap="round" />
        <g className={s.pulse} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <circle cx="180" cy="980" r="12" fill="#c2410c" />
        </g>
        <g className={s.pulse} style={{ transformBox: "fill-box", transformOrigin: "center", animationDelay: "-1.3s" }}>
          <circle cx="700" cy="200" r="12" fill="none" stroke="#c2410c" strokeWidth="4" />
        </g>
      </svg>
    </Frame>
  );
}

/* ---------------- 01 Plovdiv · 3: embers glowing ---------------- */
export function EmberCover() {
  return (
    <Frame bg="#8e1b1b" grain={0.09} vignette speed={{ blob: 2.4 }}>
      <div className={`${s.fill} ${s.breathe}`}>
        <Blob sigma={100} spec={{ cx: 450, cy: 500, rx: 360, ry: 300, color: "#f06a4a", opacity: 0.9 }} drift={{ dx: "8%", dy: "10%", ds: 1.08, dxDur: 18, dyDur: 22 }} />
        <Blob sigma={100} spec={{ cx: 300, cy: 900, rx: 260, ry: 260, color: "#ffb199", opacity: 0.7 }} drift={{ dx: "30%", dy: "-22%", ds: 1.12, dxDur: 15, dyDur: 19 }} />
        <Blob sigma={100} spec={{ cx: 700, cy: 1000, rx: 220, ry: 240, color: "#4a0b16", opacity: 0.9 }} drift={{ dx: "-26%", dy: "-18%", ds: 0.92, dxDur: 20, dyDur: 16 }} />
      </div>
    </Frame>
  );
}

/* ---------------- 02 Marathon running · 2: night lanes with runners ---------------- */
const nightLane = (k: number) => `M ${-100 + k * 70} 1200 C ${200 + k * 60} ${700 - k * 20}, ${420 + k * 40} 520, 1000 ${260 + k * 70}`;

export function NightTracksCover() {
  return (
    <Frame bg="#1b2a22" grain={0.09} vignette speed={{ blob: 2 }}>
      <Blob sigma={90} spec={{ cx: 450, cy: 300, rx: 320, ry: 240, color: "#3f6b53", opacity: 0.9 }} drift={{ dx: "10%", dy: "8%", dxDur: 19, dyDur: 23 }} />
      <Blob sigma={90} spec={{ cx: 450, cy: 950, rx: 360, ry: 260, color: "#b6d94c", opacity: 0.55 }} drift={{ dx: "-9%", dy: "-8%", dxDur: 21, dyDur: 17 }} />
      <svg {...svgProps}>
        {Array.from({ length: 7 }, (_, k) => (
          <g key={k} className={s.sway} style={vars({ "--dur": `${8 + k * 0.8}s`, "--delay": `${-k * 1.1}s`, "--sx": `${6 + k}px`, "--sy": `${-8 - k * 2}px` })}>
            <path d={nightLane(k)} fill="none" stroke="#e7f0dc" strokeWidth="3" opacity="0.45" />
            <g style={vars({ "--dur": `${5 + ((k * 5) % 4)}s`, "--delay": `${-k * 1.9}s` })}>
              <path d={nightLane(k)} pathLength={1} className={s.runner} fill="none" stroke="#d4ff3a" strokeWidth="5" strokeLinecap="round" />
            </g>
          </g>
        ))}
      </svg>
    </Frame>
  );
}

/* ---------------- 03 AI Case Generator · 2: the grid thinking ---------------- */
const GRID = Array.from({ length: 13 }, (_, i) => i * 75);
// Cells near the glow that light up in turn: [column, row].
const CELLS = [
  [5, 7], [7, 6], [4, 9], [6, 8], [8, 9], [3, 6], [7, 10], [5, 5], [9, 7], [4, 11], [6, 6], [8, 5],
] as const;

export function GridCover() {
  return (
    <Frame bg="#0f1330" grain={0.09} vignette speed={{ blob: 2.2 }}>
      <Blob sigma={110} spec={{ cx: 450, cy: 600, rx: 330, ry: 330, color: "#3b4cff", opacity: 0.75 }} drift={{ dx: "6%", dy: "-6%", ds: 1.06, dxDur: 17, dyDur: 13 }} />
      <Blob sigma={110} wrap={s.pulse} spec={{ cx: 520, cy: 520, rx: 170, ry: 170, color: "#a78bfa", opacity: 0.9 }} drift={{ dx: "-16%", dy: "14%", ds: 1.1, dxDur: 13, dyDur: 16 }} />
      <svg {...svgProps}>
        {GRID.map((v) => (
          <line key={`v${v}`} x1={v} y1="0" x2={v} y2="1200" stroke="#c7d2fe" opacity="0.14" />
        ))}
        {Array.from({ length: 17 }, (_, i) => i * 75).map((v) => (
          <line key={`h${v}`} x1="0" y1={v} x2="900" y2={v} stroke="#c7d2fe" opacity="0.14" />
        ))}
        {CELLS.map(([c, r], i) => (
          <rect key={i} x={c * 75 + 1} y={r * 75 + 1} width="73" height="73" fill="#c7d2fe" className={s.cell} style={vars({ "--delay": `${i * 0.55}s` })} />
        ))}
        {/* A soft scan line sweeping down the grid. */}
        <defs>
          <linearGradient id="lc-scan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c7d2fe" stopOpacity="0" />
            <stop offset="0.5" stopColor="#c7d2fe" stopOpacity="0.16" />
            <stop offset="1" stopColor="#c7d2fe" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="0" y="-160" width="900" height="160" fill="url(#lc-scan)" className={s.scan} />
      </svg>
    </Frame>
  );
}

/* ---------------- 03 AI Case Generator · 3: one case card writing itself ---------------- */
const CARD_LINES = [330, 330, 200, 330, 330, 200, 330];
const WRITE_CYCLE = 9;
const writeKeyframes = CARD_LINES.map((_, j) => {
  const start = (0.4 + j * 0.5) / WRITE_CYCLE;
  const end = start + 0.4 / WRITE_CYCLE;
  const p = (x: number) => `${(x * 100).toFixed(2)}%`;
  return `@keyframes lc-write-${j} {
    0%, ${p(start)} { transform: scaleX(0); opacity: 1; }
    ${p(end)}, 86% { transform: scaleX(1); opacity: 1; }
    93% { transform: scaleX(1); opacity: 0; }
    94%, 100% { transform: scaleX(0); opacity: 0; }
  }`;
}).join("\n");

export function CardCover() {
  return (
    <Frame bg="#0f1330" grain={0.09} vignette speed={{ blob: 2.2, loop: 1.2 }}>
      <style>{writeKeyframes}</style>
      <Blob sigma={110} spec={{ cx: 300, cy: 380, rx: 280, ry: 260, color: "#22d3ee", opacity: 0.45 }} drift={{ dx: "14%", dy: "10%", dxDur: 16, dyDur: 20 }} />
      <Blob sigma={110} spec={{ cx: 620, cy: 820, rx: 320, ry: 300, color: "#8b5cf6", opacity: 0.7 }} drift={{ dx: "-12%", dy: "-10%", dxDur: 18, dyDur: 14 }} />
      <Blob sigma={110} spec={{ cx: 450, cy: 600, rx: 200, ry: 200, color: "#3b4cff", opacity: 0.6 }} drift={{ dx: "-8%", dy: "8%", ds: 1.1, dxDur: 13, dyDur: 17 }} />
      <svg {...svgProps}>
        <g className={s.float} style={vars({ "--dur": "7s", "--fy": "-16px", "--fr": "-1.5deg" })}>
          <g transform="translate(450 600) scale(1.35) rotate(4) translate(-210 -270)">
            <rect width="420" height="540" rx="28" fill="#1b1f5a" fillOpacity="0.92" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.5" />
            <circle cx="64" cy="70" r="26" fill="#ffffff" fillOpacity="0.55" />
            <rect x="104" y="58" width="150" height="10" rx="5" fill="#ffffff" fillOpacity="0.7" />
            <rect x="104" y="78" width="96" height="8" rx="4" fill="#ffffff" fillOpacity="0.4" />
            {CARD_LINES.map((w, j) => (
              <rect
                key={j}
                x="40"
                y={150 + j * 40}
                width={w}
                height="10"
                rx="5"
                fill="#ffffff"
                fillOpacity="0.5"
                className={s.typeLine}
                // Start mid-hold so the first frame shows the card fully written, like the still.
                style={{ animation: `lc-write-${j} calc(${WRITE_CYCLE}s / var(--speed, 1)) linear calc(-6s / var(--speed, 1)) infinite` }}
              />
            ))}
            <g className={s.pulse} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
              <rect x="40" y="440" width="120" height="44" rx="22" fill="#a5b4fc" fillOpacity="0.9" />
            </g>
          </g>
        </g>
      </svg>
    </Frame>
  );
}

/* ---------------- 04 Dating App · 2: a voice note on pink ---------------- */
const WAVE = [30, 193.1, 259.6, 203.1, 82.8, 67.3, 73, 40, 73.7, 32.1, 143.8, 240.4, 236.2, 112, 125, 247.9, 248.6, 145.6, 34.7, 88.4, 58.9, 55.8, 56.8, 84.2, 196.8, 248.5, 180.1, 43.1, 205.1];

export function WaveCover({ running }: { running: boolean }) {
  const { bars, glow } = useSpeakingBars(running);
  return (
    <Frame bg="#f4dfe2" grain={0.09} speed={{ blob: 2.2 }}>
      <div ref={glow} className={s.fill} style={{ willChange: "transform, filter" }}>
        <Blob sigma={120} spec={{ cx: 450, cy: 450, rx: 320, ry: 320, color: "#ff7aa2", opacity: 0.55 }} drift={{ dx: "6%", dy: "5%", dxDur: 14, dyDur: 18 }} />
        <Blob sigma={120} spec={{ cx: 600, cy: 950, rx: 260, ry: 220, color: "#ffc2a8", opacity: 0.8 }} drift={{ dx: "-8%", dy: "-6%", dxDur: 16, dyDur: 12 }} />
      </div>
      <svg {...svgProps}>
        {WAVE.map((h, i) => (
          <rect
            key={i}
            ref={(el) => {
              bars.current[i] = el;
            }}
            className={s.bar}
            x={150 + i * 21}
            y={600 - h / 2}
            width="8"
            height={h}
            rx="4"
            fill="#4a1633"
          />
        ))}
      </svg>
    </Frame>
  );
}

/* ---------------- 05 Corsa · 2: a track playing ---------------- */
// The knob starts where the still has it (x 370.8 on the 120–780 track) and plays to the end, then loops.
const TRACK_START = 120;
const TRACK_W = 660;
const PLAY_S = 14;
const PLAY_AT = -((370.8 - TRACK_START) / TRACK_W) * PLAY_S;

export function PlaybackCover() {
  const play = vars({ "--dur": `${PLAY_S}s`, "--delay": `${PLAY_AT}s`, "--travel": `${TRACK_W}px` });
  return (
    <Frame bg="#2a2e33" grain={0.1} speed={{ blob: 2 }}>
      <Blob sigma={120} spec={{ cx: 200, cy: 200, rx: 350, ry: 300, color: "#5b6570", opacity: 0.9 }} drift={{ dx: "10%", dy: "8%", dxDur: 18, dyDur: 22 }} />
      <Blob sigma={120} spec={{ cx: 700, cy: 1000, rx: 330, ry: 300, color: "#0f766e", opacity: 0.6 }} drift={{ dx: "-10%", dy: "-10%", ds: 1.1, dxDur: 15, dyDur: 19 }} />
      <Blob sigma={120} wrap={s.crossfade} spec={{ cx: 650, cy: 350, rx: 160, ry: 200, color: "#d6dde3", opacity: 0.35 }} drift={{ dx: "-18%", dy: "20%", dxDur: 17, dyDur: 13 }} />
      <svg {...svgProps}>
        <rect x={TRACK_START} y="760" width={TRACK_W} height="3" fill="#e2e8f0" opacity="0.5" />
        <rect x={TRACK_START} y="760" width={TRACK_W} height="3" fill="#e2e8f0" className={s.progress} style={play} />
        <g className={s.knob} style={play}>
          <circle cx={TRACK_START} cy="761" r="10" fill="#e2e8f0" />
        </g>
      </svg>
    </Frame>
  );
}

/* ---------------- 05 Corsa · 3: sound rings travelling out ---------------- */
export function RingsCover() {
  return (
    <Frame bg="#101316" grain={0.09} vignette speed={{ blob: 2, loop: 1.2 }}>
      <Blob sigma={80} wrap={s.breathe} spec={{ cx: 450, cy: 1100, rx: 520, ry: 200, color: "#115e59", opacity: 0.9 }} drift={{ dx: "4%", dy: "-6%", ds: 1.08, dxDur: 13, dyDur: 11 }} />
      <Blob sigma={80} spec={{ cx: 450, cy: 250, rx: 240, ry: 140, color: "#334155", opacity: 0.9 }} drift={{ dx: "-8%", dy: "10%", dxDur: 17, dyDur: 15 }} />
      <svg {...svgProps}>
        {/* 5 rings on a 10 s loop: at t = 0 they sit at the still's radii (40, 100 … 280). */}
        {Array.from({ length: 5 }, (_, k) => (
          <circle
            key={k}
            className={s.wave}
            style={vars({ "--delay": `${-(k / 5) * 10}s` })}
            cx="450"
            cy="560"
            r="40"
            fill="none"
            stroke="#94a3b8"
            strokeWidth={k === 0 ? 2 : 1.2}
          />
        ))}
      </svg>
    </Frame>
  );
}

/* ---------------- 06 Bloom · 2: a small flower turning at dusk ---------------- */
export function DuskBloomCover() {
  return (
    <Frame bg="#16241a" grain={0.09} vignette speed={{ blob: 2 }}>
      <Blob sigma={110} spec={{ cx: 250, cy: 400, rx: 220, ry: 260, color: "#ec4899", opacity: 0.55 }} drift={{ dx: "16%", dy: "10%", dxDur: 17, dyDur: 21 }} />
      <Blob sigma={110} spec={{ cx: 650, cy: 700, rx: 240, ry: 260, color: "#f59e0b", opacity: 0.45 }} drift={{ dx: "-14%", dy: "-8%", dxDur: 19, dyDur: 15 }} />
      <Blob sigma={110} spec={{ cx: 400, cy: 1000, rx: 300, ry: 200, color: "#4d7c0f", opacity: 0.8 }} drift={{ dx: "8%", dy: "-6%", dxDur: 21, dyDur: 17 }} />
      <svg {...svgProps}>
        <g className={s.swell} style={{ transformBox: "view-box", transformOrigin: "450px 600px" }}>
          <g className={s.spin12} style={{ transformBox: "view-box", transformOrigin: "450px 600px" }} opacity="0.8">
            {Array.from({ length: 12 }, (_, i) => (
              <ellipse key={i} cx="450" cy="525" rx="37.5" ry="75" fill="#fbcfe8" opacity="0.55" transform={`rotate(${i * 30} 450 600)`} />
            ))}
          </g>
        </g>
      </svg>
    </Frame>
  );
}

"use client";

import { useEffect, useId, useRef } from "react";
import { blobStyle, GRAIN, H, VIGNETTE, W, type BlobSpec } from "./blob";
import s from "./LivingCover.module.css";

/**
 * Code-drawn copies of the placeholder covers (see scripts that generated
 * public/projects/*-1.svg): same colors, shapes and composition, animated.
 */

type Drift = { dx?: string; dy?: string; ds?: number; dxDur?: number; dyDur?: number; delay?: number };

/**
 * One soft blob. The outer layer drifts on x, the inner on y (plus a little
 * scale). `wrap` adds an effect layer around it (crossfade, pulse) without
 * overriding the drift.
 */
function Blob({ spec, sigma, drift = {}, wrap }: { spec: BlobSpec; sigma: number; drift?: Drift; wrap?: string }) {
  const { background, ...box } = blobStyle(spec, sigma);
  const vars = {
    "--dx": drift.dx ?? "6%",
    "--dy": drift.dy ?? "6%",
    "--ds": drift.ds ?? 1.05,
    "--dx-dur": `${drift.dxDur ?? 19}s`,
    "--dy-dur": `${drift.dyDur ?? 23}s`,
    "--delay": `${drift.delay ?? 0}s`,
  } as React.CSSProperties;
  const blob = (
    <div className={s.blob} style={{ ...box, ...vars }}>
      <div className={s.blobInner} style={{ background }} />
    </div>
  );
  if (!wrap) return blob;
  // Effects scale around the blob's own centre.
  const origin = `${(spec.cx / W) * 100}% ${(spec.cy / H) * 100}%`;
  return (
    <div className={`${s.fill} ${wrap}`} style={{ transformOrigin: origin }}>
      {blob}
    </div>
  );
}

function Frame({ bg, grain, vignette, children }: { bg: string; grain: number; vignette?: boolean; children: React.ReactNode }) {
  return (
    <>
      <div className={s.fill} style={{ background: bg }} />
      {children}
      {vignette && <div className={s.fill} style={{ background: VIGNETTE }} />}
      <div className={s.fill} style={{ backgroundImage: GRAIN, backgroundSize: "100% 100%", opacity: grain, mixBlendMode: "overlay" }} />
    </>
  );
}

const svgProps = { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "xMidYMid slice", className: s.svg, "aria-hidden": true } as const;

/* ---------------- 01 Plovdiv Marathon: lava glow that breathes ---------------- */
export function LavaCover() {
  return (
    <Frame bg="#0b0b0b" grain={0.09} vignette>
      <div className={`${s.fill} ${s.breathe}`}>
        <Blob sigma={80} spec={{ cx: 450, cy: 700, rx: 280, ry: 320, color: "#ff6a1a" }} drift={{ dx: "7%", dy: "-6%", dxDur: 21, dyDur: 17 }} />
        <Blob sigma={80} spec={{ cx: 360, cy: 620, rx: 170, ry: 200, color: "#ffb36b", opacity: 0.9 }} drift={{ dx: "22%", dy: "16%", ds: 1.12, dxDur: 16, dyDur: 23 }} />
        <Blob sigma={80} spec={{ cx: 560, cy: 760, rx: 200, ry: 220, color: "#d9264a", opacity: 0.85 }} drift={{ dx: "-24%", dy: "-14%", ds: 0.92, dxDur: 18, dyDur: 14 }} />
        <Blob sigma={80} spec={{ cx: 620, cy: 330, rx: 120, ry: 90, color: "#ffd9a8", opacity: 0.5 }} drift={{ dx: "-40%", dy: "60%", ds: 1.2, dxDur: 24, dyDur: 19 }} />
      </div>
    </Frame>
  );
}

/* ---------------- 02 Marathon running: drifting haze, flowing lanes, runners ---------------- */
const lane = (i: number) => `M ${-100 + i * 70} ${H} C ${200 + i * 60} ${700 - i * 20}, ${420 + i * 40} 520, ${W + 100} ${260 + i * 70}`;

export function TracksCover() {
  const lanes = Array.from({ length: 6 }, (_, i) => i);
  return (
    <Frame bg="#dfe0da" grain={0.07}>
      <Blob sigma={100} spec={{ cx: 300, cy: 380, rx: 280, ry: 300, color: "#c8f25a", opacity: 0.85 }} drift={{ dx: "12%", dy: "10%", dxDur: 20, dyDur: 26 }} />
      <Blob sigma={100} spec={{ cx: 620, cy: 820, rx: 300, ry: 330, color: "#8fb3a1", opacity: 0.9 }} drift={{ dx: "-10%", dy: "-9%", dxDur: 23, dyDur: 18 }} />
      <svg {...svgProps}>
        {lanes.map((i) => (
          <g key={i} className={s.sway} style={{ "--dur": `${8 + i * 0.9}s`, "--delay": `${-i * 1.3}s`, "--sx": `${8 + i}px`, "--sy": `${-10 - i * 2}px` } as React.CSSProperties}>
            <path d={lane(i)} fill="none" stroke="#1f3b2d" strokeWidth="3" opacity="0.35" />
            {/* A runner: a bright dash travelling from bottom-left to top-right. */}
            <g style={{ "--dur": `${6 + ((i * 7) % 5)}s`, "--delay": `${-i * 1.7}s` } as React.CSSProperties}>
              <path d={lane(i)} pathLength={1} className={s.runner} fill="none" stroke="#1f3b2d" strokeOpacity="0.45" strokeWidth="7" strokeLinecap="round" />
              <path d={lane(i)} pathLength={1} className={s.runner} fill="none" stroke="#fbffe9" strokeWidth="4" strokeLinecap="round" />
            </g>
          </g>
        ))}
      </svg>
    </Frame>
  );
}

/* ---------------- 03 AI Case Generator: floating papers, the top page types itself ---------------- */
const TYPE_CYCLE = 9; // seconds
const LINE_W = (j: number) => (j % 3 === 2 ? 180 : 300);

// One keyframe per line: type in turn, hold, clear together, repeat.
const typingKeyframes = Array.from({ length: 9 }, (_, j) => {
  const start = (0.4 + j * 0.5) / TYPE_CYCLE;
  const end = start + 0.42 / TYPE_CYCLE;
  const p = (x: number) => `${(x * 100).toFixed(2)}%`;
  return `@keyframes lc-type-${j} {
    0%, ${p(start)} { transform: scaleX(0); opacity: 0.35; }
    ${p(end)}, 86% { transform: scaleX(1); opacity: 0.35; }
    93% { transform: scaleX(1); opacity: 0; }
    94%, 100% { transform: scaleX(0); opacity: 0; }
  }`;
}).join("\n");

export function TypingCover() {
  return (
    <Frame bg="#ecebe6" grain={0.05}>
      <style>{typingKeyframes}</style>
      <Blob sigma={120} spec={{ cx: 600, cy: 350, rx: 280, ry: 300, color: "#9aa9ff", opacity: 0.8 }} drift={{ dx: "-6%", dy: "7%", dxDur: 17, dyDur: 21 }} />
      {/* The glow slowly shifts blue ↔ purple: violet twins crossfade over the originals. */}
      <Blob sigma={120} wrap={s.crossfade} spec={{ cx: 600, cy: 350, rx: 280, ry: 300, color: "#b69cff", opacity: 0.8 }} drift={{ dx: "-6%", dy: "7%", dxDur: 17, dyDur: 21 }} />
      <Blob sigma={120} spec={{ cx: 300, cy: 900, rx: 300, ry: 260, color: "#c6b8ff", opacity: 0.7 }} drift={{ dx: "6%", dy: "-6%", dxDur: 19, dyDur: 15 }} />
      <Blob sigma={120} wrap={s.crossfade} spec={{ cx: 300, cy: 900, rx: 300, ry: 260, color: "#a9b8ff", opacity: 0.7 }} drift={{ dx: "6%", dy: "-6%", dxDur: 19, dyDur: 15 }} />
      <svg {...svgProps}>
        {[0, 1, 2].map((i) => (
          <g key={i} className={s.float} style={{ "--dur": `${6.5 + i * 1.1}s`, "--delay": `${-i * 2.2}s`, "--fy": `${-10 - i * 3}px`, "--fr": `${i % 2 ? -1.2 : 1}deg` } as React.CSSProperties}>
            <g transform={`translate(${230 + i * 36} ${300 + i * 60}) rotate(${-8 + i * 6})`}>
              <rect width="380" height="500" fill="#fbfbf8" stroke="#1c1c28" strokeWidth="1.5" />
              {Array.from({ length: 9 }, (_, j) => (
                <rect
                  key={j}
                  x="36"
                  y={60 + j * 44}
                  width={LINE_W(j)}
                  height="8"
                  fill="#1c1c28"
                  opacity="0.35"
                  className={i === 2 ? s.typeLine : undefined}
                  // Start mid-hold so the first frame shows the page fully written, like the still.
                  style={i === 2 ? { animation: `lc-type-${j} ${TYPE_CYCLE}s linear -6s infinite` } : undefined}
                />
              ))}
            </g>
          </g>
        ))}
      </svg>
    </Frame>
  );
}

/* ---------------- 04 Dating App: a voice note playing ---------------- */
const BARS = Array.from({ length: 29 }, (_, i) => {
  const h = 30 + Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.23)) * 260;
  return { x: 150 + i * 21, h };
});

export function VoiceCover({ running }: { running: boolean }) {
  const bars = useRef<(SVGRectElement | null)[]>([]);
  const glow = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      const t = (now - t0) / 1000;
      const ease = Math.min(1, t / 1.5); // grow out of the still pose
      // Speech-like loudness: syllables (fast) inside phrases (slow), with short pauses.
      const phrase = 0.5 + 0.5 * Math.sin(t * 0.9) * Math.sin(t * 0.37 + 1);
      const syllable = 0.55 + 0.45 * Math.abs(Math.sin(t * 4.3 + Math.sin(t * 1.7)));
      const level = Math.max(0.15, phrase * syllable);
      bars.current.forEach((el, i) => {
        if (!el) return;
        const wave = 0.55 + 0.45 * Math.sin(t * 5.1 + i * 0.75 + Math.sin(t * 1.3 + i * 0.4) * 1.6);
        const target = 0.3 + 1.05 * level * wave;
        el.style.transform = `scaleY(${(1 + (target - 1) * ease).toFixed(3)})`;
      });
      if (glow.current) {
        glow.current.style.filter = `brightness(${(1 + 0.3 * ease * (level - 0.45)).toFixed(3)})`;
        glow.current.style.transform = `scale(${(1 + 0.04 * ease * level).toFixed(4)})`;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  return (
    <Frame bg="#2a0f24" grain={0.09} vignette>
      <div ref={glow} className={s.fill} style={{ willChange: "transform, filter" }}>
        <Blob sigma={100} spec={{ cx: 330, cy: 520, rx: 250, ry: 280, color: "#ff5c8a", opacity: 0.9 }} drift={{ dx: "5%", dy: "4%", dxDur: 13, dyDur: 17 }} />
        <Blob sigma={100} spec={{ cx: 570, cy: 640, rx: 240, ry: 270, color: "#ff9a62", opacity: 0.85 }} drift={{ dx: "-5%", dy: "-4%", dxDur: 15, dyDur: 12 }} />
      </div>
      <svg {...svgProps}>
        {BARS.map((b, i) => (
          <rect
            key={i}
            ref={(el) => {
              bars.current[i] = el;
            }}
            className={s.bar}
            x={b.x}
            y={1000 - b.h / 2}
            width="8"
            height={b.h}
            rx="4"
            fill="#ffd6e2"
          />
        ))}
      </svg>
    </Frame>
  );
}

/* ---------------- 05 Corsa Car Audio: speaker pulse, rings rippling out ---------------- */
export function RippleCover() {
  return (
    <Frame bg="#070808" grain={0.1} vignette>
      <Blob sigma={90} spec={{ cx: 450, cy: 620, rx: 260, ry: 260, color: "#14b8a6", opacity: 0.6 }} drift={{ dx: "3%", dy: "-3%", ds: 1.08, dxDur: 11, dyDur: 9 }} />
      <Blob sigma={90} wrap={s.pulse} spec={{ cx: 450, cy: 620, rx: 110, ry: 110, color: "#99f6e4", opacity: 0.7 }} drift={{ dx: "2%", dy: "-2%", ds: 1.02, dxDur: 7, dyDur: 9 }} />
      <svg {...svgProps}>
        {/* 8 rings on a 12s loop, one every 1.5s: at t=0 they sit at the still cover's radii (40…320). */}
        {Array.from({ length: 8 }, (_, k) => (
          <circle
            key={k}
            className={s.ring}
            // Offset by 2% of the loop so the innermost ring is already visible on the first frame.
            style={{ "--delay": `${-(k / 8) * 12 - 0.24}s` } as React.CSSProperties}
            cx="450"
            cy="620"
            r="40"
            fill="none"
            stroke="#ccfbf1"
            strokeWidth="1.2"
          />
        ))}
      </svg>
    </Frame>
  );
}

/* ---------------- 06 Bloom: a flower slowly turning and breathing open ---------------- */
export function BloomCover() {
  // Unique per instance: the slider renders desktop and mobile copies, and a filter
  // referenced from a hidden (display: none) copy would not apply.
  const blurId = `lc-bloom-${useId().replace(/:/g, "")}`;
  return (
    <Frame bg="#eef0e3" grain={0.06}>
      {/* The amber centre sits under the petals, as in the still. */}
      <Blob sigma={60} wrap={s.pulse} spec={{ cx: 450, cy: 580, rx: 70, ry: 70, color: "#f59e0b", opacity: 0.9 }} drift={{ dx: "3%", dy: "-3%", ds: 1.04, dxDur: 9, dyDur: 11 }} />
      <div className={`${s.fill} ${s.open}`}>
        <div className={`${s.fill} ${s.spin}`}>
          <svg {...svgProps}>
            <defs>
              <filter id={blurId} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="60" />
              </filter>
            </defs>
            <g filter={`url(#${blurId})`} opacity="0.9">
              {Array.from({ length: 8 }, (_, i) => (
                <ellipse key={i} cx="450" cy={580 - 125} rx="62.5" ry="125" fill="#f472b6" opacity="0.55" transform={`rotate(${45 * i} 450 580)`} />
              ))}
            </g>
          </svg>
        </div>
      </div>
    </Frame>
  );
}

/* ---------------- Any image: slow zoom and pan ---------------- */
export function DriftCover({ src }: { src: string }) {
  return <div className={s.kenburns} style={{ backgroundImage: `url("${src}")` }} />;
}

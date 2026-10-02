"use client";

import { useRef, useSyncExternalStore } from "react";
import { gsap } from "gsap";
import type { Project, Signature } from "@/data/projects";
import { useScene } from "@/lib/use-scene";
import { SectionLabel } from "../bits";

type Data = Extract<Signature, { type: "bloom-garden" }>;

const W = 1200;
const GROUND = 660;

// Deterministic "random" so server and client draw the same garden.
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The app's flower colours.
const PALETTE = ["#f472b6", "#5eead4", "#c084fc", "#7dd3fc", "#fde047", "#86efac"];

// Stars over the garden.
const STARS = (() => {
  const r = rng(3);
  return Array.from({ length: 40 }, () => ({ x: r() * W, y: r() * 560, r: 0.8 + r() * 1.4, d: r() * 4 }));
})();

const FLOWERS = (() => {
  const r = rng(7);
  return Array.from({ length: 15 }, (_, i) => {
    const x = 60 + (i / 14) * (W - 120) + (r() - 0.5) * 40;
    const h = 170 + r() * 250;
    const top = GROUND - h;
    const bend = (r() - 0.5) * 90;
    const size = 26 + r() * 28;
    return {
      x,
      top,
      bend,
      size,
      petals: 5 + Math.floor(r() * 4),
      color: PALETTE[i % PALETTE.length],
      stem: `M${x} ${GROUND} Q${x + bend} ${GROUND - h * 0.55} ${x + bend * 0.3} ${top}`,
      leaf: { x: x + bend * 0.45, y: GROUND - h * 0.35, flip: r() > 0.5 },
      headX: x + bend * 0.3,
      delay: r() * 0.25,
    };
  });
})();

// Which flowers carry a visitor's note.
const NOTE_AT = [1, 4, 6, 9, 11, 13];

const narrowQuery = "(max-width: 767px)";
const subscribeNarrow = (cb: () => void) => {
  const mq = window.matchMedia(narrowQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function BloomGarden({ data }: { project: Project; data: Data }) {
  const root = useRef<HTMLElement>(null);
  // Phones: crop to the middle of the garden instead of shrinking all of it.
  const narrow = useSyncExternalStore(subscribeNarrow, () => window.matchMedia(narrowQuery).matches, () => false);
  const pinned = useRef<HTMLDivElement>(null);

  useScene(root, ({ reduced, mobile }) => {
    if (reduced) return;
    const q = gsap.utils.selector(root);
    const stems = q("[data-stem]") as unknown as SVGPathElement[];
    const heads = q("[data-head]");
    const leaves = q("[data-leaf]");
    const notes = q("[data-note]");
    const count = q("[data-count]")[0];

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: pinned.current, start: "top top", end: mobile ? "+=160%" : "+=230%", pin: true, scrub: 0.8 },
    });

    stems.forEach((stem, i) => {
      const len = stem.getTotalLength();
      const at = (i / stems.length) * 0.55 + FLOWERS[i].delay * 0.3;
      gsap.set(stem, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(stem, { strokeDashoffset: 0, duration: 0.3 }, at)
        .from(leaves[i], { scale: 0, duration: 0.12, ease: "back.out(2)" }, at + 0.12)
        .from(heads[i], { scale: 0, rotation: -120, duration: 0.2, ease: "back.out(1.8)" }, at + 0.26);
    });
    notes.forEach((n, i) => tl.from(n, { autoAlpha: 0, y: 20, duration: 0.12 }, 0.35 + i * 0.08));
    const counter = { v: 0 };
    tl.to(counter, { v: data.total, duration: 0.9, onUpdate: () => (count.textContent = String(Math.round(counter.v))) }, 0);

    return () => {
      count.textContent = String(data.total);
    };
  });

  return (
    <section ref={root} aria-labelledby="bloom-title">
      <div ref={pinned} className="relative flex h-dvh flex-col overflow-hidden px-4 pt-28 md:px-10 md:pt-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionLabel index="02">
              The garden
            </SectionLabel>
            <h2 id="bloom-title" className="font-display mt-4 text-[clamp(2.25rem,5vw,5rem)] leading-[0.95] tracking-[-0.02em]">
              Every thought <em>becomes a flower</em>
            </h2>
          </div>
          <p className="text-right">
            <span data-count className="font-display block text-[clamp(3rem,7vw,6.5rem)] leading-none tabular-nums text-[var(--p-accent)]">
              {data.total}
            </span>
            <span className="font-mono text-xs tracking-widest text-[var(--p-muted)] uppercase">thoughts planted today</span>
          </p>
        </div>

        <svg viewBox={`0 0 ${W} 700`} preserveAspectRatio={narrow ? "xMidYMax slice" : "xMidYMax meet"} className="mt-4 min-h-0 w-full flex-1" role="img" aria-label="A garden of flowers growing, each one a visitor's feedback">
          <defs>
            <radialGradient id="bloom-ground">
              <stop offset="0" stopColor="#7c3aed" stopOpacity="0.45" />
              <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
            </radialGradient>
          </defs>
          {STARS.map((st, i) => (
            <circle key={i} cx={st.x} cy={st.y} r={st.r} fill="#c7c9ff" className="bloom-twinkle" style={{ animationDelay: `${-st.d}s` }} />
          ))}
          {/* Violet light on the ground, like the garden wall in the concept videos. */}
          <ellipse cx={W / 2} cy={GROUND} rx={W * 0.55} ry="60" fill="url(#bloom-ground)" />
          <line x1="0" x2={W} y1={GROUND} y2={GROUND} stroke="var(--p-fg)" strokeOpacity="0.12" />
          {FLOWERS.map((f, i) => (
            <g key={i} className="bloom-sway" style={{ transformOrigin: `${f.x}px ${GROUND}px`, animationDelay: `${-i * 0.7}s` }}>
              <path data-stem d={f.stem} fill="none" stroke="#2f7d4a" strokeWidth="3" strokeLinecap="round" />
              <path
                data-leaf
                d={`M0 0 C ${f.leaf.flip ? -30 : 30} -8, ${f.leaf.flip ? -40 : 40} -28, ${f.leaf.flip ? -52 : 52} -30 C ${f.leaf.flip ? -36 : 36} -6, ${f.leaf.flip ? -18 : 18} 2, 0 0 Z`}
                transform={`translate(${f.leaf.x} ${f.leaf.y})`}
                fill="#2f7d4a"
                style={{ transformBox: "fill-box", transformOrigin: f.leaf.flip ? "right bottom" : "left bottom" }}
              />
              <g transform={`translate(${f.headX} ${f.top})`}>
                <g data-head style={{ filter: `drop-shadow(0 0 ${f.size * 0.5}px ${f.color})` }}>
                  {Array.from({ length: f.petals }, (_, p) => (
                    <ellipse
                      key={p}
                      cx="0"
                      cy={-f.size * 0.55}
                      rx={f.size * 0.32}
                      ry={f.size * 0.6}
                      fill={f.color}
                      fillOpacity="0.85"
                      transform={`rotate(${(360 / f.petals) * p})`}
                    />
                  ))}
                  <circle r={f.size * 0.28} fill="#fbbf24" />
                </g>
              </g>
            </g>
          ))}
          {/* Visitor notes sit in three staggered rows above the garden, tied to their flower. */}
          {NOTE_AT.map((fi, i) => {
            const f = FLOWERS[fi];
            const y = 50 + (i % 3) * 44;
            const x = Math.min(W - 150, Math.max(150, f.headX));
            return data.notes[i] ? (
              <g key={fi} data-note>
                <line x1={f.headX} x2={f.headX} y1={y + 10} y2={f.top - f.size} stroke="var(--p-fg)" strokeOpacity="0.25" strokeDasharray="2 4" />
                <text x={x} y={y} textAnchor="middle" fontSize="21" fontStyle="italic" fill="var(--p-fg)" fontFamily="var(--p-display)">
                  {data.notes[i]}
                </text>
              </g>
            ) : null;
          })}
        </svg>
      </div>
    </section>
  );
}

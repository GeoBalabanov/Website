"use client";

import { useEffect, useRef, useState } from "react";
import { GARMENTS, type Measurements } from "@/app/fit-finder/_lib/garments";
import { jacketGeometry } from "@/app/fit-finder/_components/Jacket";

/** The brands the tape visits, in an order that swings between narrow and wide. */
const ORDER = ["carhartt-work", "levis-trucker", "tnf-puffer", "uniqlo-padded", "stussy-work", "arket-chore"];
const STOPS = ORDER.map((id) => GARMENTS.find((g) => g.id === id)!);
const HOLD = 1.6;
const MOVE = 1.1;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (a: Measurements, b: Measurements, t: number): Measurements => ({
  chest: lerp(a.chest, b.chest, t),
  shoulder: lerp(a.shoulder, b.shoulder, t),
  length: lerp(a.length, b.length, t),
  sleeve: lerp(a.sleeve, b.sleeve, t),
});

/**
 * Fit Finder's hero: a jacket drawn in blue with a tailor's tape across the chest.
 * Every few seconds it becomes another brand's size M: the tape's marker slides to
 * the new chest width and the readout counts to it.
 */
export function TapeMeasure({ paused, wide }: { paused: boolean; wide: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [t, setT] = useState(0);

  useEffect(() => {
    const el = box.current!;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (paused) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setT((v) => v + dt);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  const { w, h } = size;
  // Where we are in the loop: hold on a jacket, then morph to the next.
  const seg = HOLD + MOVE;
  const k = Math.floor(t / seg) % STOPS.length;
  const local = t % seg;
  const u = local < HOLD ? 0 : ease((local - HOLD) / MOVE);
  const a = STOPS[k];
  const b = STOPS[(k + 1) % STOPS.length];
  const m = mix(a.m, b.m, u);
  const label = u < 0.5 ? a : b;

  // Layout in pixels: the jacket sits right of the title on wide screens, centred above it on phones.
  const s = wide ? Math.min((w * 0.5) / 130, (h * 0.7) / 82) : Math.min((w * 0.92) / 130, (h * 0.46) / 82);
  const cx = wide ? w * 0.64 : w * 0.5;
  const top = wide ? h * 0.17 : h * 0.15;
  const geo = jacketGeometry(m);
  const armY = 4.5 + m.chest * 0.36;
  const tapeY = top + (armY + 3.5) * s;
  const x0 = cx - (m.chest / 2) * s;
  const x1 = cx + (m.chest / 2) * s;
  const band = Math.max(18, 3.4 * s);
  const cm = Math.ceil((w - x0) / s) + 2;

  return (
    <div ref={box} aria-hidden="true" className="absolute inset-0 bg-[var(--p-bg)]">
      {w > 0 && (
        <svg width={w} height={h} className="absolute inset-0">
          {/* the jacket */}
          <g transform={`translate(${cx} ${top}) scale(${s})`} fill="none" stroke="var(--p-accent)" strokeLinejoin="round">
            <path d={geo.outline} strokeWidth={2 / s} />
            <path d={geo.details} strokeWidth={1 / s} opacity={0.7} />
          </g>

          {/* the tape: a yellow band from the left armpit to the edge of the screen */}
          <g transform={`translate(0 ${tapeY})`}>
            <rect x={x0 - 0.9 * s} y={-band / 2} width={w - x0 + 0.9 * s + 20} height={band} fill="#f3c63f" />
            <rect x={x0 - 1.6 * s} y={-band / 2 - 2} width={1.2 * s} height={band + 4} fill="#9a9aa0" rx={2} />
            {Array.from({ length: cm }).map((_, i) => {
              const x = x0 + i * s;
              const big = i % 10 === 0;
              const mid = i % 5 === 0;
              return (
                <g key={i}>
                  <line x1={x} x2={x} y1={-band / 2} y2={-band / 2 + band * (big ? 0.5 : mid ? 0.36 : 0.22)} stroke="#1a1a1a" strokeWidth={big ? 1.4 : 1} />
                  {big && i > 0 && (
                    <text x={x + 3} y={band / 2 - 4} fontSize={Math.max(9, band * 0.38)} fill="#1a1a1a" fontFamily="ui-monospace, monospace">
                      {i}
                    </text>
                  )}
                </g>
              );
            })}
            {/* marker at the right armpit */}
            <line x1={x1} x2={x1} y1={-band * 1.3} y2={band * 1.3} stroke="var(--p-accent)" strokeWidth={2.5} />
            <circle cx={x1} cy={-band * 1.3} r={4} fill="var(--p-accent)" />
          </g>

          {/* readout, in the free space above the right sleeve */}
          <g transform={wide ? `translate(${cx + (m.shoulder / 2 + 16) * s} ${top + 2 * s})` : `translate(${cx} ${top + 76 * s})`} textAnchor={wide ? "start" : "middle"}>
            <text fontSize={11} fill="var(--p-fg)" fontFamily="ui-monospace, monospace" letterSpacing="0.12em" opacity={0.75}>
              {label.brand.toUpperCase()} · SIZE M · CHEST
            </text>
            <text y={Math.max(40, 7.5 * s) + 6} className="font-display" fontSize={Math.max(40, 7.5 * s)} fill="var(--p-accent)">
              {m.chest.toFixed(1)}
              <tspan fontSize={Math.max(16, 2.8 * s)}> cm</tspan>
            </text>
          </g>
        </svg>
      )}
    </div>
  );
}

"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project, Signature } from "@/data/projects";
import { useScene } from "@/lib/use-scene";
import { SectionLabel } from "../bits";

type Data = Extract<Signature, { type: "pulse-results" }>;

// An ECG trace whose beats get closer together: the heart rate climbs as you scroll.
const W = 1200;
const BASE = 150;
const BEATS: number[] = [];
const TRACE = (() => {
  let d = `M0 ${BASE}`;
  let x = 40;
  for (let i = 0; x < W - 70; i++) {
    const s = Math.max(58, 132 - i * 6);
    d += ` L${x} ${BASE} Q${x + 7} ${BASE - 14} ${x + 14} ${BASE} L${x + 22} ${BASE} L${x + 26} ${BASE + 14} L${x + 31} ${BASE - 105} L${x + 36} ${BASE + 36} L${x + 40} ${BASE} L${x + 46} ${BASE} Q${x + 56} ${BASE - 24} ${x + 66} ${BASE}`;
    BEATS.push(x + 31);
    x += s;
  }
  return `${d} L${W} ${BASE}`;
})();

export function PulseResults({ data }: { project: Project; data: Data }) {
  const root = useRef<HTMLElement>(null);
  const pinned = useRef<HTMLDivElement>(null);

  useScene(root, ({ reduced, mobile }) => {
    const q = gsap.utils.selector(root);
    const trace = q("[data-trace]")[0] as unknown as SVGPathElement;
    const len = trace.getTotalLength();
    const head = q("[data-head]")[0];
    const bpm = q("[data-bpm]")[0];
    const dist = q("[data-dist]")[0];
    const flash = q("[data-flash]")[0];
    const wave = q("[data-wave]")[0];
    const timers: number[] = [];
    gsap.set(wave, { svgOrigin: `0 ${BASE}` });

    trace.style.strokeDasharray = String(len);
    let lastBeat = -1;
    const render = (p: number) => {
      const pt = trace.getPointAtLength(p * len);
      trace.style.strokeDashoffset = String(len * (1 - p));
      gsap.set(head, { x: pt.x, y: pt.y });
      bpm.textContent = String(Math.round(data.restingBpm + (data.peakBpm - data.restingBpm) * p));
      dist.textContent = (p * 42.2).toFixed(1);
      // Flash on every beat the head passes.
      const beat = BEATS.findLastIndex((bx) => bx <= pt.x);
      if (beat !== lastBeat && beat > lastBeat && !reduced) {
        gsap.fromTo(flash, { autoAlpha: 0.55, scale: 0.9 }, { autoAlpha: 0, scale: 1.25, duration: 0.45, ease: "power2.out", overwrite: true });
        gsap.fromTo(bpm, { scale: 1.08 }, { scale: 1, duration: 0.3, ease: "power2.out", overwrite: "auto" });
      }
      lastBeat = beat;
    };

    // Results: timeline line grows, rows slide in, split times roll like a scoreboard.
    const cells = q("[data-cell]") as HTMLElement[];
    const roll = (row: Element) => {
      row.querySelectorAll<HTMLElement>("[data-cell]").forEach((c, i) => {
        const final = c.dataset.final!;
        if (!/\d/.test(final)) return;
        let n = 0;
        const total = 6 + i * 2;
        const id = window.setInterval(() => {
          n++;
          c.textContent = n >= total ? final : String(Math.floor(Math.random() * 10));
          if (n >= total) window.clearInterval(id);
        }, 40);
        timers.push(id);
      });
    };

    if (reduced) {
      render(1);
      return;
    }

    render(0);
    const state = { p: 0 };
    const scaleWave = gsap.quickTo(wave, "scaleY", { duration: 0.35, ease: "power2.out" });
    gsap.to(state, {
      p: 1,
      ease: "none",
      onUpdate: () => render(state.p),
      scrollTrigger: {
        trigger: pinned.current,
        start: "top top",
        end: mobile ? "+=160%" : "+=220%",
        pin: true,
        scrub: 0.6,
        // The faster you scroll, the harder the pulse.
        onUpdate: (self) => scaleWave(1 + Math.min(Math.abs(self.getVelocity()) / 2500, 0.8)),
        onScrubComplete: () => scaleWave(1),
      },
    });

    cells.forEach((c) => {
      if (/\d/.test(c.dataset.final!)) c.textContent = "0";
    });
    gsap.fromTo("[data-line]", { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-results]", start: "top 70%", end: "bottom 60%", scrub: true } });
    q("[data-result]").forEach((row) => {
      gsap.from(row, { x: -40, autoAlpha: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: row, start: "top 80%" } });
      ScrollTrigger.create({ trigger: row, start: "top 75%", once: true, onEnter: () => roll(row) });
    });

    return () => {
      timers.forEach((t) => window.clearInterval(t));
      cells.forEach((c) => (c.textContent = c.dataset.final!));
    };
  });

  return (
    <section ref={root} aria-labelledby="pulse-title">
      <div ref={pinned} className="relative flex h-dvh flex-col justify-between overflow-hidden bg-[var(--p-bg)] px-4 pt-28 pb-8 md:px-10 md:pt-28">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <SectionLabel index="02">Race pace</SectionLabel>
            <h2 id="pulse-title" className="font-display mt-3 text-[clamp(1.75rem,3.5vw,3.25rem)] leading-none font-extrabold tracking-tight uppercase italic">
              Scroll to run
            </h2>
          </div>
          <dl className="flex gap-x-8 font-mono text-xs tracking-widest text-[var(--p-muted)] uppercase">
            <div>
              <dt>Distance</dt>
              <dd className="font-display mt-1 text-4xl font-extrabold text-[var(--p-fg)] tabular-nums md:text-5xl">
                <span data-dist>42.2</span>
                <span className="text-lg"> km</span>
              </dd>
            </div>
            <div>
              <dt>{data.headline.label}</dt>
              <dd className="font-display mt-1 text-4xl font-extrabold text-[var(--p-fg)] tabular-nums md:text-5xl">{data.headline.value}</dd>
            </div>
          </dl>
        </div>

        <div className="relative">
          <svg viewBox={`0 0 ${W} 300`} className="w-full overflow-visible" aria-hidden="true">
            <g data-wave>
              <path d={TRACE} fill="none" stroke="var(--p-fg)" strokeOpacity="0.12" strokeWidth="2" />
              <path data-trace d={TRACE} fill="none" stroke="var(--p-accent)" strokeWidth="3.5" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 6px var(--p-accent))" }} />
              <g data-head>
                <circle r="7" fill="var(--p-accent)" />
                <circle data-flash r="34" fill="var(--p-accent)" style={{ opacity: 0, transformBox: "fill-box", transformOrigin: "center" }} />
              </g>
            </g>
          </svg>
        </div>

        <div className="flex items-end justify-between gap-4">
          <p className="font-display leading-none font-extrabold italic">
            <span data-bpm className="inline-block origin-left text-[clamp(5rem,20vw,17rem)] tabular-nums text-[var(--p-accent)]">
              {data.peakBpm}
            </span>
            <span className="ml-[0.9em] align-top text-xl text-[var(--p-muted)] not-italic md:text-3xl">BPM</span>
          </p>
          <p className="max-w-[16ch] text-right font-mono text-xs leading-relaxed tracking-wide text-[var(--p-muted)] uppercase">
            Resting {data.restingBpm} → race {data.peakBpm}
          </p>
        </div>
      </div>

      <div data-results className="relative px-4 py-[14vh] md:px-10">
        <SectionLabel index="02b">
          Race results
        </SectionLabel>
        <div className="relative mt-12">
          <div data-line aria-hidden="true" className="absolute top-0 bottom-0 left-[5px] w-px origin-top bg-[var(--p-accent)]" />
          <ol className="space-y-16 md:space-y-20">
            {data.results.map((r) => (
              <li key={r.race + r.date} data-result className="relative pl-10">
                <span aria-hidden="true" className="absolute top-3 left-0 h-[11px] w-[11px] rounded-full bg-[var(--p-accent)]" />
                <p className="font-mono text-xs tracking-widest text-[var(--p-muted)] uppercase">{r.date}</p>
                <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2">
                  <h3 className="font-display text-[clamp(2rem,5vw,4.5rem)] leading-[0.95] font-extrabold uppercase italic">{r.race}</h3>
                  {r.time ? (
                    <p className="font-mono text-[clamp(1.75rem,4vw,3.5rem)] leading-none text-[var(--p-accent)] tabular-nums">
                      <span className="sr-only">Finish time </span>
                      {r.time}
                    </p>
                  ) : (
                    <p className="flex items-center gap-3 font-mono text-[clamp(1.25rem,2.6vw,2.25rem)] leading-none tracking-widest text-[var(--p-accent)] uppercase">
                      <span aria-hidden="true" className="relative flex h-3 w-3">
                        <span className="absolute inset-0 rounded-full bg-[var(--p-accent)] opacity-60 motion-safe:animate-ping" />
                        <span className="relative h-3 w-3 rounded-full bg-[var(--p-accent)]" />
                      </span>
                      Coming soon
                    </p>
                  )}
                </div>
                {r.pace && <p className="mt-2 font-mono text-sm text-[var(--p-muted)]">Avg pace {r.pace}</p>}
                <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:max-w-2xl" aria-label={`${r.race} in numbers`}>
                  {r.stats.map((s) => (
                    <li key={s.label} className="rounded-md border border-[var(--p-fg)]/15 bg-[var(--p-fg)]/[0.04] p-3">
                      <span className="block font-mono text-[10px] tracking-widest text-[var(--p-muted)] uppercase">{s.label}</span>
                      <span className="mt-2 flex gap-[2px] font-mono text-base whitespace-nowrap tabular-nums sm:gap-[3px] md:text-xl" aria-label={s.value}>
                        {s.value.split("").map((ch, i) => (
                          <span
                            key={i}
                            data-cell
                            data-final={ch}
                            aria-hidden="true"
                            className={/\d/.test(ch) ? "inline-block min-w-[1.1ch] rounded-[3px] bg-[var(--p-fg)]/10 px-[3px] text-center" : "px-px text-[var(--p-muted)]"}
                          >
                            {ch}
                          </span>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

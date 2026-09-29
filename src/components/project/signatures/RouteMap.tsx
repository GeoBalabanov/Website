"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import type { Project, Signature } from "@/data/projects";
import { useScene } from "@/lib/use-scene";
import { PlaceholderTag, SectionLabel } from "../bits";

type Data = Extract<Signature, { type: "route-map" }>;

/*
 * Map of Plovdiv traced from the official course map (viewBox matches the
 * source image, 1796×958). The loop starts and finishes by the Rowing Canal.
 */
const MAP_W = 1796;
const MAP_H = 958;

// Course, in running order, from the start/finish by the Rowing Canal.
const COURSE: [number, number][] = [
  [425, 338], [437, 336], [475, 300], [492, 282], [530, 240], [568, 272], [585, 318], [593, 352], [593, 370], [597, 408],
  [668, 403], [695, 410], [640, 415], [603, 420], [540, 447], [487, 470], [447, 487], [467, 548], [480, 598], [500, 700],
  [515, 788], [535, 862], [570, 890], [608, 826], [625, 797], [640, 771], [673, 712], [740, 690], [815, 682], [862, 670],
  [930, 653], [1000, 635], [1033, 622], [1043, 612], [1100, 555], [1195, 465], [1203, 440], [1200, 400], [1198, 357],
  [1192, 310], [1185, 270], [1178, 205], [1205, 168], [1235, 178], [1258, 183], [1350, 157], [1380, 148], [1415, 147],
  [1438, 148], [1438, 130], [1438, 116], [1475, 116], [1500, 115], [1550, 103], [1578, 100], [1585, 130], [1690, 105],
  [1662, 48], [1650, 55], [1637, 65], [1600, 85], [1550, 100], [1500, 112], [1403, 112], [1355, 107], [1225, 112],
  [1165, 125], [1063, 148], [1030, 155], [983, 157], [950, 158], [922, 157], [855, 157], [823, 155], [784, 156],
  [741, 156], [672, 156], [634, 157], [553, 167], [510, 185], [503, 208], [478, 233], [320, 368], [283, 400], [135, 527],
  [95, 563], [118, 588], [228, 492], [425, 338],
];
const ROUTE = COURSE.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");

const RIVER = "M-20 470 C 100 410, 250 330, 400 225 S 540 150, 640 138 S 900 128, 1100 118 S 1400 96, 1550 84 S 1720 60, 1820 48";
const CANAL = "M92 566 L478 226 L512 210 L524 236 L126 594 Z";

// Label offsets keep names clear of the course.
const HILLS = [
  { name: "Youth Hill", x: 800, y: 555, rx: 95, ry: 88, lx: 800, ly: 452, anchor: "middle" },
  { name: "Bunardzhik", x: 930, y: 380, rx: 62, ry: 72, lx: 930, ly: 478, anchor: "middle" },
  { name: "Sahat Tepe", x: 1100, y: 332, rx: 34, ry: 38, lx: 1100, ly: 396, anchor: "middle" },
  { name: "Nebet Tepe", x: 1222, y: 212, rx: 30, ry: 24, lx: 1262, ly: 240, anchor: "start" },
] as const;

// PLACEHOLDER elevation profile (metres) for one loop: Plovdiv's course is mostly flat along the river.
const ELEVATION = Array.from({ length: 64 }, (_, i) => {
  const f = i / 63;
  const bump = (c: number, w: number, h: number) => h * Math.exp(-((f - c) ** 2) / (2 * w * w));
  return 158 + 3 * Math.sin(f * 26) + bump(0.28, 0.05, 10) + bump(0.45, 0.04, 8) - bump(0.75, 0.08, 6);
});
const E_MIN = 140;
const E_MAX = 190;
const ey = (e: number) => 130 - ((e - E_MIN) / (E_MAX - E_MIN)) * 115;
const PROFILE_LINE = ELEVATION.map((e, i) => `${i === 0 ? "M" : "L"}${((i / 63) * 800).toFixed(1)} ${ey(e).toFixed(1)}`).join(" ");
const PROFILE_AREA = `${PROFILE_LINE} L800 140 L0 140 Z`;

export function RouteMap({ data }: { project: Project; data: Data }) {
  const root = useRef<HTMLElement>(null);
  const pinned = useRef<HTMLDivElement>(null);
  const laps = data.laps ?? 1;
  const loopKm = data.distanceKm / laps;

  useScene(root, ({ reduced, mobile }) => {
    const q = gsap.utils.selector(root);
    const path = q("[data-route]")[0] as unknown as SVGPathElement;
    const again = q("[data-route-again]")[0] as unknown as SVGPathElement | undefined;
    const len = path.getTotalLength();
    const runner = q("[data-runner]")[0];
    const km = q("[data-km]")[0];
    const lap = q("[data-lap]")[0];
    const markers = q("[data-marker]");
    const clip = q("[data-profile-clip]")[0];
    const cursor = q("[data-profile-cursor]")[0];
    const elev = q("[data-elev]")[0];

    // Kilometre markers sit on the loop.
    markers.forEach((m) => {
      const pt = path.getPointAtLength((Number(m.getAttribute("data-marker")) / loopKm) * len);
      gsap.set(m, { x: pt.x, y: pt.y });
    });

    const shown = markers.map(() => false);
    const render = (p: number) => {
      const run = p * laps; // 0 … laps
      const lapIndex = Math.min(laps - 1, Math.floor(run));
      const f = Math.min(1, run - lapIndex); // position on the current loop
      const pt = path.getPointAtLength(f * len);
      gsap.set(runner, { x: pt.x, y: pt.y });
      // First lap draws the course; later laps trace over it in a brighter line.
      path.style.strokeDashoffset = String(len * (1 - Math.min(1, run)));
      if (again) again.style.strokeDashoffset = String(len * (1 - Math.max(0, Math.min(1, run - 1))));
      km.textContent = (p * data.distanceKm).toFixed(3);
      if (lap) lap.textContent = `Lap ${lapIndex + 1} / ${laps}`;
      gsap.set(clip, { scaleX: f });
      gsap.set(cursor, { x: f * 800 });
      elev.textContent = `${Math.round(ELEVATION[Math.min(63, Math.round(f * 63))])} m`;
      markers.forEach((m, i) => {
        const passed = Math.min(1, run) * loopKm >= Number(m.getAttribute("data-marker"));
        if (passed === shown[i]) return;
        shown[i] = passed;
        gsap.to(m, { autoAlpha: passed ? 1 : 0, scale: passed ? 1 : 0.4, duration: 0.3, overwrite: true });
      });
    };

    path.style.strokeDasharray = String(len);
    if (again) again.style.strokeDasharray = String(len);
    if (reduced) {
      render(1);
      return;
    }
    render(0);
    const state = { p: 0 };
    gsap.to(state, {
      p: 1,
      ease: "none",
      onUpdate: () => render(state.p),
      scrollTrigger: { trigger: pinned.current, start: "top top", end: mobile ? "+=200%" : "+=300%", pin: true, scrub: 0.8 },
    });
  });

  const markerKms = Array.from({ length: Math.floor(loopKm / 5) }, (_, i) => (i + 1) * 5);

  return (
    <section ref={root} aria-labelledby="route-title">
      <div ref={pinned} className="flex h-dvh flex-col gap-6 px-4 pt-28 pb-8 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10 md:px-10 md:pt-28">
        <div className="flex flex-col">
          <SectionLabel index="02">The route</SectionLabel>
          <h2 id="route-title" className="font-display mt-4 text-[clamp(1.75rem,3.4vw,3.5rem)] leading-[1] tracking-[-0.02em] md:mt-6">
            Along the Maritsa, through the city of hills
          </h2>
          {laps > 1 && (
            <p data-lap className="mt-4 font-mono text-xs tracking-widest text-[var(--p-accent-2)] uppercase md:mt-6">
              Lap {laps} / {laps}
            </p>
          )}
          <p className="mt-auto hidden font-mono text-xs tracking-widest text-[var(--p-muted)] uppercase md:block">Distance</p>
          <p className="font-display text-[clamp(3rem,8vw,8.5rem)] leading-none tracking-[-0.04em] tabular-nums text-[var(--p-accent)]" aria-live="off">
            <span data-km>{data.distanceKm.toFixed(3)}</span>
            <span className="ml-2 text-[0.35em] tracking-normal">km</span>
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-center gap-3">
          <svg
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            className="max-h-full min-h-0 w-full"
            role="img"
            aria-label={`Map of Plovdiv with the ${loopKm.toFixed(1)} km loop: from the Rowing Canal along the Maritsa, past Youth Hill and through the centre${laps > 1 ? `, run ${laps} times` : ""}`}
          >
            <defs>
              <pattern id="streets" width="34" height="34" patternUnits="userSpaceOnUse" patternTransform="rotate(-16)">
                <path d="M0 0 H34 M0 0 V34" stroke="var(--p-fg)" strokeOpacity="0.06" strokeWidth="1.2" />
              </pattern>
            </defs>
            <rect width={MAP_W} height={MAP_H} rx="10" fill="var(--p-fg)" fillOpacity="0.035" />
            <rect width={MAP_W} height={MAP_H} rx="10" fill="url(#streets)" />

            {/* Rowing Canal park, the Maritsa and the canal itself */}
            <path d="M40 600 L470 190 L620 230 L700 420 L470 520 L220 640 Z" fill="var(--p-fg)" fillOpacity="0.035" />
            <path d={RIVER} fill="none" stroke="var(--p-accent-2)" strokeOpacity="0.28" strokeWidth="34" strokeLinecap="round" />
            <path d={CANAL} fill="var(--p-accent-2)" fillOpacity="0.22" />
            <text x="760" y="104" fill="var(--p-accent-2)" fontSize="26" fontStyle="italic" fontFamily="var(--p-display)">
              Maritsa
            </text>
            <text x="190" y="470" fill="var(--p-muted)" fontSize="17" fontFamily="var(--font-mono)" transform="rotate(-41 190 470)" letterSpacing="2">
              ROWING CANAL
            </text>

            {HILLS.map((h) => (
              <g key={h.name}>
                {[1, 0.66, 0.34].map((k) => (
                  <ellipse key={k} cx={h.x} cy={h.y} rx={h.rx * k} ry={h.ry * k} fill="var(--p-fg)" fillOpacity={0.035} stroke="var(--p-fg)" strokeOpacity="0.22" strokeWidth="1.5" />
                ))}
                <text x={h.lx} y={h.ly} textAnchor={h.anchor} fontSize="17" fill="var(--p-muted)" fontFamily="var(--font-mono)">
                  {h.name}
                </text>
              </g>
            ))}
            <text x="1262" y="320" fontSize="17" fill="var(--p-muted)" fontFamily="var(--font-mono)">
              KAPANA · CENTRE
            </text>

            {/* Course: faint full loop, the drawn first lap, then later laps in a brighter trace */}
            <path d={ROUTE} fill="none" stroke="var(--p-fg)" strokeOpacity="0.22" strokeWidth="4" strokeDasharray="3 12" strokeLinecap="round" strokeLinejoin="round" />
            <path data-route d={ROUTE} fill="none" stroke="var(--p-accent)" strokeOpacity={laps > 1 ? 0.55 : 1} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            {laps > 1 && <path data-route-again d={ROUTE} fill="none" stroke="var(--p-accent)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />}

            {markerKms.map((k) => (
              <g key={k} data-marker={k} style={{ opacity: 0 }}>
                <circle r="19" fill="var(--p-bg)" stroke="var(--p-accent)" strokeWidth="3" />
                <text textAnchor="middle" dy="6" fontSize="17" fontWeight="700" fill="var(--p-accent)" fontFamily="var(--font-mono)">
                  {k}
                </text>
              </g>
            ))}

            <g>
              <circle cx="425" cy="338" r="11" fill="var(--p-fg)" />
              <text x="400" y="330" textAnchor="end" fontSize="18" fill="var(--p-fg)" fontFamily="var(--font-mono)">
                START / FINISH
              </text>
            </g>
            <g data-runner>
              <circle r="26" fill="var(--p-accent-2)" fillOpacity="0.35" className="animate-ping motion-reduce:animate-none" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
              <circle r="13" fill="var(--p-accent-2)" stroke="var(--p-bg)" strokeWidth="4" />
            </g>
          </svg>

          <div className="shrink-0">
            <div className="flex justify-between font-mono text-[11px] tracking-wide text-[var(--p-muted)] uppercase">
              <span className="flex items-center gap-2">
                Elevation <PlaceholderTag />
              </span>
              <span data-elev className="tabular-nums text-[var(--p-fg)]">
                160 m
              </span>
            </div>
            <svg viewBox="0 0 800 140" preserveAspectRatio="none" className="mt-1 h-[9dvh] w-full" aria-hidden="true">
              <defs>
                <clipPath id="profile-clip">
                  <rect data-profile-clip width="800" height="140" style={{ transformOrigin: "0 0" }} />
                </clipPath>
              </defs>
              <path d={PROFILE_AREA} fill="var(--p-fg)" fillOpacity="0.06" />
              <path d={PROFILE_LINE} fill="none" stroke="var(--p-fg)" strokeOpacity="0.25" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <g clipPath="url(#profile-clip)">
                <path d={PROFILE_AREA} fill="var(--p-accent)" fillOpacity="0.22" />
                <path d={PROFILE_LINE} fill="none" stroke="var(--p-accent)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
              </g>
              <line data-profile-cursor x1="0" x2="0" y1="0" y2="140" stroke="var(--p-fg)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        </div>
      </div>

      <RaceDay data={data} />
    </section>
  );
}

function RaceDay({ data }: { data: Data }) {
  const target = data.raceDate.iso ? new Date(data.raceDate.iso).getTime() : null;
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!target) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  const left = target && now ? Math.max(0, target - now) : null;
  const parts = [
    ["Days", left === null ? null : Math.floor(left / 86_400_000)],
    ["Hours", left === null ? null : Math.floor(left / 3_600_000) % 24],
    ["Minutes", left === null ? null : Math.floor(left / 60_000) % 60],
    ["Seconds", left === null ? null : Math.floor(left / 1000) % 60],
  ] as const;

  return (
    <div className="px-4 py-[14vh] md:px-10">
      <div className="flex flex-wrap items-center gap-3 font-mono text-xs tracking-wide text-[var(--p-muted)] uppercase">
        <span>Race day</span>
        <span className="text-[var(--p-fg)]">{data.raceDate.label}</span>
        {!data.raceDate.iso && <PlaceholderTag>Set raceDate.iso to start the countdown</PlaceholderTag>}
      </div>
      <div className="mt-6 grid grid-cols-4 gap-2 md:max-w-4xl md:gap-4" role="timer" aria-label="Countdown to race day">
        {parts.map(([label, v]) => (
          <div key={label} className="rounded-md border border-current/15 px-2 py-4 text-center md:py-6">
            <div className="font-display text-[clamp(2rem,6vw,5rem)] leading-none tabular-nums">{v === null ? "--" : String(v).padStart(2, "0")}</div>
            <div className="mt-2 font-mono text-[10px] tracking-widest text-[var(--p-muted)] uppercase md:text-xs">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

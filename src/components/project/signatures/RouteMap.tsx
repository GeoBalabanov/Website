"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import type { Project, Signature } from "@/data/projects";
import { useScene } from "@/lib/use-scene";
import { PlaceholderTag, SectionLabel } from "../bits";

type Data = Extract<Signature, { type: "route-map" }>;

// Stylized Plovdiv: the Maritsa, the hills and a loop through the city.
// PLACEHOLDER: the route is illustrative, not the real course.
const ROUTE =
  "M330 250 C 330 210, 320 180, 330 150 S 330 80, 380 70 S 560 50, 620 80 S 680 140, 650 180 S 600 250, 620 320 S 640 430, 560 470 S 400 510, 300 500 S 150 500, 130 450 S 140 350, 190 300 S 290 270, 330 250";

const HILLS = [
  { name: "Nebet Tepe", x: 392, y: 212, r: 26 },
  { name: "Dzhambaz Tepe", x: 446, y: 246, r: 22 },
  { name: "Taksim Tepe", x: 410, y: 288, r: 24 },
  { name: "Sahat Tepe", x: 520, y: 338, r: 30 },
  { name: "Bunardzhik", x: 236, y: 310, r: 34 },
  { name: "Dzhendem Tepe", x: 176, y: 420, r: 40 },
];

// PLACEHOLDER elevation profile (metres), sampled evenly along the route.
const ELEVATION = Array.from({ length: 64 }, (_, i) => {
  const f = i / 63;
  const bump = (c: number, w: number, h: number) => h * Math.exp(-((f - c) ** 2) / (2 * w * w));
  return 160 + 4 * Math.sin(f * 30) + bump(0.06, 0.03, 34) + bump(0.47, 0.04, 22) + bump(0.78, 0.05, 38) + bump(0.97, 0.025, 26);
});
const E_MIN = 140;
const E_MAX = 215;
const ey = (e: number) => 130 - ((e - E_MIN) / (E_MAX - E_MIN)) * 115;
const PROFILE_LINE = ELEVATION.map((e, i) => `${i === 0 ? "M" : "L"}${((i / 63) * 800).toFixed(1)} ${ey(e).toFixed(1)}`).join(" ");
const PROFILE_AREA = `${PROFILE_LINE} L800 140 L0 140 Z`;

export function RouteMap({ data }: { project: Project; data: Data }) {
  const root = useRef<HTMLElement>(null);
  const pinned = useRef<HTMLDivElement>(null);

  useScene(root, ({ reduced, mobile }) => {
    const q = gsap.utils.selector(root);
    const path = q("[data-route]")[0] as unknown as SVGPathElement;
    const len = path.getTotalLength();
    const runner = q("[data-runner]")[0];
    const km = q("[data-km]")[0];
    const markers = q("[data-marker]");
    const clip = q("[data-profile-clip]")[0];
    const cursor = q("[data-profile-cursor]")[0];
    const elev = q("[data-elev]")[0];

    // Kilometre markers sit on the path.
    markers.forEach((m) => {
      const pt = path.getPointAtLength((Number(m.getAttribute("data-marker")) / data.distanceKm) * len);
      gsap.set(m, { x: pt.x, y: pt.y });
    });

    const shown = markers.map(() => false);
    const render = (p: number) => {
      const pt = path.getPointAtLength(p * len);
      gsap.set(runner, { x: pt.x, y: pt.y });
      path.style.strokeDashoffset = String(len * (1 - p));
      km.textContent = (p * data.distanceKm).toFixed(3);
      gsap.set(clip, { scaleX: p });
      gsap.set(cursor, { x: p * 800 });
      elev.textContent = `${Math.round(ELEVATION[Math.min(63, Math.round(p * 63))])} m`;
      markers.forEach((m, i) => {
        const passed = p * data.distanceKm >= Number(m.getAttribute("data-marker"));
        if (passed === shown[i]) return;
        shown[i] = passed;
        gsap.to(m, { autoAlpha: passed ? 1 : 0, scale: passed ? 1 : 0.4, duration: 0.3, overwrite: true });
      });
    };

    path.style.strokeDasharray = String(len);
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
      scrollTrigger: { trigger: pinned.current, start: "top top", end: mobile ? "+=180%" : "+=260%", pin: true, scrub: 0.8 },
    });
  });

  return (
    <section ref={root} aria-labelledby="route-title">
      <div ref={pinned} className="flex h-dvh flex-col gap-6 px-4 pt-28 pb-8 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)] md:gap-10 md:px-10 md:pt-28">
        <div className="flex flex-col">
          <SectionLabel index="02" placeholder>
            The route
          </SectionLabel>
          <h2 id="route-title" className="font-display mt-4 text-[clamp(1.75rem,3.4vw,3.5rem)] leading-[1] tracking-[-0.02em] md:mt-6">
            One loop through the city of hills
          </h2>
          <p className="mt-auto hidden font-mono text-xs tracking-widest text-[var(--p-muted)] uppercase md:block">Distance</p>
          <p className="font-display text-[clamp(3rem,8vw,8.5rem)] leading-none tracking-[-0.04em] tabular-nums text-[var(--p-accent)]" aria-live="off">
            <span data-km>{data.distanceKm.toFixed(3)}</span>
            <span className="ml-2 text-[0.35em] tracking-normal">km</span>
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <svg viewBox="0 0 800 540" className="min-h-0 w-full flex-1" role="img" aria-label="Stylized map of Plovdiv with the marathon route looping from the Old Town across the Maritsa and back">
            <defs>
              <pattern id="streets" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
                <path d="M0 0 H26 M0 0 V26" stroke="var(--p-fg)" strokeOpacity="0.07" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="800" height="540" rx="6" fill="var(--p-fg)" fillOpacity="0.04" />
            <rect width="800" height="540" rx="6" fill="url(#streets)" />
            {/* Maritsa river */}
            <path d="M-20 150 C 120 118, 220 190, 360 160 S 600 108, 820 146" fill="none" stroke="#7fa2a8" strokeOpacity="0.45" strokeWidth="26" strokeLinecap="round" />
            <text x="690" y="118" fill="#56777d" fontSize="15" fontStyle="italic" fontFamily="var(--p-display)">
              Maritsa
            </text>
            {/* Hills with contour lines */}
            {HILLS.map((h) => (
              <g key={h.name}>
                {[1, 0.7, 0.42].map((k) => (
                  <ellipse key={k} cx={h.x} cy={h.y} rx={h.r * k * 1.25} ry={h.r * k} fill="var(--p-fg)" fillOpacity={0.035} stroke="var(--p-fg)" strokeOpacity="0.28" />
                ))}
                <text x={h.x} y={h.y + h.r + 16} textAnchor="middle" fontSize="11" fill="var(--p-muted)" fontFamily="var(--font-mono)">
                  {h.name}
                </text>
              </g>
            ))}
            <text x="296" y="236" fontSize="12" fill="var(--p-fg)" fontFamily="var(--font-mono)" textAnchor="end">
              OLD TOWN · START / FINISH
            </text>
            {/* Route: faint full course, then the drawn part */}
            <path d={ROUTE} fill="none" stroke="var(--p-fg)" strokeOpacity="0.18" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
            <path data-route d={ROUTE} fill="none" stroke="var(--p-accent)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            {[5, 10, 15, 20, 25, 30, 35, 40].map((k) => (
              <g key={k} data-marker={k} style={{ opacity: 0 }}>
                <circle r="11" fill="var(--p-bg)" stroke="var(--p-accent)" strokeWidth="2" />
                <text textAnchor="middle" dy="4" fontSize="10" fontWeight="700" fill="var(--p-accent)" fontFamily="var(--font-mono)">
                  {k}
                </text>
              </g>
            ))}
            <circle cx="330" cy="250" r="6" fill="var(--p-fg)" />
            <g data-runner>
              <circle r="16" fill="var(--p-accent-2)" fillOpacity="0.35" className="animate-ping motion-reduce:animate-none" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
              <circle r="8" fill="var(--p-accent-2)" stroke="var(--p-bg)" strokeWidth="3" />
            </g>
          </svg>

          <div className="shrink-0">
            <div className="flex justify-between font-mono text-[11px] tracking-wide text-[var(--p-muted)] uppercase">
              <span>Elevation</span>
              <span data-elev className="tabular-nums text-[var(--p-fg)]">
                160 m
              </span>
            </div>
            <svg viewBox="0 0 800 140" preserveAspectRatio="none" className="mt-1 h-[11dvh] w-full" aria-hidden="true">
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
  const button = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!target) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  // Magnetic pull on the Register button (desktop pointers only).
  useEffect(() => {
    const el = button.current;
    if (!el || !window.matchMedia("(hover: hover) and (prefers-reduced-motion: no-preference)").matches) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "elastic.out(1, 0.4)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "elastic.out(1, 0.4)" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * 0.25);
      yTo((e.clientY - r.top - r.height / 2) * 0.25);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  const left = target && now ? Math.max(0, target - now) : null;
  const parts = [
    ["Days", left === null ? null : Math.floor(left / 86_400_000)],
    ["Hours", left === null ? null : Math.floor(left / 3_600_000) % 24],
    ["Minutes", left === null ? null : Math.floor(left / 60_000) % 60],
    ["Seconds", left === null ? null : Math.floor(left / 1000) % 60],
  ] as const;
  const isUrl = /^https?:\/\//.test(data.registerUrl);

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

      <div className="mt-14 flex flex-col items-start gap-3">
        <a
          ref={button}
          href={isUrl ? data.registerUrl : "#register"}
          target={isUrl ? "_blank" : undefined}
          rel={isUrl ? "noreferrer" : undefined}
          onClick={(e) => !isUrl && e.preventDefault()}
          className="font-display inline-flex items-center gap-4 rounded-full bg-[var(--p-accent)] px-10 py-6 text-[clamp(2rem,5vw,4.5rem)] leading-none text-[var(--p-bg)] transition-colors hover:bg-[var(--p-fg)] md:px-14 md:py-8"
        >
          Register <span aria-hidden="true">→</span>
        </a>
        {!isUrl && <PlaceholderTag>{data.registerUrl}</PlaceholderTag>}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import s from "./DemoBox.module.css";

/**
 * Advantech gallery piece: the Demo Box in remote mode, as a SCADA-style
 * screen. The Liquicap level sensor's 4–20 mA signal goes into the ADAM-6017;
 * GCL rules start filling at AI2 ≤ 5.6 mA and draining at AI2 ≥ 17.2 mA,
 * one pump-valve pair at a time, forever, with no manual input.
 * Runs only while on screen; reduced motion shows a still, mid-fill frame.
 */

const CYCLE = 14000; // one fill + one drain (ms)
const TICK = 50;
const LOW = 0.1; // 5.6 mA
const HIGH = 0.825; // 17.2 mA
const mA = (level: number) => 4 + 16 * level;

// Tank geometry (SVG units).
const TANK = { x: 470, y: 120, w: 160, h: 310 };
const levelY = (level: number) => TANK.y + TANK.h * (1 - level);

function stateAt(t: number) {
  const k = (t % CYCLE) / (CYCLE / 2);
  const filling = k < 1;
  const p = filling ? k : k - 1;
  const eased = p * p * (3 - 2 * p);
  const level = filling ? LOW + (HIGH - LOW) * eased : HIGH - (HIGH - LOW) * eased;
  return { filling, level, sinceSwitch: p * (CYCLE / 2) };
}

const RULES = [
  { id: "R1", when: "AI2 ≤ 5.6 mA", then: "V1 ON · P1 ON · V2 OFF", fill: true },
  { id: "R2", when: "AI2 ≤ 5.6 mA", then: "P2 OFF", fill: true },
  { id: "R3", when: "AI2 ≥ 17.2 mA", then: "V1 OFF · P1 OFF · V2 ON", fill: false },
  { id: "R4", when: "AI2 ≥ 17.2 mA", then: "P2 ON", fill: false },
];

export function DemoBox({ label }: { label: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const [t, setT] = useState(CYCLE * 0.25);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    // Motion preference is only known in the browser.
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      el.toggleAttribute("data-running", e.isIntersecting);
      window.clearInterval(timer);
      if (e.isIntersecting) timer = window.setInterval(() => setT((v) => (v + TICK) % (CYCLE * 100)), TICK);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  const time = reduced ? CYCLE * 0.25 : t;
  const { filling, level, sinceSwitch } = stateAt(time);
  const fired = sinceSwitch < 900; // the rules that just triggered flash briefly
  const ly = levelY(level);
  const wave = (time / 1000) * 2.2;
  const surface = `M${TANK.x} ${ly} ${Array.from({ length: 9 }, (_, i) => {
    const x = TANK.x + (i * TANK.w) / 8;
    return `L${x} ${ly + Math.sin(wave + i * 0.9) * 2.4}`;
  }).join(" ")} L${TANK.x + TANK.w} ${TANK.y + TANK.h} L${TANK.x} ${TANK.y + TANK.h} Z`;
  // Trend of the last 14 s of AI2.
  const trend = Array.from({ length: 57 }, (_, i) => {
    const at = time - CYCLE + (i * CYCLE) / 56;
    const v = mA(stateAt(Math.max(0, at) + (at < 0 ? CYCLE : 0)).level);
    return `${i === 0 ? "M" : "L"}${72 + i * 3.9} ${548 - ((v - 4) / 16) * 90}`;
  }).join(" ");
  const resLevel = 1 - level; // the reservoir mirrors the tank
  const on = { V1: filling, P1: filling, V2: !filling, P2: !filling };

  return (
    <div ref={stage} role="img" aria-label={label} className={s.stage}>
      {/* "meet": the gallery frame is taller than 16:10 (parallax room), so fit, never crop. */}
      <svg viewBox="0 0 1000 625" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <pattern id="db-grid" width="25" height="25" patternUnits="userSpaceOnUse">
            <path d="M25 0 H0 V25" fill="none" stroke="#ffffff" strokeOpacity="0.035" />
          </pattern>
          <linearGradient id="db-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5cc8f0" />
            <stop offset="1" stopColor="#1f7fb8" />
          </linearGradient>
          <clipPath id="db-tank">
            <rect x={TANK.x} y={TANK.y} width={TANK.w} height={TANK.h} rx="10" />
          </clipPath>
        </defs>
        <rect width="1000" height="625" fill="#0d1824" />
        <rect width="1000" height="625" fill="url(#db-grid)" />

        {/* Header */}
        <text x="40" y="52" className={s.caps}>
          Demo Box · Remote mode
        </text>
        <circle cx="868" cy="47" r="6" className={s.blink} fill="#3ddc84" />
        <text x="882" y="52" className={s.caps} fill="#3ddc84">
          Running
        </text>
        <text x="960" y="78" className={s.small} textAnchor="end">
          manual input: 0
        </text>

        {/* Signal wire: sensor → ADAM-6017 */}
        <path d="M600 100 V70 H180 V120" className={s.wire} />
        <path d="M600 100 V70 H180 V120" className={s.signal} />
        <text x="390" y="62" className={s.small} textAnchor="middle">
          4–20 mA
        </text>

        {/* ADAM-6017 */}
        <rect x="60" y="120" width="240" height="210" rx="10" className={s.module} />
        <text x="80" y="150" className={s.caps}>
          ADAM-6017
        </text>
        <text x="80" y="172" className={s.small}>
          analog in · digital out
        </text>
        <rect x="80" y="186" width="200" height="56" rx="6" fill="#06121c" />
        <text x="92" y="207" className={s.small}>
          AI2
        </text>
        <text x="268" y="230" className={s.readout} textAnchor="end">
          {mA(level).toFixed(1)} mA
        </text>
        {/* 4–20 mA bar with the two thresholds */}
        <rect x="80" y="252" width="200" height="6" rx="3" fill="#1d2c3c" />
        <rect x="80" y="252" width={200 * level} height="6" rx="3" fill="#5cc8f0" />
        <path d={`M${80 + 200 * LOW} 248 V262 M${80 + 200 * HIGH} 248 V262`} stroke="#e8edf3" strokeOpacity="0.6" />
        {(["V1", "P1", "V2", "P2"] as const).map((k, i) => (
          <g key={k} transform={`translate(${92 + i * 50} 292)`}>
            <circle r="8" fill={on[k] ? "#3ddc84" : "#26384a"} className={on[k] ? s.led : ""} />
            <text y="26" className={s.small} textAnchor="middle">
              DO{i} {k}
            </text>
          </g>
        ))}

        {/* Fill line: reservoir → P1 → V1 → tank */}
        <path d="M450 500 V80 H520 V120" className={s.pipe} />
        <path d="M450 500 V80 H520 V120" className={`${s.flow} ${on.P1 ? s.flowOn : ""}`} />
        {/* Drain line: tank → V2 → P2 → reservoir */}
        <path d="M580 430 V470 H760 V500" className={s.pipe} />
        <path d="M580 430 V470 H760 V500" className={`${s.flow} ${on.P2 ? s.flowOn : ""}`} />

        <Pump x={450} y={380} on={on.P1} name="P1" />
        <Valve x={450} y={200} open={on.V1} name="V1" />
        <Valve x={650} y={470} open={on.V2} name="V2" horizontal />
        <Pump x={720} y={470} on={on.P2} name="P2" />

        {/* Tank with level sensor */}
        <rect x={TANK.x} y={TANK.y} width={TANK.w} height={TANK.h} rx="10" fill="#0a1520" />
        <g clipPath="url(#db-tank)">
          <path d={surface} fill="url(#db-water)" opacity="0.9" />
        </g>
        <rect x={TANK.x} y={TANK.y} width={TANK.w} height={TANK.h} rx="10" fill="none" stroke="#7d93a8" strokeWidth="3" />
        <path d="M600 100 V410" stroke="#c9d3dc" strokeWidth="5" strokeLinecap="round" />
        <rect x="586" y="88" width="28" height="16" rx="3" fill="#c9d3dc" />
        <text x="622" y="86" className={s.small}>
          FMI51
        </text>
        {/* Thresholds */}
        <path d={`M${TANK.x - 8} ${levelY(HIGH)} H${TANK.x + TANK.w + 8}`} className={s.threshold} />
        <path d={`M${TANK.x - 8} ${levelY(LOW)} H${TANK.x + TANK.w + 8}`} className={s.threshold} />
        <text x={TANK.x + TANK.w + 14} y={levelY(HIGH) + 4} className={s.small}>
          17.2 mA
        </text>
        <text x={TANK.x + TANK.w + 14} y={levelY(LOW) + 4} className={s.small}>
          5.6 mA
        </text>
        <text x={TANK.x + TANK.w / 2} y={TANK.y + 28} className={s.level} textAnchor="middle">
          {Math.round(level * 100)}%
        </text>

        {/* Reservoir */}
        <rect x="420" y="500" width="400" height="70" rx="8" fill="#0a1520" stroke="#7d93a8" strokeWidth="2" />
        <rect x="422" y={568 - 66 * (0.25 + resLevel * 0.6)} width="396" height={66 * (0.25 + resLevel * 0.6)} rx="6" fill="url(#db-water)" opacity="0.75" />
        <text x="830" y="560" className={s.small}>
          reservoir
        </text>

        {/* GCL rules */}
        <rect x="712" y="120" width="252" height="250" rx="10" className={s.module} />
        <text x="730" y="150" className={s.caps}>
          GCL rules
        </text>
        {RULES.map((r, i) => {
          const active = r.fill === filling;
          return (
            <g key={r.id} transform={`translate(724 ${166 + i * 46})`} className={active && fired ? s.fired : ""}>
              <rect width="228" height="38" rx="6" fill={active ? "#12324a" : "#0f1f2e"} stroke={active ? "#5cc8f0" : "transparent"} strokeOpacity="0.7" />
              <text x="10" y="16" className={s.small} fill={active ? "#e8edf3" : undefined}>
                {r.id} · IF {r.when}
              </text>
              <text x="10" y="31" className={s.small} fill={active ? "#5cc8f0" : undefined}>
                → {r.then}
              </text>
            </g>
          );
        })}
        <text x="730" y="360" className={s.small}>
          1000 ms · max 3 outputs/rule
        </text>

        {/* Status and trend */}
        <rect x="60" y="360" width="240" height="210" rx="10" className={s.module} />
        <text x="80" y="392" className={s.state} fill={filling ? "#5cc8f0" : "#f0a35c"}>
          {filling ? "▲ Filling" : "▼ Draining"}
        </text>
        <text x="80" y="414" className={s.small}>
          AI2 over the last 14 s
        </text>
        <path d={`M72 ${548 - ((mA(HIGH) - 4) / 16) * 90} H290 M72 ${548 - ((mA(LOW) - 4) / 16) * 90} H290`} className={s.threshold} />
        <path d={trend} fill="none" stroke="#5cc8f0" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Pump({ x, y, on, name }: { x: number; y: number; on: boolean; name: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="20" fill="#0d1824" stroke={on ? "#3ddc84" : "#7d93a8"} strokeWidth="3" />
      <g className={on ? s.spin : ""}>
        <path d="M0 -12 V12 M-12 0 H12" stroke={on ? "#3ddc84" : "#7d93a8"} strokeWidth="3" strokeLinecap="round" />
      </g>
      <text y="-28" className={s.small} textAnchor="middle">
        {name}
      </text>
    </g>
  );
}

function Valve({ x, y, open, name, horizontal = false }: { x: number; y: number; open: boolean; name: string; horizontal?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${horizontal ? 0 : 90})`}>
      <path d="M-16 -12 L0 0 L-16 12 Z M16 -12 L0 0 L16 12 Z" fill={open ? "#3ddc84" : "#26384a"} stroke="#0d1824" strokeWidth="2" />
      <text transform={`rotate(${horizontal ? 0 : -90})`} x={horizontal ? -6 : 24} y={horizontal ? -18 : 5} className={s.small}>
        {name}
      </text>
    </g>
  );
}

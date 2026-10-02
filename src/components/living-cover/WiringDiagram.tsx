"use client";

import { useEffect, useRef, useState } from "react";
import s from "./Diagrams.module.css";

/**
 * Advantech gallery: the Demo Box wiring (after Georgi's Visio drawing),
 * explained one layer at a time. Each step lights its own wires, with current
 * flowing along them, and says what is happening: power, the sensor signal,
 * the outputs that drive the relay and pumps, and ground.
 * Runs only while on screen; reduced motion shows the first step.
 */

type Wire = { d: string; kind: "plus" | "minus" | "signal" | "out" | "gnd"; step: number };

const STEPS = [
  { title: "Power", text: "One 24 V supply feeds every part: the ADAM modules, the network switch, the relay and both pumps (+Vs and −Vs)." },
  { title: "Measure", text: "The level sensor's 4–20 mA loop and the valve report to the ADAM-6017, which reads them as analog inputs." },
  { title: "Switch", text: "The ADAM-6050's digital outputs go through a terminal block into the relay, which switches 24 V to each pump." },
  { title: "Ground", text: "A shared ground (GND) closes every loop: from the supply through the Wago connectors to both pumps." },
];

const WIRES: Wire[] = [
  // Step 0 · power (+Vs orange, −Vs blue)
  { kind: "minus", step: 0, d: "M640 100 H510" },
  { kind: "plus", step: 0, d: "M640 140 H580 V130 H510" },
  { kind: "minus", step: 0, d: "M670 180 V255 H510" },
  { kind: "plus", step: 0, d: "M700 180 V285 H510" },
  { kind: "minus", step: 0, d: "M735 180 V240" },
  { kind: "plus", step: 0, d: "M785 180 V240" },
  { kind: "plus", step: 0, d: "M840 180 V300" },
  { kind: "plus", step: 0, d: "M870 350 V375 H770 V395" },
  { kind: "minus", step: 0, d: "M895 350 V505 H720 V520" },
  { kind: "minus", step: 0, d: "M895 505 H905 V520" },
  // Step 1 · measure (sensor + valve into the ADAM-6017)
  { kind: "signal", step: 1, d: "M110 170 V105 H360" },
  { kind: "minus", step: 1, d: "M130 170 V120 H360" },
  { kind: "minus", step: 1, d: "M240 170 V135 H360" },
  { kind: "plus", step: 1, d: "M260 170 V150 H360" },
  // Step 2 · switch (6050 outputs → terminal block → relay → pumps)
  { kind: "out", step: 2, d: "M380 310 V420" },
  { kind: "out", step: 2, d: "M405 310 V420" },
  { kind: "out", step: 2, d: "M430 310 V420" },
  { kind: "out", step: 2, d: "M455 310 V420" },
  { kind: "out", step: 2, d: "M480 435 H600" },
  { kind: "out", step: 2, d: "M480 455 H600" },
  { kind: "out", step: 2, d: "M480 475 H600" },
  { kind: "out", step: 2, d: "M660 485 V520" },
  { kind: "out", step: 2, d: "M740 485 V500 H870 V520" },
  // Step 3 · ground
  { kind: "gnd", step: 3, d: "M860 125 H960 V300 H950" },
  { kind: "gnd", step: 3, d: "M945 350 V552 H950" },
  { kind: "gnd", step: 3, d: "M925 350 V610 H705 V585" },
];

const BLOCKS: { id: string; label: string; sub?: string; x: number; y: number; w: number; h: number; steps: number[] }[] = [
  { id: "valve", label: "Valve", x: 60, y: 170, w: 110, h: 70, steps: [1] },
  { id: "sensor", label: "Level sensor", sub: "Liquicap FMI51", x: 190, y: 170, w: 120, h: 70, steps: [1] },
  { id: "6017", label: "ADAM-6017", sub: "analog in", x: 360, y: 80, w: 150, h: 85, steps: [0, 1] },
  { id: "6050", label: "ADAM-6050", sub: "digital out", x: 360, y: 230, w: 150, h: 80, steps: [0, 2] },
  { id: "ps", label: "Power supply", sub: "24 V", x: 640, y: 70, w: 220, h: 110, steps: [0, 3] },
  { id: "switch", label: "Switch", sub: "EKI-5525", x: 700, y: 240, w: 120, h: 55, steps: [0] },
  { id: "tb", label: "Terminal", sub: "block", x: 360, y: 420, w: 120, h: 70, steps: [2] },
  { id: "relay", label: "Relay", x: 600, y: 395, w: 170, h: 90, steps: [0, 2] },
  { id: "wago", label: "Wago", sub: "connectors", x: 820, y: 300, w: 160, h: 50, steps: [0, 3] },
  { id: "pumpL", label: "Pump left", x: 630, y: 520, w: 150, h: 65, steps: [0, 2, 3] },
  { id: "pumpR", label: "Pump right", x: 800, y: 520, w: 150, h: 65, steps: [0, 2, 3] },
];

const STEP_MS = 4200;

export function WiringDiagram({ label }: { label: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const el = stage.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      el.toggleAttribute("data-running", e.isIntersecting);
      window.clearInterval(timer);
      if (e.isIntersecting) timer = window.setInterval(() => setStep((v) => (v + 1) % STEPS.length), STEP_MS);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div ref={stage} role="img" aria-label={label} className={s.stage}>
      <svg viewBox="0 0 1000 680" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <text x="40" y="44" className={s.title}>
          Demo Box · wiring
        </text>
        {/* Step tabs */}
        {STEPS.map((st, i) => (
          <g key={st.title} transform={`translate(${560 + i * 105} 26)`} className={i === step ? s.tabOn : s.tab}>
            <rect width="96" height="28" rx="14" />
            <text x="48" y="19" textAnchor="middle">
              {String(i + 1).padStart(2, "0")} {st.title}
            </text>
          </g>
        ))}

        {WIRES.map((w, i) => (
          <g key={i} className={w.step === step ? s.wireOn : s.wire} data-kind={w.kind}>
            <path d={w.d} className={s.base} />
            <path d={w.d} className={s.current} />
          </g>
        ))}

        {BLOCKS.map((b) => (
          <g key={b.id} className={b.steps.includes(step) ? s.blockOn : s.block}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="8" />
            <text x={b.x + b.w / 2} y={b.y + b.h / 2 + (b.sub ? -2 : 5)} textAnchor="middle" className={s.blockLabel}>
              {b.label}
            </text>
            {b.sub && (
              <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 16} textAnchor="middle" className={s.blockSub}>
                {b.sub}
              </text>
            )}
          </g>
        ))}

        {/* What this step shows */}
        <g transform="translate(40 610)">
          <text className={s.stepNo}>{String(step + 1).padStart(2, "0")}</text>
          <text x="48" className={s.stepTitle}>
            {STEPS[step].title}
          </text>
          <text x="48" y="26" className={s.stepText}>
            {STEPS[step].text}
          </text>
        </g>
        {/* Legend */}
        <g transform="translate(40 330)" className={s.legend}>
          {(
            [
              ["plus", "+Vs"],
              ["minus", "−Vs"],
              ["signal", "Signal"],
              ["out", "Output"],
              ["gnd", "GND"],
            ] as const
          ).map(([k, t], i) => (
            <g key={k} transform={`translate(0 ${i * 24})`} data-kind={k}>
              <path d="M0 0 H34" className={s.legendLine} />
              <text x="46" y="4">
                {t}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

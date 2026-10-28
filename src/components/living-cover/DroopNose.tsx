"use client";

import { useEffect, useRef } from "react";
import s from "./DroopNose.module.css";

/**
 * Concorde gallery: the droop nose in the site's own style (paper, ink, reheat
 * orange). The nose hinges down from 0° (cruise) to 5° (take-off) and 12.5°
 * (landing) and back, carrying the pilots' line of sight with it, while the
 * readout follows and the runway rolls past. Web Animations on transform and
 * opacity only; runs while on screen, and reduced motion shows the 0° pose.
 */

const HINGE = { x: 760, y: 0 }; // nose hinge, in the plane's own coordinates (see the svg)
const STEP = 3000; // ms per angle
const ANGLES = [0, 5, 12.5];
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

export function DroopNose({ label }: { label: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const nose = useRef<SVGGElement>(null);
  const detail = useRef<SVGGElement>(null);
  const runway = useRef<SVGGElement>(null);

  useEffect(() => {
    const el = stage.current;
    if (!el || !nose.current || !detail.current || !runway.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const total = STEP * ANGLES.length;
    // Hold each angle, then swing to the next in the last 900 ms of its step.
    const frames: Keyframe[] = [];
    ANGLES.forEach((a, i) => {
      const next = ANGLES[(i + 1) % ANGLES.length];
      frames.push({ offset: (i * STEP) / total, transform: `rotate(${a}deg)`, easing: EASE });
      frames.push({ offset: (i * STEP + STEP - 900) / total, transform: `rotate(${a}deg)`, easing: EASE });
      if (i === ANGLES.length - 1) frames.push({ offset: 1, transform: `rotate(${next}deg)` });
    });
    const states = Array.from(el.querySelectorAll<HTMLElement>("[data-state]"));
    const fade = (i: number): Keyframe[] => {
      const on = (i * STEP) / total;
      const off = ((i + 1) * STEP - 700) / total;
      const k: Keyframe[] = [];
      if (i === 0) k.push({ offset: 0, opacity: 1 }, { offset: off, opacity: 1 }, { offset: off + 0.03, opacity: 0 }, { offset: 0.97, opacity: 0 }, { offset: 1, opacity: 1 });
      else k.push({ offset: 0, opacity: 0 }, { offset: on - 0.03, opacity: 0 }, { offset: on, opacity: 1 }, { offset: off, opacity: 1 }, { offset: Math.min(off + 0.03, 1), opacity: 0 }, ...(off + 0.03 < 1 ? [{ offset: 1, opacity: 0 }] : []));
      return k;
    };
    const opts = { duration: total, iterations: Infinity };
    const anims = [
      nose.current.animate(frames, opts),
      detail.current.animate(frames, opts),
      runway.current.animate([{ transform: "translateX(0)" }, { transform: "translateX(-120px)" }], { duration: 900, iterations: Infinity }),
      ...states.map((st, i) => st.animate(fade(i), opts)),
    ];
    anims.forEach((a) => a.pause());
    const io = new IntersectionObserver(([e]) => anims.forEach((a) => (e.isIntersecting ? a.play() : a.pause())));
    io.observe(el);
    return () => {
      io.disconnect();
      anims.forEach((a) => a.cancel());
    };
  }, []);

  return (
    <div ref={stage} role="img" aria-label={label} className={s.stage}>
      <div className={s.bar} aria-hidden="true">
        <span>
          <b>CONCORDE</b> <span className={s.muted}>LHR → JFK</span>
        </span>
        <span>02 / 05 &nbsp; Droop nose</span>
        <span className={s.muted}>5° take-off · 12.5° landing</span>
      </div>
      <div className={s.readout} aria-hidden="true">
        <p className={s.kicker}>Nose angle</p>
        <div className={s.states}>
          <div data-state className={s.state}>
            <span className={s.num}>0°</span>
            <span className={s.label}>Nose up · fast flight</span>
          </div>
          <div data-state className={s.state}>
            <span className={s.num}>5°</span>
            <span className={s.label}>Take-off · see past the nose</span>
          </div>
          <div data-state className={s.state}>
            <span className={s.num}>12.5°</span>
            <span className={s.label}>Landing · the runway in view</span>
          </div>
        </div>
      </div>
      <svg className={s.svg} viewBox="0 0 1000 625" aria-hidden="true">
        {/* Nose detail: the hinge up close, swinging across its three positions. */}
        <defs>
          <clipPath id="droop-detail">
            <rect x="560" y="96" width="390" height="220" />
          </clipPath>
        </defs>
        <rect x="560" y="96" width="390" height="220" fill="none" stroke="#0a0a0a" strokeWidth="2" />
        <g clipPath="url(#droop-detail)">
          <rect x="560" y="146" width="80" height="30" fill="#0a0a0a" />
          <g stroke="#a3a19b" strokeWidth="1.5" strokeDasharray="6 6" fill="none">
            <line x1="640" y1="161" x2="960" y2="161" />
            <line x1="640" y1="161" x2="959" y2="189" />
            <line x1="640" y1="161" x2="952" y2="230" />
          </g>
          <g ref={detail} style={{ transformBox: "view-box", transformOrigin: "640px 161px" }}>
            <path d="M640 146 L676 143 L930 158 L676 176 L640 176 Z" fill="#0a0a0a" />
            <line x1="640" y1="161" x2="930" y2="158" stroke="#ff4f00" strokeWidth="2.5" />
          </g>
          <circle cx="640" cy="161" r="7" fill="#f2f0eb" stroke="#ff4f00" strokeWidth="3" />
        </g>
        <g fontFamily="var(--font-mono-face), ui-monospace, monospace" fontSize="13" fill="#6b6964" letterSpacing="1">
          <text x="905" y="152">0°</text>
          <text x="905" y="196">5°</text>
          <text x="880" y="238">12.5°</text>
          <text x="574" y="300">NOSE DETAIL</text>
          <text x="600" y="198" fill="#ff4f00">HINGE</text>
        </g>
        {/* Ground and the runway rolling past. */}
        <line x1="0" y1="540" x2="1000" y2="540" stroke="#0a0a0a" strokeWidth="2" />
        <g ref={runway}>
          {Array.from({ length: 11 }, (_, i) => (
            <rect key={i} x={i * 120 + 20} y="556" width="64" height="4" fill="#d6d3cc" />
          ))}
        </g>
        {/* The plane, nose-high on its main gear (a delta wing takes off and lands nose-up). */}
        <g transform="translate(70 455) scale(0.8) rotate(-6 380 60)">
          {/* fin */}
          <path d="M40 2 L62 -128 L86 -128 C102 -84 140 -34 196 2 Z" fill="#0a0a0a" />
          {/* fuselage */}
          <path d="M0 8 C30 -2 70 -6 120 -6 L760 -6 L760 16 L120 16 C70 16 30 14 0 8 Z" fill="#0a0a0a" />
          {/* wing and engines */}
          <path d="M170 16 L640 16 C660 17 672 20 680 24 L160 30 Z" fill="#0a0a0a" />
          <path d="M210 24 L420 24 L434 44 L214 44 Z" fill="#0a0a0a" />
          {/* gear */}
          <rect x="356" y="44" width="8" height="38" fill="#0a0a0a" />
          <rect x="336" y="80" width="48" height="14" fill="#0a0a0a" />
          <rect x="700" y="16" width="6" height="52" fill="#0a0a0a" />
          <rect x="690" y="66" width="26" height="12" fill="#0a0a0a" />
          {/* The nose: hinges down around the end of the cabin, with the pilots' line of sight. */}
          <g ref={nose} style={{ transformBox: "view-box", transformOrigin: `${HINGE.x}px ${HINGE.y + 5}px` }}>
            <path d="M760 -6 L790 -8 L980 4 L790 16 L760 16 Z" fill="#0a0a0a" />
            <path d="M772 -4 L1260 -110 L1260 70 Z" fill="#ff4f00" opacity="0.16" />
            <line x1="772" y1="-4" x2="1260" y2="-20" stroke="#ff4f00" strokeWidth="2" strokeDasharray="10 8" />
            <circle cx={HINGE.x} cy={HINGE.y + 5} r="6" fill="#f2f0eb" stroke="#ff4f00" strokeWidth="3" />
          </g>
        </g>
      </svg>
    </div>
  );
}

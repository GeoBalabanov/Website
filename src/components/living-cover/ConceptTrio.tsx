"use client";

import { useEffect, useRef } from "react";
import s from "./ConceptTrio.module.css";

/**
 * Concorde gallery: the three proofs of concept for the droop nose (Figma
 * frames), side by side. Each plays its start → middle → end frames (5°, 9°,
 * 12.5°) with its own gesture on top: A scrolls, B drags the nose handle,
 * C taps "Landing". CSS animations, staggered; they only run while on screen,
 * and reduced motion shows the first frames.
 */

const CONCEPTS = [
  { key: "a", name: "A · Scroll", note: "Zero learning, but easy to scroll past." },
  { key: "b", name: "B · Drag", note: "The most memorable, needs precision." },
  { key: "c", name: "C · Tap", note: "The clearest, and the most accessible." },
] as const;

const Hand = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4.5a6.5 6.5 0 0 1-6.5 6.5h-.7a6 6 0 0 1-4.6-2.2L4.3 15a1.6 1.6 0 0 1 2.4-2.1L9 15"
      fill="#fff"
      stroke="#0a0a0a"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function ConceptTrio({ label }: { label: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => el.toggleAttribute("data-on", e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={root} role="img" aria-label={label} className={s.root}>
      <p className={s.kicker} aria-hidden="true">
        Three proofs of concept · the droop nose, 5° → 12.5°
      </p>
      <div className={s.row} aria-hidden="true">
        {CONCEPTS.map((c, i) => (
          <div key={c.key}>
            <div className={s.tile} style={{ "--t": "6s", "--d": `${i * 0.45}s` } as React.CSSProperties}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/projects/concorde-concept-${c.key}1.jpg`} alt="" className={`${s.frame} ${s.f1}`} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/projects/concorde-concept-${c.key}2.jpg`} alt="" className={`${s.frame} ${s.f2}`} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/projects/concorde-concept-${c.key}3.jpg`} alt="" className={`${s.frame} ${s.f3}`} />
              {c.key === "a" && <span className={s.mouse} />}
              {c.key === "b" && (
                <div className={`${s.layer} ${s.drag}`}>
                  <Hand className={s.hand} />
                </div>
              )}
              {c.key === "c" && (
                <div className={`${s.layer} ${s.tap}`}>
                  <span className={s.ripple} />
                  <Hand className={s.finger} />
                </div>
              )}
            </div>
            <p className={s.label}>
              <b>{c.name}</b>
              <span>{c.note}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

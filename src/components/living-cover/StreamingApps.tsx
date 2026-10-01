"use client";

import { useEffect, useRef } from "react";
import s from "./StreamingApps.module.css";

/**
 * Corsa gallery piece (vertical, 9:16): the three apps Corsa plays from (Spotify, Apple Music,
 * YouTube Music) glowing on a grainy dark ground, while the camera slowly pulls
 * focus from one to the next. Plays only while on screen; reduced motion shows
 * the first frame.
 */

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

const APPS: { name: string; x: string; y: string; glow: string; vars: Record<string, string>; icon: React.ReactNode }[] = [
  {
    name: "Spotify",
    x: "36%",
    y: "27%",
    glow: "rgba(46, 204, 113, 0.9)",
    vars: { "--focus-delay": "0s", "--float": "8s", "--delay": "-3s", "--tilt-a": "-6deg", "--tilt-b": "2deg" },
    icon: (
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="48" fill="#5dbb7c" />
        <g fill="none" stroke="#1d2418" strokeLinecap="round">
          <path d="M23 38 C41 31 62 32 79 41" strokeWidth="8" />
          <path d="M27 53 C42 47 59 48 72 55" strokeWidth="6.5" />
          <path d="M30 66 C42 62 55 62 66 68" strokeWidth="5.5" />
        </g>
      </svg>
    ),
  },
  {
    name: "Apple Music",
    x: "64%",
    y: "50%",
    glow: "rgba(250, 60, 90, 0.9)",
    vars: { "--focus-delay": "-6s", "--float": "10s", "--delay": "-1s", "--tilt-a": "3deg", "--tilt-b": "-3deg" },
    icon: (
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id="corsa-am" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f5607a" />
            <stop offset="1" stopColor="#e03550" />
          </linearGradient>
        </defs>
        <rect x="3" y="3" width="94" height="94" rx="24" fill="url(#corsa-am)" />
        {/* Two beamed notes. */}
        <path d="M42 30 L70 24 L70 62" fill="none" stroke="#fff5f2" strokeWidth="6" strokeLinejoin="round" />
        <path d="M42 30 L42 70" fill="none" stroke="#fff5f2" strokeWidth="6" />
        <ellipse cx="35" cy="71" rx="9" ry="7.5" fill="#fff5f2" />
        <ellipse cx="63" cy="63" rx="9" ry="7.5" fill="#fff5f2" />
      </svg>
    ),
  },
  {
    name: "YouTube Music",
    x: "37%",
    y: "73%",
    glow: "rgba(255, 50, 40, 0.9)",
    vars: { "--focus-delay": "-3s", "--float": "9s", "--delay": "-5s", "--tilt-a": "-2deg", "--tilt-b": "5deg" },
    icon: (
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="48" fill="#e8372c" />
        <circle cx="50" cy="50" r="25" fill="none" stroke="#fff3ee" strokeWidth="4.5" />
        <path d="M44 39 L62 50 L44 61 Z" fill="#fff3ee" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function StreamingApps({ label }: { label: string }) {
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => el.toggleAttribute("data-running", e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={stage} role="img" aria-label={label} className={s.stage}>
      {APPS.map((app) => (
        <div key={app.name} className={s.app} style={{ left: app.x, top: app.y, ...app.vars } as Vars}>
          <div className={s.glow} style={{ "--glow": app.glow } as Vars} />
          <div className={s.icon}>{app.icon}</div>
        </div>
      ))}
      <div className={s.vignette} />
      <div className={s.grain} />
    </div>
  );
}

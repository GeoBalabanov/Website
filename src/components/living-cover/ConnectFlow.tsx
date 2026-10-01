"use client";

import { useEffect, useRef, useState } from "react";
import s from "./ConnectFlow.module.css";

/**
 * Corsa gallery piece (vertical): the onboarding where you connect Spotify,
 * Apple Music and YouTube Music, playing itself. On each screen the profile
 * link types itself in, a fingertip taps Continue and the next app slides in.
 * Runs only while on screen; reduced motion shows the first screen, filled in.
 */

type Vars = React.CSSProperties & Record<`--${string}`, string>;

const APPS = [
  {
    name: "Spotify",
    color: "#1ed760",
    light: { "--c1": "rgba(40, 200, 60, 0.85)", "--c2": "rgba(20, 110, 30, 0.6)", "--c3": "rgba(30, 160, 60, 0.35)" },
    link: "https://open.spotify.com/user/georgi.b",
    icon: (
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="48" fill="#1ed760" />
        <g fill="none" stroke="#0d0d0f" strokeLinecap="round">
          <path d="M23 38 C41 31 62 32 79 41" strokeWidth="8" />
          <path d="M27 53 C42 47 59 48 72 55" strokeWidth="6.5" />
          <path d="M30 66 C42 62 55 62 66 68" strokeWidth="5.5" />
        </g>
      </svg>
    ),
  },
  {
    name: "Apple Music",
    color: "#fa3c5f",
    light: { "--c1": "rgba(170, 30, 100, 0.75)", "--c2": "rgba(250, 60, 110, 0.55)", "--c3": "rgba(200, 40, 130, 0.6)" },
    link: "https://music.apple.com/profile/georgi",
    icon: (
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <rect x="3" y="3" width="94" height="94" rx="24" fill="#fa3c5f" />
        <path d="M42 30 L70 24 L70 62" fill="none" stroke="#fff" strokeWidth="6" strokeLinejoin="round" />
        <path d="M42 30 L42 70" fill="none" stroke="#fff" strokeWidth="6" />
        <ellipse cx="35" cy="71" rx="9" ry="7.5" fill="#fff" />
        <ellipse cx="63" cy="63" rx="9" ry="7.5" fill="#fff" />
      </svg>
    ),
  },
  {
    name: "YouTube Music",
    color: "#ff2a1f",
    light: { "--c1": "rgba(210, 20, 15, 0.8)", "--c2": "rgba(255, 90, 20, 0.5)", "--c3": "rgba(170, 10, 10, 0.75)" },
    link: "https://music.youtube.com/channel/georgi",
    icon: (
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="48" fill="#ff2a1f" />
        <circle cx="50" cy="50" r="25" fill="none" stroke="#fff" strokeWidth="5" />
        <path d="M44 39 L62 50 L44 61 Z" fill="#fff" strokeLinejoin="round" />
      </svg>
    ),
  },
];

// One screen's timeline (ms): type the link, move the finger to Continue, tap, slide on.
const SCREEN = 4600;
const TYPE_FROM = 500;
const TYPE_TO = 2000;
const FINGER_IN = 2300;
const PRESS = 3100;
const RELEASE = 3350;
const NEXT = 3700;
const TICK = 50;

export function ConnectFlow({ label }: { label: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const [t, setT] = useState(0);
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
      if (e.isIntersecting) timer = window.setInterval(() => setT((v) => (v + TICK) % (SCREEN * APPS.length)), TICK);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  const time = reduced ? TYPE_TO : t;
  const step = Math.floor(time / SCREEN);
  const local = time % SCREEN;
  // Slide to the next screen near the end of this one (the last wraps back to the first).
  const shown = local >= NEXT && !reduced ? (step + 1) % APPS.length : step;
  const typed = Math.max(0, Math.min(1, (local - TYPE_FROM) / (TYPE_TO - TYPE_FROM)));
  const pressed = local >= PRESS && local < RELEASE;
  const finger = local >= FINGER_IN && local < NEXT && !reduced;

  return (
    <div ref={stage} role="img" aria-label={label} className={s.stage}>
      <div className={s.track} style={{ transform: `translateX(-${shown * 100}%)` }}>
        {APPS.map((app, i) => {
          const current = i === step;
          // Screens already passed keep their link; the next one starts empty.
          const chars = current ? Math.round(typed * app.link.length) : i < step ? app.link.length : 0;
          return (
            <div key={app.name} className={s.screen} aria-hidden="true">
              <div className={s.light} style={app.light as Vars} />
              <div className={s.content}>
                <div className={s.steps}>
                  {APPS.map((a, j) => (
                    <div key={a.name}>
                      <div className={s.bar} style={j === i ? { background: a.color } : undefined} />
                      {a.name}
                    </div>
                  ))}
                </div>
                <div className={s.icon}>{app.icon}</div>
                <p className={s.title}>
                  Enter your <span style={{ color: app.color }}>{app.name}</span> profile link
                </p>
                <div className={s.input}>
                  {chars > 0 ? (
                    <span>
                      {app.link.slice(0, chars)}
                      {current && <span className={s.caret} />}
                    </span>
                  ) : (
                    <span className={s.placeholder}>Paste your profile link</span>
                  )}
                </div>
                <p className={s.open} style={{ color: app.color }}>
                  Open {app.name}
                </p>
                <div className={s.help}>
                  <strong>Finding the right {app.name} link:</strong>
                  <ul>
                    <li>Visit your profile on {app.name}</li>
                    <li>Tap &lsquo;…&rsquo; and then the share icon</li>
                    <li>Choose &lsquo;Copy Link&rsquo;</li>
                    <li>Paste the link in the field above</li>
                  </ul>
                </div>
                <div className={s.bottom}>
                  <div className={s.continue} data-pressed={current && pressed ? "" : undefined}>
                    Continue
                  </div>
                  <p className={s.skip}>Skip, my music isn&rsquo;t on {app.name}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* The fingertip: rests near the field, then glides to Continue and taps. */}
      <div
        aria-hidden="true"
        className={s.touch}
        data-pressed={pressed ? "" : undefined}
        style={{
          left: local >= FINGER_IN + 200 ? "50%" : "72%",
          top: local >= FINGER_IN + 200 ? "80.5%" : "58%",
          opacity: finger ? 1 : 0,
        }}
      />
    </div>
  );
}

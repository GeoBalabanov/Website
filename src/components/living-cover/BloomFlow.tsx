"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Flower, PALETTES, type Palette } from "./BloomFlower";
import s from "./BloomFlow.module.css";

/**
 * Bloom gallery piece (vertical): the feedback app playing itself. Scan an
 * installation, pick how it made you feel (the bud opens to match), plant it,
 * watch it join the garden, then visit My Gardens and start again. Each loop
 * picks a different answer: full bloom, half open, then at rest. The flowers
 * sway and turn slowly throughout. Runs only on screen; reduced motion shows
 * the home screen.
 */

type Vars = React.CSSProperties & Record<`--${string}`, string>;

const LOOP = 19500;
const TICK = 50;
// When each screen takes over (ms into a loop).
const SCREENS = [0, 2700, 7600, 10200, 15100, 19200];
// Where the fingertip goes, when, and when it presses.
const TAPS = [
  { from: 1300, to: 2700, press: 2150, target: "scan" },
  { from: 3900, to: 5300, press: 4750, target: "opt" },
  { from: 5900, to: 7500, press: 6950, target: "plant" },
  { from: 8700, to: 10100, press: 9550, target: "see-garden" },
  { from: 13600, to: 15000, press: 14450, target: "garden-back" },
  { from: 17600, to: 19100, press: 18550, target: "nav-scan" },
];
const PRESS = 250;
const CHOSEN = 4800;
const NEW_FLOWER = 10700;

const CHOICES = [
  { label: "Loved it", result: "A full bloom for you", palette: PALETTES.full, open: 1, pick: "#8b5cf6", stat: 0 },
  { label: "It was okay", result: "Something stirred inside", palette: PALETTES.half, open: 0.62, pick: "#10b981", stat: 1 },
  { label: "Not for me", result: "A quiet bud stays closed", palette: PALETTES.rest, open: 0.9, pick: "#9ca3af", stat: 3 },
];

// The garden: deterministic spots (x, y in %, size in cqw), colours and states.
const GARDEN: { x: number; y: number; w: number; p: Palette; open: number }[] = [
  [12, 52, 9, "full"], [27, 38, 8, "sea"], [46, 46, 11, "lilac"], [70, 40, 8, "sea"], [86, 54, 10, "full"],
  [20, 70, 10, "sky"], [38, 62, 9, "half"], [58, 66, 12, "sun"], [78, 72, 11, "sea"], [9, 88, 8, "full"],
  [30, 90, 11, "sky"], [50, 84, 8, "sea"], [66, 92, 10, "lilac"], [88, 90, 9, "sea"], [43, 100, 9, "sun"],
  [60, 50, 7, "rest"], [75, 58, 7, "rest"], [17, 36, 6, "bud"], [92, 70, 6, "bud"], [24, 104, 7, "bud"],
  [79, 104, 7, "full"], [55, 104, 6, "bud"], [5, 70, 6, "bud"],
].map(([x, y, w, k]) => {
  const key = k as string;
  const p = key === "bud" ? PALETTES.lilac : PALETTES[key as keyof typeof PALETTES];
  return { x: x as number, y: y as number, w: w as number, p, open: key === "bud" ? 0 : key === "half" ? 0.6 : 1 };
});

const GARDENS = [
  { n: "#14", name: "Radiant Canopy", tag: "Full bloom", tone: "#a78bfa", when: "Tonight · 21:43", count: 23, p: PALETTES.sun, ground: "#7c3aed" },
  { n: "#07", name: "Mirror Lagoon", tag: "Half open", tone: "#34d399", when: "Tonight · 20:11", count: 41, p: PALETTES.sky, ground: "#059669" },
  { n: "#02", name: "Ember Drift", tag: "Full bloom", tone: "#a78bfa", when: "Tonight · 19:28", count: 67, p: PALETTES.full, ground: "#d97706" },
  { n: "#19", name: "Veil of Sparks", tag: "At rest", tone: "#6b7280", when: "Yesterday · 22:05", count: 18, p: PALETTES.rest, ground: "#334155" },
  { n: "#11", name: "Lunar Thread", tag: "Half open", tone: "#34d399", when: "Yesterday · 20:50", count: 52, p: PALETTES.sea, ground: "#475569" },
];
const THUMB = [PALETTES.sun, PALETTES.full, PALETTES.sea, PALETTES.lilac, PALETTES.sky, PALETTES.full, PALETTES.sea];

const STARS = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  top: `${(i * 53 + 7) % 100}%`,
  "--t": `${3 + (i % 4)}s`,
  "--d": `${-(i % 5) * 0.7}s`,
}));

export function BloomFlow({ label }: { label: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const [t, setT] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [finger, setFinger] = useState({ x: 50, y: 70 });

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    // Motion preference is only known in the browser.
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      el.toggleAttribute("data-running", e.isIntersecting);
      window.clearInterval(timer);
      if (e.isIntersecting) timer = window.setInterval(() => setT((v) => (v + TICK) % (LOOP * CHOICES.length)), TICK);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, []);

  const time = reduced ? 0 : t;
  const k = Math.floor(time / LOOP) % CHOICES.length;
  const local = time % LOOP;
  const choice = CHOICES[k];
  const screen = SCREENS.findLastIndex((at) => local >= at) % 5;
  const tap = TAPS.find((x) => local >= x.from && local < x.to);
  const target = tap ? (tap.target === "opt" ? `opt-${k}` : tap.target) : null;
  const pressed = !!tap && local >= tap.press && local < tap.press + PRESS;
  const chosen = local >= CHOSEN;
  const grown = local >= NEW_FLOWER;

  // Aim the fingertip at the element it's about to tap.
  useLayoutEffect(() => {
    const el = stage.current;
    const node = target && el?.querySelector<HTMLElement>(`[data-tap="${target}"]`);
    if (!el || !node) return;
    const r = el.getBoundingClientRect();
    const b = node.getBoundingClientRect();
    // Measuring the layout is the point of this effect.
    setFinger({ x: ((b.left + b.width / 2 - r.left) / r.width) * 100, y: ((b.top + b.height / 2 - r.top) / r.height) * 100 });
  }, [target]);

  const press = (name: string) => (target === name && pressed ? s.pressed : "");
  const stats = [12, 5, 4, 2].map((v, i) => v + (grown && i === choice.stat ? 1 : 0));

  return (
    <div ref={stage} role="img" aria-label={label} className={s.stage}>
      {STARS.map((st, i) => (
        <span key={i} className={s.star} style={st as Vars} />
      ))}

      {/* 1 · Home */}
      <div className={s.screen} data-on={screen === 0 ? "" : undefined} aria-hidden="true">
        <div className={`${s.pill} ${s.caps}`}>
          <span className={s.dot} />
          Museum exhibitions
        </div>
        <p className={`${s.serif} ${s.center}`} style={{ fontSize: "15cqw", marginTop: "5cqw", lineHeight: 1 }}>
          Bloom
        </p>
        <p className={`${s.center} ${s.muted}`} style={{ marginTop: "3cqw", fontSize: "3.6cqw" }}>
          Plant your reaction
          <br />
          to what you just saw.
        </p>
        <div className={s.flowerArea}>
          <Flower palette={PALETTES.sea} sway={5} style={{ height: "70%" }} />
        </div>
        <div data-tap="scan" className={`${s.button} ${press("scan")}`}>
          ⌗&nbsp; Scan installation
        </div>
        <p className={`${s.center} ${s.muted}`} style={{ marginTop: "2.6cqw", fontSize: "2.6cqw" }}>
          Point your camera at the installation QR code
        </p>
        <div className={s.nav}>
          <div className={s.navOn}>Scan</div>
          <div>My Gardens</div>
        </div>
      </div>

      {/* 2 · How did it make you feel? */}
      <div className={s.screen} data-on={screen === 1 ? "" : undefined} aria-hidden="true">
        <Header kicker="Installation #14" title="Radiant Canopy" />
        <div className={s.flowerArea}>
          <Flower palette={chosen ? choice.palette : PALETTES.full} open={chosen ? choice.open : 0} sway={6} />
        </div>
        <p className={`${s.center} ${chosen ? "" : s.muted}`} style={{ fontSize: "3.2cqw", marginBottom: "1.5cqw" }}>
          {chosen ? choice.result : "How did this make you feel?"}
        </p>
        {CHOICES.map((c, i) => (
          <div
            key={c.label}
            data-tap={`opt-${i}`}
            className={`${s.option} ${press(`opt-${i}`)}`}
            data-picked={chosen && i === k ? "" : undefined}
            style={{ "--pick": choice.pick } as Vars}
          >
            <i />
            {c.label}
          </div>
        ))}
        <div data-tap="plant" className={`${s.button} ${press("plant")}`} data-off={chosen ? undefined : ""} style={{ marginTop: "3.6cqw" }}>
          Plant my flower
        </div>
      </div>

      {/* 3 · Planted */}
      <div className={s.screen} data-on={screen === 2 ? "" : undefined} aria-hidden="true">
        <div className={s.flowerArea}>
          {screen === 2 && <Flower palette={choice.palette} open={choice.open} sway={6} className={s.grow} />}
        </div>
        <p className={`${s.serif} ${s.center}`} style={{ fontSize: "8.4cqw", lineHeight: 1.08 }}>
          Your flower
          <br />
          has been planted.
        </p>
        <p className={`${s.center} ${s.muted}`} style={{ marginTop: "3cqw", fontSize: "3.3cqw" }}>
          It has joined the garden
          <br />
          of everyone who stood here.
        </p>
        <div data-tap="see-garden" className={`${s.button} ${press("see-garden")}`} style={{ margin: "6cqw 5cqw 0" }}>
          See the full garden
        </div>
        <p className={`${s.center} ${s.muted}`} style={{ marginTop: "3cqw", marginBottom: "10cqw", fontSize: "3cqw" }}>
          Back to scan
        </p>
      </div>

      {/* 4 · The garden */}
      <div className={s.screen} data-on={screen === 3 ? "" : undefined} aria-hidden="true">
        <div className={s.header} style={{ alignItems: "flex-start" }}>
          <div data-tap="garden-back" className={`${s.back} ${press("garden-back")}`}>
            ←
          </div>
          <div>
            <p className={`${s.caps} ${s.muted}`} style={{ marginTop: "1.6cqw" }}>
              Radiant Canopy
            </p>
            <p className={s.serif} style={{ fontSize: "8cqw", lineHeight: 1.1, marginTop: "1cqw" }}>
              The Garden
            </p>
            <p className={s.muted} style={{ fontSize: "3cqw" }}>
              {grown ? 24 : 23} flowers planted tonight
            </p>
          </div>
        </div>
        <div className={s.field}>
          {GARDEN.map((f, i) => (
            <Flower
              key={i}
              palette={f.p}
              open={f.open}
              sway={5 + (i % 4)}
              delay={i * 0.9}
              style={{ left: `${f.x}%`, top: `${f.y * 0.82}%`, width: `${f.w}cqw` }}
            />
          ))}
          {screen === 3 && grown && (
            <Flower palette={choice.palette} open={choice.open} sway={6} className={s.grow} style={{ left: "52%", top: "44%", width: "12cqw" }} />
          )}
        </div>
        <div className={s.stats}>
          <p className={s.caps} style={{ gridColumn: "1 / -1", textAlign: "left", marginBottom: "2.4cqw", color: "rgba(225,225,245,0.55)" }}>
            This garden
          </p>
          {["Full bloom", "Half open", "Budding", "At rest"].map((name, i) => (
            <div key={name}>
              <b className={s.serif} style={{ color: ["#a78bfa", "#34d399", "#fbbf24", "#6b7280"][i] }}>
                {stats[i]}
              </b>
              <span>{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5 · My Gardens */}
      <div className={s.screen} data-on={screen === 4 ? "" : undefined} aria-hidden="true">
        <p className={`${s.caps} ${s.muted}`}>Museum exhibitions</p>
        <p className={s.serif} style={{ fontSize: "9.5cqw", lineHeight: 1.1, marginTop: "1cqw" }}>
          My Gardens
        </p>
        <p className={s.muted} style={{ fontSize: "3cqw", marginBottom: "1cqw" }}>
          5 installations visited
        </p>
        {GARDENS.map((g, i) => (
          <div key={g.n} className={s.card} style={{ transitionDelay: `${screen === 4 ? i * 90 : 0}ms` }}>
            <div className={s.thumb} style={{ background: `radial-gradient(70% 45% at 50% 100%, ${g.ground}66, #0d0d1c 70%)` }}>
              {THUMB.map((p, j) => (
                <Flower
                  key={j}
                  palette={g.tag === "At rest" && j % 2 ? PALETTES.rest : p}
                  sway={4 + (j % 3)}
                  delay={j + i}
                  glow={false}
                  style={{ left: `${j * 14 - 2}%`, top: `${(j % 2) * 10 - 4}%` }}
                />
              ))}
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingTop: "1cqw" }}>
              <p className={s.muted} style={{ fontSize: "2.4cqw" }}>
                {g.n}
              </p>
              <p className={s.serif} style={{ fontSize: "3.8cqw", lineHeight: 1.1 }}>
                {g.name}
              </p>
              <span className={s.tag} style={{ color: g.tone, background: `${g.tone}22`, border: `0.2cqw solid ${g.tone}44` }}>
                {g.tag}
              </span>
            </div>
            <div className={s.muted} style={{ textAlign: "right", fontSize: "2.1cqw", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "0.5cqw 1cqw" }}>
              <Flower palette={g.p} sway={5} delay={i} glow={false} style={{ width: "5cqw", alignSelf: "flex-end" }} />
              <span>
                {g.when}
                <br />
                {g.count} flowers
              </span>
            </div>
          </div>
        ))}
        <div className={s.nav} style={{ marginTop: "auto" }}>
          <div data-tap="nav-scan" className={press("nav-scan")}>
            Scan
          </div>
          <div className={s.navOnGreen}>My Gardens</div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className={s.touch}
        data-pressed={pressed ? "" : undefined}
        style={{ left: `${finger.x}%`, top: `${finger.y}%`, opacity: tap && !reduced ? 1 : 0 }}
      />
    </div>
  );
}

function Header({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className={s.header}>
      <div className={s.back}>←</div>
      <div>
        <p className={`${s.caps} ${s.muted}`}>{kicker}</p>
        <p className={s.serif} style={{ fontSize: "4.8cqw", lineHeight: 1.2 }}>
          {title}
        </p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import s from "./SiteTour.module.css";

/**
 * Plovdiv gallery: a walk through plovdiv.run in a browser window. A cursor
 * clicks through the site's menu and the page scrolls to each section, built
 * from screenshots stitched into one long page (plovdiv-run-site.webp, 1000 px
 * wide) with the sticky menu laid over it. Web Animations on transform only;
 * runs while on screen, and reduced motion shows the top of the page.
 */

const PAGE_H = 6303; // stitched page height (px at 1000 wide)
const VIEW_H = 560; // visible page height under the browser bar
const NAV_H = 55; // sticky menu height
const STEP = 2800; // ms per stop

type Pt = [number, number]; // x, y in page-viewport px (1000 × 560)

// Menu items, in the same viewport px.
const NAV: Record<string, Pt> = {
  distances: [282, 27],
  programme: [353, 27],
  course: [418, 27],
  prices: [471, 27],
  plovdiv: [525, 27],
  updates: [596, 27],
};

// Each stop: where the section starts in the page, the menu item clicked to get there (if any) and where the cursor rests.
const STOPS: { top: number; nav?: keyof typeof NAV; rest: Pt }[] = [
  { top: 0, rest: [118, 445] },
  { top: 542, rest: [640, 200] },
  { top: 1030, nav: "distances", rest: [166, 189] },
  { top: 1440, nav: "programme", rest: [300, 400] },
  { top: 2070, nav: "course", rest: [700, 300] },
  { top: 2556, rest: [650, 200] },
  { top: 2826, nav: "prices", rest: [140, 420] },
  { top: 3310, rest: [500, 250] },
  { top: 3702, rest: [300, 400] },
  { top: 4104, nav: "plovdiv", rest: [270, 350] },
  { top: 4592, rest: [720, 300] },
  { top: 4957, rest: [500, 200] },
  { top: 5447, rest: [500, 300] },
  { top: 5817, nav: "updates", rest: [420, 455] },
];

const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
const scrollOf = (top: number) => Math.min(Math.max(top === 0 ? 0 : top - NAV_H, 0), PAGE_H - VIEW_H);
const pageY = (top: number) => `translateY(${(-scrollOf(top) / PAGE_H) * 100}%)`;
const at = ([x, y]: Pt) => `translate(${(x / 1000) * 100}%, ${(y / VIEW_H) * 100}%)`;

function timeline() {
  const back = 1600; // scroll back to the top at the end of the loop
  const total = STOPS.length * STEP + back;
  const page: Keyframe[] = [];
  const cursor: Keyframe[] = [];
  const click: Keyframe[] = [];
  const o = (ms: number) => Math.min(ms / total, 1);

  let prev = STOPS[0];
  page.push({ offset: 0, transform: pageY(0), easing: EASE });
  cursor.push({ offset: 0, transform: at(STOPS[0].rest), easing: EASE });
  click.push({ offset: 0, transform: "scale(1)" });

  STOPS.forEach((stop, i) => {
    if (i === 0) return;
    const t = i * STEP;
    const scrollAt = stop.nav ? t + 900 : t + 500;
    page.push({ offset: o(scrollAt), transform: pageY(prev.top), easing: EASE });
    page.push({ offset: o(scrollAt + 800), transform: pageY(stop.top), easing: EASE });
    cursor.push({ offset: o(t), transform: at(prev.rest), easing: EASE });
    if (stop.nav) {
      const n = NAV[stop.nav];
      cursor.push({ offset: o(t + 600), transform: at(n), easing: EASE });
      cursor.push({ offset: o(t + 850), transform: at(n), easing: EASE });
      click.push({ offset: o(t + 640), transform: "scale(1)" });
      click.push({ offset: o(t + 720), transform: "scale(0.82)" });
      click.push({ offset: o(t + 820), transform: "scale(1)" });
    }
    cursor.push({ offset: o(scrollAt + 1000), transform: at(stop.rest), easing: EASE });
    prev = stop;
  });

  const end = STOPS.length * STEP;
  page.push({ offset: o(end), transform: pageY(prev.top), easing: EASE });
  page.push({ offset: 1, transform: pageY(0) });
  cursor.push({ offset: o(end), transform: at(prev.rest), easing: EASE });
  cursor.push({ offset: 1, transform: at(STOPS[0].rest) });
  click.push({ offset: 1, transform: "scale(1)" });
  return { total, page, cursor, click };
}

export function SiteTour({ label, url }: { label: string; url: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLImageElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const hand = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stage.current;
    if (!el || !page.current || !cursor.current || !hand.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = timeline();
    const opts = { duration: t.total, iterations: Infinity };
    const anims = [page.current.animate(t.page, opts), cursor.current.animate(t.cursor, opts), hand.current.animate(t.click, opts)];
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
      <div className={s.window}>
        <div className={s.bar} aria-hidden="true">
          <span className={s.dots}>
            <i />
            <i />
            <i />
          </span>
          <span className={s.url}>{url}</span>
        </div>
        <div className={s.view} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={page} src="/projects/plovdiv-run-site.webp" alt="" className={s.page} draggable={false} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/projects/plovdiv-run-nav.webp" alt="" className={s.nav} draggable={false} />
          <div ref={cursor} className={s.cursorLayer}>
            <div ref={hand} className={s.cursor}>
              <svg viewBox="0 0 24 24" width="100%" height="100%">
                <path d="M4 2 L4 19 L8.5 15 L11.5 22 L14.5 20.6 L11.6 13.8 L17.5 13.8 Z" fill="#fff" stroke="#111" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

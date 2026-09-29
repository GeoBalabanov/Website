"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import type { Project } from "@/data/projects";
import { prefersReducedMotion } from "@/lib/motion";
import { ProjectImage } from "./ProjectImage";
import { OpenProjectLink } from "./transition/OpenProjectLink";
import { LivingCover } from "./living-cover/LivingCover";
import { SliderStrip } from "./slider-strip";

const MINOR_TICKS = 5;
// Continuous scrolling (WebGL strip): the covers follow the wheel or finger and settle on the nearest project.
const WHEEL_PX = 320; // wheel distance that moves one project
const SNAP_DELAY = 140; // ms without wheel input before settling
const SNAP_BIAS = 0.15; // how far past a cover already counts as "on to the next one"
const FOLLOW = 0.12; // how quickly the strip catches up with the input (per 60 fps frame)
const FLING = 0.3; // seconds of finger speed carried on after release
const OVERSCROLL = 0.3;
// Fallback (no WebGL or reduced motion): one project per gesture.
const WHEEL_THRESHOLD = 30;
const WHEEL_COOLDOWN = 450;
const SWIPE_THRESHOLD = 40;

type Props = { projects: Project[] };

export function ProjectSlider({ projects }: Props) {
  const [index, setIndex] = useState(0);
  const count = projects.length;

  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const caption = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const shown = useRef(0);
  const indexNow = useRef(0);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  // Set when the index comes from the URL: show that project immediately, no transition.
  const jump = useRef(false);
  // WebGL strip for the bending scroll. `null` until its textures are loaded.
  const canvas = useRef<HTMLCanvasElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const strip = useRef<SliderStrip | null>(null);
  // Scroll state in slides: `pos` is what is drawn, `target` is where the input wants to be.
  const motion = useRef({ pos: 0, target: 0, vel: 0, running: false, dragging: false, frameW: 0 });
  const kick = useRef<() => void>(() => {});
  const goTo = useRef<(i: number) => void>(() => {});

  useEffect(() => {
    indexNow.current = index;
  }, [index]);

  // Set up the strip once; if WebGL or any cover fails, the CSS transition is used instead.
  useEffect(() => {
    const cv = canvas.current;
    if (!cv || prefersReducedMotion()) return;
    const s = SliderStrip.create(cv);
    if (!s) return;
    let alive = true;
    const m = motion.current;

    const tick = (_time: number, deltaMs: number) => {
      const dt = Math.min(Math.max(deltaMs, 1), 50) / 1000;
      const prev = m.pos;
      m.pos += (m.target - m.pos) * (1 - Math.pow(1 - FOLLOW, dt * 60));
      if (Math.abs(m.target - m.pos) < 0.0005) m.pos = m.target;
      // Smoothed speed (slides per second) drives the bend, eased so it never snaps.
      m.vel += ((m.pos - prev) / dt - m.vel) * Math.min(1, dt * 10);
      s.render(m.pos, Math.tanh(m.vel / 3), m.frameW);

      const nearest = Math.max(0, Math.min(count - 1, Math.round(m.pos)));
      if (nearest !== indexNow.current) {
        indexNow.current = nearest;
        setIndex(nearest);
      }
      // At rest on a cover: hand back to the DOM cover (with its living animation).
      if (!m.dragging && m.pos === m.target && Number.isInteger(m.target) && Math.abs(m.vel) < 0.02) {
        gsap.ticker.remove(tick);
        m.running = false;
        m.vel = 0;
        if (frame.current) gsap.set(frame.current, { opacity: 1 });
        gsap.to(cv, { opacity: 0, duration: 0.15, onComplete: () => void (m.running || s.clear()) });
      }
    };

    kick.current = () => {
      if (strip.current !== s || m.running) return;
      m.running = true;
      s.resize();
      m.frameW = frame.current?.getBoundingClientRect().width ?? 0;
      s.render(m.pos, 0, m.frameW);
      gsap.killTweensOf(cv);
      gsap.set(cv, { opacity: 1 });
      if (frame.current) gsap.set(frame.current, { opacity: 0 });
      gsap.ticker.add(tick);
    };

    s.load(projects.map((p) => p.images[0].src)).then((ok) => {
      if (!alive || !ok) return;
      strip.current = s;
    });
    const onResize = () => s.resize();
    window.addEventListener("resize", onResize);
    return () => {
      alive = false;
      gsap.ticker.remove(tick);
      m.running = false;
      kick.current = () => {};
      window.removeEventListener("resize", onResize);
      strip.current = null;
      s.destroy();
    };
  }, [projects, count]);

  // Deep link: /#slug opens that project.
  useEffect(() => {
    const slug = decodeURIComponent(window.location.hash.slice(1));
    const found = projects.findIndex((p) => p.slug === slug);
    if (found > 0) {
      jump.current = true;
      motion.current.pos = motion.current.target = found;
      // The hash only exists in the browser, so it has to be read after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIndex(found);
    }
  }, [projects]);

  // Keep the URL in sync so the current project can be shared.
  useEffect(() => {
    const url = index === 0 ? window.location.pathname : `#${projects[index].slug}`;
    window.history.replaceState(window.history.state, "", url);
  }, [index, projects]);

  // Swap the visible cover whenever the index changes.
  useLayoutEffect(() => {
    const from = shown.current;
    if (from === index) return;
    shown.current = index;

    timeline.current?.progress(1).kill();
    const fromEl = layers.current[from];
    const toEl = layers.current[index];
    if (!fromEl || !toEl) return;
    const fromImg = fromEl.firstElementChild;
    const toImg = toEl.firstElementChild;
    const dir = index > from ? 1 : -1;
    const instant = jump.current;
    jump.current = false;

    const captionIn = () => {
      if (!caption.current) return;
      gsap.fromTo(
        caption.current.querySelectorAll("[data-line]"),
        { yPercent: 110 * dir },
        { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.05, delay: 0.1, overwrite: true },
      );
    };

    // Reduced motion, deep links, and the WebGL strip (which draws the movement itself): swap instantly.
    // Keep the scroll position in step when the index changed without the strip (deep link, fallback).
    if (!motion.current.running) motion.current.pos = motion.current.target = index;
    if (prefersReducedMotion() || instant || motion.current.running) {
      gsap.set(fromEl, { autoAlpha: 0, zIndex: 0 });
      gsap.set(toEl, { autoAlpha: 1, zIndex: 1, clipPath: "inset(0% 0% 0% 0%)" });
      if (motion.current.running) captionIn();
      return;
    }

    // Fallback without WebGL: a clip-path wipe.
    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        gsap.set(fromEl, { autoAlpha: 0, zIndex: 0 });
        gsap.set(fromImg, { clearProps: "transform" });
      },
    });
    gsap.set(fromEl, { zIndex: 1 });
    gsap.set(toEl, {
      zIndex: 2,
      autoAlpha: 1,
      clipPath: dir > 0 ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
    });
    tl.to(toEl, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8 }, 0)
      .fromTo(toImg, { scale: 1.12, yPercent: 6 * dir }, { scale: 1, yPercent: 0, duration: 1, ease: "power3.out" }, 0)
      .to(fromImg, { yPercent: -8 * dir, scale: 1.04, duration: 0.8 }, 0);

    captionIn();
    timeline.current = tl;
  }, [index]);

  // Wheel, swipe and keyboard navigation.
  useEffect(() => {
    const m = motion.current;
    const clampIndex = (i: number) => Math.max(0, Math.min(count - 1, i));
    const clampScroll = (x: number) => Math.max(-OVERSCROLL, Math.min(count - 1 + OVERSCROLL, x));
    const live = () => strip.current !== null;
    let snapTimer = 0;

    // Come to rest on a cover, leaning towards the direction of travel.
    const settle = (at: number, dir: number) => {
      m.target = clampIndex(dir > 0 ? Math.ceil(at - SNAP_BIAS) : dir < 0 ? Math.floor(at + SNAP_BIAS) : Math.round(at));
      kick.current();
    };

    goTo.current = (i: number) => {
      window.clearTimeout(snapTimer);
      if (live()) {
        m.target = clampIndex(i);
        kick.current();
      } else {
        setIndex(clampIndex(i));
      }
    };
    const base = () => (live() ? Math.round(m.target) : indexNow.current);

    let acc = 0;
    let last = 0;
    const onWheel = (e: WheelEvent) => {
      let delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (e.deltaMode === 1) delta *= 40;
      else if (e.deltaMode === 2) delta *= window.innerHeight;
      if (live()) {
        m.target = clampScroll(m.target + delta / WHEEL_PX);
        const dir = Math.sign(delta);
        window.clearTimeout(snapTimer);
        snapTimer = window.setTimeout(() => settle(m.target, dir), SNAP_DELAY);
        kick.current();
        return;
      }
      const now = performance.now();
      if (now - last < WHEEL_COOLDOWN) return;
      acc += delta;
      if (Math.abs(acc) >= WHEEL_THRESHOLD) {
        last = now;
        // Read the direction now: the state updater may run later, after acc is reset.
        const step = Math.sign(acc);
        setIndex((i) => clampIndex(i + step));
        acc = 0;
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable]")) return;
      const step: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, PageDown: 1, ArrowUp: -1, ArrowLeft: -1, PageUp: -1 };
      if (e.key in step) {
        e.preventDefault();
        goTo.current(base() + step[e.key]);
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo.current(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo.current(count - 1);
      }
    };

    // Touch: the strip follows the finger; a quick flick carries on through several projects.
    let sx = 0;
    let sy = 0;
    let startAt = 0;
    let axis: "x" | "y" | null = null;
    let unit = 1;
    let lastD = 0;
    let lastT = 0;
    let flick = 0;
    const onTouchStart = (e: TouchEvent) => {
      sx = e.touches[0].clientX;
      sy = e.touches[0].clientY;
      axis = null;
      lastD = 0;
      flick = 0;
      lastT = performance.now();
      startAt = m.pos;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!live()) return;
      const dx = sx - e.touches[0].clientX;
      const dy = sy - e.touches[0].clientY;
      if (!axis) {
        if (Math.hypot(dx, dy) < 8) return;
        axis = Math.abs(dy) >= Math.abs(dx) ? "y" : "x";
        const r = frame.current?.getBoundingClientRect();
        unit = (axis === "y" ? r?.height : r?.width) || window.innerHeight / 2;
        window.clearTimeout(snapTimer);
        m.dragging = true;
      }
      const d = (axis === "y" ? dy : dx) / unit;
      const now = performance.now();
      const dt = Math.max(1, now - lastT) / 1000;
      flick += ((d - lastD) / dt - flick) * 0.5;
      lastD = d;
      lastT = now;
      m.target = clampScroll(startAt + d);
      kick.current();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (live()) {
        if (!m.dragging) return;
        m.dragging = false;
        // A finger that stopped before lifting shouldn't fling.
        if (performance.now() - lastT > 100) flick = 0;
        settle(m.target + flick * FLING, Math.sign(flick) || Math.sign(m.target - startAt));
        return;
      }
      const dx = sx - e.changedTouches[0].clientX;
      const dy = sy - e.changedTouches[0].clientY;
      const d = Math.abs(dy) >= Math.abs(dx) ? dy : dx;
      if (Math.abs(d) < SWIPE_THRESHOLD) return;
      const step = Math.sign(d);
      setIndex((i) => clampIndex(i + step));
    };

    const el = section.current;
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    el?.addEventListener("touchstart", onTouchStart, { passive: true });
    el?.addEventListener("touchmove", onTouchMove, { passive: true });
    el?.addEventListener("touchend", onTouchEnd, { passive: true });
    el?.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      window.clearTimeout(snapTimer);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      el?.removeEventListener("touchstart", onTouchStart);
      el?.removeEventListener("touchmove", onTouchMove);
      el?.removeEventListener("touchend", onTouchEnd);
      el?.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [count]);

  const go = useCallback((i: number) => goTo.current(i), []);

  const active = projects[index];

  return (
    <section ref={section} aria-roledescription="carousel" aria-label="Projects" className="h-dvh touch-none overflow-hidden">
      <h1 className="sr-only">Projects</h1>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {`Project ${index + 1} of ${count}: ${active.title}, ${active.subtitle}`}
      </p>

      {/* Centered stack with the vertical index beside it (all screen sizes). */}
      <div className="flex h-full items-center justify-center px-4 md:px-6">
        {/* On phones, leave room on the right for the index so the pair is centred together. */}
        <div className="relative -mt-6 pr-[4.5rem] md:mt-0 md:pr-0">
          <div className="relative">
            <OpenProjectLink project={active}>
              <div
                ref={frame}
                data-flip-id={active.slug}
                className="relative aspect-[3/4] h-[min(56dvh,calc((100vw-9rem)*4/3))] overflow-hidden bg-ink/5 md:h-[min(62dvh,calc((100vw-14rem)*4/3))]"
              >
                {projects.map((p, i) => (
                  <div
                    key={p.slug}
                    ref={(el) => {
                      layers.current[i] = el;
                    }}
                    aria-hidden={i !== index}
                    className="absolute inset-0 overflow-hidden"
                    style={i === 0 ? { zIndex: 1 } : { visibility: "hidden", opacity: 0 }}
                  >
                    <div className="absolute inset-0 will-change-transform">
                      <ProjectImage image={p.images[0]} sizes="(min-width: 768px) 40vw, 70vw" priority={i === 0} />
                      {p.coverMotion && <LivingCover motion={p.coverMotion} src={p.images[0].src} active={i === index} />}
                    </div>
                  </div>
                ))}
              </div>
            </OpenProjectLink>
            {/* The bending strip, drawn only while moving between projects. Wider than the frame so bulges aren't clipped. */}
            <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute top-0 -left-[12%] h-full w-[124%] opacity-0" />

            <VerticalIndex projects={projects} index={index} onSelect={go} />
          </div>

          {/* Positioned below the image so long subtitles never shift the image. */}
          <div ref={caption} className="absolute top-full left-0 mt-4 w-full text-[15px] leading-snug">
            <div className="overflow-hidden">
              <h2 data-line className="font-semibold tracking-[-0.01em]">
                {active.title}
              </h2>
            </div>
            <div className="overflow-hidden">
              <p data-line className="max-w-[28rem] text-mute-ink">
                {active.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}

function VerticalIndex({ projects, index, onSelect }: { projects: Project[]; index: number; onSelect: (i: number) => void }) {
  return (
    <nav aria-label="Project index" className="absolute top-0 bottom-0 left-full ml-6 w-12 md:ml-[clamp(2.5rem,5vw,4rem)] md:w-16">
      <ol className="flex h-full flex-col justify-between">
        {projects.map((p, i) => (
          <li key={p.slug} className="contents">
            {i > 0 &&
              Array.from({ length: MINOR_TICKS }, (_, t) => (
                <span key={t} aria-hidden="true" className="block h-px w-1 bg-mute/60" />
              ))}
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-label={`Project ${p.number}: ${p.title}`}
              aria-current={i === index ? "true" : undefined}
              className="group relative flex h-px items-center gap-3 font-mono md:gap-5 text-[11px] leading-none before:absolute before:-inset-x-2 before:-inset-y-3 before:content-['']"
            >
              <span className="relative block h-px w-3">
                <span
                  aria-hidden="true"
                  className={`absolute top-0 left-0 block h-px w-3 origin-left bg-ink transition-transform duration-500 ease-out-soft ${
                    i === index ? "scale-x-100" : "scale-x-[0.34] bg-mute group-hover:scale-x-75"
                  }`}
                />
              </span>
              <span
                className={`transition-colors duration-300 ${i === index ? "text-ink" : "text-mute-ink group-hover:text-ink"}`}
              >
                {p.number}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

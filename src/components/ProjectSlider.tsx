"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap } from "gsap";
import type { Project } from "@/data/projects";
import { prefersReducedMotion } from "@/lib/motion";
import { ProjectImage } from "./ProjectImage";
import { OpenProjectLink } from "./transition/OpenProjectLink";
import { LivingCover } from "./living-cover/LivingCover";
import { SliderStrip } from "./slider-strip";

const MINOR_TICKS = 5;
const WHEEL_THRESHOLD = 30;
const WHEEL_COOLDOWN = 850;

type Props = { projects: Project[] };

// Which of the two slider layouts is on screen, so only that one animates its cover.
const desktopQuery = "(min-width: 768px)";
function subscribeDesktop(cb: () => void) {
  const mq = window.matchMedia(desktopQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function ProjectSlider({ projects }: Props) {
  const [index, setIndex] = useState(0);
  const desktop = useSyncExternalStore(subscribeDesktop, () => window.matchMedia(desktopQuery).matches, () => true);
  const count = projects.length;

  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const caption = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const shown = useRef(0);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const scrollTarget = useRef<number | null>(null);
  // Set when the index comes from the URL: show that project immediately, no transition.
  const jump = useRef(false);
  // WebGL strip for the bending transition (desktop). `null` until its textures are loaded.
  const canvas = useRef<HTMLCanvasElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const strip = useRef<SliderStrip | null>(null);
  const stripPos = useRef({ pos: 0, tween: null as gsap.core.Tween | null });

  // Set up the strip once; if WebGL or any cover fails, the CSS transition is used instead.
  useEffect(() => {
    if (!canvas.current || prefersReducedMotion()) return;
    const s = SliderStrip.create(canvas.current);
    if (!s) return;
    let alive = true;
    s.load(projects.map((p) => p.images[0].src)).then((ok) => {
      if (alive && ok) strip.current = s;
    });
    const onResize = () => s.resize();
    window.addEventListener("resize", onResize);
    return () => {
      alive = false;
      window.removeEventListener("resize", onResize);
      strip.current = null;
      s.destroy();
    };
  }, [projects]);

  const go = useCallback((next: number) => setIndex(Math.max(0, Math.min(count - 1, next))), [count]);

  // Deep link: /#slug opens that project.
  useEffect(() => {
    const slug = decodeURIComponent(window.location.hash.slice(1));
    const found = projects.findIndex((p) => p.slug === slug);
    if (found > 0) {
      jump.current = true;
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

  // Desktop: animate between stacked image layers whenever the index changes.
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

    if (prefersReducedMotion() || jump.current) {
      gsap.set(fromEl, { autoAlpha: 0 });
      gsap.set(toEl, { autoAlpha: 1, clipPath: "inset(0% 0% 0% 0%)" });
      stripPos.current.pos = index;
      return;
    }

    const captionIn = () => {
      if (!caption.current) return;
      gsap.fromTo(
        caption.current.querySelectorAll("[data-line]"),
        { yPercent: 110 * dir },
        { yPercent: 0, duration: 0.8, ease: "power3.out", stagger: 0.06, delay: 0.25, overwrite: true },
      );
    };

    // WebGL: the covers slide as one strip and bend with the scroll speed.
    const s = strip.current;
    if (s && canvas.current && frame.current && canvas.current.offsetParent !== null) {
      const st = stripPos.current;
      st.tween?.kill();
      const cv = canvas.current;
      const fr = frame.current;
      gsap.set(fromEl, { autoAlpha: 0, zIndex: 0 });
      gsap.set(toEl, { autoAlpha: 1, zIndex: 1, clipPath: "inset(0% 0% 0% 0%)" });
      gsap.set(fr, { opacity: 0 });
      gsap.killTweensOf(cv);
      gsap.set(cv, { opacity: 1 });
      s.resize();
      const frameW = fr.getBoundingClientRect().width;
      let lastPos = st.pos;
      let lastT = performance.now();
      let vel = 0;
      const distance = Math.abs(index - st.pos);
      st.tween = gsap.to(st, {
        pos: index,
        duration: 0.95 + Math.min(distance, 4) * 0.15,
        ease: "power3.inOut",
        onUpdate: () => {
          const now = performance.now();
          const dt = Math.max(1, now - lastT) / 1000;
          // Smoothed velocity in slides per second drives the bend.
          vel += ((st.pos - lastPos) / dt - vel) * 0.35;
          lastPos = st.pos;
          lastT = now;
          s.render(st.pos, vel, frameW);
        },
        onComplete: () => {
          s.render(index, 0, frameW);
          gsap.set(fr, { opacity: 1 });
          gsap.to(cv, { opacity: 0, duration: 0.2, onComplete: () => s.clear() });
          st.tween = null;
        },
      });
      captionIn();
      return;
    }
    stripPos.current.pos = index;

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
    tl.to(toEl, { clipPath: "inset(0% 0% 0% 0%)", duration: 1 }, 0)
      .fromTo(toImg, { scale: 1.12, yPercent: 6 * dir }, { scale: 1, yPercent: 0, duration: 1.2, ease: "power3.out" }, 0)
      .to(fromImg, { yPercent: -8 * dir, scale: 1.04, duration: 1 }, 0);

    captionIn();
    timeline.current = tl;
  }, [index]);

  // Wheel and keyboard navigation (desktop and mobile).
  useEffect(() => {
    let acc = 0;
    let last = 0;
    const onWheel = (e: WheelEvent) => {
      if (window.matchMedia("(max-width: 767px)").matches) return;
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const now = performance.now();
      if (now - last < WHEEL_COOLDOWN) return;
      acc += delta;
      if (Math.abs(acc) >= WHEEL_THRESHOLD) {
        last = now;
        // Read the direction now: the state updater may run later, after acc is reset.
        const step = Math.sign(acc);
        setIndex((i) => Math.max(0, Math.min(count - 1, i + step)));
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
        setIndex((i) => Math.max(0, Math.min(count - 1, i + step[e.key])));
      } else if (e.key === "Home") {
        e.preventDefault();
        setIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setIndex(count - 1);
      }
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [count]);

  // Mobile: keep the swipe carousel on the current slide when the index changes elsewhere.
  useEffect(() => {
    const el = track.current;
    if (!el || el.offsetParent === null) return;
    const slide = el.children[index] as HTMLElement | undefined;
    if (!slide) return;
    const target = slide.offsetLeft - (el.clientWidth - slide.clientWidth) / 2;
    const instant = jump.current;
    jump.current = false;
    if (Math.abs(el.scrollLeft - target) > 4) {
      scrollTarget.current = index;
      window.setTimeout(() => {
        if (scrollTarget.current === index) scrollTarget.current = null;
      }, 900);
      el.scrollTo({ left: target, behavior: prefersReducedMotion() || instant ? "auto" : "smooth" });
    }
  }, [index]);

  const onTrackScroll = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let nearest = 0;
    let best = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const c = child as HTMLElement;
      const d = Math.abs(c.offsetLeft + c.clientWidth / 2 - center);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    // While a programmatic scroll is running, ignore the slides it passes over.
    if (scrollTarget.current !== null) {
      if (nearest !== scrollTarget.current) return;
      scrollTarget.current = null;
    }
    setIndex(nearest);
  }, []);

  const current = projects[index];

  return (
    <section aria-roledescription="carousel" aria-label="Projects" className="h-dvh overflow-hidden">
      <h1 className="sr-only">Projects</h1>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {`Project ${index + 1} of ${count}: ${current.title}, ${current.subtitle}`}
      </p>

      {/* Desktop / tablet: centered stack with vertical index */}
      <div className="hidden h-full items-center justify-center px-6 md:flex">
        <div className="relative">
          <div className="relative">
            <OpenProjectLink project={current}>
              <div
                ref={frame}
                data-flip-id={current.slug}
                className="relative aspect-[3/4] h-[min(62dvh,calc((100vw-14rem)*4/3))] overflow-hidden bg-ink/5"
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
                      <ProjectImage image={p.images[0]} sizes="(min-width: 768px) 40vw, 80vw" priority={i === 0} />
                      {p.coverMotion && <LivingCover motion={p.coverMotion} src={p.images[0].src} active={desktop && i === index} />}
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
                {current.title}
              </h2>
            </div>
            <div className="overflow-hidden">
              <p data-line className="max-w-[28rem] text-mute-ink">
                {current.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: native swipe carousel */}
      <div className="flex h-full flex-col justify-center pt-24 pb-8 md:hidden">
        <div
          ref={track}
          onScroll={onTrackScroll}
          tabIndex={0}
          aria-label="Swipe or use arrow keys to browse projects"
          className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto px-[11vw] focus-visible:outline-offset-[-2px]"
        >
          {projects.map((p, i) => (
            <div
              key={p.slug}
              className="w-[78vw] shrink-0 snap-center"
              aria-hidden={i !== index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${p.number}: ${p.title}`}
            >
              <OpenProjectLink project={p} tabIndex={i === index ? undefined : -1}>
                <div data-flip-id={p.slug} className="relative aspect-[3/4] w-full overflow-hidden bg-ink/5">
                  <ProjectImage image={p.images[0]} sizes="78vw" priority={i === 0} />
                  {p.coverMotion && <LivingCover motion={p.coverMotion} src={p.images[0].src} active={!desktop && i === index} />}
                </div>
              </OpenProjectLink>
              <div className="mt-3 text-[15px] leading-snug">
                <h2 className="font-semibold">{p.title}</h2>
                <p className="text-mute-ink">{p.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        <ol className="mt-6 flex justify-center gap-1 font-mono text-[11px]" aria-label="Project index">
          {projects.map((p, i) => (
            <li key={p.slug}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-label={`Project ${p.number}: ${p.title}`}
                aria-current={i === index ? "true" : undefined}
                className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1.5"
              >
                <span
                  aria-hidden="true"
                  className={`h-px bg-ink transition-all duration-500 ${i === index ? "w-4 opacity-100" : "w-1 opacity-40"}`}
                />
                <span className={i === index ? "text-ink" : "text-mute-ink"}>{p.number}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function VerticalIndex({ projects, index, onSelect }: { projects: Project[]; index: number; onSelect: (i: number) => void }) {
  return (
    <nav aria-label="Project index" className="absolute top-0 bottom-0 left-full ml-[clamp(2.5rem,5vw,4rem)] w-16">
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
              className="group relative flex h-px items-center gap-5 font-mono text-[11px] leading-none before:absolute before:-inset-x-2 before:-inset-y-3 before:content-['']"
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

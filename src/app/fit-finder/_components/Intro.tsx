"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import s from "./ff.module.css";

const BARS = 14;

/**
 * Opening: a blue screen with a ruler counting to 120 cm, then it splits into
 * vertical strips that slide away to uncover the page.
 */
export function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.display = "none";
      return;
    }
    document.documentElement.style.overflow = "hidden";
    const n = { v: 0 };
    const q = gsap.utils.selector(el);
    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.style.overflow = "";
        setDone(true);
      },
    });
    tl.fromTo(q("[data-tick]"), { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: "power3.out", stagger: { each: 0.012 } }, 0)
      .to(n, { v: 120, duration: 1.3, ease: "power2.inOut", onUpdate: () => count.current && (count.current.textContent = String(Math.round(n.v)).padStart(3, "0")) }, 0.1)
      .to(q("[data-label]"), { autoAlpha: 0, duration: 0.25 }, 1.5)
      .to(q("[data-bar]"), { yPercent: -100, duration: 0.9, ease: "expo.inOut", stagger: { each: 0.045, from: "random" } }, 1.55);
    return () => {
      tl.kill();
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (done) return null;
  return (
    <div ref={root} className={s.intro} aria-hidden="true">
      {Array.from({ length: BARS }).map((_, i) => (
        <span key={i} data-bar="" className={s.introBar} />
      ))}
      <div className={s.ruler} data-label="">
        {Array.from({ length: 121 }).map((_, i) => (
          <i key={i} data-tick="" className={i % 10 === 0 ? s.tickL : i % 5 === 0 ? s.tickM : undefined} />
        ))}
      </div>
      <div className={s.introLabel} data-label="">
        <span>Fit Finder</span>
        <b>
          <span ref={count}>000</span> cm
        </b>
      </div>
    </div>
  );
}

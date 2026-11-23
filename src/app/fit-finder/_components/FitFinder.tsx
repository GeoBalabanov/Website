"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GARMENTS, chestSpread } from "../_lib/garments";
import { Intro } from "./Intro";
import { Tool } from "./Tool";
import { MIndex } from "./MIndex";
import { ForBrands } from "./ForBrands";
import { Lookbook, Marquee } from "./Lookbook";
import s from "./ff.module.css";

gsap.registerPlugin(ScrollTrigger);

/** A tiny ruler inlaid in a line of type, like a woven tape. */
function Tape() {
  return (
    <span className={s.tape} aria-hidden="true">
      {Array.from({ length: 22 }).map((_, i) => (
        <i key={i} className={i % 5 === 0 ? s.tapeL : undefined} />
      ))}
    </span>
  );
}

function Chip({ src, alt }: { src: string; alt: string }) {
  return (
    <span className={s.chip}>
      <Image src={src} alt={alt} fill sizes="160px" />
    </span>
  );
}

export function FitFinder() {
  const root = useRef<HTMLDivElement>(null);
  const spread = chestSpread();

  // Top bar: hides while scrolling down, comes back on a white strip when scrolling up.
  const bar = useRef<HTMLElement>(null);
  useEffect(() => {
    let last = window.scrollY;
    const on = () => {
      const y = window.scrollY;
      const b = bar.current;
      if (!b) return;
      b.dataset.solid = y > 40 ? "1" : "0";
      b.dataset.hidden = y > last && y > 200 ? "1" : "0";
      last = y;
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      // Hero photo drifts and scales as you leave it.
      gsap.to("[data-hero-img]", { scale: 1.12, yPercent: 8, ease: "none", scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: true } });
      gsap.fromTo("[data-hero-line]", { yPercent: 110 }, { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: 0.1, delay: 2.2 });
      // Lines of type rise in.
      gsap.utils.toArray<HTMLElement>("[data-rise]").forEach((n) => {
        gsap.fromTo(n, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: n, start: "top 88%" } });
      });
      gsap.utils.toArray<HTMLElement>("[data-fade]").forEach((n) => {
        gsap.fromTo(n, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: n, start: "top 90%" } });
      });
      // Photos open like a curtain.
      gsap.utils.toArray<HTMLElement>("[data-reveal-img]").forEach((n) => {
        gsap.fromTo(n, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 1.4, ease: "expo.inOut", scrollTrigger: { trigger: n, start: "top 85%" } });
        const img = n.querySelector("img");
        if (img) gsap.fromTo(img, { yPercent: -8, scale: 1.15 }, { yPercent: 8, scale: 1.05, ease: "none", scrollTrigger: { trigger: n, start: "top bottom", end: "bottom top", scrub: true } });
      });
      // Footer: tape stripes slide away to uncover the big line.
      gsap.fromTo("[data-foot-bar]", { yPercent: 0 }, { yPercent: -101, duration: 1.1, ease: "expo.inOut", stagger: { each: 0.05, from: "random" }, scrollTrigger: { trigger: "[data-foot]", start: "top 75%" } });
    }, el);

    // Hero: the two lines drift a little with the pointer, in opposite directions.
    const lines = el.querySelectorAll<HTMLElement>("[data-hero-drift]");
    const qx = [...lines].map((n) => gsap.quickTo(n, "x", { duration: 1.2, ease: "power3.out" }));
    const qy = [...lines].map((n) => gsap.quickTo(n, "y", { duration: 1.2, ease: "power3.out" }));
    const move = (e: PointerEvent) => {
      const dx = e.clientX / window.innerWidth - 0.5;
      const dy = e.clientY / window.innerHeight - 0.5;
      qx.forEach((f, i) => f(dx * (i ? -26 : 26)));
      qy.forEach((f, i) => f(dy * (i ? -12 : 12)));
    };
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointermove", move);
      ctx.revert();
    };
  }, []);

  return (
    <div ref={root} className={s.root}>
      <Intro />

      <header ref={bar} className={s.bar}>
        <a href="#top" className={s.logo}>
          Fit Finder
        </a>
        <nav className={s.nav} aria-label="Sections">
          <a href="#tool">Find your size</a>
          <a href="#index">The M Index</a>
          <a href="#brands">For brands</a>
        </nav>
        <a href="#tool" className={s.barCta}>
          Start <span aria-hidden="true">→</span>
        </a>
      </header>

      <main id="top">
        {/* HERO */}
        <section className={s.hero} data-hero>
          <div className={s.heroImg} data-hero-img>
            <Image src="/fit-finder/hero.jpg" alt="A man walking toward the camera in an oversized beige work jacket, in a white studio" fill priority sizes="100vw" />
          </div>
          <h1 className={s.heroTitle}>
            <span className={s.hl} data-hero-drift>
              <span data-hero-line>Your size</span>
            </span>
            <span className={`${s.hl} ${s.hlR}`} data-hero-drift>
              <span data-hero-line>
                is <em>a lie.</em>
              </span>
            </span>
          </h1>
          <div className={s.heroFoot}>
            <p>
              A sizing concept
              <br />
              for fashion e-commerce
            </p>
            <p className={s.heroMid}>Scroll</p>
            <p className={s.heroRight}>
              Concept, design &amp; code
              <br />
              Georgi Balabanov — 2026
            </p>
          </div>
        </section>

        {/* STATS */}
        <section className={s.stats}>
          {[
            [String(GARMENTS.length), "Jackets", "in the index"],
            [String(spread), "Centimetres", "between the smallest and the biggest M"],
            ["4", "Zones", "compared for every size"],
          ].map(([n, a, b]) => (
            <div key={a} data-fade>
              <b>{n}</b>
              <span>
                {a}
                <br />
                {b}
              </span>
            </div>
          ))}
        </section>

        {/* STATEMENTS */}
        <section className={s.statements} aria-label="The idea">
          <p className={s.stLine}>
            <span data-rise>
              One jacket <Tape /> that fits.
            </span>
          </p>
          <p className={s.stLine}>
            <span data-rise>Your size everywhere.</span>
          </p>
          <p className={s.stLine}>
            <span data-rise>
              <Chip src="/fit-finder/label.jpg" alt="" /> No tape measure.
            </span>
          </p>
          <p className={s.stLine}>
            <span data-rise>
              Fewer returns. <Tape />
            </span>
          </p>
        </section>

        {/* EDITORIAL PAIR */}
        <section className={s.pair}>
          <figure className={s.pairA} data-reveal-img>
            <Image src="/fit-finder/label.jpg" alt="The inside collar of a jacket with a small woven label reading M" fill sizes="(max-width: 760px) 100vw, 40vw" />
          </figure>
          <div className={s.pairText} data-fade>
            <span className={s.eyebrow}>The problem</span>
            <p>
              Every brand has its own M. Size charts ask for measurements nobody knows, so we order two sizes and send one back. Fit Finder starts from the
              one thing you do know: <b>the jacket in your wardrobe that fits.</b>
            </p>
          </div>
          <figure className={s.pairB} data-reveal-img>
            <Image src="/fit-finder/tape.jpg" alt="Hands stretching a yellow measuring tape across a navy chore jacket" fill sizes="(max-width: 760px) 100vw, 30vw" />
          </figure>
        </section>

        <Lookbook />

        <Tool />
        <MIndex />

        <Marquee text="M" />

        <section className={s.returns}>
          <figure className={s.returnsImg} data-reveal-img>
            <Image src="/fit-finder/returns.jpg" alt="A stack of cardboard return parcels, one open with a folded jacket inside" fill sizes="100vw" />
          </figure>
          <p className={s.returnsText} data-fade>
            Every box that comes back is <em>a size</em> somebody guessed.
          </p>
        </section>

        <ForBrands />
      </main>

      <footer className={s.footer}>
        <div className={s.footTape} aria-hidden="true">
          {Array.from({ length: 160 }).map((_, i) => (
            <i key={i} className={i % 10 === 0 ? s.ftL : i % 5 === 0 ? s.ftM : undefined}>
              {i % 10 === 0 && <span>{i}</span>}
            </i>
          ))}
        </div>
        <div className={s.footReveal} data-foot>
          <a href="#tool" className={s.footBig}>
            Find your size <span aria-hidden="true">↗</span>
          </a>
          <div className={s.footBars} aria-hidden="true">
            {Array.from({ length: 12 }).map((_, i) => (
              <i key={i} data-foot-bar="" />
            ))}
          </div>
        </div>
        <div className={s.footRow}>
          <p>
            A concept by <Link href="/">Georgi Balabanov</Link>
            <br />
            Design &amp; development, 2026
          </p>
          <p>
            Next.js · TypeScript · GSAP
            <br />
            Jacket drawings generated from data
          </p>
          <p className={s.disclaimer}>
            Not affiliated with any brand named. Index measurements are illustrative approximations for this concept, not official size charts. Photography
            art-directed for the concept.
          </p>
          <Link href="/" className={s.back}>
            ← Portfolio
          </Link>
        </div>
      </footer>
    </div>
  );
}

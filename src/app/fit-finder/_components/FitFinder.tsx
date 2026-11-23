"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GARMENTS, chestSpread, garment } from "../_lib/garments";
import { JacketPaths } from "./Jacket";
import { Tool } from "./Tool";
import { MIndex } from "./MIndex";
import { ForBrands } from "./ForBrands";
import s from "./ff.module.css";

const HERO_SET = ["levis-trucker", "uniqlo-padded", "arket-chore", "cos-padded", "carhartt-work", "tnf-puffer"].map(garment);

/** Live Amsterdam time in the top bar. Empty until mounted, so server and client render the same. */
function Clock() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const f = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Amsterdam", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const tick = () => setNow(f.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className={s.clock}>AMS {now || "--:--:--"}</span>;
}

/** Adds `data-in` to every [data-reveal] element once it scrolls into view. */
function useReveal(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const items = el.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.in = "";
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -12% 0px" },
    );
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, [root]);
}

export function FitFinder() {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  const spread = chestSpread();

  return (
    <div ref={root} className={s.root}>
      <header className={s.bar}>
        <a href="#top" className={s.logo}>
          FIT<span>/</span>FINDER
        </a>
        <nav className={s.nav} aria-label="Sections">
          <a href="#tool">
            <i>01</i>Find your size
          </a>
          <a href="#index">
            <i>02</i>The M Index
          </a>
          <a href="#brands">
            <i>03</i>For brands
          </a>
          <a href="#notes">
            <i>04</i>Notes
          </a>
        </nav>
        <div className={s.barRight}>
          <Clock />
          <span className={s.ver}>V0.1 — CONCEPT</span>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className={s.hero}>
          <div className={s.heroMeta}>
            <span>[ FF—INDEX / {GARMENTS.length} JACKETS / 6 SIZES ]</span>
            <span>A sizing engine for fashion e-commerce</span>
          </div>
          <h1 className={s.heroTitle}>
            <span className={s.l1}>Your size</span>
            <span className={s.l2}>
              is <em>a lie.</em>
            </span>
          </h1>
          <div className={s.tag} aria-hidden="true">
            <div className={s.tagInner}>
              <span className={s.tagTop}>Size · Taille · Maat</span>
              <b className={s.tagSize}>
                M<i>?</i>
              </b>
              <span className={s.tagLine}>100% uncertain</span>
              <span className={s.tagSmall}>Cut to another brand&apos;s idea of medium</span>
              <svg className={s.care} viewBox="0 0 120 22">
                <path d="M3 6 L6 19 L22 19 L25 6 M3 9 Q8 6 14 9 Q20 12 25 9" />
                <path d="M34 19 L45 3 L56 19 Z" />
                <path d="M66 19 L66 12 Q66 6 74 6 L82 6 Q88 6 88 12 L88 19 Z M70 13 L84 13" />
                <circle cx="106" cy="11" r="8" />
                <path d="M100 5 L112 17 M112 5 L100 17" />
              </svg>
              <span className={s.tagSmall}>Do not trust the label. Return within 30 days.</span>
              <span className={s.tagCode}>FF—000 / NL</span>
            </div>
          </div>

          <figure className={s.heroFig}>
            <svg viewBox="-64 -10 128 84" className={s.overlay} role="img" aria-label="Six jackets, all size M, drawn on top of each other to scale. Their outlines don't match.">
              {HERO_SET.map((g, i) => (
                <JacketPaths
                  key={g.id}
                  m={g.m}
                  details={i === HERO_SET.length - 1}
                  draw
                  className={i === HERO_SET.length - 1 ? s.ovAccent : s.ovInk}
                  style={{ animationDelay: `${0.5 + i * 0.22}s` } as React.CSSProperties}
                />
              ))}
              <g className={s.ovRule}>
                <path d="M-60 72 L60 72" />
                <text x="-60" y="70">0</text>
                <text x="56" y="70">120 CM</text>
              </g>
            </svg>
            <figcaption className={s.heroCap}>
              <b>Fig. 01</b> — Six jackets. All labelled M. Drawn to scale, flat, collar on collar.
            </figcaption>
            <ol className={s.legend}>
              {HERO_SET.map((g, i) => (
                <li key={g.id} className={i === HERO_SET.length - 1 ? s.legAccent : undefined}>
                  <span>{g.brand}</span>
                  <b>{g.m.chest.toFixed(1)}</b>
                </li>
              ))}
              <li className={s.legHead}>
                <span>Brand — size M</span>
                <b>Chest, cm</b>
              </li>
            </ol>
          </figure>

          <div className={s.heroFoot}>
            <p className={s.heroLead}>
              Fit is the number one reason clothes bought online go back. Fit Finder starts from the one jacket you already know fits, and tells you your
              size anywhere else.
            </p>
            <div className={s.heroStat}>
              <b>{spread}</b>
              <span>cm between the smallest and the biggest M in our index. That&apos;s two whole sizes.</span>
            </div>
            <a href="#tool" className={s.cta}>
              Find my size <span aria-hidden="true">↓</span>
            </a>
          </div>
        </section>

        <div className={s.marquee} aria-hidden="true">
          <div>
            {Array.from({ length: 2 }).map((_, k) => (
              <span key={k}>
                M ≠ M ≠ M ≠ M ≠ M <i>×</i> ONE JACKET THAT FITS → YOUR SIZE EVERYWHERE <i>×</i> NO TAPE MEASURE <i>×</i> M ≠ M ≠ M ≠ M ≠ M <i>×</i> FEWER RETURNS
                <i>×</i>{" "}
              </span>
            ))}
          </div>
        </div>

        <Tool />
        <MIndex />
        <ForBrands />

        {/* NOTES */}
        <section id="notes" className={s.notes}>
          <header className={s.secHead} data-reveal>
            <span className={s.secNo}>04</span>
            <h2>
              Notes <em>on the concept</em>
            </h2>
          </header>
          <div className={s.noteGrid}>
            {[
              ["Problem", "Every brand has its own M. Size charts ask for body measurements nobody knows, so shoppers order two sizes and send one back. That's shipping, handling and resale cost for the brand, and a bad first impression."],
              ["Insight", "People don't know their chest in centimetres, but they know which jacket in their wardrobe fits perfectly. That garment is a better measuring tape than any body scan."],
              ["Solution", "Pick a jacket you own and its size. Fit Finder compares the flat measurements zone by zone, weighted by what decides fit, and recommends a size with a match score and a drawing to scale."],
              ["Next", "Real garment data from brand partners, more categories (trousers, knitwear), learning from returns, and a one-line widget for any Shopify or headless store."],
            ].map(([t, d], i) => (
              <article key={t} data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
                <span>0{i + 1}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className={s.footer}>
        <div className={s.footBig} aria-hidden="true">
          FIT<span>/</span>FINDER
        </div>
        <div className={s.footRow}>
          <p>
            A concept by <Link href="/">Georgi Balabanov</Link> — design &amp; build, 2026.
          </p>
          <p>Next.js · TypeScript · SVG drawn from data, no images.</p>
          <p className={s.disclaimer}>
            Not affiliated with any brand shown. Index measurements are illustrative approximations for this concept, not official size charts.
          </p>
          <Link href="/" className={s.back}>
            ← Portfolio
          </Link>
        </div>
      </footer>
    </div>
  );
}

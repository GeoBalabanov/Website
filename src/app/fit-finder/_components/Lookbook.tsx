"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import s from "./ff.module.css";

gsap.registerPlugin(ScrollTrigger);

/** Each look: where the chest line sits on the photo (fractions of the frame) and what it measures. */
const LOOKS = [
  { src: "/fit-finder/denim.jpg", alt: "A man in a mid-blue denim trucker jacket adjusting his cuff", kind: "Trucker jacket", cm: 56.5, y: 0.44, x0: 0.26, x1: 0.66, pos: "50% 30%" },
  { src: "/fit-finder/puffer.jpg", alt: "A woman in an oversized black puffer jacket, hands in pockets", kind: "Puffer jacket", cm: 66, y: 0.47, x0: 0.24, x1: 0.78, pos: "50% 30%" },
  { src: "/fit-finder/product.jpg", alt: "A beige canvas chore jacket on an invisible mannequin", kind: "Chore jacket", cm: 61.5, y: 0.4, x0: 0.2, x1: 0.8, pos: "50% 50%" },
];

/**
 * "Same label. Different jacket." A pinned strip that scrolls sideways:
 * three jackets, all size M, each with a tape line across the chest.
 */
export function Lookbook() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr || window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.innerWidth < 760) return;
    const ctx = gsap.context(() => {
      const dist = () => tr.scrollWidth - window.innerWidth;
      const tween = gsap.to(tr, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: el, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true } });
      // Each tape line draws across its chest as the card slides in.
      gsap.utils.toArray<HTMLElement>("[data-look-line]").forEach((line) => {
        gsap.fromTo(line, { scaleX: 0 }, { scaleX: 1, ease: "power2.out", scrollTrigger: { trigger: line.closest("figure"), containerAnimation: tween, start: "left 75%", end: "left 35%", scrub: true } });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className={s.look} aria-label="Same label, different jacket">
      <div ref={track} className={s.lookTrack}>
        <div className={s.lookIntro}>
          <span className={s.eyebrow}>Lookbook — all size M</span>
          <h2 className={s.lookTitle}>
            Same label.
            <br />
            <em>Different jacket.</em>
          </h2>
          <p>Three jackets with the same letter on the collar. Measured flat, pit to pit, they are almost ten centimetres apart.</p>
        </div>
        {LOOKS.map((l, i) => (
          <figure key={l.src} className={s.lookCard}>
            <div className={s.lookImg}>
              <Image src={l.src} alt={l.alt} fill sizes="(max-width: 760px) 90vw, 36vw" style={{ objectPosition: l.pos }} />
              <span className={s.lookLine} style={{ top: `${l.y * 100}%`, left: `${l.x0 * 100}%`, width: `${(l.x1 - l.x0) * 100}%` }} data-look-line>
                <i />
                <i />
              </span>
            </div>
            <figcaption>
              <span>
                0{i + 1} — {l.kind}, size M
              </span>
              <b>
                {l.cm.toFixed(1)}
                <small>cm</small>
              </b>
            </figcaption>
          </figure>
        ))}
        <div className={s.lookOutro}>
          <p>
            M is a feeling,
            <br />
            <em>not a size.</em>
          </p>
        </div>
      </div>
    </section>
  );
}

/** A giant serif band that runs faster the faster you scroll. */
export function Marquee({ text }: { text: string }) {
  const row = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = row.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0;
    let boost = 0;
    const st = ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onUpdate: (self) => (boost = Math.min(18, Math.abs(self.getVelocity()) / 220)) });
    const tick = () => {
      boost *= 0.94;
      x -= 0.6 + boost;
      const w = el.scrollWidth / 2;
      if (-x > w) x += w;
      el.style.transform = `translate3d(${x}px,0,0)`;
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      st.kill();
    };
  }, []);

  return (
    <div className={s.marquee} aria-hidden="true">
      <div ref={row}>
        {[0, 1].map((k) => (
          <span key={k}>
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i}>
                {text} <em>≠</em>{" "}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

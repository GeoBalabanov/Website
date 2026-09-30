"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import type { Project } from "@/data/projects";
import { useScene } from "@/lib/use-scene";
import { Media } from "./Gallery";

/**
 * A brutalist take on the gallery: hard 2px outlines, offset block shadows,
 * boxed numbered captions, oversized mono type and a scrolling ticker.
 * Media keeps its natural size cap (no parallax zoom), so photos stay sharp.
 */
export function BrutalistGallery({ project }: { project: Project }) {
  const root = useRef<HTMLElement>(null);
  const items = project.gallery;
  const ticker = project.galleryTicker ?? [project.title];
  // Non-wide items after the last wide one: they run three to a row on desktop.
  const lastWide = items.map((m) => !!m.wide).lastIndexOf(true);
  const trailing = items.length - 1 - lastWide;

  useScene(root, ({ reduced }) => {
    if (reduced) return;
    // Blocks drop in hard, no easing softness.
    gsap.utils.toArray<HTMLElement>("[data-block]").forEach((el) => {
      gsap.from(el, { y: 40, autoAlpha: 0, duration: 0.5, ease: "steps(5)", scrollTrigger: { trigger: el, start: "top 88%" } });
    });
  });

  return (
    <section ref={root} id="gallery" className="border-t-2 border-[var(--p-fg)] px-4 pt-6 pb-[14vh] md:px-10">
      {/* Header row. */}
      <div className="flex flex-wrap items-baseline justify-between gap-2 font-mono text-xs tracking-widest uppercase">
        <span>(03) Gallery</span>
        <span className="text-[var(--p-muted)]">
          {String(items.length).padStart(2, "0")} items / {items.filter((m) => m.kind === "video").length} video
        </span>
      </div>
      <h2 className="font-display mt-4 text-[clamp(3.5rem,13vw,12rem)] leading-[0.8] font-extrabold tracking-[-0.05em] uppercase">
        Field notes
      </h2>

      {/* Ticker. */}
      <div aria-hidden="true" className="-mx-4 mt-8 overflow-hidden border-y-2 border-[var(--p-fg)] bg-[var(--p-accent)] py-2 text-[var(--p-bg)] md:-mx-10">
        <div className="flex w-max animate-[ticker_28s_linear_infinite] gap-8 font-mono text-sm font-bold tracking-widest whitespace-nowrap uppercase motion-reduce:animate-none md:text-base">
          {Array.from({ length: 2 }, (_, k) => (
            <span key={k} className="flex gap-8">
              {Array.from({ length: 4 }, (_, r) =>
                ticker.map((t, i) => (
                  <span key={`${r}-${i}`}>
                    {t} <span className="text-[var(--p-fg)]">✕</span>
                  </span>
                )),
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-12 grid grid-cols-12 gap-x-4 gap-y-12 md:gap-x-6 md:gap-y-16">
        {items.map((item, i) => {
          const n = String(i + 1).padStart(2, "0");
          const kind = item.kind === "video" ? "Video" : "Photo";
          const frame = item.wide ? "aspect-[16/10]" : item.tall ? "aspect-[9/16]" : "aspect-[3/4]";
          const media = (
            <div className="group relative">
              <div
                className={`relative overflow-hidden border-2 border-[var(--p-fg)] shadow-[8px_8px_0_var(--p-accent)] transition-[transform,box-shadow] duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[12px_12px_0_var(--p-accent)] ${frame}`}
              >
                <Media item={item} sizes={item.wide ? "(min-width: 768px) 58vw, 100vw" : "(min-width: 768px) 30vw, 50vw"} />
                <span className="absolute top-0 left-0 border-r-2 border-b-2 border-[var(--p-fg)] bg-[var(--p-bg)] px-2 py-1 font-mono text-[10px] tracking-widest uppercase md:text-xs">
                  {kind} / {n}
                </span>
              </div>
            </div>
          );
          const caption = item.caption && (
            <div className="flex border-2 border-[var(--p-fg)]">
              <span className="shrink-0 border-r-2 border-[var(--p-fg)] bg-[var(--p-accent-2)] px-2 py-1 font-mono text-sm font-bold text-[var(--p-bg)] md:px-3 md:text-base">
                {n}
              </span>
              <p className="px-3 py-2 text-[13px] leading-snug md:text-sm">{item.caption}</p>
            </div>
          );

          // Wide: the photo takes 7 columns, a big caption panel takes the rest.
          if (item.wide) {
            return (
              <figure key={item.src} data-block className="col-span-12 grid grid-cols-12 gap-4 md:gap-6">
                <div className="col-span-12 md:col-span-7">{media}</div>
                <figcaption className="col-span-12 flex flex-col justify-between border-2 border-[var(--p-fg)] p-4 md:col-span-5 md:p-6">
                  <span className="font-display text-[clamp(4rem,10vw,9rem)] leading-[0.8] font-extrabold tracking-[-0.05em] text-[var(--p-accent)]">
                    {n}
                  </span>
                  <p className="mt-6 max-w-[34ch] text-base leading-snug md:text-xl">{item.caption}</p>
                </figcaption>
              </figure>
            );
          }
          return (
            <figure key={item.src} data-block className="col-span-6 md:col-span-4">
              {media}
              <figcaption className="mt-4">{caption}</figcaption>
            </figure>
          );
        })}
        {/* Fill the gap after a short last row (three per row on desktop) with an end-of-roll block. */}
        {trailing % 3 !== 0 && (
          <div
            data-block
            className={`hidden flex-col justify-between border-2 border-[var(--p-fg)] bg-[repeating-linear-gradient(135deg,transparent_0_14px,color-mix(in_srgb,var(--p-fg)_8%,transparent)_14px_16px)] p-6 md:flex ${trailing % 3 === 1 ? "md:col-span-8" : "md:col-span-4"}`}
          >
            <span className="font-mono text-xs tracking-widest text-[var(--p-muted)] uppercase">End of roll / {String(items.length).padStart(2, "0")}</span>
            <p className="font-display text-[clamp(3rem,8vw,8rem)] leading-[0.8] font-extrabold tracking-[-0.05em] uppercase">
              {ticker.slice(0, 3).map((t) => (
                <span key={t} className="block">
                  {t}
                </span>
              ))}
            </p>
            <span className="self-end font-mono text-xs tracking-widest text-[var(--p-accent)] uppercase">Fin.</span>
          </div>
        )}
      </div>
    </section>
  );
}

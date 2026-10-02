"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import type { MediaItem, Project } from "@/data/projects";
import { useScene } from "@/lib/use-scene";
import { SectionLabel } from "./bits";
import { StreamingApps } from "@/components/living-cover/StreamingApps";
import { ConnectFlow } from "@/components/living-cover/ConnectFlow";
import { BloomFlow } from "@/components/living-cover/BloomFlow";
import { DemoBox } from "@/components/living-cover/DemoBox";

/**
 * Editorial gallery: wide items span the page, portrait items sit in pairs at
 * staggered heights. Each frame scales up as it enters and its media drifts
 * inside it (parallax); its caption rises in underneath.
 */
export function Gallery({ project, index = "03" }: { project: Project; index?: string }) {
  const root = useRef<HTMLElement>(null);

  useScene(root, ({ reduced, mobile }) => {
    gsap.utils.toArray<HTMLElement>("[data-caption]").forEach((caption) => {
      gsap.from(caption, {
        autoAlpha: 0,
        y: reduced ? 0 : 14,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: caption, start: "top 92%" },
      });
    });
    const frames = gsap.utils.toArray<HTMLElement>("[data-frame]");
    frames.forEach((frame) => {
      const media = frame.querySelector("[data-media]");
      if (reduced) {
        gsap.from(frame, { autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: frame, start: "top 90%" } });
        return;
      }
      gsap.fromTo(
        frame,
        { scale: mobile ? 0.94 : 0.84 },
        { scale: 1, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "top 35%", scrub: true } },
      );
      gsap.fromTo(
        media,
        { yPercent: -9 },
        { yPercent: 9, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true } },
      );
    });
  });

  // Where each item sits: wide items span the page, portraits pair up at staggered
  // heights, and runs of vertical videos go three across (the middle one dropped).
  // A single vertical item (a phone screen) sits alone in the centre, two form a centred pair.
  // (On phones the third of a run sits centred on its own row.)
  const tallPlace = ["md:col-start-1", "md:col-start-5 md:mt-[16vh]", "col-start-4 md:col-start-9"];
  const places: string[] = [];
  const g = project.gallery;
  for (let i = 0, portrait = 0, tall = 0; i < g.length; i++) {
    const item = g[i];
    tall = item.tall ? tall : 0;
    // Exactly two vertical items in a row: a centred pair, the second one lower.
    const pair = item.tall && (g[i - 1]?.tall ? !g[i - 2]?.tall && !g[i + 1]?.tall : g[i + 1]?.tall && !g[i + 2]?.tall);
    if (pair) {
      places.push(`col-span-6 md:col-span-4 md:w-[82%] md:justify-self-center ${g[i - 1]?.tall ? "md:col-start-7 md:mt-[16vh]" : "md:col-start-3"}`);
      continue;
    }
    places.push(
      item.wide
        ? item.compact
          ? "col-span-12 md:col-span-6 md:col-start-4"
          : "col-span-12 md:col-span-10 md:col-start-2"
        : item.tall && !g[i - 1]?.tall && !g[i + 1]?.tall
          ? "col-span-8 col-start-3 md:col-span-4 md:col-start-5 md:w-[82%] md:justify-self-center"
          : item.tall
          ? `col-span-6 md:col-span-4 md:w-[82%] md:justify-self-center ${tallPlace[tall++ % 3]}`
          : `col-span-6 md:col-span-4 ${portrait++ % 2 === 0 ? "md:col-start-2" : "md:col-start-8 md:mt-[22vh]"}`,
    );
  }

  return (
    <section ref={root} id="gallery" className="px-4 py-[14vh] md:px-10">
      <SectionLabel index={index} placeholder={project.gallery.some((m) => m.alt.startsWith("Placeholder"))}>
        Gallery
      </SectionLabel>
      <div className="mt-10 grid grid-cols-12 gap-x-4 gap-y-[12vh] md:gap-x-8">
        {project.gallery.map((item, i) => {
          const place = places[i];
          return (
            <figure key={item.src} className={place}>
              <div data-frame className={`relative overflow-hidden will-change-transform ${item.wide ? "aspect-[16/10]" : item.tall ? "aspect-[9/16]" : "aspect-[3/4]"}`}>
                <div data-media className="absolute -inset-y-[10%] inset-x-0 will-change-transform">
                  <Media item={item} />
                </div>
              </div>
              {item.caption && (
                <figcaption data-caption className="mt-3 flex gap-3 text-[13px] leading-snug text-[var(--p-muted)] md:mt-4 md:gap-4 md:text-sm">
                  <span aria-hidden="true" className="shrink-0 pt-px font-mono text-[11px] tracking-wide md:text-xs">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="max-w-[46ch]">{item.caption}</span>
                </figcaption>
              )}
            </figure>
          );
        })}
      </div>
    </section>
  );
}

export function Media({ item, sizes }: { item: MediaItem; sizes?: string }) {
  const video = useRef<HTMLVideoElement>(null);

  // Videos only load and play while on screen.
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.preload = "auto";
        el.play().catch(() => {});
      } else el.pause();
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (item.living === "streaming-apps") return <StreamingApps label={item.alt} />;
  if (item.living === "connect-flow") return <ConnectFlow label={item.alt} />;
  if (item.living === "bloom-flow") return <BloomFlow label={item.alt} />;
  if (item.living === "demo-box") return <DemoBox label={item.alt} />;
  if (item.kind === "video") {
    return (
      <video
        ref={video}
        src={item.src}
        poster={item.poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={item.alt}
        className="h-full w-full object-cover"
      />
    );
  }
  return (
    <Image
      src={item.src}
      alt={item.alt}
      fill
      sizes={sizes ?? (item.wide ? (item.compact ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 80vw, 100vw") : "(min-width: 768px) 33vw, 50vw")}
      unoptimized={item.src.endsWith(".svg")}
      className={item.fit === "contain" ? "bg-white object-contain p-[3%]" : "object-cover"}
    />
  );
}

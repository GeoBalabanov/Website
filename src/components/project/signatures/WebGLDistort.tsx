"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { gsap } from "gsap";
import type { Project, Signature } from "@/data/projects";
import { useScene } from "@/lib/use-scene";
import { SectionLabel } from "../bits";
import type { SceneState } from "./CorsaScene";

type Data = Extract<Signature, { type: "webgl-distort" }>;

// Three.js is only downloaded on pages that use this section, and only when it's near the viewport.
const CorsaScene = dynamic(() => import("./CorsaScene"), { ssr: false });

const TRACKS = ["[Track one]", "[Track two]", "[Track three]"]; // PLACEHOLDER

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function WebGLDistort({ data }: { project: Project; data: Data }) {
  const root = useRef<HTMLElement>(null);
  const pinned = useRef<HTMLDivElement>(null);
  const state = useRef<SceneState>({ progress: 0, mouse: { x: 0.5, y: 0.5 }, active: 0 });
  const [mode, setMode] = useState<"static" | "webgl">("static");
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mobile, setMobile] = useState(false);

  // Decide once on the client: WebGL only with motion allowed and a GL context available.
  useEffect(() => {
    const ok = !window.matchMedia("(prefers-reduced-motion: reduce)").matches && webglAvailable();
    // Browser capabilities are only known after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobile(window.matchMedia("(max-width: 767px)").matches);
    if (!ok) return;
    const el = pinned.current!;
    const nearObs = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "100% 0px" });
    const visObs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    nearObs.observe(el);
    visObs.observe(el);
    setMode("webgl");
    return () => {
      nearObs.disconnect();
      visObs.disconnect();
    };
  }, []);

  useScene(root, ({ reduced, mobile }) => {
    if (reduced) return;
    const q = gsap.utils.selector(root);
    const items = q("[data-track]");
    const bar = q("[data-track-bar]")[0];
    let current = -1;
    const proxy = { p: 0 };
    gsap.to(proxy, {
      p: 1,
      ease: "none",
      scrollTrigger: { trigger: pinned.current, start: "top top", end: mobile ? "+=150%" : "+=220%", pin: true, scrub: 0.8 },
      onUpdate: () => {
        state.current.progress = proxy.p;
        gsap.set(bar, { scaleX: proxy.p });
        const idx = Math.min(items.length - 1, Math.round(proxy.p * (items.length - 1)));
        if (idx !== current) {
          current = idx;
          items.forEach((it, i) => it.toggleAttribute("data-active", i === idx));
        }
      },
    });

    // Pointer (mouse or finger) disturbs the image.
    const el = pinned.current!;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      state.current.mouse = { x: (e.clientX - r.left) / r.width, y: 1 - (e.clientY - r.top) / r.height };
      state.current.active = 1;
    };
    const leave = () => {
      state.current.active = 0;
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerdown", move);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerup", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerdown", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerup", leave);
    };
  });

  const srcs = data.images.map((i) => i.src);

  return (
    <section ref={root} aria-labelledby="corsa-title">
      <div ref={pinned} className="relative h-dvh touch-pan-y overflow-hidden bg-black">
        {mode === "static" ? (
          // Reduced motion / no WebGL: the three images, side by side.
          <div className="absolute inset-0 grid grid-cols-3">
            {data.images.map((img) => (
              <div key={img.src} className="relative">
                <Image src={img.src} alt={img.alt} fill sizes="33vw" unoptimized={img.src.endsWith(".svg")} className="object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="absolute inset-0">
            <Image src={srcs[0]} alt="" fill sizes="100vw" unoptimized={srcs[0].endsWith(".svg")} className="object-cover opacity-60" />
            {near && (
              <div className="absolute inset-0">
                <CorsaScene srcs={srcs} state={state} paused={!visible} mobile={mobile} />
              </div>
            )}
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-linear-to-b from-black/50 via-transparent to-black/70 px-4 pt-28 pb-8 md:px-10 md:pt-28">
          <div>
            <SectionLabel index="02">Signal</SectionLabel>
            <h2 id="corsa-title" className="font-display mt-4 max-w-[16ch] text-[clamp(1.6rem,4vw,3.75rem)] leading-[1.05] font-bold tracking-[0.02em] uppercase">
              Eyes on the road. Music in your voice.
            </h2>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="w-full max-w-sm">
              <p className="font-mono text-[11px] tracking-widest text-[var(--p-muted)] uppercase">Now playing</p>
              <ol className="mt-3 space-y-1.5">
                {TRACKS.map((t, i) => (
                  <li
                    key={t}
                    data-track
                    data-active={i === 0 ? "" : undefined}
                    className="font-display text-sm tracking-wider uppercase opacity-45 transition-opacity duration-300 data-[active]:text-[var(--p-accent)] data-[active]:opacity-100 md:text-base"
                  >
                    {String(i + 1).padStart(2, "0")} — {t}
                  </li>
                ))}
              </ol>
              <div aria-hidden="true" className="mt-4 h-[2px] bg-white/15">
                <div data-track-bar className="h-full origin-left scale-x-0 bg-[var(--p-accent)]" />
              </div>
            </div>
            <p className="max-w-[28ch] text-right font-mono text-xs tracking-wide text-[var(--p-muted)] uppercase">{data.caption}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

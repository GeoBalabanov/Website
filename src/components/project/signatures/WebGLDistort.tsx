"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { gsap } from "gsap";
import type { Project, Signature } from "@/data/projects";
import { useScene } from "@/lib/use-scene";
import { SectionLabel } from "../bits";
import type { SceneState } from "./CorsaScene";
import { usePreviewPlayer } from "./preview-player";

type Data = Extract<Signature, { type: "webgl-distort" }>;

// Three.js is only downloaded on pages that use this section, and only when it's near the viewport.
const CorsaScene = dynamic(() => import("./CorsaScene"), { ssr: false });


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
  const state = useRef<SceneState>({ progress: 0, mouse: { x: 0.5, y: 0.5 }, active: 0, level: 0 });
  const [mode, setMode] = useState<"static" | "webgl">("static");
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mobile, setMobile] = useState(false);
  const tracks = data.tracks ?? [];
  const onLevel = useCallback((l: number) => {
    state.current.level = l;
  }, []);
  const bar = useRef<HTMLDivElement>(null);
  // The progress bar is moved directly, so playback never re-renders the scene.
  const onProgress = useCallback((p: number) => {
    if (bar.current) bar.current.style.transform = `scaleX(${p})`;
  }, []);
  const player = usePreviewPlayer(tracks, onLevel, onProgress);
  const [scrolled, setScrolled] = useState(0);
  // The playing track leads; otherwise the one the scroll has reached.
  const highlighted = player.playing ?? scrolled;

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
    const count = Math.max(1, tracks.length);
    let current = -1;
    const proxy = { p: 0 };
    gsap.to(proxy, {
      p: 1,
      ease: "none",
      scrollTrigger: { trigger: pinned.current, start: "top top", end: mobile ? "+=150%" : "+=220%", pin: true, scrub: 0.8 },
      onUpdate: () => {
        state.current.progress = proxy.p;
        const idx = Math.min(count - 1, Math.round(proxy.p * (count - 1)));
        if (idx !== current) {
          current = idx;
          setScrolled(idx);
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

  // Stable, so the scene keeps its textures across re-renders.
  const srcs = useMemo(() => data.images.map((i) => i.src), [data.images]);

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

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between bg-linear-to-b from-black/50 via-transparent to-black/70 px-4 pt-28 pb-24 md:px-10 md:pt-28">
          <div>
            <SectionLabel index="02">Signal</SectionLabel>
            <h2 id="corsa-title" className="font-display mt-4 max-w-[16ch] text-[clamp(1.6rem,4vw,3.75rem)] leading-[1.05] font-bold tracking-[0.02em] uppercase">
              Eyes on the road. Music in your voice.
            </h2>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="w-full max-w-sm">
              <p className="font-mono text-[11px] tracking-widest text-[var(--p-muted)] uppercase">{player.playing !== null ? "Now playing" : "Press play"}</p>
              <ol className="pointer-events-auto mt-3 space-y-1">
                {tracks.map((t, i) => {
                  const on = i === highlighted;
                  const isPlaying = player.playing === i;
                  return (
                    <li key={t.appleId}>
                      <button
                        type="button"
                        onClick={() => (isPlaying ? player.stop() : player.play(i))}
                        aria-label={`${isPlaying ? "Pause" : "Play"} preview: ${t.title} by ${t.artist}`}
                        aria-pressed={isPlaying}
                        className={`group flex w-full items-center gap-3 py-1 text-left transition-opacity duration-300 ${on ? "opacity-100" : "opacity-45 hover:opacity-80"}`}
                      >
                        <span
                          aria-hidden="true"
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors ${isPlaying ? "border-[var(--p-accent)] bg-[var(--p-accent)] text-black" : "border-white/40 group-hover:border-[var(--p-accent)]"}`}
                        >
                          {isPlaying ? (
                            <svg viewBox="0 0 12 12" className="h-3 w-3" fill="currentColor"><rect x="2" y="1.5" width="3" height="9" rx="0.6" /><rect x="7" y="1.5" width="3" height="9" rx="0.6" /></svg>
                          ) : (
                            <svg viewBox="0 0 12 12" className="ml-0.5 h-3 w-3" fill="currentColor"><path d="M3 1.5v9l7.5-4.5z" /></svg>
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className={`font-display block truncate text-sm tracking-wider uppercase md:text-base ${on ? "text-[var(--p-accent)]" : ""}`}>
                            {String(i + 1).padStart(2, "0")} — {t.title}
                          </span>
                          <span className="block truncate font-mono text-[11px] tracking-wide text-[var(--p-muted)]">
                            {player.failed === i ? "Preview unavailable" : t.artist}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
              <div aria-hidden="true" className="mt-3 h-[2px] bg-white/15">
                <div ref={bar} className="h-full origin-left bg-[var(--p-accent)] transition-transform duration-200 ease-linear" style={{ transform: "scaleX(0)" }} />
              </div>
              {tracks[highlighted] && (
                <a
                  href={tracks[highlighted].url}
                  target="_blank"
                  rel="noreferrer"
                  className="pointer-events-auto mt-3 inline-block font-mono text-[10px] tracking-widest text-[var(--p-muted)] uppercase hover:text-[var(--p-fg)]"
                >
                  Preview via Apple Music ↗<span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
            </div>
            <p className="max-w-[28ch] text-right font-mono text-xs tracking-wide text-[var(--p-muted)] uppercase">{data.caption}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

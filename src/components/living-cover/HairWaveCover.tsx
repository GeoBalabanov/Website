"use client";

import { useEffect, useRef } from "react";
import { drawHairWave, makeStrands } from "./hair-wave";

/**
 * The Dating App cover, alive: a hairy sound wave that flows sideways while
 * its loudness swells and every strand trembles. Same seeded drawing as the
 * still (dating-app-1.jpg), so it takes over from it without a jump.
 */
export function HairWaveCover({ running }: { running: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const run = useRef(running);
  const kick = useRef<() => void>(() => {});

  useEffect(() => {
    run.current = running;
    if (running) kick.current();
  }, [running]);

  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    let strands: ReturnType<typeof makeStrands> = [];
    let raf = 0;
    let t0 = 0;
    let elapsed = 0;
    let alive = true;
    let lastDraw = 0;

    const resize = () => {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.max(1, Math.round(r.width * dpr));
      cv.height = Math.max(1, Math.round(r.height * dpr));
      const U = Math.min(cv.width, cv.height * 0.9) / 1000;
      strands = makeStrands(cv.width / U);
      drawHairWave(ctx, cv.width, cv.height, elapsed, strands);
    };
    const frame = (now: number) => {
      if (!alive || !run.current) {
        raf = 0;
        return;
      }
      if (!t0) t0 = now - elapsed * 1000;
      elapsed = (now - t0) / 1000;
      // 30 fps is plenty for this slow motion and halves the drawing work.
      if (now - lastDraw >= 31) {
        lastDraw = now;
        drawHairWave(ctx, cv.width, cv.height, elapsed, strands);
      }
      raf = requestAnimationFrame(frame);
    };
    kick.current = () => {
      if (!alive || raf) return;
      t0 = 0;
      raf = requestAnimationFrame(frame);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    if (run.current) kick.current();
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      kick.current = () => {};
    };
  }, []);

  return <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}

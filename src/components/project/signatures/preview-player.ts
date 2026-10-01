"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Plays official 30-second Apple Music previews (looked up by track id through the
 * public iTunes API) and measures their loudness with the Web Audio API, so visuals
 * can react to the actual music. Nothing plays until the visitor presses play.
 */
export type PreviewTrack = { appleId: number; title: string; artist: string; url: string };

const previewCache = new Map<number, Promise<string | null>>();
function previewUrl(id: number) {
  if (!previewCache.has(id)) {
    previewCache.set(
      id,
      fetch(`https://itunes.apple.com/lookup?id=${id}`)
        .then((r) => r.json())
        .then((d: { results?: { previewUrl?: string }[] }) => d.results?.[0]?.previewUrl ?? null)
        .catch(() => null),
    );
  }
  return previewCache.get(id)!;
}

export function usePreviewPlayer(tracks: PreviewTrack[], onLevel: (level: number) => void) {
  const [playing, setPlaying] = useState<number | null>(null);
  const [failed, setFailed] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const audio = useRef<HTMLAudioElement | null>(null);
  const graph = useRef<{ ctx: AudioContext; analyser: AnalyserNode; data: Uint8Array<ArrayBuffer> } | null>(null);
  const raf = useRef(0);
  const level = useRef(onLevel);
  // Lets the "ended" handler start the next track without referring to `play` itself.
  const next = useRef<(i: number) => void>(() => {});
  useEffect(() => {
    level.current = onLevel;
  }, [onLevel]);

  const stopMeter = () => {
    cancelAnimationFrame(raf.current);
    level.current(0);
  };

  const stop = useCallback(() => {
    audio.current?.pause();
    stopMeter();
    setPlaying(null);
  }, []);

  const play = useCallback(
    async (i: number) => {
      const track = tracks[i];
      if (!track) return;
      setFailed(null);
      // One audio element for the page, wired into an analyser on first use (needs a user gesture).
      if (!audio.current) {
        const el = new Audio();
        el.crossOrigin = "anonymous";
        el.preload = "auto";
        audio.current = el;
        try {
          const ctx = new AudioContext();
          const src = ctx.createMediaElementSource(el);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 512;
          analyser.smoothingTimeConstant = 0.75;
          src.connect(analyser);
          analyser.connect(ctx.destination);
          graph.current = { ctx, analyser, data: new Uint8Array(analyser.frequencyBinCount) };
        } catch {
          graph.current = null; // Plays without the visual reaction.
        }
      }
      const el = audio.current;
      el.pause();
      setPlaying(i);
      setProgress(0);
      const url = await previewUrl(track.appleId);
      if (!url) {
        setFailed(i);
        setPlaying(null);
        return;
      }
      el.src = url;
      el.onended = () => {
        stopMeter();
        // Auto-advance to the next track; stop after the last one.
        if (i + 1 < tracks.length) next.current(i + 1);
        else setPlaying(null);
      };
      el.ontimeupdate = () => setProgress(el.duration ? el.currentTime / el.duration : 0);
      el.onerror = () => {
        stopMeter();
        setFailed(i);
        setPlaying(null);
      };
      await graph.current?.ctx.resume();
      try {
        await el.play();
      } catch {
        setFailed(i);
        setPlaying(null);
        return;
      }
      // Loudness, weighted towards the bass, 0…1.
      cancelAnimationFrame(raf.current);
      const meter = () => {
        const g = graph.current;
        if (g) {
          g.analyser.getByteFrequencyData(g.data);
          let bass = 0;
          let all = 0;
          for (let k = 0; k < g.data.length; k++) {
            if (k < 12) bass += g.data[k];
            all += g.data[k];
          }
          level.current(Math.min(1, (bass / 12 / 255) * 0.7 + (all / g.data.length / 255) * 0.9));
        }
        raf.current = requestAnimationFrame(meter);
      };
      meter();
    },
    [tracks],
  );

  useEffect(() => {
    next.current = (i) => void play(i);
  }, [play]);

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      audio.current?.pause();
      void graph.current?.ctx.close();
    },
    [],
  );

  return { playing, failed, progress, play, stop };
}

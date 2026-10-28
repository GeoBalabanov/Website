"use client";

import { useEffect, useRef } from "react";

/**
 * A pre-rendered living cover: a short seamless loop (muted, inline) whose first
 * frame is the still beneath it. Plays only while `running`, and starts from the
 * beginning each time, so the fade in over the still never jumps.
 * `src` is the path without extension: a VP9 .webm first, an H.264 .mp4 for Safari.
 */
export function LoopVideo({ src, poster, running }: { src: string; poster: string; running: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (running) {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else v.pause();
  }, [running]);

  return (
    <video ref={ref} poster={poster} muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover">
      <source src={`${src}.webm`} type="video/webm" />
      <source src={`${src}.mp4`} type="video/mp4" />
    </video>
  );
}

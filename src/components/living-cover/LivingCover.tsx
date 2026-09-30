"use client";

import { useSyncExternalStore } from "react";
import type { CoverMotion } from "@/data/projects";
import { BloomCover, DriftCover, LavaCover, RippleCover, TracksCover, TypingCover, VoiceCover } from "./art";
import { CardCover, DuskBloomCover, EmberCover, GridCover, NightTracksCover, PlaybackCover, RingsCover, RouteCover, WaveCover } from "./art-more";
import { HillsCover, LoadedCover } from "./art-madrid";
import { FlagWave } from "./FlagWave";
import { CorsaStage } from "@/components/project/hero-scenes/CorsaStage";
import s from "./LivingCover.module.css";

// Browser state as external stores: SSR renders the animated markup, the client corrects it.
const reducedQuery = "(prefers-reduced-motion: reduce)";
function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(reducedQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function subscribeVisibility(cb: () => void) {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
}

type Props = {
  motion: CoverMotion;
  /** The still cover (used by the generic "drift" motion). */
  src: string;
  /** Only the active cover moves; others fade back to the still and freeze. */
  active: boolean;
};

/**
 * A "living poster" laid over a still cover. It sits on top of the still
 * image (which stays in place for the grid transition and as the fallback)
 * and fades in when its project becomes active.
 */
export function LivingCover({ motion, src, active }: Props) {
  const reduced = useSyncExternalStore(subscribeReduced, () => window.matchMedia(reducedQuery).matches, () => false);
  const hidden = useSyncExternalStore(subscribeVisibility, () => document.hidden, () => false);

  // Reduced motion: the still cover, exactly as it is.
  if (reduced) return null;

  const running = active && !hidden;
  return (
    <div className={s.root} data-active={active ? "" : undefined} data-paused={hidden ? "" : undefined} aria-hidden="true">
      {motion === "lava" && <LavaCover />}
      {motion === "tracks" && <TracksCover />}
      {motion === "typing" && <TypingCover />}
      {motion === "voice" && <VoiceCover running={running} />}
      {motion === "ripple" && <RippleCover />}
      {motion === "bloom" && <BloomCover />}
      {motion === "drift" && <DriftCover src={src} />}
      {motion === "route" && <RouteCover />}
      {motion === "ember" && <EmberCover />}
      {motion === "night-tracks" && <NightTracksCover />}
      {motion === "grid" && <GridCover />}
      {motion === "card" && <CardCover />}
      {motion === "wave" && <WaveCover running={running} />}
      {motion === "playback" && <PlaybackCover />}
      {motion === "rings" && <RingsCover />}
      {motion === "dusk-bloom" && <DuskBloomCover />}
      {/* The flag waves in the wind (WebGL): only mounted while its cover is the active one. */}
      {motion === "flag" && active && <FlagWave src={src} running={running} rasterWidth={900} />}
      {motion === "hills" && <HillsCover />}
      {motion === "loaded" && <LoadedCover />}
      {/* Live 3D: only mounted while its cover is the active one (one WebGL scene at a time). */}
      {motion === "head3d" && active && <CorsaStage paused={!running} />}
    </div>
  );
}

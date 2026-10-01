"use client";

import { AI_BG, AI_BOOK, AI_BOOK_WIDE, AI_GRAIN } from "./ai-layers";
import { BloomCover, LavaCover } from "./art";
import { CollageCover } from "./CollageCover";
import { COLLAGE_LAYERS_WIDE } from "./collage-layers";
import { HairWaveCover } from "./HairWaveCover";
import { LayeredCover } from "./LayeredCover";
import { SkyLife } from "./SkyLife";
import type { CoverMotion } from "@/data/projects";
import s from "./LivingCover.module.css";

/** Which cover animations can also play full-screen behind a project hero. */
export const HERO_LIVING: CoverMotion[] = ["ai-book", "hairwave", "bloom", "collage", "lava", "sky"];

/**
 * A project's living cover, playing behind its page hero. `wide`: the hero shows
 * the landscape still (tablet and up), so wide layers are used where they exist;
 * portrait art is fitted like object-fit: cover, matching the still beneath it.
 */
export function HeroLiving({ motion, wide, running }: { motion: CoverMotion; wide: boolean; running: boolean }) {
  // Portrait art (900×1200) centred and cropped like the still's object-cover.
  const portrait = (art: React.ReactNode) => (
    <div className="absolute top-1/2 left-1/2 aspect-[3/4] w-[max(100%,75dvh)] -translate-x-1/2 -translate-y-1/2">{art}</div>
  );
  let art: React.ReactNode = null;
  if (motion === "hairwave") art = <HairWaveCover running={running} />;
  else if (motion === "ai-book")
    art = wide ? <LayeredCover layers={AI_BOOK_WIDE} bg={AI_BG} grain={AI_GRAIN} viewBox="0 0 1600 1000" /> : portrait(<LayeredCover layers={AI_BOOK} bg={AI_BG} grain={AI_GRAIN} />);
  else if (motion === "collage") art = wide ? <CollageCover layers={COLLAGE_LAYERS_WIDE} viewBox="0 0 1600 1000" /> : portrait(<CollageCover />);
  else if (motion === "bloom") art = portrait(<BloomCover />);
  else if (motion === "lava") art = portrait(<LavaCover />);
  // Only the light moves over the hero's own photo (portrait or wide), so no photo here.
  else if (motion === "sky") art = <SkyLife />;
  if (!art) return null;
  return (
    <div className={s.root} data-active="" data-paused={running ? undefined : ""} aria-hidden="true">
      {art}
    </div>
  );
}

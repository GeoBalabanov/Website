"use client";

import { useId } from "react";
import { Frame, svgProps } from "./art";
import { COLLAGE_LAYERS, PAPER } from "./collage-layers";
import s from "./LivingCover.module.css";

/**
 * 02 Marathon running: a photocopied collage (public/projects/marathon-running-1.svg),
 * alive. Each part is its own layer, so animating one never re-blurs the others:
 * the white shape breathes in its blue block under a photocopier light, sunset
 * streaks drift past, specks twinkle, a door of light flickers, and the figure in
 * the triangle breathes in its green halo.
 */
const MOTION: Record<string, string | undefined> = {
  burst: s.cburst,
  scan: s.cscan,
  streaks: s.cstreaks,
  twinkle0: s.twinkle,
  twinkle1: s.twinkle,
  twinkle2: s.twinkle,
  door: s.cflicker,
  halo: s.chalo,
  figure: s.cfigure,
};
const TWINKLE_DELAY: Record<string, string> = { twinkle0: "0s", twinkle1: "0.8s", twinkle2: "1.6s" };

export function CollageCover() {
  const uid = useId().replace(/:/g, "");
  return (
    <Frame bg={PAPER} grain={0.14}>
      {COLLAGE_LAYERS.map((l) => {
        const art = (
          <div
            className={`${s.fill} ${MOTION[l.id] ?? ""}`}
            style={{ transformOrigin: l.origin, "--shift": l.shift, "--delay": TWINKLE_DELAY[l.id] } as React.CSSProperties}
          >
            {/* overflow visible: the sliding streaks draw a second copy past the right edge (the clip keeps them in their strip). */}
            <svg {...svgProps} style={{ overflow: "visible" }} dangerouslySetInnerHTML={{ __html: l.svg.replaceAll("ID-", `${uid}-${l.id}-`) }} />
          </div>
        );
        return l.clip ? (
          <div key={l.id} className={s.fill} style={{ clipPath: l.clip }}>
            {art}
          </div>
        ) : (
          <div key={l.id} className={s.fill}>
            {art}
          </div>
        );
      })}
    </Frame>
  );
}

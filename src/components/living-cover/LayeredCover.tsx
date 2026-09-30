"use client";

import { useId } from "react";
import { Frame, svgProps } from "./art";
import s from "./LivingCover.module.css";

/**
 * A poster made of generated SVG layers (see ai-layers.ts), each on its own
 * compositor layer so animating one never re-blurs the others. A layer can be
 * clipped (static, CSS clip-path), animated (a class from LivingCover.module.css)
 * around its own origin, and given CSS variables for its keyframes.
 */
export type Layer = {
  id: string;
  svg: string;
  motion?: string;
  clip?: string;
  origin?: string;
  vars?: Record<string, string | number>;
};

export function LayeredCover({ layers, bg, grain }: { layers: Layer[]; bg: string; grain: number }) {
  const uid = useId().replace(/:/g, "");
  return (
    <Frame bg={bg} grain={grain} vignette>
      {layers.map((l) => {
        const art = (
          <div className={`${s.fill} ${l.motion ? (s[l.motion] ?? "") : ""}`} style={{ transformOrigin: l.origin, ...l.vars } as React.CSSProperties}>
            <svg {...svgProps} style={{ overflow: "visible" }} dangerouslySetInnerHTML={{ __html: l.svg.replaceAll("ID-", `${uid}-${l.id}-`) }} />
          </div>
        );
        return (
          <div key={l.id} className={s.fill} style={l.clip ? { clipPath: l.clip } : undefined}>
            {art}
          </div>
        );
      })}
    </Frame>
  );
}

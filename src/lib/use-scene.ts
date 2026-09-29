"use client";

import { useLayoutEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export type SceneConditions = { reduced: boolean; mobile: boolean };

/**
 * Runs a GSAP setup scoped to `scope`, re-running it when reduced-motion or
 * the mobile breakpoint changes. Everything created inside (tweens,
 * ScrollTriggers, SplitText) is reverted on unmount.
 */
export function useScene(
  scope: RefObject<HTMLElement | null>,
  setup: (c: SceneConditions) => void | (() => void),
  deps: unknown[] = [],
) {
  useLayoutEffect(() => {
    if (!scope.current) return;
    const mm = gsap.matchMedia(scope.current);
    // `always` guarantees the setup runs: with object conditions GSAP only fires when at least one query matches.
    mm.add({ always: "all", reduced: "(prefers-reduced-motion: reduce)", mobile: "(max-width: 767px)" }, (ctx) => {
      const { reduced, mobile } = ctx.conditions as SceneConditions;
      return setup({ reduced: !!reduced, mobile: !!mobile });
    });
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";
import { projects } from "@/data/projects";
import { prefersReducedMotion } from "@/lib/motion";
import { scrollToImmediate } from "@/components/SmoothScroll";

/**
 * Shared-element transition between a project thumbnail (slider / grid /
 * next-project preview) and the full-screen hero of its project page.
 *
 * A fixed overlay holds a copy of the image. Opening: the overlay starts
 * clipped to the thumbnail's rectangle and expands to the viewport, then the
 * route changes underneath and the overlay fades once the hero has loaded.
 * Closing runs the same thing backwards onto the thumbnail on the index page.
 *
 * Only transform, opacity and clip-path are animated (no layout).
 */

type Rect = { left: number; top: number; width: number; height: number };

/** Parts of a project page a link can open straight onto. */
export type ProjectSection = "story" | "gallery";

type Ctx = {
  /** Expand `from` (an element containing an <img>) into the page of `slug`, optionally onto one of its sections. */
  open: (slug: string, from: HTMLElement, section?: ProjectSection) => void;
  /** Leave a project page, shrinking the hero back onto its thumbnail. */
  close: (slug: string) => void;
  /** Called by the project hero once its image has loaded. */
  heroReady: (slug: string) => void;
  /** Called by a project page once it has scrolled to the section it was opened on. */
  sectionReady: (slug: string) => void;
};

const TransitionContext = createContext<Ctx | null>(null);

export function useProjectTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useProjectTransition must be used inside <ProjectTransitionProvider>");
  return ctx;
}

const isIndex = (path: string) => path === "/" || path === "/grid";
const projectSlug = (path: string) => (path.startsWith("/projects/") ? path.split("/")[2] : null);

/** Box an image of natural size nw×nh occupies when object-fit: cover'd into `r`. */
function coverBox(nw: number, nh: number, r: Rect): Rect {
  const s = Math.max(r.width / nw, r.height / nh);
  const width = nw * s;
  const height = nh * s;
  return { left: r.left + (r.width - width) / 2, top: r.top + (r.height - height) / 2, width, height };
}

const viewport = (): Rect => ({ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight });

const insetFor = (r: Rect) => {
  const v = viewport();
  return `inset(${r.top}px ${v.width - r.left - r.width}px ${v.height - r.top - r.height}px ${r.left}px)`;
};

function visibleTarget(slug: string): HTMLElement | null {
  const els = document.querySelectorAll<HTMLElement>(`[data-flip-id="${slug}"]`);
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

// While the overlay is up, swallow wheel/touch scrolling (capture phase, before Lenis sees it)
// so momentum from the old page can't scroll the new one.
const swallow = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();
};
function blockScroll() {
  window.addEventListener("wheel", swallow, { capture: true, passive: false });
  window.addEventListener("touchmove", swallow, { capture: true, passive: false });
}
/** Unblock once trackpad/wheel momentum from before the transition has died down. */
function unblockWhenQuiet() {
  let timer = window.setTimeout(release, 250);
  function onWheel() {
    window.clearTimeout(timer);
    timer = window.setTimeout(release, 250);
  }
  function release() {
    window.removeEventListener("wheel", onWheel, { capture: true });
    window.removeEventListener("wheel", swallow, { capture: true });
    window.removeEventListener("touchmove", swallow, { capture: true });
  }
  window.addEventListener("wheel", onWheel, { capture: true, passive: true });
}

export function ProjectTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const overlay = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const natural = useRef({ w: 3, h: 4 });
  const phase = useRef<"idle" | "opening" | "await-hero" | "closing">("idle");
  const readySlug = useRef<string | null>(null);
  const origin = useRef<"/" | "/grid">("/");
  const closingSlug = useRef<string | null>(null);
  const prevPath = useRef(pathname);
  const tl = useRef<gsap.core.Timeline | null>(null);

  // While the overlay is up: mark the document (templates skip their fade) and block scrolling.
  const setFlag = (on: boolean) => {
    if (on) {
      if (document.documentElement.dataset.flip !== "on") blockScroll();
      document.documentElement.dataset.flip = "on";
    } else {
      delete document.documentElement.dataset.flip;
      unblockWhenQuiet();
    }
  };

  /** Place the overlay image so it looks exactly like `src` cover-fitted into `r`. */
  const placeAt = useCallback((r: Rect) => {
    const full = coverBox(natural.current.w, natural.current.h, viewport());
    const box = coverBox(natural.current.w, natural.current.h, r);
    return {
      clip: insetFor(r),
      img: { x: box.left - full.left, y: box.top - full.top, scale: box.width / full.width },
    };
  }, []);

  const show = useCallback((src: string, w: number, h: number) => {
    const img = image.current!;
    natural.current = { w: w || 3, h: h || 4 };
    const full = coverBox(natural.current.w, natural.current.h, viewport());
    img.src = src;
    Object.assign(img.style, {
      left: `${full.left}px`,
      top: `${full.top}px`,
      width: `${full.width}px`,
      height: `${full.height}px`,
    });
    gsap.set(overlay.current, { autoAlpha: 1 });
  }, []);

  const hide = useCallback((duration = 0.35) => {
    tl.current?.kill();
    tl.current = gsap.timeline().to(overlay.current, {
      autoAlpha: 0,
      duration,
      ease: "power1.out",
      onComplete: () => {
        gsap.set(overlay.current, { clipPath: "inset(0px 0px 0px 0px)" });
        gsap.set(image.current, { clearProps: "transform" });
        phase.current = "idle";
        setFlag(false);
      },
    });
  }, []);

  // Opening onto a section: the overlay waits for the page to scroll there, not for the hero.
  const awaitSection = useRef(false);

  const heroReady = useCallback(
    (slug: string) => {
      if (awaitSection.current) return;
      readySlug.current = slug;
      if (phase.current === "await-hero") hide();
    },
    [hide],
  );

  const sectionReady = useCallback(
    (slug: string) => {
      if (!awaitSection.current) return;
      awaitSection.current = false;
      readySlug.current = slug;
      if (phase.current === "await-hero") hide();
    },
    [hide],
  );

  const open = useCallback(
    (slug: string, from: HTMLElement, section?: ProjectSection) => {
      const href = `/projects/${slug}${section ? `#${section}` : ""}`;
      // The slider stacks several images in one frame: use the one that is visible.
      const imgs = Array.from(from.querySelectorAll("img"));
      const src = imgs.find((i) => getComputedStyle(i).visibility !== "hidden") ?? imgs[0];
      if (prefersReducedMotion() || !src) {
        router.push(href);
        return;
      }
      if (isIndex(window.location.pathname)) origin.current = window.location.pathname as "/" | "/grid";

      const r = from.getBoundingClientRect();
      show(src.currentSrc || src.src, src.naturalWidth, src.naturalHeight);
      const start = placeAt(r);
      gsap.set(overlay.current, { clipPath: start.clip });
      gsap.set(image.current, { ...start.img, transformOrigin: "0 0" });

      readySlug.current = null;
      awaitSection.current = !!section;
      phase.current = "opening";
      setFlag(true);
      router.prefetch(href);

      tl.current?.kill();
      tl.current = gsap
        .timeline({
          defaults: { duration: 1, ease: "expo.inOut" },
          onComplete: () => {
            phase.current = "await-hero";
            router.push(href);
            // Fade even if the hero never reports (slow network): never leave the overlay stuck.
            gsap.delayedCall(2.5, () => {
              awaitSection.current = false;
              if (phase.current === "await-hero") hide();
            });
            if (readySlug.current === slug) hide();
          },
        })
        .to(overlay.current, { clipPath: "inset(0px 0px 0px 0px)" }, 0)
        .to(image.current, { x: 0, y: 0, scale: 1 }, 0);
    },
    [router, show, placeAt, hide],
  );

  /** Shrink the (already visible, full-screen) overlay onto the thumbnail of `slug`. */
  const shrinkTo = useCallback(
    (slug: string) => {
      let frames = 0;
      const attempt = () => {
        const target = visibleTarget(slug);
        if (!target) {
          if (++frames < 45) requestAnimationFrame(attempt);
          else hide();
          return;
        }
        // Bring grid items into view before measuring.
        let r = target.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight) {
          scrollToImmediate(window.scrollY + r.top - (window.innerHeight - r.height) / 2);
          r = target.getBoundingClientRect();
        }
        const end = placeAt(r);
        tl.current?.kill();
        tl.current = gsap
          .timeline({ defaults: { duration: 0.8, ease: "expo.inOut" }, onComplete: () => hide(0.2) })
          .to(overlay.current, { clipPath: end.clip }, 0)
          .to(image.current, { ...end.img }, 0);
      };
      requestAnimationFrame(attempt);
    },
    [placeAt, hide],
  );

  const close = useCallback(
    (slug: string) => {
      const href = origin.current === "/grid" ? "/grid" : `/#${slug}`;
      const project = projects.find((p) => p.slug === slug);
      const hero = document.querySelector<HTMLImageElement>("[data-hero-media] img");
      if (prefersReducedMotion() || !project || !hero) {
        router.push(href);
        return;
      }
      show(hero.currentSrc || hero.src, hero.naturalWidth, hero.naturalHeight);
      gsap.set(overlay.current, { clipPath: "inset(0px 0px 0px 0px)" });
      gsap.set(image.current, { x: 0, y: 0, scale: 1, transformOrigin: "0 0" });
      // Mid-page: fade the hero in first rather than jumping to it.
      if (window.scrollY > window.innerHeight * 0.5) gsap.from(overlay.current, { autoAlpha: 0, duration: 0.25 });
      phase.current = "closing";
      closingSlug.current = slug;
      setFlag(true);
      router.push(href);
    },
    [router, show],
  );

  // Route changes: leaving a project page for the index (Back button, browser back, header links).
  useEffect(() => {
    const from = projectSlug(prevPath.current);
    prevPath.current = pathname;
    if (!from || !isIndex(pathname)) return;

    if (phase.current === "closing" && closingSlug.current === from) {
      shrinkTo(from);
    } else if (phase.current === "idle" && !prefersReducedMotion()) {
      // Browser back / header link: start from a full-screen hero, then shrink.
      const project = projects.find((p) => p.slug === from);
      if (!project) return;
      show(project.images[0].src, 900, 1200);
      gsap.set(overlay.current, { clipPath: "inset(0px 0px 0px 0px)" });
      gsap.set(image.current, { x: 0, y: 0, scale: 1, transformOrigin: "0 0" });
      phase.current = "closing";
      setFlag(true);
      shrinkTo(from);
    }
  }, [pathname, shrinkTo, show]);

  const value = useMemo(() => ({ open, close, heroReady, sectionReady }), [open, close, heroReady, sectionReady]);

  return (
    <TransitionContext.Provider value={value}>
      {children}
      <div
        ref={overlay}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[25] overflow-hidden"
        style={{ visibility: "hidden", opacity: 0 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- plain img: must reuse the exact cached URL of the thumbnail */}
        <img ref={image} alt="" className="absolute max-w-none object-cover will-change-transform" />
      </div>
    </TransitionContext.Provider>
  );
}

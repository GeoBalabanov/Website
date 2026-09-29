"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/data/site";
import { setGradient, useGradient } from "@/lib/gradient-store";

export function Header() {
  const pathname = usePathname();
  const gradient = useGradient();

  // Project pages have their own colors: the header floats over them in difference mode.
  const overlay = pathname.startsWith("/projects/");

  const toggle = (active: boolean) =>
    overlay ? "nav-link" : `nav-link ${active ? "text-ink" : "text-ink/80 hover:text-ink"}`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 px-4 pt-4 pb-6 text-[14px] font-medium md:text-[15px] tracking-[-0.01em] md:px-6 md:pt-5 ${
        overlay ? "text-white mix-blend-difference" : "bg-linear-to-b from-paper via-paper/90 to-paper/0"
      }`}
    >
      <div className="flex items-center justify-between gap-x-4 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center">
        <Link href="/" className="nav-link justify-self-start">
          {site.name}
        </Link>

        <nav aria-label="Main" className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 md:justify-center md:gap-x-6">
          <div role="group" aria-label="Background" className="flex items-center gap-1.5">
            <button type="button" className={toggle(!gradient)} aria-pressed={!gradient} onClick={() => setGradient(false)}>
              Plain
            </button>
            <span aria-hidden="true" className={overlay ? "opacity-60" : "text-mute"}>/</span>
            <button type="button" className={toggle(gradient)} aria-pressed={gradient} onClick={() => setGradient(true)}>
              Gradient
            </button>
          </div>

          <div role="group" aria-label="Project view" className="flex items-center gap-1.5">
            <Link href="/" className={toggle(pathname === "/")} aria-current={pathname === "/" ? "page" : undefined}>
              Slider
            </Link>
            <span aria-hidden="true" className={overlay ? "opacity-60" : "text-mute"}>/</span>
            <Link href="/grid" className={toggle(pathname === "/grid")} aria-current={pathname === "/grid" ? "page" : undefined}>
              Grid
            </Link>
          </div>

          <Link href="/about" className={toggle(pathname === "/about")} aria-current={pathname === "/about" ? "page" : undefined}>
            About
          </Link>
        </nav>

        <p className="hidden leading-snug md:block md:justify-self-end">{site.tagline}</p>
      </div>
    </header>
  );
}

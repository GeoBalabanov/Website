import type { Metadata } from "next";
import Link from "next/link";
import { about, footer, palette, site } from "@/data/site";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <main id="main" tabIndex={-1} className="flex min-h-dvh flex-col px-4 pt-32 pb-10 outline-none md:px-6 md:pt-40">
      <h1 className="sr-only">About {site.fullName}</h1>

      <div className="about-paragraphs max-w-[62rem] space-y-[0.9em] font-serif text-[clamp(1.6rem,2.35vw,2.75rem)] leading-[1.18] tracking-[-0.012em]">
        {about.map((paragraph, i) => (
          // Focusable so keyboard users get the same highlight as hovering.
          <p key={i} tabIndex={0} className={`rounded-sm ${i === 0 ? "indent-[3em]" : ""}`}>
            {paragraph.map((seg, j) =>
              seg.href ? (
                <Link key={j} href={seg.href} className="underline decoration-1 underline-offset-[0.15em] hover:decoration-2">
                  {seg.text}
                </Link>
              ) : seg.muted ? (
                <span key={j} className="opacity-50">
                  {seg.text}
                </span>
              ) : (
                <span key={j}>{seg.text}</span>
              ),
            )}
          </p>
        ))}
      </div>

      <p className="mt-8 font-serif text-lg text-mute-ink" aria-hidden="true">
        Hover over the paragraphs
      </p>

      <footer className="mt-auto grid grid-cols-2 gap-x-6 gap-y-12 pt-28 text-sm sm:grid-cols-3 lg:grid-cols-5">
        {footer.map((col) => (
          <section key={col.title}>
            <h2 className="mb-10 font-medium text-mute-ink lg:mb-16">{col.title}</h2>
            <ul className="space-y-1 font-medium">
              {col.items.map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <a href={item.href} target="_blank" rel="noreferrer" className="nav-link">
                      {item.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    item.label
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section>
          <h2 className="mb-10 font-medium text-mute-ink lg:mb-16">Color Palette</h2>
          <ul className="space-y-1.5 font-medium">
            {palette.map((c) => (
              <li key={c.hex} className="flex items-center gap-2">
                {c.name}:
                <span
                  className="rounded-[2px] px-1.5 py-px font-mono text-xs"
                  style={{
                    background: c.hex,
                    color: c.hex === "#f7f7f2" ? "#111111" : "#ffffff",
                    boxShadow: c.hex === "#f7f7f2" ? "inset 0 0 0 1px rgb(17 17 17 / 0.15)" : undefined,
                  }}
                >
                  {c.hex}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </footer>
    </main>
  );
}

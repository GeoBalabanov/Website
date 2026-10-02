import type { Metadata, Viewport } from "next";
import { EB_Garamond, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { GradientBackdrop } from "@/components/GradientBackdrop";
import { Header } from "@/components/Header";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ProjectTransitionProvider } from "@/components/transition/ProjectTransition";
import { site } from "@/data/site";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const garamond = EB_Garamond({ subsets: ["latin"], variable: "--font-garamond", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-face", display: "swap", weight: ["400"] });

export const metadata: Metadata = {
  title: { default: `${site.fullName} — ${site.tagline}`, template: `%s — ${site.fullName}` },
  description: site.description,
  // Link previews (LinkedIn, X, chats); the image is app/opengraph-image.jpg.
  openGraph: { type: "website", siteName: site.fullName, title: `${site.fullName} — ${site.tagline}`, description: site.description },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#f7f7f2",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${garamond.variable} ${mono.variable}`}>
      <body className="font-sans text-ink">
        <a
          href="#main"
          className="fixed left-4 top-4 z-50 -translate-y-24 bg-ink px-3 py-2 text-sm text-paper transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <ProjectTransitionProvider>
          <SmoothScroll />
          <GradientBackdrop />
          <Header />
          {children}
        </ProjectTransitionProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Serif } from "next/font/google";

const sans = Archivo({ subsets: ["latin", "latin-ext"], axes: ["wdth"], variable: "--ff-sans", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin", "latin-ext"], weight: "400", style: ["normal", "italic"], variable: "--ff-serif", display: "swap" });

export const metadata: Metadata = {
  title: "Fit Finder — Your size is a lie",
  description:
    "Fit Finder translates a jacket you already own into your size at any other brand. A concept for fashion e-commerce by Georgi Balabanov.",
  openGraph: {
    title: "Fit Finder — Your size is a lie",
    description: "One jacket that fits you, your size at every other brand. A sizing concept for fashion e-commerce.",
  },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function FitFinderLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${sans.variable} ${serif.variable}`}>{children}</div>;
}

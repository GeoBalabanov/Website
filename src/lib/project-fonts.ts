import { Anton, Barlow_Condensed, Bricolage_Grotesque, Fraunces, Instrument_Serif, Space_Grotesk, Syncopate, Syne } from "next/font/google";
import type { FontKey } from "@/data/projects";

// Display fonts for the project pages. Not preloaded: each page only downloads the one it uses.
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", preload: false });
const barlow = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "800"],
  style: ["normal", "italic"],
  variable: "--font-barlow",
  display: "swap",
  preload: false,
});
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap", preload: false });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap", preload: false });
const syncopate = Syncopate({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-syncopate", display: "swap", preload: false });
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
  preload: false,
});

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap", preload: false });

// Anton: the closest free match to Nike's condensed campaign lettering (Nike's own faces are licensed only to Nike).
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", display: "swap", preload: false });

const fonts = { fraunces, barlow, grotesk, syne, syncopate, instrument, bricolage, anton };

/** Class that defines the CSS variable, and the family to use for display text. */
export function projectFont(key: FontKey) {
  const f = fonts[key];
  return { className: f.variable, family: f.style.fontFamily };
}

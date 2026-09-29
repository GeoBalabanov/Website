/** Site-wide copy: header, About page and footer. */

export const site = {
  name: "Georgi",
  fullName: "Georgi Balabanov",
  tagline: "Design-Driven Developer & Marathon Runner",
  description:
    "Georgi Balabanov is a design-driven developer and marathon runner, interested in fashion, brutalist design and turning concepts into usable products.",
};

/**
 * About paragraphs. Each paragraph is a list of segments so parts can be
 * styled: `muted` renders gray (like an aside), `href` renders a link.
 */
export type Segment = { text: string; muted?: boolean; href?: string };

export const about: Segment[][] = [
  [
    { text: "Georgi Balabanov is a Design-Driven Developer, deeply interested in fashion, brutalist design and turning concepts into " },
    { text: "(actually) ", muted: true },
    { text: "usable products — and more." },
  ],
  [
    { text: "He is also an athlete who runs marathons. For the past few months he has been organizing the " },
    { text: "Plovdiv Marathon", href: "/#plovdiv-marathon" },
    { text: " in Plovdiv, Bulgaria, bringing the same care for detail from the screen to the start line." },
  ],
  [
    { text: "Whether it is a garment, a concrete façade or an interface, he is drawn to work that is honest about how it is made. Ideas only count once someone can " },
    { text: "(really) ", muted: true },
    { text: "use them." },
  ],
];

export type FooterItem = { label: string; href?: string };

export const footer: { title: string; items: FooterItem[] }[] = [
  {
    title: "Useful Links",
    items: [
      { label: "GitHub", href: "https://github.com/geobalabanov" },
      // TODO: replace with your profile URLs
      { label: "LinkedIn", href: "https://www.linkedin.com/" },
      { label: "Instagram", href: "https://www.instagram.com/" },
      { label: "Strava", href: "https://www.strava.com/" },
    ],
  },
  {
    title: "Tech Stack",
    items: [{ label: "Next.js" }, { label: "TypeScript" }, { label: "Tailwind CSS" }, { label: "GSAP" }, { label: "Lenis" }],
  },
  {
    title: "Inspiration",
    items: [{ label: "Swiss Design" }, { label: "Archival Fashion" }, { label: "Brutalist Architecture" }, { label: "Long-distance Running" }],
  },
  {
    title: "Typography",
    items: [{ label: "Plus Jakarta Sans" }, { label: "EB Garamond" }, { label: "JetBrains Mono" }],
  },
];

export const palette = [
  { name: "Light", hex: "#f7f7f2" },
  { name: "Dark", hex: "#111111" },
  { name: "Secondary", hex: "#71717b" },
];

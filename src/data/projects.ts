/**
 * Every project on the site lives here. The slider, the grid and the
 * project pages (/projects/[slug]) all read from this list, in this order.
 *
 * To add a project, append one entry. The homepage only needs:
 *   slug, number, title, subtitle, images (first image = cover), link?
 * The project page additionally uses:
 *   year, role, location, intro, facts, gallery   → shared page sections
 *   theme                                          → colors + font of the page
 *   signature                                      → which signature section to show
 *
 * A new project can reuse any existing signature `type` with its own data,
 * or you can add a new type in src/components/project/signatures.
 *
 * Everything marked PLACEHOLDER is sample content: swap it for the real thing.
 */

export type ProjectImage = {
  src: string;
  alt: string;
};

export type MediaItem = ProjectImage & {
  /** Defaults to "image". Videos autoplay muted when in view. */
  kind?: "image" | "video";
  /** Poster frame for videos. */
  poster?: string;
  /** Landscape item (16:10) instead of portrait (3:4). */
  wide?: boolean;
};

export type Fact = {
  value: number;
  label: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
};

export type FontKey = "fraunces" | "barlow" | "grotesk" | "syne" | "syncopate" | "instrument";

export type ProjectTheme = {
  bg: string;
  fg: string;
  /** Secondary text. Keep it at least 4.5:1 against bg. */
  muted: string;
  accent: string;
  accent2: string;
  /** Display font for titles. Body text stays Plus Jakarta Sans. */
  font: FontKey;
  /** Extra classes for the big hero title, e.g. "uppercase italic". */
  titleClass?: string;
};

export type RaceResult = {
  race: string;
  date: string;
  time: string;
  pace: string;
  splits: { label: string; time: string }[];
};

export type Signature =
  | {
      type: "route-map";
      distanceKm: number;
      raceDate: { label: string; /** ISO date-time, e.g. "2027-04-18T08:00:00+03:00". Empty = countdown shows dashes. */ iso: string };
      registerUrl: string;
    }
  | { type: "pulse-results"; restingBpm: number; peakBpm: number; results: RaceResult[] }
  | { type: "horizontal-steps"; steps: { title: string; text: string }[] }
  | { type: "kinetic-type"; words: string[]; caption: string }
  | { type: "webgl-distort"; images: ProjectImage[]; caption: string }
  | { type: "bloom-garden"; total: number; notes: string[] };

export type Project = {
  slug: string;
  number: string;
  title: string;
  subtitle: string;
  images: ProjectImage[];
  link?: string;

  year: string;
  role: string;
  location: string;
  intro: string;
  theme: ProjectTheme;
  signature: Signature;
  gallery: MediaItem[];
  facts: Fact[];
};

const img = (slug: string, name: string, alt: string, wide = false): MediaItem => ({
  src: `/projects/${slug}-${name}.svg`,
  alt,
  wide,
});

export const projects: Project[] = [
  {
    slug: "plovdiv-marathon",
    number: "01",
    title: "Plovdiv Marathon",
    subtitle: "Organizer · Plovdiv, Bulgaria",
    images: [
      { src: "/projects/plovdiv-marathon-1.svg", alt: "Warm orange glow on a black poster background" },
      { src: "/projects/plovdiv-marathon-2.svg", alt: "Dotted marathon route drawn across a cream background" },
      { src: "/projects/plovdiv-marathon-3.svg", alt: "Soft coral light on a deep red background" },
    ],
    year: "2026",
    role: "Organizer",
    location: "Plovdiv, Bulgaria",
    // PLACEHOLDER intro
    intro:
      "Organizing a full marathon through Plovdiv, one of the oldest continuously inhabited cities in Europe. The route winds from the Old Town across the Maritsa and back, and every kilometre is planned for runners and for the city that hosts them.",
    theme: { bg: "#efe4d6", fg: "#2a1a12", muted: "#6b4f40", accent: "#b8482a", accent2: "#e9822f", font: "fraunces" },
    signature: {
      type: "route-map",
      distanceKm: 42.195,
      raceDate: { label: "[Race date]", iso: "" }, // PLACEHOLDER: set iso to start the live countdown
      registerUrl: "[Registration link]", // PLACEHOLDER
    },
    gallery: [
      img("plovdiv-marathon", "wide-1", "Placeholder: evening light over the start area", true),
      img("plovdiv-marathon", "2", "Placeholder: route sketch"),
      img("plovdiv-marathon", "3", "Placeholder: runners at dusk"),
      img("plovdiv-marathon", "wide-2", "Placeholder: course map study", true),
    ],
    // PLACEHOLDER numbers
    facts: [
      { value: 42.195, decimals: 3, suffix: " km", label: "Race distance" },
      { value: 1500, suffix: "+", label: "Runners expected" },
      { value: 6, label: "Hills of Plovdiv" },
      { value: 200, suffix: "+", label: "Volunteers" },
    ],
  },
  {
    slug: "marathon-running",
    number: "02",
    title: "Marathon running",
    subtitle: "Athlete · Races & results",
    images: [
      { src: "/projects/marathon-running-1.svg", alt: "Curved running-track lanes over a pale green haze" },
      { src: "/projects/marathon-running-2.svg", alt: "Light track lanes sweeping across a dark green background" },
    ],
    year: "Ongoing",
    role: "Athlete",
    location: "Bulgaria & abroad",
    // PLACEHOLDER intro
    intro:
      "Running is where the discipline comes from. Early mornings, long Sundays and the quiet maths of pacing: the same patience that goes into building products, measured in kilometres instead of commits.",
    theme: { bg: "#0a0a0a", fg: "#f4f4f0", muted: "#a3a39c", accent: "#d4ff3a", accent2: "#d4ff3a", font: "barlow", titleClass: "uppercase italic font-extrabold" },
    signature: {
      type: "pulse-results",
      restingBpm: 52,
      peakBpm: 178,
      // PLACEHOLDER results
      results: [
        {
          race: "[Race name] Marathon",
          date: "Apr 2026",
          time: "3:28:41",
          pace: "4:57 /km",
          splits: [
            { label: "10K", time: "0:49:12" },
            { label: "HALF", time: "1:43:55" },
            { label: "30K", time: "2:28:04" },
            { label: "FIN", time: "3:28:41" },
          ],
        },
        {
          race: "[Race name] Half",
          date: "Oct 2025",
          time: "1:36:18",
          pace: "4:34 /km",
          splits: [
            { label: "5K", time: "0:22:51" },
            { label: "10K", time: "0:45:40" },
            { label: "15K", time: "1:08:22" },
            { label: "FIN", time: "1:36:18" },
          ],
        },
        {
          race: "[Race name] Marathon",
          date: "Apr 2025",
          time: "3:41:07",
          pace: "5:15 /km",
          splits: [
            { label: "10K", time: "0:51:30" },
            { label: "HALF", time: "1:49:47" },
            { label: "30K", time: "2:36:15" },
            { label: "FIN", time: "3:41:07" },
          ],
        },
      ],
    },
    gallery: [
      img("marathon-running", "wide-1", "Placeholder: track lanes in the dark", true),
      img("marathon-running", "1", "Placeholder: morning run"),
      img("marathon-running", "2", "Placeholder: long run route"),
      img("marathon-running", "wide-2", "Placeholder: pace data", true),
    ],
    // PLACEHOLDER numbers
    facts: [
      { value: 6, label: "Marathons finished" },
      { value: 3120, suffix: " km", label: "Run last year" },
      { value: 3.28, decimals: 2, suffix: " h", label: "Marathon PB" },
      { value: 178, suffix: " bpm", label: "Race-day peak" },
    ],
  },
  {
    slug: "ai-case-generator",
    number: "03",
    title: "AI Case Generator",
    subtitle: "Turning real social work documents into educational case scenarios",
    images: [
      { src: "/projects/ai-case-generator-1.svg", alt: "Stacked paper documents over a soft violet glow" },
      { src: "/projects/ai-case-generator-2.svg", alt: "Blue light on a dark navy grid" },
      { src: "/projects/ai-case-generator-3.svg", alt: "Pale lavender gradient study" },
    ],
    year: "2025",
    role: "Design & Development",
    location: "[Location]",
    // PLACEHOLDER intro
    intro:
      "Social work students learn best from real situations, but real files are private. This tool turns anonymised case documents into realistic teaching scenarios, so educators can practise with the complexity of real life without exposing anyone in it.",
    theme: { bg: "#eceef6", fg: "#10132b", muted: "#4a4f6e", accent: "#3b4cff", accent2: "#8b5cf6", font: "grotesk" },
    signature: {
      type: "horizontal-steps",
      // PLACEHOLDER steps
      steps: [
        { title: "Upload", text: "An educator uploads a real case document." },
        { title: "Anonymise", text: "Names, places and identifiers are stripped before anything else happens." },
        { title: "Generate", text: "The model rewrites the case into a scenario with learning goals." },
        { title: "Review", text: "The educator edits, approves and shares it with the class." },
        { title: "Practise", text: "Students work through the case and discuss their decisions." },
      ],
    },
    gallery: [
      img("ai-case-generator", "wide-1", "Placeholder: document flow", true),
      img("ai-case-generator", "2", "Placeholder: interface detail"),
      img("ai-case-generator", "3", "Placeholder: scenario card"),
      img("ai-case-generator", "wide-2", "Placeholder: system diagram", true),
    ],
    // PLACEHOLDER numbers
    facts: [
      { value: 120, suffix: "+", label: "Cases generated" },
      { value: 5, label: "Steps per case" },
      { value: 92, suffix: "%", label: "Educator approval" },
      { value: 0, label: "Real names stored" },
    ],
  },
  {
    slug: "dating-app",
    number: "04",
    title: "Dating App",
    subtitle: "A dating concept built around personality, music and voice",
    images: [
      { src: "/projects/dating-app-1.svg", alt: "Two pink and orange glows above a voice waveform" },
      { src: "/projects/dating-app-2.svg", alt: "Dark voice waveform on a soft pink background" },
    ],
    year: "2025",
    role: "Concept & UI Design",
    location: "[Location]",
    // PLACEHOLDER intro
    intro:
      "What if you heard someone before you saw them? This concept matches people on personality, the music they love and a short voice note, and only then reveals photos.",
    theme: { bg: "#23091e", fg: "#ffe8ef", muted: "#e0a9bd", accent: "#ff5c8a", accent2: "#ff9a62", font: "syne", titleClass: "font-extrabold" },
    signature: {
      type: "kinetic-type",
      words: ["Personality", "Music", "Voice"],
      caption: "Move your cursor (or finger) through the letters.",
    },
    gallery: [
      img("dating-app", "wide-1", "Placeholder: voice match screen", true),
      img("dating-app", "1", "Placeholder: profile"),
      img("dating-app", "2", "Placeholder: waveform detail"),
      img("dating-app", "wide-2", "Placeholder: music taste rings", true),
    ],
    // PLACEHOLDER numbers
    facts: [
      { value: 30, suffix: " s", label: "Voice intro" },
      { value: 3, label: "Songs per profile" },
      { value: 12, label: "Personality prompts" },
      { value: 1, label: "Photo, revealed last" },
    ],
  },
  {
    slug: "corsa-car-audio",
    number: "05",
    title: "Corsa Car Audio",
    subtitle: "A voice-controlled music interface designed for safer driving",
    images: [
      { src: "/projects/corsa-car-audio-1.svg", alt: "Concentric speaker rings glowing teal on black" },
      { src: "/projects/corsa-car-audio-2.svg", alt: "Minimal playback bar on a graphite background" },
      { src: "/projects/corsa-car-audio-3.svg", alt: "Grey rings above a teal horizon" },
    ],
    year: "2024",
    role: "Interaction Design",
    location: "[Location]",
    // PLACEHOLDER intro
    intro:
      "Every glance at a screen is a glance away from the road. Corsa lets drivers control music by voice, with an interface that only shows what matters and gets out of the way the rest of the time.",
    theme: { bg: "#0b0d0f", fg: "#e6f2f1", muted: "#8fa6a3", accent: "#2dd4bf", accent2: "#99f6e4", font: "syncopate", titleClass: "uppercase font-bold tracking-[0.01em] text-[clamp(2.25rem,8vw,8.5rem)]" },
    signature: {
      type: "webgl-distort",
      images: [
        { src: "/projects/corsa-car-audio-1.svg", alt: "Speaker rings" },
        { src: "/projects/corsa-car-audio-2.svg", alt: "Playback bar" },
        { src: "/projects/corsa-car-audio-3.svg", alt: "Rings over horizon" },
      ],
      caption: "Hover (or drag) to disturb the signal. Scroll to change track.",
    },
    gallery: [
      img("corsa-car-audio", "wide-1", "Placeholder: dashboard view", true),
      img("corsa-car-audio", "2", "Placeholder: playback screen"),
      img("corsa-car-audio", "3", "Placeholder: night mode"),
      img("corsa-car-audio", "wide-2", "Placeholder: voice command flow", true),
    ],
    // PLACEHOLDER numbers
    facts: [
      { value: 0, suffix: " TAPS", label: "To change a song" },
      { value: 1.2, decimals: 1, suffix: " S", label: "Average command" },
      { value: 14, label: "Voice commands" },
      { value: 72, suffix: "%", label: "Fewer glances" },
    ],
  },
  {
    slug: "bloom",
    number: "06",
    title: "Bloom",
    subtitle: "A collective feedback garden designed for art galleries",
    images: [
      { src: "/projects/bloom-1.svg", alt: "Blurred pink flower with an amber centre on pale green" },
      { src: "/projects/bloom-2.svg", alt: "Pale petals over dusk-coloured light on dark green" },
    ],
    year: "2024",
    role: "Concept & Development",
    location: "[Location]",
    // PLACEHOLDER intro
    intro:
      "Visitors leave a thought about an artwork and it grows into a flower. Over a day the gallery's feedback becomes a shared garden, and the loudest opinions are simply the brightest blooms.",
    theme: { bg: "#eef0e3", fg: "#18261b", muted: "#4d5e4f", accent: "#d6408a", accent2: "#e58a1f", font: "instrument" },
    signature: {
      type: "bloom-garden",
      total: 128,
      // PLACEHOLDER feedback
      notes: ["“I stood here for ten minutes.”", "“The blue feels like home.”", "“Made me call my mother.”", "“Too loud — I loved it.”", "“I want to touch it.”", "“Quietly devastating.”"],
    },
    gallery: [
      img("bloom", "wide-1", "Placeholder: garden wall", true),
      img("bloom", "1", "Placeholder: single bloom"),
      img("bloom", "2", "Placeholder: garden at night"),
      img("bloom", "wide-2", "Placeholder: installation view", true),
    ],
    // PLACEHOLDER numbers
    facts: [
      { value: 128, label: "Flowers in a day" },
      { value: 3, label: "Galleries tested" },
      { value: 40, suffix: " s", label: "To leave feedback" },
      { value: 6, label: "Flower species" },
    ],
  },
];

export function getProject(slug: string) {
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  return { project: projects[index], next: projects[(index + 1) % projects.length] };
}

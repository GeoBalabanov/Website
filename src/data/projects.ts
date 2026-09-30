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
  /** Vertical phone video (9:16). Consecutive tall items sit side by side. */
  tall?: boolean;
  /** A line or two under the item explaining the work. */
  caption?: string;
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
      /** Times the loop on the map is run (the map loop is distanceKm / laps). Default 1. */
      laps?: number;
      raceDate: { label: string; /** ISO date-time, e.g. "2027-04-18T08:00:00+03:00". Empty = countdown shows dashes. */ iso: string };
    }
  | { type: "pulse-results"; restingBpm: number; peakBpm: number; results: RaceResult[] }
  | { type: "horizontal-steps"; steps: { title: string; text: string }[] }
  | { type: "kinetic-type"; words: string[]; caption: string }
  | { type: "webgl-distort"; images: ProjectImage[]; caption: string }
  | { type: "bloom-garden"; total: number; notes: string[] };

/**
 * "Living poster" loop for the project's cover in the Slider and the Grid
 * (project pages always show the still image).
 *
 * The first six are code-drawn copies of the placeholder cover artwork, animated:
 *   lava   – drifting orange/red blobs that breathe          (plovdiv-marathon-1)
 *   tracks – drifting blobs, flowing track lines + runners   (marathon-running-1)
 *   typing – fanned case cards, top card writes itself      (ai-case-generator-1)
 *   voice  – live waveform bars, glow pulsing with the sound (dating-app-1)
 *   ripple – rings rippling out from a pulsing centre         (corsa-car-audio-1)
 *   bloom  – a turning flower whose petals breathe open      (bloom-1)
 * They only match those exact covers. With your own cover image, use
 *   drift  – slow zoom and pan over whatever image is set
 * or leave it out for a still cover.
 */
export type CoverMotion = "lava" | "tracks" | "typing" | "voice" | "ripple" | "bloom" | "drift" | "head3d";

export type Project = {
  slug: string;
  number: string;
  title: string;
  subtitle: string;
  images: ProjectImage[];
  link?: string;
  coverMotion?: CoverMotion;
  /** A live 3D scene that plays over the hero image on the project page. */
  heroScene?: "corsa-head";

  year: string;
  role: string;
  location: string;
  intro: string;
  theme: ProjectTheme;
  signature: Signature;
  gallery: MediaItem[];
  facts: Fact[];
  /** Sections whose content is final, so they drop their "Placeholder" tag. */
  confirmed?: ("intro" | "facts")[];
};

const img = (slug: string, name: string, alt: string, wide = false, caption?: string): MediaItem => ({
  src: `/projects/${slug}-${name}.svg`,
  alt,
  wide,
  caption,
});

export const projects: Project[] = [
  {
    slug: "plovdiv-marathon",
    number: "01",
    title: "Plovdiv Marathon",
    subtitle: "Organizer · Plovdiv, Bulgaria",
    coverMotion: "lava",
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
      "Organizing a full marathon through Plovdiv, one of the oldest continuously inhabited cities in Europe. The loop runs from the Rowing Canal along the Maritsa and through the centre, and every kilometre is planned for runners and for the city that hosts them.",
    // Night-blue with gold: the route and numbers in gold, the river and runner in sky blue.
    theme: { bg: "#0d1b33", fg: "#edf1f7", muted: "#9fb0c9", accent: "#f2b441", accent2: "#6cb8ff", font: "fraunces" },
    signature: {
      type: "route-map",
      distanceKm: 42.195,
      // The course map is a ~21.1 km loop (km markers 1–21), run twice for the marathon.
      laps: 2,
      raceDate: { label: "18 April 2027", iso: "2027-04-18T08:00:00+03:00" }, // start time assumed 08:00 local (EEST)
    },
    gallery: [
      {
        kind: "video",
        src: "/projects/plovdiv-marathon-video-1.mp4",
        poster: "/projects/plovdiv-marathon-video-1.jpg",
        alt: "A runner in black jogging on the red track of an empty stadium",
        caption: "Testing the pace on the track: every stretch of the course is run before it is planned.",
        wide: true,
      },
      img("plovdiv-marathon", "2", "Placeholder: route sketch", false, "Early route sketches: finding a loop that passes the city's landmarks and stays fast."),
      img("plovdiv-marathon", "3", "Placeholder: runners at dusk", false, "Runners at dusk: the atmosphere the whole race is built around."),
      {
        kind: "video",
        src: "/projects/plovdiv-marathon-video-2.mp4",
        poster: "/projects/plovdiv-marathon-video-2.jpg",
        alt: "Black and white: a runner resting on the stadium stands, checking a phone",
        caption: "Between sessions: checking the splits and planning the next run.",
        wide: true,
      },
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
    coverMotion: "tracks",
    images: [
      { src: "/projects/marathon-running-1.svg", alt: "Curved running-track lanes over a pale green haze" },
      { src: "/projects/marathon-running-2.svg", alt: "Light track lanes sweeping across a dark green background" },
    ],
    year: "Ongoing",
    role: "Athlete",
    location: "The Netherlands & abroad",
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
      img("marathon-running", "wide-1", "Placeholder: track lanes in the dark", true, "Early-morning track sessions: intervals before the working day starts."),
      {
        kind: "video",
        tall: true,
        src: "/projects/marathon-running-video-1.mp4",
        poster: "/projects/marathon-running-video-1.jpg",
        alt: "Running along a gravel path through a dark forest",
        caption: "Easy kilometres on the forest trails: gravel underfoot and nobody else around.",
      },
      {
        kind: "video",
        tall: true,
        src: "/projects/marathon-running-video-2.mp4",
        poster: "/projects/marathon-running-video-2.jpg",
        alt: "Finishers with medals on sunny city steps after the Madrid Half Marathon",
        caption: "Madrid Half Marathon: medals on, and the finish area slowly emptying out in the sun.",
      },
      {
        kind: "video",
        tall: true,
        src: "/projects/marathon-running-video-3.mp4",
        poster: "/projects/marathon-running-video-3.jpg",
        alt: "A runner catching his breath on a forest path after a run",
        caption: "After the long run: catching my breath before the walk home.",
      },
      img("marathon-running", "wide-2", "Placeholder: pace data", true, "Every run is logged. Pace, heart rate and splits show what's working."),
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
    subtitle: "Turning real social work cases into playable scenarios for the Social Work Game",
    coverMotion: "typing",
    images: [
      { src: "/projects/ai-case-generator-1.svg", alt: "Three case-scenario cards fanned out over a deep blue glow" },
      { src: "/projects/ai-case-generator-2.svg", alt: "Blue light on a dark navy grid" },
      { src: "/projects/ai-case-generator-3.svg", alt: "A single case card close up in teal and violet light" },
    ],
    year: "2025",
    role: "UX Design & SwiftUI Development",
    location: "Fontys × Tweekracht",
    intro:
      "Every new case for Tweekracht's Social Work Game took hours of turning interviews and reports into game cards by hand. Our Fontys team built a SwiftUI app where AI does that work: a playable six-step case, ready to edit and print.",
    theme: { bg: "#eceef6", fg: "#10132b", muted: "#4a4f6e", accent: "#3b4cff", accent2: "#8b5cf6", font: "grotesk" },
    signature: {
      type: "horizontal-steps",
      steps: [
        { title: "Upload", text: "An educator uploads the case material: interviews, reports and notes as PDF, Word or plain text." },
        { title: "Analyse", text: "The AI reads everything, picks out the people, problems and turning points, and maps them to the Social Quality Theory." },
        { title: "Generate", text: "It writes the case in the game's six-step model, each step with two to four sub-steps, dilemmas and choices." },
        { title: "Review", text: "Every card can be edited. If one step doesn't feel right, the educator regenerates just that step." },
        { title: "Export", text: "The finished case is exported as a PDF, ready to print and play in the physical board game." },
      ],
    },
    gallery: [
      img("ai-case-generator", "wide-1", "Placeholder: document flow", true, "From documents to a case: interviews and reports go in, a six-step game case comes out."),
      img("ai-case-generator", "2", "Placeholder: upload screen", false, "The upload screen keeps one main action: Generate Case. Built for educators, not engineers."),
      img("ai-case-generator", "3", "Placeholder: generated card", false, "Each generated card holds a situation, a dilemma and the choices players can make, all editable."),
      img("ai-case-generator", "wide-2", "Placeholder: AI pipeline", true, "The pipeline: extract the text, analyse it against the Social Quality Theory, generate the steps, format the cards."),
    ],
    facts: [
      { value: 6, label: "Steps per case" },
      { value: 4, prefix: "2–", label: "Sub-steps per step" },
      { value: 3, label: "File types: PDF, Word, text" },
      { value: 2, label: "Languages: Dutch & English" },
    ],
    confirmed: ["intro", "facts"],
  },
  {
    slug: "dating-app",
    number: "04",
    title: "Dating App",
    subtitle: "A dating concept built around personality, music and voice",
    coverMotion: "voice",
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
      img("dating-app", "wide-1", "Placeholder: voice match screen", true, "The match screen: you hear a voice note before you see a face."),
      img("dating-app", "1", "Placeholder: profile", false, "Profiles lead with personality and music taste. Photos come last."),
      img("dating-app", "2", "Placeholder: waveform detail", false, "The voice note waveform, the first thing you see of someone."),
      img("dating-app", "wide-2", "Placeholder: music taste rings", true, "Overlapping rings show how much two people's music taste has in common."),
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
    coverMotion: "head3d",
    heroScene: "corsa-head",
    images: [
      { src: "/projects/corsa-car-audio-3d.jpg", alt: "3D render of a glossy, faceless bust lit by an iridescent streak of light on violet" },
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
      img("corsa-car-audio", "wide-1", "Placeholder: dashboard view", true, "In the dashboard: large type and high contrast, readable at a glance."),
      img("corsa-car-audio", "2", "Placeholder: playback screen", false, "Playback reduced to the essentials: track, artist and one clear control."),
      img("corsa-car-audio", "3", "Placeholder: night mode", false, "Night mode dims everything except what the driver needs."),
      img("corsa-car-audio", "wide-2", "Placeholder: voice command flow", true, "Voice first: say what you want, and the screen only confirms it."),
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
    coverMotion: "bloom",
    images: [
      { src: "/projects/bloom-1.svg", alt: "A soft pink flower with an amber centre on pale green" },
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
      img("bloom", "wide-1", "Placeholder: garden wall", true, "The garden wall: every flower is a visitor's thought about an artwork."),
      img("bloom", "1", "Placeholder: single bloom", false, "Each bloom's size and colour come from the feedback it grew from."),
      img("bloom", "2", "Placeholder: garden at night", false, "By evening, the day's feedback has grown into a shared garden."),
      img("bloom", "wide-2", "Placeholder: installation view", true, "The installation in the gallery, next to the works it responds to."),
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

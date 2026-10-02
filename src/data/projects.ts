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
  /** Living animation for this image in the grid (a project's first image uses `coverMotion`). */
  motion?: CoverMotion;
};

export type MediaItem = ProjectImage & {
  /** Defaults to "image". Videos autoplay muted when in view. */
  kind?: "image" | "video";
  /** Poster frame for videos. */
  poster?: string;
  /** Landscape item (16:10) instead of portrait (3:4). */
  wide?: boolean;
  /** A wide item shown smaller (centred, about half the page), for photos that would blur at full width. */
  compact?: boolean;
  /** Vertical phone video (9:16). Consecutive tall items sit side by side. */
  tall?: boolean;
  /** A line or two under the item explaining the work. */
  caption?: string;
  /** Show the whole image on white instead of filling (and cropping) the frame, e.g. for diagrams. */
  fit?: "contain";
  /** A code-drawn, animated piece shown instead of `src` (which then only serves as its key). */
  living?: "streaming-apps" | "connect-flow" | "bloom-flow" | "demo-box" | "wiring" | "network";
};

export type Fact = {
  value: number;
  label: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
};

export type FontKey = "fraunces" | "barlow" | "grotesk" | "syne" | "syncopate" | "instrument" | "bricolage" | "anton";

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
  /** "light": the hero image is pale, so its text is set in ink with a paper fade instead of a dark shade. */
  heroTone?: "light";
  /** Ink and paper colours for a light hero, when they differ from the page's fg and bg. */
  heroInk?: string;
  heroPaper?: string;
};

export type RaceResult = {
  race: string;
  date: string;
  /** Finish time. Leave out for a race that hasn't happened yet: it shows "Coming soon". */
  time?: string;
  pace?: string;
  /** Key numbers shown as scoreboard tiles (splits, distance, elevation…). */
  stats: { label: string; value: string }[];
};

export type Signature =
  | {
      type: "route-map";
      distanceKm: number;
      /** Times the loop on the map is run (the map loop is distanceKm / laps). Default 1. */
      laps?: number;
      raceDate: { label: string; /** ISO date-time, e.g. "2027-04-18T08:00:00+03:00". Empty = countdown shows dashes. */ iso: string };
    }
  | {
      type: "pulse-results";
      restingBpm: number;
      peakBpm: number;
      /** The number in the top corner, e.g. { label: "Marathon PB", value: "4:09:12" }. */
      headline: { label: string; value: string };
      results: RaceResult[];
    }
  | {
      type: "horizontal-steps";
      /** Section heading (defaults to the AI Case Generator's). */
      heading?: string;
      /** Card illustrations: document steps (default) or engineering tools. */
      icons?: "documents" | "engineering";
      steps: { title: string; text: string }[];
    }
  | { type: "kinetic-type"; words: string[]; caption: string }
  | {
      type: "webgl-distort";
      images: ProjectImage[];
      caption: string;
      /** Real songs, played as official Apple Music previews (appleId = the iTunes track id). */
      tracks?: { appleId: number; title: string; artist: string; url: string }[];
    }
  | { type: "bloom-garden"; total: number; notes: string[] }
  | { type: "progress-journey"; milestones: { pct: number; kicker: string; title: string; text: string }[] };

/**
 * "Living poster" loop for the project's cover in the Slider and the Grid
 * (project pages always show the still image).
 *
 * The first six are code-drawn copies of the placeholder cover artwork, animated:
 *   lava   – drifting orange/red blobs that breathe          (plovdiv-marathon-1)
 *   tracks – drifting blobs, flowing track lines + runners   (marathon-running-1)
 *   typing – fanned case cards, top card writes itself (unused)
 *   ai-book / ai-flow / ai-page – iridescent book, cards, page (ai-case-generator-*.svg)
 *   voice  – live waveform bars, glow pulsing with the sound (dating-app-1)
 *   ripple – rings rippling out from a pulsing centre         (corsa-car-audio-1)
 *   bloom  – a turning flower whose petals breathe open      (bloom-1)
 *   sky    – "Remote mode": the Demo Box tank filling and draining (advantech-1)
 * They only match those exact covers. With your own cover image, use
 *   drift  – slow zoom and pan over whatever image is set
 * or leave it out for a still cover.
 */
export type CoverMotion = "sky" | "lava" | "tracks" | "typing" | "voice" | "ripple" | "bloom" | "drift" | "head3d" | "route" | "ember" | "night-tracks" | "grid" | "card" | "wave" | "playback" | "rings" | "dusk-bloom" | "flag" | "hills" | "loaded" | "collage" | "hairwave" | "ai-book" | "ai-flow" | "ai-page";

export type Project = {
  slug: string;
  number: string;
  /** Set for personal work that isn't a project, e.g. "Event creator": shown instead of the project number. */
  kind?: string;
  title: string;
  subtitle: string;
  images: ProjectImage[];
  link?: string;
  /** Overrides the link's label (defaults to "Code on GitHub" or "Visit live"). */
  linkLabel?: string;
  /** Shown instead of a link when the code can't be public, e.g. "Private repository · code on request". */
  linkNote?: string;
  coverMotion?: CoverMotion;
  /** Wide image for the project page hero, when the portrait cover would crop badly (defaults to images[0]). */
  hero?: ProjectImage;
  /** A live 3D scene that plays over the hero image on the project page. */
  heroScene?: "corsa-head" | "flag-wind";

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
  /** Optional story section after the signature: moments of a use scenario, then the personas behind it. */
  drive?: {
    title: string;
    moments: { kicker: string; title: string; text: string }[];
    people: { name: string; about: string; quote: string }[];
  };
};

const img = (slug: string, name: string, alt: string, wide = false, caption?: string): MediaItem => ({
  src: `/projects/${slug}-${name}.svg`,
  alt,
  wide,
  caption,
});

export const projects: Project[] = [
  {
    slug: "corsa-car-audio",
    number: "01",
    title: "Corsa Car Audio",
    subtitle: "A voice-controlled music interface designed for safer driving",
    link: "https://github.com/GeoBalabanov/Corsa",
    coverMotion: "head3d",
    heroScene: "corsa-head",
    images: [
      { src: "/projects/corsa-car-audio-3d.jpg", alt: "3D render of a glossy, faceless bust lit by an iridescent streak of light on violet" },
      { src: "/projects/corsa-car-audio-2.svg", alt: "Minimal playback bar with an iridescent progress line on violet", motion: "playback" },
      { src: "/projects/corsa-car-audio-3.svg", alt: "Grey rings above a teal horizon", motion: "rings" },
    ],
    year: "2025",
    role: "Interaction Design & SwiftUI Development",
    location: "Eindhoven",
    intro:
      "Most music apps are built for the sofa, not the driver's seat: small buttons, playlists and pop-ups that pull your eyes off the road. As a team of two we designed and built Corsa in SwiftUI, a car audio player that only does what a driver needs: play, pause and skip, with big controls, your voice and almost nothing to look at.",
    theme: { bg: "#0b0d0f", fg: "#e6f2f1", muted: "#8fa6a3", accent: "#2dd4bf", accent2: "#99f6e4", font: "syncopate", titleClass: "uppercase font-bold tracking-[0.01em] text-[clamp(2.25rem,8vw,8.5rem)]" },
    signature: {
      type: "webgl-distort",
      images: [
        { src: "/projects/corsa-car-audio-1.svg", alt: "Speaker rings" },
        { src: "/projects/corsa-car-audio-2.svg", alt: "Playback bar" },
        { src: "/projects/corsa-car-audio-3.svg", alt: "Rings over horizon" },
      ],
      caption: "Press play: the signal moves to the music. Hover or drag to disturb it.",
      tracks: [
        {
          appleId: 1453336220,
          title: "Bria's Interlude",
          artist: "Drake feat. Omarion",
          url: "https://music.apple.com/us/album/brias-interlude-feat-omarion/1453336206?i=1453336220",
        },
        {
          appleId: 1511049656,
          title: "Not You Too",
          artist: "Drake feat. Chris Brown",
          url: "https://music.apple.com/us/album/not-you-too-feat-chris-brown/1511049637?i=1511049656",
        },
      ],
    },
    gallery: [
      {
        src: "/projects/corsa-car-audio-welcome.jpg",
        alt: "Corsa's welcome screen: \u201cJust speak. Corsa handles the rest.\u201d above a glossy 3D head lit by an iridescent streak, on violet",
        tall: true,
        caption: "The welcome screen sets the promise in one line: just speak, Corsa handles the rest. One link to register, nothing else to read.",
      },
      {
        src: "/projects/corsa-car-audio-connect-flow",
        living: "connect-flow",
        alt: "Corsa's onboarding clicking through three screens: enter your Spotify, then Apple Music, then YouTube Music profile link, each tinted in the app's colour",
        tall: true,
        caption: "Connecting your music takes three screens: paste a profile link per app, tap Continue, or skip the apps you don't use.",
      },
      {
        src: "/projects/corsa-car-audio-streaming-apps",
        living: "streaming-apps",
        alt: "The Spotify, Apple Music and YouTube Music icons glowing on a dark, grainy background, coming in and out of focus",
        tall: true,
        caption: "No new library to learn: Corsa sits on top of the apps drivers already use. Spotify, Apple Music and YouTube Music, one voice for all three.",
      },
    ],
    facts: [
      { value: 4, label: "Controls: play, pause, next, back" },
      { value: 35, prefix: "18–", label: "Age of the drivers we designed for" },
      { value: 3, label: "Personas" },
      { value: 0, label: "Ads, menus or playlists while driving" },
    ],
    confirmed: ["intro", "facts"],
    drive: {
      title: "One drive, start to finish",
      moments: [
        { kicker: "Before driving", title: "Ready before you are", text: "The phone connects to Bluetooth or AUX and Corsa opens straight in driving mode. No menus, no pop-ups. Playlists are picked while still parked." },
        { kicker: "Pulling away", title: "Hands on the wheel", text: "The last track resumes by itself, or waits for one tap on a large play button. Dark screen, big controls: one glance is enough." },
        { kicker: "While driving", title: "One tap, one word", text: "Pause, skip or replay with the big centre button, the steering wheel or a short \u201cnext\u201d. A sound or a vibration confirms it, so there's nothing to check." },
        { kicker: "Hands-free", title: "No screen at all", text: "In voice-only mode the phone is never touched. When the car is too loud, the steering wheel and media buttons take over." },
        { kicker: "Phone locked", title: "A quick glance", text: "Mounted on the dashboard or locked in the cup holder, play, pause and skip still work from the lock screen." },
        { kicker: "Parked", title: "Everything else, later", text: "Leave driving mode to change playlists or settings, only once it's safe. Nothing complex is ever asked in traffic." },
      ],
      people: [
        { name: "Emma", about: "Playlist in the morning, podcast at night", quote: "I just want to say what I want to hear and keep my eyes on the road." },
        { name: "Alex, 19", about: "The hands-free commuter", quote: "I just want to change the song without having to look down." },
        { name: "Maya, 22", about: "The voice-first listener", quote: "If I have to touch my phone, it's already doing it wrong." },
      ],
    },
  },
  {
    slug: "ai-case-generator",
    number: "02",
    title: "AI Case Generator",
    subtitle: "Turning real social work cases into playable scenarios for the Social Work Game",
    // The repository holds client material, so it stays private.
    linkNote: "Private repository · code on request",
    coverMotion: "ai-book",
    hero: { src: "/projects/ai-case-generator-hero.svg", alt: "A glowing open book with iridescent pink, red, yellow and blue pages on deep navy" },
    images: [
      { src: "/projects/ai-case-generator-book.svg", alt: "A glowing open book with iridescent pink, red, yellow and blue pages on deep navy" },
      { src: "/projects/ai-case-generator-flow.svg", alt: "Three glowing iridescent case cards fanned out under a shining sparkle", motion: "ai-flow" },
      { src: "/projects/ai-case-generator-page.svg", alt: "A single glowing iridescent page close up, with a cursor on it", motion: "ai-page" },
    ],
    year: "2025–2026",
    role: "UX Design & SwiftUI Development",
    location: "Eindhoven",
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
      {
        src: "/projects/ai-case-generator-boardgame.jpg",
        alt: "The Sociality board game on a table with the Het Skatepark case: the board, the rule book and numbered decision cards",
        wide: true,
        caption: "Where it all ends up: Tweekracht's board game, Sociality, with the Het Skatepark case laid out. The board, the rule book and every numbered decision card.",
      },
      {
        src: "/projects/ai-case-generator-home.jpg",
        alt: "AI Case Generator home screen with the three steps: upload, generate and review",
        wide: true,
        caption: "The home screen explains the whole tool in three steps: upload, generate, review. Nothing else competes for attention.",
      },
      {
        src: "/projects/ai-case-generator-start.jpg",
        alt: "Start Case Simulation screen for Het Skatepark: 16 decision cards, 4 win outcomes, 5 learning outcomes, 25 cards in total",
        caption: "Before playing, the generated case is summarised: Het Skatepark has 16 decision cards, 4 win and 5 learning outcomes, and no single right path.",
      },
      {
        src: "/projects/ai-case-generator-play.jpg",
        alt: "Playing card 1A of Het Skatepark: a situation and three choices under the heading Wat doe je?",
        caption: "Test play: the teacher runs the case like a student would, choosing a path at every card, with two jokers to spend.",
      },
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
    number: "03",
    title: "Dating App",
    subtitle: "A dating concept built around personality, music and voice",
    link: "https://github.com/GeoBalabanov/Dating-App",
    coverMotion: "hairwave",
    hero: { src: "/projects/dating-app-hero.jpg", alt: "A sound wave drawn from thousands of fine plum strands on off-white" },
    images: [
      { src: "/projects/dating-app-1.jpg", alt: "A sound wave drawn from thousands of fine plum strands on off-white" },
      { src: "/projects/dating-app-2.svg", alt: "Dark voice waveform on a soft pink background", motion: "wave" },
    ],
    year: "2025",
    role: "Concept & UI Design",
    location: "Eindhoven",
    // PLACEHOLDER intro
    intro:
      "What if you heard someone before you saw them? This concept matches people on personality, the music they love and a short voice note, and only then reveals photos.",
    theme: { bg: "#23091e", fg: "#ffe8ef", muted: "#e0a9bd", accent: "#ff5c8a", accent2: "#ff9a62", font: "syne", titleClass: "font-extrabold", heroTone: "light", heroInk: "#2a0f24", heroPaper: "#f5f1f2" },
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
    slug: "advantech-internship",
    number: "04",
    title: "Internship at Advantech Europe",
    subtitle: "What it's like to be a Solution Engineer",
    coverMotion: "sky",
    hero: { src: "/projects/advantech-hero.jpg", alt: "Remote mode: a glass tank on a dark engineering grid, half full, with its level sensor, two pumps and a 4–20 mA signal trace" },
    images: [{ src: "/projects/advantech-1.jpg", alt: "Remote mode: a glass tank on a dark engineering grid, half full, with its level sensor, two pumps and a 4–20 mA signal trace" }],
    year: "2025",
    role: "Solution Engineer Intern · IoT & Automation",
    location: "Eindhoven",
    link: "/projects/advantech-project-plan.pdf",
    linkLabel: "In-depth project plan (PDF)",
    intro:
      "Advantech builds the industrial IoT behind factories, transport and smart cities. In its IoT & Automation team I owned the Demo Box: a portable rig of ADAM modules, sensors, pumps, valves and SCADA that shows partners and customers how it all works together. My goal was to make it run entirely on its own, and it does.",
    // Paper, brick and sky: the building on the poster.
    theme: { bg: "#f3f1ec", fg: "#17212b", muted: "#55606b", accent: "#b8452f", accent2: "#3f74b0", font: "grotesk" },
    signature: {
      type: "horizontal-steps",
      heading: "Building the Demo Box",
      icons: "engineering",
      steps: [
        { title: "Learn", text: "Finished the IoT Academy's 20+ modules and trained on Visio, the ADAM/Apax Utility and WebAccess SCADA, reviewing every course with my mentor." },
        { title: "Map", text: "Got to know every part: ADAM modules, the Liquicap M FMI51 level sensor, power and WAGO connectors. Then drew the wiring and the logic in Visio." },
        { title: "Fix", text: "The sensor stayed dark. Tracing its 4–20 mA loop with a multimeter showed a misrouted +24 V wire and a floating Vin−. Rewired, it lit up at once." },
        { title: "Automate", text: "My own proposal: GCL rules inside the ADAM modules that fill at ≤ 5.6 mA and drain at ≥ 17.2 mA, never both at once, within three outputs per rule." },
        { title: "Document", text: "A full system breakdown, a calibration guide, a troubleshooting plan and a video of every test, so whoever picks up the Demo Box next can just start." },
      ],
    },
    gallery: [
      {
        src: "/projects/advantech-demo-box",
        living: "demo-box",
        wide: true,
        alt: "A SCADA-style view of the Demo Box running on its own: the tank fills until the level sensor reads 17.2 mA, drains back to 5.6 mA and repeats, with pumps, valves and the active GCL rule lighting up",
        caption: "Remote mode: the Demo Box filling and draining by itself, driven by the level sensor's 4–20 mA signal and my GCL rules. Built with guidance from my mentor Guilherme, and Steve and Jay in the lab.",
      },
      {
        src: "/projects/advantech-wiring",
        living: "wiring",
        wide: true,
        alt: "Wiring diagram of the Demo Box drawn in Microsoft Visio: the valve and level sensor into the ADAM-6017, the ADAM-6050 through a terminal block to the relay, the relay and Wago connectors to both pumps, and everything on one power supply with the EKI-5525 switch",
        caption: "The wiring I drew in Visio, one layer at a time: power, the sensor signal, the outputs that switch the pumps, and ground.",
      },
      {
        src: "/projects/advantech-ethernet",
        living: "network",
        wide: true,
        alt: "Network diagram: the ADAM-6050 and ADAM-6017 connected over Ethernet to the EKI-5525 switch, which links to the PPC screen and to a laptop running WebAccess/SCADA",
        caption: "How it talks: both ADAM modules, the PPC screen and the WebAccess/SCADA laptop on one EKI-5525 switch. Readings go up, commands come back down.",
      },
    ],
    facts: [
      { value: 20, suffix: "+", label: "IoT Academy modules" },
      { value: 4, label: "Days a week in the team" },
      { value: 6, label: "GCL rules run the loop" },
      { value: 0, label: "Manual inputs during a demo" },
    ],
    confirmed: ["intro", "facts"],
  },
  {
    slug: "bloom",
    number: "05",
    title: "Bloom",
    subtitle: "A collective feedback garden designed for art galleries",
    coverMotion: "bloom",
    images: [
      { src: "/projects/bloom-1.svg", alt: "A soft pink flower with an amber centre on pale green" },
      { src: "/projects/bloom-2.svg", alt: "Pale petals over dusk-coloured light on dark green", motion: "dusk-bloom" },
    ],
    year: "2026",
    role: "Concept & Development",
    location: "Eindhoven",
    // PLACEHOLDER intro
    intro:
      "Visitors leave a thought about an artwork and it grows into a flower. Over a day the gallery's feedback becomes a shared garden, and the loudest opinions are simply the brightest blooms.",
    // The app's night sky: deep navy, violet and teal light, glowing flowers.
    theme: { bg: "#0a0a18", fg: "#f1f0fb", muted: "#a3a3c2", accent: "#a78bfa", accent2: "#5eead4", font: "instrument" },
    signature: {
      type: "bloom-garden",
      total: 128,
      // PLACEHOLDER feedback
      notes: ["“I stood here for ten minutes.”", "“The blue feels like home.”", "“Made me call my mother.”", "“Too loud — I loved it.”", "“I want to touch it.”", "“Quietly devastating.”"],
    },
    gallery: [
      {
        kind: "video",
        wide: true,
        src: "/projects/bloom-concept-room.mp4",
        poster: "/projects/bloom-concept-room.jpg",
        alt: "Concept video: visitors walk into a dark gallery where a wall of glowing flowers grows, one of them holding a phone showing the garden",
        caption: "Concept: the end of the exhibition. Visitors gather in front of one wall, where every reaction they planted on the way has grown into the same garden.",
      },
      {
        src: "/projects/bloom-app-flow",
        living: "bloom-flow",
        alt: "The Bloom app clicking through itself: scan an installation, choose how it made you feel, watch the bud open, plant it, then see the shared garden and My Gardens",
        tall: true,
        caption: "The app in one loop: scan, answer one question, and your flower opens to match. Loved it, it was okay, or not for me each grow differently.",
      },
      {
        kind: "video",
        wide: true,
        src: "/projects/bloom-concept-wall.mp4",
        poster: "/projects/bloom-concept-wall.jpg",
        alt: "Concept video: close-up of the garden wall with its counters, glowing flowers drifting slowly while silhouettes watch",
        caption: "The garden wall up close: the flowers drift slowly and the counters show how the room felt, from full bloom to at rest.",
      },
    ],
    // PLACEHOLDER numbers
    facts: [
      { value: 128, label: "Flowers in a day" },
      { value: 3, label: "Galleries tested" },
      { value: 40, suffix: " s", label: "To leave feedback" },
      { value: 6, label: "Flower species" },
    ],
  },
  {
    slug: "madrid-exchange",
    number: "06",
    title: "Madrid",
    subtitle: "Minor abroad · Economics for International Relations at URJC",
    coverMotion: "flag",
    heroScene: "flag-wind",
    hero: { src: "/projects/madrid-exchange-hero.svg", alt: "The Spanish flag painted in soft, watery red and yellow watercolour" },
    images: [
      { src: "/projects/madrid-exchange-1.svg", alt: "The Spanish flag painted in soft, watery red and yellow watercolour" },
      { src: "/projects/madrid-exchange-2.svg", alt: "A steep elevation profile on a warm orange sky", motion: "hills" },
      { src: "/projects/madrid-exchange-3.svg", alt: "A half-filled orange ring labelled Loaded, Eindhoven to Madrid", motion: "loaded" },
    ],
    year: "2026",
    role: "Exchange student",
    location: "Madrid, Spain",
    intro:
      "In January I swapped Eindhoven for Madrid and ICT for Economics for International Relations at URJC. Five months later: a new way of seeing the world, a half-marathon PB twenty minutes faster, and friends from the Sahara. Small trip, big change.",
    // Warm Madrid dusk: oxblood night, orange sun, saffron light.
    theme: { bg: "#2a0c07", fg: "#fff1e6", muted: "#f0b89a", accent: "#ff6a2b", accent2: "#ffc15e", font: "bricolage", titleClass: "font-extrabold" },
    signature: {
      type: "progress-journey",
      milestones: [
        {
          pct: 0,
          kicker: "January",
          title: "Eindhoven → Madrid",
          text: "I left Eindhoven at the end of January to break my routine, and traded ICT for Economics for International Relations at Universidad Rey Juan Carlos.",
        },
        {
          pct: 20,
          kicker: "A new field",
          title: "From design to economics",
          text: "Economics and finance changed how I see the world: I started analysing things differently than I did in design. Patient URJC professors and a diverse group of project partners made the switch work.",
        },
        {
          pct: 40,
          kicker: "Madrid Half Marathon",
          title: "Heat, hills and a PB",
          text: "Used to flat, cool Dutch runs, I met Madrid's heat and steep climbs. I started with no expectations and finished 20 minutes faster than my old personal best, with my new friends at the line.",
        },
        {
          pct: 50,
          kicker: "Halfway",
          title: "The Sahara, with 200 Argentinians",
          text: "One moment chasing a PB in the city, the next in the desert with my buddy and 200 Argentinians I'd never met. Franco and I shared no language, and it didn't matter: mate, laughter and the dunes did the talking.",
        },
        {
          pct: 75,
          kicker: "Easter",
          title: "One table, many countries",
          text: "Celebrating Easter with people from all over, swapping traditions and seeing how differently, and just as passionately, everyone celebrates. That's what cultural exchange really means.",
        },
        {
          pct: 100,
          kicker: "Home",
          title: "Small trip, big change",
          text: "The minor didn't just add credits. It changed how I move through the world and see my future. Now it's about bringing this mindset home to Eindhoven.",
        },
      ],
    },
    gallery: [
      {
        src: "/projects/madrid-exchange-marrakech.jpg",
        alt: "A group of friends on a rooftop at night above the lit-up Jemaa el-Fnaa square in Marrakech",
        wide: true,
        compact: true,
        caption: "Marrakech by night: the crew on a rooftop above Jemaa el-Fnaa, on the way to the desert.",
      },
      {
        kind: "video",
        tall: true,
        src: "/projects/madrid-exchange-video-1.mp4",
        poster: "/projects/madrid-exchange-video-1.jpg",
        alt: "A crowd at night in front of a lit-up building in central Madrid, Spanish flags on the balconies",
        caption: "Madrid at night: the centre packed, Spanish flags on the balconies.",
      },
      {
        src: "/projects/madrid-exchange-medina.jpg",
        alt: "A narrow, terracotta alley in a Moroccan medina under a hanging canvas",
        tall: true,
        caption: "The covered alleys of the medina, all terracotta and shade.",
      },
      {
        src: "/projects/madrid-exchange-flag.jpg",
        alt: "A Moroccan flag between tall cacti against a deep blue sky",
        tall: true,
        caption: "Morocco: cacti, whitewashed walls and a very blue sky.",
      },
      {
        src: "/projects/madrid-exchange-sahara.jpg",
        alt: "Georgi on a camel in the red Sahara dunes, looking back, with storm clouds on the horizon",
        caption: "The Sahara: camels, red dunes and a storm on the horizon. Out here, friendships didn't need a shared language.",
      },
    ],
    facts: [
      { value: 20, suffix: " min", label: "Faster half-marathon PB" },
      { value: 21.1, decimals: 1, suffix: " km", label: "Madrid Half Marathon" },
      { value: 200, label: "Argentinians met in the Sahara" },
      { value: 100, suffix: "%", label: "Loaded" },
    ],
    confirmed: ["intro", "facts"],
  },
  {
    slug: "marathon-running",
    number: "07",
    kind: "For the mind, body & soul",
    title: "Marathon running",
    subtitle: "Athlete · Races & results",
    coverMotion: "collage",
    hero: { src: "/projects/marathon-running-hero.svg", alt: "A photocopied collage: a blurred white shape in a blue block, a sunset strip, a starry dark block and a figure in a cyan triangle" },
    images: [
      { src: "/projects/marathon-running-1.svg", alt: "A photocopied collage: a blurred white shape in a blue block, a sunset strip, a starry dark block and a figure in a cyan triangle" },
      { src: "/projects/marathon-running-2.svg", alt: "Light track lanes sweeping across a dark green background", motion: "night-tracks" },
    ],
    year: "Ongoing",
    role: "Athlete",
    location: "The Netherlands & abroad",
    // PLACEHOLDER intro
    intro:
      "Running is where the discipline comes from. Early mornings, long Sundays and the quiet maths of pacing: the same patience that goes into building products, measured in kilometres instead of commits.",
    // Photocopied collage: pale paper, black ink, ultramarine and cyan.
    theme: { bg: "#e3e2dc", fg: "#111111", muted: "#55554f", accent: "#1f33d6", accent2: "#3fb6c4", font: "anton", titleClass: "uppercase italic text-[clamp(3rem,9vw,8.5rem)]", heroTone: "light" },
    signature: {
      type: "pulse-results",
      restingBpm: 52,
      peakBpm: 178,
      headline: { label: "Marathon PB", value: "4:09:12" },
      // From Strava.
      results: [
        {
          race: "Eindhoven Marathon",
          date: "Oct 2026",
          stats: [
            { label: "Distance", value: "42.2 km" },
            { label: "Goal", value: "New PB" },
          ],
        },
        {
          race: "Madrid Half Marathon",
          date: "22 Mar 2026",
          time: "1:49:45",
          stats: [
            { label: "Distance", value: "21.66 km" },
            { label: "Pace", value: "5:04 /km" },
            { label: "Elevation", value: "192 m" },
          ],
        },
        {
          race: "Amsterdam Marathon",
          date: "19 Oct 2025",
          time: "4:09:12",
          stats: [
            { label: "Distance", value: "42.01 km" },
            { label: "Pace", value: "5:56 /km" },
            { label: "Elevation", value: "56 m" },
          ],
        },
      ],
    },
    gallery: [
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
    ],
    facts: [
      { value: 1, label: "Marathon finished: Amsterdam" },
      { value: 1, label: "Half marathon: Madrid" },
      { value: 42.01, decimals: 2, suffix: " km", label: "Longest run" },
      { value: 192, suffix: " m", label: "Climbed in the Madrid Half" },
    ],
    confirmed: ["facts"],
  },
  {
    slug: "plovdiv-marathon",
    number: "08",
    kind: "Event creator",
    title: "Plovdiv Marathon",
    subtitle: "Organizer · Plovdiv, Bulgaria",
    coverMotion: "lava",
    images: [
      { src: "/projects/plovdiv-marathon-1.svg", alt: "Warm orange glow on a black poster background" },
      { src: "/projects/plovdiv-marathon-2.svg", alt: "Dotted marathon route drawn across a cream background", motion: "route" },
      { src: "/projects/plovdiv-marathon-3.svg", alt: "Soft coral light on a deep red background", motion: "ember" },
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
];

export function getProject(slug: string) {
  const index = projects.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  return { project: projects[index], next: projects[(index + 1) % projects.length] };
}

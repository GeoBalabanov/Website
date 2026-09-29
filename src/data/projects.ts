/**
 * Every project on the site lives here. The slider and the grid both read
 * from this list, in this order.
 *
 * To add a project, append one entry:
 *   - slug:     unique id, also used for deep links (e.g. /#plovdiv-marathon)
 *   - number:   the label shown in the index and grid ("07")
 *   - title / subtitle
 *   - images:   one or more portrait (3:4) images in /public. The first image
 *               is the cover in the slider; the grid shows all of them.
 *   - link:     optional URL; makes the images and title clickable
 */

export type ProjectImage = {
  src: string;
  alt: string;
};

export type Project = {
  slug: string;
  number: string;
  title: string;
  subtitle: string;
  images: ProjectImage[];
  link?: string;
};

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
  },
];

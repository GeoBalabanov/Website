# Georgi Balabanov — Portfolio

A minimal Swiss-style portfolio built with Next.js (App Router), TypeScript, Tailwind CSS, GSAP and Lenis.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Pages

- `/` — slider: one project at a time. Scroll, arrow keys or the index on the right to move; swipe on mobile. Deep-link with `/#<slug>`.
- `/grid` — every project image in a 5-column grid.
- `/about` — serif paragraphs and footer.
- `/projects/[slug]` — one page per project, each with its own colors, display font and signature section. Clicking a project on the slider or grid grows its image into the page hero (and shrinks back on the way out).

## Editing content

- **Projects:** `src/data/projects.ts`. One entry per project: `slug`, `number`, `title`, `subtitle`, `images`, optional `link`, plus the project page content — `year`, `role`, `location`, `intro`, `facts`, `gallery` (images or videos) and a `theme` (colors, font, title style).
- **Signature sections:** set `signature.type` to reuse a style: `route-map`, `pulse-results`, `horizontal-steps`, `kinetic-type`, `webgl-distort` or `bloom-garden`. Components live in `src/components/project/signatures/`.
- **Placeholders:** everything marked `PLACEHOLDER` in `projects.ts` (and shown with a small "Placeholder" tag on the page) is sample content. For the marathon, set `raceDate.iso` to start the countdown.
- **Images:** put portrait (3:4) images in `public/projects/` and point `images[].src` at them. The current SVGs are placeholders.
- **Living covers (Slider and Grid):** `coverMotion` picks the looping animation of a project's cover. `lava`, `tracks`, `typing`, `voice`, `ripple` and `bloom` are code-drawn copies of the six placeholder covers; when you swap in your own image, set `coverMotion: "drift"` (slow zoom and pan) or remove it for a still cover. Project pages always show the still image. Speeds live in `src/components/living-cover/art.tsx` (`speed={{ blob, loop }}` on each cover).
- **Name, tagline, About text, footer links:** `src/data/site.ts`.
- **Colors and fonts:** the `@theme` block in `src/app/globals.css` and the font setup in `src/app/layout.tsx`.

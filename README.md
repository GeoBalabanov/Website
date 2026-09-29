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

## Editing content

- **Projects:** `src/data/projects.ts`. Adding a project is one entry: `slug`, `number`, `title`, `subtitle`, `images` and an optional `link`.
- **Images:** put portrait (3:4) images in `public/projects/` and point `images[].src` at them. The current SVGs are placeholders.
- **Name, tagline, About text, footer links:** `src/data/site.ts`.
- **Colors and fonts:** the `@theme` block in `src/app/globals.css` and the font setup in `src/app/layout.tsx`.

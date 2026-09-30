/**
 * A sound wave drawn from thousands of fine, hair-like strands (Dating App cover).
 * Pure and seeded: the same function renders the living cover in the browser and
 * the still images (public/projects/dating-app-1.jpg, dating-app-hero.jpg), so the
 * first frame matches the still exactly.
 *
 * Layout is in "units": 1000 units = the width of a portrait frame (or 90 % of the
 * height of a wide one), so strands keep their place at any pixel size.
 */

export const HAIR_BG = "#f5f1f2";
const INK = "42,15,36"; // deep plum
const ACCENT = "255,92,138"; // the app's pink

const WAVELENGTH = 720; // units
const K = (2 * Math.PI) / WAVELENGTH;
const SPEED = 0.55; // radians per second: the wave flows to the right
const BUCKETS = 6;

type Strand = { p: number; g: number; len: number; alpha: number; accent: boolean; j: [number, number, number]; seed: number };

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Strands for a frame `widthUnits` wide. `p` is the phase position along the wave. */
export function makeStrands(widthUnits: number, seed = 7): Strand[] {
  const r = rng(seed);
  const span = (widthUnits + 200) * K; // a little past both edges, so wrapping is invisible
  const count = Math.round(widthUnits * 7);
  const out: Strand[] = [];
  while (out.length < count) {
    const p = r() * span;
    // Dense in the lobes, sparse where the wave crosses the middle.
    const peak = Math.abs(Math.sin(p));
    if (r() > 0.42 + 0.58 * Math.pow(peak, 1.2)) continue;
    const g = (r() + r() + r() - 1.5) / 1.5; // roughly gaussian, -1…1
    out.push({
      p,
      g,
      len: 30 + r() * 110 + (1 - peak) * 150 * r(),
      // Darker in the core of each lobe, wispy at its edges.
      alpha: (0.26 + 0.6 * Math.pow(peak, 1.3) * (0.4 + 0.6 * r())) * (1 - 0.5 * Math.abs(g)),
      accent: r() < 0.04,
      j: [r() - 0.5, r() - 0.5, r() - 0.5],
      seed: r() * Math.PI * 2,
    });
  }
  return out;
}

/** Draw one frame at time `t` (seconds) into a canvas of `w`×`h` device pixels. */
export function drawHairWave(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, strands: Strand[]) {
  const U = Math.min(w, h * 0.9) / 1000;
  const widthUnits = w / U;
  const span = (widthUnits + 200) * K;
  const cy = h / 2;
  // Loudness swells and dips like a voice.
  const loud = 0.85 + 0.15 * Math.sin(t * 0.9) * Math.sin(t * 0.37 + 1);

  ctx.fillStyle = HAIR_BG;
  ctx.fillRect(0, 0, w, h);
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(0.6, 0.9 * U);

  const paths: Path2D[] = Array.from({ length: BUCKETS * 2 }, () => new Path2D());
  for (const s of strands) {
    // Travel along the wave, wrapping around.
    let p = (s.p - t * SPEED) % span;
    if (p < 0) p += span;
    const x = (p / K - 100) * U;
    const env = 0.75 + 0.25 * Math.sin(p * 0.37 + 1.3);
    const peak = Math.abs(Math.sin(p));
    const centre = cy + Math.sin(p) * 130 * U * env * loud;
    const thick = (70 + 150 * peak) * U * loud;
    const y0 = centre + s.g * thick - (s.len * U) / 2;
    const seg = (s.len * U) / 3;
    const sway = Math.sin(t * 1.7 + s.seed) * 1.2 * U;
    const jit = 2.6 * U;
    const bucket = Math.min(BUCKETS - 1, Math.floor(s.alpha * BUCKETS * 1.4));
    const path = paths[(s.accent ? BUCKETS : 0) + bucket];
    path.moveTo(x + sway, y0);
    path.lineTo(x + sway + s.j[0] * jit, y0 + seg);
    path.lineTo(x + sway * 1.4 + s.j[1] * jit, y0 + seg * 2);
    path.lineTo(x + sway * 1.8 + s.j[2] * jit, y0 + seg * 3);
  }
  paths.forEach((path, i) => {
    const accent = i >= BUCKETS;
    const a = ((i % BUCKETS) + 0.5) / (BUCKETS * 1.4);
    ctx.strokeStyle = `rgba(${accent ? ACCENT : INK},${Math.min(0.9, a).toFixed(3)})`;
    ctx.stroke(path);
  });
}

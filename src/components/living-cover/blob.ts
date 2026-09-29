/**
 * The placeholder covers are 900×1200 SVGs made of ellipses blurred with a
 * Gaussian (stdDeviation σ). Re-running a big blur every frame is expensive,
 * so each blurred ellipse is rebuilt here as a radial gradient whose falloff
 * matches the blur. Gradients can then move with cheap GPU transforms.
 */

export const W = 900;
export const H = 1200;

/** Opacity at distance d from the centre of a disc of radius R blurred with σ. */
function discAlpha(d: number, R: number, s: number) {
  const steps = 120;
  const rMax = R + d + 4 * s;
  let a = 0;
  for (let k = 0; k < steps; k++) {
    const r = ((k + 0.5) / steps) * rMax;
    const w = (r / (s * s)) * Math.exp((-r * r) / (2 * s * s)) * (rMax / steps);
    let inside: number;
    if (r <= R - d) inside = 1;
    else if (r >= R + d) inside = 0;
    else inside = Math.acos(Math.max(-1, Math.min(1, (r * r + d * d - R * R) / (2 * r * d)))) / Math.PI;
    a += w * inside;
  }
  return Math.min(1, a);
}

const rgb = (hex: string) => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(" ");
};

export type BlobSpec = { cx: number; cy: number; rx: number; ry: number; color: string; opacity?: number };

/** Absolute position (in % of the cover) and gradient for one blurred ellipse. */
export function blobStyle({ cx, cy, rx, ry, color, opacity = 1 }: BlobSpec, sigma: number): React.CSSProperties {
  const R = Math.sqrt(rx * ry);
  const ext = R + 3 * sigma;
  const k = ext / R;
  const hw = rx * k;
  const hh = ry * k;
  const c = rgb(color);
  const stops = Array.from({ length: 15 }, (_, i) => {
    const t = i / 14;
    const a = discAlpha(t * ext, R, sigma) * opacity;
    return `rgb(${c} / ${a.toFixed(3)}) ${(t * 100).toFixed(1)}%`;
  });
  return {
    left: `${((cx - hw) / W) * 100}%`,
    top: `${((cy - hh) / H) * 100}%`,
    width: `${((2 * hw) / W) * 100}%`,
    height: `${((2 * hh) / H) * 100}%`,
    background: `radial-gradient(closest-side, ${stops.join(", ")})`,
  };
}

/** Film grain identical to the covers' (fractal noise, overlay blend). */
export const GRAIN = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1 0"/></filter><rect width="${W}" height="${H}" filter="url(#n)"/></svg>`,
)}")`;

/** Dark edge vignette identical to the covers'. */
export const VIGNETTE = "radial-gradient(75% 75% at 50% 50%, rgb(0 0 0 / 0) 60%, rgb(0 0 0 / 0.35) 100%)";

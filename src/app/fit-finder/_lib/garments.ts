/**
 * The Fit Finder index: jackets from ten brands, measured flat in centimetres.
 *
 * These numbers are illustrative approximations compiled for this concept, in the
 * range of public size guides. They are not official brand data.
 *
 * Each garment stores its size M and how much it grows per size ("grade").
 */

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type Size = (typeof SIZES)[number];

export type Measurements = {
  /** Pit to pit, flat. */
  chest: number;
  /** Seam to seam across the back. */
  shoulder: number;
  /** Back length, collar seam to hem. */
  length: number;
  /** Shoulder seam to cuff. */
  sleeve: number;
};

export type Zone = keyof Measurements;
export const ZONES: { key: Zone; label: string; short: string }[] = [
  { key: "chest", label: "Chest", short: "CH" },
  { key: "shoulder", label: "Shoulders", short: "SH" },
  { key: "length", label: "Length", short: "LN" },
  { key: "sleeve", label: "Sleeves", short: "SL" },
];

export type Cut = "Slim" | "Regular" | "Relaxed" | "Boxy" | "Oversized";

export type Garment = {
  id: string;
  brand: string;
  item: string;
  cut: Cut;
  /** Index code shown in the UI, like a lot number. */
  code: string;
  m: Measurements;
  grade: Measurements;
};

export const GARMENTS: Garment[] = [
  { id: "carhartt-work", brand: "Carhartt WIP", item: "Work Jacket", cut: "Boxy", code: "FF-001", m: { chest: 63, shoulder: 52, length: 68, sleeve: 62 }, grade: { chest: 3, shoulder: 1.5, length: 2, sleeve: 1 } },
  { id: "levis-trucker", brand: "Levi's", item: "Trucker Jacket", cut: "Regular", code: "FF-002", m: { chest: 56.5, shoulder: 46, length: 63, sleeve: 64.5 }, grade: { chest: 2.5, shoulder: 1.5, length: 1.5, sleeve: 1 } },
  { id: "tnf-puffer", brand: "The North Face", item: "Puffer Jacket", cut: "Boxy", code: "FF-003", m: { chest: 66, shoulder: 57, length: 67, sleeve: 62 }, grade: { chest: 3, shoulder: 2, length: 1.5, sleeve: 1 } },
  { id: "arket-chore", brand: "Arket", item: "Chore Jacket", cut: "Regular", code: "FF-004", m: { chest: 60, shoulder: 48, length: 72, sleeve: 63 }, grade: { chest: 2.5, shoulder: 1.5, length: 2, sleeve: 1 } },
  { id: "cos-padded", brand: "COS", item: "Padded Jacket", cut: "Relaxed", code: "FF-005", m: { chest: 62, shoulder: 50, length: 70, sleeve: 62 }, grade: { chest: 3, shoulder: 1.5, length: 2, sleeve: 1 } },
  { id: "norse-waxed", brand: "Norse Projects", item: "Waxed Jacket", cut: "Regular", code: "FF-006", m: { chest: 58.5, shoulder: 47, length: 71, sleeve: 65 }, grade: { chest: 2.5, shoulder: 1.5, length: 1.5, sleeve: 1 } },
  { id: "patagonia-fleece", brand: "Patagonia", item: "Fleece Jacket", cut: "Regular", code: "FF-007", m: { chest: 60, shoulder: 48, length: 69, sleeve: 64 }, grade: { chest: 2.5, shoulder: 1.5, length: 2, sleeve: 1 } },
  { id: "uniqlo-padded", brand: "Uniqlo", item: "Padded Jacket", cut: "Slim", code: "FF-008", m: { chest: 57, shoulder: 45.5, length: 66, sleeve: 61.5 }, grade: { chest: 2.5, shoulder: 1.5, length: 2, sleeve: 1 } },
  { id: "stussy-work", brand: "Stüssy", item: "Work Jacket", cut: "Boxy", code: "FF-009", m: { chest: 64.5, shoulder: 54, length: 69, sleeve: 60 }, grade: { chest: 3, shoulder: 1.5, length: 2, sleeve: 1 } },
  { id: "acne-denim", brand: "Acne Studios", item: "Denim Jacket", cut: "Oversized", code: "FF-010", m: { chest: 64, shoulder: 56, length: 70, sleeve: 58 }, grade: { chest: 3, shoulder: 2, length: 1.5, sleeve: 1 } },
];

export function garment(id: string) {
  return GARMENTS.find((g) => g.id === id) ?? GARMENTS[0];
}

/** Flat measurements of one garment in one size. */
export function measure(g: Garment, size: Size): Measurements {
  const steps = SIZES.indexOf(size) - SIZES.indexOf("M");
  const r = (v: number) => Math.round(v * 10) / 10;
  return {
    chest: r(g.m.chest + steps * g.grade.chest),
    shoulder: r(g.m.shoulder + steps * g.grade.shoulder),
    length: r(g.m.length + steps * g.grade.length),
    sleeve: r(g.m.sleeve + steps * g.grade.sleeve),
  };
}

/** How far apart the brands' size M chests are, in cm. */
export function chestSpread() {
  const c = GARMENTS.map((g) => g.m.chest);
  return Math.round((Math.max(...c) - Math.min(...c)) * 10) / 10;
}

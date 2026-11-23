import { SIZES, ZONES, measure, type Garment, type Measurements, type Size, type Zone } from "./garments";

export type Preference = "slim" | "true" | "relaxed";

/** How much each zone matters when two jackets are compared. Chest and shoulders decide most of the fit. */
const WEIGHT: Record<Zone, number> = { chest: 0.4, shoulder: 0.3, length: 0.15, sleeve: 0.15 };

/** Extra room the wearer wants on top of their reference jacket, per zone (cm). */
const PREF: Record<Preference, Partial<Record<Zone, number>>> = {
  slim: { chest: -1.5, shoulder: -0.5 },
  true: {},
  relaxed: { chest: 2.5, shoulder: 1, length: 1 },
};

export type ZoneResult = { zone: Zone; label: string; ref: number; target: number; diff: number; verdict: "same" | "roomier" | "snugger" };

export type SizeScore = { size: Size; score: number; m: Measurements; zones: ZoneResult[] };

export type Recommendation = {
  best: SizeScore;
  all: SizeScore[];
  /** The next best size, shown as the alternative. */
  runnerUp: SizeScore;
  sentence: string;
};

function scoreSize(ref: Measurements, target: Garment, size: Size, pref: Preference): SizeScore {
  const m = measure(target, size);
  let err = 0;
  const zones = ZONES.map(({ key, label }) => {
    const want = ref[key] + (PREF[pref][key] ?? 0);
    const diff = Math.round((m[key] - ref[key]) * 10) / 10;
    err += WEIGHT[key] * Math.abs(m[key] - want);
    const verdict: ZoneResult["verdict"] = Math.abs(diff) <= 1 ? "same" : diff > 0 ? "roomier" : "snugger";
    return { zone: key, label, ref: ref[key], target: m[key], diff, verdict };
  });
  const score = Math.max(12, Math.min(99, Math.round(100 - err * 7)));
  return { size, score, m, zones };
}

const fmt = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1).replace(/\.0$/, "")}\u00a0cm`;

export function recommend(ref: { garment: Garment; size: Size }, target: Garment, pref: Preference): Recommendation {
  const refM = measure(ref.garment, ref.size);
  const all = SIZES.map((s) => scoreSize(refM, target, s, pref));
  const ranked = [...all].sort((a, b) => b.score - a.score);
  const best = ranked[0];
  const runnerUp = ranked[1];

  const sameSize = best.size === ref.size;
  const biggest = [...best.zones].sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))[0];
  const refName = `your ${ref.garment.brand} ${ref.size}`;
  let sentence: string;
  if (sameSize) {
    sentence = `Stay with ${best.size}. ${target.brand} cuts close to ${refName}`;
  } else {
    const dir = SIZES.indexOf(best.size) > SIZES.indexOf(ref.size) ? "up" : "down";
    sentence = `Size ${dir} to ${best.size}. ${target.brand}'s ${ref.size} is cut ${SIZES.indexOf(best.size) > SIZES.indexOf(ref.size) ? "smaller" : "bigger"} than ${refName}`;
  }
  sentence += Math.abs(biggest.diff) > 1 ? `; the ${best.size} still runs ${fmt(biggest.diff)} in the ${biggest.label.toLowerCase()}.` : ", within a centimetre everywhere.";
  return { best, all, runnerUp, sentence };
}

export { fmt };

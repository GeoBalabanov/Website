"use client";

import { useEffect, useMemo, useState } from "react";
import { GARMENTS, SIZES, garment, measure, type Garment, type Size } from "../_lib/garments";
import { fmt, recommend, type Preference } from "../_lib/engine";
import { JacketPaths, jacketGeometry } from "./Jacket";
import s from "./ff.module.css";

function Picker({ label, step, value, onChange, exclude }: { label: string; step: string; value: string; onChange: (id: string) => void; exclude?: string }) {
  return (
    <div className={s.picker}>
      <div className={s.pickHead}>
        <span>{step}</span>
        <b>{label}</b>
      </div>
      <ul role="listbox" aria-label={label}>
        {GARMENTS.map((g) => (
          <li key={g.id}>
            <button type="button" role="option" aria-selected={value === g.id} disabled={exclude === g.id} className={s.pickRow} onClick={() => onChange(g.id)}>
              <span className={s.pickBrand}>{g.brand}</span>
              <span className={s.pickItem}>
                {g.item} <i>· {g.cut}</i>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The two jackets drawn to scale on top of each other, in white on blue. */
function Compare({ refG, refSize, target, size }: { refG: Garment; refSize: Size; target: Garment; size: Size }) {
  const a = measure(refG, refSize);
  const b = measure(target, size);
  const w = Math.max(jacketGeometry(a).width, jacketGeometry(b).width) / 2 + 4;
  const h = Math.max(jacketGeometry(a).height, jacketGeometry(b).height) + 4;
  return (
    <svg viewBox={`${-w} -10 ${w * 2} ${h + 8}`} className={s.cmp} role="img" aria-label={`${refG.brand} ${refSize} (dashed) over ${target.brand} ${size}, to scale`}>
      <JacketPaths key={`a-${refG.id}-${refSize}`} m={a} className={s.cmpRef} details={false} />
      <JacketPaths key={`b-${target.id}-${size}`} m={b} className={s.cmpNew} draw />
    </svg>
  );
}

export function Tool() {
  const [refId, setRefId] = useState("carhartt-work");
  const [refSize, setRefSize] = useState<Size>("M");
  const [targetId, setTargetId] = useState("arket-chore");
  const [pref, setPref] = useState<Preference>("true");
  const [inspect, setInspect] = useState<Size | null>(null);
  const [copied, setCopied] = useState(false);

  // A result can be shared: ?ref=…&size=…&want=…&fit=… opens it as it was.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const ok = (id: string | null) => (id && GARMENTS.some((g) => g.id === id) ? id : null);
    const r = ok(q.get("ref"));
    const w = ok(q.get("want"));
    const z = q.get("size") as Size | null;
    const f = q.get("fit") as Preference | null;
    /* eslint-disable react-hooks/set-state-in-effect -- one-time read of the shared link after hydration */
    if (r) setRefId(r);
    if (w && w !== r) setTargetId(w);
    if (z && SIZES.includes(z)) setRefSize(z);
    if (f && ["slim", "true", "relaxed"].includes(f)) setPref(f);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const refG = garment(refId);
  const target = garment(targetId);
  const rec = useMemo(() => recommend({ garment: refG, size: refSize }, target, pref), [refG, refSize, target, pref]);
  const shown = rec.all.find((x) => x.size === (inspect ?? rec.best.size)) ?? rec.best;
  const isBest = shown.size === rec.best.size;

  const pickRef = (id: string) => {
    setRefId(id);
    setInspect(null);
    if (id === targetId) setTargetId(GARMENTS.find((g) => g.id !== id)!.id);
  };
  const pickTarget = (id: string) => {
    setTargetId(id);
    setInspect(null);
  };
  const share = () => {
    const url = new URL(window.location.href);
    url.search = new URLSearchParams({ ref: refId, size: refSize, want: targetId, fit: pref }).toString();
    url.hash = "tool";
    window.history.replaceState(null, "", url);
    navigator.clipboard?.writeText(url.toString()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <section id="tool" className={s.tool}>
      <header className={s.secHead}>
        <span className={s.eyebrow} data-fade>
          01 — The tool
        </span>
        <h2 className={s.secTitle}>
          <span data-rise>Find your size</span>
        </h2>
        <p className={s.secLead} data-fade>
          Pick the jacket that already fits you. Pick the one you want. Fit Finder compares them zone by zone and draws both to scale.
        </p>
      </header>

      <div className={s.toolGrid}>
        <div className={s.col}>
          <Picker step="A" label="The jacket that fits you" value={refId} onChange={pickRef} />
          <div className={s.choice}>
            <span>Your size in it</span>
            <div role="radiogroup" aria-label="Your size">
              {SIZES.map((z) => (
                <button
                  key={z}
                  type="button"
                  role="radio"
                  aria-checked={refSize === z}
                  onClick={() => {
                    setRefSize(z);
                    setInspect(null);
                  }}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className={s.col}>
          <Picker step="B" label="The jacket you want" value={targetId} onChange={pickTarget} exclude={refId} />
          <div className={s.choice}>
            <span>You like it</span>
            <div role="radiogroup" aria-label="Preferred fit">
              {(["slim", "true", "relaxed"] as Preference[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={pref === p}
                  onClick={() => {
                    setPref(p);
                    setInspect(null);
                  }}
                >
                  {p === "true" ? "As it is" : p === "slim" ? "Slimmer" : "Roomier"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RESULT */}
      <div className={s.result} aria-live="polite">
        <div className={s.resInfo}>
          <span className={s.resEyebrow}>
            {isBest ? "Your size at" : "Inspecting"} {target.brand}
          </span>
          <div className={s.resRow}>
            <div key={shown.size} className={`${s.bigSize} ${isBest ? "" : s.bigSizeAlt}`}>
              {shown.size}
            </div>
            <div className={s.match}>
              <b>{shown.score}%</b>
              <span>fit match</span>
            </div>
          </div>
          <p className={s.sentence}>{isBest ? rec.sentence : `${shown.size} scores ${shown.score}%. Fit Finder recommends ${rec.best.size}.`}</p>

          <div className={s.sizesBar} role="radiogroup" aria-label="Compare sizes">
            {rec.all.map((x) => (
              <button
                key={x.size}
                type="button"
                role="radio"
                aria-checked={x.size === shown.size}
                data-best={x.size === rec.best.size ? "" : undefined}
                onClick={() => setInspect(x.size === rec.best.size ? null : x.size)}
              >
                <span>{x.size}</span>
                <i style={{ transform: `scaleY(${x.score / 100})` }} />
                <small>{x.score}</small>
              </button>
            ))}
          </div>

          <dl className={s.zones}>
            {shown.zones.map((z) => (
              <div key={z.zone} data-v={z.verdict}>
                <dt>{z.label}</dt>
                <dd className={s.zVals}>
                  {z.ref.toFixed(1)} → {z.target.toFixed(1)}
                </dd>
                <dd className={s.zTrack}>
                  <i />
                  <b style={{ left: `${50 + Math.max(-6, Math.min(6, z.diff)) * (50 / 6)}%` }} />
                </dd>
                <dd className={s.zDiff}>{Math.abs(z.diff) < 0.05 ? "±0" : fmt(z.diff)}</dd>
              </div>
            ))}
          </dl>

          <div className={s.shareRow}>
            <span>
              Runner-up {rec.runnerUp.size} · {rec.runnerUp.score}%
            </span>
            <button type="button" onClick={share}>
              {copied ? "Link copied" : "Copy link to this result"}
            </button>
          </div>
        </div>

        <figure className={s.drawing}>
          <Compare refG={refG} refSize={refSize} target={target} size={shown.size} />
          <figcaption>
            <span>
              <i className={s.keyRef} /> {refG.brand} {refSize}
            </span>
            <span>
              <i className={s.keyNew} /> {target.brand} {shown.size}
            </span>
            <span>To scale</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

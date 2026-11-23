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
            <button
              type="button"
              role="option"
              aria-selected={value === g.id}
              disabled={exclude === g.id}
              className={s.pickRow}
              onClick={() => onChange(g.id)}
            >
              <span className={s.pickCode}>{g.code}</span>
              <span className={s.pickBrand}>{g.brand}</span>
              <span className={s.pickItem}>{g.item}</span>
              <span className={s.pickCut}>{g.cut}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The two jackets drawn to scale on top of each other. */
function Compare({ refG, refSize, target, size }: { refG: Garment; refSize: Size; target: Garment; size: Size }) {
  const a = measure(refG, refSize);
  const b = measure(target, size);
  const w = Math.max(jacketGeometry(a).width, jacketGeometry(b).width) / 2 + 4;
  const h = Math.max(jacketGeometry(a).height, jacketGeometry(b).height) + 4;
  return (
    <svg viewBox={`${-w} -10 ${w * 2} ${h + 8}`} className={s.cmp} role="img" aria-label={`${refG.brand} ${refSize} (dashed) over ${target.brand} ${size} (orange), to scale`}>
      <g className={s.cmpGrid}>
        {Array.from({ length: Math.ceil((w * 2) / 10) + 1 }).map((_, i) => {
          const x = Math.floor(-w / 10) * 10 + i * 10;
          return <path key={`v${i}`} d={`M${x} -10 L${x} ${h}`} />;
        })}
        {Array.from({ length: Math.ceil(h / 10) + 1 }).map((_, i) => (
          <path key={`h${i}`} d={`M${-w} ${i * 10} L${w} ${i * 10}`} />
        ))}
      </g>
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

  const refG = garment(refId);
  const target = garment(targetId);
  const rec = useMemo(() => recommend({ garment: refG, size: refSize }, target, pref), [refG, refSize, target, pref]);
  const shown = rec.all.find((x) => x.size === (inspect ?? rec.best.size)) ?? rec.best;
  const isBest = shown.size === rec.best.size;

  const pickTarget = (id: string) => {
    setTargetId(id);
    setInspect(null);
  };

  return (
    <section id="tool" className={s.tool}>
      <header className={s.secHead} data-reveal>
        <span className={s.secNo}>01</span>
        <h2>
          Find your size <em>from a jacket you own</em>
        </h2>
        <p>No tape measure. No body scan. Just the one that already fits.</p>
      </header>

      <div className={s.toolGrid}>
        <div className={s.colA}>
          <Picker step="A" label="The jacket that fits you" value={refId} onChange={(id) => { setRefId(id); setInspect(null); if (id === targetId) pickTarget(GARMENTS.find((g) => g.id !== id)!.id); }} />
          <div className={s.sizeRow}>
            <span>Your size in it</span>
            <div role="radiogroup" aria-label="Your size">
              {SIZES.map((z) => (
                <button key={z} type="button" role="radio" aria-checked={refSize === z} onClick={() => { setRefSize(z); setInspect(null); }}>
                  {z}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={s.colB}>
          <Picker step="B" label="The jacket you want" value={targetId} onChange={pickTarget} exclude={refId} />
          <div className={s.sizeRow}>
            <span>You like it</span>
            <div role="radiogroup" aria-label="Preferred fit">
              {(["slim", "true", "relaxed"] as Preference[]).map((p) => (
                <button key={p} type="button" role="radio" aria-checked={pref === p} onClick={() => { setPref(p); setInspect(null); }}>
                  {p === "true" ? "True to ref" : p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={s.result} aria-live="polite">
          <div className={s.resTop}>
            <span className={s.resLabel}>{isBest ? "Your size" : "Inspecting"}</span>
            <span className={s.resFrom}>
              {target.brand} — {target.item}
            </span>
          </div>
          <div className={s.resMain}>
            <div key={shown.size} className={`${s.bigSize} ${isBest ? "" : s.bigSizeAlt}`}>
              {shown.size}
            </div>
            <div className={s.match}>
              <b>{shown.score}%</b>
              <span>fit match</span>
              <div className={s.matchBar}>
                <i style={{ width: `${shown.score}%` }} />
              </div>
            </div>
          </div>
          <p className={s.sentence}>{isBest ? rec.sentence : `${shown.size} scores ${shown.score}%. Fit Finder recommends ${rec.best.size}.`}</p>

          <div className={s.scoreStrip} role="radiogroup" aria-label="Compare sizes">
            {rec.all.map((x) => (
              <button
                key={x.size}
                type="button"
                role="radio"
                aria-checked={x.size === shown.size}
                className={x.size === rec.best.size ? s.isBest : undefined}
                onClick={() => setInspect(x.size === rec.best.size ? null : x.size)}
              >
                <i style={{ height: `${x.score}%` }} />
                <span>{x.size}</span>
                <small>{x.score}</small>
              </button>
            ))}
          </div>

          <table className={s.zones}>
            <thead>
              <tr>
                <th>Zone</th>
                <th>
                  {refG.brand.split(" ")[0]} {refSize}
                </th>
                <th>
                  {target.brand.split(" ")[0]} {shown.size}
                </th>
                <th>Δ</th>
                <th aria-label="Difference, −6 to +6 cm" />
              </tr>
            </thead>
            <tbody>
              {shown.zones.map((z) => (
                <tr key={z.zone} data-v={z.verdict}>
                  <th>{z.label}</th>
                  <td>{z.ref.toFixed(1)}</td>
                  <td>{z.target.toFixed(1)}</td>
                  <td className={s.delta}>{Math.abs(z.diff) < 0.05 ? "±0" : fmt(z.diff)}</td>
                  <td>
                    <div className={s.barCell}>
                      <span className={s.track}>
                        <i className={s.zero} />
                        <b style={{ left: `${50 + Math.max(-6, Math.min(6, z.diff)) * (50 / 6)}%` }} />
                      </span>
                      <small>{z.verdict === "same" ? "Same" : z.verdict === "roomier" ? "Roomier" : "Snugger"}</small>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={s.shareRow}>
            <span>
              Runner-up <b>{rec.runnerUp.size}</b> · {rec.runnerUp.score}%
            </span>
            <button type="button" onClick={share} className={s.share}>
              {copied ? "Link copied ✓" : "Copy link to this result"}
            </button>
          </div>
        </div>

        <figure className={s.drawing}>
          <div className={s.drawHead}>
            <span>Fig. 02 — To scale, 1 square = 10 cm</span>
            <span className={s.keys}>
              <i className={s.keyRef} /> {refG.brand} {refSize}
              <i className={s.keyNew} /> {target.brand} {shown.size}
            </span>
          </div>
          <Compare refG={refG} refSize={refSize} target={target} size={shown.size} />
        </figure>
      </div>
    </section>
  );
}

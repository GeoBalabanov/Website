"use client";

import { useState } from "react";
import { GARMENTS, ZONES, type Zone } from "../_lib/garments";
import { JacketPaths } from "./Jacket";
import s from "./ff.module.css";

export function MIndex() {
  const [sort, setSort] = useState<Zone>("chest");
  const [desc, setDesc] = useState(true);
  const [hover, setHover] = useState<string | null>(null);

  const rows = [...GARMENTS].sort((a, b) => (desc ? b.m[sort] - a.m[sort] : a.m[sort] - b.m[sort]));
  const vals = GARMENTS.map((g) => g.m[sort]);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const active = GARMENTS.find((g) => g.id === hover) ?? rows[0];
  const avg = (z: Zone) => GARMENTS.reduce((t, g) => t + g.m[z], 0) / GARMENTS.length;

  const click = (z: Zone) => {
    if (z === sort) setDesc(!desc);
    else {
      setSort(z);
      setDesc(true);
    }
  };

  return (
    <section id="index" className={s.index}>
      <header className={s.secHead} data-reveal>
        <span className={s.secNo}>02</span>
        <h2>
          The M Index <em>what “medium” really means</em>
        </h2>
        <p>Ten jackets, all size M, measured flat. Sort by any zone. Hover a row to draw it.</p>
      </header>

      <div className={s.idxGrid}>
        <figure className={s.idxPreview}>
          <svg viewBox="-64 -10 128 84" role="img" aria-label={`${active.brand} ${active.item}, size M, over the index average`}>
            <JacketPaths m={{ chest: avg("chest"), shoulder: avg("shoulder"), length: avg("length"), sleeve: avg("sleeve") }} className={s.idxAvg} details={false} />
            <JacketPaths key={active.id} m={active.m} className={s.idxOne} draw />
          </svg>
          <figcaption>
            <b>{active.brand}</b>
            <span>
              {active.item} · M · {active.cut}
            </span>
            <span className={s.idxAvgKey}>- - - index average</span>
          </figcaption>
        </figure>

        <div className={s.tableWrap}>
          <table className={s.idx} onMouseLeave={() => setHover(null)}>
            <thead>
              <tr>
                <th>#</th>
                <th>Brand / item</th>
                {ZONES.map((z) => (
                  <th key={z.key} aria-sort={sort === z.key ? (desc ? "descending" : "ascending") : "none"}>
                    <button type="button" onClick={() => click(z.key)} data-on={sort === z.key ? "" : undefined}>
                      {z.label} {sort === z.key ? (desc ? "↓" : "↑") : ""}
                    </button>
                  </th>
                ))}
                <th className={s.idxBarHead}>
                  {ZONES.find((z) => z.key === sort)?.label}, {min}–{max} cm
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((g, i) => (
                <tr key={g.id} onMouseEnter={() => setHover(g.id)} onFocus={() => setHover(g.id)} tabIndex={0} data-on={active.id === g.id ? "" : undefined}>
                  <td className={s.idxRank}>{String(i + 1).padStart(2, "0")}</td>
                  <td>
                    <b>{g.brand}</b>
                    <span>{g.item}</span>
                  </td>
                  {ZONES.map((z) => (
                    <td key={z.key} className={sort === z.key ? s.idxSorted : undefined}>
                      {g.m[z.key].toFixed(1)}
                    </td>
                  ))}
                  <td className={s.idxBar}>
                    <i style={{ width: `${12 + ((g.m[sort] - min) / (max - min || 1)) * 88}%` }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

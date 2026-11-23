"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { GARMENTS, ZONES, type Zone } from "../_lib/garments";
import { JacketPaths } from "./Jacket";
import s from "./ff.module.css";

export function MIndex() {
  const [sort, setSort] = useState<Zone>("chest");
  const [hover, setHover] = useState<string | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);

  const rows = [...GARMENTS].sort((a, b) => b.m[sort] - a.m[sort]);
  const vals = GARMENTS.map((g) => g.m[sort]);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const active = GARMENTS.find((g) => g.id === hover);

  // The preview card follows the pointer over the list.
  useEffect(() => {
    const el = list.current;
    const c = card.current;
    if (!el || !c) return;
    const x = gsap.quickTo(c, "x", { duration: 0.6, ease: "power3.out" });
    const y = gsap.quickTo(c, "y", { duration: 0.6, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x(e.clientX - r.left);
      y(e.clientY - r.top);
    };
    el.addEventListener("pointermove", move);
    return () => el.removeEventListener("pointermove", move);
  }, []);

  return (
    <section id="index" className={s.index}>
      <header className={s.secHead}>
        <span className={s.eyebrow} data-fade>
          02 — The M Index
        </span>
        <h2 className={s.secTitle}>
          <span data-rise>
            What <em>medium</em> means
          </span>
        </h2>
        <p className={s.secLead} data-fade>
          Ten jackets, all labelled M, measured flat. Sorted from biggest to smallest.
        </p>
      </header>

      <div className={s.sortTabs} role="tablist" aria-label="Sort by">
        <span>Sort by</span>
        {ZONES.map((z) => (
          <button key={z.key} type="button" role="tab" aria-selected={sort === z.key} onClick={() => setSort(z.key)}>
            {z.label}
          </button>
        ))}
      </div>

      <div ref={list} className={s.idxList} onPointerLeave={() => setHover(null)}>
        {rows.map((g, i) => (
          <div
            key={g.id}
            className={s.idxRow}
            onPointerEnter={() => setHover(g.id)}
            onFocus={() => setHover(g.id)}
            onBlur={() => setHover(null)}
            tabIndex={0}
            data-on={hover === g.id ? "" : undefined}
          >
            <span className={s.idxNo}>{String(i + 1).padStart(2, "0")}</span>
            <span className={s.idxBrand}>{g.brand}</span>
            <span className={s.idxMeta}>
              {g.item}
              <br />
              <b>{g.cut}</b>
            </span>
            <span className={s.idxBar}>
              <i style={{ transform: `scaleX(${0.15 + ((g.m[sort] - min) / (max - min || 1)) * 0.85})` }} />
            </span>
            <span className={s.idxVal}>
              {g.m[sort].toFixed(1)}
              <small>cm</small>
            </span>
          </div>
        ))}

        <div ref={card} className={s.idxCard} data-on={active ? "" : undefined} aria-hidden="true">
          {active && (
            <>
              <svg viewBox="-64 -10 128 84">
                <JacketPaths key={active.id} m={active.m} className={s.idxJacket} draw />
              </svg>
              <div className={s.idxCardTxt}>
                <b>{active.brand}</b>
                <span>
                  M · {active.m.chest} / {active.m.shoulder} / {active.m.length} / {active.m.sleeve}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

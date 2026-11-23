"use client";

import { useMemo, useState } from "react";
import { GARMENTS, SIZES, garment, type Garment, type Size } from "../_lib/garments";
import { recommend } from "../_lib/engine";
import { JacketPaths } from "./Jacket";
import s from "./ff.module.css";

/** A fictional store's product, to show the widget in context. */
const PRODUCT: Garment = {
  id: "atelier-chore",
  brand: "Atelier 00",
  item: "Chore Jacket 01",
  cut: "Relaxed",
  code: "AT-01",
  m: { chest: 61.5, shoulder: 49, length: 71, sleeve: 62.5 },
  grade: { chest: 2.5, shoulder: 1.5, length: 2, sleeve: 1 },
};

export function ForBrands() {
  const [refId, setRefId] = useState("carhartt-work");
  const [refSize, setRefSize] = useState<Size>("M");
  const [picked, setPicked] = useState<Size | null>(null);
  const rec = useMemo(() => recommend({ garment: garment(refId), size: refSize }, PRODUCT, "true"), [refId, refSize]);
  const size = picked ?? rec.best.size;

  return (
    <section id="brands" className={s.brands}>
      <header className={s.secHead} data-reveal>
        <span className={s.secNo}>03</span>
        <h2>
          On your product page <em>one line of code</em>
        </h2>
        <p>The same engine as a widget next to the size buttons. The shopper sees their size before they doubt it.</p>
      </header>

      <div className={s.pdp} data-reveal>
        <div className={s.pdpChrome}>
          <span>atelier00.store / outerwear / chore-jacket-01</span>
          <span>Concept store</span>
        </div>
        <div className={s.pdpGrid}>
          <div className={s.pdpImg}>
            <svg viewBox="-64 -10 128 84" role="img" aria-label="Chore Jacket 01, technical drawing">
              <JacketPaths m={PRODUCT.m} className={s.pdpJacket} />
            </svg>
            <span className={s.pdpTag}>01 / 04</span>
          </div>
          <div className={s.pdpInfo}>
            <span className={s.pdpBrand}>Atelier 00</span>
            <h3>Chore Jacket 01</h3>
            <span className={s.pdpPrice}>€ 189</span>
            <p>Washed cotton canvas, relaxed through the body, four patch pockets.</p>

            <div className={s.pdpSizesHead}>
              <span>Size</span>
              <span>Size guide</span>
            </div>
            <div className={s.pdpSizes} role="radiogroup" aria-label="Size">
              {SIZES.map((z) => (
                <button key={z} type="button" role="radio" aria-checked={size === z} onClick={() => setPicked(z === rec.best.size ? null : z)}>
                  {z}
                  {z === rec.best.size && <i>Your fit</i>}
                </button>
              ))}
            </div>

            <div className={s.widget}>
              <div className={s.wTop}>
                <span>
                  FIT<b>/</b>FINDER
                </span>
                <span>{rec.all.find((x) => x.size === size)?.score}% match</span>
              </div>
              <p>
                Based on your{" "}
                <select value={refId} onChange={(e) => setRefId(e.target.value)} aria-label="Your reference jacket">
                  {GARMENTS.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.brand} {g.item}
                    </option>
                  ))}
                </select>{" "}
                in{" "}
                <select value={refSize} onChange={(e) => setRefSize(e.target.value as Size)} aria-label="Your size in it">
                  {SIZES.map((z) => (
                    <option key={z}>{z}</option>
                  ))}
                </select>
                , take <b>{rec.best.size}</b>.
              </p>
            </div>

            <button type="button" className={s.addBag}>
              Add to bag — {size}
            </button>
          </div>
        </div>
      </div>

      <div className={s.code} data-reveal>
        <div className={s.codeHead}>
          <span>Integration</span>
          <span>HTML · any store</span>
        </div>
        <pre>
          <code>
            <span className={s.cm}>{"<!-- next to the size buttons -->"}</span>
            {"\n"}
            {"<"}
            <b>fit-finder</b> sku=<i>&quot;AT-01&quot;</i> locale=<i>&quot;nl-NL&quot;</i>
            {"></"}
            <b>fit-finder</b>
            {">"}
            {"\n"}
            {"<"}
            <b>script</b> src=<i>&quot;https://cdn.fitfinder.dev/v0/widget.js&quot;</i> defer{"></"}
            <b>script</b>
            {">"}
          </code>
        </pre>
        <ul className={s.kpis}>
          <li>
            <b>Return rate</b>
            <span>What the brand measures it against</span>
          </li>
          <li>
            <b>Size swaps</b>
            <span>Exchanges for a different size</span>
          </li>
          <li>
            <b>Conversion</b>
            <span>Fewer “which size?” drop-offs</span>
          </li>
        </ul>
      </div>
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { GARMENTS, SIZES, garment, type Garment, type Size } from "../_lib/garments";
import { recommend } from "../_lib/engine";
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
      <header className={s.secHead}>
        <span className={s.eyebrow} data-fade>
          03 — For brands
        </span>
        <h2 className={s.secTitle}>
          <span data-rise>
            On your <em>product page</em>
          </span>
        </h2>
        <p className={s.secLead} data-fade>
          The same engine as a small widget next to the size buttons. The shopper sees their size before they start to doubt it.
        </p>
      </header>

      <div className={s.pdp} data-fade>
        <figure className={s.pdpImg}>
          <Image src="/fit-finder/product.jpg" alt="Chore Jacket 01, a washed beige canvas jacket with four patch pockets" fill sizes="(max-width: 760px) 100vw, 55vw" />
          <span>01 / 04</span>
        </figure>
        <div className={s.pdpInfo}>
          <span className={s.pdpCrumb}>Atelier 00 — Outerwear</span>
          <h3>Chore Jacket 01</h3>
          <span className={s.pdpPrice}>€ 189</span>
          <p>Washed cotton canvas. Relaxed through the body, four patch pockets, corozo buttons.</p>

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
              <span>Fit Finder</span>
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

      <div className={s.code} data-fade>
        <span className={s.eyebrow}>One line of code</span>
        <pre>
          <code>
            {"<"}
            <b>fit-finder</b> sku=<i>&quot;AT-01&quot;</i>
            {"></"}
            <b>fit-finder</b>
            {">"}
          </code>
        </pre>
        <ul>
          <li>
            <b>Fewer returns</b> from wrong sizes
          </li>
          <li>
            <b>Fewer exchanges</b> for the next size up
          </li>
          <li>
            <b>Fewer drop-offs</b> at “which size?”
          </li>
        </ul>
      </div>
    </section>
  );
}

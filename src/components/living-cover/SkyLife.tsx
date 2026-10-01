import s from "./SkyLife.module.css";

/**
 * A living photo of a building on a sunny, cloudy day (Advantech): wisps of
 * cloud drift through the sky, their shadows slide across the facade, and a
 * glint of sunlight sweeps over the glass now and then. With `src`, the photo
 * itself slowly pushes in underneath; without, only the light plays over
 * whatever still is below (the page hero).
 */
export function SkyLife({ src }: { src?: string }) {
  return (
    <div className={s.root}>
      {src && <div className={s.photo} style={{ backgroundImage: `url("${src}")` }} />}
      <div className={s.clouds}>
        <span style={{ top: "6%", width: "70%", animationDuration: "46s", animationDelay: "-12s" }} />
        <span style={{ top: "18%", width: "55%", animationDuration: "58s", animationDelay: "-40s" }} />
        <span style={{ top: "2%", width: "45%", animationDuration: "52s", animationDelay: "-28s" }} />
      </div>
      <div className={s.shadows}>
        <span style={{ animationDuration: "24s", animationDelay: "-4s" }} />
        <span style={{ animationDuration: "31s", animationDelay: "-19s", top: "45%" }} />
      </div>
      <div className={s.glint} />
    </div>
  );
}

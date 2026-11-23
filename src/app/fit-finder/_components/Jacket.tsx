import type { Measurements } from "../_lib/garments";

/** Flat-lay outline of a jacket in centimetres, centred on the collar (x = 0, y = 0), y pointing down. */
export function jacketGeometry(m: Measurements) {
  const neck = 9.5;
  const drop = 4.5;
  const arm = m.chest * 0.36;
  const angle = (60 * Math.PI) / 180;
  const dir = [Math.cos(angle), Math.sin(angle)];
  const nrm = [-Math.sin(angle), Math.cos(angle)];
  const cuff = 14;

  const SP = [m.shoulder / 2, drop];
  const A = [m.chest / 2, drop + arm];
  const CO = [SP[0] + dir[0] * m.sleeve, SP[1] + dir[1] * m.sleeve];
  const CI = [CO[0] + nrm[0] * cuff, CO[1] + nrm[1] * cuff];
  const H = [m.chest / 2 + 0.6, m.length];
  const N = [neck, 0];

  const right = [[0, m.length], H, A, CI, CO, SP, N];
  const left = [...right].reverse().slice(0, -1).map(([x, y]) => [-x, y]);
  const pts = [...right, ...left];
  const outline = `M${pts.map((p) => p.map((v) => v.toFixed(2)).join(" ")).join(" L")} Z`;

  const collar = `M${-neck} 0 L${-neck + 1.2} -5.5 L${neck - 1.2} -5.5 L${neck} 0`;
  const zip = `M0 -5.5 L0 ${m.length}`;
  const hem = `M${-H[0]} ${m.length - 5} L${H[0]} ${m.length - 5}`;
  const cuffLine = (s: number) => {
    const back = 6;
    const a = [CO[0] - dir[0] * back, CO[1] - dir[1] * back];
    const b = [CI[0] - dir[0] * back, CI[1] - dir[1] * back];
    return `M${s * a[0]} ${a[1]} L${s * b[0]} ${b[1]}`;
  };
  const px = m.chest * 0.13;
  const pw = m.chest * 0.17;
  const pocket = (s: number) => {
    const x0 = s > 0 ? px : -px - pw;
    return `M${x0} 21 L${x0 + pw} 21 L${x0 + pw} 33 L${x0} 33 Z`;
  };
  const details = [collar, zip, hem, cuffLine(1), cuffLine(-1), pocket(1), pocket(-1)].join(" ");
  const width = Math.max(CO[0], H[0]) * 2;
  return { outline, details, width, height: Math.max(m.length, CI[1]) + 6 };
}

type Props = {
  m: Measurements;
  /** cm → px */
  scale?: number;
  className?: string;
  details?: boolean;
  dash?: string;
  /** Draw the outline in on mount (uses pathLength = 1 for the dash trick). */
  draw?: boolean;
  style?: React.CSSProperties;
};

/** One jacket as SVG paths, to be placed inside an <svg> whose origin is the collar centre. */
export function JacketPaths({ m, scale = 1, className, details = true, dash, draw, style }: Props) {
  const g = jacketGeometry(m);
  return (
    <g transform={`scale(${scale})`} className={className} style={style}>
      <path d={g.outline} pathLength={draw ? 1 : undefined} strokeDasharray={dash} strokeLinejoin="round" data-outline="" />
      {details && <path d={g.details} vectorEffect="non-scaling-stroke" data-details="" />}
    </g>
  );
}

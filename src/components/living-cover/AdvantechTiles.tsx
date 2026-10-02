import s from "./AdvantechTiles.module.css";

/**
 * The two extra Advantech grid tiles, in the poster's look (dark engineering
 * grid, cyan readings, brick commands, mono labels). SVG on a 900 × 1200 board
 * that covers the frame; only transform and opacity animate, and frame 0
 * matches the still (advantech-2.jpg, advantech-3.jpg).
 */

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

function Board({
  title,
  tag,
  children,
}: {
  title: string;
  tag: string;
  children: React.ReactNode;
}) {
  return (
    <div className={s.root}>
      <svg
        viewBox="0 0 900 1200"
        preserveAspectRatio="xMidYMid slice"
        className={s.svg}
        fontFamily={MONO}
      >
        <defs>
          <pattern
            id="adv-grid"
            width="45"
            height="45"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M45 0 H0 V45"
              fill="none"
              stroke="#e8edf3"
              strokeOpacity="0.05"
              strokeWidth="2"
            />
          </pattern>
          <radialGradient id="adv-brick">
            <stop offset="0" stopColor="#c2412d" stopOpacity="0.5" />
            <stop offset="1" stopColor="#c2412d" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="adv-cyan">
            <stop offset="0" stopColor="#4cc3ef" stopOpacity="0.3" />
            <stop offset="1" stopColor="#4cc3ef" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="900" height="1200" fill="#0b1621" />
        <rect width="900" height="1200" fill="url(#adv-grid)" />
        <ellipse
          className={s.glow}
          cx="150"
          cy="1050"
          rx="520"
          ry="420"
          fill="url(#adv-brick)"
        />
        <ellipse
          className={`${s.glow} ${s.glowAlt}`}
          cx="780"
          cy="200"
          rx="480"
          ry="420"
          fill="url(#adv-cyan)"
        />
        <text x="60" y="88" className={s.label}>
          Advantech · Demo Box
        </text>
        <g transform="translate(840 88)">
          <circle cx="-14" cy="-8" r="9" fill="#3ddc84" className={s.dot} />
          <text x="-34" textAnchor="end" className={`${s.label} ${s.labelOn}`}>
            {tag}
          </text>
        </g>
        <text x="60" y="1140" className={s.label}>
          {title}
        </text>
        {children}
      </svg>
    </div>
  );
}

/* ---------------- How it works: the five steps, ticked off one by one ---------------- */

const STEPS = ["Learn", "Map", "Fix", "Automate", "Document"];
const NOTES = [
  "IoT Academy · 20+ modules",
  "Wiring + logic in Visio",
  "Rewired the 4–20 mA loop",
  "GCL rules · 5.6 / 17.2 mA",
  "Guides, tests, handover",
];
const ROW_Y = 250;
const ROW_H = 150;

export function AdvantechStepsCover() {
  return (
    <Board title="Build log · 5 steps" tag="Remote mode">
      {/* Rail down the left, filling as the steps are done. */}
      <line
        x1="120"
        y1={ROW_Y + 20}
        x2="120"
        y2={ROW_Y + 4 * ROW_H + 20}
        stroke="#e8edf3"
        strokeOpacity="0.12"
        strokeWidth="3"
      />
      <line
        x1="120"
        y1={ROW_Y + 20}
        x2="120"
        y2={ROW_Y + 4 * ROW_H + 20}
        stroke="#4cc3ef"
        strokeWidth="3"
        className={s.rail}
      />
      {/* The current step's highlight moves down the list. */}
      <rect
        x="60"
        y={ROW_Y - 40}
        width="780"
        height="120"
        rx="14"
        className={s.cursor}
      />
      {STEPS.map((step, i) => {
        const y = ROW_Y + i * ROW_H;
        return (
          <g key={step}>
            <circle
              cx="120"
              cy={y + 20}
              r="26"
              fill="#0b1621"
              stroke="#e8edf3"
              strokeOpacity="0.3"
              strokeWidth="2"
            />
            <g className={`${s.check} ${s[`done${i}`]}`}>
              <circle cx="120" cy={y + 20} r="26" fill="#4cc3ef" />
              <path
                d={`M${107} ${y + 21} l9 9 l17 -19`}
                fill="none"
                stroke="#0b1621"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <text x="180" y={y + 14} className={s.stepNo}>
              {String(i + 1).padStart(2, "0")}
            </text>
            <text x="250" y={y + 18} className={s.stepTitle}>
              {step}
            </text>
            <text x="250" y={y + 58} className={s.stepNote}>
              {NOTES[i]}
            </text>
          </g>
        );
      })}
    </Board>
  );
}

/* ---------------- Gallery: the Ethernet network, readings up and commands down ---------------- */

function Box({
  x,
  y,
  w,
  h,
  label,
  sub,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="12"
        fill="#10202e"
        stroke="#e8edf3"
        strokeOpacity="0.35"
        strokeWidth="2"
      />
      <text
        x={x + w / 2}
        y={y + h / 2 - 4}
        textAnchor="middle"
        className={s.boxLabel}
      >
        {label}
      </text>
      <text
        x={x + w / 2}
        y={y + h / 2 + 30}
        textAnchor="middle"
        className={s.boxSub}
      >
        {sub}
      </text>
    </g>
  );
}

export function AdvantechNetworkCover() {
  return (
    <Board title="Readings ↑ · Commands ↓" tag="Ethernet">
      {/* Cables */}
      <g
        fill="none"
        stroke="#e8edf3"
        strokeOpacity="0.18"
        strokeWidth="5"
        strokeLinejoin="round"
      >
        <path d="M255 880 V760 H420 V670" />
        <path d="M645 880 V760 H480 V670" />
        <path d="M450 560 V350" />
      </g>
      {/* Packets ride the cables, behind the boxes so they enter each device. */}
      {[0, 1, 2].map((k) => (
        <circle
          key={`l${k}`}
          r="11"
          fill="#4cc3ef"
          className={`${s.packet} ${s.upLeft}`}
          style={{ animationDelay: `${-k * 1.4}s` }}
        />
      ))}
      {[0, 1, 2].map((k) => (
        <circle
          key={`r${k}`}
          r="11"
          fill="#4cc3ef"
          className={`${s.packet} ${s.upRight}`}
          style={{ animationDelay: `${-k * 1.4 - 0.7}s` }}
        />
      ))}
      <circle r="11" fill="#e08a3c" className={`${s.packet} ${s.down}`} />

      <Box
        x={240}
        y={200}
        w={420}
        h={150}
        label="Laptop"
        sub="WebAccess/SCADA"
      />
      <Box x={320} y={560} w={260} h={115} label="Switch" sub="EKI-5525" />
      <Box
        x={110}
        y={880}
        w={290}
        h={120}
        label="ADAM-6050"
        sub="digital out"
      />
      <Box x={500} y={880} w={290} h={120} label="ADAM-6017" sub="analog in" />
      {/* Switch port lights */}
      {[0, 1, 2, 3].map((k) => (
        <circle
          key={k}
          cx={417 + k * 22}
          cy="580"
          r="5"
          fill="#3ddc84"
          className={s.led}
          style={{ animationDelay: `${-k * 0.37}s` }}
        />
      ))}
    </Board>
  );
}

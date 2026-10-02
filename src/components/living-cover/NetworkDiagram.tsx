import s from "./Diagrams.module.css";

/**
 * Advantech gallery: how the Demo Box talks, after Georgi's Visio drawing.
 * Readings (cyan) travel from both ADAM modules through the EKI-5525 switch up
 * to the PPC screen and the WebAccess/SCADA laptop; commands (orange) travel
 * back down to the ADAM-6050. Packets ride the cables (SVG animateMotion);
 * reduced motion hides them and shows the plain diagram.
 */

const UP_6050 = "M240 520 V450 H480 V390";
const UP_6017 = "M760 520 V450 H520 V390";
const TO_PPC = "M490 320 V250";
const TO_SCADA = "M560 345 H700 V130 H620";
const DOWN = "M620 130 H700 V345 H560 M480 390 V450 H240 V520";

function Packet({ path, color, dur, delay }: { path: string; color: string; dur: number; delay: number }) {
  return (
    <circle r="7" fill={color} className={s.packet}>
      <animateMotion path={path} dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
    </circle>
  );
}

export function NetworkDiagram({ label }: { label: string }) {
  const boxes = [
    { label: "Laptop", sub: "WebAccess/SCADA", x: 400, y: 80, w: 220, h: 100 },
    { label: "PPC screen", x: 400, y: 200, w: 180, h: 50 },
    { label: "Switch", sub: "EKI-5525", x: 410, y: 320, w: 150, h: 70 },
    { label: "ADAM-6050", sub: "digital out", x: 160, y: 520, w: 160, h: 70 },
    { label: "ADAM-6017", sub: "analog in", x: 680, y: 520, w: 160, h: 70 },
  ];
  return (
    <div role="img" aria-label={label} className={s.stage}>
      {/* Generous margins: the gallery frame drifts (parallax) and must never clip the drawing. */}
      <svg viewBox="-110 -120 1220 920" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <text x="40" y="44" className={s.title}>
          Demo Box · Ethernet
        </text>
        {[UP_6050, UP_6017, TO_PPC, TO_SCADA].map((d) => (
          <path key={d} d={d} className={s.cable} />
        ))}
        {/* Readings up, commands down (behind the boxes, so they enter each device). */}
        <g className={s.packets}>
          {[0, 1.4, 2.8].map((d) => (
            <Packet key={`a${d}`} path={`${UP_6050} M480 390 V320`} color="#3aa7dc" dur={4.2} delay={d} />
          ))}
          {[0.7, 2.1, 3.5].map((d) => (
            <Packet key={`b${d}`} path={`${UP_6017} M520 390 V320`} color="#3aa7dc" dur={4.2} delay={d} />
          ))}
          {[0.3, 1.8, 3.3].map((d) => (
            <Packet key={`c${d}`} path={TO_PPC} color="#3aa7dc" dur={1.5} delay={d} />
          ))}
          {[0.5, 2.0, 3.5].map((d) => (
            <Packet key={`d${d}`} path={TO_SCADA} color="#3aa7dc" dur={2.2} delay={d} />
          ))}
          <Packet path={DOWN} color="#e08a3c" dur={5.6} delay={1} />
        </g>
        {boxes.map((b) => (
          <g key={b.label} className={s.blockOn}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="8" />
            <text x={b.x + b.w / 2} y={b.y + b.h / 2 + (b.sub ? -2 : 5)} textAnchor="middle" className={s.blockLabel}>
              {b.label}
            </text>
            {b.sub && (
              <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 16} textAnchor="middle" className={s.blockSub}>
                {b.sub}
              </text>
            )}
          </g>
        ))}
        <g transform="translate(40 610)">
          <text className={s.stepTitle}>Readings up, commands down</text>
          <text y="26" className={s.stepText}>
            Sensor data flows up to the screen and SCADA; pump commands flow back down.
          </text>
        </g>
        <g transform="translate(760 610)" className={s.legend}>
          <circle r="6" fill="#3aa7dc" />
          <text x="14" y="4">
            reading
          </text>
          <circle cx="110" r="6" fill="#e08a3c" />
          <text x="124" y="4">
            command
          </text>
        </g>
      </svg>
    </div>
  );
}

import type { QuizScene } from '../../game/quizLab';

/**
 * Small hand-drawn SVG scenes that decorate each quiz question.
 *
 * They are drawn in code (no artwork files needed) and follow the same science
 * rules as the rest of the site: no visible white vapour anywhere.
 */

const SKY = '#cdeefb';
const SKY_DEEP = '#a7ddf4';
const GREEN = '#6cc07a';
const WATER = '#4fb6e4';
const WATER_DEEP = '#2f8fbf';
const SAND = '#f6e7b6';

function SunHappy() {
  return (
    <g>
      <circle cx="100" cy="52" r="26" fill="#ffd45e" />
      <circle cx="91" cy="46" r="3.2" fill="#7a5313" />
      <circle cx="109" cy="46" r="3.2" fill="#7a5313" />
      <path d="M91 59q9 8 18 0" fill="none" stroke="#7a5313" strokeWidth="2.6" strokeLinecap="round" />
      <g stroke="#ffc32e" strokeWidth="3" strokeLinecap="round" opacity="0.85">
        <path d="M100 14v-6" />
        <path d="M100 90v6" />
        <path d="M62 52h-6" />
        <path d="M138 52h6" />
        <path d="M75 27l-4-4" />
        <path d="M125 27l4-4" />
        <path d="M75 77l-4 4" />
        <path d="M125 77l4 4" />
      </g>
    </g>
  );
}

function SeaWaves() {
  return (
    <g>
      <rect x="0" y="104" width="200" height="56" fill={WATER} />
      <path d="M0 104q18 -9 36 0t36 0 36 0 36 0 36 0v14H0Z" fill="#7fd0ef" opacity="0.75" />
      <path d="M0 128q20 -8 40 0t40 0 40 0 40 0 40 0v32H0Z" fill={WATER_DEEP} opacity="0.5" />
    </g>
  );
}

function PuffCloud({ x, y, scale = 1, tone = '#ffffff' }: { x: number; y: number; scale?: number; tone?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="0" rx="30" ry="17" fill={tone} />
      <circle cx="-14" cy="-6" r="15" fill={tone} />
      <circle cx="10" cy="-9" r="17" fill={tone} />
      <circle cx="26" cy="2" r="12" fill={tone} />
    </g>
  );
}

function UpArrows() {
  return (
    <g stroke="#f2a53c" strokeWidth="3.4" strokeLinecap="round" fill="none" opacity="0.9">
      <path d="M58 96v-18" />
      <path d="M52 84l6-7 6 7" />
      <path d="M100 90v-18" />
      <path d="M94 78l6-7 6 7" />
      <path d="M142 96v-18" />
      <path d="M136 84l6-7 6 7" />
    </g>
  );
}

/**
 * A hot mug: the white mist above the cup is made of tiny water droplets,
 * which is exactly what the pupil should learn - water vapour stays invisible.
 */
function HotMug() {
  return (
    <g>
      <rect x="0" y="126" width="200" height="34" fill="#f4e7c8" />
      <path d="M0 126h200" stroke="#e2d0a6" strokeWidth="2" />

      <path d="M64 76h56l-6 42a11 11 0 0 1 -11 10H81a11 11 0 0 1 -11 -10Z" fill="#ffffff" />
      <rect x="69" y="86" width="46" height="11" rx="5.5" fill="#f2a53c" opacity="0.85" />
      <path d="M64 76h56" stroke="#9ec8dd" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M120 84q20 5 17 20t-20 12" fill="none" stroke="#9ec8dd" strokeWidth="6" strokeLinecap="round" />

      {/* tiny droplets: the visible part of the mist */}
      <g fill="#ffffff" opacity="0.95">
        <circle cx="80" cy="63" r="4.8" />
        <circle cx="95" cy="54" r="5.6" />
        <circle cx="110" cy="61" r="4.2" />
        <circle cx="87" cy="44" r="3.6" />
        <circle cx="104" cy="39" r="3" />
      </g>
      <g stroke="#ffffff" strokeWidth="2.2" fill="none" opacity="0.6" strokeLinecap="round">
        <path d="M73 70q-7 -11 0 -20" />
        <path d="M117 68q7 -11 0 -20" />
      </g>
    </g>
  );
}

function Droplets({ xs, y }: { xs: number[]; y: number }) {
  return (
    <g fill={WATER_DEEP}>
      {xs.map((x, index) => (
        <path
          key={x}
          d={`M${x} ${y}q-3.4 5.4 0 8.2 3.4 -2.8 0 -8.2Z`}
          opacity={index % 2 === 0 ? 0.9 : 0.7}
        />
      ))}
    </g>
  );
}

function Mountain({ x, height, tone }: { x: number; height: number; tone: string }) {
  return (
    <g transform={`translate(${x} 112)`}>
      <path d={`M0 0 -${height * 0.62} 0 -0 -${height}Z`} fill={tone} />
      <path d={`M0 -${height * 0.32} -${height * 0.26} 0H0Z`} fill="#ffffff" opacity="0.6" />
    </g>
  );
}

export function QuizArt({ scene }: { scene: QuizScene }) {
  return (
    <svg className="lab-art" viewBox="0 0 200 160" role="presentation" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`lab-sky-${scene}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={SKY} />
          <stop offset="100%" stopColor={SKY_DEEP} />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="200" height="160" rx="22" fill={`url(#lab-sky-${scene})`} />

      {scene === 'sun' ? (
        <>
          <SunHappy />
          <SeaWaves />
          <UpArrows />
        </>
      ) : null}

      {scene === 'vapour' ? (
        <>
          <HotMug />
        </>
      ) : null}

      {scene === 'cloud' ? (
        <>
          <PuffCloud x={104} y={54} scale={1.15} />
          <PuffCloud x={46} y={78} scale={0.72} tone="#f4fbff" />
          <PuffCloud x={158} y={86} scale={0.58} tone="#f4fbff" />
          <Droplets xs={[86, 100, 114, 128]} y={78} />
          <path d="M0 132q26 -12 52 0t52 0 52 0 44 0v28H0Z" fill={GREEN} opacity="0.55" />
        </>
      ) : null}

      {scene === 'rain' ? (
        <>
          <PuffCloud x={100} y={52} scale={1.25} tone="#b9c6dd" />
          <PuffCloud x={74} y={42} scale={0.6} tone="#cdd8ea" />
          <PuffCloud x={128} y={44} scale={0.55} tone="#cdd8ea" />
          <g stroke="#69b9e8" strokeWidth="3" strokeLinecap="round">
            <path d="M74 78v12" />
            <path d="M92 84v14" />
            <path d="M110 78v12" />
            <path d="M128 84v14" />
            <path d="M62 88v10" />
            <path d="M140 90v10" />
          </g>
          <ellipse cx="100" cy="140" rx="58" ry="10" fill={WATER} opacity="0.6" />
          <path d="M0 122q24 -8 48 0t48 0 48 0 56 0v38H0Z" fill={GREEN} opacity="0.6" />
        </>
      ) : null}

      {scene === 'valley' ? (
        <>
          <Mountain x={54} height={62} tone="#6aa981" />
          <Mountain x={112} height={76} tone="#4d9469" />
          <Mountain x={158} height={54} tone="#7db894" />
          <path d="M0 112h200v48H0Z" fill={GREEN} />
          <path d="M18 160q28 -22 54 -12t34 -14 34 6 44 -10v30Z" fill={WATER} opacity="0.85" />
          <path d="M18 160q28 -22 54 -12t34 -14 34 6 44 -10" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.7" />
          <circle cx="42" cy="118" r="4" fill={SAND} />
          <circle cx="166" cy="122" r="3" fill={SAND} />
        </>
      ) : null}

      {scene === 'cycle' ? (
        <>
          <circle cx="100" cy="78" r="46" fill="none" stroke="#ffffff" strokeWidth="12" opacity="0.45" />
          <circle cx="100" cy="78" r="46" fill="none" stroke="#3f8f58" strokeWidth="4" strokeDasharray="10 12" opacity="0.8" />
          <SunHappy />
          <g transform="translate(56 118)">
            <PuffCloud x={0} y={0} scale={0.42} />
          </g>
          <g transform="translate(150 116)">
            <path d="M-14 6q14 -10 28 0v8h-28Z" fill={WATER} />
            <path d="M-14 6q14 -10 28 0" fill="none" stroke="#7fd0ef" strokeWidth="2.4" />
          </g>
          <path d="M138 42l8 -8 8 8" fill="none" stroke="#3f8f58" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M46 60l-8 8 8 8" fill="none" stroke="#3f8f58" strokeWidth="3.4" strokeLinecap="round" />
        </>
      ) : null}
    </svg>
  );
}

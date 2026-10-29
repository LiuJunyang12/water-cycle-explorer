import type { ProcessId } from '../../game/waterCycle';

interface CycleCardArtProps {
  process: ProcessId;
  className?: string;
}

/**
 * Small scene that shows what happens during one stage of the water cycle.
 *
 * The drawings are inline SVG so they stay crisp at any card size and need no
 * image files. Water vapour is never drawn as visible steam: the evaporation
 * scene shows the sun heating the sea and heat arrows rising, which is what a
 * pupil can actually see.
 */
export function CycleCardArt({ process, className }: CycleCardArtProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 90"
      role="img"
      aria-hidden="true"
      focusable="false"
      data-scene={process}
    >
      <defs>
        <linearGradient id={`sky-${process}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfe8f7" />
          <stop offset="100%" stopColor="#eaf7fd" />
        </linearGradient>
        <linearGradient id={`sea-${process}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#63c2e8" />
          <stop offset="100%" stopColor="#2b83b4" />
        </linearGradient>
        <linearGradient id={`rain-${process}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9aa7b4" />
          <stop offset="100%" stopColor="#6b7785" />
        </linearGradient>
        <linearGradient id={`land-${process}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8fd49b" />
          <stop offset="100%" stopColor="#5aa86c" />
        </linearGradient>
      </defs>

      <rect width="120" height="90" rx="10" fill={`url(#sky-${process})`} />

      {process === 'evaporation' ? <EvaporationScene /> : null}
      {process === 'condensation' ? <CondensationScene /> : null}
      {process === 'precipitation' ? <PrecipitationScene /> : null}
      {process === 'collection' ? <CollectionScene /> : null}
    </svg>
  );
}

function Sun({ x = 92, y = 20, r = 11 }: { x?: number; y?: number; r?: number }) {
  return (
    <g>
      <g stroke="#f7c948" strokeWidth="2.4" strokeLinecap="round">
        <line x1={x} y1={y - r - 5} x2={x} y2={y - r - 1} />
        <line x1={x + r + 5} y1={y} x2={x + r + 1} y2={y} />
        <line x1={x - r - 5} y1={y} x2={x - r - 1} y2={y} />
        <line x1={x + 4} y1={y - r - 4} x2={x + 7} y2={y - r - 1} />
        <line x1={x - 4} y1={y - r - 4} x2={x - 7} y2={y - r - 1} />
      </g>
      <circle cx={x} cy={y} r={r} fill="#f9d96b" />
      <circle cx={x - 3} cy={y - 3} r={3.4} fill="#fdf0b8" opacity="0.85" />
    </g>
  );
}

function SeaHills({ from = 62 }: { from?: number }) {
  return (
    <g>
      <rect x="0" y={from} width="120" height={90 - from} fill="url(#sea-evaporation)" />
      <rect x="0" y={from} width="120" height="3.4" fill="#a9e3f6" opacity="0.9" />
      <g stroke="#e8f8ff" strokeWidth="1.6" strokeLinecap="round" opacity="0.75">
        <line x1="12" y1={from + 10} x2="30" y2={from + 10} />
        <line x1="52" y1={from + 15} x2="74" y2={from + 15} />
        <line x1="86" y1={from + 9} x2="104" y2={from + 9} />
      </g>
    </g>
  );
}

function EvaporationScene() {
  return (
    <g>
      <Sun />
      <SeaHills />
      {/* heat arrows rising from the warmed sea */}
      <g stroke="#f2a93b" strokeWidth="2.6" strokeLinecap="round" fill="none">
        <path d="M26 74 C 24 66, 30 62, 27 54" />
        <path d="M26 54 l -4 5 M26 54 l 4.4 4.4" />
        <path d="M58 74 C 56 64, 62 60, 59 50" />
        <path d="M59 50 l -4 5 M59 50 l 4.4 4.4" />
        <path d="M88 74 C 86 68, 92 64, 89 58" opacity="0.75" />
      </g>
      <circle cx="34" cy="38" r="1.6" fill="#bfe8f7" />
      <circle cx="46" cy="33" r="1.2" fill="#bfe8f7" />
    </g>
  );
}

function CloudShape({
  x,
  y,
  scale = 1,
  fill = '#ffffff',
  stroke = '#cfe2ec',
}: {
  x: number;
  y: number;
  scale?: number;
  fill?: string;
  stroke?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path
        d="M0 18 C -10 18, -14 10, -8 5 C -9 -3, 1 -8, 7 -4 C 10 -11, 24 -11, 27 -3 C 35 -4, 39 5, 33 11 C 37 17, 31 20, 25 19 L 4 19 C 2 19, 1 19, 0 18 Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.6"
      />
    </g>
  );
}

function CondensationScene() {
  return (
    <g>
      <Sun x={20} y={16} r={8} />
      <CloudShape x={44} y={30} scale={1.25} />
      {/* tiny droplets that make up the cloud */}
      <g fill="#7fc6e8">
        <circle cx="52" cy="42" r="1.6" />
        <circle cx="60" cy="45" r="1.2" />
        <circle cx="68" cy="41" r="1.5" />
        <circle cx="76" cy="45" r="1.1" />
      </g>
      {/* air cools as it rises */}
      <g stroke="#5aa8cf" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 4" fill="none">
        <path d="M22 66 C 26 56, 30 50, 36 44" />
      </g>
      <SeaHills from={70} />
    </g>
  );
}

function PrecipitationScene() {
  return (
    <g>
      <CloudShape x={40} y={18} scale={1.3} fill="url(#rain-precipitation)" stroke="#8b97a5" />
      <g stroke="#3fa9dd" strokeWidth="2.4" strokeLinecap="round">
        <line x1="48" y1="42" x2="44" y2="53" />
        <line x1="58" y1="44" x2="54" y2="55" />
        <line x1="68" y1="42" x2="64" y2="53" />
        <line x1="78" y1="44" x2="74" y2="55" />
      </g>
      <rect x="0" y="76" width="120" height="14" fill="url(#land-precipitation)" />
      <ellipse cx="58" cy="76" rx="26" ry="4" fill="#9fdcf5" />
      <g fill="#3fa9dd" opacity="0.7">
        <circle cx="52" cy="78" r="1.4" />
        <circle cx="66" cy="79" r="1.1" />
      </g>
    </g>
  );
}

function CollectionScene() {
  return (
    <g>
      <Sun x={100} y={16} r={8} />
      <path d="M0 62 C 18 46, 34 46, 48 60 L 48 90 L 0 90 Z" fill="url(#land-collection)" />
      <path d="M120 58 C 100 44, 80 48, 62 62 L 62 90 L 120 90 Z" fill="#79bd79" />
      <rect x="0" y="74" width="120" height="16" fill="url(#sea-collection)" />
      <path
        d="M48 90 C 54 82, 52 78, 60 76 L 62 90 Z"
        fill="#63c2e8"
        stroke="#a9e3f6"
        strokeWidth="1.2"
      />
      <g fill="#3f8f4f">
        <path d="M22 62 l 4 -10 l 4 10 z" />
        <path d="M86 60 l 4 -9 l 4 9 z" />
      </g>
      <g stroke="#e8f8ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
        <line x1="12" y1="82" x2="28" y2="82" />
        <line x1="92" y1="84" x2="110" y2="84" />
      </g>
    </g>
  );
}

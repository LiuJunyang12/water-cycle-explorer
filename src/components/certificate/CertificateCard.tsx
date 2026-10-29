import { useEffect, useState } from 'react';
import { CERTIFICATE_ART, CERTIFICATE_SIZE, CERTIFICATE_TEXT, formatMalayDate } from '../../data/finale';
import './CertificateCard.css';

interface CertificateCardProps {
  /** The name printed in the middle of the certificate. */
  name: string;
  /** Date shown next to the signature block. */
  date?: Date;
  /** Filled with the live <svg> so the PNG export can rasterise it. */
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

const WIDTH = CERTIFICATE_SIZE.width;
const HEIGHT = CERTIFICATE_SIZE.height;

const INK = '#24452b';
const INK_SOFT = '#3d6045';
const GREEN = '#67b971';
const GREEN_DEEP = '#2f6b3c';
const GOLD = '#c9a227';
const CREAM = '#fbfdf1';

const SERIF = "'Georgia', 'Times New Roman', serif";
const SANS = "'Segoe UI', 'Trebuchet MS', system-ui, sans-serif";

/** Splits a sentence into lines so the SVG text never runs past the frame. */
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines;
}

const bodyLines = wrapText(CERTIFICATE_TEXT.body, 72);

/** Long names step down a size or two so they stay inside the frame. */
function nameFontSize(name: string): number {
  if (name.length > 30) {
    return 28;
  }
  if (name.length > 22) {
    return 36;
  }
  return 47;
}

/** Picks up an optional local artwork file; missing files simply stay invisible. */
function useOptionalImage(src: string): string | null {
  const [resolved, setResolved] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const probe = new Image();
    probe.onload = () => {
      if (!cancelled) {
        setResolved(src);
      }
    };
    probe.onerror = () => {
      if (!cancelled) {
        setResolved(null);
      }
    };
    probe.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return resolved;
}

function BadgeGlyph({ kind }: { kind: 'explorer' | 'builder' | 'scientist' }) {
  if (kind === 'explorer') {
    return (
      <g>
        <path d="M0 -13 L9 0 L0 13 L-9 0 Z" fill="none" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <circle cx="0" cy="0" r="2.6" fill={GREEN_DEEP} />
      </g>
    );
  }
  if (kind === 'builder') {
    return (
      <g fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-6.5 -10.5 A12 12 0 0 1 8.5 -6" />
        <path d="M8.5 -6 L8.5 -11 L13 -8.4 Z" fill={INK} stroke="none" />
        <path d="M6.5 10.5 A12 12 0 0 1 -8.5 6" />
        <path d="M-8.5 6 L-8.5 11 L-13 8.4 Z" fill={INK} stroke="none" />
      </g>
    );
  }
  return (
    <g>
      <path
        d="M0 -13 C7.5 -4 11 1.5 11 6.5 A11 11 0 0 1 -11 6.5 C-11 1.5 -7.5 -4 0 -13 Z"
        fill="none"
        stroke={INK}
        strokeWidth="2"
      />
      <path d="M-3.6 5 L0 9 L3.6 5" fill="none" stroke={GREEN_DEEP} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

const BADGE_KINDS = ['explorer', 'builder', 'scientist'] as const;

export function CertificateCard({ name, date = new Date(), svgRef }: CertificateCardProps) {
  const printedName = name || CERTIFICATE_TEXT.nameFallback;
  const seal = useOptionalImage(CERTIFICATE_ART.seal);
  const signatureTeacher = useOptionalImage(CERTIFICATE_ART.signatureTeacher);
  const signatureLecturer = useOptionalImage(CERTIFICATE_ART.signatureLecturer);
  const logo = useOptionalImage(CERTIFICATE_ART.logo);
  const dateLabel = `${CERTIFICATE_TEXT.dateLabel}: ${formatMalayDate(date)}`;
  const nameSize = nameFontSize(printedName);

  return (
    <svg
      ref={svgRef}
      className="certificate"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={WIDTH}
      height={HEIGHT}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Sijil pencapaian kitaran air untuk ${printedName}`}
      data-testid="certificate"
    >
      <defs>
        <radialGradient id="cert-paper" cx="50%" cy="34%" r="82%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="58%" stopColor={CREAM} />
          <stop offset="100%" stopColor="#e9f4d6" />
        </radialGradient>
        <linearGradient id="cert-ribbon" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={GREEN_DEEP} />
          <stop offset="52%" stopColor={GREEN} />
          <stop offset="100%" stopColor={GREEN_DEEP} />
        </linearGradient>
        <radialGradient id="cert-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={GREEN} stopOpacity="0.18" />
          <stop offset="100%" stopColor={GREEN} stopOpacity="0" />
        </radialGradient>
        <filter id="cert-soft" x="-20%" y="-25%" width="140%" height="150%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#24452b" floodOpacity="0.18" />
        </filter>
        <clipPath id="cert-seal-clip">
          <circle cx="0" cy="0" r="44" />
        </clipPath>
      </defs>

      {/* Paper + double frame */}
      <rect width={WIDTH} height={HEIGHT} rx="10" fill="url(#cert-paper)" />
      <ellipse cx="200" cy="690" rx="260" ry="150" fill="url(#cert-glow)" />
      <ellipse cx="960" cy="120" rx="240" ry="140" fill="url(#cert-glow)" />
      <rect x="3" y="3" width={WIDTH - 6} height={HEIGHT - 6} rx="8" fill="none" stroke={INK} strokeWidth="6" />
      <rect x="20" y="20" width={WIDTH - 40} height={HEIGHT - 40} rx="5" fill="none" stroke={GOLD} strokeWidth="1.6" />
      <rect
        x="28"
        y="28"
        width={WIDTH - 56}
        height={HEIGHT - 56}
        rx="3"
        fill="none"
        stroke={GREEN_DEEP}
        strokeWidth="0.7"
        opacity="0.45"
      />

      {/* Corner flourishes */}
      {[
        [36, 36, 1, 1],
        [WIDTH - 36, 36, -1, 1],
        [36, HEIGHT - 36, 1, -1],
        [WIDTH - 36, HEIGHT - 36, -1, -1],
      ].map(([x, y, sx, sy]) => (
        <path
          key={`${x}-${y}`}
          d="M0 44 Q0 0 44 0"
          transform={`translate(${x} ${y}) scale(${sx} ${sy})`}
          fill="none"
          stroke={GOLD}
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.8"
        />
      ))}

      {/* Header */}
      <text
        x="560"
        y="92"
        textAnchor="middle"
        fontFamily={SANS}
        fontSize="19"
        fontWeight="700"
        letterSpacing="9"
        fill={GREEN_DEEP}
      >
        {CERTIFICATE_TEXT.heading}
      </text>
      <g stroke={GOLD} strokeWidth="1.4">
        <line x1="392" y1="112" x2="540" y2="112" />
        <line x1="580" y1="112" x2="728" y2="112" />
      </g>
      <path d="M560 105 L568 112 L560 119 L552 112 Z" fill={GOLD} />
      <text x="560" y="156" textAnchor="middle" fontFamily={SERIF} fontSize="38" fontWeight="700" fill={INK}>
        {CERTIFICATE_TEXT.subheading}
      </text>
      <text x="560" y="184" textAnchor="middle" fontFamily={SANS} fontSize="14" fill={INK_SOFT} letterSpacing="1.1">
        {CERTIFICATE_TEXT.subject}
      </text>

      {/* Name block */}
      <text x="560" y="220" textAnchor="middle" fontFamily={SERIF} fontSize="15.5" fontStyle="italic" fill={INK_SOFT}>
        {CERTIFICATE_TEXT.intro}
      </text>
      <text
        x="560"
        y="278"
        textAnchor="middle"
        fontFamily={SERIF}
        fontSize={nameSize}
        fontWeight="700"
        fill={INK}
        data-testid="certificate-name"
      >
        {printedName}
      </text>
      <line x1="316" y1="296" x2="804" y2="296" stroke={GOLD} strokeWidth="1.2" opacity="0.65" />

      {/* Award statement */}
      {bodyLines.map((line, index) => (
        <text
          key={line}
          x="560"
          y={328 + index * 22}
          textAnchor="middle"
          fontFamily={SANS}
          fontSize="14"
          fill={INK_SOFT}
        >
          {line}
        </text>
      ))}

      <g transform={`translate(560 ${bodyLines.length > 2 ? 414 : 398})`}>
        <rect x="-256" y="-29" width="512" height="56" rx="28" fill="url(#cert-ribbon)" filter="url(#cert-soft)" />
        <text y="-2" textAnchor="middle" fontFamily={SERIF} fontSize="22" fontWeight="700" letterSpacing="2.4" fill="#ffffff">
          {CERTIFICATE_TEXT.award}
        </text>
        <text y="18" textAnchor="middle" fontFamily={SANS} fontSize="11" letterSpacing="2.2" fill="#eaf7ec">
          {CERTIFICATE_TEXT.awardEnglish}
        </text>
      </g>

      {/* Badges */}
      <text x="560" y="470" textAnchor="middle" fontFamily={SANS} fontSize="11" letterSpacing="2.8" fill={INK_SOFT}>
        {CERTIFICATE_TEXT.badgesTitle.toUpperCase()}
      </text>
      {CERTIFICATE_TEXT.badges.map((badge, index) => {
        const x = 560 + (index - 1) * 176;
        return (
          <g key={badge.label} transform={`translate(${x} 512)`}>
            <circle r="36" fill="#ffffff" stroke={GREEN} strokeWidth="2" />
            <circle r="30" fill="#f2f8e6" />
            <BadgeGlyph kind={BADGE_KINDS[index]} />
            <text y="60" textAnchor="middle" fontFamily={SANS} fontSize="13.5" fontWeight="700" fill={INK}>
              {badge.label}
            </text>
            <text y="77" textAnchor="middle" fontFamily={SANS} fontSize="10" fill={INK_SOFT} letterSpacing="1">
              {badge.english}
            </text>
          </g>
        );
      })}

      {/* Footer: date, seal, signatures */}
      <line x1="128" y1="622" x2="332" y2="622" stroke={INK_SOFT} strokeWidth="1" opacity="0.55" />
      <text x="230" y="644" textAnchor="middle" fontFamily={SANS} fontSize="12.5" fill={INK}>
        {dateLabel}
      </text>
      <text x="230" y="662" textAnchor="middle" fontFamily={SANS} fontSize="10" fill={INK_SOFT}>
        Tarikh penyempurnaan
      </text>

      <g transform="translate(560 646)">
        <circle r="50" fill="#ffffff" stroke={GOLD} strokeWidth="1.5" opacity="0.9" />
        <circle r="44" fill="#eef7e3" />
        {seal ? (
          <image
            href={seal}
            x="-44"
            y="-44"
            width="88"
            height="88"
            clipPath="url(#cert-seal-clip)"
            preserveAspectRatio="xMidYMid slice"
          />
        ) : (
          <g>
            <path
              d="M0 -28 C23 -7 31 5 31 16 A31 31 0 0 1 -31 16 C-31 5 -23 -7 0 -28 Z"
              fill="none"
              stroke={GREEN_DEEP}
              strokeWidth="2.2"
            />
            <circle cx="-10" cy="11" r="2.8" fill={INK} />
            <circle cx="10" cy="11" r="2.8" fill={INK} />
            <path d="M-7 20 Q0 26.5 7 20" fill="none" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
          </g>
        )}
        <text y="68" textAnchor="middle" fontFamily={SANS} fontSize="9.5" letterSpacing="1.2" fill={INK_SOFT}>
          {CERTIFICATE_TEXT.sealLabel}
        </text>
      </g>

      {[
        { x: 800, label: CERTIFICATE_TEXT.signatureTeacher, image: signatureTeacher },
        { x: 992, label: CERTIFICATE_TEXT.signatureLecturer, image: signatureLecturer },
      ].map((block) => (
        <g key={block.label}>
          {block.image ? (
            <image
              href={block.image}
              x={block.x - 80}
              y="570"
              width="160"
              height="44"
              preserveAspectRatio="xMidYMax meet"
            />
          ) : null}
          <line x1={block.x - 80} y1="622" x2={block.x + 80} y2="622" stroke={INK_SOFT} strokeWidth="1" opacity="0.55" />
          <text x={block.x} y="644" textAnchor="middle" fontFamily={SANS} fontSize="12.5" fontWeight="600" fill={INK}>
            {block.label}
          </text>
        </g>
      ))}

      {logo ? <image href={logo} x="66" y="556" width="64" height="64" preserveAspectRatio="xMidYMid meet" /> : null}

      <text x="560" y="738" textAnchor="middle" fontFamily={SERIF} fontSize="12.5" fontStyle="italic" fill={INK_SOFT}>
        {CERTIFICATE_TEXT.motto}
      </text>
    </svg>
  );
}

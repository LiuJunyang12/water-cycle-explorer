import type { LevelDef } from './types';

/**
 * The three levels of Mission to Cloud Kingdom.
 *
 * Units: 1 = 1% of the level width; 1% of the height = 0.5625 width units
 * (a 16:9 playfield), which keeps the artwork undistorted. The camera is fixed
 * and every object is drawn at a constant size, whatever the window shape.
 *
 * The flame hazards carry their ARTWORK footprint as the hitbox: 22 tall × 9.9
 * wide (a 4:5 canvas, see ART_ASPECT.hazard). Wally is judged by his drawn
 * body (physics.playerBodyBox), so a flame that touches him always hits.
 */

export const LEVEL_VAPOUR_VOYAGE: LevelDef = {
  id: 'vapour-voyage',
  title: 'Vapour Voyage',
  subtitle: 'Kumpul 5 penanda wap air dan sampai ke pintu keluar.',
  width: 230,
  spawn: { x: 6, y: 72 },
  platforms: [
    { id: 'v1', x: 0, y: 80, w: 42, h: 6 },
    { id: 'v2', x: 54, y: 74, w: 36, h: 6 },
    { id: 'v3', x: 102, y: 68, w: 34, h: 6 },
    { id: 'v4', x: 146, y: 74, w: 34, h: 6 },
    { id: 'v5', x: 190, y: 80, w: 40, h: 6 },
  ],
  collectibles: [
    { id: 'c1', x: 16, y: 76, r: 2.6 },
    { id: 'c2', x: 66, y: 70, r: 2.6 },
    { id: 'c3', x: 112, y: 64, r: 2.6 },
    { id: 'c4', x: 160, y: 70, r: 2.6 },
    { id: 'c5', x: 206, y: 76, r: 2.6 },
  ],
  hazards: [
    { id: 'h1', x: 113.05, y: 24, w: 9.9, h: 22, axis: 'x', range: 12, speed: 1.1 },
    { id: 'h2', x: 159.05, y: 30, w: 9.9, h: 22, axis: 'x', range: 12, speed: 1.35, phase: 1.2 },
  ],
  requiredCollectibles: 5,
  exit: { x: 214, y: 66, w: 14, h: 14 },
  doorArt: 'masuk',
  scienceTip: 'Matahari memberi tenaga kepada air untuk menyejat menjadi wap air.',
};

export const LEVEL_COOLING_PASSAGE: LevelDef = {
  id: 'cooling-passage',
  title: 'The Cooling Passage',
  subtitle: 'Panjat lebih tinggi, elak arus udara, dan jawab soalan sains.',
  width: 240,
  spawn: { x: 6, y: 66 },
  platforms: [
    { id: 'p1', x: 0, y: 74, w: 36, h: 6 },
    { id: 'p2', x: 48, y: 66, w: 30, h: 6 },
    { id: 'p3', x: 90, y: 58, w: 28, h: 6 },
    { id: 'p4', x: 130, y: 50, w: 30, h: 6 },
    { id: 'p5', x: 172, y: 58, w: 30, h: 6 },
    { id: 'p6', x: 208, y: 66, w: 30, h: 6 },
  ],
  collectibles: [
    { id: 'k1', x: 60, y: 56, r: 2.6 },
    { id: 'k2', x: 140, y: 40, r: 2.6 },
    { id: 'k3', x: 185, y: 48, r: 2.6 },
  ],
  hazards: [
    { id: 'w1', x: 78.55, y: 12, w: 9.9, h: 22, axis: 'y', range: 10, speed: 1.2 },
    { id: 'w2', x: 150.35, y: 8, w: 6.3, h: 14, axis: 'y', range: 6, speed: 1.5, phase: 0.8 },
    { id: 'w3', x: 185.95, y: 14, w: 9.9, h: 22, axis: 'x', range: 8, speed: 1.1, phase: 2 },
  ],
  requiredCollectibles: 0,
  exit: { x: 218, y: 52, w: 14, h: 14 },
  doorArt: 'keluar',
  scienceTip: 'Udara lembap yang naik biasanya menyejuk kerana tekanan udara menurun.',
};

export const LEVEL_CLOUD_BRIDGE: LevelDef = {
  id: 'cloud-bridge',
  title: 'Build the Cloud Bridge',
  subtitle: 'Susun langkah pembentukan awan, kemudian buat jambatan dan sampai ke istana.',
  width: 240,
  spawn: { x: 6, y: 72 },
  platforms: [
    { id: 'b1', x: 0, y: 80, w: 34, h: 6 },
    { id: 'b2', x: 46, y: 74, w: 24, h: 6 },
    { id: 'castle', x: 184, y: 56, w: 56, h: 10, kind: 'castle' },
  ],
  collectibles: [],
  hazards: [
    { id: 'a1', x: 119.05, y: 14, w: 9.9, h: 22, axis: 'y', range: 8, speed: 1.4, phase: 0.6 },
  ],
  requiredCollectibles: 0,
  exit: { x: 198, y: 40, w: 24, h: 16 },
  // Third level reuses the first door illustration; change this one value to swap it.
  doorArt: 'masuk',
  castle: { x: 194, y: 24, w: 44, h: 32 },
  scienceTip: 'Wap air yang menyejuk boleh terpeluwap menjadi titisan halus yang membentuk awan.',
};

/** Bridge platforms that only appear after the ordering challenge is solved. */
export const CLOUD_BRIDGE_PLATFORMS = [
  { id: 'bridge-1', x: 78, y: 70, w: 26, h: 6, kind: 'cloud' as const },
  { id: 'bridge-2', x: 112, y: 66, w: 26, h: 6, kind: 'cloud' as const },
  { id: 'bridge-3', x: 146, y: 62, w: 26, h: 6, kind: 'cloud' as const },
];

export const LEVELS: LevelDef[] = [
  LEVEL_VAPOUR_VOYAGE,
  LEVEL_COOLING_PASSAGE,
  LEVEL_CLOUD_BRIDGE,
];

/** Correct scientific order of the cloud-formation steps (ids in order). */
export const CLOUD_STEPS = [
  { id: 's1', text: 'Air cecair menyejat dan wap air masuk ke udara.' },
  { id: 's2', text: 'Udara lembap yang mengandungi wap air naik dan menyejuk.' },
  {
    id: 's3',
    text: 'Dalam keadaan yang sesuai, wap air terpeluwap menjadi titisan air halus atau hablur ais.',
  },
  {
    id: 's4',
    text: 'Banyak titisan air halus atau hablur ais terapung dan membentuk awan yang kelihatan.',
  },
] as const;

export const CLOUD_STEPS_CORRECT_ORDER = CLOUD_STEPS.map((step) => step.id);

export const COOLING_QUIZ = {
  question:
    'Apakah yang mungkin berlaku apabila udara lembap yang mengandungi wap air naik dan menyejuk kepada keadaan yang sesuai?',
  options: [
    { id: 'a', text: 'A. Wap air terpeluwap menjadi titisan air halus.' },
    { id: 'b', text: 'B. Semua wap air terus menjadi hujan.' },
    { id: 'c', text: 'C. Wap air bertukar menjadi gas yang kelihatan.' },
    { id: 'd', text: 'D. Wap air hilang sepenuhnya.' },
  ],
  correctId: 'a',
  correctFeedback:
    'Betul! Apabila udara lembap menyejuk dan mencapai keadaan yang sesuai, wap air boleh terpeluwap menjadi titisan air halus; dalam keadaan tertentu hablur ais juga boleh terbentuk.',
  wrongFeedback:
    'Cuba lagi! Ingat, wap air ialah gas yang tidak kelihatan. Kondensasi ialah proses wap air bertukar menjadi titisan air cecair.',
} as const;

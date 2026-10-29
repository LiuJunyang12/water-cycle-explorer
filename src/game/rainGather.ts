/**
 * Station 4 — Rain in the Waterfall Valley.
 *
 * The pupil drags the small droplets floating in the sky onto the big droplet
 * that sits on top of the cloud. Each droplet that joins makes the collector
 * droplet bigger and the cloud darker (heavier). When every droplet has joined,
 * the cloud can no longer hold the water: it starts to shake and the pupil is
 * asked whether the rain should start.
 *
 * The rules here are pure data + pure functions, so the whole flow can be tested
 * without a browser: gather → ask → rain → finished.
 */

export type RainPhase = 'gathering' | 'asking' | 'raining' | 'finished';

/** A droplet still floating in the sky, positioned in % of the scene box. */
export interface Droplet {
  id: string;
  /** Horizontal centre, 0–100 (% of the scene width). */
  x: number;
  /** Vertical centre, 0–100 (% of the scene height). */
  y: number;
}

export interface RainState {
  phase: RainPhase;
  /** Droplets still waiting to be dragged onto the collector. */
  droplets: Droplet[];
  /** Ids already merged into the collector droplet, in the order they arrived. */
  mergedIds: string[];
}

export const RAIN_GAME = {
  dropletCount: 12,
  /** How long each Wally narration line stays on screen while it rains. */
  narrationStepMs: 4200,
} as const;

/**
 * Where the droplets float. Placed in the open sky, above the cloud and below
 * the top edge, so the collector droplet (centre, ~30% down) stays reachable.
 */
/**
 * Where the twelve droplets float, in percent of the scene box.
 *
 * Two areas stay empty on purpose:
 * - the whole right column down to y = 30%, where the HUD (progress + restart)
 *   is pinned on top of the scene, and
 * - the middle of the sky, right above the cloud, where the big collector drop
 *   grows as droplets merge into it.
 */
export const DROPLET_LAYOUT: ReadonlyArray<{ x: number; y: number }> = [
  { x: 8, y: 12 },
  { x: 20, y: 5 },
  { x: 33, y: 15 },
  { x: 45, y: 7 },
  { x: 12, y: 32 },
  { x: 25, y: 43 },
  { x: 39, y: 30 },
  { x: 53, y: 45 },
  { x: 66, y: 56 },
  { x: 78, y: 41 },
  { x: 89, y: 55 },
  { x: 94, y: 33 },
];

export function createGame(): RainState {
  return {
    phase: 'gathering',
    droplets: DROPLET_LAYOUT.slice(0, RAIN_GAME.dropletCount).map((position, index) => ({
      id: `d${index + 1}`,
      x: position.x,
      y: position.y,
    })),
    mergedIds: [],
  };
}

/** 0 → empty cloud, 1 → cloud that can no longer hold its water. */
export function cloudDarkness(state: RainState): number {
  return state.mergedIds.length / RAIN_GAME.dropletCount;
}

export function collectedCount(state: RainState): number {
  return state.mergedIds.length;
}

export function isGatheringComplete(state: RainState): boolean {
  return state.mergedIds.length >= RAIN_GAME.dropletCount;
}

/** The cloud shakes as soon as it is too heavy, and keeps shaking while it rains. */
export function isCloudOverfull(state: RainState): boolean {
  return state.phase === 'asking' || state.phase === 'raining';
}

/**
 * Merge one floating droplet into the collector droplet.
 *
 * Unknown ids and droplets that already merged are ignored, so firing the same
 * gesture twice (drag + click, or a double click) can never over-count.
 */
export function collectDroplet(state: RainState, dropletId: string): RainState {
  if (state.phase !== 'gathering') return state;
  if (!state.droplets.some((droplet) => droplet.id === dropletId)) return state;

  const droplets = state.droplets.filter((droplet) => droplet.id !== dropletId);
  const mergedIds = [...state.mergedIds, dropletId];
  const allMerged = mergedIds.length >= RAIN_GAME.dropletCount;

  return {
    phase: allMerged ? 'asking' : 'gathering',
    droplets,
    mergedIds,
  };
}

/** The pupil answered "yes" to the rain question. */
export function startRain(state: RainState): RainState {
  if (state.phase !== 'asking') return state;
  return { ...state, phase: 'raining' };
}

/** The rain animation has played to the end. */
export function finishRain(state: RainState): RainState {
  if (state.phase !== 'raining') return state;
  return { ...state, phase: 'finished' };
}

/** Wally's lines while the rain falls; one line per narration step. */
export const RAIN_NARRATION: ReadonlyArray<string> = [
  'Di dalam awan, titisan air kecil bergabung menjadi titisan yang lebih besar.',
  'Semakin berat titisan itu, semakin sukar awan menahannya.',
  'Titisan jatuh sebagai hujan — inilah kerpasan (precipitation).',
  'Air hujan mengalir ke dalam sungai, tasik dan laut.',
  'Air yang terkumpul akan menyejat semula, dan kitaran air berterusan.',
];

export const RAIN_TEXT = {
  title: 'Hujan di Lembah Air Terjun',
  mission:
    'Seret titisan air kecil di langit ke titisan besar di atas awan sehingga awan tidak dapat menahannya lagi.',
  hint: 'Seret dengan tetikus, atau klik titisan untuk menghantarnya ke awan.',
  progressLabel: 'Titisan yang bergabung',
  restart: 'Mula semula',
  question:
    'Awan sudah tidak dapat menampung berat air. Adakah anda mahu memulakan proses hujan?',
  questionNote: 'Dalam keadaan sebenar, hujan berlaku apabila titisan air dalam awan cukup besar dan berat.',
  answerYes: 'Ya, mulakan hujan',
  rainingLabel: 'Hujan sedang turun',
  almostFull: 'Awan sudah hampir penuh. Teruskan menggabungkan titisan!',
  finishedLabel: 'Kitaran air berterusan',
  finishedTitle: 'Hujan telah turun ke bumi!',
  finishedText:
    'Air hujan jatuh ke laut, tasik dan sungai. Air itu akan menyejat semula dan membentuk awan — kitaran air tidak pernah berhenti.',
  playAgain: 'Main lagi',
  backToMap: 'Kembali ke peta',
} as const;

export const RAIN_FACTS: ReadonlyArray<string> = [
  'Kerpasan (precipitation) ialah air yang jatuh dari awan sebagai hujan.',
  'Air hujan berkumpul di laut, tasik dan sungai.',
  'Awan menjadi gelap apabila lebih banyak titisan air berkumpul di dalamnya.',
  'Kitaran air berterusan: air yang sama boleh menyejat, menjadi awan dan turun semula sebagai hujan.',
  'Wap air tidak kelihatan, tetapi titisan air di dalam awan dapat dilihat sebagai awan yang gelap.',
];

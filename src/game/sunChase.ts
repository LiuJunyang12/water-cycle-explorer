/**
 * Sunny Coast — "Catch the Sunlight" game.
 *
 * Science this game must respect:
 *  - The Sun supplies the energy that makes water evaporate.
 *  - Only the water hit by sunlight gains energy; the rest stays cool.
 *  - Water turns into water vapour, which is invisible — the game draws only a
 *    faint shimmer to show where molecules go.
 *
 * Pure logic only (no DOM) so the game rules can be unit-tested.
 */

export const SUN_GAME = {
  /** Number of droplets to evaporate before the level is complete. */
  dropletCount: 8,
  /** Energy gained per second while a droplet is inside the light. */
  energyPerSecond: 50,
  /** Radius of the sunlight patch, in scene-width units (scene = 100 wide). */
  lightRadius: 6.5,
  /** Vertical centre of the light patch on the water (scene %). */
  waterLineY: 68,
  /** Sun position at the start (scene %). */
  sunStartX: 50,
  /** Keyboard step for the sun position control. */
  keyboardStep: 4,
  tickMs: 50,
  /** How long the rising wisp stays on screen after an evaporation (ms). */
  puffLifetimeMs: 2400,
} as const;

/** Fixed droplet positions so the level is always solvable and reproducible. */
export const DROPLET_SPOTS: ReadonlyArray<{ x: number; y: number }> = [
  { x: 7, y: 69 },
  { x: 19, y: 66 },
  { x: 31, y: 70 },
  { x: 43, y: 67 },
  { x: 55, y: 69 },
  { x: 67, y: 66 },
  { x: 79, y: 70 },
  { x: 91, y: 67 },
];

export interface Droplet {
  id: number;
  x: number;
  y: number;
  /** 0–99 while on the surface; 100 evaporates it. */
  energy: number;
}

/** A short-lived wisp drawn after a droplet evaporates (direction cue only). */
export interface Puff {
  id: number;
  x: number;
  y: number;
  /** Simulation time (ms) at which this wisp disappears. */
  expiresAt: number;
}

export interface SunGameState {
  droplets: Droplet[];
  evaporated: number;
  elapsedMs: number;
  puffs: Puff[];
  nextPuffId: number;
}

export function createGame(): SunGameState {
  const droplets: Droplet[] = [];
  for (let index = 0; index < SUN_GAME.dropletCount; index += 1) {
    const spot = DROPLET_SPOTS[index % DROPLET_SPOTS.length];
    droplets.push({ id: index + 1, x: spot.x, y: spot.y, energy: 0 });
  }
  return { droplets, evaporated: 0, elapsedMs: 0, puffs: [], nextPuffId: 1 };
}

/**
 * Whether a droplet sits inside the sunlight patch.
 *
 * The scene is 4:3, so a vertical distance of 1% is worth 0.75% of the width;
 * this keeps the light patch circular on screen instead of oval.
 */
export function isDropletLit(droplet: Pick<Droplet, 'x' | 'y'>, sunX: number): boolean {
  const dx = droplet.x - sunX;
  const dy = (droplet.y - SUN_GAME.waterLineY) * 0.75;
  return Math.sqrt(dx * dx + dy * dy) <= SUN_GAME.lightRadius;
}

/** Advances the game: lit droplets gain energy, full ones evaporate. */
export function advanceGame(state: SunGameState, sunX: number, dtMs: number): SunGameState {
  const dt = Math.max(0, Math.min(200, dtMs));
  const gain = (SUN_GAME.energyPerSecond * dt) / 1000;
  const elapsedMs = state.elapsedMs + dt;

  const droplets: Droplet[] = [];
  const newPuffs: Puff[] = [];
  let nextPuffId = state.nextPuffId;
  let evaporated = state.evaporated;

  for (const droplet of state.droplets) {
    if (!isDropletLit(droplet, sunX)) {
      droplets.push(droplet);
      continue;
    }
    const energy = droplet.energy + gain;
    if (energy >= 100) {
      evaporated += 1;
      newPuffs.push({
        id: nextPuffId,
        x: droplet.x,
        y: droplet.y,
        expiresAt: elapsedMs + SUN_GAME.puffLifetimeMs,
      });
      nextPuffId += 1;
    } else {
      droplets.push({ ...droplet, energy });
    }
  }

  const puffs = [...state.puffs.filter((puff) => puff.expiresAt > elapsedMs), ...newPuffs];

  return { droplets, evaporated, elapsedMs, puffs, nextPuffId };
}

export function isGameWon(state: SunGameState): boolean {
  return state.droplets.length === 0 && state.evaporated >= SUN_GAME.dropletCount;
}

export const GAME_TEXT = {
  title: 'PENANGKAP CAHAYA MATAHARI',
  mission: 'Misi: Gerakkan matahari supaya semua titisan air menyejat!',
  hint: 'Seret matahari (atau guna kekunci anak panah) dan biarkan ia menyinari titisan air sebentar.',
  charging: 'Hati-hati — kawasan cahaya kecil. Gerakkan matahari ke titisan seterusnya.',
  win: 'Semua titisan air telah menyejat!',
  winSubtitle: 'Anda menggunakan tenaga suria untuk menyejat air.',
} as const;

export const GAME_SUMMARY_FACTS: readonly string[] = [
  'Cahaya matahari membekalkan tenaga yang diperlukan air untuk menyejat.',
  'Hanya air yang dipanaskan bertukar menjadi wap air; air yang lain kekal cecair.',
  'Air menyejat di bawah takat didih, dan wap air tidak kelihatan.',
];

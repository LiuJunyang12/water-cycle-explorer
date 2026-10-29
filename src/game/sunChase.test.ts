import { describe, expect, test } from 'vitest';
import {
  advanceGame,
  createGame,
  DROPLET_SPOTS,
  isDropletLit,
  isGameWon,
  SUN_GAME,
} from './sunChase';

describe('sunlight catcher game rules', () => {
  test('starts with the full set of droplets and no progress', () => {
    const game = createGame();

    expect(game.droplets).toHaveLength(SUN_GAME.dropletCount);
    expect(game.evaporated).toBe(0);
    expect(game.droplets.every((droplet) => droplet.energy === 0)).toBe(true);
    expect(DROPLET_SPOTS.length).toBeGreaterThanOrEqual(SUN_GAME.dropletCount);
  });

  test('a droplet is lit only inside the small sunlight patch', () => {
    const droplet = { x: 20, y: SUN_GAME.waterLineY };

    expect(isDropletLit(droplet, 20)).toBe(true);
    expect(isDropletLit(droplet, 26)).toBe(true);
    // Far enough away to be outside the patch.
    expect(isDropletLit(droplet, 40)).toBe(false);
    expect(isDropletLit(droplet, 0)).toBe(false);
  });

  test('lit droplets gain energy, unlit droplets do not', () => {
    const start = createGame();
    const target = start.droplets[0];

    const lit = advanceGame(start, target.x, SUN_GAME.tickMs);
    expect(lit.droplets[0].energy).toBeCloseTo(
      (SUN_GAME.energyPerSecond * SUN_GAME.tickMs) / 1000,
      5,
    );

    const unlit = advanceGame(start, target.x + 40, SUN_GAME.tickMs);
    expect(unlit.droplets[0].energy).toBe(0);
  });

  test('a droplet evaporates after enough time in the light and is counted once', () => {
    let game = createGame();
    const target = game.droplets[0];
    const steps = Math.ceil(100 / ((SUN_GAME.energyPerSecond * SUN_GAME.tickMs) / 1000));

    for (let step = 0; step < steps + 2; step += 1) {
      game = advanceGame(game, target.x, SUN_GAME.tickMs);
    }

    expect(game.droplets.some((droplet) => droplet.id === target.id)).toBe(false);
    expect(game.evaporated).toBe(1);
  });

  test('keeping the sun still only affects droplets inside the patch', () => {
    let game = createGame();
    const first = game.droplets[0];

    for (let step = 0; step < 60; step += 1) {
      game = advanceGame(game, first.x, SUN_GAME.tickMs);
    }

    // Droplets far from the light keep zero energy.
    expect(game.droplets.some((droplet) => droplet.energy === 0)).toBe(true);
    expect(game.evaporated).toBeGreaterThanOrEqual(1);
  });

  test('an evaporation leaves a rising wisp that later disappears', () => {
    let game = createGame();
    const target = game.droplets[0];

    // Charge until the droplet evaporates.
    for (let step = 0; step < 60; step += 1) {
      game = advanceGame(game, target.x, SUN_GAME.tickMs);
    }
    expect(game.puffs.length).toBeGreaterThan(0);
    expect(game.puffs[0].x).toBeCloseTo(target.x, 5);
    const wispId = game.puffs[0].id;

    // Once its lifetime has passed, that wisp is gone again.
    for (let step = 0; step < 40; step += 1) {
      game = advanceGame(game, target.x + 60, SUN_GAME.tickMs);
    }
    expect(game.puffs.some((puff) => puff.id === wispId)).toBe(false);
  });

  test('the level is won only when every droplet has evaporated', () => {
    let game = createGame();
    expect(isGameWon(game)).toBe(false);

    // Sweep the Sun across every droplet position until all are gone.
    for (const spot of DROPLET_SPOTS) {
      for (let step = 0; step < 60; step += 1) {
        game = advanceGame(game, spot.x, SUN_GAME.tickMs);
      }
    }

    expect(game.droplets).toHaveLength(0);
    expect(game.evaporated).toBe(SUN_GAME.dropletCount);
    expect(isGameWon(game)).toBe(true);
  });
});

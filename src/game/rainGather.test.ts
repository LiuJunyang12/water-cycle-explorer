import { describe, expect, test } from 'vitest';
import {
  cloudDarkness,
  collectedCount,
  collectDroplet,
  createGame,
  DROPLET_LAYOUT,
  finishRain,
  isCloudOverfull,
  isGatheringComplete,
  RAIN_FACTS,
  RAIN_GAME,
  RAIN_NARRATION,
  RAIN_TEXT,
  startRain,
  type RainState,
} from './rainGather';

function gatherAll(state: RainState = createGame()): RainState {
  return state.droplets.reduce((current, droplet) => collectDroplet(current, droplet.id), state);
}

describe('rainGather — station 4 rules', () => {
  test('a fresh game floats every droplet and starts empty', () => {
    const state = createGame();

    expect(state.phase).toBe('gathering');
    expect(state.droplets).toHaveLength(RAIN_GAME.dropletCount);
    expect(collectedCount(state)).toBe(0);
    expect(cloudDarkness(state)).toBe(0);
    expect(isCloudOverfull(state)).toBe(false);
    expect(isGatheringComplete(state)).toBe(false);

    const ids = new Set(state.droplets.map((droplet) => droplet.id));
    expect(ids.size).toBe(RAIN_GAME.dropletCount);

    state.droplets.forEach((droplet) => {
      expect(droplet.x).toBeGreaterThan(0);
      expect(droplet.x).toBeLessThan(100);
      expect(droplet.y).toBeGreaterThan(0);
      expect(droplet.y).toBeLessThan(100);
    });
  });

  test('collecting a droplet removes it from the sky and darkens the cloud', () => {
    const start = createGame();
    const firstDroplet = start.droplets[0];

    const state = collectDroplet(start, firstDroplet.id);

    expect(state.droplets).toHaveLength(RAIN_GAME.dropletCount - 1);
    expect(state.droplets.map((droplet) => droplet.id)).not.toContain(firstDroplet.id);
    expect(state.mergedIds).toEqual([firstDroplet.id]);
    expect(collectedCount(state)).toBe(1);
    expect(cloudDarkness(state)).toBeCloseTo(1 / RAIN_GAME.dropletCount);
    expect(state.phase).toBe('gathering');

    // The original state is never mutated.
    expect(start.droplets).toHaveLength(RAIN_GAME.dropletCount);
    expect(start.mergedIds).toHaveLength(0);
  });

  test('darkness grows steadily and reaches 1 when every droplet has merged', () => {
    let state = createGame();
    let previous = 0;
    const total = state.droplets.length;

    for (let index = 0; index < total; index += 1) {
      const [next] = state.droplets;
      state = collectDroplet(state, next.id);
      const darkness = cloudDarkness(state);
      expect(darkness).toBeGreaterThan(previous);
      previous = darkness;
    }

    expect(cloudDarkness(state)).toBe(1);
    expect(collectedCount(state)).toBe(RAIN_GAME.dropletCount);
    expect(isGatheringComplete(state)).toBe(true);
    expect(isCloudOverfull(state)).toBe(true);
    expect(state.phase).toBe('asking');
  });

  test('unknown and already merged droplets are ignored (drag + click cannot double-count)', () => {
    const start = createGame();
    const firstDroplet = start.droplets[0];
    const collected = collectDroplet(start, firstDroplet.id);

    expect(collectDroplet(start, 'not-a-droplet')).toBe(start);
    expect(collectDroplet(collected, firstDroplet.id)).toBe(collected);
    expect(collectDroplet(collected, 'not-a-droplet')).toBe(collected);
    expect(collectedCount(collected)).toBe(1);
  });

  test('the rain can only start after the cloud is too heavy, and only once', () => {
    const gathering = createGame();
    expect(startRain(gathering)).toBe(gathering);
    expect(startRain(gathering).phase).toBe('gathering');

    const asking = gatherAll();
    const raining = startRain(asking);
    expect(raining.phase).toBe('raining');
    expect(startRain(raining)).toBe(raining);
    expect(finishRain(raining).phase).toBe('finished');
  });

  test('the rain cannot finish before it started', () => {
    const asking = gatherAll();
    expect(finishRain(asking)).toBe(asking);

    const gathering = createGame();
    expect(finishRain(gathering)).toBe(gathering);
  });

  test('collecting is impossible once the question is on screen', () => {
    const asking = gatherAll();
    const leftOver = { ...asking, droplets: [createGame().droplets[0]] };

    expect(collectDroplet(leftOver, leftOver.droplets[0].id)).toBe(leftOver);
  });

  test('Wally has something to say at every step', () => {
    expect(RAIN_NARRATION.length).toBeGreaterThanOrEqual(3);
    RAIN_NARRATION.forEach((line) => expect(line.trim().length).toBeGreaterThan(10));
    expect(RAIN_FACTS.length).toBeGreaterThanOrEqual(3);
    expect(RAIN_TEXT.question.endsWith('?')).toBe(true);
    expect(RAIN_TEXT.answerYes.toLowerCase()).toContain('ya');
  });

  test('the droplets never overlap each other', () => {
    const state = createGame();
    const positions = state.droplets.map((droplet) => `${droplet.x},${droplet.y}`);
    expect(new Set(positions).size).toBe(RAIN_GAME.dropletCount);
  });
});

describe('droplet layout', () => {
  test('every droplet sits inside the sky area', () => {
    expect(DROPLET_LAYOUT).toHaveLength(RAIN_GAME.dropletCount);
    for (const droplet of DROPLET_LAYOUT) {
      expect(droplet.x).toBeGreaterThanOrEqual(5);
      expect(droplet.x).toBeLessThanOrEqual(95);
      expect(droplet.y).toBeGreaterThanOrEqual(4);
      expect(droplet.y).toBeLessThanOrEqual(70);
    }
  });

  test('no droplet hides under the HUD in the top-right corner', () => {
    // The progress HUD is pinned to the top-right of the scene and is opaque,
    // so a droplet placed there would look like it is missing.
    const hidden = DROPLET_LAYOUT.filter((droplet) => droplet.x >= 52 && droplet.y <= 30);
    expect(hidden).toEqual([]);
  });

  test('no droplet hides behind the big collector drop', () => {
    const behindCollector = DROPLET_LAYOUT.filter(
      (droplet) => Math.abs(droplet.x - 50) <= 8 && Math.abs(droplet.y - 25) <= 12,
    );
    expect(behindCollector).toEqual([]);
  });

  test('positions are unique so droplets never stack', () => {
    const keys = new Set(DROPLET_LAYOUT.map((droplet) => `${droplet.x}:${droplet.y}`));
    expect(keys.size).toBe(DROPLET_LAYOUT.length);
  });
});
import { describe, expect, test } from 'vitest';
import { COOLING_QUIZ, CLOUD_STEPS, CLOUD_STEPS_CORRECT_ORDER, CLOUD_BRIDGE_PLATFORMS, LEVELS } from './levels';
import {
  ART_ASPECT,
  ART_SCALE,
  createWorld,
  hazardRect,
  markerBox,
  overlaps,
  PHYSICS,
  playerBodyBox,
  playerBox,
  stepWorld,
  wallyPose,
} from './physics';
import type { InputState, LevelDef } from './types';

const idle: InputState = { left: false, right: false, jump: false };
const right: InputState = { ...idle, right: true };
const left: InputState = { ...idle, left: true };

function run(
  level: LevelDef,
  state: ReturnType<typeof createWorld>,
  input: InputState,
  steps: number,
  extra: Parameters<typeof stepWorld>[4] = [],
) {
  let next = state;
  for (let step = 0; step < steps; step += 1) {
    next = stepWorld(next, level, input, step * PHYSICS.stepSeconds * 1000, extra);
  }
  return next;
}

const level1 = LEVELS[0];

describe('cloud quest physics', () => {
  test('gravity pulls Wally down until he lands on a platform', () => {
    const start = createWorld(level1);
    expect(start.player.grounded).toBe(false);

    const settled = run(level1, start, idle, 90);

    expect(settled.player.grounded).toBe(true);
    // Platform v1 top is y = 80, so Wally stands at 80 - playerHeight.
    expect(settled.player.y).toBeCloseTo(80 - PHYSICS.playerHeight, 1);
  });

  test('holding right/left moves Wally', () => {
    const settled = run(level1, createWorld(level1), idle, 90);
    const moved = run(level1, settled, right, 60);

    expect(moved.player.x).toBeGreaterThan(settled.player.x + 20);

    const back = run(level1, moved, left, 60);
    expect(back.player.x).toBeLessThan(moved.player.x);
  });

  test('jumping leaves the ground and lands again', () => {
    const settled = run(level1, createWorld(level1), idle, 90);
    const jumped = stepWorld(settled, level1, { ...idle, jump: true }, 2000);

    expect(jumped.player.vy).toBeLessThan(0);
    expect(jumped.player.grounded).toBe(false);

    const landed = run(level1, jumped, idle, 120);
    expect(landed.player.grounded).toBe(true);
  });

  test('collectibles are picked up on contact and counted once', () => {
    let state = run(level1, createWorld(level1), idle, 90);

    // Walk right for long enough to pass the first marker.
    state = run(level1, state, right, 40);

    expect(state.collectedIds).toContain('c1');
    const again = run(level1, state, right, 20);
    expect(again.collectedIds.filter((id) => id === 'c1')).toHaveLength(1);
  });

  test('markers are judged by the drawn circle, not by the raw radius', () => {
    const marker = level1.collectibles[0];
    const box = markerBox(marker);

    expect(box.w).toBeCloseTo(marker.r * 2 * ART_SCALE.marker, 5);

    // Stand right under the marker: the drawn body reaches it, the 5×7 box
    // never would.
    const state = {
      ...createWorld(level1),
      player: { x: marker.x, y: marker.y + 4, vx: 0, vy: 0, grounded: true },
    };
    const after = stepWorld(state, level1, idle, 0);

    expect(after.collectedIds).toContain(marker.id);
  });

  test('a flame that touches the drawn body always hits', () => {
    const hazard = hazardRect(level1.hazards[0], 0);

    // Standing on the platform below the flame: Wally's 5×7 box sits entirely
    // under the artwork (no overlap), but his drawn head reaches into it.
    const standing = {
      ...createWorld(level1),
      player: { x: hazard.x + 1, y: hazard.y + hazard.h + 1, vx: 0, vy: 0, grounded: true },
    };

    const body = playerBodyBox(standing);
    const box = playerBox(standing);
    expect(overlaps(box, hazard)).toBe(false);
    expect(overlaps(body, hazard)).toBe(true);

    const after = stepWorld(standing, level1, idle, 0);
    expect(after.respawns).toBe(1);
  });

  test('the exit stays locked until enough markers are collected', () => {
    const state = createWorld(level1);
    const atExit = {
      ...state,
      player: { x: level1.exit.x + 2, y: level1.exit.y + 2, vx: 0, vy: 0, grounded: true },
      collectedIds: [],
    };

    const locked = stepWorld(atExit, level1, idle, 0);
    expect(locked.reachedExit).toBe(false);

    const unlockedState = { ...atExit, collectedIds: ['c1', 'c2', 'c3', 'c4', 'c5'] };
    expect(stepWorld(unlockedState, level1, idle, 0).reachedExit).toBe(true);
  });

  test('a hazard sends Wally back to the spawn point instead of ending the game', () => {
    const state = createWorld(level1);
    const hazard = level1.hazards[0];
    const danger = hazardRect(hazard, 0);

    const inHazard = {
      ...state,
      player: { x: danger.x + 1, y: danger.y + 1, vx: 0, vy: 0, grounded: false },
    };

    const after = stepWorld(inHazard, level1, idle, 0);

    expect(after.player.x).toBeCloseTo(level1.spawn.x, 5);
    expect(after.player.y).toBeCloseTo(level1.spawn.y, 5);
    expect(after.respawns).toBe(1);
  });

  test('falling out of the world also respawns Wally', () => {
    const state = createWorld(level1);
    const falling = {
      ...state,
      player: { x: 40, y: 130, vx: 0, vy: 80, grounded: false },
    };

    const after = stepWorld(falling, level1, idle, 0);
    expect(after.player.x).toBeCloseTo(level1.spawn.x, 5);
    expect(after.respawns).toBe(1);
  });

  test('hazards oscillate over time', () => {
    for (const hazard of level1.hazards) {
      const atZero = hazardRect(hazard, 0);
      const atHalf = hazardRect(hazard, 1000);
      const distance = Math.hypot(atHalf.x - atZero.x, atHalf.y - atZero.y);

      expect(distance).toBeGreaterThan(1);
    }
  });

  test('cloud bridge platforms are only solid when supplied', () => {
    const level3 = LEVELS[2];
    const state = createWorld(level3);
    const overGap = {
      ...state,
      player: { x: 120, y: 40, vx: 0, vy: 60, grounded: false },
    };

    // Without the bridge, Wally falls past the gap.
    const withoutBridge = run(level3, overGap, idle, 60);
    expect(withoutBridge.respawns).toBeGreaterThan(0);
  });

  test('hazard hitboxes keep the 4:5 artwork proportions', () => {
    // 1% of the world height is 0.5625 of the width unit, so this converts the
    // authored rect back to its on-screen shape.
    const verticalUnitRatio = 9 / 16;

    for (const level of LEVELS) {
      for (const hazard of level.hazards) {
        const hazardAspect = hazard.w / (hazard.h * verticalUnitRatio);
        expect(hazardAspect).toBeCloseTo(ART_ASPECT.hazard, 2);
      }
    }
  });
});

describe('cloud quest content', () => {
  test('the ordering challenge has a distinct correct sequence', () => {
    expect(CLOUD_STEPS_CORRECT_ORDER).toEqual(['s1', 's2', 's3', 's4']);
    expect(new Set(CLOUD_STEPS.map((step) => step.id)).size).toBe(4);
  });

  test('the quiz accepts exactly one answer', () => {
    expect(COOLING_QUIZ.options).toHaveLength(4);
    expect(COOLING_QUIZ.options.filter((option) => option.id === COOLING_QUIZ.correctId)).toHaveLength(
      1,
    );
    expect(COOLING_QUIZ.correctFeedback.length).toBeGreaterThan(20);
    expect(COOLING_QUIZ.wrongFeedback.length).toBeGreaterThan(20);
  });

  test('every level can be finished on foot: gaps are jumpable', () => {
    for (const level of LEVELS) {
      const platforms =
        level.id === 'cloud-bridge'
          ? [...level.platforms, ...CLOUD_BRIDGE_PLATFORMS]
          : level.platforms;
      const sorted = [...platforms].sort((a, b) => a.x - b.x);
      for (let index = 1; index < sorted.length; index += 1) {
        const gap = sorted[index].x - (sorted[index - 1].x + sorted[index - 1].w);
        // ~40 units of horizontal travel is available per jump.
        expect(gap).toBeLessThan(30);
      }
    }
  });
});


describe('speed tuning keeps every level playable', () => {
  const airTimeSeconds = (2 * PHYSICS.jumpSpeed) / PHYSICS.gravity;
  const jumpReach = PHYSICS.moveSpeed * airTimeSeconds;
  const jumpHeight = PHYSICS.jumpSpeed ** 2 / (2 * PHYSICS.gravity);

  test('a standing jump has a comfortable margin over the widest gap', () => {
    // moveSpeed 34 → ~26 units of travel, ~19 units of height.
    expect(jumpReach).toBeGreaterThan(24);
    expect(jumpHeight).toBeGreaterThan(18);
  });

  test('every gap and every climb in every level fits inside that jump', () => {
    for (const level of LEVELS) {
      const platforms =
        level.id === 'cloud-bridge'
          ? [...level.platforms, ...CLOUD_BRIDGE_PLATFORMS]
          : level.platforms;
      const sorted = [...platforms].sort((a, b) => a.x - b.x);

      for (let index = 1; index < sorted.length; index += 1) {
        const previous = sorted[index - 1];
        const next = sorted[index];
        const gap = next.x - (previous.x + previous.w);
        const climb = previous.y - next.y;

        expect(gap).toBeLessThan(jumpReach - 4);
        if (climb > 0) expect(climb).toBeLessThan(jumpHeight - 4);
      }
    }
  });
});

describe('wallyPose picks the illustration for the current state', () => {
  test('standing, walking and jumping each map to their own pose', () => {
    const standing = run(level1, createWorld(level1), idle, 90);
    expect(wallyPose(standing)).toBe('stand');

    const walking = run(level1, standing, right, 20);
    expect(wallyPose(walking)).toBe('walk');

    const jumping = stepWorld(standing, level1, { ...idle, jump: true }, 2000);
    expect(wallyPose(jumping)).toBe('jump');
  });
});

describe('flames hang above head height', () => {
  /** Top surface of the platform Wally would stand on beneath a flame. */
  function floorUnder(level: LevelDef, x: number): number {
    let bestTop = Number.NaN;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const platform of level.platforms) {
      const distance =
        x < platform.x ? platform.x - x : x > platform.x + platform.w ? x - (platform.x + platform.w) : 0;
      if (distance < bestDistance) {
        bestDistance = distance;
        bestTop = platform.y;
      }
    }
    return bestTop;
  }

  test.each(LEVELS.flatMap((level) => level.hazards.map((hazard) => [level, hazard] as const)))(
    '%s / %s leaves room to walk underneath',
    (level, hazard) => {
      // Lowest point of the oscillation: only a vertical sweep dips down.
      const lowestBottom = hazard.axis === 'y' ? hazard.y + hazard.range + hazard.h : hazard.y + hazard.h;
      const clearance = floorUnder(level, hazard.x + hazard.w / 2) - lowestBottom;

      // Wally is 19.95 units tall, so 21+ means he always walks under it.
      expect(clearance).toBeGreaterThanOrEqual(21);
      // ...but it must not float so high that it stops being an obstacle.
      expect(clearance).toBeLessThanOrEqual(45);
    },
  );
});
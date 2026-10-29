import { describe, expect, test } from 'vitest';
import { resolveExitAction } from './flow';
import { LEVELS } from './levels';

const base = {
  phase: 'playing' as const,
  levelIndex: 0,
  levelId: LEVELS[0].id,
  worldLevelId: LEVELS[0].id,
  reachedExit: false,
};

describe('resolveExitAction', () => {
  test('does nothing until the exit is reached', () => {
    expect(resolveExitAction(base)).toBe('none');
  });

  test('advances from level 1 to level 2', () => {
    expect(resolveExitAction({ ...base, reachedExit: true })).toBe('next-level');
  });

  test('ignores a world that still belongs to the level we just left', () => {
    // This is the skipped-level-2 regression: after setLevelIndex(1) the old
    // world still reports reachedExit === true for one commit.
    expect(
      resolveExitAction({
        phase: 'playing',
        levelIndex: 1,
        levelId: LEVELS[1].id,
        worldLevelId: LEVELS[0].id,
        reachedExit: true,
      }),
    ).toBe('none');
  });

  test('opens the quiz after level 2', () => {
    expect(
      resolveExitAction({
        phase: 'playing',
        levelIndex: 1,
        levelId: LEVELS[1].id,
        worldLevelId: LEVELS[1].id,
        reachedExit: true,
      }),
    ).toBe('quiz');
  });

  test('wins after the cloud bridge level', () => {
    expect(
      resolveExitAction({
        phase: 'playing',
        levelIndex: 2,
        levelId: LEVELS[2].id,
        worldLevelId: LEVELS[2].id,
        reachedExit: true,
      }),
    ).toBe('victory');
  });

  test('is inert while an overlay phase is on screen', () => {
    for (const phase of ['quiz', 'ordering', 'forming', 'victory'] as const) {
      expect(
        resolveExitAction({
          phase,
          levelIndex: 2,
          levelId: LEVELS[2].id,
          worldLevelId: LEVELS[2].id,
          reachedExit: true,
        }),
      ).toBe('none');
    }
  });
});

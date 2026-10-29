/**
 * Level-transition rules for the Cloud Kingdom platformer.
 *
 * These rules used to live inline inside an effect in `CloudKingdomPage`. That
 * effect reads the *previous* world for one commit after `setLevelIndex` runs:
 * the old world still says "exit reached", so the game jumped straight to the
 * quiz and skipped level 2. Keeping the decision in a pure function makes that
 * regression testable.
 */

export type QuestPhase = 'playing' | 'quiz' | 'ordering' | 'forming' | 'victory';

export type ExitAction = 'none' | 'next-level' | 'quiz' | 'victory';

export interface ExitContext {
  phase: QuestPhase;
  levelIndex: number;
  /** Id of the level that is currently on screen. */
  levelId: string;
  /** Id of the level that produced the current world. */
  worldLevelId: string;
  reachedExit: boolean;
}

export function resolveExitAction({
  phase,
  levelIndex,
  levelId,
  worldLevelId,
  reachedExit,
}: ExitContext): ExitAction {
  if (phase !== 'playing' || !reachedExit) {
    return 'none';
  }
  // A world that still belongs to the level we just left must be ignored.
  if (worldLevelId !== levelId) {
    return 'none';
  }
  if (levelIndex === 0) {
    return 'next-level';
  }
  if (levelIndex === 1) {
    return 'quiz';
  }
  return 'victory';
}

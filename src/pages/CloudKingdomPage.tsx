import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CloudQuestScene } from '../components/learning/CloudQuestScene';
import { OrderingChallenge } from '../components/learning/OrderingChallenge';
import { ScienceQuiz } from '../components/learning/ScienceQuiz';
import {
  CLOUD_BRIDGE_PLATFORMS,
  CLOUD_STEPS,
  CLOUD_STEPS_CORRECT_ORDER,
  COOLING_QUIZ,
  LEVELS,
} from '../game/cloudQuest/levels';
import { resolveExitAction } from '../game/cloudQuest/flow';
import type { QuestPhase } from '../game/cloudQuest/flow';
import { createWorld, PHYSICS, stepWorld } from '../game/cloudQuest/physics';
import type { PlatformDef, WorldState } from '../game/cloudQuest/types';
import { BackToMapButton } from '../components/common/BackToMapButton';
import './CloudKingdomPage.css';

interface CloudKingdomPageProps {
  isAlreadyCompleted: boolean;
  onComplete: () => void;
  onBackToMap: () => void;
}

type Phase = QuestPhase;

const STEP_MS = (PHYSICS.stepSeconds * 1000) | 0;
const FORMING_MS = 1700;
const NO_PLATFORMS: PlatformDef[] = [];

/**
 * Station 3 — Mission to Cloud Kingdom.
 *
 * A playable platformer: real gravity, platform collisions, collectibles,
 * hazards with respawn, level exits, a science quiz and an ordering challenge
 * that forms a walkable cloud bridge.
 */
export function CloudKingdomPage({
  isAlreadyCompleted,
  onComplete,
  onBackToMap,
}: CloudKingdomPageProps) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('playing');
  const [game, setGame] = useState<{ levelId: string; world: WorldState; hazardTime: number }>(() => ({
    levelId: LEVELS[0].id,
    world: createWorld(LEVELS[0]),
    hazardTime: 0,
  }));
  const [bridgeFormed, setBridgeFormed] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  // ?debug=1 shows the live layout numbers: a blank playfield is then a
  // measurement instead of a guess.
  const debugEnabled = useMemo(
    () => typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('debug'),
    [],
  );

  const keysRef = useRef({ left: false, right: false });
  const jumpQueuedRef = useRef(false);
  const completionSentRef = useRef(isAlreadyCompleted);

  const level = LEVELS[levelIndex];
  // Stable reference: a new array each render would restart the game loop.
  const extraPlatforms = useMemo<PlatformDef[]>(
    () =>
      level.id === 'cloud-bridge' && bridgeFormed ? [...CLOUD_BRIDGE_PLATFORMS] : NO_PLATFORMS,
    [level.id, bridgeFormed],
  );

  /* ---------------- game loop ---------------- */
  useEffect(() => {
    if (phase !== 'playing') return undefined;

    const timer = window.setInterval(() => {
      // Consume the jump request OUTSIDE the state updater: React (StrictMode)
      // may call the updater twice, which would swallow the queued jump.
      const input = {
        left: keysRef.current.left,
        right: keysRef.current.right,
        jump: jumpQueuedRef.current,
      };
      jumpQueuedRef.current = false;

      setGame((previous) => {
        const hazardTime = previous.hazardTime + STEP_MS;
        return {
          levelId: previous.levelId,
          world: stepWorld(previous.world, level, input, hazardTime, extraPlatforms),
          hazardTime,
        };
      });
    }, STEP_MS);

    return () => window.clearInterval(timer);
  }, [phase, level, extraPlatforms]);

  /* ---------------- keyboard input ---------------- */
  useEffect(() => {
    if (phase !== 'playing') return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
        keysRef.current.left = true;
        event.preventDefault();
      }
      if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
        keysRef.current.right = true;
        event.preventDefault();
      }
      if (event.key === ' ' || event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
        jumpQueuedRef.current = true;
        event.preventDefault();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
        keysRef.current.left = false;
      }
      if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
        keysRef.current.right = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      keysRef.current = { left: false, right: false };
    };
  }, [phase]);

  /* ---------------- level reset when the level changes ---------------- */
  useEffect(() => {
    // Stamp the world with the level it was built for: the exit effect below
    // must not react to a world that still belongs to the previous level.
    setGame({
      levelId: LEVELS[levelIndex].id,
      world: createWorld(LEVELS[levelIndex]),
      hazardTime: 0,
    });
  }, [levelIndex]);

  /* ---------------- exits / phase changes ---------------- */
  const exitAction = resolveExitAction({
    phase,
    levelIndex,
    levelId: level.id,
    worldLevelId: game.levelId,
    reachedExit: game.world.reachedExit,
  });

  useEffect(() => {
    if (exitAction === 'next-level') {
      setLevelIndex(1);
      return;
    }
    if (exitAction === 'quiz') {
      setPhase('quiz');
      return;
    }
    if (exitAction === 'victory') {
      setPhase('victory');
    }
  }, [exitAction]);

  /* ---------------- victory ---------------- */
  useEffect(() => {
    if (phase !== 'victory') return;
    if (completionSentRef.current) return;
    completionSentRef.current = true;
    onComplete();
  }, [phase, onComplete]);

  /* ---------------- bridge forming animation ---------------- */
  useEffect(() => {
    if (phase !== 'forming') return undefined;
    const timer = window.setTimeout(() => {
      setBridgeFormed(true);
      setPhase('playing');
    }, FORMING_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const restart = useCallback(() => {
    setLevelIndex(0);
    setPhase('playing');
    setBridgeFormed(false);
    setGame({ levelId: LEVELS[0].id, world: createWorld(LEVELS[0]), hazardTime: 0 });
    keysRef.current = { left: false, right: false };
    jumpQueuedRef.current = false;
  }, []);

  const setKey = (key: 'left' | 'right', pressed: boolean) => {
    keysRef.current[key] = pressed;
  };

  const collected = game.world.collectedIds.length;
  const needCollect = level.requiredCollectibles;

  return (
    <main className="quest-page">
      <header className="quest-page__header">
        <div className="quest-page__heading">
          <p className="quest-page__eyebrow">
            STESEN 3 · PEMBENTUKAN AWAN · TAHAP {levelIndex + 1}/3
          </p>
          <h1 className="quest-page__title">MISSION TO CLOUD KINGDOM</h1>
          <p className="quest-page__level">
            {level.title} — {level.subtitle}
          </p>
        </div>
        <BackToMapButton onClick={onBackToMap} />
      </header>

      <div className="quest-stage" ref={stageRef}>
        <CloudQuestScene
          level={level}
          world={game.world}
          hazardTimeMs={game.hazardTime}
          bridgeFormed={bridgeFormed}
        />
      </div>

      <section className="quest-hud" aria-label="Status permainan">
        <div className="quest-hud__stats">
          {needCollect > 0 ? (
            <p className="quest-hud__counter">
              Wap Air: <strong>{Math.min(collected, needCollect)}</strong> / {needCollect}
            </p>
          ) : (
            <p className="quest-hud__counter">
              {level.id === 'cloud-bridge' ? 'Jambatan awan' : 'Teruskan ke pintu keluar'}
            </p>
          )}
          <p className="quest-hud__respawns">Cubaan semula: {game.world.respawns}</p>
        </div>

        <div className="quest-controls" aria-label="Kawalan permainan">
          <button
            type="button"
            className="quest-controls__button"
            aria-label="Gerak ke kiri"
            onPointerDown={() => setKey('left', true)}
            onPointerUp={() => setKey('left', false)}
            onPointerLeave={() => setKey('left', false)}
            onPointerCancel={() => setKey('left', false)}
          >
            ◀
          </button>
          <button
            type="button"
            className="quest-controls__button"
            aria-label="Gerak ke kanan"
            onPointerDown={() => setKey('right', true)}
            onPointerUp={() => setKey('right', false)}
            onPointerLeave={() => setKey('right', false)}
            onPointerCancel={() => setKey('right', false)}
          >
            ▶
          </button>
          <button
            type="button"
            className="quest-controls__button quest-controls__button--jump"
            aria-label="Lompat"
            onPointerDown={() => {
              jumpQueuedRef.current = true;
            }}
          >
            ▲
          </button>
        </div>

        <div className="quest-hud__tips">
          <p className="quest-hud__tip">{level.scienceTip}</p>
          <button type="button" className="button-quiet quest-hud__restart" onClick={restart}>
            Mula semula
          </button>
        </div>
      </section>

      {debugEnabled ? (
        <DebugPanel
          levelId={level.id}
          phase={phase}
          levelIndex={levelIndex}
          world={game.world}
          sceneHeight={stageRef.current?.clientHeight ?? -1}
          sceneWidth={stageRef.current?.clientWidth ?? -1}
        />
      ) : null}

      {phase === 'quiz' ? (
        <ScienceQuiz
          question={COOLING_QUIZ.question}
          options={COOLING_QUIZ.options}
          correctId={COOLING_QUIZ.correctId}
          correctFeedback={COOLING_QUIZ.correctFeedback}
          wrongFeedback={COOLING_QUIZ.wrongFeedback}
          onPass={() => {
            setLevelIndex(2);
            setPhase('ordering');
          }}
        />
      ) : null}

      {phase === 'ordering' ? (
        <OrderingChallenge
          steps={CLOUD_STEPS}
          correctOrder={CLOUD_STEPS_CORRECT_ORDER}
          onSolved={() => setPhase('forming')}
        />
      ) : null}

      {phase === 'forming' ? (
        <div className="quest-forming" role="status">
          <p className="quest-forming__title">Jambatan awan sedang terbentuk…</p>
          <p className="quest-forming__text">
            Titisan air halus berkumpul menjadi awan yang boleh dipijak.
          </p>
        </div>
      ) : null}

      {phase === 'victory' ? (
        <div className="quest-victory" role="dialog" aria-modal="true" aria-label="Misi selesai">
          <div className="quest-victory__card">
            <p className="quest-victory__eyebrow">MISSION COMPLETE!</p>
            <h2 className="quest-victory__title">Tahniah, Wally sampai ke Cloud Kingdom!</h2>
            <p className="quest-victory__text">
              Anda membantu Wally membentuk jambatan awan dan sampai ke istana.
            </p>
            <ul className="quest-victory__facts">
              <li>Penyejatan: air cecair bertukar menjadi wap air yang tidak kelihatan.</li>
              <li>Udara lembap yang naik biasanya menyejuk.</li>
              <li>Dalam keadaan yang sesuai, wap air terpeluwap menjadi titisan halus.</li>
              <li>Awan terbentuk daripada titisan air halus atau hablur ais yang terapung.</li>
            </ul>
            <div className="quest-victory__actions">
              <button type="button" className="button-quiet" onClick={restart}>
                Main semula
              </button>
              <button type="button" className="button-primary" onClick={onBackToMap}>
                Kembali ke Water Cycle Explorer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

/* ---------- optional layout telemetry (?debug=1) ---------- */

interface DebugPanelProps {
  levelId: string;
  phase: Phase;
  levelIndex: number;
  world: WorldState;
  sceneWidth: number;
  sceneHeight: number;
}

function DebugPanel({ levelId, phase, levelIndex, world, sceneWidth, sceneHeight }: DebugPanelProps) {
  return (
    <div className="quest-debug" data-testid="quest-debug">
      <p>
        tahap {levelIndex + 1}/3 · {levelId} · {phase}
      </p>
      <p>
        stage {sceneWidth}×{sceneHeight} · window {window.innerWidth}×{window.innerHeight}
      </p>
      <p>
        wally x {world.player.x.toFixed(1)} y {world.player.y.toFixed(1)} · grounded{' '}
        {String(world.player.grounded)} · vx {world.player.vx.toFixed(1)}
      </p>
      <p>
        respawn {world.respawns} · collected {world.collectedIds.length} · reachedExit{' '}
        {String(world.reachedExit)}
      </p>
    </div>
  );
}
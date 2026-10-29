import { useCallback, useEffect, useRef, useState } from 'react';
import { RainCloudScene } from '../components/learning/RainCloudScene';
import { WALLY_SPRITES } from '../data/cloudKingdomAssets';
import { WALLY_VALLEY_SPRITE } from '../data/waterfallValleyAssets';
import {
  cloudDarkness,
  collectedCount,
  collectDroplet,
  createGame,
  finishRain,
  RAIN_FACTS,
  RAIN_GAME,
  RAIN_NARRATION,
  RAIN_TEXT,
  startRain,
} from '../game/rainGather';
import { BackToMapButton } from '../components/common/BackToMapButton';
import './WaterfallValleyPage.css';

interface WaterfallValleyPageProps {
  isAlreadyCompleted: boolean;
  onComplete: () => void;
  onBackToMap: () => void;
}

/** From this many droplets the cloud is heavy enough to warn the pupil. */
const ALMOST_FULL_COUNT = 8;

/**
 * Station 4 — Rain in the Waterfall Valley.
 *
 * The pupil gathers the droplets of the sky onto the cloud. The collector
 * droplet grows and the cloud darkens until it cannot hold the water anymore;
 * the cloud then shakes and asks whether the rain may start. Saying yes plays
 * the rain while Wally stands inside the valley and explains, line by line,
 * what the pupil is watching.
 *
 * The station is only marked complete when the rain has actually run, and the
 * completion is sent exactly once (also across "Main lagi").
 */
export function WaterfallValleyPage({
  isAlreadyCompleted,
  onComplete,
  onBackToMap,
}: WaterfallValleyPageProps) {
  const [game, setGame] = useState(createGame);
  const [narrationIndex, setNarrationIndex] = useState(0);
  const [wallyFailed, setWallyFailed] = useState(false);
  const [wallySrc, setWallySrc] = useState(WALLY_VALLEY_SPRITE);
  const completionSentRef = useRef(isAlreadyCompleted);

  const count = collectedCount(game);
  const darkness = cloudDarkness(game);
  const isRaining = game.phase === 'raining';
  const isFinished = game.phase === 'finished';
  const isAsking = game.phase === 'asking';
  const narrationDone = narrationIndex >= RAIN_NARRATION.length - 1;
  const narrationStep = Math.min(narrationIndex + 1, RAIN_NARRATION.length);

  const handleCollect = useCallback((dropletId: string) => {
    setGame((previous) => collectDroplet(previous, dropletId));
  }, []);

  const handleStartRain = () => {
    setNarrationIndex(0);
    setGame((previous) => startRain(previous));
  };

  const restart = () => {
    setGame(createGame());
    setNarrationIndex(0);
  };

  // Wally reads one line after the other while the rain is falling.
  useEffect(() => {
    if (!isRaining) return undefined;

    const timer = window.setInterval(() => {
      setNarrationIndex((index) => (index < RAIN_NARRATION.length - 1 ? index + 1 : index));
    }, RAIN_GAME.narrationStepMs);

    return () => window.clearInterval(timer);
  }, [isRaining]);

  // …and when the last line has been shown, the rain animation ends by itself.
  useEffect(() => {
    if (!isRaining || !narrationDone) return undefined;

    const timer = window.setTimeout(() => {
      setGame((previous) => finishRain(previous));
    }, RAIN_GAME.narrationStepMs);

    return () => window.clearTimeout(timer);
  }, [isRaining, narrationDone]);

  // The station counts as finished only once the simulation says so.
  useEffect(() => {
    if (!isFinished || completionSentRef.current) return;
    completionSentRef.current = true;
    onComplete();
  }, [isFinished, onComplete]);

  const wallyLine = isRaining
    ? RAIN_NARRATION[narrationIndex]
    : isFinished
      ? RAIN_TEXT.finishedText
      : isAsking
        ? RAIN_TEXT.question
        : count === 0
          ? RAIN_TEXT.mission
          : count >= ALMOST_FULL_COUNT
            ? RAIN_TEXT.almostFull
            : RAIN_TEXT.hint;

  const progressPercent = isRaining || isFinished
    ? (narrationStep / RAIN_NARRATION.length) * 100
    : Math.min(100, darkness * 100);

  return (
    <main className="rain-page">
      <header className="rain-page__header">
        <div className="rain-page__heading">
          <p className="rain-page__eyebrow">STESEN 4 · KERPRASAN</p>
          <h1 className="rain-page__title">{RAIN_TEXT.title}</h1>
          <p className="rain-page__mission">{RAIN_TEXT.mission}</p>
        </div>
        <BackToMapButton onClick={onBackToMap} />
      </header>

      <div className="rain-page__stage">
        <RainCloudScene state={game} onCollect={handleCollect} />

        <div className="rain-hud" aria-label="Status permainan">
          <p className="rain-hud__label">
            {isRaining
              ? RAIN_TEXT.rainingLabel
              : isFinished
                ? RAIN_TEXT.finishedLabel
                : RAIN_TEXT.progressLabel}
          </p>
          <p className="rain-hud__value">
            {isRaining || isFinished
              ? `${narrationStep}/${RAIN_NARRATION.length}`
              : `${count}/${RAIN_GAME.dropletCount}`}
          </p>
          <div
            className="rain-hud__track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={isRaining || isFinished ? RAIN_NARRATION.length : RAIN_GAME.dropletCount}
            aria-valuenow={isRaining || isFinished ? narrationStep : count}
            aria-label={isRaining || isFinished ? 'Langkah penerangan' : RAIN_TEXT.progressLabel}
          >
            <span className="rain-hud__fill" style={{ width: `${progressPercent}%` }} />
          </div>
          {!isRaining && !isFinished && !isAsking ? (
            <button type="button" className="rain-hud__restart" onClick={restart}>
              {RAIN_TEXT.restart}
            </button>
          ) : null}
        </div>

        <div className={`rain-wally${isRaining ? ' rain-wally--narration' : ''}`}>
          <span className={wallySrc === WALLY_VALLEY_SPRITE ? 'rain-wally__figure rain-wally__figure--art' : 'rain-wally__figure'}>
            {wallyFailed ? (
            <span className="rain-wally__fallback" aria-hidden="true">
              <span className="rain-wally__fallback-droplet">
                <span className="rain-wally__eye rain-wally__eye--left" />
                <span className="rain-wally__eye rain-wally__eye--right" />
                <span className="rain-wally__smile" />
              </span>
            </span>
          ) : (
              <img
                className="rain-wally__img"
                src={wallySrc}
                alt="Wally"
                onError={() => {
                  if (wallySrc !== WALLY_SPRITES.stand) {
                    setWallySrc(WALLY_SPRITES.stand);
                  } else {
                    setWallyFailed(true);
                  }
                }}
              />
            )}
          </span>
          <div className="rain-wally__bubble" role="status" aria-live="polite" key={wallyLine}>
            <strong className="rain-wally__name">
              Wally
              {isRaining ? ` · ${narrationStep}/${RAIN_NARRATION.length}` : ''}
            </strong>
            <p className="rain-wally__line">{wallyLine}</p>
          </div>
        </div>
      </div>

      {isAsking ? (
        <div className="rain-modal" role="dialog" aria-modal="true" aria-labelledby="rain-question">
          <div className="rain-modal__card">
            <p className="rain-modal__eyebrow">AWAN TERLALU BERAT</p>
            <h2 className="rain-modal__title" id="rain-question">
              {RAIN_TEXT.question}
            </h2>
            <p className="rain-modal__note">{RAIN_TEXT.questionNote}</p>
            <div className="rain-modal__actions">
              <button type="button" className="button-primary" onClick={handleStartRain}>
                {RAIN_TEXT.answerYes}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isFinished ? (
        <div className="rain-modal" role="dialog" aria-modal="true" aria-label="Stesen selesai">
          <div className="rain-modal__card rain-modal__card--victory">
            <p className="rain-modal__eyebrow">{RAIN_TEXT.finishedLabel}</p>
            <h2 className="rain-modal__title">{RAIN_TEXT.finishedTitle}</h2>
            <p className="rain-modal__note">{RAIN_TEXT.finishedText}</p>
            <ul className="rain-modal__facts">
              {RAIN_FACTS.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
            <div className="rain-modal__actions">
              <button type="button" className="button-quiet" onClick={restart}>
                {RAIN_TEXT.playAgain}
              </button>
              <button type="button" className="button-primary" onClick={onBackToMap}>
                {RAIN_TEXT.backToMap}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
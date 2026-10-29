import { useCallback, useEffect, useRef, useState } from 'react';
import { SunChaseScene } from '../components/learning/SunChaseScene';
import {
  advanceGame,
  createGame,
  GAME_SUMMARY_FACTS,
  GAME_TEXT,
  isGameWon,
  SUN_GAME,
} from '../game/sunChase';
import { BackToMapButton } from '../components/common/BackToMapButton';
import './SunnyCoastPage.css';

interface SunnyCoastPageProps {
  isAlreadyCompleted: boolean;
  onComplete: () => void;
  onBackToMap: () => void;
}

/**
 * Station 2 — Sunlight Catcher.
 *
 * The pupil moves the Sun. Its small patch of sunlight charges the droplets
 * underneath it; a droplet that has stored enough solar energy evaporates.
 * Every droplet must evaporate to finish the level.
 */
export function SunnyCoastPage({
  isAlreadyCompleted,
  onComplete,
  onBackToMap,
}: SunnyCoastPageProps) {
  const [game, setGame] = useState(createGame);
  const [sunX, setSunX] = useState<number>(SUN_GAME.sunStartX);
  const [isWon, setIsWon] = useState(false);

  const gameRef = useRef(game);
  const sunXRef = useRef(sunX);
  const completionSentRef = useRef(isAlreadyCompleted);

  useEffect(() => {
    sunXRef.current = sunX;
  }, [sunX]);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  // One fixed-step game loop; it stops when the level is won or on unmount.
  useEffect(() => {
    if (isWon) return undefined;

    const timer = window.setInterval(() => {
      const next = advanceGame(gameRef.current, sunXRef.current, SUN_GAME.tickMs);
      if (next === gameRef.current) return;
      gameRef.current = next;
      setGame(next);
    }, SUN_GAME.tickMs);

    return () => window.clearInterval(timer);
  }, [isWon]);

  // The level is won only when the simulation itself reports every droplet gone.
  useEffect(() => {
    if (isWon || !isGameWon(game)) return;
    setIsWon(true);
    if (!completionSentRef.current) {
      completionSentRef.current = true;
      onComplete();
    }
  }, [game, isWon, onComplete]);

  const remaining = game.droplets.length;
  const progressPercent = Math.min(
    100,
    (game.evaporated / SUN_GAME.dropletCount) * 100,
  );

  const handleSunChange = useCallback((value: number) => {
    setSunX(Math.min(96, Math.max(4, value)));
  }, []);

  const restart = () => {
    const fresh = createGame();
    gameRef.current = fresh;
    setGame(fresh);
    setSunX(SUN_GAME.sunStartX);
    setIsWon(false);
  };

  return (
    <main className="chase-page">
      <header className="chase-page__header">
        <div className="chase-page__heading">
          <p className="chase-page__eyebrow">STESEN 2 · PENYEJATAN</p>
          <h1 className="chase-page__title">{GAME_TEXT.title}</h1>
          <p className="chase-page__mission">{GAME_TEXT.mission}</p>
          <p className="chase-page__hint">{GAME_TEXT.hint}</p>
        </div>
        <BackToMapButton onClick={onBackToMap} />
      </header>

      <div className="chase-page__layout">
        <SunChaseScene
          droplets={game.droplets}
          puffs={game.puffs}
          sunX={sunX}
          onSunXChange={handleSunChange}
        />

        <section className="chase-panel" aria-label="Status permainan">
          <div className="chase-panel__row">
            <span className="chase-panel__label">Titisan tinggal</span>
            <span className="chase-panel__value">{remaining}</span>
          </div>

          <div
            className="chase-panel__track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={SUN_GAME.dropletCount}
            aria-valuenow={game.evaporated}
            aria-label="Titisan yang telah menyejat"
          >
            <span className="chase-panel__fill" style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="chase-panel__group">
            <label className="chase-panel__label" htmlFor="sun-position">
              Kedudukan matahari
            </label>
            <input
              id="sun-position"
              className="chase-panel__slider"
              type="range"
              min={4}
              max={96}
              step={1}
              value={Math.round(sunX)}
              aria-valuetext={`${Math.round(sunX)} peratus`}
              onChange={(event) => handleSunChange(Number(event.target.value))}
            />
            <output className="chase-panel__readout" htmlFor="sun-position">
              {Math.round(sunX)}%
            </output>
          </div>

          <p className="chase-panel__tip" role="status">
            {remaining === 0
              ? GAME_TEXT.win
              : game.droplets.some((droplet) => droplet.energy > 0)
                ? GAME_TEXT.charging
                : GAME_TEXT.hint}
          </p>

          <button type="button" className="button-quiet chase-panel__restart" onClick={restart}>
            Mula semula
          </button>

          <p className="chase-panel__note">
            Model pengajaran: kawasan cahaya sengaja dikecilkan supaya anda perlu menggerakkan
            matahari. Wap air tidak kelihatan dalam keadaan sebenar.
          </p>
        </section>
      </div>

      {isWon ? (
        <div className="chase-overlay" role="dialog" aria-modal="true" aria-label="Tahap selesai">
          <div className="chase-overlay__card">
            <p className="chase-overlay__eyebrow">PERINGKAT 3 SELESAI</p>
            <h2 className="chase-overlay__title">{GAME_TEXT.win}</h2>
            <p className="chase-overlay__text">{GAME_TEXT.winSubtitle}</p>
            <ul className="chase-overlay__facts">
              {GAME_SUMMARY_FACTS.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
            <div className="chase-overlay__actions">
              <button type="button" className="button-quiet" onClick={restart}>
                Main lagi
              </button>
              <button type="button" className="button-primary" onClick={onBackToMap}>
                Teruskan ke Kerajaan Awan
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

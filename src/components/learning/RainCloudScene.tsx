import { useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import {
  cloudDarkness,
  collectedCount,
  isCloudOverfull,
  RAIN_GAME,
  type Droplet,
  type RainState,
} from '../../game/rainGather';
import { BIG_DROP_SPRITE, DROPLET_SPRITE, VALLEY_BACKGROUND } from '../../data/waterfallValleyAssets';
import './RainCloudScene.css';

interface RainCloudSceneProps {
  state: RainState;
  onCollect: (dropletId: string) => void;
}

/** Deterministic rain streaks: no randomness, so a re-render never re-shuffles them. */
const RAIN_SEEDS = Array.from({ length: 44 }, (_, index) => ({
  left: (index * 23) % 100,
  delay: (index % 11) * 0.13,
  duration: 1.4 + (index % 6) * 0.22,
}));

/** A pointer that travelled further than this counts as a drag, not a click. */
const DRAG_THRESHOLD_PX = 6;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * The scene of station 4: a cloud with one big droplet on top, small droplets
 * floating in the sky, and the sea, lake and river below.
 *
 * A droplet can be dragged onto the collector droplet, or simply clicked /
 * activated from the keyboard. Both paths call `onCollect`, and the game ignores
 * duplicates, so the two can never double-count. A real drag never falls back to
 * "click means collect": if it is released away from the cloud, it returns home.
 */
export function RainCloudScene({ state, onCollect }: RainCloudSceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragMovedRef = useRef(false);
  const suppressClickRef = useRef(false);
  const [dragging, setDragging] = useState<{ id: string; x: number; y: number } | null>(null);
  const [bgReady, setBgReady] = useState(false);
  const [bgFailed, setBgFailed] = useState(false);
  const [dropArtReady, setDropArtReady] = useState(false);
  const [collectorArtReady, setCollectorArtReady] = useState(false);

  const darkness = cloudDarkness(state);
  const count = collectedCount(state);
  const overfull = isCloudOverfull(state);
  const isRaining = state.phase === 'raining' || state.phase === 'finished';

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLButtonElement>,
    droplet: Droplet,
  ) => {
    if (state.phase !== 'gathering') return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    dragMovedRef.current = false;
    setDragging({ id: droplet.id, x: droplet.x, y: droplet.y });
  };

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLButtonElement>,
    droplet: Droplet,
  ) => {
    if (!dragging || dragging.id !== droplet.id) return;

    const start = dragStartRef.current;
    if (start) {
      const travelled = Math.hypot(event.clientX - start.x, event.clientY - start.y);
      if (travelled > DRAG_THRESHOLD_PX) dragMovedRef.current = true;
    }

    const rect = sceneRef.current?.getBoundingClientRect();
    // jsdom (and any hidden stage) reports a 0×0 box: keep the droplet where it is.
    if (!rect || rect.width === 0 || rect.height === 0) return;

    setDragging({
      id: droplet.id,
      x: clamp(((event.clientX - rect.left) / rect.width) * 100, 2, 98),
      y: clamp(((event.clientY - rect.top) / rect.height) * 100, 2, 94),
    });
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>, droplet: Droplet) => {
    if (!dragging || dragging.id !== droplet.id) return;

    const wasDrag = dragMovedRef.current;
    const collector = sceneRef.current?.querySelector<HTMLElement>('[data-collector="true"]');
    const target = collector?.getBoundingClientRect();
    const releasedOnCollector =
      target !== undefined &&
      target.width > 0 &&
      target.height > 0 &&
      event.clientX >= target.left &&
      event.clientX <= target.right &&
      event.clientY >= target.top &&
      event.clientY <= target.bottom;

    dragStartRef.current = null;
    setDragging(null);

    if (!wasDrag) return; // a plain click collects through onClick
    suppressClickRef.current = true;
    if (releasedOnCollector) onCollect(droplet.id);
  };

  const handleClick = (dropletId: string) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    onCollect(dropletId);
  };

  const sceneStyle = {
    '--cloud-darkness': darkness,
    '--cloud-wobble': overfull ? 1 : 0,
  } as CSSProperties;

  return (
    <div
      ref={sceneRef}
      className={`rain-scene${overfull ? ' rain-scene--heavy' : ''}${bgReady ? ' rain-scene--art-bg' : ''}${dropArtReady ? ' rain-scene--drop-art' : ''}${collectorArtReady ? ' rain-scene--collector-art' : ''}`}
      data-phase={state.phase}
      data-cloud-darkness={darkness.toFixed(2)}
      style={sceneStyle}
    >
      {bgFailed ? null : (
        <img
          className="rain-scene__bg"
          src={VALLEY_BACKGROUND}
          alt=""
          aria-hidden="true"
          onLoad={() => setBgReady(true)}
          onError={() => setBgFailed(true)}
        />
      )}

      <div className="rain-scene__sky" aria-hidden="true">
        <span className="rain-scene__sun" />
        <span className="rain-scene__hill rain-scene__hill--back" />
        <span className="rain-scene__hill rain-scene__hill--front" />
      </div>

      <div className="rain-cloud" data-testid="rain-cloud" aria-hidden="true">
        <span className="rain-cloud__puff rain-cloud__puff--left" />
        <span className="rain-cloud__puff rain-cloud__puff--middle" />
        <span className="rain-cloud__puff rain-cloud__puff--right" />
      </div>

      <div
        className="rain-collector"
        data-collector="true"
        data-testid="rain-collector"
        aria-label={`Titisan besar di atas awan — ${count} daripada ${RAIN_GAME.dropletCount} titisan bergabung`}
      >
        <span className="rain-collector__drop" aria-hidden="true" />
        <img
          className="rain-collector__art"
          src={BIG_DROP_SPRITE}
          alt=""
          aria-hidden="true"
          onLoad={() => setCollectorArtReady(true)}
          onError={() => setCollectorArtReady(false)}
        />
        <span className="rain-collector__count" aria-hidden="true">
          {count}/{RAIN_GAME.dropletCount}
        </span>
      </div>

      {state.droplets.map((droplet) => {
        const isDragging = dragging?.id === droplet.id;
        const position = isDragging && dragging ? dragging : droplet;
        return (
          <button
            key={droplet.id}
            type="button"
            className={`rain-droplet${isDragging ? ' rain-droplet--dragging' : ''}`}
            data-testid="rain-droplet"
            data-droplet-id={droplet.id}
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            aria-label={`Titisan air ${droplet.id.replace('d', '')} — seret ke awan atau klik`}
            onPointerDown={(event) => handlePointerDown(event, droplet)}
            onPointerMove={(event) => handlePointerMove(event, droplet)}
            onPointerUp={(event) => handlePointerUp(event, droplet)}
            onPointerCancel={() => {
              dragStartRef.current = null;
              setDragging(null);
            }}
            onClick={() => handleClick(droplet.id)}
          >
            <img
              className="rain-droplet__art"
              src={DROPLET_SPRITE}
              alt=""
              aria-hidden="true"
              onLoad={() => setDropArtReady(true)}
            />
            <span className="rain-droplet__shine" aria-hidden="true" />
          </button>
        );
      })}

      <div className="rain-scene__water" aria-hidden="true">
        <span className="rain-water rain-water--river" />
        <span className="rain-water rain-water--lake" />
        <span className="rain-water rain-water--sea" />
        <span className="rain-water__label rain-water__label--river">Sungai</span>
        <span className="rain-water__label rain-water__label--lake">Tasik</span>
        <span className="rain-water__label rain-water__label--sea">Laut</span>
      </div>

      {isRaining ? (
        <>
          <div className="rain-scene__rain" data-testid="rain-falling" aria-hidden="true">
            {RAIN_SEEDS.map((seed, index) => (
              <span
                key={index}
                className="rain-drop"
                style={
                  {
                    left: `${seed.left}%`,
                    animationDelay: `${seed.delay}s`,
                    animationDuration: `${seed.duration}s`,
                  } as CSSProperties
                }
              />
            ))}
          </div>
          <div className="rain-scene__splashes" aria-hidden="true">
            <span className="rain-splash rain-splash--river" />
            <span className="rain-splash rain-splash--lake" />
            <span className="rain-splash rain-splash--sea" />
          </div>
        </>
      ) : null}
    </div>
  );
}
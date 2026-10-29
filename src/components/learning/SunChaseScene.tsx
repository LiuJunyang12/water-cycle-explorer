import { useRef, useState } from 'react';
import { PANTAI_CERAH_ASSETS } from '../../data/pantaiCerahAssets';
import { SUN_GAME, type Droplet, type Puff } from '../../game/sunChase';
import './SunChaseScene.css';

interface SunChaseSceneProps {
  droplets: Droplet[];
  puffs: Puff[];
  sunX: number;
  onSunXChange: (value: number) => void;
}

const LIGHT_DIAMETER = SUN_GAME.lightRadius * 2;

/**
 * Game scene: a draggable Sun whose small sunlight patch charges the droplets.
 *
 * Artwork slots (background, sun, droplet) are tried first; when a file is
 * missing the CSS-drawn placeholder underneath stays visible.
 */
export function SunChaseScene({ droplets, puffs, sunX, onSunXChange }: SunChaseSceneProps) {
  const [hasBackground, setHasBackground] = useState(true);
  const [hasSun, setHasSun] = useState(true);
  const [hasDropletImage, setHasDropletImage] = useState(true);
  const sceneRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const moveSunTo = (clientX: number) => {
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    onSunXChange(Math.min(96, Math.max(4, next)));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // Stop the browser from starting a native image drag, which would cancel
    // pointer capture and make dragging the Sun feel broken.
    event.preventDefault();
    isDraggingRef.current = true;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    moveSunTo(event.clientX);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    moveSunTo(event.clientX);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onSunXChange(Math.max(4, sunX - SUN_GAME.keyboardStep));
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      onSunXChange(Math.min(96, sunX + SUN_GAME.keyboardStep));
    }
    if (event.key === 'Home') {
      event.preventDefault();
      onSunXChange(4);
    }
    if (event.key === 'End') {
      event.preventDefault();
      onSunXChange(96);
    }
  };

  return (
    <div
      ref={sceneRef}
      className="chase-scene"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="presentation"
    >
      {hasBackground ? (
        <img
          className="chase-scene__bg"
          src={PANTAI_CERAH_ASSETS.sceneBackground}
          alt=""
          onError={() => setHasBackground(false)}
        />
      ) : null}

      <div className="chase-scene__sky" aria-hidden="true" />
      <div className="chase-scene__beam" aria-hidden="true" style={{ left: `${sunX}%` }} />
      <div
        className="chase-scene__light"
        aria-hidden="true"
        style={{
          left: `${sunX}%`,
          top: `${SUN_GAME.waterLineY}%`,
          width: `${LIGHT_DIAMETER}%`,
        }}
      />

      <div
        className="chase-scene__sun"
        role="slider"
        tabIndex={0}
        aria-label="Sumber cahaya matahari"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(sunX)}
        aria-valuetext={`Matahari pada ${Math.round(sunX)} peratus`}
        title="Seret matahari, atau guna kekunci anak panah"
        style={{ left: `${sunX}%` }}
        onKeyDown={handleKeyDown}
      >
        {/* Rays are drawn by the game; the disc is only a fallback when no image exists. */}
        <span className="chase-scene__rays" aria-hidden="true" />
        {hasSun ? (
          <img
            className="chase-scene__sun-image"
            src={PANTAI_CERAH_ASSETS.sun}
            alt=""
            aria-hidden="true"
            draggable={false}
            onError={() => setHasSun(false)}
          />
        ) : (
          <span className="chase-scene__sun-body" aria-hidden="true" />
        )}
      </div>

      <div className="chase-scene__water" aria-hidden="true">
        <div className="chase-scene__water-surface" />
      </div>

      {/* Wisp rising from a droplet that has just evaporated. It is a soft
          translucent cue for the direction of movement, not white steam: real
          water vapour is invisible. */}
      {puffs.map((puff) => (
        <span
          key={puff.id}
          className="chase-puff"
          aria-hidden="true"
          style={{ left: `${puff.x}%`, top: `${puff.y}%` }}
        />
      ))}

      {droplets.map((droplet) => (
        <span
          key={droplet.id}
          className="chase-droplet"
          style={
            {
              left: `${droplet.x}%`,
              top: `${droplet.y}%`,
              '--energy': droplet.energy,
            } as React.CSSProperties
          }
          aria-hidden="true"
        >
          {hasDropletImage ? (
            <img
              className="chase-droplet__image"
              src={PANTAI_CERAH_ASSETS.droplet}
              alt=""
              draggable={false}
              onError={() => setHasDropletImage(false)}
            />
          ) : (
            <span className="chase-droplet__body" />
          )}
          {/* Red level rises from the bottom as the droplet stores solar energy. */}
          <span
            className="chase-droplet__fill"
            aria-hidden="true"
            style={{
              clipPath: `inset(${Math.max(0, 100 - droplet.energy)}% 0 0 0)`,
              ...(hasDropletImage
                ? {
                    WebkitMaskImage: `url(${PANTAI_CERAH_ASSETS.droplet})`,
                    maskImage: `url(${PANTAI_CERAH_ASSETS.droplet})`,
                  }
                : {}),
            }}
          />
        </span>
      ))}

      <p className="chase-scene__note">
        Wap air tidak kelihatan — kabus putih ini mewakili titisan air halus.
      </p>
    </div>
  );
}

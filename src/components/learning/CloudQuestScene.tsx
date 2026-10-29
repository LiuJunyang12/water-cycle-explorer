import { useState } from 'react';
import {
  DOOR_SPRITES,
  HAZARD_AIR_SPRITE,
  WALLY_SPRITES,
} from '../../data/cloudKingdomAssets';
import { CLOUD_BRIDGE_PLATFORMS } from '../../game/cloudQuest/levels';
import { hazardRect, PHYSICS, wallyPose } from '../../game/cloudQuest/physics';
import type { LevelDef, PlatformDef, WorldState } from '../../game/cloudQuest/types';
import './CloudQuestScene.css';

interface CloudQuestSceneProps {
  level: LevelDef;
  world: WorldState;
  hazardTimeMs: number;
  bridgeFormed: boolean;
}

const VIEW_WIDTH = 100;

/** Converts a world x/width (units) into a percentage of the world strip. */
function pctX(value: number, level: LevelDef): number {
  return (value / level.width) * 100;
}

/**
 * Horizontal layout is in units of the scene width, so a sprite's height must
 * come from that same unit or it gets squashed when the window is zoomed or has
 * a different shape. The levels were authored for a 16:9 playfield, where one
 * vertical percent equals 0.5625 width units (9 / 16).
 */
const VERTICAL_UNIT_RATIO = 9 / 16;

/**
 * The world is 100 design units tall, and 100 vertical units equal 56.25
 * horizontal units (a 16:9 playfield). Expressing the strip height in the same
 * unit as its width keeps the whole level uniformly scaled at any window size.
 */
const DESIGN_HEIGHT_UNITS = 100 * VERTICAL_UNIT_RATIO;

/** CSS `aspect-ratio` for an object `w` × `h` world units (undistorted). */
function spriteAspect(w: number, h: number): string {
  return `${w} / ${h * VERTICAL_UNIT_RATIO}`;
}

/** Platform list for the current level (the cloud bridge only when formed). */
export function activePlatforms(level: LevelDef, bridgeFormed: boolean): PlatformDef[] {
  return level.id === 'cloud-bridge' && bridgeFormed ? [...CLOUD_BRIDGE_PLATFORMS] : [];
}

/**
 * The playable scene: platforms, vapour markers, air-current hazards, the exit
 * portal and Wally. The world strip scrolls horizontally with the camera.
 */
export function CloudQuestScene({
  level,
  world,
  hazardTimeMs,
  bridgeFormed,
}: CloudQuestSceneProps) {
  const bridge = activePlatforms(level, bridgeFormed);
  const platforms: PlatformDef[] = [...level.platforms, ...bridge];
  const collectedCount = world.collectedIds.length;
  const exitOpen = collectedCount >= level.requiredCollectibles;
  const facing = world.player.vx < 0 ? 'left' : 'right';
  const pose = wallyPose(world);

  // Artwork is optional: anything that fails to load falls back to CSS shapes,
  // so the game stays playable while illustrations are still being made.
  const [failedSprites, setFailedSprites] = useState<Record<string, boolean>>({});
  const showSprite = (key: string) => !failedSprites[key];
  const failSprite = (key: string) => () =>
    setFailedSprites((current) => (current[key] ? current : { ...current, [key]: true }));

  return (
    <div className="quest-scene" data-testid="quest-scene">
      <div className="quest-scene__sky" aria-hidden="true" />

      {/* The camera never moves: the strip is exactly as wide as the scene, so
          the whole level is on screen at once. Its height is fixed in world
          units (100 units = 56.25 width units), which keeps every object at a
          constant, undistorted size no matter how the window is sized. */}
      <div
        className="quest-world"
        style={{
          width: '100%',
          aspectRatio: `${level.width} / ${DESIGN_HEIGHT_UNITS}`,
        }}
      >
        {level.castle ? (
          <div
            className="quest-castle"
            aria-hidden="true"
            style={{
              left: `${pctX(level.castle.x, level)}%`,
              top: `${level.castle.y}%`,
              width: `${pctX(level.castle.w, level)}%`,
              aspectRatio: spriteAspect(level.castle.w, level.castle.h),
            }}
          />
        ) : null}

        {platforms.map((platform) => {
          const isBridge = platform.id.startsWith('bridge-');
          return (
            <div
              key={platform.id}
              className={`quest-platform quest-platform--${platform.kind ?? 'cloud'}${
                isBridge ? ' quest-platform--bridge' : ''
              }`}
              style={{
                left: `${pctX(platform.x, level)}%`,
                top: `${platform.y}%`,
                width: `${pctX(platform.w, level)}%`,
                aspectRatio: spriteAspect(platform.w, platform.h),
              }}
              aria-hidden="true"
            />
          );
        })}

        {level.collectibles.map((item) => {
          if (world.collectedIds.includes(item.id)) return null;
          return (
            <div
              key={item.id}
              className="quest-marker"
              style={{
                left: `${pctX(item.x, level)}%`,
                top: `${item.y}%`,
                width: `${pctX(item.r * 2, level)}%`,
                aspectRatio: '1',
              }}
              aria-hidden="true"
            />
          );
        })}

        {level.hazards.map((hazard) => {
          const rect = hazardRect(hazard, hazardTimeMs);
          const spriteOk = showSprite('hazard');
          return (
            <div
              key={hazard.id}
              className={`quest-hazard${spriteOk ? ' quest-hazard--image' : ''}`}
              style={{
                left: `${pctX(rect.x, level)}%`,
                top: `${rect.y}%`,
                width: `${pctX(rect.w, level)}%`,
                aspectRatio: spriteAspect(rect.w, rect.h),
              }}
              aria-hidden="true"
            >
              {spriteOk ? (
                <div className="quest-hazard__art">
                  <img
                    className="quest-hazard__sprite"
                    data-testid="hazard-sprite"
                    src={HAZARD_AIR_SPRITE}
                    alt=""
                    draggable={false}
                    onError={failSprite('hazard')}
                  />
                </div>
              ) : null}
            </div>
          );
        })}

        {/* The level's door. Only the illustration is shown — the level decides
            which artwork (first parkour level "masuk", second "keluar"). */}
        <div
          className={`quest-exit ${exitOpen ? 'is-open' : 'is-locked'}`}
          data-door-art={level.doorArt}
          style={{
            left: `${pctX(level.exit.x, level)}%`,
            top: `${level.exit.y}%`,
            width: `${pctX(level.exit.w, level)}%`,
            height: `${level.exit.h}%`,
          }}
          aria-hidden="true"
        >
          <div className="quest-exit__art">
            {showSprite('door') ? (
              <img
                className="quest-exit__sprite"
                data-testid="exit-door-sprite"
                src={DOOR_SPRITES[level.doorArt]}
                alt=""
                draggable={false}
                onError={failSprite('door')}
              />
            ) : (
              <span className="quest-exit__fallback" />
            )}
          </div>
        </div>

        <div
          className={`quest-wally quest-wally--${facing}`}
          data-testid="wally"
          data-pose={pose}
          style={{
            left: `${pctX(world.player.x, level)}%`,
            top: `${world.player.y}%`,
            width: `${pctX(PHYSICS.playerWidth, level)}%`,
            aspectRatio: spriteAspect(PHYSICS.playerWidth, PHYSICS.playerHeight),
          }}
          aria-hidden="true"
        >
          <div className="quest-wally__art">
            {showSprite(`wally-${pose}`) ? (
              <img
                className="quest-wally__sprite"
                data-testid="wally-sprite"
                src={WALLY_SPRITES[pose]}
                alt=""
                draggable={false}
                onError={failSprite(`wally-${pose}`)}
              />
            ) : (
              <span className="quest-wally__fallback">
                <span className="quest-wally__eye" />
                <span className="quest-wally__eye" />
                <span className="quest-wally__smile" />
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="quest-scene__hint" aria-hidden="true">
        {VIEW_WIDTH <= 100 ? 'Guna anak panah / A D untuk bergerak, Space untuk melompat.' : ''}
      </div>
    </div>
  );
}

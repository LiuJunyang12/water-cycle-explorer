import { fireEvent, render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import {
  DOOR_SPRITES,
  HAZARD_AIR_SPRITE,
  WALLY_SPRITES,
} from '../../data/cloudKingdomAssets';
import { LEVELS } from '../../game/cloudQuest/levels';
import { createWorld } from '../../game/cloudQuest/physics';
import type { PlayerState } from '../../game/cloudQuest/types';
import { CloudQuestScene } from './CloudQuestScene';

const level = LEVELS[0];

function renderScene(playerX: number, playerOverrides: Partial<PlayerState> = {}) {
  const world = {
    ...createWorld(level),
    player: { x: playerX, y: 73, vx: 0, vy: 0, grounded: true, ...playerOverrides },
  };
  const utils = render(
    <CloudQuestScene
      level={level}
      world={world}
      hazardTimeMs={0}
      bridgeFormed={false}
    />,
  );
  return { ...utils, world };
}

describe('CloudQuestScene framing (the camera never moves)', () => {
  test('the world strip is exactly as wide as the scene, so the whole level fits', () => {
    const { container } = renderScene(150);
    const strip = container.querySelector('.quest-world') as HTMLElement;

    expect(strip.style.width).toBe('100%');
    // Height comes from the same world unit (100 units = 56.25 width units), so
    // every object keeps a constant, undistorted size at any window size.
    expect(strip.style.aspectRatio).toBe(`${level.width} / 56.25`);
    expect(strip.style.height).toBe('');

    // No camera offsets at all: the scenery is fixed and only Wally moves.
    expect(strip.style.left).toBe('');
    expect(strip.style.transform).toBe('');
  });

  test('every platform and Wally sit inside the level bounds', () => {
    const playerX = 150;
    const { container } = renderScene(playerX);
    const platforms = Array.from(
      container.querySelectorAll<HTMLElement>('.quest-platform'),
    );

    level.platforms.forEach((platform, index) => {
      const leftPct = Number.parseFloat(platforms[index].style.left);
      // The strip is 100% of the scene, so 100% of the strip = level.width units.
      const leftUnits = (leftPct / 100) * level.width;
      expect(leftUnits).toBeCloseTo(platform.x, 5);
      expect(leftUnits + platform.w).toBeLessThanOrEqual(level.width + 1e-6);
    });

    const wally = container.querySelector<HTMLElement>('[data-testid="wally"]')!;
    const wallyUnits = (Number.parseFloat(wally.style.left) / 100) * level.width;
    expect(wallyUnits).toBeCloseTo(playerX, 5);
  });
});

describe('CloudQuestScene geometry', () => {
  test('sprites take their height from the width unit, so zoom cannot squash them', () => {
    const { container } = renderScene(6);
    const platform = container.querySelector<HTMLElement>('.quest-platform')!;
    const wally = container.querySelector<HTMLElement>('[data-testid="wally"]')!;

    // A percentage height is relative to the scene HEIGHT, which changes with
    // zoom and window shape — that is exactly what distorted the sprites.
    expect(platform.style.height).toBe('');
    expect(wally.style.height).toBe('');

    const firstPlatform = level.platforms[0];
    const [w, h] = platform.style.aspectRatio
      .split('/')
      .map((part) => Number.parseFloat(part));

    expect(w).toBeCloseTo(firstPlatform.w, 5);
    // 9/16 keeps the authored 16:9 proportions on a normal window.
    expect(h).toBeCloseTo(firstPlatform.h * (9 / 16), 5);
  });

  test('the vapour markers stay circular', () => {
    const { container } = renderScene(6);
    const marker = container.querySelector<HTMLElement>('.quest-marker')!;

    // jsdom normalises `aspect-ratio: 1` to `1 / 1`; both mean "circle".
    expect(marker.style.aspectRatio).toMatch(/^1(\s*\/\s*1)?$/);
    expect(marker.style.height).toBe('');
  });
});

describe('CloudQuestScene artwork', () => {
  test('Wally shows one illustration per state: stand, walk, jump', () => {
    const standing = renderScene(6);
    expect(standing.getByTestId('wally-sprite')).toHaveAttribute('src', WALLY_SPRITES.stand);
    expect(standing.getByTestId('wally')).toHaveAttribute('data-pose', 'stand');
    standing.unmount();

    const walking = renderScene(6, { vx: 12 });
    expect(walking.getByTestId('wally-sprite')).toHaveAttribute('src', WALLY_SPRITES.walk);
    expect(walking.getByTestId('wally')).toHaveClass('quest-wally--right');
    walking.unmount();

    const jumping = renderScene(6, { grounded: false, vx: 0 });
    expect(jumping.getByTestId('wally-sprite')).toHaveAttribute('src', WALLY_SPRITES.jump);
    jumping.unmount();

    // Walking left keeps the same drawing and only mirrors it.
    const walkingLeft = renderScene(6, { vx: -12 });
    expect(walkingLeft.getByTestId('wally-sprite')).toHaveAttribute('src', WALLY_SPRITES.walk);
    expect(walkingLeft.getByTestId('wally')).toHaveClass('quest-wally--left');
  });

  test('a missing Wally illustration falls back to the CSS droplet', () => {
    const { getByTestId, container } = renderScene(6);
    fireEvent.error(getByTestId('wally-sprite'));

    expect(container.querySelector('[data-testid="wally-sprite"]')).toBeNull();
    expect(container.querySelector('.quest-wally__fallback')).not.toBeNull();
    // The fallback keeps Wally's face (two eyes + smile), so he still looks like himself.
    expect(container.querySelectorAll('.quest-wally__eye')).toHaveLength(2);
    expect(container.querySelector('.quest-wally__smile')).not.toBeNull();
  });

  test('the air hazard uses its illustration and keeps its collision box', () => {
    const { getAllByTestId, container } = renderScene(6);
    const sprites = getAllByTestId('hazard-sprite');

    expect(sprites).toHaveLength(LEVELS[0].hazards.length);
    expect(sprites[0]).toHaveAttribute('src', HAZARD_AIR_SPRITE);
    expect(container.querySelector('.quest-hazard')).toHaveClass('quest-hazard--image');
  });

  test('each parkour level shows only its own door illustration', () => {
    const first = renderScene(6);
    expect(first.container.querySelector('.quest-door')).toBeNull();
    expect(first.getByTestId('exit-door-sprite')).toHaveAttribute(
      'src',
      DOOR_SPRITES.masuk,
    );
    // No text label on the door: the artwork alone communicates it.
    expect(first.container.querySelector('.quest-exit')?.textContent).toBe('');

    const second = render(
      <CloudQuestScene
        level={LEVELS[1]}
        world={{ ...createWorld(LEVELS[1]), player: { x: 6, y: 66, vx: 0, vy: 0, grounded: true } }}
        hazardTimeMs={0}
        bridgeFormed={false}
      />,
    );
    expect(second.container.querySelector('.quest-exit')).toHaveAttribute(
      'data-door-art',
      'keluar',
    );
    expect(
      second.container.querySelector('[data-testid="exit-door-sprite"]'),
    ).toHaveAttribute('src', DOOR_SPRITES.keluar);
  });
});

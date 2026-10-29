import type { InputState, LevelDef, PlatformDef, Rect, WallyPose, WorldState } from './types';

/**
 * Platformer physics — pure functions, no DOM.
 *
 * Units: 1 horizontal unit = 1% of the level width. 1% of the height is 0.5625
 * of that (a 16:9 playfield). The camera is fixed and objects keep a constant
 * size, so the whole level is readable at any window shape.
 *
 * Artwork is drawn larger than the 5×7 movement box (see ART_SCALE), so every
 * JUDGED body is derived from the artwork the pupil actually sees: a flame that
 * touches Wally must hit him, and a vapour marker that touches him must count.
 * What you see is what collides.
 */
export const ART_ASPECT = {
  hazard: 0.8,
  door: 0.75,
} as const;

/** CSS scale factors applied in CloudQuestScene.css. Keep the two in sync. */
export const ART_SCALE = {
  wally: 3,
  door: 2.4,
  marker: 2.2,
} as const;

export const PHYSICS = {
  gravity: 260,
  jumpSpeed: 100,
  moveSpeed: 34,
  maxFallSpeed: 150,
  playerWidth: 5,
  playerHeight: 7,
  stepSeconds: 1 / 60,
  worldHeight: 100,
} as const;

/**
 * How much of Wally's 480×640 canvas the drawing covers, measured from the
 * artwork: the body spans ~80% of the width and ~98% of the height, and the
 * image is bottom-aligned (transform-origin: bottom center).
 */
const WALLY_CONTENT = { width: 0.8, height: 0.95 } as const;

/**
 * Wally as he is drawn: his illustration is ART_SCALE.wally × the movement box,
 * bottom-centred on it. Used for hazards, markers and the exit so the judged
 * body matches the visible one.
 */
export function playerBodyBox(state: WorldState): Rect {
  const width = PHYSICS.playerWidth * ART_SCALE.wally * WALLY_CONTENT.width;
  const height = PHYSICS.playerHeight * ART_SCALE.wally * WALLY_CONTENT.height;
  return {
    x: state.player.x + (PHYSICS.playerWidth - width) / 2,
    y: state.player.y + PHYSICS.playerHeight - height,
    w: width,
    h: height,
  };
}

export function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function playerBox(state: WorldState): Rect {
  return {
    x: state.player.x,
    y: state.player.y,
    w: PHYSICS.playerWidth,
    h: PHYSICS.playerHeight,
  };
}

/**
 * Which illustration Wally should wear: airborne → jump, moving on the ground →
 * walk, otherwise stand. `grounded` comes from the physics step, so the pose
 * changes exactly when his movement state does.
 */
export function wallyPose(state: WorldState): WallyPose {
  if (!state.player.grounded) return 'jump';
  return Math.abs(state.player.vx) > 0.01 ? 'walk' : 'stand';
}

/** Hazard position at a given simulation time (oscillates around its base). */
export function hazardRect(
  hazard: LevelDef['hazards'][number],
  elapsedMs: number,
): Rect {
  const offset = Math.sin((elapsedMs / 1000) * hazard.speed + (hazard.phase ?? 0)) * hazard.range;
  return hazard.axis === 'x'
    ? { x: hazard.x + offset, y: hazard.y, w: hazard.w, h: hazard.h }
    : { x: hazard.x, y: hazard.y + offset, w: hazard.w, h: hazard.h };
}

/** Collectible as it is drawn: the marker is scaled up by ART_SCALE.marker. */
export function markerBox(item: LevelDef['collectibles'][number]): Rect {
  const radius = item.r * ART_SCALE.marker;
  return { x: item.x - radius, y: item.y - radius, w: radius * 2, h: radius * 2 };
}

export function createWorld(level: LevelDef): WorldState {
  return {
    player: { x: level.spawn.x, y: level.spawn.y, vx: 0, vy: 0, grounded: false },
    collectedIds: [],
    respawns: 0,
    reachedExit: false,
  };
}

function respawn(state: WorldState, level: LevelDef): WorldState {
  return {
    ...state,
    player: { x: level.spawn.x, y: level.spawn.y, vx: 0, vy: 0, grounded: false },
    respawns: state.respawns + 1,
  };
}

function allPlatforms(level: LevelDef, extraPlatforms: PlatformDef[]): PlatformDef[] {
  return [...level.platforms, ...extraPlatforms];
}

/**
 * Advances the world by one fixed step.
 *
 * Order of operations: horizontal move + resolve, vertical move + resolve,
 * then hazards / collectibles / exit / falling out of the world.
 */
export function stepWorld(
  state: WorldState,
  level: LevelDef,
  input: InputState,
  elapsedMs: number,
  extraPlatforms: PlatformDef[] = [],
): WorldState {
  const dt = PHYSICS.stepSeconds;
  const platforms = allPlatforms(level, extraPlatforms);
  const player = { ...state.player };

  const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  player.vx = direction * PHYSICS.moveSpeed;

  if (input.jump && player.grounded) {
    player.vy = -PHYSICS.jumpSpeed;
    player.grounded = false;
  }

  player.vy = Math.min(player.vy + PHYSICS.gravity * dt, PHYSICS.maxFallSpeed);

  // ---- Horizontal ----
  let nextX = player.x + player.vx * dt;
  let box: Rect = { x: nextX, y: player.y, w: PHYSICS.playerWidth, h: PHYSICS.playerHeight };
  for (const platform of platforms) {
    if (!overlaps(box, platform)) continue;
    if (player.vx > 0) nextX = platform.x - PHYSICS.playerWidth;
    else if (player.vx < 0) nextX = platform.x + platform.w;
    box = { ...box, x: nextX };
  }
  player.x = Math.max(0, Math.min(level.width - PHYSICS.playerWidth, nextX));

  // ---- Vertical ----
  let nextY = player.y + player.vy * dt;
  player.grounded = false;
  box = { x: player.x, y: nextY, w: PHYSICS.playerWidth, h: PHYSICS.playerHeight };
  for (const platform of platforms) {
    if (!overlaps(box, platform)) continue;
    if (player.vy > 0) {
      nextY = platform.y - PHYSICS.playerHeight;
      player.vy = 0;
      player.grounded = true;
    } else if (player.vy < 0) {
      nextY = platform.y + platform.h;
      player.vy = 0;
    }
    box = { ...box, y: nextY };
  }
  player.y = nextY;

  let next: WorldState = { ...state, player };

  // ---- Falling out of the world ----
  if (player.y > PHYSICS.worldHeight + 20) {
    next = respawn(next, level);
  }

  // ---- Hazards (judged against the drawn body) ----
  const body = playerBodyBox(next);
  const hazardHit = level.hazards.some((hazard) =>
    overlaps(body, hazardRect(hazard, elapsedMs)),
  );
  if (hazardHit) {
    next = respawn(next, level);
  }

  // ---- Collectibles (judged against the drawn marker) ----
  const collected = [...next.collectedIds];
  for (const item of level.collectibles) {
    if (collected.includes(item.id)) continue;
    if (overlaps(playerBodyBox(next), markerBox(item))) collected.push(item.id);
  }
  next = { ...next, collectedIds: collected };

  // ---- Exit ----
  const hasEnough = next.collectedIds.length >= level.requiredCollectibles;
  next = { ...next, reachedExit: hasEnough && overlaps(playerBodyBox(next), level.exit) };

  return next;
}

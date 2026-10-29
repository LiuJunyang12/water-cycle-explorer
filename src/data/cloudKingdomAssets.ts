import { BASE_URL } from '../config/baseUrl';
import type { LevelDoorArt, WallyPose } from '../game/cloudQuest/types';

/**
 * Cloud Kingdom artwork.
 *
 * Source files live in `design-assets/characters/` (Wally) and
 * `design-assets/illustrations/` (hazard, doors) and are copied to
 * `public/assets/images/cloud-kingdom/` with exactly these ASCII names.
 *
 * Every sprite is optional: while a file is missing (or fails to load) the scene
 * falls back to its CSS drawing, so artwork can be added one piece at a time.
 */
const CLOUD_KINGDOM_DIR = `${BASE_URL}assets/images/cloud-kingdom/`;

/** One illustration per pose: stand / walk / jump. */
export const WALLY_SPRITES: Record<WallyPose, string> = {
  stand: `${CLOUD_KINGDOM_DIR}wally-stand.png`,
  walk: `${CLOUD_KINGDOM_DIR}wally-walk.png`,
  jump: `${CLOUD_KINGDOM_DIR}wally-jump.png`,
};

/** Moving air current that pushes Wally back to the start. */
export const HAZARD_AIR_SPRITE = `${CLOUD_KINGDOM_DIR}hazard-air.png`;

/**
 * The door that closes each parkour level. There are two levels with a door, so
 * there are two illustrations: the first level uses "masuk", the second "keluar".
 */
export const DOOR_SPRITES: Record<LevelDoorArt, string> = {
  masuk: `${CLOUD_KINGDOM_DIR}door-masuk.png`,
  keluar: `${CLOUD_KINGDOM_DIR}door-keluar.png`,
};

/** Doors are drawn 3:4 (portrait); the level's exit box keeps them undistorted. */
export const DOOR_ASPECT = 3 / 4;

import { BASE_URL } from '../config/baseUrl';

/**
 * Optional artwork slots for the Sunny Coast game.
 *
 * Each slot is attempted first; if the file is missing, the code-drawn
 * placeholder underneath stays visible. To replace an illustration, drop a file
 * at exactly this path — no code change needed.
 */
export const PANTAI_CERAH_ASSETS = {
  /** 4:3 opaque background: sky + lake scene, without droplets or sunlight. */
  sceneBackground: `${BASE_URL}assets/images/pantai-cerah/scene-background.png`,
  /** Square transparent sun illustration. Sun rays are drawn by the game. */
  sun: `${BASE_URL}assets/images/pantai-cerah/sun.png`,
  /** Square transparent water droplet used for the droplets that evaporate. */
  droplet: `${BASE_URL}assets/images/pantai-cerah/droplet.png`,
} as const;

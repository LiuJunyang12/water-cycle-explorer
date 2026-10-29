import { BASE_URL } from '../config/baseUrl';

/**
 * Optional hand-drawn artwork for station 4 (Lembah Air Terjun).
 *
 * The cloud is always built from CSS — these files only add the painted
 * valley backdrop, the droplet faces and (optionally) a Wally illustration
 * that is specific to this station. Every file is optional: when it is
 * missing the scene keeps its CSS drawing, so the station stays playable
 * while the artwork is being prepared.
 *
 * Put the source files in `design-assets/illustrations/` and copy them to
 * `public/assets/images/waterfall-valley/`.
 */
const VALLEY_DIR = `${BASE_URL}assets/images/waterfall-valley/`;

/** Full stage backdrop: sky, hills, river, lake and sea (no cloud, no droplets). */
export const VALLEY_BACKGROUND = `${VALLEY_DIR}valley-bg.png`;

/** One floating droplet, used for all twelve droplets of the sky. */
export const DROPLET_SPRITE = `${VALLEY_DIR}droplet.png`;

/** The big droplet that waits on top of the cloud and collects the others. */
export const BIG_DROP_SPRITE = `${VALLEY_DIR}big-drop.png`;

/** Optional Wally made for this station; falls back to the Cloud Kingdom pose. */
export const WALLY_VALLEY_SPRITE = `${VALLEY_DIR}wally.png`;
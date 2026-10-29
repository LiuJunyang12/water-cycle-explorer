import { BASE_URL } from '../config/baseUrl';

/**
 * Station 1 — Khemah (Camp): the introduction video.
 *
 * Original file: `design-assets/animations/视频.mp4` (H.264 MP4). The web copy
 * is served from `public/videos/khemah-video.mp4` under an ASCII filename.
 * Switching to an audio recording later only needs `kind` + `src` changed.
 */
export type CampMediaKind = 'video' | 'audio';

export interface CampMedia {
  kind: CampMediaKind;
  src: string;
  /** Still image shown behind audio playback (ignored for video). */
  poster?: string;
  posterAlt?: string;
}

export const CAMP_MEDIA: CampMedia = {
  kind: 'video',
  src: `${BASE_URL}videos/khemah-video.mp4`,
  poster: `${BASE_URL}assets/images/home-bg.jpeg`,
  posterAlt: 'Ilustrasi kitaran air semula jadi',
};

/** Label used in pupil-facing sentences: "Tonton video" / "Dengar audio". */
export const CAMP_MEDIA_VERB = CAMP_MEDIA.kind === 'video' ? 'Tonton' : 'Dengar';
export const CAMP_MEDIA_NOUN = CAMP_MEDIA.kind === 'video' ? 'video' : 'audio';

export interface GuidingQuestion {
  id: string;
  /** Malay question shown to pupils (text only, no answers required). */
  text: string;
}

/** Shown only AFTER the media has been played to the end; no answers required. */
export const CAMP_GUIDING_QUESTIONS: GuidingQuestion[] = [
  { id: 'rain-source', text: 'Dari manakah datangnya hujan?' },
  { id: 'water-after-rain', text: 'Ke manakah air pergi selepas hujan turun?' },
  { id: 'back-to-atmosphere', text: 'Bagaimanakah air kembali ke atmosfera?' },
];

/**
 * Fraction of the media that must be played before the station is complete.
 * The station is only finished when the recording has been watched right to the
 * end, so this stays at 100% (the end-of-media handler still absorbs the small
 * rounding gap browsers report on the last `timeupdate`).
 */
export const REQUIRED_WATCH_RATIO = 1;

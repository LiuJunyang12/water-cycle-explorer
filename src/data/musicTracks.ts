/**
 * Background music tracks available on the site.
 *
 * The audio files are copies of the project owner's originals, served from
 * `public/audio/` under ASCII filenames so URLs stay portable:
 *   - 可爱 默认BGM.mp3   -> public/audio/bgm-cute.mp3
 *   - 中国风 可选BGM.mp3 -> public/audio/bgm-chinese.mp3
 */

import { BASE_URL } from '../config/baseUrl';

export type MusicTrackId = 'cute' | 'chinese';

export interface MusicTrack {
  id: MusicTrackId;
  /** Label shown to pupils (Malay). */
  label: string;
  /** Short note under the label. */
  description: string;
  /** URL resolved against the Vite base path. */
  url: string;
  isDefault?: boolean;
}

const AUDIO_BASE = `${BASE_URL}audio/`;

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'cute',
    label: 'Muzik Ceria (Lalai)',
    description: 'Muzik latar utama yang lembut dan ceria.',
    url: `${AUDIO_BASE}bgm-cute.mp3`,
    isDefault: true,
  },
  {
    id: 'chinese',
    label: 'Muzik Cina Klasik (Pilihan)',
    description: 'Pilihan muzik latar bernuansa klasik.',
    url: `${AUDIO_BASE}bgm-chinese.mp3`,
  },
];

export const DEFAULT_MUSIC_TRACK_ID: MusicTrackId = 'cute';

/** Comfortable default loudness for a classroom device. */
export const DEFAULT_MUSIC_VOLUME = 0.45;

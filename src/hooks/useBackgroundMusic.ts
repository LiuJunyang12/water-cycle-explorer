import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_MUSIC_TRACK_ID,
  DEFAULT_MUSIC_VOLUME,
  MUSIC_TRACKS,
  type MusicTrack,
  type MusicTrackId,
} from '../data/musicTracks';

const TRACK_STORAGE_KEY = 'wce:music-track';
const MUTED_STORAGE_KEY = 'wce:music-muted';

function readStoredTrackId(): MusicTrackId {
  try {
    const stored = window.localStorage.getItem(TRACK_STORAGE_KEY);
    if (stored && MUSIC_TRACKS.some((track) => track.id === stored)) {
      return stored as MusicTrackId;
    }
  } catch {
    /* localStorage can be unavailable (private mode); fall back to default. */
  }
  return DEFAULT_MUSIC_TRACK_ID;
}

function readStoredMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function persist(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* Ignore storage failures: music still works for this session. */
  }
}

export interface BackgroundMusic {
  currentTrack: MusicTrack;
  trackId: MusicTrackId;
  isMuted: boolean;
  isPlaying: boolean;
  /** True when the browser refused audible autoplay and a tap is required. */
  needsInteraction: boolean;
  selectTrack: (trackId: MusicTrackId) => void;
  toggleMute: () => void;
  /** Used while a video with its own audio is playing, to avoid overlapping sound. */
  pausePlayback: () => void;
  /** Restarts the track after the video stops. */
  resumePlayback: () => void;
}

/**
 * Owns the single background-music <audio> element for the whole app.
 *
 * Browsers block audible autoplay, so the hook first asks for sound and, if the
 * browser refuses, keeps the track rolling muted (muted autoplay is allowed) and
 * unmutes at the visitor's first tap/keypress. The URL never claims a sound
 * started before the browser allowed it.
 */
export function useBackgroundMusic(): BackgroundMusic {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [trackId, setTrackId] = useState<MusicTrackId>(readStoredTrackId);
  const [isMuted, setIsMuted] = useState<boolean>(readStoredMuted);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);

  const mutedRef = useRef(isMuted);

  const currentTrack = useMemo(
    () => MUSIC_TRACKS.find((track) => track.id === trackId) ?? MUSIC_TRACKS[0],
    [trackId],
  );

  // Create the element once, outside React's tree so remounts cannot kill the track.
  if (audioRef.current === null && typeof document !== 'undefined') {
    const audio = document.createElement('audio');
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = DEFAULT_MUSIC_VOLUME;
    audioRef.current = audio;
  }

  useEffect(() => {
    mutedRef.current = isMuted;
    const audio = audioRef.current;
    if (audio) audio.muted = isMuted;
    persist(MUTED_STORAGE_KEY, String(isMuted));
  }, [isMuted]);

  const startPlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = mutedRef.current;
    try {
      await audio.play();
      setIsPlaying(true);
      setNeedsInteraction(false);
      return;
    } catch {
      /* Audible autoplay was refused; fall through to muted playback. */
    }

    try {
      audio.muted = true;
      await audio.play();
      setIsPlaying(true);
      setNeedsInteraction(!mutedRef.current);
    } catch {
      setIsPlaying(false);
      setNeedsInteraction(true);
    }
  }, []);

  // (Re)load whenever the selected track changes, including first mount.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = currentTrack.url;
    audio.load();
    void startPlayback();
  }, [currentTrack.url, startPlayback]);

  // Unblock audible playback at the first real gesture.
  useEffect(() => {
    if (!needsInteraction) return;
    const resume = () => {
      void startPlayback();
    };
    document.addEventListener('pointerdown', resume, { once: true });
    document.addEventListener('keydown', resume, { once: true });
    return () => {
      document.removeEventListener('pointerdown', resume);
      document.removeEventListener('keydown', resume);
    };
  }, [needsInteraction, startPlayback]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) audio.pause();
    };
  }, []);

  const selectTrack = useCallback((nextTrackId: MusicTrackId) => {
    setTrackId(nextTrackId);
    persist(TRACK_STORAGE_KEY, nextTrackId);
  }, []);

  const toggleMute = useCallback(() => {
    const nextMuted = !mutedRef.current;
    mutedRef.current = nextMuted;
    setIsMuted(nextMuted);

    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = nextMuted;
    if (!nextMuted && audio.paused) void startPlayback();
  }, [startPlayback]);

  const pausePlayback = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const resumePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.paused) return;
    void startPlayback();
  }, [startPlayback]);

  return {
    currentTrack,
    trackId,
    isMuted,
    isPlaying,
    needsInteraction,
    selectTrack,
    toggleMute,
    pausePlayback,
    resumePlayback,
  };
}

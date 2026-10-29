import { useEffect, useId, useRef, useState } from 'react';
import { MUSIC_TRACKS } from '../../data/musicTracks';
import { useBackgroundMusic } from '../../hooks/useBackgroundMusic';
import './MusicPlayer.css';

/**
 * Vinyl-record button (top-right) that opens the background-music picker:
 * choose a track or mute the music. Playback itself lives in useBackgroundMusic.
 */
export function MusicPlayer() {
  const { trackId, isMuted, isPlaying, needsInteraction, selectTrack, toggleMute, pausePlayback, resumePlayback } =
    useBackgroundMusic();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen]);

  // Duck the background music while a video with its own sound is playing.
  useEffect(() => {
    const handlePause = () => pausePlayback();
    const handleResume = () => resumePlayback();
    window.addEventListener('wce:pause-music', handlePause);
    window.addEventListener('wce:resume-music', handleResume);
    return () => {
      window.removeEventListener('wce:pause-music', handlePause);
      window.removeEventListener('wce:resume-music', handleResume);
    };
  }, [pausePlayback, resumePlayback]);

  const spinClass = isPlaying && !isMuted ? 'is-spinning' : '';
  const stateLabel = isMuted ? 'Muzik disenyapkan' : 'Muzik dimainkan';

  return (
    <div className="music-player">
      <button
        type="button"
        ref={buttonRef}
        className="music-player__button"
        aria-label={`Tetapan muzik — ${stateLabel}`}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={`music-player__vinyl ${spinClass}`}>
          <svg viewBox="0 0 100 100" role="img" aria-hidden="true" focusable="false">
            <circle cx="50" cy="50" r="48" fill="#14181a" />
            <circle cx="50" cy="50" r="43" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.4" />
            <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.4" />
            <circle cx="50" cy="50" r="29" fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1.4" />
            <circle cx="50" cy="50" r="18" fill="#67B971" />
            <circle cx="50" cy="50" r="3.4" fill="#14181a" />
            <path d="M50 32a18 18 0 0 1 12.7 5.3" stroke="rgba(255,255,255,0.55)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          </svg>
        </span>
        {isMuted ? (
          <span className="music-player__muted-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M4 15V9h3l4-3v12l-4-3H4z" fill="currentColor" />
              <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
        ) : null}
      </button>

      {/* Visible without opening the panel: the browser blocked audible autoplay. */}
      {needsInteraction && !isOpen ? (
        <p className="music-player__hint" role="status">
          Klik di mana-mana pada skrin untuk membunyikan muzik.
        </p>
      ) : null}

      {isOpen ? (
        <div
          ref={panelRef}
          id={panelId}
          className="music-player__panel"
          role="group"
          aria-label="Tetapan muzik"
        >
          <p className="music-player__panel-title">Muzik Latar</p>

          <fieldset className="music-player__tracks">
            <legend className="visually-hidden">Pilih muzik latar</legend>
            {MUSIC_TRACKS.map((track) => (
              <label
                key={track.id}
                className={`music-player__track ${trackId === track.id ? 'is-selected' : ''}`}
              >
                <input
                  type="radio"
                  name="music-track"
                  value={track.id}
                  checked={trackId === track.id}
                  onChange={() => selectTrack(track.id)}
                />
                <span className="music-player__track-text">
                  <span className="music-player__track-label">{track.label}</span>
                  <span className="music-player__track-description">{track.description}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <button
            type="button"
            className="music-player__mute-toggle"
            onClick={toggleMute}
            aria-pressed={isMuted}
          >
            {isMuted ? 'Bunyikan muzik' : 'Senyapkan muzik'}
          </button>

          <p className="music-player__status" role="status">
            {needsInteraction
              ? 'Klik di mana-mana pada skrin untuk membunyikan muzik.'
              : stateLabel}
          </p>
        </div>
      ) : null}
    </div>
  );
}

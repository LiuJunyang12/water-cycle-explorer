import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CAMP_GUIDING_QUESTIONS,
  CAMP_MEDIA,
  CAMP_MEDIA_NOUN,
  CAMP_MEDIA_VERB,
  REQUIRED_WATCH_RATIO,
} from '../data/campStation';
import './CampStationPage.css';

interface CampStationPageProps {
  isAlreadyCompleted: boolean;
  onComplete: () => void;
  onBackToMap: () => void;
}

/**
 * Station 1 — play the introduction media to the end.
 *
 * Completion is based on how much of the media was actually played (seeking
 * forward does not count), not on a click. The three guiding questions appear
 * only when it finishes; they are prompts for thought, not questions to answer.
 */
export function CampStationPage({
  isAlreadyCompleted,
  onComplete,
  onBackToMap,
}: CampStationPageProps) {
  const [isCompleted, setIsCompleted] = useState(isAlreadyCompleted);
  const [watchedRatio, setWatchedRatio] = useState(isAlreadyCompleted ? 1 : 0);
  const [hasMediaError, setHasMediaError] = useState(false);

  const lastTimeRef = useRef(0);
  const watchedSecondsRef = useRef(0);
  const completionSentRef = useRef(isAlreadyCompleted);

  // The background music stays off for the whole video station: it is paused on
  // entry and only restored when the pupil leaves this page.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('wce:pause-music'));
    return () => {
      window.dispatchEvent(new CustomEvent('wce:resume-music'));
    };
  }, []);

  const finishStation = useCallback(() => {
    if (completionSentRef.current) return;
    completionSentRef.current = true;
    setIsCompleted(true);
    setWatchedRatio(1);
    onComplete();
  }, [onComplete]);

  const handleTimeUpdate = (event: React.SyntheticEvent<HTMLMediaElement>) => {
    const media = event.currentTarget;
    const duration = media.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;

    const delta = media.currentTime - lastTimeRef.current;
    lastTimeRef.current = media.currentTime;

    // Ignore rewinds and forward jumps: a seek must not count as watching.
    if (delta <= 0 || delta > 1.5) return;

    watchedSecondsRef.current = Math.min(duration, watchedSecondsRef.current + delta);
    const ratio = watchedSecondsRef.current / duration;
    setWatchedRatio((previous) => (ratio > previous ? ratio : previous));

    if (ratio >= REQUIRED_WATCH_RATIO) finishStation();
  };

  const handleSeeking = (event: React.SyntheticEvent<HTMLMediaElement>) => {
    lastTimeRef.current = event.currentTarget.currentTime;
  };

  const handleEnded = (event: React.SyntheticEvent<HTMLMediaElement>) => {
    window.dispatchEvent(new CustomEvent('wce:resume-music'));
    const duration = event.currentTarget.duration;
    if (Number.isFinite(duration) && duration > 0) {
      const coverage = watchedSecondsRef.current / duration;
      if (coverage >= REQUIRED_WATCH_RATIO * 0.95) finishStation();
    }
  };

  const mediaHandlers = {
    onTimeUpdate: handleTimeUpdate,
    onSeeking: handleSeeking,
    onEnded: handleEnded,
    onPlay: () => window.dispatchEvent(new CustomEvent('wce:pause-music')),
    onError: () => setHasMediaError(true),
  };

  const statusLabel = hasMediaError
    ? `Rakaman ${CAMP_MEDIA_NOUN} belum disediakan.`
    : `${CAMP_MEDIA_VERB} ${CAMP_MEDIA_NOUN} hingga tamat — ${Math.round(watchedRatio * 100)}%`;

  return (
    <main className="camp-page">
      <header className="camp-page__header">
        <p className="camp-page__eyebrow">STESEN 1</p>
        <h1 className="camp-page__title">Khemah</h1>
        <p className="camp-page__subtitle">
          {CAMP_MEDIA_VERB === 'Tonton'
            ? 'Tonton video ini hingga tamat untuk membuka stesen seterusnya.'
            : 'Dengar rakaman ini hingga tamat untuk membuka stesen seterusnya.'}
        </p>
      </header>

      <section className="camp-page__video-wrap" aria-label="Bahan pengenalan kitaran air">
        {hasMediaError ? (
          <div className="camp-page__video-missing" role="alert">
            <p className="camp-page__video-missing-title">Rakaman belum disediakan</p>
            <p>
              Fail untuk stesen ini belum dimasukkan ke dalam projek. Stesen ini tidak boleh
              diselesaikan sehingga fail tersedia.
            </p>
          </div>
        ) : CAMP_MEDIA.kind === 'video' ? (
          <video
            className="camp-page__video"
            src={CAMP_MEDIA.src}
            controls
            playsInline
            preload="metadata"
            aria-describedby="camp-media-description"
            {...mediaHandlers}
          />
        ) : (
          <div className="camp-page__audio-frame">
            {CAMP_MEDIA.poster ? (
              <img
                className="camp-page__audio-poster"
                src={CAMP_MEDIA.poster}
                alt={CAMP_MEDIA.posterAlt ?? ''}
              />
            ) : null}
            <audio
              className="camp-page__audio"
              src={CAMP_MEDIA.src}
              controls
              preload="metadata"
              aria-describedby="camp-media-description"
              {...mediaHandlers}
            />
          </div>
        )}
        <p id="camp-media-description" className="camp-page__video-description">
          Rakaman pengenalan tentang kitaran air semula jadi.
        </p>
      </section>

      <div className="camp-page__progress" role="group" aria-label="Kemajuan menonton">
        <div
          className="camp-page__progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(watchedRatio * 100)}
          aria-label="Peratus rakaman yang telah dimainkan"
        >
          <span
            className="camp-page__progress-fill"
            style={{ width: `${Math.round(watchedRatio * 100)}%` }}
          />
        </div>
        <p className="camp-page__status" role="status">
          {isCompleted ? 'Rakaman telah dimainkan sepenuhnya.' : statusLabel}
        </p>
      </div>

      {isCompleted ? (
        <>
          <section className="camp-questions" aria-label="Soalan panduan">
            <h2 className="camp-questions__heading">Soalan Panduan</h2>
            <ul className="camp-questions__list">
              {CAMP_GUIDING_QUESTIONS.map((question, index) => (
                <li
                  key={question.id}
                  className={`camp-question camp-question--${index % 2 === 0 ? 'left' : 'right'}`}
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  <p className="camp-question__text">{question.text}</p>
                </li>
              ))}
            </ul>
            <p className="camp-questions__note">
              Soalan ini hanya untuk difikirkan — tidak perlu dijawab di sini.
            </p>
          </section>

          <button type="button" className="button-primary camp-page__continue" onClick={onBackToMap}>
            Teruskan ke Peta
          </button>
        </>
      ) : null}

      <button
        type="button"
        className="camp-page__back glass-surface"
        onClick={onBackToMap}
        aria-label="Kembali ke Peta"
        title="Kembali ke Peta"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
          <path
            d="M9 5 4 7.5v11L9 16l6 2.5 5-2.5v-11L15 8 9 5.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M9 5.5v11M15 8v10.5" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>
    </main>
  );
}

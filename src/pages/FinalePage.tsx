import { useEffect, useMemo, useRef, useState } from 'react';
import { CertificateCard } from '../components/certificate/CertificateCard';
import { BackToMapButton } from '../components/common/BackToMapButton';
import { WALLY_SPRITES } from '../data/cloudKingdomAssets';
import {
  FINALE_TEXT,
  normaliseScientistName,
  readStoredScientistName,
  storeScientistName,
} from '../data/finale';
import { buildQuizReport, sendReport, type QuizRun, type ReportDelivery } from '../data/reporting';
import type { StationCompletion } from '../data/stations';
import { downloadCertificate } from '../utils/certificateDownload';
import './FinalePage.css';

type FinalePhase = 'walking' | 'talking' | 'certificate';

interface FinalePageProps {
  /** The graded station-6 run; absent when the ceremony is opened directly. */
  run?: QuizRun | null;
  /** Stations the pupil finished before the ceremony, with their timestamps. */
  completions?: readonly StationCompletion[];
  onBackToMap: () => void;
}

const WALK_IN_MS = 2600;

export function FinalePage({ run = null, completions = [], onBackToMap }: FinalePageProps) {
  const [phase, setPhase] = useState<FinalePhase>('walking');
  const [lineIndex, setLineIndex] = useState(0);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState(() => readStoredScientistName());
  const [nameError, setNameError] = useState('');
  const [name, setName] = useState(() => readStoredScientistName());
  const [wallyFailed, setWallyFailed] = useState(false);
  const [downloadState, setDownloadState] = useState<'idle' | 'working' | 'error'>('idle');
  const [reportState, setReportState] = useState<ReportDelivery | 'sending' | 'idle'>('idle');
  const reportSentRef = useRef(false);
  const certificateRef = useRef<SVGSVGElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  // Wally strolls in from the left, then starts talking.
  useEffect(() => {
    if (phase !== 'walking') {
      return;
    }
    const timer = window.setTimeout(() => setPhase('talking'), WALK_IN_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (isNameDialogOpen) {
      nameInputRef.current?.focus();
    }
  }, [isNameDialogOpen]);

  const isLastLine = lineIndex === FINALE_TEXT.lines.length - 1;
  const printedName = useMemo(() => (name ? normaliseScientistName(name) : ''), [name]);

  const handleNext = () => {
    if (isLastLine) {
      setIsNameDialogOpen(true);
      return;
    }
    setLineIndex((index) => Math.min(index + 1, FINALE_TEXT.lines.length - 1));
  };

  const handleConfirmName = () => {
    const clean = normaliseScientistName(nameDraft);
    if (!clean) {
      setNameError(FINALE_TEXT.emptyName);
      return;
    }
    setNameError('');
    setName(clean);
    storeScientistName(clean);
    setIsNameDialogOpen(false);
    setPhase('certificate');

    // One report per certificate: the teacher sees a single row per student run.
    if (run && !reportSentRef.current) {
      reportSentRef.current = true;
      setReportState('sending');
      void sendReport(buildQuizReport(run, clean, completions)).then(setReportState);
    }
  };

  const handleDownload = async () => {
    if (!certificateRef.current) {
      return;
    }
    setDownloadState('working');
    try {
      await downloadCertificate(certificateRef.current, printedName || 'saintis-air');
      setDownloadState('idle');
    } catch {
      setDownloadState('error');
    }
  };

  return (
    <main className="finale-page">
      <BackToMapButton onClick={onBackToMap} />

      <header className="finale-page__header">
        <p className="finale-page__eyebrow">{FINALE_TEXT.eyebrow}</p>
        <h1 className="finale-page__title">{FINALE_TEXT.title}</h1>
        <p className="finale-page__subtitle">{FINALE_TEXT.subtitle}</p>
      </header>

      <section className={`finale-stage finale-stage--${phase}`} data-testid="finale-stage">
        <div className="finale-stage__lights" aria-hidden="true" />
        <div className="finale-stage__confetti" aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => (
            <span
              key={index}
              className="finale-stage__confetti-dot"
              style={{
                left: `${(index * 37) % 100}%`,
                animationDelay: `${(index % 9) * 0.42}s`,
                animationDuration: `${5.2 + (index % 5) * 0.7}s`,
              }}
            />
          ))}
        </div>

        {phase !== 'certificate' ? (
          <div className="finale-wally">
            <div className="finale-wally__figure">
              {wallyFailed ? (
                <div className="finale-wally__fallback" aria-hidden="true">
                  <span className="finale-wally__eye" />
                  <span className="finale-wally__eye" />
                  <span className="finale-wally__smile" />
                </div>
              ) : (
                <img
                  className="finale-wally__sprite"
                  src={WALLY_SPRITES.stand}
                  alt=""
                  data-testid="finale-wally"
                  onError={() => setWallyFailed(true)}
                />
              )}
            </div>

            <div className="finale-bubble" role="status" aria-live="polite">
              <p className="finale-bubble__name">{FINALE_TEXT.wallyName}</p>
              <p className="finale-bubble__text" key={lineIndex}>
                {FINALE_TEXT.lines[lineIndex]}
              </p>
              <div className="finale-bubble__actions">
                {isLastLine ? (
                  <button type="button" className="button-primary" onClick={handleNext}>
                    {FINALE_TEXT.accept}
                  </button>
                ) : (
                  <button type="button" className="button-quiet" onClick={handleNext}>
                    Teruskan
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {phase === 'certificate' ? (
          <div className="finale-certificate" data-testid="finale-certificate">
            <p className="finale-certificate__note">{FINALE_TEXT.revealNote}</p>
            <div className="finale-certificate__paper">
              <CertificateCard name={printedName} svgRef={certificateRef} />
            </div>
            <div className="finale-certificate__actions">
              <button
                type="button"
                className="button-primary"
                onClick={handleDownload}
                disabled={downloadState === 'working'}
              >
                {downloadState === 'working' ? 'Menyediakan…' : FINALE_TEXT.download}
              </button>
              <button type="button" className="button-quiet" onClick={() => window.print()}>
                {FINALE_TEXT.print}
              </button>
              <button type="button" className="button-quiet" onClick={onBackToMap}>
                {FINALE_TEXT.backToMap}
              </button>
            </div>
            {downloadState === 'error' ? (
              <p className="finale-certificate__error" role="alert">
                Sijil tidak dapat dimuat turun. Cuba guna butang cetak sebagai ganti.
              </p>
            ) : null}
            {reportState === 'sent' || reportState === 'queued' ? (
              <p className="finale-certificate__report" role="status">
                {reportState === 'sent' ? FINALE_TEXT.reportSent : FINALE_TEXT.reportQueued}
              </p>
            ) : null}
            <p className="finale-certificate__hint">{FINALE_TEXT.savedNote}</p>
          </div>
        ) : null}
      </section>

      {isNameDialogOpen ? (
        <div className="finale-overlay" role="dialog" aria-modal="true" aria-label={FINALE_TEXT.nameTitle}>
          <div className="finale-name-card">
            <h2 className="finale-name-card__title">{FINALE_TEXT.nameTitle}</h2>
            <p className="finale-name-card__note">{FINALE_TEXT.nameNote}</p>
            <label className="finale-name-card__label" htmlFor="finale-name">
              {FINALE_TEXT.nameLabel}
            </label>
            <input
              id="finale-name"
              ref={nameInputRef}
              className="finale-name-card__input"
              value={nameDraft}
              maxLength={40}
              placeholder={FINALE_TEXT.namePlaceholder}
              autoComplete="name"
              onChange={(event) => {
                setNameDraft(event.target.value);
                setNameError('');
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleConfirmName();
                }
              }}
            />
            {nameError ? (
              <p className="finale-name-card__error" role="alert">
                {nameError}
              </p>
            ) : null}
            <div className="finale-name-card__actions">
              <button type="button" className="button-primary" onClick={handleConfirmName}>
                {FINALE_TEXT.nameConfirm}
              </button>
              <button
                type="button"
                className="button-quiet"
                onClick={() => {
                  setIsNameDialogOpen(false);
                  setNameError('');
                }}
              >
                {FINALE_TEXT.nameCancel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

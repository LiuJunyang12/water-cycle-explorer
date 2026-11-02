import { useState } from 'react';
import { Modal } from '../common/Modal';
import {
  FEEDBACK_FORM_URL,
  FEEDBACK_QR_IMAGE,
  FEEDBACK_TEXT,
  isFeedbackFormReady,
} from '../../data/feedback';
import './FeedbackDialog.css';

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Overridable so the dialog can be previewed and tested with a real link. */
  formUrl?: string;
  qrImage?: string;
}

/**
 * Menu entry "MAKLUM BALAS": a QR code plus a button that opens the Google Form
 * in a new tab. If the project owner has not pasted the form link yet, the
 * dialog says so instead of offering a button that leads nowhere.
 */
export function FeedbackDialog({
  isOpen,
  onClose,
  formUrl = FEEDBACK_FORM_URL,
  qrImage = FEEDBACK_QR_IMAGE,
}: FeedbackDialogProps) {
  const [qrFailed, setQrFailed] = useState(false);
  const isReady = isFeedbackFormReady(formUrl);

  return (
    <Modal isOpen={isOpen} title={FEEDBACK_TEXT.title} onClose={onClose} variant="wide">
      <p className="info-description">{FEEDBACK_TEXT.intro}</p>

      <div className="feedback-qr">
        {qrFailed ? (
          <p className="feedback-qr__placeholder" role="img" aria-label={FEEDBACK_TEXT.qrAlt}>
            {FEEDBACK_TEXT.pendingQr}
          </p>
        ) : (
          <img
            className="feedback-qr__image"
            src={qrImage}
            alt={FEEDBACK_TEXT.qrAlt}
            data-testid="feedback-qr"
            onError={() => setQrFailed(true)}
          />
        )}
        <p className="feedback-qr__hint">{FEEDBACK_TEXT.qrLabel}</p>
      </div>

      {isReady ? (
        <a
          className="info-download feedback-open"
          href={formUrl}
          target="_blank"
          rel="noreferrer"
        >
          {FEEDBACK_TEXT.openButton}
        </a>
      ) : (
        <button type="button" className="info-download" disabled>
          {FEEDBACK_TEXT.pendingForm}
        </button>
      )}

      <ol className="feedback-steps">
        {FEEDBACK_TEXT.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <p className="info-note">{FEEDBACK_TEXT.note}</p>
    </Modal>
  );
}

import { Modal } from '../common/Modal';
import { OFFLINE_EBOOK, OBJECTIVES, STUDENT_PROFILE } from '../../data/homeContent';
import './InfoDialogs.css';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Student profile — skeleton until the project owner supplies the real data. */
export function StudentProfileDialog({ isOpen, onClose }: DialogProps) {
  return (
    <Modal isOpen={isOpen} title={STUDENT_PROFILE.title} onClose={onClose}>
      <div className="info-profile">
        <figure className="info-photo">
          {STUDENT_PROFILE.photoUrl ? (
            <img
              className="info-photo__image"
              src={STUDENT_PROFILE.photoUrl}
              alt={STUDENT_PROFILE.photoAlt}
            />
          ) : (
            <span className="info-photo__placeholder" aria-hidden="true">
              Foto
            </span>
          )}
        </figure>

        <dl className="info-list">
          {STUDENT_PROFILE.fields.map((field) => (
            <div className="info-list__row" key={field.label}>
              <dt className="info-list__label">{field.label}</dt>
              <dd className="info-list__value">{field.value ?? '—'}</dd>
            </div>
          ))}
        </dl>
      </div>
      {/* The pending note only makes sense while some detail is still missing. */}
      {STUDENT_PROFILE.fields.some((field) => field.value === null) ? (
        <p className="info-note">{STUDENT_PROFILE.pendingNote}</p>
      ) : null}
    </Modal>
  );
}

/** Offline e-book — elongated rounded dialog with the download slot. */
export function OfflineEbookDialog({ isOpen, onClose }: DialogProps) {
  const isAvailable = Boolean(OFFLINE_EBOOK.fileUrl);

  return (
    <Modal isOpen={isOpen} title={OFFLINE_EBOOK.title} onClose={onClose} variant="wide">
      <p className="info-description">{OFFLINE_EBOOK.description}</p>

      {isAvailable ? (
        <div className="info-actions">
          <a
            className="info-download"
            href={OFFLINE_EBOOK.fileUrl ?? undefined}
            download={OFFLINE_EBOOK.fileName ?? undefined}
          >
            Muat Turun {OFFLINE_EBOOK.fileName}
          </a>
          <a
            className="info-download info-download--ghost"
            href={OFFLINE_EBOOK.fileUrl ?? undefined}
            target="_blank"
            rel="noreferrer"
          >
            Baca dalam talian
          </a>
        </div>
      ) : (
        <button type="button" className="info-download" disabled>
          Muat Turun (belum tersedia)
        </button>
      )}

      {isAvailable && OFFLINE_EBOOK.meta ? (
        <p className="info-note">{OFFLINE_EBOOK.meta}</p>
      ) : null}
      {!isAvailable ? <p className="info-note">{OFFLINE_EBOOK.pendingNote}</p> : null}
    </Modal>
  );
}

/** RPH objectives. Falls back to a pending note only if none were supplied. */
export function ObjectivesDialog({ isOpen, onClose }: DialogProps) {
  return (
    <Modal isOpen={isOpen} title={OBJECTIVES.title} onClose={onClose}>
      {OBJECTIVES.items.length > 0 ? (
        <>
          <p className="info-description">{OBJECTIVES.intro}</p>
          <ol className="info-objectives">
            {OBJECTIVES.items.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ol>
        </>
      ) : (
        <p className="info-note">{OBJECTIVES.pendingNote}</p>
      )}
    </Modal>
  );
}

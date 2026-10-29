import { useEffect, useId, useRef, type ReactNode } from 'react';
import { CloseIcon } from './CloseIcon';
import './Modal.css';

export type ModalVariant = 'default' | 'wide';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** `wide` renders the elongated rounded dialog used by the e-book panel. */
  variant?: ModalVariant;
}

/**
 * Accessible dialog: labelled by its title, closes on Escape and backdrop click,
 * moves focus in on open and returns it to the trigger on close.
 */
export function Modal({ isOpen, title, onClose, children, variant = 'default' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal__backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        className={`modal__dialog modal__dialog--${variant}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="modal__header">
          <h2 id={titleId} className="modal__title">
            {title}
          </h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Tutup">
            <CloseIcon />
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}

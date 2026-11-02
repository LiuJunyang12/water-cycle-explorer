import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { FeedbackDialog } from './FeedbackDialog';
import { FEEDBACK_TEXT } from '../../data/feedback';

const REAL_FORM = 'https://forms.gle/abc123XYZ';

function renderDialog(props: Partial<Parameters<typeof FeedbackDialog>[0]> = {}) {
  return render(
    <FeedbackDialog isOpen onClose={vi.fn()} formUrl={REAL_FORM} {...props} />,
  );
}

describe('FeedbackDialog', () => {
  test('shows the QR code with a description and the scanning hint', () => {
    renderDialog();

    const qr = screen.getByTestId('feedback-qr');
    expect(qr.getAttribute('src')).toContain('assets/images/feedback/qr-code.png');
    expect(qr.getAttribute('alt')).toBe(FEEDBACK_TEXT.qrAlt);
    expect(screen.getByText(FEEDBACK_TEXT.qrLabel)).toBeTruthy();
  });

  test('falls back to an honest placeholder when the QR image is missing', () => {
    renderDialog();

    fireEvent.error(screen.getByTestId('feedback-qr'));

    expect(screen.queryByTestId('feedback-qr')).toBeNull();
    expect(screen.getByText(FEEDBACK_TEXT.pendingQr)).toBeTruthy();
  });

  test('opens the real form in a new tab', () => {
    renderDialog();

    const link = screen.getByRole('link', { name: FEEDBACK_TEXT.openButton });
    expect(link.getAttribute('href')).toBe(REAL_FORM);
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noreferrer');
  });

  test('does not pretend to work while the link is still a placeholder', () => {
    renderDialog({ formUrl: 'https://forms.gle/GANTI-DENGAN-PAUTAN-ANDA' });

    expect(screen.queryByRole('link')).toBeNull();
    const pending = screen.getByRole('button', { name: FEEDBACK_TEXT.pendingForm });
    expect((pending as HTMLButtonElement).disabled).toBe(true);
  });

  test('lists the three steps and the privacy note', () => {
    renderDialog();

    FEEDBACK_TEXT.steps.forEach((step) => expect(screen.getByText(step)).toBeTruthy());
    expect(screen.getByText(FEEDBACK_TEXT.note)).toBeTruthy();
  });

  test('stays closed until the menu asks for it', () => {
    render(<FeedbackDialog isOpen={false} onClose={vi.fn()} />);

    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

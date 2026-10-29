import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { CERTIFICATE_TEXT } from '../../data/finale';
import { CertificateCard } from './CertificateCard';

describe('CertificateCard', () => {
  test('prints the student name, award and every earned badge', () => {
    render(<CertificateCard name="Liu Jun Yang" date={new Date(2026, 9, 29)} />);

    expect(screen.getByTestId('certificate-name')).toHaveTextContent('Liu Jun Yang');
    expect(screen.getByText(CERTIFICATE_TEXT.heading)).toBeInTheDocument();
    expect(screen.getByText(CERTIFICATE_TEXT.subheading)).toBeInTheDocument();
    expect(screen.getByText(CERTIFICATE_TEXT.award)).toBeInTheDocument();
    for (const badge of CERTIFICATE_TEXT.badges) {
      expect(screen.getByText(badge.label)).toBeInTheDocument();
      expect(screen.getByText(badge.english)).toBeInTheDocument();
    }
    // Malay date, no dependency on the browser locale.
    expect(screen.getByText(`${CERTIFICATE_TEXT.dateLabel}: 29 Oktober 2026`)).toBeInTheDocument();
  });

  test('falls back to a generic scientist name when the field is blank', () => {
    render(<CertificateCard name="" />);
    expect(screen.getByTestId('certificate-name')).toHaveTextContent(CERTIFICATE_TEXT.nameFallback);
  });

  test('describes itself for screen readers', () => {
    render(<CertificateCard name="Nur Aisyah" />);
    expect(screen.getByRole('img', { name: /Nur Aisyah/ })).toBeInTheDocument();
  });

  test('wraps the long award sentence instead of overflowing the frame', () => {
    const { container } = render(<CertificateCard name="Nur Aisyah" />);
    const texts = Array.from(container.querySelectorAll('text')).map((node) => node.textContent ?? '');
    const bodyLines = texts.filter((line) => CERTIFICATE_TEXT.body.includes(line.trim()) && line.trim().length > 20);
    expect(bodyLines.length).toBeGreaterThan(1);
    for (const line of bodyLines) {
      expect(line.length).toBeLessThanOrEqual(74);
    }
  });
});

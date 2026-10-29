import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { FINALE_TEXT, SCIENTIST_NAME_STORAGE_KEY } from '../data/finale';
import { sendReport, type QuizRun } from '../data/reporting';
import { downloadCertificate } from '../utils/certificateDownload';
import { FinalePage } from './FinalePage';

vi.mock('../utils/certificateDownload', () => ({
  downloadCertificate: vi.fn().mockResolvedValue(undefined),
  certificateFileName: (name: string) => `sijil-${name}.png`,
}));

vi.mock('../data/reporting', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../data/reporting')>();
  return { ...actual, sendReport: vi.fn(async () => 'sent' as const) };
});

type Props = ComponentProps<typeof FinalePage>;

const WALK_IN_MS = 2600;

function renderPage(overrides: Partial<Props> = {}) {
  const onBackToMap = vi.fn();
  const utils = render(<FinalePage onBackToMap={onBackToMap} {...overrides} />);
  return { ...utils, onBackToMap };
}

/** Skips the walk-in and walks through every dialogue line. */
function talkToTheEnd() {
  act(() => {
    vi.advanceTimersByTime(WALK_IN_MS);
  });
  for (let line = 1; line < FINALE_TEXT.lines.length; line += 1) {
    fireEvent.click(screen.getByRole('button', { name: 'Teruskan' }));
  }
}

function typeName(value: string) {
  fireEvent.change(screen.getByLabelText(FINALE_TEXT.nameLabel), { target: { value } });
}

describe('FinalePage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
    vi.mocked(downloadCertificate).mockClear();
    vi.mocked(sendReport).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
  });

  test('Wally walks in first, then greets the new scientist', () => {
    const { container } = renderPage();

    expect(container.querySelector('.finale-stage--walking')).not.toBeNull();
    expect(screen.getByTestId('finale-wally')).toBeInTheDocument();
    expect(screen.getByText(FINALE_TEXT.lines[0])).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(WALK_IN_MS);
    });

    expect(container.querySelector('.finale-stage--talking')).not.toBeNull();
    expect(screen.getByText(FINALE_TEXT.lines[0])).toBeInTheDocument();
  });

  test('the dialogue advances line by line and ends with the certificate offer', () => {
    renderPage();
    talkToTheEnd();

    expect(screen.getByText(FINALE_TEXT.lines[FINALE_TEXT.lines.length - 1])).toBeInTheDocument();
    expect(screen.getByRole('button', { name: FINALE_TEXT.accept })).toBeInTheDocument();
  });

  test('accepting the offer opens the name dialog', () => {
    renderPage();
    talkToTheEnd();
    fireEvent.click(screen.getByRole('button', { name: FINALE_TEXT.accept }));

    const dialog = screen.getByRole('dialog', { name: FINALE_TEXT.nameTitle });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByLabelText(FINALE_TEXT.nameLabel)).toHaveFocus();
  });

  test('an empty name is refused with a hint', () => {
    renderPage();
    talkToTheEnd();
    fireEvent.click(screen.getByRole('button', { name: FINALE_TEXT.accept }));
    fireEvent.click(screen.getByRole('button', { name: FINALE_TEXT.nameConfirm }));

    expect(screen.getByRole('alert')).toHaveTextContent(FINALE_TEXT.emptyName);
    expect(screen.getByRole('dialog', { name: FINALE_TEXT.nameTitle })).toBeInTheDocument();
    expect(screen.queryByTestId('finale-certificate')).toBeNull();
  });

  test('the typed name is printed on the certificate and remembered', () => {
    const { container } = renderPage();
    talkToTheEnd();
    fireEvent.click(screen.getByRole('button', { name: FINALE_TEXT.accept }));
    typeName('  Nur   Aisyah  ');
    fireEvent.click(screen.getByRole('button', { name: FINALE_TEXT.nameConfirm }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByTestId('finale-certificate')).toBeInTheDocument();
    expect(screen.getByTestId('certificate-name')).toHaveTextContent('Nur Aisyah');
    expect(container.querySelector('.certificate')).not.toBeNull();
    expect(window.localStorage.getItem(SCIENTIST_NAME_STORAGE_KEY)).toBe('Nur Aisyah');
  });

  test('the download button hands the certificate svg to the downloader', async () => {
    renderPage();
    talkToTheEnd();
    fireEvent.click(screen.getByRole('button', { name: FINALE_TEXT.accept }));
    typeName('Liu Jun Yang');
    fireEvent.click(screen.getByRole('button', { name: FINALE_TEXT.nameConfirm }));

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: FINALE_TEXT.download }));
    });

    expect(downloadCertificate).toHaveBeenCalledTimes(1);
    const [svg, name] = vi.mocked(downloadCertificate).mock.calls[0];
    expect(svg).toBe(screen.getByTestId('certificate'));
    expect(name).toBe('Liu Jun Yang');
  });

  test('a name saved on this device is offered again next time', () => {
    window.localStorage.setItem(SCIENTIST_NAME_STORAGE_KEY, 'Siti Aminah');
    renderPage();
    talkToTheEnd();
    fireEvent.click(screen.getByRole('button', { name: FINALE_TEXT.accept }));

    expect(screen.getByLabelText(FINALE_TEXT.nameLabel)).toHaveValue('Siti Aminah');
    fireEvent.click(screen.getByRole('button', { name: FINALE_TEXT.nameConfirm }));

    expect(screen.getByTestId('certificate-name')).toHaveTextContent('Siti Aminah');
  });

  const demoRun: QuizRun = {
    startedAt: '2026-10-29T08:00:00.000Z',
    finishedAt: '2026-10-29T08:05:00.000Z',
    picks: [0, 1, 2, 3, 0, 1, 2, 3],
    score: 7,
    total: 8,
    passMark: 7,
    stars: 2,
    passed: true,
  };

  test('sends one report to the teacher once the name is confirmed', async () => {
    renderPage({ run: demoRun });
    talkToTheEnd();
    fireEvent.click(screen.getByRole('button', { name: FINALE_TEXT.accept }));
    typeName('  Nur   Aisyah  ');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: FINALE_TEXT.nameConfirm }));
    });

    expect(sendReport).toHaveBeenCalledTimes(1);
    const [report] = vi.mocked(sendReport).mock.calls[0];
    expect(report.studentName).toBe('Nur Aisyah');
    expect(report.score).toBe(7);
    expect(report.answers).toHaveLength(8);
  });

  test('tells the student when the report only made it to the device', async () => {
    vi.mocked(sendReport).mockResolvedValueOnce('queued');
    renderPage({ run: demoRun });
    talkToTheEnd();
    fireEvent.click(screen.getByRole('button', { name: FINALE_TEXT.accept }));
    typeName('Bala');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: FINALE_TEXT.nameConfirm }));
    });

    expect(screen.getByRole('status')).toHaveTextContent(FINALE_TEXT.reportQueued);
  });

  test('does not report anything when the ceremony has no quiz run', async () => {
    renderPage();
    talkToTheEnd();
    fireEvent.click(screen.getByRole('button', { name: FINALE_TEXT.accept }));
    typeName('Bala');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: FINALE_TEXT.nameConfirm }));
    });

    expect(sendReport).not.toHaveBeenCalled();
  });
  test('the header button returns to the map', () => {
    const { onBackToMap } = renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Kembali ke peta' }));

    expect(onBackToMap).toHaveBeenCalledTimes(1);
  });
});

import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { CampStationPage } from './CampStationPage';

interface MediaHarness {
  media: HTMLMediaElement;
  setTime: (seconds: number) => void;
}

function getMedia(container: HTMLElement, duration = 10): MediaHarness {
  const media = container.querySelector<HTMLMediaElement>('audio, video');
  if (!media) throw new Error('media element not rendered');

  let time = 0;
  Object.defineProperty(media, 'duration', { configurable: true, value: duration });
  Object.defineProperty(media, 'currentTime', {
    configurable: true,
    get: () => time,
    set: (value: number) => {
      time = value;
    },
  });

  return {
    media,
    setTime: (seconds) => {
      time = seconds;
    },
  };
}

function renderCamp(isAlreadyCompleted = false) {
  const onComplete = vi.fn();
  const onBackToMap = vi.fn();
  const utils = render(
    <CampStationPage
      isAlreadyCompleted={isAlreadyCompleted}
      onComplete={onComplete}
      onBackToMap={onBackToMap}
    />,
  );
  return { ...utils, onComplete, onBackToMap };
}

describe('CampStationPage', () => {
  test('hides the guiding questions before the media is played', () => {
    renderCamp();

    expect(screen.queryByText('Soalan Panduan')).not.toBeInTheDocument();
    expect(screen.queryByText(/Dari manakah datangnya hujan/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Teruskan ke Peta' })).not.toBeInTheDocument();
  });

  test('playing the media to the end completes the station and reveals the questions', () => {
    const { container, onComplete } = renderCamp();
    const { media, setTime } = getMedia(container);

    for (let seconds = 0.5; seconds <= 10; seconds += 0.5) {
      setTime(seconds);
      fireEvent.timeUpdate(media);
    }

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Soalan Panduan')).toBeInTheDocument();
    expect(screen.getByText('Dari manakah datangnya hujan?')).toBeInTheDocument();
    expect(screen.getByText('Ke manakah air pergi selepas hujan turun?')).toBeInTheDocument();
    expect(screen.getByText('Bagaimanakah air kembali ke atmosfera?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Teruskan ke Peta' })).toBeInTheDocument();
  });

  test('stops just short of the end: 99% is not enough', () => {
    const { container, onComplete } = renderCamp();
    const { media, setTime } = getMedia(container);

    for (let seconds = 0.5; seconds < 10; seconds += 0.5) {
      setTime(seconds);
      fireEvent.timeUpdate(media);
    }
    // 9.5 / 10 seconds played: one short step remains.
    setTime(9.9);
    fireEvent.timeUpdate(media);

    expect(onComplete).not.toHaveBeenCalled();
    expect(screen.queryByText('Soalan Panduan')).not.toBeInTheDocument();

    setTime(10);
    fireEvent.timeUpdate(media);

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Soalan Panduan')).toBeInTheDocument();
  });
  test('jumping forward with the scrubber does not count as watching', () => {
    const { container, onComplete } = renderCamp();
    const { media, setTime } = getMedia(container);

    // A single large jump must be ignored (delta guard).
    setTime(9);
    fireEvent.timeUpdate(media);

    expect(onComplete).not.toHaveBeenCalled();
    expect(screen.queryByText('Soalan Panduan')).not.toBeInTheDocument();
    expect(screen.getByText(/hingga tamat — 0%/)).toBeInTheDocument();
  });

  test('reports the played percentage honestly', () => {
    const { container } = renderCamp();
    const { media, setTime } = getMedia(container);

    // Each step must be a real playback step (<= 1.5s), so walk the timeline.
    setTime(1);
    fireEvent.timeUpdate(media);
    setTime(2);
    fireEvent.timeUpdate(media);
    setTime(2.5);
    fireEvent.timeUpdate(media);

    expect(screen.getByText(/hingga tamat — 25%/)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
  });

  test('states plainly when the media file is missing', () => {
    const { container } = renderCamp();
    const { media } = getMedia(container);

    fireEvent.error(media);

    expect(screen.getByRole('alert')).toHaveTextContent('Rakaman belum disediakan');
    expect(screen.queryByRole('button', { name: 'Teruskan ke Peta' })).not.toBeInTheDocument();
  });

  test('a previously completed station shows the questions immediately', () => {
    renderCamp(true);

    expect(screen.getByText('Soalan Panduan')).toBeInTheDocument();
    expect(screen.getByText('Rakaman telah dimainkan sepenuhnya.')).toBeInTheDocument();
  });

  test('turns the background music off while the station is open', () => {
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    renderCamp();

    const dispatched = dispatchSpy.mock.calls.map(([event]) => (event as Event).type);
    expect(dispatched).toContain('wce:pause-music');
    expect(dispatched).not.toContain('wce:resume-music');

    dispatchSpy.mockRestore();
  });

  test('the back button returns to the map', async () => {
    const user = userEvent.setup();
    const { onBackToMap } = renderCamp();

    await user.click(screen.getByRole('button', { name: 'Kembali ke Peta' }));

    expect(onBackToMap).toHaveBeenCalledTimes(1);
  });
});

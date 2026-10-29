import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { RAIN_GAME, RAIN_NARRATION, RAIN_TEXT } from '../game/rainGather';
import { WaterfallValleyPage } from './WaterfallValleyPage';

function renderPage(isAlreadyCompleted = false) {
  const onComplete = vi.fn();
  const onBackToMap = vi.fn();
  const utils = render(
    <WaterfallValleyPage
      isAlreadyCompleted={isAlreadyCompleted}
      onComplete={onComplete}
      onBackToMap={onBackToMap}
    />,
  );
  return { ...utils, onComplete, onBackToMap };
}

/** Clicks one droplet after the other; each click re-renders the scene. */
function gatherEveryDroplet() {
  for (let remaining = RAIN_GAME.dropletCount; remaining > 0; remaining -= 1) {
    const droplets = screen.getAllByTestId('rain-droplet');
    expect(droplets).toHaveLength(remaining);
    act(() => {
      fireEvent.click(droplets[0]);
    });
  }
}

function advanceNarration(steps: number) {
  for (let step = 0; step < steps; step += 1) {
    act(() => {
      vi.advanceTimersByTime(RAIN_GAME.narrationStepMs);
    });
  }
}

describe('WaterfallValleyPage — station 4', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('starts with every droplet floating and an empty cloud', () => {
    const { container } = renderPage();

    expect(screen.getByRole('heading', { name: RAIN_TEXT.title })).toBeInTheDocument();
    expect(container.querySelector('.rain-page__mission')).toHaveTextContent(RAIN_TEXT.mission);
    expect(container.querySelectorAll('.rain-droplet')).toHaveLength(RAIN_GAME.dropletCount);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getAllByText(`0/${RAIN_GAME.dropletCount}`)).toHaveLength(2);
    expect(screen.getByText('Wally')).toBeInTheDocument();
    const back = screen.getByRole('button', { name: 'Kembali ke peta' });
    expect(back).toBeInTheDocument();
    expect(back).toHaveClass('back-to-map');
  });

  test('Wally stands inside the valley instead of a side panel', () => {
    const { container } = renderPage();

    const stage = container.querySelector('.rain-page__stage');
    expect(stage).not.toBeNull();
    expect(stage?.querySelector('.rain-wally')).not.toBeNull();
    expect(stage?.querySelector('.rain-hud')).not.toBeNull();
    expect(container.querySelector('.rain-panel')).toBeNull();
    expect(container.querySelector('[role="complementary"]')).toBeNull();
  });

  test('Wally artwork falls back from the station pose to the shared pose to CSS', () => {
    const { container } = renderPage();

    const first = container.querySelector('.rain-wally__img');
    expect(first?.getAttribute('src')).toContain('waterfall-valley/wally.png');

    fireEvent.error(first as Element);
    const second = container.querySelector('.rain-wally__img');
    expect(second?.getAttribute('src')).toContain('cloud-kingdom/wally-stand.png');

    fireEvent.error(second as Element);
    expect(container.querySelector('.rain-wally__img')).toBeNull();
    expect(container.querySelector('.rain-wally__fallback')).not.toBeNull();
  });

  test('the narration step is shown in the compact HUD', () => {
    const { container } = renderPage();

    gatherEveryDroplet();
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: RAIN_TEXT.answerYes }));
    });

    expect(container.querySelector('.rain-hud__value')).toHaveTextContent(
      `1/${RAIN_NARRATION.length}`,
    );
    expect(container.querySelector('.rain-wally')).toHaveClass('rain-wally--narration');

    advanceNarration(1);
    expect(container.querySelector('.rain-hud__value')).toHaveTextContent(
      `2/${RAIN_NARRATION.length}`,
    );
  });

  test('each merged droplet advances the real progress', () => {
    const { container } = renderPage();

    act(() => {
      fireEvent.click(screen.getAllByTestId('rain-droplet')[0]);
    });

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
    expect(container.querySelector('.rain-hud__value')).toHaveTextContent(
      `1/${RAIN_GAME.dropletCount}`,
    );
    expect(screen.getAllByTestId('rain-droplet')).toHaveLength(RAIN_GAME.dropletCount - 1);
    expect(screen.getByTestId('rain-collector')).toHaveTextContent(
      `1/${RAIN_GAME.dropletCount}`,
    );
  });

  test('asks the rain question only when every droplet has merged', () => {
    const { onComplete } = renderPage();

    gatherEveryDroplet();

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent(RAIN_TEXT.question);
    expect(screen.getByRole('button', { name: RAIN_TEXT.answerYes })).toBeInTheDocument();
    expect(screen.queryAllByTestId('rain-droplet')).toHaveLength(0);
    expect(onComplete).not.toHaveBeenCalled();
  });

  test('saying yes starts the rain and Wally explains what happens', () => {
    const { container } = renderPage();

    gatherEveryDroplet();
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: RAIN_TEXT.answerYes }));
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('rain-falling').length).toBeGreaterThan(0);
    expect(container.querySelector('.rain-scene')).toHaveAttribute('data-phase', 'raining');
    expect(screen.getAllByText(RAIN_NARRATION[0]).length).toBeGreaterThan(0);

    advanceNarration(1);
    expect(screen.getAllByText(RAIN_NARRATION[1]).length).toBeGreaterThan(0);
  });

  test('finishes only after the whole narration, then reports the station once', () => {
    const { container, onComplete } = renderPage();

    gatherEveryDroplet();
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: RAIN_TEXT.answerYes }));
    });

    expect(onComplete).not.toHaveBeenCalled();
    expect(screen.queryByText(RAIN_TEXT.finishedTitle)).not.toBeInTheDocument();

    advanceNarration(RAIN_NARRATION.length);

    expect(screen.getByText(RAIN_TEXT.finishedTitle)).toBeInTheDocument();
    expect(container.querySelector('.rain-scene')).toHaveAttribute('data-phase', 'finished');
    expect(onComplete).toHaveBeenCalledTimes(1);

    // Extra time never reports the station twice.
    advanceNarration(3);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  test('"Main lagi" resets the sky without re-reporting the station', () => {
    const { onComplete } = renderPage();

    gatherEveryDroplet();
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: RAIN_TEXT.answerYes }));
    });
    advanceNarration(RAIN_NARRATION.length);

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: RAIN_TEXT.playAgain }));
    });

    expect(screen.getAllByTestId('rain-droplet')).toHaveLength(RAIN_GAME.dropletCount);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.queryByText(RAIN_TEXT.finishedTitle)).not.toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  test('a station that was already completed is not reported again', () => {
    const { onComplete } = renderPage(true);

    gatherEveryDroplet();
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: RAIN_TEXT.answerYes }));
    });
    advanceNarration(RAIN_NARRATION.length);

    expect(screen.getByText(RAIN_TEXT.finishedTitle)).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();
  });

  test('the back button returns to the map at any time', () => {
    const { onBackToMap } = renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Kembali ke peta' }));

    expect(onBackToMap).toHaveBeenCalledTimes(1);
  });
});

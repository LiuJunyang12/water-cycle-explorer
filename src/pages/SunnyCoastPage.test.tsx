import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { DROPLET_SPOTS, SUN_GAME } from '../game/sunChase';
import { SunnyCoastPage } from './SunnyCoastPage';

function renderGame(isAlreadyCompleted = false) {
  const onComplete = vi.fn();
  const onBackToMap = vi.fn();
  const utils = render(
    <SunnyCoastPage
      isAlreadyCompleted={isAlreadyCompleted}
      onComplete={onComplete}
      onBackToMap={onBackToMap}
    />,
  );
  return { ...utils, onComplete, onBackToMap };
}

function moveSunTo(value: number) {
  const slider = screen.getByLabelText('Kedudukan matahari') as HTMLInputElement;
  act(() => {
    fireEvent.change(slider, { target: { value: String(value) } });
  });
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe('SunnyCoastPage — Penangkap Cahaya Matahari', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('shows the level, ten droplets and an empty progress bar', () => {
    const { container } = renderGame();

    expect(
      screen.getByRole('heading', { name: 'PENANGKAP CAHAYA MATAHARI' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Misi: Gerakkan matahari supaya semua titisan air menyejat!'),
    ).toBeInTheDocument();
    expect(container.querySelectorAll('.chase-droplet')).toHaveLength(SUN_GAME.dropletCount);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByLabelText('Kedudukan matahari')).toBeInTheDocument();
  });

  test('the Sun can be moved and its position is exposed to assistive tech', () => {
    renderGame();

    moveSunTo(30);

    expect(screen.getByRole('slider', { name: 'Sumber cahaya matahari' })).toHaveAttribute(
      'aria-valuenow',
      '30',
    );
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  test('each droplet renders the supplied droplet artwork inside its energy ring', () => {
    const { container } = renderGame();

    const images = container.querySelectorAll('.chase-droplet__image');
    expect(images).toHaveLength(SUN_GAME.dropletCount);
    images.forEach((image) => {
      expect(image.getAttribute('src')).toContain('droplet.png');
    });
  });

  test('a droplet under the sunlight evaporates over time and is counted', () => {
    const { container } = renderGame();
    const first = DROPLET_SPOTS[0];

    moveSunTo(first.x);
    advance(2500);

    expect(container.querySelectorAll('.chase-droplet')).toHaveLength(SUN_GAME.dropletCount - 1);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  });

  test('a droplet far from the sunlight keeps its energy at zero', () => {
    const { container } = renderGame();

    // Keep the sunlight patch on the far right; droplets on the left stay cold.
    moveSunTo(96);
    advance(2500);

    const untouched = Array.from(container.querySelectorAll('.chase-droplet')).some(
      (element) => (element as HTMLElement).style.getPropertyValue('--energy') === '0',
    );
    expect(untouched).toBe(true);
    expect(Number(screen.getByRole('progressbar').getAttribute('aria-valuenow'))).toBeLessThan(
      SUN_GAME.dropletCount,
    );
  });

  test('evaporating every droplet completes the level and records progress once', () => {
    const { onComplete } = renderGame();

    for (const spot of DROPLET_SPOTS) {
      moveSunTo(spot.x);
      advance(2500);
    }

    const dialog = screen.getByRole('dialog', { name: 'Tahap selesai' });
    expect(dialog).toBeInTheDocument();
    expect(
      within(dialog).getByText('Semua titisan air telah menyejat!'),
    ).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledTimes(1);

    // "Main lagi" restarts the level without recording progress twice.
    fireEvent.click(screen.getByRole('button', { name: 'Main lagi' }));
    expect(screen.queryByRole('dialog', { name: 'Tahap selesai' })).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  test('dragging directly on the Sun moves it (regression)', () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      width: 400,
      height: 300,
      top: 0,
      left: 0,
      right: 400,
      bottom: 300,
      toJSON: () => ({}),
    } as DOMRect);

    renderGame();

    const sun = screen.getByRole('slider', { name: 'Sumber cahaya matahari' });
    act(() => {
      fireEvent.pointerDown(sun, { clientX: 100, pointerId: 1 });
    });

    expect(sun).toHaveAttribute('aria-valuenow', '25');
  });

  test('the red level inside a droplet rises as it stores energy', () => {
    const { container } = renderGame();

    moveSunTo(DROPLET_SPOTS[0].x);
    advance(1000);

    const fills = Array.from(
      container.querySelectorAll<HTMLElement>('.chase-droplet__fill'),
    );
    const clipValues = fills.map((fill) => fill.style.clipPath);
    // Energy has grown, so at least one droplet is partly filled with red.
    expect(clipValues.some((value) => /inset\((4\d|5\d)%/.test(value))).toBe(true);
  });

  test('a wisp rises and disappears after a droplet evaporates', () => {
    const { container } = renderGame();

    moveSunTo(DROPLET_SPOTS[0].x);
    advance(2100);
    expect(container.querySelectorAll('.chase-puff').length).toBeGreaterThan(0);

    // Move the sunlight away and wait for the wisp to fade out.
    moveSunTo(4);
    advance(3000);
    expect(container.querySelectorAll('.chase-puff')).toHaveLength(0);
  });

  test('the back button returns to the map', () => {
    const { onBackToMap } = renderGame();

    fireEvent.click(screen.getByRole('button', { name: 'Kembali ke peta' }));

    expect(onBackToMap).toHaveBeenCalledTimes(1);
  });
});

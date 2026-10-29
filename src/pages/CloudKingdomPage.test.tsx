import { act, fireEvent, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { CloudKingdomPage } from './CloudKingdomPage';

function renderPage(isAlreadyCompleted = false) {
  const onComplete = vi.fn();
  const onBackToMap = vi.fn();
  const utils = render(
    <CloudKingdomPage
      isAlreadyCompleted={isAlreadyCompleted}
      onComplete={onComplete}
      onBackToMap={onBackToMap}
    />,
  );
  return { ...utils, onComplete, onBackToMap };
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function wallyLeft(): number {
  const wally = screen.getByTestId('wally');
  return Number.parseFloat(wally.style.left);
}

function wallyTop(): number {
  const wally = screen.getByTestId('wally');
  return Number.parseFloat(wally.style.top);
}

describe('CloudKingdomPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test('starts on level 1 with the vapour counter, controls and scene', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'MISSION TO CLOUD KINGDOM' })).toBeInTheDocument();
    expect(screen.getByText('Vapour Voyage — Kumpul 5 penanda wap air dan sampai ke pintu keluar.')).toBeInTheDocument();
    expect(screen.getByText(/Wap Air:/)).toBeInTheDocument();
    expect(screen.getByTestId('quest-scene')).toBeInTheDocument();
    // The playfield is wrapped in the 16:9 stage, so it can never be stretched.
    expect(screen.getByTestId('quest-scene').parentElement).toHaveClass('quest-stage');
    expect(screen.getByRole('button', { name: 'Gerak ke kiri' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gerak ke kanan' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lompat' })).toBeInTheDocument();
  });

  test('the right and left buttons really move Wally', () => {
    renderPage();
    const start = wallyLeft();

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Gerak ke kanan' }));
    advance(600);
    fireEvent.pointerUp(screen.getByRole('button', { name: 'Gerak ke kanan' }));

    const afterRight = wallyLeft();
    expect(afterRight).toBeGreaterThan(start);

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Gerak ke kiri' }));
    advance(400);
    fireEvent.pointerUp(screen.getByRole('button', { name: 'Gerak ke kiri' }));

    expect(wallyLeft()).toBeLessThan(afterRight);
  });

  test('the jump button lifts Wally off the platform', () => {
    renderPage();
    advance(400); // let Wally land first
    const groundTop = wallyTop();

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Lompat' }));
    advance(150);

    expect(wallyTop()).toBeLessThan(groundTop);
  });

  test('jumping still works under StrictMode (regression: queued jump was swallowed)', () => {
    render(
      <StrictMode>
        <CloudKingdomPage
          isAlreadyCompleted={false}
          onComplete={() => {}}
          onBackToMap={() => {}}
        />
      </StrictMode>,
    );

    advance(400);
    const groundTop = wallyTop();

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Lompat' }));
    advance(150);

    expect(wallyTop()).toBeLessThan(groundTop);
  });

  test('the space bar also jumps', () => {
    renderPage();
    advance(400);
    const groundTop = wallyTop();

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    });
    advance(150);

    expect(wallyTop()).toBeLessThan(groundTop);
  });

  test('keyboard control works as well', () => {
    renderPage();
    const start = wallyLeft();

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    });
    advance(500);
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }));
    });

    expect(wallyLeft()).toBeGreaterThan(start);
  });

  test('restart resets the level and the counters', () => {
    renderPage();
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Gerak ke kanan' }));
    advance(800);
    fireEvent.pointerUp(screen.getByRole('button', { name: 'Gerak ke kanan' }));

    fireEvent.click(screen.getByRole('button', { name: 'Mula semula' }));

    expect(screen.getByText('Cubaan semula: 0')).toBeInTheDocument();
    expect(screen.getByText(/Wap Air:/)).toHaveTextContent('0');
  });

  test('the back button returns to the map', () => {
    const { onBackToMap } = renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Kembali ke peta' }));

    expect(onBackToMap).toHaveBeenCalledTimes(1);
  });

  test('the game loop stops when Wally is not playing (no runaway timers)', () => {
    renderPage();
    advance(300);
    const before = wallyLeft();

    // Unmounting must clear the interval; a later timer tick changes nothing.
    const { unmount } = render(
      <CloudKingdomPage
        isAlreadyCompleted={false}
        onComplete={() => {}}
        onBackToMap={() => {}}
      />,
    );
    unmount();

    expect(wallyLeft()).toBe(before);
  });
});

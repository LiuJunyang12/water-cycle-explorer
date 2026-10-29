import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CloudKingdomPage } from '../pages/CloudKingdomPage';
import { COOLING_QUIZ } from '../game/cloudQuest/levels';

/**
 * Forces the exit of every level so the phase machine can be observed without
 * walking the whole level.
 */
vi.mock('../game/cloudQuest/physics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../game/cloudQuest/physics')>();
  return {
    ...actual,
    stepWorld: (
      state: Parameters<typeof actual.stepWorld>[0],
      level: Parameters<typeof actual.stepWorld>[1],
      input: Parameters<typeof actual.stepWorld>[2],
      elapsedMs: Parameters<typeof actual.stepWorld>[3],
      extra?: Parameters<typeof actual.stepWorld>[4],
    ) => {
      const next = actual.stepWorld(state, level, input, elapsedMs, extra);
      return elapsedMs > 300 ? { ...next, reachedExit: true } : next;
    },
  };
});

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe('CloudKingdomPage phase machine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs quiz, then ordering, then forming before level 3 starts', () => {
    render(<CloudKingdomPage isAlreadyCompleted={false} onComplete={() => {}} onBackToMap={() => {}} />);

    advance(400);
    advance(400);

    expect(screen.getByText(/TAHAP 2\/3/)).not.toBeNull();
    expect(screen.getByText(COOLING_QUIZ.question)).not.toBeNull();

    const answer = COOLING_QUIZ.options.find((option) => option.id === COOLING_QUIZ.correctId);
    expect(answer).toBeDefined();
    fireEvent.click(screen.getByText(answer!.text));
    fireEvent.click(screen.getByText('Teruskan ke jambatan awan'));

    expect(screen.getByText('Bagaimana awan terbentuk?')).not.toBeNull();

    fireEvent.click(screen.getByText('Air cecair menyejat dan wap air masuk ke udara.'));
    fireEvent.click(screen.getByRole('button', { name: 'Naik' }));
    fireEvent.click(screen.getByText('Udara lembap yang mengandungi wap air naik dan menyejuk.'));
    fireEvent.click(screen.getByRole('button', { name: 'Naik' }));
    fireEvent.click(screen.getByRole('button', { name: 'Naik' }));
    fireEvent.click(screen.getByRole('button', { name: 'Semak jawapan' }));

    expect(screen.getByText(/Jambatan awan sedang terbentuk/)).not.toBeNull();

    advance(1800);
    expect(screen.getByText(/TAHAP 3\/3/)).not.toBeNull();
  });
});
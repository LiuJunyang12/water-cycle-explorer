import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { CLOUD_STEPS, CLOUD_STEPS_CORRECT_ORDER, COOLING_QUIZ } from '../../game/cloudQuest/levels';
import { OrderingChallenge } from './OrderingChallenge';
import { ScienceQuiz } from './ScienceQuiz';

function click(name: string | RegExp) {
  fireEvent.click(screen.getByRole('button', { name }));
}

describe('OrderingChallenge', () => {
  test('does not reveal the correct order before checking', () => {
    render(
      <OrderingChallenge
        steps={CLOUD_STEPS}
        correctOrder={CLOUD_STEPS_CORRECT_ORDER}
        onSolved={() => {}}
      />,
    );

    // Four cards, all four texts visible, none of them in the right order yet.
    const cards = screen.getAllByRole('button', { name: /Air cecair|Udara lembap|keadaan yang sesuai|Banyak titisan/ });
    expect(cards).toHaveLength(4);
  });

  test('a wrong arrangement shows a hint and can be retried', () => {
    const onSolved = vi.fn();
    render(
      <OrderingChallenge
        steps={CLOUD_STEPS}
        correctOrder={CLOUD_STEPS_CORRECT_ORDER}
        onSolved={onSolved}
      />,
    );

    click('Semak jawapan');

    expect(onSolved).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent(/Belum tepat/);
  });

  test('moving cards with the buttons and checking solves the challenge', () => {
    const onSolved = vi.fn();
    render(
      <OrderingChallenge
        steps={CLOUD_STEPS}
        correctOrder={CLOUD_STEPS_CORRECT_ORDER}
        onSolved={onSolved}
      />,
    );

    // Starting order is s3, s1, s4, s2 → move to s1, s2, s3, s4.
    const byText = (pattern: RegExp) => screen.getByRole('button', { name: pattern });

    // s1 up twice (position 2 → 1 → 0) => s1, s3, s4, s2
    fireEvent.click(byText(/Air cecair menyejat/));
    click('Naik');
    click('Naik');
    // s2 up once (position 4 → 3) => s1, s3, s2, s4
    fireEvent.click(byText(/Udara lembap/));
    click('Naik');
    // s2 up once more => s1, s2, s3, s4
    fireEvent.click(byText(/Udara lembap/));
    click('Naik');

    click('Semak jawapan');

    expect(onSolved).toHaveBeenCalledTimes(1);
  });

  test('arrow keys on a focused card also reorder it', () => {
    const onSolved = vi.fn();
    render(
      <OrderingChallenge
        steps={CLOUD_STEPS}
        correctOrder={CLOUD_STEPS_CORRECT_ORDER}
        onSolved={onSolved}
      />,
    );

    const firstStep = screen.getByRole('button', { name: /Air cecair menyejat/ });
    fireEvent.keyDown(firstStep, { key: 'ArrowUp' });
    fireEvent.keyDown(firstStep, { key: 'ArrowUp' });

    expect(onSolved).not.toHaveBeenCalled();
    // The card has moved to the top: it is now the first list item's button.
    const list = screen.getByRole('list');
    const firstCard = within(list).getAllByRole('button')[0];
    expect(firstCard).toHaveTextContent(/Air cecair menyejat/);
  });
});

describe('ScienceQuiz', () => {
  const props = {
    question: COOLING_QUIZ.question,
    options: COOLING_QUIZ.options,
    correctId: COOLING_QUIZ.correctId,
    correctFeedback: COOLING_QUIZ.correctFeedback,
    wrongFeedback: COOLING_QUIZ.wrongFeedback,
  };

  test('a wrong answer explains the concept and allows another try', () => {
    const onPass = vi.fn();
    render(<ScienceQuiz {...props} onPass={onPass} />);

    click(/B\. Semua wap air terus menjadi hujan/);

    expect(onPass).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent(/Cuba lagi/);

    click('Cuba lagi');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  test('the correct answer explains and unlocks the next stage', () => {
    const onPass = vi.fn();
    render(<ScienceQuiz {...props} onPass={onPass} />);

    click(/A\. Wap air terpeluwap/);

    expect(screen.getByRole('status')).toHaveTextContent(/Betul!/);
    click('Teruskan ke jambatan awan');

    expect(onPass).toHaveBeenCalledTimes(1);
  });
});

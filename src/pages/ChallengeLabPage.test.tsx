import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { QUESTION_COUNT, QUIZ_QUESTIONS, QUIZ_TEXT } from '../game/quizLab';
import { ChallengeLabPage } from './ChallengeLabPage';

type Props = ComponentProps<typeof ChallengeLabPage>;

function renderPage(overrides: Partial<Props> = {}) {
  const onComplete = vi.fn();
  const onBackToMap = vi.fn();
  const onGoToFinale = vi.fn();
  const utils = render(
    <ChallengeLabPage
      isAlreadyCompleted={false}
      onComplete={onComplete}
      onBackToMap={onBackToMap}
      onGoToFinale={onGoToFinale}
      {...overrides}
    />,
  );
  return { ...utils, onComplete, onBackToMap, onGoToFinale };
}

/** The visible answer buttons in order. */
function options() {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('.lab-option'));
}

/** Question number shown in the progress pill, e.g. "3 / 8". */
function progressLabel() {
  return document.querySelector('.lab-progress__count')?.textContent ?? '';
}

function nextButtonName() {
  return progressLabel().startsWith(`${QUESTION_COUNT} /`) ? QUIZ_TEXT.finish : QUIZ_TEXT.next;
}

function answer(questionIndex: number, optionIndex: number) {
  fireEvent.click(screen.getByRole('button', { name: QUIZ_QUESTIONS[questionIndex].options[optionIndex] }));
  fireEvent.click(screen.getByRole('button', { name: nextButtonName() }));
}

/** Run the whole quiz, right or wrong depending on `correct`. */
function playThrough(correct: boolean) {
  for (let index = 0; index < QUESTION_COUNT; index += 1) {
    const answerIndex = QUIZ_QUESTIONS[index].answerIndex;
    const pick = correct ? answerIndex : (answerIndex + 1) % 4;
    answer(index, pick);
  }
}

describe('ChallengeLabPage', () => {
  test('asks the first question with Wally and four answers', () => {
    const { container } = renderPage();
    const first = QUIZ_QUESTIONS[0];

    expect(screen.getByRole('heading', { name: new RegExp(QUIZ_TEXT.title) })).toBeInTheDocument();
    expect(screen.getByText(first.prompt)).toBeInTheDocument();
    expect(screen.getByText('Wally')).toBeInTheDocument();
    expect(options()).toHaveLength(4);
    expect(progressLabel()).toContain(`1 / ${QUESTION_COUNT}`);
    expect(screen.getByText(new RegExp(QUIZ_TEXT.hint))).toBeInTheDocument();
    expect(container.querySelectorAll('.lab-progress__dot')).toHaveLength(QUESTION_COUNT);
    expect(screen.getByTestId('lab-wally')).toHaveAttribute('src', expect.stringContaining('wally-stand.png'));
  });

  test('tells the pupil the right answer when the pick is wrong', () => {
    renderPage();
    const first = QUIZ_QUESTIONS[0];
    const wrongPick = (first.answerIndex + 1) % 4;

    fireEvent.click(screen.getByRole('button', { name: first.options[wrongPick] }));

    const feedback = screen.getByTestId('lab-feedback');
    expect(feedback).toHaveTextContent('Hampir betul');
    expect(feedback).toHaveTextContent(first.options[first.answerIndex]);
    expect(feedback).toHaveTextContent(first.explanation);

    const buttons = options();
    expect(buttons[wrongPick].className).toContain('lab-option--wrong');
    expect(buttons[first.answerIndex].className).toContain('lab-option--right');
    expect(buttons.every((button) => button.disabled)).toBe(true);
  });

  test('celebrates a correct pick and shows the explanation', () => {
    renderPage();
    const first = QUIZ_QUESTIONS[0];

    fireEvent.click(screen.getByRole('button', { name: first.options[first.answerIndex] }));

    const feedback = screen.getByTestId('lab-feedback');
    expect(feedback).toHaveTextContent('Betul!');
    expect(feedback).toHaveTextContent(first.explanation);
    expect(options()[first.answerIndex].className).toContain('lab-option--right');
    expect(options()[first.answerIndex].querySelector('.lab-option__mark')).not.toBeNull();
  });

  test('keeps the first pick when another option is pressed afterwards', () => {
    renderPage();
    const first = QUIZ_QUESTIONS[0];
    const wrongPick = (first.answerIndex + 1) % 4;

    fireEvent.click(screen.getByRole('button', { name: first.options[wrongPick] }));
    fireEvent.click(screen.getByRole('button', { name: first.options[first.answerIndex] }));

    expect(screen.getByTestId('lab-feedback')).toHaveTextContent('Hampir betul');
    expect(options()[wrongPick].className).toContain('lab-option--wrong');
  });

  test('moves to the next question and keeps the droplet progress in step', () => {
    renderPage();
    answer(0, QUIZ_QUESTIONS[0].answerIndex);

    expect(progressLabel()).toContain(`2 / ${QUESTION_COUNT}`);
    expect(screen.getByText(QUIZ_QUESTIONS[1].prompt)).toBeInTheDocument();
    expect(document.querySelectorAll('.lab-progress__dot--right')).toHaveLength(1);
  });

  test('finishes with a result card and reports the station once', () => {
    const { onComplete } = renderPage();

    playThrough(true);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(QUIZ_TEXT.finishedTitle)).toBeInTheDocument();
    expect(dialog.querySelector('.lab-result__score')?.textContent).toContain(`8 / ${QUESTION_COUNT}`);
    expect(dialog.querySelector('.lab-result__stars')).toHaveAttribute('aria-label', '3 bintang');
    expect(screen.getByText(QUIZ_TEXT.passedNote)).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  test('finishes without the badge when the first tries fall short', () => {
    const { onComplete } = renderPage();

    playThrough(false);

    expect(screen.getByText(QUIZ_TEXT.failedNote)).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  test('starts over from the first question when the pupil retries', () => {
    renderPage();
    playThrough(true);

    fireEvent.click(screen.getByRole('button', { name: QUIZ_TEXT.restart }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(progressLabel()).toContain(`1 / ${QUESTION_COUNT}`);
    expect(screen.getByText(QUIZ_QUESTIONS[0].prompt)).toBeInTheDocument();
  });

  test('hands the graduate over to the award ceremony instead of the map', () => {
    const { onGoToFinale, onBackToMap } = renderPage();

    playThrough(true);
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: QUIZ_TEXT.toFinale }));

    expect(onGoToFinale).toHaveBeenCalledTimes(1);
    // The ceremony needs the graded run, not just a navigation signal.
    const run = onGoToFinale.mock.calls[0][0];
    expect(run).toMatchObject({
      score: QUESTION_COUNT,
      total: QUESTION_COUNT,
      passMark: 7,
      passed: true,
      stars: 3,
    });
    expect(run.picks).toHaveLength(QUESTION_COUNT);
    expect(Date.parse(run.finishedAt)).toBeGreaterThanOrEqual(Date.parse(run.startedAt));
    // The result card no longer offers a second, wordy way back to the map.
    expect(within(dialog).queryByRole('button', { name: QUIZ_TEXT.backToMap })).toBeNull();
    expect(onBackToMap).not.toHaveBeenCalled();
  });
  test('returns to the map from the header button', () => {
    const { onBackToMap } = renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Kembali ke peta' }));

    expect(onBackToMap).toHaveBeenCalledTimes(1);
  });

  test('does not re-report the station when it was already completed', () => {
    const { onComplete } = renderPage({ isAlreadyCompleted: true });

    playThrough(true);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();
  });
});

describe('ChallengeLabPage artwork', () => {
  test('keeps the built-in drawing until the hand-drawn picture has loaded', () => {
    renderPage();

    expect(document.querySelector('.lab-art')).not.toBeNull();
    const image = screen.getByTestId('lab-art-img');
    expect(image.getAttribute('src')).toContain('challenge-lab/soalan-1.jpg');
    expect(image.className).not.toContain('lab-art__img--ready');
  });

  test('shows only the hand-drawn picture once it has loaded', () => {
    renderPage();

    fireEvent.load(screen.getByTestId('lab-art-img'));

    const image = screen.getByTestId('lab-art-img');
    expect(image.className).toContain('lab-art__img--ready');
    // The built-in SVG scene and the emoji badge step aside, so nothing blue
    // shows behind the real picture.
    expect(document.querySelector('.lab-art')).toBeNull();
    expect(document.querySelector('.lab-card__emoji')).toBeNull();
    expect(document.querySelector('.lab-card__art')?.className).toContain(
      'lab-card__art--photo',
    );
  });

  test('tries the png copy before falling back to the built-in drawing', () => {
    renderPage();

    fireEvent.error(screen.getByTestId('lab-art-img'));

    const second = screen.getByTestId('lab-art-img');
    expect(second.getAttribute('src')).toContain('challenge-lab/soalan-1.png');
    expect(document.querySelector('.lab-art')).not.toBeNull();

    fireEvent.error(second);

    expect(screen.queryByTestId('lab-art-img')).toBeNull();
    expect(document.querySelector('.lab-art')).not.toBeNull();
  });

  test('each question asks for its own picture', () => {
    renderPage();

    for (let index = 0; index < QUESTION_COUNT; index += 1) {
      expect(screen.getByTestId('lab-art-img').getAttribute('src')).toContain(
        `soalan-${index + 1}.jpg`,
      );
      answer(index, QUIZ_QUESTIONS[index].answerIndex);
    }
  });
});
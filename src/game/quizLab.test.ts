import { describe, expect, test } from 'vitest';
import {
  PASS_MARK,
  QUESTION_COUNT,
  QUIZ_FACTS,
  QUIZ_QUESTIONS,
  chooseOption,
  createQuiz,
  currentPick,
  currentQuestion,
  isAnswered,
  isCorrect,
  nextQuestion,
  passed,
  restartQuiz,
  score,
  starsFor,
} from './quizLab';

/** Answer the current question with the right option, then move on. */
function answerCorrectly(state = createQuiz(), howMany = QUESTION_COUNT) {
  let next = state;
  for (let step = 0; step < howMany; step += 1) {
    next = chooseOption(next, currentQuestion(next).answerIndex);
    next = nextQuestion(next);
  }
  return next;
}

describe('quiz content', () => {
  test('has eight questions with four answers each', () => {
    expect(QUESTION_COUNT).toBe(8);
    expect(QUIZ_QUESTIONS).toHaveLength(8);

    for (const question of QUIZ_QUESTIONS) {
      expect(question.options).toHaveLength(4);
      expect(question.prompt.length).toBeGreaterThan(10);
      expect(question.explanation.length).toBeGreaterThan(10);
      expect(question.answerIndex).toBeGreaterThanOrEqual(0);
      expect(question.answerIndex).toBeLessThan(4);
    }
  });

  test('never repeats an option inside one question', () => {
    for (const question of QUIZ_QUESTIONS) {
      expect(new Set(question.options).size).toBe(4);
    }
  });

  test('keeps the correct answer away from a single position', () => {
    const positions = new Set(QUIZ_QUESTIONS.map((question) => question.answerIndex));
    expect(positions.size).toBeGreaterThanOrEqual(3);
  });

  test('question ids are unique', () => {
    expect(new Set(QUIZ_QUESTIONS.map((question) => question.id)).size).toBe(QUESTION_COUNT);
  });

  test('respects the science red lines', () => {
    const facts = QUIZ_FACTS.join(' ');
    expect(facts).toMatch(/tidak kelihatan/i);
    expect(facts).toMatch(/Matahari/i);

    // No question may claim that water vapour can be seen as white smoke.
    for (const question of QUIZ_QUESTIONS) {
      const correct = question.options[question.answerIndex];
      expect(correct).not.toMatch(/wap air berwarna putih/i);
      expect(correct).not.toMatch(/wap air kelihatan/i);
    }
  });
});

describe('quiz flow', () => {
  test('starts on the first question with nothing answered', () => {
    const state = createQuiz();

    expect(state.index).toBe(0);
    expect(state.phase).toBe('playing');
    expect(currentQuestion(state).id).toBe(QUIZ_QUESTIONS[0].id);
    expect(currentPick(state)).toBeNull();
    expect(isAnswered(state)).toBe(false);
  });

  test('choosing an option locks the answer', () => {
    const first = chooseOption(createQuiz(), 2);
    expect(currentPick(first)).toBe(2);
    expect(isAnswered(first)).toBe(true);

    // A second press cannot change the recorded answer.
    const second = chooseOption(first, 0);
    expect(currentPick(second)).toBe(2);
  });

  test('ignores out-of-range options and moves', () => {
    const state = createQuiz();
    expect(chooseOption(state, 9)).toBe(state);
    expect(chooseOption(state, -1)).toBe(state);
  });

  test('cannot advance before answering', () => {
    const state = createQuiz();
    expect(nextQuestion(state)).toBe(state);
  });

  test('walks through every question and finishes', () => {
    const finished = answerCorrectly();

    expect(finished.phase).toBe('finished');
    expect(score(finished)).toBe(QUESTION_COUNT);
    expect(passed(finished)).toBe(true);
    expect(nextQuestion(finished)).toBe(finished);
  });

  test('scores only first attempts', () => {
    let state = createQuiz();
    // Question 1 answered correctly.
    state = chooseOption(state, currentQuestion(state).answerIndex);
    state = nextQuestion(state);
    // Question 2 answered wrongly.
    const wrongPick = (currentQuestion(state).answerIndex + 1) % 4;
    state = chooseOption(state, wrongPick);
    state = nextQuestion(state);

    expect(score(state)).toBe(1);
  });

  test('pass mark is 80% of the questions', () => {
    expect(PASS_MARK).toBe(Math.ceil(QUESTION_COUNT * 0.8));

    const perfect = answerCorrectly(createQuiz(), QUESTION_COUNT);
    expect(passed(perfect)).toBe(true);

    const failing = answerCorrectly(createQuiz(), QUESTION_COUNT - PASS_MARK);
    expect(score(failing)).toBeLessThan(PASS_MARK);
    expect(passed(failing)).toBe(false);
  });

  test('awards stars by score', () => {
    const perfect = answerCorrectly();
    expect(starsFor(perfect)).toBe(3);

    let state = createQuiz();
    const wrongIndex = (currentQuestion(state).answerIndex + 1) % 4;
    state = chooseOption(state, wrongIndex);
    const startedAndMissed = nextQuestion(state);
    expect(starsFor(startedAndMissed)).toBe(0);
  });

  test('restart clears every answer', () => {
    const restarted = restartQuiz();
    expect(restarted).toEqual(createQuiz());
    expect(score(restarted)).toBe(0);
    expect(restarted.phase).toBe('playing');
  });

  test('knows whether the visible pick is correct', () => {
    const correct = chooseOption(createQuiz(), currentQuestion(createQuiz()).answerIndex);
    expect(isCorrect(correct)).toBe(true);

    const wrong = chooseOption(createQuiz(), (currentQuestion(createQuiz()).answerIndex + 2) % 4);
    expect(isCorrect(wrong)).toBe(false);
  });
});

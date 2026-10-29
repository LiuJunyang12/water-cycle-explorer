import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildQuizReport,
  clearReportQueue,
  createReportId,
  flushReportQueue,
  gradeAnswers,
  queueReport,
  readReportQueue,
  runFromQuizState,
  sendReport,
  type QuizRun,
} from './reporting';
import { createQuiz, chooseOption, nextQuestion, type QuizState } from '../game/quizLab';
import { QUIZ_QUESTIONS } from '../game/quizLab';

const ENDPOINT = 'https://script.google.com/macros/s/test/exec';

/** Plays the whole quiz, picking `correct` or a deliberately wrong option. */
function playQuiz(correct: boolean): QuizState {
  let quiz = createQuiz();
  for (let index = 0; index < QUIZ_QUESTIONS.length; index += 1) {
    const answer = QUIZ_QUESTIONS[index].answerIndex;
    quiz = chooseOption(quiz, correct ? answer : (answer + 1) % 4);
    quiz = nextQuestion(quiz);
  }
  return quiz;
}

function makeRun(overrides: Partial<QuizRun> = {}): QuizRun {
  return {
    startedAt: '2026-10-29T08:00:00.000Z',
    finishedAt: '2026-10-29T08:04:00.000Z',
    picks: QUIZ_QUESTIONS.map((question) => question.answerIndex),
    score: 8,
    total: 8,
    passMark: 7,
    stars: 3,
    passed: true,
    ...overrides,
  };
}

describe('grading', () => {
  it('turns raw picks into readable answers', () => {
    const answers = gradeAnswers([0, 1, 2, 3, null, null, null, null]);

    expect(answers).toHaveLength(QUIZ_QUESTIONS.length);
    expect(answers[0]).toMatchObject({
      id: QUIZ_QUESTIONS[0].id,
      picked: 0,
      pickedLabel: 'A',
      isCorrect: QUIZ_QUESTIONS[0].answerIndex === 0,
    });
    expect(answers[4]).toMatchObject({ picked: null, pickedLabel: null, isCorrect: false });
    expect(answers[0].correctLabel).toMatch(/^[A-D]$/);
  });

  it('reads a finished quiz into a run snapshot with score, stars and pass state', () => {
    const allRight = runFromQuizState(playQuiz(true), new Date('2026-10-29T08:00:00Z'));
    expect(allRight).toMatchObject({ score: 8, total: 8, passed: true, stars: 3 });
    expect(allRight.picks).toHaveLength(8);

    const allWrong = runFromQuizState(playQuiz(false), new Date('2026-10-29T08:00:00Z'));
    expect(allWrong.score).toBeLessThan(allWrong.passMark);
    expect(allWrong.passed).toBe(false);
    expect(allWrong.stars).toBe(0);
  });
});

describe('report building', () => {
  it('labels the report so the teacher can tell runs apart', () => {
    const report = buildQuizReport(makeRun(), 'Nur Aisyah', [], new Date('2026-10-29T09:30:00Z'));

    expect(report.version).toBe(1);
    expect(report.stationId).toBe('challenge-lab');
    expect(report.studentName).toBe('Nur Aisyah');
    expect(report.submittedAt).toBe('2026-10-29T09:30:00.000Z');
    expect(report.answers).toHaveLength(8);
    expect(report.reportId).not.toBe('');
    expect(report.score).toBe(8);
  });

  it('adds the journey so the teacher sees which stations the pupil finished', () => {
    const completions = [
      { stationId: 'camp' as const, completedAt: '2026-10-29T08:00:00.000Z' },
      { stationId: 'sunny-coast' as const, completedAt: '2026-10-29T08:20:00.000Z' },
      { stationId: 'cloud-kingdom' as const, completedAt: '2026-10-29T08:45:00.000Z' },
    ];
    const report = buildQuizReport(makeRun(), 'Nur Aisyah', completions);

    expect(report.journey.completedCount).toBe(3);
    expect(report.journey.startedAt).toBe('2026-10-29T08:00:00.000Z');
    expect(report.journey.journeySeconds).toBe(240);
    expect(report.journey.stations).toHaveLength(6);
    expect(report.journey.stations[0]).toMatchObject({
      stationId: 'camp',
      order: 1,
      completed: true,
      completedAt: '2026-10-29T08:00:00.000Z',
    });
    expect(report.journey.stations[5]).toMatchObject({ stationId: 'challenge-lab', completed: false });
  });
  it('gives every report its own id', () => {
    const ids = new Set(Array.from({ length: 50 }, (_, index) => createReportId(1000 + index)));
    expect(ids.size).toBe(50);
  });
});

describe('delivery', () => {
  beforeEach(() => {
    clearReportQueue();
    vi.unstubAllGlobals();
  });

  it('stays quiet when the endpoint is not configured', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    const result = await sendReport(buildQuizReport(makeRun(), 'Aina'), '');

    expect(result).toBe('disabled');
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(readReportQueue()).toHaveLength(0);
  });

  it('posts the report as plain text so Apps Script needs no pre-flight', async () => {
    const fetchSpy = vi.fn(async () => new Response('{"ok":true}', { status: 200 }));
    vi.stubGlobal('fetch', fetchSpy);
    const report = buildQuizReport(makeRun(), 'Aina');

    const result = await sendReport(report, ENDPOINT);

    expect(result).toBe('sent');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(ENDPOINT);
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>)['Content-Type']).toContain('text/plain');
    expect(JSON.parse(String(init.body))).toMatchObject({ studentName: 'Aina', score: 8 });
  });

  it('keeps the report on the device when the network fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('offline'))));
    const report = buildQuizReport(makeRun(), 'Aina');

    const result = await sendReport(report, ENDPOINT);

    expect(result).toBe('queued');
    expect(readReportQueue().map((entry) => entry.reportId)).toEqual([report.reportId]);
  });

  it('queues the report when the endpoint answers with an error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 500 })));
    const report = buildQuizReport(makeRun(), 'Aina');

    await expect(sendReport(report, ENDPOINT)).resolves.toBe('queued');
    expect(readReportQueue()).toHaveLength(1);
  });

  it('does not queue the same run twice', () => {
    const report = buildQuizReport(makeRun(), 'Aina');
    queueReport(report);
    queueReport(report);

    expect(readReportQueue()).toHaveLength(1);
  });

  it('flushes parked reports once the site can reach the endpoint again', async () => {
    queueReport(buildQuizReport(makeRun(), 'Aina'));
    queueReport(buildQuizReport(makeRun({ score: 6, passed: false, stars: 1 }), 'Bala'));
    const fetchSpy = vi.fn(async () => new Response('ok', { status: 200 }));
    vi.stubGlobal('fetch', fetchSpy);

    const outcome = await flushReportQueue(ENDPOINT);

    expect(outcome).toEqual({ sent: 2, pending: 0 });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(readReportQueue()).toHaveLength(0);
  });

  it('leaves everything parked while the endpoint is unset', async () => {
    queueReport(buildQuizReport(makeRun(), 'Aina'));

    await expect(flushReportQueue('')).resolves.toEqual({ sent: 0, pending: 1 });
    expect(readReportQueue()).toHaveLength(1);
  });
});

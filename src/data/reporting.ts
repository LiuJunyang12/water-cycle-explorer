import { PASS_MARK, QUESTION_COUNT, QUIZ_QUESTIONS, type QuizState } from '../game/quizLab';
import { normaliseScientistName } from './finale';
import { STATIONS, type StationCompletion, type StationId } from './stations';

/**
 * Reporting pipeline for the final quiz.
 *
 * The site is a static build, so there is no server of our own: the finished
 * report is POSTed to a Google Apps Script web app which appends a row to a
 * Google Sheet and drops a JSON copy in a Google Drive folder. That keeps the
 * teacher in Google Drive (no accounts, no database bills) while the browser
 * stays anonymous.
 *
 * When the endpoint is not configured, or the network is down, the report is
 * parked in localStorage and retried the next time the site is opened.
 */

export const REPORT_VERSION = 1;
export const REPORT_STATION_ID = 'challenge-lab';

/** Web app URL from .env (VITE_REPORT_ENDPOINT). Empty = reporting disabled. */
export const REPORT_ENDPOINT: string = (import.meta.env.VITE_REPORT_ENDPOINT ?? '').trim();

const QUEUE_KEY = 'wce:report-queue';
const QUEUE_LIMIT = 40;
const SEND_TIMEOUT_MS = 9000;
const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

/** One graded question, stored in a readable shape (not the raw index maths). */
export interface ReportAnswer {
  id: string;
  prompt: string;
  picked: number | null;
  pickedLabel: string | null;
  correct: number;
  correctLabel: string;
  isCorrect: boolean;
}

/** Snapshot of a completed run, produced by station 6. */
export interface QuizRun {
  startedAt: string;
  finishedAt: string;
  picks: ReadonlyArray<number | null>;
  score: number;
  total: number;
  passMark: number;
  stars: number;
  passed: boolean;
}

/** One station of the adventure, as the teacher will read it. */
export interface StationProgress {
  stationId: StationId;
  order: number;
  name: string;
  englishName: string;
  completed: boolean;
  completedAt: string | null;
}

/** The whole journey up to the ceremony: what was finished, and when. */
export interface JourneySnapshot {
  stations: StationProgress[];
  completedCount: number;
  /** First station completion, i.e. when the pupil really started. */
  startedAt: string | null;
  /** When the quiz run ended. */
  finishedAt: string;
  /** Seconds between the first completed station and the end of the quiz. */
  journeySeconds: number | null;
}

/** A rendered certificate that rides along, so Drive keeps an image, not code. */
export interface CertificateUpload {
  fileName: string;
  mimeType: string;
  /** Base64 PNG without the `data:` prefix. */
  data: string;
}

/** The full report that leaves the browser. */
export interface QuizReport extends QuizRun {
  version: number;
  reportId: string;
  submittedAt: string;
  stationId: string;
  studentName: string;
  answers: ReportAnswer[];
  journey: JourneySnapshot;
  certificate: CertificateUpload | null;
}

export type ReportDelivery = 'sent' | 'queued' | 'disabled';

function letterFor(index: number | null): string | null {
  if (index === null || index < 0 || index >= OPTION_LETTERS.length) {
    return null;
  }
  return OPTION_LETTERS[index];
}

/** Unique enough for a classroom, without pulling in a uuid dependency. */
export function createReportId(now = Date.now()): string {
  const stamp = now.toString(36);
  const noise = Math.random().toString(36).slice(2, 8);
  return `${stamp}-${noise}`;
}

/** Grades every question of the run into a printable answer list. */
export function gradeAnswers(picks: ReadonlyArray<number | null>): ReportAnswer[] {
  return QUIZ_QUESTIONS.map((question, index) => {
    const picked = picks[index] ?? null;
    return {
      id: question.id,
      prompt: question.prompt,
      picked,
      pickedLabel: letterFor(picked),
      correct: question.answerIndex,
      correctLabel: letterFor(question.answerIndex) ?? 'A',
      isCorrect: picked === question.answerIndex,
    };
  });
}

/** Turns the local progress record into the journey block of the report. */
export function buildJourney(
  completions: readonly StationCompletion[],
  finishedAt: string,
): JourneySnapshot {
  const timestamps = new Map<StationId, string>();
  for (const entry of completions) {
    if (!timestamps.has(entry.stationId)) {
      timestamps.set(entry.stationId, entry.completedAt);
    }
  }

  const stamps = [...timestamps.values()]
    .map((value) => Date.parse(value))
    .filter((value) => !Number.isNaN(value));
  const startedAt = stamps.length > 0 ? new Date(Math.min(...stamps)).toISOString() : null;
  const endedAtMs = Date.parse(finishedAt);
  const journeySeconds =
    startedAt && !Number.isNaN(endedAtMs)
      ? Math.max(0, Math.round((endedAtMs - Date.parse(startedAt)) / 1000))
      : null;

  return {
    stations: STATIONS.map((station) => ({
      stationId: station.id,
      order: station.order,
      name: station.name,
      englishName: station.englishName,
      completed: timestamps.has(station.id),
      completedAt: timestamps.get(station.id) ?? null,
    })),
    completedCount: timestamps.size,
    startedAt,
    finishedAt,
    journeySeconds,
  };
}

/** Builds the report that goes to the teacher's Drive. */
/** File name used both in Drive and in the teacher's download folder. */
export function certificateUploadName(studentName: string, submittedAt = new Date()): string {
  const safe = normaliseScientistName(studentName) || 'Saintis Air';
  const stamp = submittedAt.toISOString().slice(0, 10);
  return `Sijil - ${safe} - ${stamp}.png`;
}

export function buildQuizReport(
  run: QuizRun,
  studentName: string,
  completions: readonly StationCompletion[] = [],
  submittedAt = new Date(),
  certificate: CertificateUpload | null = null,
): QuizReport {
  return {
    ...run,
    version: REPORT_VERSION,
    reportId: createReportId(submittedAt.getTime()),
    submittedAt: submittedAt.toISOString(),
    stationId: REPORT_STATION_ID,
    studentName,
    answers: gradeAnswers(run.picks),
    journey: buildJourney(completions, run.finishedAt),
    certificate,
  };
}

/** Reads a finished quiz state into the run snapshot that FinalePage consumes. */
export function runFromQuizState(
  quiz: QuizState,
  startedAt: Date,
  finishedAt = new Date(),
): QuizRun {
  const picks = quiz.picks;
  const score = picks.reduce<number>(
    (running, pick, index) => (pick === QUIZ_QUESTIONS[index].answerIndex ? running + 1 : running),
    0,
  );
  const total = QUESTION_COUNT;
  const passMark = PASS_MARK;
  const passed = score >= passMark;
  const stars = score === total ? 3 : passed ? 2 : score >= Math.ceil(total / 2) ? 1 : 0;
  return {
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    picks: [...picks],
    score,
    total,
    passMark,
    stars,
    passed,
  };
}

function readQueue(): QuizReport[] {
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as QuizReport[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(reports: QuizReport[]): void {
  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(reports.slice(-QUEUE_LIMIT)));
  } catch {
    // Storage full or blocked: the report is simply lost, never a crash.
  }
}

/**
 * Puts a report in the offline queue, replacing an older copy of the same run.
 * The certificate image is dropped here: it can be ~0.7 MB of base64 and the
 * queue lives in localStorage, so the row is kept and the picture is lost.
 */
export function queueReport(report: QuizReport): void {
  const queue = readQueue().filter((entry) => entry.reportId !== report.reportId);
  queue.push({ ...report, certificate: null });
  writeQueue(queue);
}

export function readReportQueue(): QuizReport[] {
  return readQueue();
}

export function clearReportQueue(): void {
  try {
    window.localStorage.removeItem(QUEUE_KEY);
  } catch {
    // ignore
  }
}

async function postReport(report: QuizReport, endpoint: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      // text/plain keeps the request "simple": Apps Script cannot answer the
      // CORS pre-flight that application/json would trigger.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(report),
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}

/** Sends one report; falls back to the local queue instead of throwing. */
export async function sendReport(
  report: QuizReport,
  endpoint: string = REPORT_ENDPOINT,
): Promise<ReportDelivery> {
  if (!endpoint) {
    return 'disabled';
  }
  const ok = await postReport(report, endpoint);
  if (ok) {
    return 'sent';
  }
  queueReport(report);
  return 'queued';
}

/** Retries everything parked in localStorage; called once when the site opens. */
export async function flushReportQueue(
  endpoint: string = REPORT_ENDPOINT,
): Promise<{ sent: number; pending: number }> {
  const queue = readQueue();
  if (!endpoint || queue.length === 0) {
    return { sent: 0, pending: queue.length };
  }

  const remaining: QuizReport[] = [];
  let sent = 0;
  for (const report of queue) {
    const ok = await postReport(report, endpoint);
    if (ok) {
      sent += 1;
    } else {
      remaining.push(report);
    }
  }
  writeQueue(remaining);
  return { sent, pending: remaining.length };
}

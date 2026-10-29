/**
 * Station 6 - Makmal Cabaran Sains: an eight-question multiple-choice quiz.
 *
 * The rules follow the same science red lines as the other stations:
 * water vapour is invisible, clouds are made of tiny droplets and ice crystals,
 * and the sun is the energy source that drives evaporation.
 */

export type QuizScene = 'sun' | 'vapour' | 'cloud' | 'rain' | 'valley' | 'cycle';

export interface QuizQuestion {
  id: string;
  scene: QuizScene;
  emoji: string;
  prompt: string;
  english: string;
  options: readonly [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: 'q1',
    scene: 'sun',
    emoji: '☀️',
    prompt: 'Matahari memanaskan air di laut. Apakah proses yang menukar air itu menjadi wap air?',
    english: 'Evaporation',
    options: ['Penyejatan', 'Kondensasi', 'Kerpasan', 'Pengumpulan'],
    answerIndex: 0,
    explanation: 'Matahari membekalkan tenaga untuk penyejatan. Wap air yang terhasil tidak kelihatan.',
  },
  {
    id: 'q2',
    scene: 'sun',
    emoji: '☁️',
    prompt: 'Apakah sumber tenaga utama yang memanaskan air di Bumi?',
    english: 'Source of energy',
    options: ['Bulan', 'Matahari', 'Angin', 'Bintang'],
    answerIndex: 1,
    explanation: 'Tenaga matahari memanaskan permukaan air sehingga air bertukar menjadi wap air.',
  },
  {
    id: 'q3',
    scene: 'vapour',
    emoji: '🌫️',
    prompt: 'Antara pernyataan berikut, yang manakah betul tentang wap air?',
    english: 'Water vapour',
    options: [
      'Wap air berwarna putih dan kelihatan',
      'Wap air hanya wujud semasa air mendidih',
      'Wap air tidak kelihatan',
      'Wap air lebih berat daripada air',
    ],
    answerIndex: 2,
    explanation:
      'Wap air tidak kelihatan. "Asap" putih di atas cawan teh panas ialah titisan air kecil, bukan wap air.',
  },
  {
    id: 'q4',
    scene: 'cloud',
    emoji: '💧',
    prompt: 'Apakah berlaku kepada wap air apabila ia menyejuk tinggi di langit?',
    english: 'Condensation',
    options: [
      'Wap air hilang sepenuhnya',
      'Wap air bertukar menjadi oksigen',
      'Wap air terus naik ke angkasa',
      'Wap air bertukar menjadi titisan air kecil',
    ],
    answerIndex: 3,
    explanation: 'Apabila wap air menyejuk, ia terkondensasi menjadi titisan air kecil yang membentuk awan.',
  },
  {
    id: 'q5',
    scene: 'cloud',
    emoji: '🧊',
    prompt: 'Awan diperbuat daripada apa?',
    english: 'What clouds are made of',
    options: ['Wap air sahaja', 'Titisan air kecil dan hablur ais', 'Kapas putih', 'Debu dan asap'],
    answerIndex: 1,
    explanation: 'Awan terdiri daripada titisan air kecil dan hablur ais yang sangat banyak.',
  },
  {
    id: 'q6',
    scene: 'rain',
    emoji: '🌧️',
    prompt: 'Apakah nama proses apabila air jatuh dari awan ke Bumi?',
    english: 'Precipitation',
    options: ['Penyejatan', 'Kondensasi', 'Kerpasan', 'Pengumpulan'],
    answerIndex: 2,
    explanation: 'Kerpasan ialah air yang jatuh dari awan sebagai hujan, salji atau batu ais.',
  },
  {
    id: 'q7',
    scene: 'valley',
    emoji: '🏞️',
    prompt: 'Ke manakah air hujan mengalir selepas turun ke Bumi?',
    english: 'Collection',
    options: [
      'Ke sungai, tasik dan laut',
      'Kembali ke awan dengan segera',
      'Hilang ke dalam udara',
      'Ke angkasa lepas',
    ],
    answerIndex: 0,
    explanation: 'Air hujan berkumpul di sungai, tasik dan laut, kemudian dipanaskan semula oleh matahari.',
  },
  {
    id: 'q8',
    scene: 'cycle',
    emoji: '🌍',
    prompt: 'Mengapakah kitaran air penting kepada hidupan di Bumi?',
    english: 'Why the water cycle matters',
    options: [
      'Ia menjadikan langit berwarna biru',
      'Ia menghasilkan angin setiap hari',
      'Ia menyejukkan batu di gunung',
      'Ia membekalkan air bersih secara berterusan',
    ],
    answerIndex: 3,
    explanation: 'Kitaran air berterusan dan membekalkan air bersih untuk manusia, haiwan dan tumbuhan.',
  },
];

/** First-try score (out of eight) needed for the Saintis badge: 80%, rounded up. */
export const PASS_MARK = Math.ceil(QUIZ_QUESTIONS.length * 0.8);
export const QUESTION_COUNT = QUIZ_QUESTIONS.length;

export type QuizPhase = 'playing' | 'finished';

export interface QuizState {
  phase: QuizPhase;
  index: number;
  /** The option the pupil picked for each question, or null when unanswered. */
  picks: ReadonlyArray<number | null>;
}

export function createQuiz(): QuizState {
  return { phase: 'playing', index: 0, picks: QUIZ_QUESTIONS.map(() => null) };
}

export function restartQuiz(): QuizState {
  return createQuiz();
}

export function currentQuestion(state: QuizState): QuizQuestion {
  return QUIZ_QUESTIONS[Math.min(state.index, QUESTION_COUNT - 1)];
}

export function currentPick(state: QuizState): number | null {
  return state.picks[state.index] ?? null;
}

export function isAnswered(state: QuizState): boolean {
  return currentPick(state) !== null;
}

export function isCorrect(state: QuizState): boolean {
  const pick = currentPick(state);
  return pick !== null && pick === currentQuestion(state).answerIndex;
}

export function chooseOption(state: QuizState, optionIndex: number): QuizState {
  if (state.phase !== 'playing') return state;
  if (optionIndex < 0 || optionIndex > 3) return state;
  if (isAnswered(state)) return state;

  const picks = state.picks.map((pick, index) => (index === state.index ? optionIndex : pick));
  return { ...state, picks };
}

export function nextQuestion(state: QuizState): QuizState {
  if (state.phase !== 'playing') return state;
  if (!isAnswered(state)) return state;

  if (state.index >= QUESTION_COUNT - 1) {
    return { ...state, phase: 'finished' };
  }

  return { ...state, index: state.index + 1 };
}

export function score(state: QuizState): number {
  return state.picks.reduce<number>((total, pick, index) => {
    return pick !== null && pick === QUIZ_QUESTIONS[index].answerIndex ? total + 1 : total;
  }, 0);
}

export function answeredCount(state: QuizState): number {
  return state.picks.filter((pick) => pick !== null).length;
}

export function passed(state: QuizState): boolean {
  return score(state) >= PASS_MARK;
}

export function starsFor(state: QuizState): number {
  const earned = score(state);
  if (earned === QUESTION_COUNT) return 3;
  if (earned >= PASS_MARK) return 2;
  if (earned >= Math.ceil(QUESTION_COUNT / 2)) return 1;
  return 0;
}

export const QUIZ_TEXT = {
  title: 'Cabaran Saintis Kecil',
  englishTitle: 'Little Scientist Challenge',
  mission: 'Jawab 8 soalan. Setiap soalan ada 4 pilihan — pilih satu sahaja.',
  hint: 'Tekan satu jawapan untuk meneruskan.',
  progressLabel: 'Kemajuan kuiz',
  correctPrefix: 'Betul! ',
  wrongPrefix: 'Hampir betul. Jawapan yang betul ialah ',
  next: 'Soalan seterusnya',
  finish: 'Lihat keputusan',
  restart: 'Cuba lagi',
  scoreLabel: 'Skor',
  firstTryLabel: 'Percubaan pertama',
  finishedTitle: 'Cabaran selesai!',
  passedNote: 'Hebat! Kamu layak menerima lencana Saintis. 🔬',
  failedNote: `Dapat sekurang-kurangnya ${PASS_MARK}/${QUESTION_COUNT} untuk lencana Saintis. Jangan putus asa — cuba lagi!`,
  factsTitle: 'Ingat ya:',
  toFinale: 'Ke Majlis Anugerah',
  backToMap: 'Kembali ke peta',
} as const;

export const QUIZ_FACTS: readonly string[] = [
  'Wap air tidak kelihatan. Titisan air kecil di dalam awan yang kita lihat sebagai awan.',
  'Matahari membekalkan tenaga untuk penyejatan, walaupun air tidak mendidih.',
  'Kitaran air berterusan: air sentiasa bergerak dari laut ke langit dan kembali semula.',
  'Awan boleh mengandungi titisan air dan hablur ais apabila udara sangat sejuk.',
];

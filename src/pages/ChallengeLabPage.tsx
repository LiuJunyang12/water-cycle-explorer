import { useEffect, useRef, useState } from 'react';
import { BackToMapButton } from '../components/common/BackToMapButton';
import { QuizArt } from '../components/learning/QuizArt';
import { QUIZ_ART } from '../data/challengeLabAssets';
import { runFromQuizState, type QuizRun } from '../data/reporting';
import { WALLY_SPRITES } from '../data/cloudKingdomAssets';
import {
  QUESTION_COUNT,
  QUIZ_FACTS,
  QUIZ_QUESTIONS,
  QUIZ_TEXT,
  answeredCount,
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
  type QuizState,
} from '../game/quizLab';
import './ChallengeLabPage.css';

interface ChallengeLabPageProps {
  isAlreadyCompleted: boolean;
  onComplete: () => void;
  onBackToMap: () => void;
  /** Opens the award ceremony after the last question, carrying the graded run. */
  onGoToFinale: (run: QuizRun) => void;
}

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const;

/** Purely decorative bubbles that keep the lab feeling light and playful. */
const BUBBLES = [
  { emoji: '🫧', left: '6%', top: '16%', delay: '0s', size: '1.5rem' },
  { emoji: '💧', left: '90%', top: '26%', delay: '1.1s', size: '1.2rem' },
  { emoji: '🫧', left: '78%', top: '62%', delay: '2.2s', size: '1.9rem' },
  { emoji: '☁️', left: '4%', top: '70%', delay: '0.6s', size: '1.6rem' },
  { emoji: '✨', left: '60%', top: '10%', delay: '1.7s', size: '1.1rem' },
  { emoji: '💦', left: '22%', top: '90%', delay: '2.6s', size: '1rem' },
];

export function ChallengeLabPage({
  isAlreadyCompleted,
  onComplete,
  onBackToMap,
  onGoToFinale,
}: ChallengeLabPageProps) {
  const [quiz, setQuiz] = useState<QuizState>(() => createQuiz());
  const [wallyFailed, setWallyFailed] = useState(false);
  const [artLoaded, setArtLoaded] = useState<Record<string, boolean>>({});
  const [artTry, setArtTry] = useState<Record<string, number>>({});
  const completionSentRef = useRef(false);
  const startedAtRef = useRef(new Date());

  const question = currentQuestion(quiz);
  const picked = currentPick(quiz);
  const answered = isAnswered(quiz);
  const correct = isCorrect(quiz);
  const finished = quiz.phase === 'finished';
  const answeredTotal = answeredCount(quiz);
  const artCandidates = QUIZ_ART[question.id] ?? [];
  const artSrc = artCandidates[artTry[question.id] ?? 0];
  const artReady = Boolean(artLoaded[question.id]) && Boolean(artSrc);
  const showArt = Boolean(artSrc);

  useEffect(() => {
    if (!finished) return;
    if (isAlreadyCompleted) return;
    if (completionSentRef.current) return;

    completionSentRef.current = true;
    onComplete();
  }, [finished, isAlreadyCompleted, onComplete]);

  const handlePick = (index: number) => setQuiz((current) => chooseOption(current, index));
  const handleNext = () => setQuiz((current) => nextQuestion(current));
  const handleRestart = () => {
    startedAtRef.current = new Date();
    setQuiz(restartQuiz());
  };

  // The ceremony needs the graded run, so hand it over before leaving the station.
  const handleGoToFinale = () => onGoToFinale(runFromQuizState(quiz, startedAtRef.current));

  return (
    <main className="lab-page">
      <div className="lab-page__bubbles" aria-hidden="true">
        {BUBBLES.map((bubble) => (
          <span
            key={`${bubble.emoji}-${bubble.left}-${bubble.top}`}
            className="lab-page__bubble"
            style={{
              left: bubble.left,
              top: bubble.top,
              animationDelay: bubble.delay,
              fontSize: bubble.size,
            }}
          >
            {bubble.emoji}
          </span>
        ))}
      </div>

      <header className="lab-page__header">
        <div className="lab-page__heading">
          <p className="lab-page__eyebrow">STESEN 6 · MAKMAL CABARAN SAINS</p>
          <h1 className="lab-page__title">
            {QUIZ_TEXT.title}
            <span className="lab-page__title-en"> ({QUIZ_TEXT.englishTitle})</span>
          </h1>
          <p className="lab-page__mission">{QUIZ_TEXT.mission}</p>
        </div>
        <BackToMapButton onClick={onBackToMap} />
      </header>

      <div
        className="lab-progress"
        role="progressbar"
        aria-label={QUIZ_TEXT.progressLabel}
        aria-valuemin={0}
        aria-valuemax={QUESTION_COUNT}
        aria-valuenow={answeredTotal}
      >
        <ol className="lab-progress__dots">
          {QUIZ_QUESTIONS.map((entry, index) => {
            const pick = quiz.picks[index];
            const state =
              pick === null
                ? index === quiz.index && !finished
                  ? 'current'
                  : 'todo'
                : pick === entry.answerIndex
                  ? 'right'
                  : 'wrong';

            return (
              <li
                key={entry.id}
                className={`lab-progress__dot lab-progress__dot--${state}`}
                aria-hidden="true"
              />
            );
          })}
        </ol>
        <p className="lab-progress__count">
          {Math.min(quiz.index + 1, QUESTION_COUNT)} / {QUESTION_COUNT}
        </p>
      </div>

      <section className="lab-card" aria-label="Soalan kuiz">
        <div
          className={artReady ? 'lab-card__art lab-card__art--photo' : 'lab-card__art'}
          data-scene={question.scene}
        >
          {artReady ? null : <QuizArt scene={question.scene} />}
          {showArt ? (
            <img
              className={artReady ? 'lab-art__img lab-art__img--ready' : 'lab-art__img'}
              src={artSrc}
              alt=""
              data-testid="lab-art-img"
              onLoad={() => setArtLoaded((current) => ({ ...current, [question.id]: true }))}
              onError={() => {
                setArtLoaded((current) => ({ ...current, [question.id]: false }));
                setArtTry((current) => ({
                  ...current,
                  [question.id]: (current[question.id] ?? 0) + 1,
                }));
              }}
            />
          ) : null}
          {artReady ? null : (
            <span className="lab-card__emoji" aria-hidden="true">
              {question.emoji}
            </span>
          )}
        </div>

        <div className="lab-ask">
          <div className="lab-wally">
            {wallyFailed ? (
              <span className="lab-wally__fallback" aria-hidden="true" />
            ) : (
              <img
                className="lab-wally__img"
                src={WALLY_SPRITES.stand}
                alt=""
                data-testid="lab-wally"
                onError={() => setWallyFailed(true)}
              />
            )}
          </div>
          <div className="lab-bubble">
            <p className="lab-bubble__name">Wally</p>
            <p className="lab-bubble__question">{question.prompt}</p>
            <p className="lab-bubble__english">{question.english}</p>
          </div>
        </div>

        <div className="lab-options" role="group" aria-label="Pilihan jawapan">
          {question.options.map((option, index) => {
            const isPicked = picked === index;
            const isAnswer = answered && question.answerIndex === index;
            const isWrongPick = answered && isPicked && index !== question.answerIndex;
            const classes = [
              'lab-option',
              isAnswer ? 'lab-option--right' : '',
              isWrongPick ? 'lab-option--wrong' : '',
              answered && !isAnswer && !isWrongPick ? 'lab-option--muted' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <button
                key={option}
                type="button"
                className={classes}
                data-option={index}
                onClick={() => handlePick(index)}
                disabled={answered}
              >
                <span className="lab-option__key" aria-hidden="true">
                  {OPTION_KEYS[index]}
                </span>
                <span className="lab-option__text">{option}</span>
                {isAnswer ? (
                  <span className="lab-option__mark" aria-hidden="true">
                    ✓
                  </span>
                ) : null}
                {isWrongPick ? (
                  <span className="lab-option__mark lab-option__mark--wrong" aria-hidden="true">
                    ✕
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="lab-footer">
          {answered ? (
            <div
              className={`lab-feedback ${correct ? 'lab-feedback--right' : 'lab-feedback--wrong'}`}
              role="status"
              data-testid="lab-feedback"
            >
              <p className="lab-feedback__title">{correct ? '🎉 Betul!' : '🤔 Hampir betul'}</p>
              <p className="lab-feedback__text">
                {correct
                  ? question.explanation
                  : `${QUIZ_TEXT.wrongPrefix}${question.options[question.answerIndex]}. ${question.explanation}`}
              </p>
              <button type="button" className="button-primary lab-feedback__next" onClick={handleNext}>
                {quiz.index === QUESTION_COUNT - 1 ? QUIZ_TEXT.finish : QUIZ_TEXT.next}
              </button>
            </div>
          ) : (
            <p className="lab-hint">💡 {QUIZ_TEXT.hint}</p>
          )}
        </div>
      </section>

      {finished ? (
        <div className="lab-overlay" role="dialog" aria-modal="true" aria-label={QUIZ_TEXT.finishedTitle}>
          <div className="lab-result">
            <p className="lab-result__eyebrow">STESEN 6 · SELESAI</p>
            <h2 className="lab-result__title">{QUIZ_TEXT.finishedTitle}</h2>
            <p className="lab-result__stars" aria-label={`${starsFor(quiz)} bintang`}>
              {'⭐'.repeat(starsFor(quiz))}
            </p>
            <p className="lab-result__score">
              {QUIZ_TEXT.firstTryLabel}: <strong>{score(quiz)}</strong> / {QUESTION_COUNT}
            </p>
            <p className="lab-result__note">{passed(quiz) ? QUIZ_TEXT.passedNote : QUIZ_TEXT.failedNote}</p>
            <ul className="lab-result__facts">
              <li className="lab-result__facts-title">{QUIZ_TEXT.factsTitle}</li>
              {QUIZ_FACTS.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
            <div className="lab-result__actions">
              <button type="button" className="button-primary" onClick={handleGoToFinale}>
                {QUIZ_TEXT.toFinale}
              </button>
              <button type="button" className="button-quiet" onClick={handleRestart}>
                {QUIZ_TEXT.restart}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

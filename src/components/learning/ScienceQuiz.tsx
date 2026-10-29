import { useState } from 'react';
import './ScienceQuiz.css';

interface ScienceQuizProps {
  question: string;
  options: ReadonlyArray<{ id: string; text: string }>;
  correctId: string;
  correctFeedback: string;
  wrongFeedback: string;
  onPass: () => void;
}

/**
 * The Cooling Passage science check. A wrong answer never blocks progress
 * permanently: it explains the concept and lets the pupil try again.
 */
export function ScienceQuiz({
  question,
  options,
  correctId,
  correctFeedback,
  wrongFeedback,
  onPass,
}: ScienceQuizProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const choose = (id: string) => {
    if (status === 'correct') return;
    setSelectedId(id);
    setStatus(id === correctId ? 'correct' : 'wrong');
  };

  const retry = () => {
    setSelectedId(null);
    setStatus('idle');
  };

  return (
    <div className="quiz-modal">
      <div className="quiz-modal__card">
        <p className="quiz-modal__eyebrow">CABARAN SAINS · UDARA MENYEJUK</p>
        <h2 className="quiz-modal__question">{question}</h2>

        <div className="quiz-options">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`quiz-option ${
                selectedId === option.id
                  ? option.id === correctId
                    ? 'is-correct'
                    : 'is-wrong'
                  : ''
              }`}
              aria-pressed={selectedId === option.id}
              onClick={() => choose(option.id)}
              disabled={status === 'correct'}
            >
              {option.text}
            </button>
          ))}
        </div>

        {status === 'correct' ? (
          <>
            <p className="quiz-feedback quiz-feedback--correct" role="status">
              {correctFeedback}
            </p>
            <button type="button" className="button-primary" onClick={onPass}>
              Teruskan ke jambatan awan
            </button>
          </>
        ) : null}

        {status === 'wrong' ? (
          <>
            <p className="quiz-feedback quiz-feedback--wrong" role="status">
              {wrongFeedback}
            </p>
            <button type="button" className="button-quiet" onClick={retry}>
              Cuba lagi
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

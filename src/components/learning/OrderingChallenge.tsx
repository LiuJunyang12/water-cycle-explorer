import { useMemo, useState } from 'react';
import './OrderingChallenge.css';

interface OrderingChallengeProps {
  steps: ReadonlyArray<{ id: string; text: string }>;
  correctOrder: readonly string[];
  onSolved: () => void;
}

/** A deliberately wrong starting order so the pupil really has to sort it. */
const STARTING_ORDER = ['s3', 's1', 's4', 's2'];

/**
 * Challenge 1 of the cloud bridge: put the four cloud-formation steps in order.
 *
 * Supports drag and drop, plus a keyboard/button path (select a card, then move
 * it up or down). The correct answer is never shown before checking.
 */
export function OrderingChallenge({ steps, correctOrder, onSolved }: OrderingChallengeProps) {
  const [order, setOrder] = useState<string[]>(() => {
    const ids = steps.map((step) => step.id);
    const usable = STARTING_ORDER.filter((id) => ids.includes(id));
    const missing = ids.filter((id) => !usable.includes(id));
    return [...usable, ...missing];
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'wrong'>('idle');
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const textById = useMemo(() => {
    const map = new Map<string, string>();
    steps.forEach((step) => map.set(step.id, step.text));
    return map;
  }, [steps]);

  const move = (id: string, direction: -1 | 1) => {
    setOrder((previous) => {
      const index = previous.indexOf(id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= previous.length) return previous;
      const next = [...previous];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
    setFeedback('idle');
  };

  const dropOn = (targetId: string) => {
    if (!draggingId || draggingId === targetId) return;
    setOrder((previous) => {
      const next = previous.filter((id) => id !== draggingId);
      const targetIndex = next.indexOf(targetId);
      next.splice(targetIndex, 0, draggingId);
      return next;
    });
    setFeedback('idle');
    setDraggingId(null);
  };

  const check = () => {
    if (order.join(',') === correctOrder.join(',')) {
      onSolved();
      return;
    }
    setFeedback('wrong');
  };

  const selectedIndex = selectedId ? order.indexOf(selectedId) : -1;

  return (
    <div className="order-challenge">
      <div className="order-challenge__card">
        <p className="order-challenge__eyebrow">CABARAN 1 · SUSUN LANGKAH</p>
        <h2 className="order-challenge__title">Bagaimana awan terbentuk?</h2>
        <p className="order-challenge__intro">
          Susun langkah-langkah ini mengikut urutan yang betul. Seret kad, atau pilih kad kemudian
          gunakan butang Naik / Turun.
        </p>

        <ol className="order-list">
          {order.map((id, index) => (
            <li
              key={id}
              className={`order-card ${selectedId === id ? 'is-selected' : ''}`}
              draggable
              onDragStart={() => setDraggingId(id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dropOn(id)}
              onDragEnd={() => setDraggingId(null)}
            >
              <span className="order-card__handle" aria-hidden="true">
                ⠿
              </span>
              <button
                type="button"
                className="order-card__text"
                aria-pressed={selectedId === id}
                onClick={() => setSelectedId(id)}
                onKeyDown={(event) => {
                  if (event.key === 'ArrowUp') {
                    event.preventDefault();
                    move(id, -1);
                  }
                  if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    move(id, 1);
                  }
                }}
              >
                <span className="order-card__number">{index + 1}</span>
                {textById.get(id)}
              </button>
            </li>
          ))}
        </ol>

        <div className="order-actions">
          <button
            type="button"
            className="button-quiet"
            onClick={() => selectedId && move(selectedId, -1)}
            disabled={selectedIndex <= 0}
          >
            Naik
          </button>
          <button
            type="button"
            className="button-quiet"
            onClick={() => selectedId && move(selectedId, 1)}
            disabled={selectedIndex < 0 || selectedIndex >= order.length - 1}
          >
            Turun
          </button>
          <button type="button" className="button-primary" onClick={check}>
            Semak jawapan
          </button>
        </div>

        {feedback === 'wrong' ? (
          <p className="order-feedback" role="status">
            Belum tepat. Cuba fikirkan: air perlu menyejat dahulu, kemudian udara lembap naik dan
            menyejuk, barulah wap air boleh terpeluwap dan membentuk awan.
          </p>
        ) : null}
      </div>
    </div>
  );
}

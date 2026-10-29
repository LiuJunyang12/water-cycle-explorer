import { useEffect, useRef, useState } from 'react';
import { CycleCardArt } from '../components/learning/CycleCardArt';
import { WaterCycleDiagram } from '../components/learning/WaterCycleDiagram';
import {
  checkLabels,
  checkOrder,
  clearLabel,
  clearSlot,
  CYCLE_FACTS,
  CYCLE_TEXT,
  createCycleGame,
  isDiagramComplete,
  isTrayComplete,
  PROCESSES,
  PROCESS_ORDER,
  placeCard,
  placeLabel,
  restartCycleGame,
  SLOT_COUNT,
  SPOTS,
  submitLabels,
  submitOrder,
  trayCards,
  trayLabels,
  type CycleState,
  type ProcessId,
  type SpotId,
} from '../game/waterCycle';
import { BackToMapButton } from '../components/common/BackToMapButton';
import './WaterCycleStationPage.css';

interface WaterCycleStationPageProps {
  isAlreadyCompleted: boolean;
  onComplete: () => void;
  onBackToMap: () => void;
}

interface Feedback {
  kind: 'right' | 'wrong';
  wrongSlots: number[];
  wrongSpots: SpotId[];
}

/**
 * Station 5 - Stesen Kitaran Air.
 *
 * Step 1: arrange the four scene cards into the water cycle order.
 * Step 2: label the diagram by dragging the four words onto the sea, the cloud,
 *         the falling rain and the river.
 *
 * The station is only reported as completed when the pupil has really put the
 * cards in the right order and labelled every spot correctly.
 */
export function WaterCycleStationPage({
  isAlreadyCompleted,
  onComplete,
  onBackToMap,
}: WaterCycleStationPageProps) {
  const [game, setGame] = useState<CycleState>(createCycleGame);
  const [selectedCard, setSelectedCard] = useState<ProcessId | null>(null);
  const [selectedProcess, setSelectedProcess] = useState<ProcessId | null>(null);
  const [draggingCard, setDraggingCard] = useState<ProcessId | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const completionSentRef = useRef(isAlreadyCompleted);

  const isFinished = game.phase === 'finished';

  useEffect(() => {
    if (!isFinished || completionSentRef.current) return;
    completionSentRef.current = true;
    onComplete();
  }, [isFinished, onComplete]);

  const restart = () => {
    setGame(restartCycleGame());
    setSelectedCard(null);
    setSelectedProcess(null);
    setDraggingCard(null);
    setFeedback(null);
  };

  const putCard = (card: ProcessId, slotIndex: number) => {
    setGame((previous) => placeCard(previous, card, slotIndex));
    setSelectedCard(null);
    setDraggingCard(null);
    setFeedback(null);
  };

  const takeCardOut = (slotIndex: number) => {
    setGame((previous) => clearSlot(previous, slotIndex));
    setFeedback(null);
  };

  const submitOrderCheck = () => {
    const result = checkOrder(game);
    if (result.ok) {
      // The order is right, so the board is replaced by the diagram right away.
      setFeedback(null);
      setGame((previous) => submitOrder(previous));
      return;
    }
    setFeedback({ kind: 'wrong', wrongSlots: result.wrong, wrongSpots: [] });
    setGame((previous) => submitOrder(previous));
  };

  const dropLabel = (spot: SpotId, process: ProcessId) => {
    setGame((previous) => placeLabel(previous, spot, process));
    setSelectedProcess(null);
    setFeedback(null);
  };

  const putSelectedLabel = (spot: SpotId) => {
    if (!selectedProcess) return;
    dropLabel(spot, selectedProcess);
  };

  const takeLabelOut = (spot: SpotId) => {
    setGame((previous) => clearLabel(previous, spot));
    setFeedback(null);
  };

  const submitLabelCheck = () => {
    const result = checkLabels(game);
    if (result.ok) {
      setFeedback(null);
    } else {
      setFeedback({ kind: 'wrong', wrongSlots: [], wrongSpots: result.wrongSpots });
    }
    setGame((previous) => submitLabels(previous));
  };

  const tray = trayCards(game);
  const labelsTray = trayLabels(game);
  const placedCount = game.slots.filter((slot) => slot !== null).length;
  const labelledCount = SPOTS.filter((spot) => game.labels[spot.id] !== null).length;

  const isOrdering = game.phase === 'ordering';
  const wrongSlots = feedback?.kind === 'wrong' ? feedback.wrongSlots : [];
  const wrongSpots = feedback?.kind === 'wrong' ? feedback.wrongSpots : [];

  return (
    <main className="cycle-page">
      <header className="cycle-page__header">
        <div className="cycle-page__heading">
          <p className="cycle-page__eyebrow">{CYCLE_TEXT.eyebrow}</p>
          <h1 className="cycle-page__title">
            {CYCLE_TEXT.title}
            <span className="cycle-page__title-en"> ({CYCLE_TEXT.englishTitle})</span>
          </h1>
          <p className="cycle-page__mission">{CYCLE_TEXT.mission}</p>
        </div>
        <BackToMapButton onClick={onBackToMap} />
      </header>

      <div className="cycle-page__stage">
        <div className="cycle-page__status">
          <span className="cycle-page__step">
            {isOrdering ? 'LANGKAH 1 / 2' : isFinished ? 'SELESAI' : 'LANGKAH 2 / 2'}
          </span>
          <span className="cycle-page__progress">
            {isOrdering
              ? `${placedCount} / ${SLOT_COUNT} kad`
              : `${labelledCount} / ${SPOTS.length} label`}
          </span>
          <div
            className="cycle-page__bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={isOrdering ? SLOT_COUNT : SPOTS.length}
            aria-valuenow={isOrdering ? placedCount : labelledCount}
            aria-label={isOrdering ? CYCLE_TEXT.progressOrder : CYCLE_TEXT.progressLabels}
          >
            <span
              className="cycle-page__bar-fill"
              style={{
                width: `${
                  ((isOrdering ? placedCount : labelledCount) /
                    (isOrdering ? SLOT_COUNT : SPOTS.length)) *
                  100
                }%`,
              }}
            />
          </div>
          <button type="button" className="button-quiet cycle-page__restart" onClick={restart}>
            {CYCLE_TEXT.restart}
          </button>
        </div>

        {game.phase === 'ordering' ? (
          <section className="cycle-board" aria-labelledby="cycle-ordering-title">
            <div className="cycle-board__intro">
              <h2 className="cycle-board__title" id="cycle-ordering-title">
                {CYCLE_TEXT.orderingTitle}
              </h2>
              <p className="cycle-board__text">{CYCLE_TEXT.orderingIntro}</p>
            </div>

            <ol className="cycle-slots">
              {game.slots.map((card, index) => {
                const isWrong = wrongSlots.includes(index);
                return (
                  <li key={index} className="cycle-slots__item">
                    <button
                      type="button"
                      className={[
                        'cycle-slot',
                        card ? 'cycle-slot--filled' : '',
                        isWrong ? 'cycle-slot--wrong' : '',
                        !card && selectedCard ? 'cycle-slot--ready' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      data-testid={`cycle-slot-${index}`}
                      aria-label={
                        card
                          ? `Petak ${index + 1}: ${PROCESSES[card].name}. Tekan untuk mengeluarkan kad.`
                          : `Petak ${index + 1}: kosong. Letakkan kad di sini.`
                      }
                      onClick={() => (card ? takeCardOut(index) : selectedCard && putCard(selectedCard, index))}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const carried = event.dataTransfer.getData('text/plain') as ProcessId;
                        if (carried) putCard(carried, index);
                      }}
                    >
                      <span className="cycle-slot__number" aria-hidden="true">
                        {index + 1}
                      </span>
                      {card ? (
                        <span className="cycle-slot__body">
                          <CycleCardArt process={card} className="cycle-slot__art" />
                          <span className="cycle-slot__name">{PROCESSES[card].name}</span>
                        </span>
                      ) : (
                        <span className="cycle-slot__empty">{index + 1}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="cycle-tray" data-testid="cycle-tray">
              <p className="cycle-tray__label">{CYCLE_TEXT.trayTitle}</p>
              <div className="cycle-tray__cards">
                {tray.length === 0 ? (
                  <p className="cycle-tray__done">Semua kad sudah berada dalam petak.</p>
                ) : (
                  tray.map((card) => (
                    <button
                      key={card}
                      type="button"
                      className={[
                        'cycle-card',
                        selectedCard === card ? 'cycle-card--selected' : '',
                        draggingCard === card ? 'cycle-card--dragging' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      draggable
                      data-testid={`cycle-card-${card}`}
                      aria-pressed={selectedCard === card}
                      aria-label={`Kad ${PROCESSES[card].name}: ${PROCESSES[card].short}`}
                      onClick={() => setSelectedCard(selectedCard === card ? null : card)}
                      onDragStart={(event) => {
                        event.dataTransfer.setData('text/plain', card);
                        setDraggingCard(card);
                        setSelectedCard(card);
                      }}
                      onDragEnd={() => setDraggingCard(null)}
                    >
                      <CycleCardArt process={card} className="cycle-card__art" />
                      <span className="cycle-card__name">{PROCESSES[card].name}</span>
                      <span className="cycle-card__en">{PROCESSES[card].english}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="cycle-actions">
              <button
                type="button"
                className="button-primary"
                onClick={submitOrderCheck}
                disabled={!isTrayComplete(game)}
              >
                {CYCLE_TEXT.checkOrder}
              </button>
            </div>

            {feedback ? (
              <p
                className={`cycle-feedback cycle-feedback--${feedback.kind}`}
                role="status"
                data-testid="cycle-feedback"
              >
                {feedback.kind === 'right' ? CYCLE_TEXT.orderRight : CYCLE_TEXT.orderWrong}
              </p>
            ) : null}
          </section>
        ) : null}

        {game.phase === 'labelling' ? (
          <section className="cycle-board cycle-board--diagram" aria-labelledby="cycle-labelling-title">
            <div className="cycle-board__intro">
              <h2 className="cycle-board__title" id="cycle-labelling-title">
                {CYCLE_TEXT.labellingTitle}
              </h2>
              <p className="cycle-board__text">{CYCLE_TEXT.labellingIntro}</p>
            </div>

            <WaterCycleDiagram
              placed={game.labels}
              wrongSpots={wrongSpots}
              selectedProcess={selectedProcess}
              onSpotClick={putSelectedLabel}
              onSpotDrop={dropLabel}
              onSpotClear={takeLabelOut}
            />

            <div className="cycle-tray cycle-tray--labels" data-testid="cycle-label-tray">
              <p className="cycle-tray__label">{CYCLE_TEXT.labelsTitle}</p>
              <div className="cycle-tray__cards">
                {labelsTray.length === 0 ? (
                  <p className="cycle-tray__done">Semua perkataan sudah berada pada rajah.</p>
                ) : (
                  labelsTray.map((process) => (
                    <button
                      key={process}
                      type="button"
                      className={[
                        'cycle-chip',
                        selectedProcess === process ? 'cycle-chip--selected' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      draggable
                      data-testid={`cycle-chip-${process}`}
                      aria-pressed={selectedProcess === process}
                      onClick={() =>
                        setSelectedProcess(selectedProcess === process ? null : process)
                      }
                      onDragStart={(event) => {
                        event.dataTransfer.setData('text/plain', process);
                        setSelectedProcess(process);
                      }}
                    >
                      {PROCESSES[process].name}
                      <span className="cycle-chip__en">{PROCESSES[process].english}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="cycle-actions">
              <button
                type="button"
                className="button-primary"
                onClick={submitLabelCheck}
                disabled={!isDiagramComplete(game)}
              >
                {CYCLE_TEXT.checkLabels}
              </button>
            </div>

            {feedback ? (
              <p
                className={`cycle-feedback cycle-feedback--${feedback.kind}`}
                role="status"
                data-testid="cycle-feedback"
              >
                {feedback.kind === 'right' ? CYCLE_TEXT.labelsRight : CYCLE_TEXT.labelsWrong}
              </p>
            ) : null}
          </section>
        ) : null}

        <div className="cycle-wally">
          <img
            className="cycle-wally__img"
            src={`${import.meta.env.BASE_URL}assets/images/waterfall-valley/wally.png`}
            alt=""
            aria-hidden="true"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
          <p className="cycle-wally__bubble" role="status" aria-live="polite">
            {isFinished
              ? CYCLE_TEXT.wallyFinished
              : isOrdering
                ? CYCLE_TEXT.wallyOrdering
                : CYCLE_TEXT.wallyLabelling}
          </p>
        </div>
      </div>

      {isFinished ? (
        <div className="cycle-overlay" role="dialog" aria-modal="true" aria-labelledby="cycle-won-title">
          <div className="cycle-overlay__card">
            <p className="cycle-overlay__eyebrow">STESEN 5 SELESAI</p>
            <h2 className="cycle-overlay__title" id="cycle-won-title">
              {CYCLE_TEXT.finishedTitle}
            </h2>
            <p className="cycle-overlay__text">{CYCLE_TEXT.finishedText}</p>

            <ul className="cycle-overlay__facts">
              {CYCLE_FACTS.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>

            <div className="cycle-overlay__actions">
              <button type="button" className="button-primary" onClick={restart}>
                {CYCLE_TEXT.playAgain}
              </button>
              <button type="button" className="button-quiet" onClick={onBackToMap}>
                {CYCLE_TEXT.backToMap}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

/** Kept for the ordering panel: the correct sequence, used in tests and hints. */
export const CYCLE_KEY_ORDER = PROCESS_ORDER;

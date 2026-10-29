import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CYCLE_TEXT, PROCESSES, SPOTS, PROCESS_ORDER, type ProcessId } from '../game/waterCycle';
import { WaterCycleStationPage } from './WaterCycleStationPage';

interface SetupOptions {
  isAlreadyCompleted?: boolean;
}

function setup({ isAlreadyCompleted = false }: SetupOptions = {}) {
  const onComplete = vi.fn();
  const onBackToMap = vi.fn();
  const view = render(
    <WaterCycleStationPage
      isAlreadyCompleted={isAlreadyCompleted}
      onComplete={onComplete}
      onBackToMap={onBackToMap}
    />,
  );
  return { ...view, onComplete, onBackToMap };
}

function card(process: ProcessId) {
  return screen.getByTestId(`cycle-card-${process}`);
}

function slot(index: number) {
  return screen.getByTestId(`cycle-slot-${index}`);
}

/** Click a card in the tray, then click the slot it should go into. */
function placeByClick(process: ProcessId, index: number) {
  fireEvent.click(card(process));
  fireEvent.click(slot(index));
}

/** Put the four cards in the right order. */
function fillCorrectOrder() {
  PROCESS_ORDER.forEach((process, index) => placeByClick(process, index));
}

function checkOrder() {
  fireEvent.click(screen.getByRole('button', { name: CYCLE_TEXT.checkOrder }));
}

/** Every spot gets the correct word, except the ones given in `wrong`. */
function fillLabels(wrong: Partial<Record<string, ProcessId>> = {}) {
  SPOTS.forEach((spot) => {
    const process = wrong[spot.id] ?? spot.answer;
    fireEvent.click(screen.getByTestId(`cycle-chip-${process}`));
    fireEvent.click(screen.getByTestId(`cycle-spot-${spot.id}`));
  });
}

function checkLabels() {
  fireEvent.click(screen.getByRole('button', { name: CYCLE_TEXT.checkLabels }));
}

describe('WaterCycleStationPage - step 1, ordering', () => {
  it('starts with an empty board and every card in the tray', () => {
    setup();
    expect(screen.getByText(CYCLE_TEXT.orderingTitle)).toBeTruthy();
    const tray = screen.getByTestId('cycle-tray');
    expect(within(tray).getAllByRole('button')).toHaveLength(4);

    for (let index = 0; index < 4; index += 1) {
      expect(slot(index).className).not.toContain('cycle-slot--filled');
    }

    expect(screen.getByRole('button', { name: CYCLE_TEXT.checkOrder })).toHaveProperty(
      'disabled',
      true,
    );
  });

  it('moves a card into a slot and takes it out again', () => {
    setup();
    placeByClick('evaporation', 0);

    expect(slot(0).className).toContain('cycle-slot--filled');
    expect(screen.queryByTestId('cycle-card-evaporation')).toBeNull();
    expect(screen.getByTestId('cycle-slot-0').getAttribute('aria-label')).toContain(
      PROCESSES.evaporation.name,
    );

    fireEvent.click(slot(0));
    expect(slot(0).className).not.toContain('cycle-slot--filled');
    expect(screen.getByTestId('cycle-card-evaporation')).toBeTruthy();
  });

  it('accepts a dragged card as well as a clicked one', () => {
    setup();
    const dataTransfer = {
      setData: vi.fn(),
      getData: vi.fn(() => 'condensation'),
    };

    fireEvent.dragStart(card('condensation'), { dataTransfer });
    fireEvent.drop(slot(2), { dataTransfer });

    expect(slot(2).className).toContain('cycle-slot--filled');
    expect(dataTransfer.getData).toHaveBeenCalledWith('text/plain');
  });

  it('keeps the pupils progress in the progress bar', () => {
    setup();
    placeByClick('evaporation', 0);
    placeByClick('condensation', 1);

    const bar = screen.getByRole('progressbar', { name: CYCLE_TEXT.progressOrder });
    expect(bar.getAttribute('aria-valuenow')).toBe('2');
  });

  it('tells the pupil when the order is wrong and stays on the board', () => {
    setup();
    placeByClick('precipitation', 0);
    placeByClick('evaporation', 1);
    placeByClick('condensation', 2);
    placeByClick('collection', 3);
    checkOrder();

    expect(screen.getByTestId('cycle-feedback').textContent).toBe(CYCLE_TEXT.orderWrong);
    expect(screen.getByText(CYCLE_TEXT.orderingTitle)).toBeTruthy();
    expect(screen.queryByTestId('cycle-diagram')).toBeNull();
    expect(screen.getByTestId('cycle-slot-0').className).toContain('cycle-slot--wrong');
  });

  it('opens the diagram only when the order is correct', () => {
    setup();
    fillCorrectOrder();
    checkOrder();

    expect(screen.queryByTestId('cycle-feedback')).toBeNull();
    expect(screen.getByText(CYCLE_TEXT.labellingTitle)).toBeTruthy();
    expect(screen.getByTestId('cycle-diagram')).toBeTruthy();
    expect(screen.getByTestId('cycle-label-tray')).toBeTruthy();
  });

  it('restarts to an empty board', () => {
    setup();
    fillCorrectOrder();
    fireEvent.click(screen.getByRole('button', { name: CYCLE_TEXT.restart }));

    expect(slot(0).className).not.toContain('cycle-slot--filled');
    expect(within(screen.getByTestId('cycle-tray')).getAllByRole('button')).toHaveLength(4);
    expect(screen.getByRole('button', { name: CYCLE_TEXT.checkOrder })).toHaveProperty(
      'disabled',
      true,
    );
  });
});

describe('WaterCycleStationPage - step 2, labelling', () => {
  function openDiagram() {
    const view = setup();
    fillCorrectOrder();
    checkOrder();
    return view;
  }

  it('starts with four empty spots and four words', () => {
    openDiagram();
    const tray = screen.getByTestId('cycle-label-tray');
    expect(within(tray).getAllByRole('button')).toHaveLength(4);

    SPOTS.forEach((spot) => {
      const element = screen.getByTestId(`cycle-spot-${spot.id}`);
      expect(element.className).not.toContain('cycle-spot--filled');
      expect(element.textContent).toContain(spot.hint);
    });

    expect(screen.getByRole('button', { name: CYCLE_TEXT.checkLabels })).toHaveProperty(
      'disabled',
      true,
    );
  });

  it('puts a word on a spot and takes it off again', () => {
    openDiagram();
    fireEvent.click(screen.getByTestId('cycle-chip-evaporation'));
    fireEvent.click(screen.getByTestId('cycle-spot-sea'));

    const sea = screen.getByTestId('cycle-spot-sea');
    expect(sea.className).toContain('cycle-spot--filled');
    expect(sea.textContent).toContain(PROCESSES.evaporation.name);
    expect(screen.queryByTestId('cycle-chip-evaporation')).toBeNull();

    fireEvent.click(sea);
    expect(screen.getByTestId('cycle-spot-sea').className).not.toContain('cycle-spot--filled');
    expect(screen.getByTestId('cycle-chip-evaporation')).toBeTruthy();
  });

  it('counts the labels in the progress bar', () => {
    openDiagram();
    fireEvent.click(screen.getByTestId('cycle-chip-evaporation'));
    fireEvent.click(screen.getByTestId('cycle-spot-sea'));

    const bar = screen.getByRole('progressbar', { name: CYCLE_TEXT.progressLabels });
    expect(bar.getAttribute('aria-valuenow')).toBe('1');
  });

  it('marks wrong spots and does not finish', () => {
    const { onComplete } = openDiagram();
    // A real permutation, so every word is still available somewhere in the tray.
    fillLabels({ sea: 'precipitation', cloud: 'evaporation', rain: 'condensation' });
    checkLabels();

    expect(screen.getByTestId('cycle-feedback').textContent).toBe(CYCLE_TEXT.labelsWrong);
    expect(screen.getByTestId('cycle-spot-sea').className).toContain('cycle-spot--wrong');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('finishes the station once every label is right', () => {
    const { onComplete } = openDiagram();
    fillLabels();
    checkLabels();

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(CYCLE_TEXT.finishedTitle)).toBeTruthy();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('does not report an already completed station again', () => {
    const onComplete = vi.fn();
    render(
      <WaterCycleStationPage isAlreadyCompleted onComplete={onComplete} onBackToMap={vi.fn()} />,
    );

    fillCorrectOrder();
    checkOrder();
    fillLabels();
    checkLabels();

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(onComplete).not.toHaveBeenCalled();
  });
});

import { describe, expect, it } from 'vitest';
import {
  checkLabels,
  checkOrder,
  clearLabel,
  clearSlot,
  CYCLE_FACTS,
  createCycleGame,
  isDiagramComplete,
  isTrayComplete,
  placeCard,
  placeLabel,
  PROCESS_ORDER,
  PROCESSES,
  restartCycleGame,
  SLOT_COUNT,
  SPOTS,
  submitLabels,
  submitOrder,
  trayCards,
  trayLabels,
  type CycleState,
} from '../game/waterCycle';

/** Fill the four slots in the correct order. */
function orderedState(): CycleState {
  let state = createCycleGame();
  PROCESS_ORDER.forEach((process, index) => {
    state = placeCard(state, process, index);
  });
  return state;
}

/** Fill every diagram spot with the correct word. */
function labelledState(): CycleState {
  let state = submitOrder(orderedState());
  SPOTS.forEach((spot) => {
    state = placeLabel(state, spot.id, spot.answer);
  });
  return state;
}

describe('water cycle process data', () => {
  it('knows the four stages of the water cycle in order', () => {
    expect(PROCESS_ORDER).toEqual([
      'evaporation',
      'condensation',
      'precipitation',
      'collection',
    ]);
    expect(new Set(PROCESS_ORDER).size).toBe(4);
    PROCESS_ORDER.forEach((id) => {
      expect(PROCESSES[id].name.length).toBeGreaterThan(0);
      expect(PROCESSES[id].english.length).toBeGreaterThan(0);
      expect(PROCESSES[id].short.length).toBeGreaterThan(20);
    });
  });

  it('places the words on the right parts of the diagram', () => {
    const answers = SPOTS.map((spot) => `${spot.id}:${spot.answer}`);
    expect(answers).toEqual([
      'sea:evaporation',
      'cloud:condensation',
      'rain:precipitation',
      'river:collection',
    ]);
  });

  it('keeps the science right: vapour is invisible and the sun drives evaporation', () => {
    const facts = CYCLE_FACTS.join(' ');
    expect(facts).toContain('Wap air tidak kelihatan');
    expect(facts).toContain('Matahari');
    expect(PROCESSES.evaporation.short.toLowerCase()).toContain('tidak kelihatan');
  });
});

describe('ordering the cycle cards', () => {
  it('starts empty with every card still in the tray', () => {
    const state = createCycleGame();
    expect(state.phase).toBe('ordering');
    expect(state.slots).toEqual([null, null, null, null]);
    expect(state.slots).toHaveLength(SLOT_COUNT);
    expect(trayCards(state)).toHaveLength(4);
    expect(isTrayComplete(state)).toBe(false);
  });

  it('moves a card into a slot and back to the tray', () => {
    let state = placeCard(createCycleGame(), 'condensation', 1);
    expect(state.slots[1]).toBe('condensation');
    expect(trayCards(state)).not.toContain('condensation');

    state = clearSlot(state, 1);
    expect(state.slots[1]).toBeNull();
    expect(trayCards(state)).toContain('condensation');
  });

  it('swaps two cards instead of losing one', () => {
    let state = placeCard(createCycleGame(), 'evaporation', 0);
    state = placeCard(state, 'collection', 0);
    expect(state.slots[0]).toBe('collection');
    // evaporation was pushed out of slot 0, but it is still available.
    expect(state.slots).not.toContain('evaporation');
    expect(trayCards(state)).toContain('evaporation');

    state = placeCard(state, 'evaporation', 3);
    expect(state.slots[3]).toBe('evaporation');
    expect(trayCards(state)).not.toContain('evaporation');
    expect(trayCards(state)).toHaveLength(2);
  });

  it('reports which slots are wrong without revealing the answer', () => {
    const wrong = placeCard(createCycleGame(), 'precipitation', 0);
    const result = checkOrder(wrong);
    expect(result.ok).toBe(false);
    expect(result.wrong).toEqual([0, 1, 2, 3]);
    expect(result.wrongSpots).toEqual([]);
  });

  it('only moves on to the diagram when the order is correct', () => {
    let state = placeCard(createCycleGame(), 'precipitation', 0);
    state = submitOrder(state);
    expect(state.phase).toBe('ordering');
    expect(state.attempts).toBe(1);

    const done = submitOrder(orderedState());
    expect(done.phase).toBe('labelling');
    expect(done.attempts).toBe(1);
  });
});

describe('labelling the diagram', () => {
  it('moves a word from the tray onto a spot, and back', () => {
    let state = submitOrder(orderedState());
    expect(trayLabels(state)).toHaveLength(4);

    state = placeLabel(state, 'sea', 'evaporation');
    expect(state.labels.sea).toBe('evaporation');
    expect(trayLabels(state)).not.toContain('evaporation');

    state = clearLabel(state, 'sea');
    expect(state.labels.sea).toBeNull();
    expect(trayLabels(state)).toContain('evaporation');
  });

  it('moves a word between spots instead of copying it', () => {
    let state = submitOrder(orderedState());
    state = placeLabel(state, 'sea', 'evaporation');
    state = placeLabel(state, 'river', 'evaporation');
    expect(state.labels.sea).toBeNull();
    expect(state.labels.river).toBe('evaporation');
    expect(trayLabels(state)).not.toContain('evaporation');
  });

  it('does not accept words before the ordering step is done', () => {
    const state = placeLabel(createCycleGame(), 'sea', 'evaporation');
    expect(state.labels.sea).toBeNull();
  });

  it('marks the spots that are wrong', () => {
    let state = submitOrder(orderedState());
    // A permutation with two misplaced words: sea and rain are swapped.
    state = placeLabel(state, 'sea', 'precipitation');
    state = placeLabel(state, 'rain', 'evaporation');
    state = placeLabel(state, 'cloud', 'condensation');
    state = placeLabel(state, 'river', 'collection');

    const result = checkLabels(state);
    expect(result.ok).toBe(false);
    expect(result.wrongSpots).toEqual(['sea', 'rain']);
  });

  it('finishes only when every label is right', () => {
    let state = submitOrder(orderedState());
    SPOTS.slice(0, 3).forEach((spot) => {
      state = placeLabel(state, spot.id, spot.answer);
    });
    state = submitOrder(state);
    expect(state.phase).toBe('labelling');
    expect(isDiagramComplete(state)).toBe(false);

    state = placeLabel(state, 'river', 'collection');
    expect(isDiagramComplete(state)).toBe(true);
    const finished = submitLabels(state);
    expect(finished.phase).toBe('finished');
  });

  it('restarts back to an untouched board', () => {
    const finished = submitLabels(labelledState());
    expect(finished.phase).toBe('finished');
    expect(restartCycleGame()).toEqual(createCycleGame());
  });
});

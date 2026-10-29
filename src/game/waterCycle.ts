/**
 * Station 5 - Stesen Kitaran Air.
 *
 * Two genuine activities, both state driven:
 *   1. ordering    - drag the four scene cards into slots 1..4 (the water cycle order)
 *   2. labelling   - drag the four word chips onto the places on the diagram
 *
 * Nothing is faked: the slots and the diagram spots really hold the pupil's
 * choices, checking compares them with the key, and the station only reports
 * completion after the diagram is labelled correctly.
 */

export type ProcessId = 'evaporation' | 'condensation' | 'precipitation' | 'collection';

export type SpotId = 'sea' | 'cloud' | 'rain' | 'river';

export interface ProcessInfo {
  id: ProcessId;
  /** Malay name shown to pupils. */
  name: string;
  /** English term in brackets. */
  english: string;
  /** One line describing what happens in the scene. */
  short: string;
}

/** The water cycle, in the order a droplet travels through it. */
export const PROCESS_ORDER: readonly ProcessId[] = [
  'evaporation',
  'condensation',
  'precipitation',
  'collection',
];

export const PROCESSES: Record<ProcessId, ProcessInfo> = {
  evaporation: {
    id: 'evaporation',
    name: 'Penyejatan',
    english: 'Evaporation',
    short: 'Matahari memanaskan air laut. Air bertukar menjadi wap air yang tidak kelihatan.',
  },
  condensation: {
    id: 'condensation',
    name: 'Kondensasi',
    english: 'Condensation',
    short: 'Wap air naik, menyejuk di langit dan bertukar menjadi titisan kecil yang membentuk awan.',
  },
  precipitation: {
    id: 'precipitation',
    name: 'Kerpasan',
    english: 'Precipitation',
    short: 'Titisan air bergabung dan menjadi berat, lalu turun sebagai hujan.',
  },
  collection: {
    id: 'collection',
    name: 'Pengumpulan',
    english: 'Collection',
    short: 'Air hujan mengalir ke sungai, tasik dan laut, sedia untuk dipanaskan semula.',
  },
};

/** Where the word chips have to go on the diagram. */
export const SPOTS: ReadonlyArray<{ id: SpotId; hint: string; answer: ProcessId }> = [
  { id: 'sea', hint: 'Laut yang dipanaskan matahari', answer: 'evaporation' },
  { id: 'cloud', hint: 'Awan di langit', answer: 'condensation' },
  { id: 'rain', hint: 'Hujan yang turun dari awan', answer: 'precipitation' },
  { id: 'river', hint: 'Sungai dan laut tempat air berkumpul', answer: 'collection' },
];

/** Deliberately wrong starting order so the pupil really has to sort it. */
export const STARTING_CARD_ORDER: readonly ProcessId[] = [
  'precipitation',
  'evaporation',
  'collection',
  'condensation',
];

/** The word tray under the diagram, deliberately not in cycle order. */
export const STARTING_LABEL_ORDER: readonly ProcessId[] = [
  'precipitation',
  'collection',
  'evaporation',
  'condensation',
];

export const SLOT_COUNT = 4;

export type CyclePhase = 'ordering' | 'labelling' | 'finished';

export interface CycleState {
  phase: CyclePhase;
  /** Four numbered slots; null = still empty. */
  slots: ReadonlyArray<ProcessId | null>;
  /** What is currently put on each diagram spot. */
  labels: Readonly<Record<SpotId, ProcessId | null>>;
  /** How many times the pupil pressed a check button (for the teacher / tests). */
  attempts: number;
}

export interface CheckResult {
  ok: boolean;
  /** Slot indexes (ordering) or spot ids (labelling) that are wrong. */
  wrong: number[];
  wrongSpots: SpotId[];
}

export function createCycleGame(): CycleState {
  return {
    phase: 'ordering',
    slots: [null, null, null, null],
    labels: { sea: null, cloud: null, rain: null, river: null },
    attempts: 0,
  };
}

/** Cards still waiting in the tray, in the order they are shown. */
export function trayCards(state: CycleState): ProcessId[] {
  const placed = state.slots.filter((slot): slot is ProcessId => slot !== null);
  return STARTING_CARD_ORDER.filter((card) => !placed.includes(card));
}

export function isTrayComplete(state: CycleState): boolean {
  return state.slots.every((slot) => slot !== null);
}

/**
 * Put a card into a numbered slot.
 *
 * If the slot already holds a card the two swap, so nothing can be lost - the
 * pupil can always rearrange without restarting.
 */
export function placeCard(state: CycleState, card: ProcessId, slotIndex: number): CycleState {
  if (state.phase !== 'ordering') return state;
  if (slotIndex < 0 || slotIndex >= SLOT_COUNT) return state;
  if (!PROCESS_ORDER.includes(card)) return state;

  const slots = [...state.slots];
  const from = slots.indexOf(card);

  // A card that already sits in another slot is a move, not a copy.
  if (from >= 0) slots[from] = null;
  const occupant = slots[slotIndex];
  slots[slotIndex] = card;
  if (from >= 0 && occupant) slots[from] = occupant;

  return { ...state, slots };
}

/** Take a card out of a slot and send it back to the tray. */
export function clearSlot(state: CycleState, slotIndex: number): CycleState {
  if (state.phase !== 'ordering') return state;
  if (slotIndex < 0 || slotIndex >= SLOT_COUNT) return state;
  const slots = [...state.slots];
  slots[slotIndex] = null;
  return { ...state, slots };
}

export function checkOrder(state: CycleState): CheckResult {
  const wrong: number[] = [];
  state.slots.forEach((card, index) => {
    if (card !== PROCESS_ORDER[index]) wrong.push(index);
  });
  return { ok: wrong.length === 0, wrong, wrongSpots: [] };
}

/** Check the order and, when it is right, move on to the diagram. */
export function submitOrder(state: CycleState): CycleState {
  if (state.phase !== 'ordering') return state;
  const result = checkOrder(state);
  const attempts = state.attempts + 1;
  if (!result.ok) return { ...state, attempts };
  return { ...state, phase: 'labelling', attempts };
}

/** Put a word on a diagram spot (swapping with whatever is already there). */
export function placeLabel(state: CycleState, spot: SpotId, process: ProcessId): CycleState {
  if (state.phase !== 'labelling') return state;
  if (!SPOTS.some((entry) => entry.id === spot)) return state;
  if (!PROCESS_ORDER.includes(process)) return state;

  const labels = { ...state.labels };
  const previousSpot = (Object.keys(labels) as SpotId[]).find((key) => labels[key] === process);
  if (previousSpot && previousSpot !== spot) labels[previousSpot] = null;
  labels[spot] = process;
  return { ...state, labels };
}

export function clearLabel(state: CycleState, spot: SpotId): CycleState {
  if (state.phase !== 'labelling') return state;
  return { ...state, labels: { ...state.labels, [spot]: null } };
}

/** Word chips that are not on the diagram yet. */
export function trayLabels(state: CycleState): ProcessId[] {
  const used = SPOTS.map((spot) => state.labels[spot.id]).filter(
    (value): value is ProcessId => value !== null,
  );
  return STARTING_LABEL_ORDER.filter((process) => !used.includes(process));
}

export function isDiagramComplete(state: CycleState): boolean {
  return SPOTS.every((spot) => state.labels[spot.id] !== null);
}

export function checkLabels(state: CycleState): CheckResult {
  const wrongSpots: SpotId[] = [];
  SPOTS.forEach((spot) => {
    if (state.labels[spot.id] !== spot.answer) wrongSpots.push(spot.id);
  });
  return { ok: wrongSpots.length === 0, wrong: [], wrongSpots };
}

/** Check the diagram and finish the station when every label is right. */
export function submitLabels(state: CycleState): CycleState {
  if (state.phase !== 'labelling') return state;
  const result = checkLabels(state);
  const attempts = state.attempts + 1;
  if (!result.ok) return { ...state, attempts };
  return { ...state, phase: 'finished', attempts };
}

export function restartCycleGame(): CycleState {
  return createCycleGame();
}

export const CYCLE_TEXT = {
  eyebrow: 'STESEN 5 · KITARAN AIR',
  title: 'Kitaran Air',
  englishTitle: 'Water Cycle',
  mission: 'Susun peringkat kitaran air, kemudian label rajahnya.',
  orderingTitle: 'Susun peringkat kitaran air',
  orderingIntro:
    'Seret kad ke petak 1 hingga 4 mengikut urutan yang betul. Anda juga boleh klik kad, kemudian klik petak.',
  labellingTitle: 'Label rajah kitaran air',
  labellingIntro:
    'Seret perkataan di bawah ke tempat yang betul pada rajah. Klik label untuk mengembalikannya.',
  slotLabel: 'Petak',
  trayTitle: 'Kad proses',
  labelsTitle: 'Perkataan',
  checkOrder: 'Semak susunan',
  checkLabels: 'Semak label',
  remove: 'Keluarkan',
  restart: 'Mula semula',
  progressOrder: 'Kad dalam petak',
  progressLabels: 'Label pada rajah',
  orderWrong:
    'Belum tepat. Ingat: air menyejat dahulu, kemudian wap air menyejuk menjadi awan, hujan turun, dan akhirnya air berkumpul semula di sungai dan laut.',
  orderRight: 'Susunan betul! Sekarang letakkan perkataan pada rajah kitaran air.',
  labelsWrong:
    'Masih ada label yang belum tepat. Perhatikan tempatnya: laut dipanaskan matahari, awan terbentuk di langit, hujan turun dari awan, dan air berkumpul di sungai serta laut.',
  labelsRight: 'Tahniah! Rajah kitaran air sudah lengkap.',
  finishedTitle: 'Kitaran air lengkap!',
  finishedText:
    'Anda telah menyusun dan melabel keseluruhan kitaran air. Inilah kitaran yang berterusan dan membekalkan air bersih kepada semua hidupan.',
  playAgain: 'Main lagi',
  backToMap: 'Kembali ke peta',
  wallyOrdering: 'Mulakan dari laut: matahari memanaskan air, lalu wap air naik ke langit.',
  wallyLabelling: 'Letakkan perkataan tepat pada tempat yang menunjukkan proses itu berlaku.',
  wallyFinished: 'Kitaran air tidak pernah berhenti. Ia berulang sepanjang masa!',
} as const;

export const CYCLE_FACTS: readonly string[] = [
  'Matahari membekalkan tenaga untuk penyejatan. Air boleh menyejat walaupun belum mencapai takat didih.',
  'Wap air tidak kelihatan. Awan yang kita lihat terdiri daripada titisan air yang sangat kecil dan hablur ais.',
  'Kerpasan termasuk hujan, salji dan hujan batu, bergantung pada suhu udara.',
  'Kitaran air berterusan, tetapi setiap titisan air boleh melalui laluan yang berbeza.',
];

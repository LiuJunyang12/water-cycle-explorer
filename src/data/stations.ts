/**
 * The six exploration stations of the adventure map.
 *
 * Order is the learning sequence (and the unlock sequence):
 *  1 Khemah          — video intro (starting point)
 *  2 Pantai Cerah    — evaporation
 *  3 Kerajaan Awan   — cloud formation
 *  4 Lembah Air Terjun — precipitation and water collection
 *  5 Stesen Kitaran Air — ordering + diagram building
 *  6 Makmal Cabaran Sains — final quiz
 *
 * `position` is a percentage of the map artwork (825 x 1024). It marks where the
 * station marker hangs: every marker is anchored just BELOW its landmark, so the
 * badge and its label never cover the drawing they belong to.
 */

export type StationId =
  | 'camp'
  | 'sunny-coast'
  | 'cloud-kingdom'
  | 'waterfall-valley'
  | 'water-cycle-station'
  | 'challenge-lab';

export interface StationCompletion {
  stationId: StationId;
  /** ISO timestamp of the first time the pupil finished this station. */
  completedAt: string;
}

export interface StationPosition {
  x: number;
  y: number;
}

export interface Station {
  id: StationId;
  /** 1-based position in the learning sequence. */
  order: number;
  /** Malay name shown to pupils. */
  name: string;
  /** English name, shown smaller for reference. */
  englishName: string;
  /** What the pupil does here (Malay, one short line). */
  focus: string;
  position: StationPosition;
}

export const STATIONS: Station[] = [
  {
    id: 'camp',
    order: 1,
    name: 'Khemah',
    englishName: 'Camp',
    focus: 'Tonton video pengenalan',
    position: { x: 52, y: 87 },
  },
  {
    id: 'sunny-coast',
    order: 2,
    name: 'Pantai Cerah',
    englishName: 'Sunny Coast',
    focus: 'Penyejatan air',
    position: { x: 28, y: 77 },
  },
  {
    id: 'cloud-kingdom',
    order: 3,
    name: 'Kerajaan Awan',
    englishName: 'Cloud Kingdom',
    focus: 'Pembentukan awan',
    position: { x: 56, y: 57 },
  },
  {
    id: 'waterfall-valley',
    order: 4,
    name: 'Lembah Air Terjun',
    englishName: 'Waterfall Valley',
    focus: 'Kerpasan dan pengumpulan air',
    position: { x: 84, y: 72 },
  },
  {
    id: 'water-cycle-station',
    order: 5,
    name: 'Stesen Kitaran Air',
    englishName: 'Water Cycle Station',
    focus: 'Susun peringkat dan bina rajah',
    position: { x: 63, y: 35 },
  },
  {
    id: 'challenge-lab',
    order: 6,
    name: 'Makmal Cabaran Sains',
    englishName: 'Science Challenge Lab',
    focus: 'Cabaran kuiz akhir',
    position: { x: 52, y: 24 },
  },
];

export const FIRST_STATION_ID: StationId = 'camp';

/** A station is completed, playable now, or still locked behind earlier stations. */
export type StationStatus = 'completed' | 'current' | 'locked';

export function getStationStatus(
  stationId: StationId,
  completedStationIds: readonly StationId[],
): StationStatus {
  if (completedStationIds.includes(stationId)) return 'completed';

  const station = STATIONS.find((entry) => entry.id === stationId);
  if (!station) return 'locked';

  // Unlocked only when every earlier station in the sequence is completed.
  const earlierStations = STATIONS.filter((entry) => entry.order < station.order);
  const allEarlierCompleted = earlierStations.every((entry) =>
    completedStationIds.includes(entry.id),
  );

  return allEarlierCompleted ? 'current' : 'locked';
}

export function countCompletedStations(completedStationIds: readonly StationId[]): number {
  return STATIONS.filter((station) => completedStationIds.includes(station.id)).length;
}

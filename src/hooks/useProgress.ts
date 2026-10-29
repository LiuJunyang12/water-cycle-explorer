import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  countCompletedStations,
  STATIONS,
  type StationCompletion,
  type StationId,
  type StationStatus,
  getStationStatus,
} from '../data/stations';

const PROGRESS_STORAGE_KEY = 'wce:progress';
const PROGRESS_STORAGE_VERSION = 2;

function isStationId(value: unknown): value is StationId {
  return typeof value === 'string' && STATIONS.some((station) => station.id === value);
}

function toIso(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

/**
 * Accepts every shape this key has had:
 *  - v1: ["camp", "sunny-coast"]
 *  - v2: { version: 2, completions: [{ stationId, completedAt }] }
 * Entries written before timestamps existed get the moment they are first read.
 */
export function parseStoredCompletions(raw: string | null, now = new Date()): StationCompletion[] {
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  const record = parsed as {
    completions?: unknown;
    completedStationIds?: unknown;
  };
  const entries: unknown[] = Array.isArray(parsed)
    ? parsed
    : Array.isArray(record?.completions)
      ? record.completions
      : Array.isArray(record?.completedStationIds)
        ? record.completedStationIds
        : [];

  const fallback = now.toISOString();
  const byStation = new Map<StationId, string>();
  for (const entry of entries) {
    const stationId =
      typeof entry === 'string'
        ? entry
        : (entry as { stationId?: unknown; id?: unknown })?.stationId ??
          (entry as { id?: unknown })?.id;
    if (!isStationId(stationId) || byStation.has(stationId)) continue;

    const completedAt =
      typeof entry === 'string'
        ? fallback
        : toIso((entry as { completedAt?: unknown })?.completedAt) ??
          toIso((entry as { at?: unknown })?.at) ??
          fallback;

    byStation.set(stationId, completedAt);
  }

  // Keep the learning order, so the report reads like the journey.
  return STATIONS.filter((station) => byStation.has(station.id)).map((station) => ({
    stationId: station.id,
    completedAt: byStation.get(station.id)!,
  }));
}

/** Reads completed station ids, ignoring anything that is not a real station. */
export function readStoredProgress(): StationId[] {
  return parseStoredCompletions(window.localStorage.getItem(PROGRESS_STORAGE_KEY)).map(
    (entry) => entry.stationId,
  );
}

/** The full stored record, including when each station was first finished. */
export function readStoredCompletions(): StationCompletion[] {
  return parseStoredCompletions(window.localStorage.getItem(PROGRESS_STORAGE_KEY));
}

function persistProgress(completions: StationCompletion[]): void {
  try {
    window.localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({ version: PROGRESS_STORAGE_VERSION, completions }),
    );
  } catch {
    /* Storage can be unavailable (private mode); progress then lasts this session only. */
  }
}

export interface ProgressState {
  completedStationIds: StationId[];
  /** Completed stations in learning order, with the timestamp of the first finish. */
  completions: StationCompletion[];
  completedCount: number;
  totalCount: number;
  getStatus: (stationId: StationId) => StationStatus;
  /** Records a station as genuinely finished. Called by each station page. */
  completeStation: (stationId: StationId) => void;
}

/**
 * Learning progress, persisted per browser/device.
 *
 * This is deliberately NOT a server-side record: the site has no accounts or
 * database, so the UI must never claim progress is stored permanently.
 */
export function useProgress(): ProgressState {
  const [completions, setCompletions] = useState<StationCompletion[]>(readStoredCompletions);

  useEffect(() => {
    persistProgress(completions);
  }, [completions]);

  const completeStation = useCallback((stationId: StationId) => {
    setCompletions((previous) =>
      previous.some((entry) => entry.stationId === stationId)
        ? previous
        : [...previous, { stationId, completedAt: new Date().toISOString() }],
    );
  }, []);

  const completedStationIds = useMemo(
    () => completions.map((entry) => entry.stationId),
    [completions],
  );

  const getStatus = useCallback(
    (stationId: StationId) => getStationStatus(stationId, completedStationIds),
    [completedStationIds],
  );

  return useMemo(
    () => ({
      completedStationIds,
      completions,
      completedCount: countCompletedStations(completedStationIds),
      totalCount: STATIONS.length,
      getStatus,
      completeStation,
    }),
    [completedStationIds, completions, getStatus, completeStation],
  );
}

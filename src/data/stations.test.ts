import { describe, expect, test } from 'vitest';
import {
  countCompletedStations,
  FIRST_STATION_ID,
  getStationStatus,
  STATIONS,
  type StationId,
} from './stations';

describe('station sequence', () => {
  test('has six stations in the expected learning order', () => {
    expect(STATIONS).toHaveLength(6);
    expect(STATIONS.map((station) => station.order)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(STATIONS.map((station) => station.id)).toEqual([
      'camp',
      'sunny-coast',
      'cloud-kingdom',
      'waterfall-valley',
      'water-cycle-station',
      'challenge-lab',
    ]);
    expect(STATIONS[0].id).toBe(FIRST_STATION_ID);
  });
});

describe('getStationStatus', () => {
  test('only the first station is playable before any progress', () => {
    const completed: StationId[] = [];

    expect(getStationStatus('camp', completed)).toBe('current');
    for (const station of STATIONS.slice(1)) {
      expect(getStationStatus(station.id, completed)).toBe('locked');
    }
  });

  test('unlocks the next station only after the previous one is completed', () => {
    expect(getStationStatus('sunny-coast', ['camp'])).toBe('current');
    expect(getStationStatus('camp', ['camp'])).toBe('completed');
    // Cloud Kingdom still needs Sunny Coast.
    expect(getStationStatus('cloud-kingdom', ['camp'])).toBe('locked');

    expect(getStationStatus('cloud-kingdom', ['camp', 'sunny-coast'])).toBe('current');
    expect(getStationStatus('waterfall-valley', ['camp', 'sunny-coast'])).toBe('locked');
  });

  test('a completed station stays completed and does not lock again', () => {
    const completed: StationId[] = ['camp', 'sunny-coast'];
    expect(getStationStatus('camp', completed)).toBe('completed');
    expect(getStationStatus('sunny-coast', completed)).toBe('completed');
  });

  test('does not unlock later stations when an earlier one is skipped', () => {
    expect(getStationStatus('challenge-lab', ['camp', 'sunny-coast', 'cloud-kingdom'])).toBe(
      'locked',
    );
    expect(
      getStationStatus('challenge-lab', [
        'camp',
        'sunny-coast',
        'cloud-kingdom',
        'waterfall-valley',
        'water-cycle-station',
      ]),
    ).toBe('current');
  });

  test('counts only real stations', () => {
    expect(countCompletedStations([])).toBe(0);
    expect(countCompletedStations(['camp', 'sunny-coast'])).toBe(2);
    expect(countCompletedStations(['nonsense' as StationId, 'camp'])).toBe(1);
  });
});

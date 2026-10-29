import { describe, expect, it } from 'vitest';
import { parseStoredCompletions, readStoredCompletions, readStoredProgress } from './useProgress';

const NOW = new Date('2026-10-29T10:00:00.000Z');

describe('parseStoredCompletions', () => {
  it('reads the old id-only format and keeps learning order', () => {
    const raw = JSON.stringify(['challenge-lab', 'camp', 'sunny-coast']);

    const completions = parseStoredCompletions(raw, NOW);

    expect(completions.map((entry) => entry.stationId)).toEqual(['camp', 'sunny-coast', 'challenge-lab']);
    expect(completions[0].completedAt).toBe(NOW.toISOString());
  });

  it('reads version 2 with real timestamps', () => {
    const raw = JSON.stringify({
      version: 2,
      completions: [
        { stationId: 'camp', completedAt: '2026-10-28T09:00:00.000Z' },
        { stationId: 'waterfall-valley', completedAt: '2026-10-28T10:30:00.000Z' },
      ],
    });

    const completions = parseStoredCompletions(raw, NOW);

    expect(completions).toEqual([
      { stationId: 'camp', completedAt: '2026-10-28T09:00:00.000Z' },
      { stationId: 'waterfall-valley', completedAt: '2026-10-28T10:30:00.000Z' },
    ]);
  });

  it('drops unknown ids, duplicates and broken timestamps', () => {
    const raw = JSON.stringify({
      completions: [
        { stationId: 'camp', completedAt: 'not-a-date' },
        { stationId: 'camp', completedAt: '2026-10-28T09:00:00.000Z' },
        { stationId: 'moon-base', completedAt: '2026-10-28T09:00:00.000Z' },
        { id: 'sunny-coast' },
      ],
    });

    const completions = parseStoredCompletions(raw, NOW);

    expect(completions.map((entry) => entry.stationId)).toEqual(['camp', 'sunny-coast']);
    expect(completions[0].completedAt).toBe(NOW.toISOString());
    expect(completions[1].completedAt).toBe(NOW.toISOString());
  });

  it('survives missing or corrupt storage', () => {
    expect(parseStoredCompletions(null)).toEqual([]);
    expect(parseStoredCompletions('{oops')).toEqual([]);
    expect(parseStoredCompletions('123')).toEqual([]);
  });
});

describe('storage readers', () => {
  it('keeps the simple id list working for the map', () => {
    window.localStorage.setItem('wce:progress', JSON.stringify(['camp', 'sunny-coast']));

    expect(readStoredProgress()).toEqual(['camp', 'sunny-coast']);
    expect(readStoredCompletions()).toHaveLength(2);
  });
});

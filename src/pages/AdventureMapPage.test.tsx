import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import type { StationId } from '../data/stations';
import { AdventureMapPage } from './AdventureMapPage';

const noop = () => {};
const noopStation = () => {};

function renderMap(completedStationIds: StationId[] = []) {
  return render(
    <AdventureMapPage
      completedStationIds={completedStationIds}
      onOpenStation={noopStation}
      onBackHome={noop}
    />,
  );
}

describe('AdventureMapPage', () => {
  test('renders the six stations and the real progress count', () => {
    renderMap();

    expect(screen.getAllByRole('button', { name: /^Stesen \d/ })).toHaveLength(6);
    expect(screen.getByText('0 / 6')).toBeInTheDocument();
  });

  test('only the first station is playable before any progress', () => {
    renderMap();

    expect(screen.getByRole('button', { name: /Stesen 1: Khemah/ })).toHaveAttribute(
      'aria-disabled',
      'false',
    );
    expect(screen.getByRole('button', { name: /Stesen 2: Pantai Cerah/ })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('button', { name: /Stesen 6: Makmal Cabaran Sains/ })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  test('a locked station explains which station must be finished first', async () => {
    const user = userEvent.setup();
    const onOpenStation = vi.fn();
    render(
      <AdventureMapPage
        completedStationIds={[]}
        onOpenStation={onOpenStation}
        onBackHome={noop}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Stesen 3: Kerajaan Awan/ }));

    expect(screen.getByRole('status')).toHaveTextContent(
      'Selesaikan Pantai Cerah dahulu untuk membuka Kerajaan Awan.',
    );
    expect(onOpenStation).not.toHaveBeenCalled();
  });

  test('the playable station opens when clicked', async () => {
    const user = userEvent.setup();
    const onOpenStation = vi.fn();
    render(
      <AdventureMapPage
        completedStationIds={[]}
        onOpenStation={onOpenStation}
        onBackHome={noop}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Stesen 1: Khemah/ }));

    expect(onOpenStation).toHaveBeenCalledWith('camp');
  });

  test('completing a station lights up the next one and updates progress', () => {
    renderMap(['camp']);

    expect(screen.getByText('1 / 6')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Stesen 1: Khemah.*selesai/i })).toHaveAttribute(
      'aria-disabled',
      'false',
    );
    expect(
      screen.getByRole('button', { name: /Stesen 2: Pantai Cerah.*boleh dibuka/i }),
    ).toHaveAttribute('aria-disabled', 'false');
    // Cloud Kingdom is still two steps away.
    expect(screen.getByRole('button', { name: /Stesen 3: Kerajaan Awan/ })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });
});

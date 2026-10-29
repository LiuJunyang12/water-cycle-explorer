import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import App from './App';

describe('opening station 3 from the adventure map', () => {
  beforeEach(() => {
    window.localStorage.setItem('wce:progress', JSON.stringify(['camp', 'sunny-coast']));
  });

  test('renders the Cloud Kingdom page', () => {
    const errors: string[] = [];
    const spy = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      errors.push(args.map((arg) => String(arg)).join(' '));
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /MULA PENGEMBARAAN/i }));

    // Station 3 must really open (this used to be a silent white screen).
    fireEvent.click(screen.getByRole('button', { name: /Stesen 3/ }));

    expect(errors).toEqual([]);
    expect(screen.queryByText('MISSION TO CLOUD KINGDOM')).not.toBeNull();
    expect(screen.queryByTestId('quest-scene')).not.toBeNull();
    expect(screen.queryByText(/tidak dapat dipaparkan/)).toBeNull();
    spy.mockRestore();
  });
});

describe('opening station 4 from the adventure map', () => {
  beforeEach(() => {
    window.localStorage.setItem(
      'wce:progress',
      JSON.stringify(['camp', 'sunny-coast', 'cloud-kingdom']),
    );
  });

  test('renders the rain gathering page', () => {
    const errors: string[] = [];
    const spy = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      errors.push(args.map((arg) => String(arg)).join(' '));
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /MULA PENGEMBARAAN/i }));

    // Station 4 is now a real page instead of the "not built yet" placeholder.
    fireEvent.click(screen.getByRole('button', { name: /Stesen 4/ }));

    expect(errors).toEqual([]);
    expect(
      screen.getByRole('heading', { name: 'Hujan di Lembah Air Terjun' }),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId('rain-droplet')).toHaveLength(12);
    expect(screen.queryByText(/belum dibina/)).toBeNull();
    spy.mockRestore();
  });
});

describe('opening station 5 from the adventure map', () => {
  beforeEach(() => {
    window.localStorage.setItem(
      'wce:progress',
      JSON.stringify(['camp', 'sunny-coast', 'cloud-kingdom', 'waterfall-valley']),
    );
  });

  test('renders the water cycle station page', () => {
    const errors: string[] = [];
    const spy = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      errors.push(args.map((arg) => String(arg)).join(' '));
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /MULA PENGEMBARAAN/i }));

    // Station 5 is now a real page: arrange the cards, then label the diagram.
    fireEvent.click(screen.getByRole('button', { name: /Stesen 5/ }));

    expect(errors).toEqual([]);
    expect(screen.getByRole('heading', { name: /Kitaran Air/ })).toBeInTheDocument();
    expect(screen.getByText('Susun peringkat kitaran air')).toBeInTheDocument();
    expect(screen.getAllByTestId(/^cycle-slot-/)).toHaveLength(4);
    expect(screen.queryByText(/belum dibina/)).toBeNull();
    spy.mockRestore();
  });
});

describe('opening station 6 from the adventure map', () => {
  beforeEach(() => {
    window.localStorage.setItem(
      'wce:progress',
      JSON.stringify([
        'camp',
        'sunny-coast',
        'cloud-kingdom',
        'waterfall-valley',
        'water-cycle-station',
      ]),
    );
  });

  test('renders the science challenge quiz', () => {
    const errors: string[] = [];
    const spy = vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      errors.push(args.map((arg) => String(arg)).join(' '));
    });

    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /MULA PENGEMBARAAN/i }));

    // Station 6 is now a real page: Wally asks, the pupil picks one of four answers.
    fireEvent.click(screen.getByRole('button', { name: /Stesen 6/ }));

    expect(errors).toEqual([]);
    expect(screen.getByRole('heading', { name: /Cabaran Saintis Kecil/ })).toBeInTheDocument();
    expect(document.querySelectorAll('.lab-option')).toHaveLength(4);
    expect(screen.queryByText(/belum dibina/)).toBeNull();
    spy.mockRestore();
  });
});

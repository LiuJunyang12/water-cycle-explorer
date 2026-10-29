import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { MusicPlayer } from './MusicPlayer';

describe('MusicPlayer', () => {
  test('starts the default track and exposes the picker', async () => {
    const user = userEvent.setup();
    render(<MusicPlayer />);

    const button = screen.getByRole('button', { name: /Tetapan muzik/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    await user.click(button);

    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(2);
    expect(radios[0]).toBeChecked();
  });

  test('mute toggle really flips the audio element and the button state', async () => {
    const user = userEvent.setup();
    render(<MusicPlayer />);

    await user.click(screen.getByRole('button', { name: /Tetapan muzik/i }));
    await user.click(screen.getByRole('button', { name: 'Senyapkan muzik' }));

    const unmuteButton = screen.getByRole('button', { name: 'Bunyikan muzik' });
    expect(unmuteButton).toHaveAttribute('aria-pressed', 'true');
    expect(window.localStorage.getItem('wce:music-muted')).toBe('true');
  });

  test('selecting the second track is remembered', async () => {
    const user = userEvent.setup();
    render(<MusicPlayer />);

    await user.click(screen.getByRole('button', { name: /Tetapan muzik/i }));
    const radios = screen.getAllByRole('radio');
    await user.click(radios[1]);

    expect(radios[1]).toBeChecked();
    expect(window.localStorage.getItem('wce:music-track')).toBe('chinese');
  });

  test('asks for a tap when the browser blocks audible autoplay', async () => {
    const playMock = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockRejectedValue(new DOMException('blocked', 'NotAllowedError'));

    render(<MusicPlayer />);

    expect(
      await screen.findByText(/Klik di mana-mana pada skrin untuk membunyikan muzik/i),
    ).toBeInTheDocument();

    playMock.mockRestore();
  });
});

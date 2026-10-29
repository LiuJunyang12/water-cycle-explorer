import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  test('shows the site title and the start button', () => {
    render(<HomePage onStart={() => {}} onOpenEbook={() => {}} />);

    expect(screen.getByRole('heading', { name: 'Jom Terokai Kitaran Air!' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'MULA PENGEMBARAAN' })).toBeInTheDocument();
  });

  test('calls onStart when the start button is pressed', async () => {
    const user = userEvent.setup();
    const onStart = vi.fn();
    render(<HomePage onStart={onStart} onOpenEbook={() => {}} />);

    await user.click(screen.getByRole('button', { name: 'MULA PENGEMBARAAN' }));

    expect(onStart).toHaveBeenCalledTimes(1);
  });

  test('offers a shortcut that opens the offline e-book', async () => {
    const user = userEvent.setup();
    const onOpenEbook = vi.fn();
    render(<HomePage onStart={() => {}} onOpenEbook={onOpenEbook} />);

    const shortcut = screen.getByRole('button', { name: 'Baca e-buku' });
    await user.click(shortcut);

    expect(onOpenEbook).toHaveBeenCalledTimes(1);
  });

  test('renders the blurred artwork as a decorative image', () => {
    render(<HomePage onStart={() => {}} onOpenEbook={() => {}} />);

    const background = document.querySelector('.home__backdrop-image');
    expect(background).not.toBeNull();
    expect(background).toHaveAttribute('alt', '');
    expect(background).toHaveAttribute('src', expect.stringContaining('home-bg.jpeg'));
  });
});

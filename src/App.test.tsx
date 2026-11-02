import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import App from './App';

describe('App navigation shell', () => {
  test('start button opens the adventure map and the map can return home', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'MULA PENGEMBARAAN' }));
    expect(screen.getByRole('heading', { name: 'PETA PENGEMBARAAN' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Halaman Utama' }));
    expect(screen.getByRole('heading', { name: 'Jom Terokai Kitaran Air!' })).toBeInTheDocument();
  });

  test('opening the first station shows the video station and returns to the map', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    await user.click(screen.getByRole('button', { name: 'MULA PENGEMBARAAN' }));
    await user.click(screen.getByRole('button', { name: /Stesen 1: Khemah/ }));

    expect(screen.getByRole('heading', { name: 'Khemah' })).toBeInTheDocument();
    expect(container.querySelector('video')).not.toBeNull();
    expect(screen.getByText(/Tonton video ini hingga tamat/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Kembali ke Peta' }));
    expect(screen.getByRole('heading', { name: 'PETA PENGEMBARAAN' })).toBeInTheDocument();
  });

  test('menu drawer lists the four entries and opens the student profile dialog', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Buka menu' }));

    const drawer = screen.getByRole('dialog', { name: 'Menu utama' });
    expect(within(drawer).getByRole('button', { name: /MAKLUMAT PELAJAR/ })).toBeInTheDocument();
    expect(within(drawer).getByRole('button', { name: /OFFLINE E-BOOK/ })).toBeInTheDocument();
    expect(within(drawer).getByRole('button', { name: /OBJEKTIF/ })).toBeInTheDocument();
    expect(within(drawer).getByRole('button', { name: /MAKLUM BALAS/ })).toBeInTheDocument();

    await user.click(within(drawer).getByRole('button', { name: /MAKLUMAT PELAJAR/ }));

    const profileDialog = screen.getByRole('dialog', { name: 'MAKLUMAT PELAJAR' });
    expect(within(profileDialog).getByText('NAMA')).toBeInTheDocument();
    expect(within(profileDialog).getByText('LIU JUN YANG')).toBeInTheDocument();
    expect(within(profileDialog).getByText('TS. SHUFIANAH PUTERI YUSOF')).toBeInTheDocument();
    // The supplied portrait is rendered with real alternative text.
    expect(
      within(profileDialog).getByRole('img', { name: 'Foto pelajar LIU JUN YANG' }),
    ).toBeInTheDocument();
    // All details are present, so the pending note must not be shown.
    expect(within(profileDialog).queryByText(/akan dikemas kini/)).not.toBeInTheDocument();
  });

  test('the objectives dialog lists the four RPH objectives', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Buka menu' }));
    await user.click(screen.getByRole('button', { name: /OBJEKTIF/ }));

    const dialog = screen.getByRole('dialog', { name: 'OBJEKTIF PEMBELAJARAN' });
    expect(within(dialog).getByText('Pada akhir pembelajaran, murid dapat:')).toBeInTheDocument();
    expect(within(dialog).getAllByRole('listitem')).toHaveLength(4);
    expect(
      within(dialog).getByText(/Menghasilkan rajah digital kitaran air yang lengkap/),
    ).toBeInTheDocument();
  });

  test('the cover shortcut opens the e-book without using the menu', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Baca e-buku' }));

    expect(screen.getByRole('dialog', { name: 'OFFLINE E-BOOK' })).toBeInTheDocument();
  });

  test('the e-book dialog offers the supplied PDF for reading and download', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Buka menu' }));
    await user.click(screen.getByRole('button', { name: /OFFLINE E-BOOK/ }));

    const ebookDialog = screen.getByRole('dialog', { name: 'OFFLINE E-BOOK' });
    expect(within(ebookDialog).getByRole('link', { name: /Muat Turun/ })).toHaveAttribute(
      'href',
      expect.stringContaining('assets/ebook/offline-ebook.pdf'),
    );
    expect(within(ebookDialog).getByRole('link', { name: 'Baca dalam talian' })).toHaveAttribute(
      'target',
      '_blank',
    );
    expect(within(ebookDialog).queryByText(/belum tersedia/i)).not.toBeInTheDocument();
  });

  test('the feedback entry opens the QR dialog from the menu', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Buka menu' }));
    await user.click(screen.getByRole('button', { name: /MAKLUM BALAS/ }));

    const dialog = screen.getByRole('dialog', { name: 'MAKLUM BALAS' });
    // The QR slot and the instructions are always shown…
    expect(within(dialog).getByTestId('feedback-qr')).toBeInTheDocument();
    expect(within(dialog).getAllByRole('listitem')).toHaveLength(3);
    // …and the real form is one tap away, in a new tab.
    const openForm = within(dialog).getByRole('link', { name: /Buka borang maklum balas/ });
    expect(openForm).toHaveAttribute('href', 'https://forms.gle/r3EUwJfyLJai7b7u9');
    expect(openForm).toHaveAttribute('target', '_blank');
  });

  test('Escape closes the open dialog', async () => {    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Buka menu' }));
    await user.click(screen.getByRole('button', { name: /OBJEKTIF/ }));
    expect(screen.getByRole('dialog', { name: 'OBJEKTIF PEMBELAJARAN' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'OBJEKTIF PEMBELAJARAN' })).not.toBeInTheDocument();
  });
});

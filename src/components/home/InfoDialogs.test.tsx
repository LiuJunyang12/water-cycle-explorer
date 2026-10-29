import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { OFFLINE_EBOOK } from '../../data/homeContent';
import { OfflineEbookDialog } from './InfoDialogs';

describe('OfflineEbookDialog', () => {
  test('offers the real PDF once the file is available', () => {
    render(<OfflineEbookDialog isOpen onClose={() => {}} />);

    expect(screen.getByRole('heading', { name: OFFLINE_EBOOK.title })).toBeInTheDocument();

    const download = screen.getByRole('link', { name: /Muat Turun/ });
    expect(download).toHaveAttribute('href', expect.stringContaining('assets/ebook/offline-ebook.pdf'));
    expect(download).toHaveAttribute('download', OFFLINE_EBOOK.fileName);
  });

  test('lets the pupil read the e-book without saving it first', () => {
    render(<OfflineEbookDialog isOpen onClose={() => {}} />);

    const readOnline = screen.getByRole('link', { name: 'Baca dalam talian' });
    expect(readOnline).toHaveAttribute('href', expect.stringContaining('offline-ebook.pdf'));
    expect(readOnline).toHaveAttribute('target', '_blank');
    expect(readOnline).toHaveAttribute('rel', 'noreferrer');
  });

  test('states the file details instead of the pending note', () => {
    render(<OfflineEbookDialog isOpen onClose={() => {}} />);

    expect(screen.getByText(OFFLINE_EBOOK.meta ?? '')).toBeInTheDocument();
    expect(screen.queryByText(OFFLINE_EBOOK.pendingNote)).toBeNull();
  });
});

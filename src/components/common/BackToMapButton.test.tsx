import { describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { BackToMapButton } from './BackToMapButton';

describe('BackToMapButton', () => {
  test('looks like the floating button of the first station', () => {
    render(<BackToMapButton onClick={() => {}} />);

    const button = screen.getByRole('button', { name: 'Kembali ke peta' });
    expect(button).toHaveClass('back-to-map');
    expect(button).toHaveClass('glass-surface');
    expect(button.querySelector('svg')).not.toBeNull();
  });

  test('goes back to the map when pressed', () => {
    const onClick = vi.fn();
    render(<BackToMapButton onClick={onClick} />);

    fireEvent.click(screen.getByRole('button', { name: 'Kembali ke peta' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
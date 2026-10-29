import './MenuButton.css';

interface MenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

/** Floating frosted-glass menu button with three bars (top-left). */
export function MenuButton({ isOpen, onClick }: MenuButtonProps) {
  return (
    <button
      type="button"
      className="menu-button glass-surface"
      aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
      aria-expanded={isOpen}
      aria-controls="app-menu-drawer"
      onClick={onClick}
    >
      <span className="menu-button__bar" aria-hidden="true" />
      <span className="menu-button__bar" aria-hidden="true" />
      <span className="menu-button__bar" aria-hidden="true" />
    </button>
  );
}

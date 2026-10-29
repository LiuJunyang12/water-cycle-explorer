import { useEffect, useRef } from 'react';
import { CloseIcon } from '../common/CloseIcon';
import { MENU_ITEMS, type MenuSectionId } from '../../data/menuItems';
import './MenuDrawer.css';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (sectionId: MenuSectionId) => void;
}

/** Slide-out drawer opened by the frosted-glass menu button. */
export function MenuDrawer({ isOpen, onClose, onSelect }: MenuDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Move focus into the drawer and close it with Escape.
  useEffect(() => {
    if (!isOpen) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="menu-drawer">
      <div className="menu-drawer__backdrop" onClick={onClose} aria-hidden="true" />
      <div
        id="app-menu-drawer"
        ref={drawerRef}
        className="menu-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Menu utama"
      >
        <div className="menu-drawer__header">
          <p className="menu-drawer__title">MENU</p>
          <button
            type="button"
            ref={closeButtonRef}
            className="menu-drawer__close"
            onClick={onClose}
            aria-label="Tutup menu"
          >
            <CloseIcon />
          </button>
        </div>

        <nav aria-label="Menu utama">
          <ul className="menu-drawer__list">
            {MENU_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="menu-drawer__item"
                  onClick={() => onSelect(item.id)}
                >
                  <span className="menu-drawer__item-label">{item.label}</span>
                  <span className="menu-drawer__item-description">{item.description}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

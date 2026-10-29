interface BackToMapButtonProps {
  onClick: () => void;
  label?: string;
}

/**
 * Circular glass button that takes the player back to the adventure map.
 * Mirrors the floating button of the first station so every station shares the
 * same affordance instead of a text link.
 */
export function BackToMapButton({ onClick, label = 'Kembali ke peta' }: BackToMapButtonProps) {
  return (
    <button
      type="button"
      className="back-to-map glass-surface"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M9 5 4 7.5v11L9 16l6 2.5 5-2.5v-11L15 8 9 5.5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M9 5.5v11M15 8v10.5" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    </button>
  );
}
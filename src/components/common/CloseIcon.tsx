interface CloseIconProps {
  size?: number;
}

/**
 * Inline cross icon. An SVG is used instead of the "×" text glyph because the
 * glyph sits slightly below the optical centre of a circular button.
 */
export function CloseIcon({ size = 18 }: CloseIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

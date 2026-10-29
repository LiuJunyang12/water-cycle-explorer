import './PagePlaceholder.css';

interface PagePlaceholderProps {
  title: string;
  description: string;
  onBack: () => void;
  /** Label of the back button; defaults to the home-page wording. */
  backLabel?: string;
}

/**
 * Temporary destination for navigation targets that are not built yet.
 * It states plainly that the page is still under construction instead of
 * pretending to be a finished learning page.
 */
export function PagePlaceholder({
  title,
  description,
  onBack,
  backLabel = 'Kembali ke Halaman Utama',
}: PagePlaceholderProps) {
  return (
    <main className="placeholder">
      <div className="placeholder__card">
        <p className="placeholder__badge">DALAM PEMBINAAN</p>
        <h1 className="placeholder__title">{title}</h1>
        <p className="placeholder__description">{description}</p>
        <button type="button" className="button-primary" onClick={onBack}>
          {backLabel}
        </button>
      </div>
    </main>
  );
}

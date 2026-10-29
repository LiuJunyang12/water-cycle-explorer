import { BASE_URL } from '../config/baseUrl';
import './HomePage.css';

interface HomePageProps {
  onStart: () => void;
  /** Opens the offline e-book dialog straight from the cover. */
  onOpenEbook: () => void;
}

const BACKGROUND_IMAGE = `${BASE_URL}assets/images/home-bg.jpeg`;

/** Page 1 — blurred nature artwork, title, and the bouncing start button. */
export function HomePage({ onStart, onOpenEbook }: HomePageProps) {
  return (
    <main className="home">
      <div className="home__backdrop" aria-hidden="true">
        <img className="home__backdrop-image" src={BACKGROUND_IMAGE} alt="" />
        <div className="home__backdrop-dim" />
      </div>

      <section className="home__hero">
        <p className="home__eyebrow">WATER CYCLE EXPLORER</p>
        <h1 className="home__title">Jom Terokai Kitaran Air!</h1>
        <p className="home__subtitle">
          Temui bagaimana air bergerak, berubah bentuk dan kembali semula ke bumi.
        </p>

        <button type="button" className="home__ebook-button" onClick={onOpenEbook}>
          <svg
            className="home__ebook-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 6.5C10.6 5.2 8.7 4.6 6.5 4.6c-.8 0-1.5.1-2.2.3v13c.7-.2 1.4-.3 2.2-.3 2.2 0 4.1.6 5.5 1.9" />
            <path d="M12 6.5c1.4-1.3 3.3-1.9 5.5-1.9.8 0 1.5.1 2.2.3v13c-.7-.2-1.4-.3-2.2-.3-2.2 0-4.1.6-5.5 1.9" />
            <path d="M12 6.5v12.9" />
          </svg>
          <span>Baca e-buku</span>
        </button>
      </section>

      <div className="home__action">
        <button type="button" className="home__start-button" onClick={onStart}>
          MULA PENGEMBARAAN
        </button>
      </div>
    </main>
  );
}

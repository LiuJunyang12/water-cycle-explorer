import { BASE_URL } from '../config/baseUrl';
import './HomePage.css';

interface HomePageProps {
  onStart: () => void;
}

const BACKGROUND_IMAGE = `${BASE_URL}assets/images/home-bg.jpeg`;

/** Page 1 — blurred nature artwork, title, and the bouncing start button. */
export function HomePage({ onStart }: HomePageProps) {
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
      </section>

      <div className="home__action">
        <button type="button" className="home__start-button" onClick={onStart}>
          MULA PENGEMBARAAN
        </button>
      </div>
    </main>
  );
}

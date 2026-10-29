import { useId, useState } from 'react';
import { BASE_URL } from '../config/baseUrl';
import {
  getStationStatus,
  STATIONS,
  type Station,
  type StationId,
  type StationStatus,
} from '../data/stations';
import './AdventureMapPage.css';

const MAP_IMAGE = `${BASE_URL}assets/images/adventure-map.jpeg`;

interface AdventureMapPageProps {
  completedStationIds: StationId[];
  onOpenStation: (stationId: StationId) => void;
  onBackHome: () => void;
}

const STATUS_LABEL: Record<StationStatus, string> = {
  completed: 'selesai',
  current: 'boleh dibuka',
  locked: 'terkunci',
};

function CheckMark() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M5 13l4 4L19 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockMark() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false">
      <rect x="5" y="11" width="14" height="9" rx="2" fill="currentColor" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}

/** House icon for the floating home button. */
function HomeMark() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <path
        d="M4 11.2 12 4l8 7.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.4 10.2V19a1 1 0 0 0 1 1h9.2a1 1 0 0 0 1-1v-8.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10.4 20v-4.6h3.2V20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
}

/** Page 2 — the cartoon map with six clickable stations, unlocked in order. */
export function AdventureMapPage({
  completedStationIds,
  onOpenStation,
  onBackHome,
}: AdventureMapPageProps) {
  const [lockedMessage, setLockedMessage] = useState<string | null>(null);
  const statusRegionId = useId();
  const completedCount = STATIONS.filter((station) =>
    completedStationIds.includes(station.id),
  ).length;

  const handleStationClick = (station: Station, status: StationStatus) => {
    if (status === 'locked') {
      // Name the station that actually has to be finished first.
      const previousStation = STATIONS.filter((entry) => entry.order < station.order).sort(
        (a, b) => b.order - a.order,
      )[0];
      setLockedMessage(
        previousStation
          ? `Selesaikan ${previousStation.name} dahulu untuk membuka ${station.name}.`
          : `Selesaikan stesen sebelumnya dahulu untuk membuka ${station.name}.`,
      );
      return;
    }
    setLockedMessage(null);
    onOpenStation(station.id);
  };

  return (
    <main className="map-page">
      <header className="map-page__topbar">
        <h1 className="map-page__title">PETA PENGEMBARAAN</h1>
        <p className="map-page__progress">
          <span className="map-page__progress-value">
            {completedCount} / {STATIONS.length}
          </span>
          <span>stesen selesai</span>
        </p>
      </header>

      <div className="map-page__scene">
        <img
          className="map-page__art"
          src={MAP_IMAGE}
          alt="Peta pulau kitaran air dengan enam lokasi pengembaraan daripada khemah di selatan hingga makmal di utara."
        />

        <ul className="map-page__nodes">
          {STATIONS.map((station) => {
            const status = getStationStatus(station.id, completedStationIds);
            return (
              <li
                key={station.id}
                className="map-page__node-item"
                style={{ left: `${station.position.x}%`, top: `${station.position.y}%` }}
              >
                <button
                  type="button"
                  className={`map-node map-node--${status}`}
                  aria-disabled={status === 'locked'}
                  aria-describedby={statusRegionId}
                  aria-label={`Stesen ${station.order}: ${station.name} (${station.englishName}) — ${STATUS_LABEL[status]}`}
                  onClick={() => handleStationClick(station, status)}
                >
                  <span className="map-node__badge" aria-hidden="true">
                    {status === 'completed' ? <CheckMark /> : null}
                    {status === 'locked' ? <LockMark /> : null}
                    {status === 'current' ? station.order : null}
                  </span>
                  <span className="map-node__label">
                    <span className="map-node__name">{station.name}</span>
                    <span className="map-node__meta">
                      Stesen {station.order} · {station.englishName}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Floating status message: fixed, so it never pushes the map down. */}
      <p id={statusRegionId} className="map-page__status" role="status">
        {lockedMessage ?? ''}
      </p>

      {/* Home button styled like the floating menu button, bottom-right. */}
      <button
        type="button"
        className="map-page__home-button glass-surface"
        onClick={onBackHome}
        aria-label="Halaman Utama"
        title="Halaman Utama"
      >
        <HomeMark />
      </button>
    </main>
  );
}

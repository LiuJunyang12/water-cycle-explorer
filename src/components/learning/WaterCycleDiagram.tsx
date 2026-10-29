import { PROCESSES, SPOTS, type ProcessId, type SpotId } from '../../game/waterCycle';
import './WaterCycleDiagram.css';

interface WaterCycleDiagramProps {
  placed: Readonly<Record<SpotId, ProcessId | null>>;
  wrongSpots: readonly SpotId[];
  /** Process currently picked in the word tray, if the pupil is using clicks. */
  selectedProcess: ProcessId | null;
  onSpotClick: (spot: SpotId) => void;
  onSpotDrop: (spot: SpotId, process: ProcessId) => void;
  onSpotClear: (spot: SpotId) => void;
}

/**
 * The water cycle scene with four drop spots: the sea (evaporation), the cloud
 * (condensation), the falling rain (precipitation) and the river (collection).
 *
 * Each spot is a real button, so the diagram also works with a keyboard or on a
 * touch screen where HTML5 drag and drop is unavailable.
 */
export function WaterCycleDiagram({
  placed,
  wrongSpots,
  selectedProcess,
  onSpotClick,
  onSpotDrop,
  onSpotClear,
}: WaterCycleDiagramProps) {
  return (
    <div className="cycle-diagram" data-testid="cycle-diagram">
      <div className="cycle-diagram__sky" aria-hidden="true" />
      <div className="cycle-diagram__sun" aria-hidden="true" />
      <div className="cycle-diagram__hill cycle-diagram__hill--left" aria-hidden="true" />
      <div className="cycle-diagram__hill cycle-diagram__hill--right" aria-hidden="true" />
      <div className="cycle-diagram__cloud" aria-hidden="true">
        <span className="cycle-diagram__puff cycle-diagram__puff--a" />
        <span className="cycle-diagram__puff cycle-diagram__puff--b" />
        <span className="cycle-diagram__puff cycle-diagram__puff--c" />
      </div>
      <div className="cycle-diagram__rain" aria-hidden="true">
        {Array.from({ length: 7 }, (_, index) => (
          <span key={index} className="cycle-diagram__drop" style={{ left: `${12 + index * 11}%` }} />
        ))}
      </div>
      <div className="cycle-diagram__sea" aria-hidden="true" />
      <div className="cycle-diagram__river" aria-hidden="true" />

      <svg className="cycle-diagram__flow" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <marker id="cycle-arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
            <path d="M0 0 L6 3 L0 6 Z" fill="#4f9bd1" />
          </marker>
        </defs>
        <path
          d="M18 70 C 24 52, 40 34, 52 27"
          fill="none"
          stroke="#4f9bd1"
          strokeWidth="0.7"
          strokeDasharray="2.4 2"
          markerEnd="url(#cycle-arrow)"
          opacity="0.6"
        />
        <path
          d="M66 34 C 72 46, 70 54, 64 60"
          fill="none"
          stroke="#4f9bd1"
          strokeWidth="0.7"
          strokeDasharray="2.4 2"
          markerEnd="url(#cycle-arrow)"
          opacity="0.6"
        />
        <path
          d="M60 72 C 50 82, 36 88, 26 90"
          fill="none"
          stroke="#4f9bd1"
          strokeWidth="0.7"
          strokeDasharray="2.4 2"
          markerEnd="url(#cycle-arrow)"
          opacity="0.6"
        />
      </svg>

      {SPOTS.map((spot) => {
        const process = placed[spot.id];
        const isWrong = wrongSpots.includes(spot.id);
        const classes = [
          'cycle-spot',
          `cycle-spot--${spot.id}`,
          process ? 'cycle-spot--filled' : '',
          isWrong ? 'cycle-spot--wrong' : '',
          selectedProcess && !process ? 'cycle-spot--ready' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            key={spot.id}
            type="button"
            className={classes}
            data-testid={`cycle-spot-${spot.id}`}
            aria-label={
              process
                ? `${spot.hint}: ${PROCESSES[process].name} (tekan untuk mengeluarkan)`
                : `${spot.hint}: kosong, letakkan perkataan di sini`
            }
            onClick={() => (process ? onSpotClear(spot.id) : onSpotClick(spot.id))}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const carried = event.dataTransfer.getData('text/plain');
              if (carried) onSpotDrop(spot.id, carried as ProcessId);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Backspace' || event.key === 'Delete') {
                event.preventDefault();
                if (process) onSpotClear(spot.id);
              }
            }}
          >
            <span className="cycle-spot__dot" aria-hidden="true" />
            <span className="cycle-spot__text">
              {process ? PROCESSES[process].name : spot.hint}
            </span>
          </button>
        );
      })}
    </div>
  );
}

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import {
  cloudDarkness,
  collectDroplet,
  createGame,
  finishRain,
  RAIN_GAME,
  startRain,
  type RainState,
} from '../../game/rainGather';
import { RainCloudScene } from './RainCloudScene';

function gatherAll(state: RainState = createGame()): RainState {
  return state.droplets.reduce((current, droplet) => collectDroplet(current, droplet.id), state);
}

function renderScene(state: RainState, onCollect = vi.fn()) {
  const utils = render(<RainCloudScene state={state} onCollect={onCollect} />);
  return { ...utils, onCollect };
}

describe('RainCloudScene — station 4 scene', () => {
  test('draws one draggable droplet per floating droplet, with Malay labels', () => {
    const state = createGame();
    const { container } = renderScene(state);

    const droplets = container.querySelectorAll('.rain-droplet');
    expect(droplets).toHaveLength(RAIN_GAME.dropletCount);

    screen.getAllByRole('button').forEach((button) => {
      expect(button.getAttribute('aria-label')).toMatch(/Titisan air \d+/);
    });

    const ids = Array.from(droplets).map((droplet) => droplet.getAttribute('data-droplet-id'));
    expect(new Set(ids).size).toBe(RAIN_GAME.dropletCount);
  });

  test('clicking a droplet asks the page to merge it', () => {
    const state = createGame();
    const { onCollect } = renderScene(state);

    fireEvent.click(screen.getAllByTestId('rain-droplet')[0]);

    expect(onCollect).toHaveBeenCalledTimes(1);
    expect(onCollect).toHaveBeenCalledWith(state.droplets[0].id);
  });

  test('the cloud darkens as droplets arrive and the collector shows the count', () => {
    const start = createGame();
    const collected = collectDroplet(start, start.droplets[0].id);
    const { container } = renderScene(collected);

    const scene = container.querySelector('.rain-scene');
    expect(scene).toHaveAttribute('data-phase', 'gathering');
    expect(scene).toHaveAttribute('data-cloud-darkness', cloudDarkness(collected).toFixed(2));

    expect(screen.getByTestId('rain-collector')).toHaveTextContent(
      `1/${RAIN_GAME.dropletCount}`,
    );
    expect(
      screen.getByLabelText(
        `Titisan besar di atas awan — 1 daripada ${RAIN_GAME.dropletCount} titisan bergabung`,
      ),
    ).toBeInTheDocument();
  });

  test('a full cloud is marked heavy so it can shake', () => {
    const asking = gatherAll();
    const { container } = renderScene(asking);

    expect(container.querySelector('.rain-scene')).toHaveClass('rain-scene--heavy');
    expect(container.querySelector('.rain-scene')).toHaveAttribute('data-cloud-darkness', '1.00');
    expect(screen.queryAllByTestId('rain-droplet')).toHaveLength(0);
  });

  test('rain streaks appear only once the rain has started', () => {
    const gatherView = renderScene(createGame());
    expect(gatherView.queryAllByTestId('rain-falling')).toHaveLength(0);
    gatherView.unmount();

    const raining = startRain(gatherAll());
    const rainView = renderScene(raining);
    expect(rainView.getAllByTestId('rain-falling')).toHaveLength(1);
    // Nothing left to drag while it rains.
    expect(rainView.queryAllByTestId('rain-droplet')).toHaveLength(0);
    rainView.unmount();

    const finished = finishRain(raining);
    const finishView = renderScene(finished);
    expect(finishView.getByTestId('rain-falling')).toBeInTheDocument();
    expect(finishView.container.querySelector('.rain-scene')).toHaveAttribute(
      'data-phase',
      'finished',
    );
  });

  test('a drag that ends away from the cloud returns the droplet instead of collecting it', () => {
    const { onCollect } = renderScene(createGame());
    const droplet = screen.getAllByTestId('rain-droplet')[0];

    fireEvent.pointerDown(droplet, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(droplet, { clientX: 70, clientY: 70 });
    fireEvent.pointerUp(droplet, { clientX: 70, clientY: 70 });
    // The browser still fires a click after the drag: it must not count as a merge.
    fireEvent.click(droplet);

    expect(onCollect).not.toHaveBeenCalled();
  });

  test('a drag that ends on the collector droplet merges that droplet', () => {
    const { onCollect } = renderScene(createGame());
    const collector = screen.getByTestId('rain-collector');
    collector.getBoundingClientRect = () =>
      ({
        left: 100,
        top: 100,
        right: 220,
        bottom: 220,
        width: 120,
        height: 120,
        x: 100,
        y: 100,
        toJSON: () => ({}),
      }) as DOMRect;

    const droplet = screen.getAllByTestId('rain-droplet')[0];
    fireEvent.pointerDown(droplet, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(droplet, { clientX: 150, clientY: 150 });
    fireEvent.pointerUp(droplet, { clientX: 150, clientY: 150 });

    expect(onCollect).toHaveBeenCalledTimes(1);
    expect(onCollect).toHaveBeenCalledWith('d1');
  });
  test('shows where the rain water collects: river, lake and sea', () => {
    renderScene(createGame());

    expect(screen.getByText('Sungai')).toBeInTheDocument();
    expect(screen.getByText('Tasik')).toBeInTheDocument();
    expect(screen.getByText('Laut')).toBeInTheDocument();
  });

  test('optional artwork is wired and every file keeps a CSS fallback', () => {
    const { container } = renderScene(createGame());

    expect(container.querySelector('.rain-scene__bg')?.getAttribute('src')).toContain(
      'waterfall-valley/valley-bg.png',
    );
    expect(container.querySelectorAll('.rain-droplet__art')).toHaveLength(
      RAIN_GAME.dropletCount,
    );
    expect(container.querySelector('.rain-collector__art')?.getAttribute('src')).toContain(
      'waterfall-valley/big-drop.png',
    );
    // Until a file loads, the CSS drawing stays in charge.
    expect(container.querySelector('.rain-scene')).not.toHaveClass('rain-scene--art-bg');
  });

  test('the painted backdrop replaces the CSS sky only after it has loaded', () => {
    const { container } = renderScene(createGame());
    const backdrop = container.querySelector('.rain-scene__bg');

    fireEvent.load(backdrop as Element);

    expect(container.querySelector('.rain-scene')).toHaveClass('rain-scene--art-bg');
  });
});

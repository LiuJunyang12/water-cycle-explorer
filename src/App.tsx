import { useEffect, useState } from 'react';
import { MusicPlayer } from './components/audio/MusicPlayer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PagePlaceholder } from './components/common/PagePlaceholder';
import { FeedbackDialog } from './components/feedback/FeedbackDialog';
import { OfflineEbookDialog, ObjectivesDialog, StudentProfileDialog } from './components/home/InfoDialogs';
import { MenuButton } from './components/navigation/MenuButton';
import { MenuDrawer } from './components/navigation/MenuDrawer';
import type { MenuSectionId } from './data/menuItems';
import { flushReportQueue, type QuizRun } from './data/reporting';
import { STATIONS, type StationId } from './data/stations';
import { useProgress } from './hooks/useProgress';
import { AdventureMapPage } from './pages/AdventureMapPage';
import { CampStationPage } from './pages/CampStationPage';
import { ChallengeLabPage } from './pages/ChallengeLabPage';
import { CloudKingdomPage } from './pages/CloudKingdomPage';
import { FinalePage } from './pages/FinalePage';
import { HomePage } from './pages/HomePage';
import { SunnyCoastPage } from './pages/SunnyCoastPage';
import { WaterCycleStationPage } from './pages/WaterCycleStationPage';
import { WaterfallValleyPage } from './pages/WaterfallValleyPage';
import './App.css';

type PageState =
  | { kind: 'home' }
  | { kind: 'map' }
  | { kind: 'station'; stationId: StationId }
  | { kind: 'finale' };

export default function App() {
  const [page, setPage] = useState<PageState>({ kind: 'home' });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<MenuSectionId | null>(null);
  const [finaleRun, setFinaleRun] = useState<QuizRun | null>(null);
  const progress = useProgress();

  // Reports that could not be sent earlier (offline) get one more chance here.
  useEffect(() => {
    void flushReportQueue();
  }, []);

  const handleSelectSection = (sectionId: MenuSectionId) => {
    setIsDrawerOpen(false);
    setActiveSection(sectionId);
  };

  const goToMap = () => setPage({ kind: 'map' });

  const renderPage = () => {
    if (page.kind === 'home') {
      return <HomePage onStart={goToMap} onOpenEbook={() => setActiveSection('ebook')} />;
    }

    // The award ceremony: Wally hands over the certificate after station 6.
    if (page.kind === 'finale') {
      return <FinalePage run={finaleRun} completions={progress.completions} onBackToMap={goToMap} />;
    }

    if (page.kind === 'map') {
      return (
        <AdventureMapPage
          completedStationIds={progress.completedStationIds}
          onOpenStation={(stationId) => setPage({ kind: 'station', stationId })}
          onBackHome={() => setPage({ kind: 'home' })}
        />
      );
    }

    // Station 1 is built: watch the introduction video to unlock the next station.
    if (page.stationId === 'camp') {
      return (
        <CampStationPage
          isAlreadyCompleted={progress.getStatus('camp') === 'completed'}
          onComplete={() => progress.completeStation('camp')}
          onBackToMap={goToMap}
        />
      );
    }

    // Station 2 is built: an evaporation mini-game.
    if (page.stationId === 'sunny-coast') {
      return (
        <SunnyCoastPage
          isAlreadyCompleted={progress.getStatus('sunny-coast') === 'completed'}
          onComplete={() => progress.completeStation('sunny-coast')}
          onBackToMap={goToMap}
        />
      );
    }

    // Station 3 is built: the platformer that forms the cloud bridge.
    if (page.stationId === 'cloud-kingdom') {
      return (
        <CloudKingdomPage
          isAlreadyCompleted={progress.getStatus('cloud-kingdom') === 'completed'}
          onComplete={() => progress.completeStation('cloud-kingdom')}
          onBackToMap={goToMap}
        />
      );
    }

    // Station 4 is built: gather droplets until the cloud can no longer hold them.
    if (page.stationId === 'waterfall-valley') {
      return (
        <WaterfallValleyPage
          isAlreadyCompleted={progress.getStatus('waterfall-valley') === 'completed'}
          onComplete={() => progress.completeStation('waterfall-valley')}
          onBackToMap={goToMap}
        />
      );
    }

    // Station 5 is built: arrange the cycle, then label the diagram.
    if (page.stationId === 'water-cycle-station') {
      return (
        <WaterCycleStationPage
          isAlreadyCompleted={progress.getStatus('water-cycle-station') === 'completed'}
          onComplete={() => progress.completeStation('water-cycle-station')}
          onBackToMap={goToMap}
        />
      );
    }

    // Station 6 is built: the eight-question challenge quiz.
    if (page.stationId === 'challenge-lab') {
      return (
        <ChallengeLabPage
          isAlreadyCompleted={progress.getStatus('challenge-lab') === 'completed'}
          onComplete={() => progress.completeStation('challenge-lab')}
          onBackToMap={goToMap}
          onGoToFinale={(run) => {
            setFinaleRun(run);
            setPage({ kind: 'finale' });
          }}
        />
      );
    }

    // Remaining stations are built page by page; until then this states that plainly.
    const station = STATIONS.find((entry) => entry.id === page.stationId);
    return (
      <PagePlaceholder
        title={station ? station.name : 'Stesen'}
        description={
          station
            ? `${station.englishName} · ${station.focus}. Halaman stesen ini belum dibina.`
            : 'Halaman stesen ini belum dibina.'
        }
        onBack={goToMap}
        backLabel="Kembali ke Peta"
      />
    );
  };

  return (
    <div className="app">
      <ErrorBoundary
        key={page.kind === 'station' ? page.stationId : page.kind}
        onReset={goToMap}
        resetLabel="Kembali ke peta"
      >
        {renderPage()}
      </ErrorBoundary>

      {/* Site-wide chrome: menu button, music player, drawer and its dialogs. */}
      <div className="app__menu-anchor">
        <MenuButton isOpen={isDrawerOpen} onClick={() => setIsDrawerOpen((open) => !open)} />
      </div>

      <MusicPlayer />

      <MenuDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelect={handleSelectSection}
      />

      <StudentProfileDialog isOpen={activeSection === 'student'} onClose={() => setActiveSection(null)} />
      <OfflineEbookDialog isOpen={activeSection === 'ebook'} onClose={() => setActiveSection(null)} />
      <ObjectivesDialog isOpen={activeSection === 'objectives'} onClose={() => setActiveSection(null)} />
      <FeedbackDialog isOpen={activeSection === 'feedback'} onClose={() => setActiveSection(null)} />
    </div>
  );
}

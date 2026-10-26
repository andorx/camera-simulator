import { useSim } from './store';
import Header from './components/Header';
import TabBar from './components/TabBar';
import Viewport from './components/Viewport';
import FilmStrip from './components/FilmStrip';
import ScenePicker from './components/ScenePicker';
import ThemePresets from './components/ThemePresets';
import ExpoMeter from './components/ExpoMeter';
import ControlsCard from './components/ControlsCard';
import ShotIntelligence from './components/ShotIntelligence';
import Explainers from './components/Explainers';
import CaptureModal from './components/CaptureModal';
import CameraModesPage from './components/CameraModesPage';
import QuickGuidePage from './components/QuickGuidePage';

export default function App() {
  const view = useSim(s => s.view);

  return (
    <>
      <Header />
      <TabBar />

      {view === 'sim' && (
        <>
          <main className="layout">
            {/* ======================= PREVIEW ======================= */}
            <section className="stage">
              <Viewport />
              <ScenePicker />
              <ThemePresets />
              <FilmStrip />
            </section>

            {/* ======================= CONTROLS ======================= */}
            <aside className="panel">
              <ExpoMeter />
              <ControlsCard />
              <ShotIntelligence />
            </aside>
          </main>

          <Explainers />
        </>
      )}

      {view === 'modes' && <CameraModesPage />}
      {view === 'guide' && <QuickGuidePage />}

      <footer>
        Simulated optics: 36×24 mm sensor · CoC 0.03 mm · focus locked on the subject · everything rendered live from the math.
      </footer>

      <CaptureModal />
    </>
  );
}

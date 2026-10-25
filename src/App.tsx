import Header from './components/Header';
import Viewport from './components/Viewport';
import FilmStrip from './components/FilmStrip';
import ScenePicker from './components/ScenePicker';
import ThemePresets from './components/ThemePresets';
import ExpoMeter from './components/ExpoMeter';
import ControlsCard from './components/ControlsCard';
import ShotIntelligence from './components/ShotIntelligence';
import Explainers from './components/Explainers';
import CaptureModal from './components/CaptureModal';

export default function App() {
  return (
    <>
      <Header />

      <main className="layout">
        {/* ======================= PREVIEW ======================= */}
        <section className="stage">
          <Viewport />
          <FilmStrip />
        </section>

        {/* ======================= CONTROLS ======================= */}
        <aside className="panel">
          <ScenePicker />
          <ThemePresets />
          <ExpoMeter />
          <ControlsCard />
          <ShotIntelligence />
        </aside>
      </main>

      <Explainers />

      <footer>
        Simulated optics: 36×24 mm sensor · CoC 0.03 mm · focus locked on the subject · everything rendered live from the math.
      </footer>

      <CaptureModal />
    </>
  );
}

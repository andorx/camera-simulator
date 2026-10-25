/* Camera Modes page — explains what each mode dial position (A+, P, Tv, Av, M,
   B, Fv, C1–C3, SCN) does on a Canon camera. All content lives in
   src/data/modes.ts; this file only renders it. */
import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import '../modes.css';
import { useSim } from '../store';
import { CAMERA_MODES, CREATIVE_LADDER, SCENE_GROUPS } from '../data/modes';
import type { CameraMode, ModeControls, ParamOwner } from '../data/modes';
import type { ModesDisplay } from '../types';

const OWNER_LABEL: Record<ParamOwner, string> = {
  you: 'You',
  camera: 'Camera',
  flex: 'Flexible',
  saved: 'As saved',
};

const OWNER_TITLE: Record<ParamOwner, string> = {
  you: 'You set this',
  camera: 'The camera sets this',
  flex: 'Auto until you claim it — then it is yours',
  saved: 'Whatever you registered into this custom mode',
};

function OwnerChip({ owner }: { owner: ParamOwner }) {
  return (
    <span className={`mode-chip ${owner}`} title={OWNER_TITLE[owner]}>
      {OWNER_LABEL[owner]}
    </span>
  );
}

function Bars({
  kind,
  value,
  label,
}: {
  kind: 'control' | 'effort';
  value: number;
  label?: string;
}) {
  return (
    <span
      className={`mode-bars ${kind}`}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {[0, 1, 2, 3, 4].map(i => (
        <i key={i} className={i < value ? 'on' : ''} />
      ))}
    </span>
  );
}

function Meter({ label, kind, value }: { label: string; kind: 'control' | 'effort'; value: number }) {
  return (
    <div className="mode-meter">
      <span className="mode-meter-label">{label}</span>
      <Bars kind={kind} value={value} />
    </div>
  );
}

function OwnerCells({ controls }: { controls: ModeControls }) {
  return (
    <div className="mode-owners">
      <div className={`mode-owner ${controls.aperture}`}>
        <span className="mode-owner-param">Aperture ƒ</span>
        <OwnerChip owner={controls.aperture} />
      </div>
      <div className={`mode-owner ${controls.shutter}`}>
        <span className="mode-owner-param">Shutter</span>
        <OwnerChip owner={controls.shutter} />
      </div>
      <div className={`mode-owner ${controls.iso}`}>
        <span className="mode-owner-param">ISO</span>
        <OwnerChip owner={controls.iso} />
      </div>
    </div>
  );
}

/* Tabbed browser for the main modes — one mode visible at a time.
   Arrow keys (all four directions, so the vertical small-screen rail
   works too), Home and End move between tabs. */
function ModeTabs({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = CAMERA_MODES.findIndex(m => m.id === activeId);
    let next = i;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % CAMERA_MODES.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + CAMERA_MODES.length) % CAMERA_MODES.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = CAMERA_MODES.length - 1;
    else return;
    e.preventDefault();
    const mode = CAMERA_MODES[next];
    onSelect(mode.id);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="mode-tablist" role="tablist" aria-label="Camera modes" onKeyDown={onKeyDown}>
      {CAMERA_MODES.map((mode, i) => (
        <button
          key={mode.id}
          ref={el => { tabRefs.current[i] = el; }}
          id={`mode-tab-${mode.id}`}
          role="tab"
          aria-selected={mode.id === activeId}
          aria-controls="mode-panel"
          tabIndex={mode.id === activeId ? 0 : -1}
          className={`mode-tab ${mode.id === activeId ? 'active' : ''}`}
          onClick={() => onSelect(mode.id)}
        >
          <span className="mode-tab-dial" aria-hidden="true">{mode.dial}</span>
          <span className="mode-tab-name">{mode.name}</span>
        </button>
      ))}
    </div>
  );
}

/* Segmented control: show every mode card at once (grid) or one at a
   time (tabs). Manual switch — no automatic flip on resize. */
function DisplayToggle({ value, onChange }: { value: ModesDisplay; onChange: (m: ModesDisplay) => void }) {
  const options: { key: ModesDisplay; label: string; icon: ReactNode }[] = [
    {
      key: 'cards',
      label: 'Cards',
      icon: (
        <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      ),
    },
    {
      key: 'tabs',
      label: 'Tabs',
      icon: (
        <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
          <rect x="3.5" y="8.5" width="17" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M6 8.5v-2a1 1 0 0 1 1-1h5v3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14.5 8.5V7a1 1 0 0 1 1-1H19a1 1 0 0 1 1 1v1.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity=".55" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mode-view-toggle" role="group" aria-label="Display mode">
      {options.map(o => (
        <button
          key={o.key}
          type="button"
          aria-pressed={value === o.key}
          className={value === o.key ? 'active' : ''}
          onClick={() => onChange(o.key)}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ModeCard({ mode }: { mode: CameraMode }) {
  return (
    <article className="mode-card">
      <header className="mode-head">
        <div className="mode-dial-badge" aria-hidden="true">{mode.dial}</div>
        <div className="mode-head-text">
          <h3 className="mode-name">{mode.name}</h3>
          {mode.aka && <p className="mode-aka">{mode.aka}</p>}
          <p className="mode-tagline">{mode.tagline}</p>
        </div>
      </header>

      <OwnerCells controls={mode.controls} />
      <div className="mode-meters">
        <Meter label="Creative control" kind="control" value={mode.controlLevel} />
        <Meter label="Effort to master" kind="effort" value={mode.difficulty} />
      </div>

      <p className="mode-what">{mode.what}</p>
      {mode.availability && <p className="mode-availability">{mode.availability}</p>}

      <div className="mode-cols">
        <div>
          <h4 className="mode-block-title">Reach for it when</h4>
          <ul className="mode-list when">
            {mode.whenToUse.map(item => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div>
          <h4 className="mode-block-title">Field notes</h4>
          <ul className="mode-list">
            {mode.tips.map(item => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>

      <p className="mode-sim"><b>Simulator</b>{mode.simulator}</p>
    </article>
  );
}

export default function CameraModesPage() {
  const [activeId, setActiveId] = useState(CAMERA_MODES[0].id);
  const active = CAMERA_MODES.find(m => m.id === activeId) ?? CAMERA_MODES[0];

  const display = useSim(s => s.modesDisplay);
  const setDisplay = useSim(s => s.setModesDisplay);

  return (
    <div className="page">
      {/* ---------- hero: the concept + the creative ladder ---------- */}
      <div className="card page-hero">
        <h2 className="page-title">Camera Modes</h2>
        <p className="page-sub">
          The mode dial answers one question: who makes the exposure decisions — you or the meter?
          Every position is a different split of that authority, from A+ (the camera drives
          everything) to M (you drive everything, with the meter as an advisor). Each mode below
          breaks down what you control, what the camera controls, when to reach for it, and how
          to practise it in the Simulator. Climb the ladder one dial at a time.
        </p>
        <div className="mode-ladder">
          {CREATIVE_LADDER.map(step => (
            <div key={step.dial} className="mode-step">
              <span className="mode-step-dial">{step.dial}</span>
              <span className="mode-step-label">{step.label}</span>
              <span className="mode-step-desc">{step.desc}</span>
            </div>
          ))}
        </div>
        <p className="mode-ladder-note">
          Fv flexes between the middle rungs — every parameter stays auto until you claim it.
          C1–C3 bookmark any rung as a saved recipe, and B (Bulb) lives past M’s 30-second ceiling.
        </p>
      </div>

      {/* ---------- the main modes ---------- */}
      <section className="mode-section">
        <div className="mode-section-head">
          <h3 className="mode-section-title">The creative core · who turns which dial</h3>
          <DisplayToggle value={display} onChange={setDisplay} />
        </div>

        {display === 'tabs' ? (
          <div className="mode-tabs">
            <ModeTabs activeId={active.id} onSelect={setActiveId} />
            <div
              className="mode-tabpanel"
              role="tabpanel"
              id="mode-panel"
              aria-labelledby={`mode-tab-${active.id}`}
            >
              <ModeCard key={active.id} mode={active} />
            </div>
          </div>
        ) : (
          <div className="mode-grid">
            {CAMERA_MODES.map(mode => <ModeCard key={mode.id} mode={mode} />)}
          </div>
        )}
      </section>

      {/* ---------- SCN scene modes ---------- */}
      <section className="mode-section">
        <h3 className="mode-section-title">SCN · special scene modes — packaged recipes</h3>
        <p className="mode-scene-intro">
          SCN modes are consumer shortcuts: each takes a recipe a P/Av/Tv/M shooter would set by
          hand — wide aperture, warm skin tones, no flash — and pins it to a single icon. Useful
          training wheels, because every icon maps to a manual equivalent you can graduate to
          (shown under each card).
        </p>
        {SCENE_GROUPS.map(group => (
          <div key={group.id} className="mode-scene-group">
            <h4 className="mode-group-label">
              {group.label}
              <span className="mode-group-blurb"> · {group.blurb}</span>
            </h4>
            <div className="mode-scene-grid">
              {group.scenes.map(scene => (
                <div key={scene.name} className="mode-scene">
                  <div className="mode-scene-name">{scene.icon} {scene.name}</div>
                  <p className="mode-scene-does">{scene.does}</p>
                  <div className="mode-scene-equiv">≈ {scene.equiv}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ---------- comparison table ---------- */}
      <section className="mode-section">
        <h3 className="mode-section-title">At a glance · the whole dial in one table</h3>
        <div className="mode-table-wrap">
          <table className="mode-table">
            <thead>
              <tr>
                <th>Mode</th>
                <th>Aperture</th>
                <th>Shutter</th>
                <th>ISO</th>
                <th>Creative control</th>
                <th>Reach for it when</th>
              </tr>
            </thead>
            <tbody>
              {CAMERA_MODES.map(mode => (
                <tr key={mode.id}>
                  <td>
                    <span className="mode-tdial">{mode.dial}</span>{' '}
                    <span className="mode-tname">{mode.name}</span>
                  </td>
                  <td><OwnerChip owner={mode.controls.aperture} /></td>
                  <td><OwnerChip owner={mode.controls.shutter} /></td>
                  <td><OwnerChip owner={mode.controls.iso} /></td>
                  <td>
                    <Bars
                      kind="control"
                      value={mode.controlLevel}
                      label={`${mode.controlLevel} of 5`}
                    />
                  </td>
                  <td className="mode-tbest">{mode.bestFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------- cross-brand decoder ---------- */}
      <section className="mode-section">
        <h3 className="mode-section-title">Same idea, different letters</h3>
        <p className="mode-brands-note">
          Canon’s letters confuse everyone exactly once: <b>Tv = Time value</b> (the shutter) and{' '}
          <b>Av = Aperture value</b>. Nikon and Sony spell the same modes S and A — the ideas are
          identical, only the engraving changes.
        </p>
        <div className="mode-brands">
          <div className="mode-brand"><b>Canon</b><code>P · Tv · Av · M</code></div>
          <div className="mode-brand"><b>Nikon</b><code>P · S · A · M</code></div>
          <div className="mode-brand"><b>Sony</b><code>P · S · A · M</code></div>
        </div>
      </section>
    </div>
  );
}

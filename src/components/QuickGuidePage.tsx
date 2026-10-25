/* Quick Guide page — pick what matters most (subject, place, condition)
   and get the best-fit Canon mode + settings for it. Cards with a
   faithful scene in the simulator get a "Try in simulator" button that
   applies a tuned mapping (snapped to the nearest simulated dial) and
   jumps to the Simulator tab. */
import { useState } from 'react';
import { APS, ISOS, SHUTTERS } from '../optics';
import { useSim } from '../store';
import { CATEGORIES, SCENARIOS } from '../data/guides';
import type { GuideCatId, GuideScenario, GuideSim } from '../data/guides';
import '../guide.css';

/** Index of the dial value nearest to `v` (fractional stops snap down
    or up, whichever is closer). */
const nearestIdx = (vals: number[], v: number) =>
  vals.reduce((best, x, i) => (Math.abs(x - v) < Math.abs(vals[best] - v) ? i : best), 0);

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const nearestShutter = (sec: number) => nearestIdx(SHUTTERS.map(x => x.s), sec);

const fmtShutter = (sec: number) => (sec >= 1 ? `${sec}"` : `1/${Math.round(1 / sec)}`);

const MODE_NAMES: Record<string, string> = {
  P: 'Program AE',
  Tv: 'Time value — shutter priority',
  Av: 'Aperture value — aperture priority',
  M: 'Manual',
  B: 'Bulb',
};

/** Apply a scenario's simulator mapping: snap ƒ/time/ISO to the nearest
    dial value, clamp focal length and distance to the sliders' ranges,
    then jump to the Simulator tab. */
function applySim(sim: GuideSim) {
  useSim.setState({
    ap: nearestIdx(APS, sim.f),
    iso: nearestIdx(ISOS, sim.iso),
    sh: nearestShutter(sim.sec),
    focal: Math.round(clamp(sim.focal, 24, 200)),
    dist: clamp(sim.dist, 0.5, 15),
    theme: sim.theme,
    subject: sim.subject,
    background: sim.background,
  });
  useSim.getState().setView('sim');
}

function ScenarioCard({ s }: { s: GuideScenario }) {
  const sim = s.sim;
  return (
    <article className="card guide-card">
      <div className="guide-card-head">
        <span className="guide-icon" aria-hidden>{s.icon}</span>
        <div className="guide-title">
          <h3>{s.title}</h3>
          <p>{s.why}</p>
        </div>
        <span className={`guide-mode mode-${s.mode.toLowerCase()}`} title={MODE_NAMES[s.mode]}>{s.mode}</span>
      </div>

      <div className="guide-chips">
        <span className="guide-chip"><i>ap</i>ƒ/{s.shot.f}</span>
        <span className="guide-chip"><i>time</i>{fmtShutter(s.shot.sec)}</span>
        <span className="guide-chip"><i>iso</i>{s.shot.iso}</span>
        <span className="guide-chip"><i>zoom</i>{s.shot.focal} mm</span>
      </div>

      {s.shot.note && <p className="guide-note">{s.shot.note}</p>}

      <ul className="tips">
        {s.tips.map(t => <li key={t}>{t}</li>)}
      </ul>

      {sim ? (
        <button className="guide-try" onClick={() => applySim(sim)}>Try in simulator →</button>
      ) : (
        <span className="guide-nosim">{s.simWhy ?? 'No faithful simulator mapping for this one.'}</span>
      )}
    </article>
  );
}

export default function QuickGuidePage() {
  const [cat, setCat] = useState<GuideCatId | 'all'>('all');
  const countFor = (id: GuideCatId) => SCENARIOS.filter(s => s.cat === id).length;

  return (
    <div className="page">
      <div className="card page-hero">
        <h2 className="page-title">Quick Guide</h2>
        <p className="page-sub">
          Tell the guide what matters most about the shot — the subject you are framing, the place
          you are standing, or the light you have been handed. Each card names the mode dial
          position to reach for, a starting exposure (aperture · time · ISO · focal length), field
          notes and pro tips. Most cards load straight into the simulator so you can watch the
          settings work. New to Av / Tv / M? The Camera Modes tab explains the dial.
        </p>
      </div>

      <div className="guide-filter" aria-label="Filter scenarios by category">
        <span className="guide-filter-label">Show</span>
        <button
          className={`guide-fbtn${cat === 'all' ? ' active' : ''}`}
          aria-pressed={cat === 'all'}
          onClick={() => setCat('all')}
        >
          All <b>{SCENARIOS.length}</b>
        </button>
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            className={`guide-fbtn${cat === c.id ? ' active' : ''}`}
            aria-pressed={cat === c.id}
            onClick={() => setCat(c.id)}
          >
            {c.label} <b>{countFor(c.id)}</b>
          </button>
        ))}
      </div>

      {CATEGORIES.filter(c => cat === 'all' || c.id === cat).map(c => (
        <section key={c.id} className="guide-group">
          <div className="guide-group-head">
            <h3>{c.label}</h3>
            <p>{c.blurb}</p>
          </div>
          <div className="guide-grid">
            {SCENARIOS.filter(s => s.cat === c.id).map(s => (
              <ScenarioCard key={s.id} s={s} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

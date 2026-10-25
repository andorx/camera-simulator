/* Quick Guide page — pick what matters most (subject, place, condition)
   and get the best-fit Canon mode + settings for it. The search box
   filters cards by the tags each scenario defines (title and mode count
   too — so "aperture" finds every Av card). Tags on the cards are
   clickable search shortcuts. Cards with a faithful scene in the
   simulator get a "Try in simulator" button that applies a tuned
   mapping (snapped to the nearest simulated dial) and jumps to the
   Simulator tab. */
import { useEffect, useRef, useState } from 'react';
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

/** Does a scenario match the search? Every whitespace-separated term
    must hit somewhere in the title, the mode (short or long name) or
    one of the tags — so "night tripod" finds night + tripod cards. */
function matchesSearch(s: GuideScenario, terms: string[]) {
  if (terms.length === 0) return true;
  const hay = [s.title, s.mode, MODE_NAMES[s.mode] ?? '', ...s.tags]
    .join(' ')
    .toLowerCase();
  return terms.every(t => hay.includes(t));
}

/** Tags shown as clickable chips on a card (the rest stay searchable). */
const CHIP_TAGS = 5;

function ScenarioCard({ s, onTag }: { s: GuideScenario; onTag: (tag: string) => void }) {
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

      <div className="guide-tags">
        {s.tags.slice(0, CHIP_TAGS).map(t => (
          <button key={t} className="guide-tag" title={`Search “${t}”`} onClick={() => onTag(t)}>
            #{t}
          </button>
        ))}
      </div>

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
  const [q, setQ] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  /* "/" anywhere on the page jumps into the search box */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      e.preventDefault();
      searchRef.current?.focus();
      searchRef.current?.select();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const searchCount = SCENARIOS.filter(s => matchesSearch(s, terms)).length;
  const countFor = (id: GuideCatId) =>
    SCENARIOS.filter(s => s.cat === id && matchesSearch(s, terms)).length;

  /* category groups that survive both filters, empties dropped */
  const groups = CATEGORIES
    .filter(c => cat === 'all' || c.id === cat)
    .map(c => ({ c, items: SCENARIOS.filter(s => s.cat === c.id && matchesSearch(s, terms)) }))
    .filter(g => g.items.length > 0);

  /** Clicking a tag searches it across every category. */
  const searchTag = (tag: string) => {
    setCat('all');
    setQ(tag);
  };

  const resetAll = () => {
    setQ('');
    setCat('all');
  };

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
          All <b>{searchCount}</b>
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

        <div className="guide-search" role="search">
          <span className="guide-search-icon" aria-hidden>🔍</span>
          <input
            ref={searchRef}
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={`Search ${SCENARIOS.length} cards by tag — “night”, “bokeh”, “tripod”…`}
            aria-label="Search guide cards by tag"
            spellCheck={false}
          />
          {q && (
            <button className="guide-search-clear" onClick={() => setQ('')} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>
      </div>

      {groups.map(({ c, items }) => (
        <section key={c.id} className="guide-group">
          <div className="guide-group-head">
            <h3>{c.label}</h3>
            <p>{c.blurb}</p>
          </div>
          <div className="guide-grid">
            {items.map(s => (
              <ScenarioCard key={s.id} s={s} onTag={searchTag} />
            ))}
          </div>
        </section>
      ))}

      {groups.length === 0 && (
        <div className="card guide-empty">
          <p>
            No cards match <b>{q.trim() || '…'}</b>
            {cat !== 'all' ? ' in this category' : ''}. Try a broader tag — “night”, “low
            light”, “tripod” — or clear the search to browse again.
          </p>
          <button className="guide-empty-btn" onClick={resetAll}>
            Clear search &amp; filters
          </button>
        </div>
      )}
    </div>
  );
}

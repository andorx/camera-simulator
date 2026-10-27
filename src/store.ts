/* =====================================================================
   store.ts — target camera state (Zustand). The render engine reads
   this every frame via getState(); UI components subscribe to it for
   the controls. Animated ("current") values live in the engine, not
   here — mirroring the vanilla state/cur split.
   ===================================================================== */

import { create } from 'zustand';
import type { BackgroundKey, ModesDisplay, Shot, SubjectKey, ThemeKey, ViewKey } from './types';
import { SUBJECT_DEFS } from './scenes/registry';
import { distToSlider } from './optics';

/* Small screens (matches the 640px breakpoint in modes.css) start in the
   tabbed view; larger screens start with the card grid. The user can
   switch freely from there — this is only the initial default. */
const DEFAULT_MODES_DISPLAY: ModesDisplay =
  typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches
    ? 'tabs'
    : 'cards';

export interface Preset {
  theme: ThemeKey;
  focal: number;
  ap: number;
  iso: number;
  sh: number;
  dist: number;
  background?: BackgroundKey;
}

export const PRESETS: Record<string, Preset & { label: string }> = {
  classic:   { label: 'Classic',     theme: 'golden', focal: 50, ap: 4, iso: 0, sh: 5, dist: 3 },
  portrait:  { label: 'Portrait',    theme: 'golden', focal: 85, ap: 1, iso: 0, sh: 2, dist: 2.5 },
  landscape: { label: 'Landscape',   theme: 'golden', focal: 24, ap: 6, iso: 0, sh: 7, dist: 12 },
  night:     { label: 'Night street', theme: 'night', focal: 35, ap: 0, iso: 6, sh: 7, dist: 3, background: 'city' },
};

export interface SimState {
  /* active top-level view (tab) */
  view: ViewKey;

  /* Camera Modes page: card grid vs tabbed display */
  modesDisplay: ModesDisplay;

  /* dial targets (indices into APS/ISOS/SHUTTERS where applicable) */
  focal: number;
  ap: number;
  iso: number;
  sh: number;
  dist: number;
  theme: ThemeKey;
  grid: boolean;
  hud: boolean;
  subject: SubjectKey;
  background: BackgroundKey;

  /* film strip */
  shots: Shot[];
  openShot: number | null;

  /* actions */
  setView: (v: ViewKey) => void;
  setModesDisplay: (m: ModesDisplay) => void;
  setFocal: (v: number) => void;
  setAp: (v: number) => void;
  setIso: (v: number) => void;
  setShutter: (v: number) => void;
  setDist: (v: number) => void;
  setTheme: (t: ThemeKey) => void;
  setSubject: (k: SubjectKey) => void;
  setBackground: (k: BackgroundKey) => void;
  applyPreset: (k: string) => void;
  toggleGrid: () => void;
  toggleHud: () => void;
  addShot: (s: Shot) => void;
  clearShots: () => void;
  openShotAt: (i: number | null) => void;
}

export const useSim = create<SimState>()((set) => ({
  view: 'sim',
  modesDisplay: DEFAULT_MODES_DISPLAY,
  focal: 50, ap: 4, iso: 0, sh: 5, dist: 3,
  theme: 'golden', grid: false, hud: true,
  subject: 'person', background: 'meadow',

  shots: [],
  openShot: null,

  setView: (v) => set({ view: v }),
  setModesDisplay: (m) => set({ modesDisplay: m }),
  setFocal: (v) => set({ focal: v }),
  setAp: (v) => set({ ap: v }),
  setIso: (v) => set({ iso: v }),
  setShutter: (v) => set({ sh: v }),
  setDist: (v) => set({ dist: v }),
  setTheme: (t) => set({ theme: t }),

  setSubject: (k) => set((s) => {
    const def = SUBJECT_DEFS[k];
    // a car needs room — pull back if we're inside its minimum distance
    if (def.suggestDist && s.dist < (def.minDist ?? 0)) {
      return { subject: k, dist: def.suggestDist };
    }
    return { subject: k };
  }),

  setBackground: (k) => set({ background: k }),

  applyPreset: (k) => set((s) => {
    const p = PRESETS[k];
    return {
      ...(p.background && p.background !== s.background ? { background: p.background } : {}),
      theme: p.theme, focal: p.focal, ap: p.ap,
      iso: p.iso, sh: p.sh, dist: p.dist,
    };
  }),

  toggleGrid: () => set((s) => ({ grid: !s.grid })),
  toggleHud: () => set((s) => ({ hud: !s.hud })),

  addShot: (shot) => set((s) => {
    const shots = [...s.shots, shot];
    if (shots.length > 12) shots.shift();
    return { shots };
  }),
  clearShots: () => set({ shots: [] }),
  openShotAt: (i) => set({ openShot: i }),
}));

/** Slider position for the (logarithmic) distance dial, kept in sync. */
export const distSlider = (d: number) => distToSlider(d);

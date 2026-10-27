/* =====================================================================
   registry.ts — the full menu of subjects and places (meadow from
   scene.ts merged with the extras from scenes.ts).
   ===================================================================== */

import type { BackgroundDef, BackgroundKey, SubjectDef, SubjectKey } from '../types';
import {
  paintBackdrop, paintLake, paintMeadowFar, paintHouseTrees,
  paintMeadowNear, paintSubject, paintForeground,
} from './scene';
import { SUBJECTS, BACKGROUNDS } from './scenes';

/** Layers: far → near. `dist` in metres; 'focus' = the subject plane. */
const MEADOW_LAYERS = [
  { key: 'backdrop', dist: Infinity as number, paint: paintBackdrop },
  { key: 'lake',     dist: 130,               paint: paintLake },
  { key: 'meadowF',  dist: 60,                paint: paintMeadowFar },
  { key: 'house',    dist: 30,                paint: paintHouseTrees },
  { key: 'meadowN',  dist: 5,  z: 20,         paint: paintMeadowNear },
  { key: 'fg',       dist: 0.7,               paint: paintForeground },
];

export const ALL_BACKGROUNDS: Record<BackgroundKey, BackgroundDef> = {
  meadow: { layers: MEADOW_LAYERS },
  ...BACKGROUNDS,
};

export const SUBJECT_DEFS: Record<SubjectKey, SubjectDef> = {
  person: { h: 1.75, v: 1.4, paint: paintSubject },
  ...SUBJECTS,
};

export const SUBJECT_OPTIONS: { key: SubjectKey; label: string }[] = [
  { key: 'person', label: '🧍 Person' },
  { key: 'dog', label: '🐕 Dog' },
  { key: 'car', label: '🚗 Car' },
  { key: 'flower', label: '🌻 Flower' },
];

export const BACKGROUND_OPTIONS: { key: BackgroundKey; label: string }[] = [
  { key: 'meadow', label: '🏔️ Lakeside' },
  { key: 'beach', label: '🏖️ Beach' },
  { key: 'city', label: '🌆 City' },
  { key: 'forest', label: '🌲 Forest' },
];

export const THEME_OPTIONS: { key: 'golden' | 'overcast' | 'night'; label: string }[] = [
  { key: 'golden', label: '☀️ Golden hour' },
  { key: 'overcast', label: '☁️ Overcast' },
  { key: 'night', label: '🌙 Night' },
];

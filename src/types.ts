/* Shared types for the camera simulator. */

export type ThemeKey = 'golden' | 'overcast' | 'night';
export type SubjectKey = 'person' | 'dog' | 'car' | 'flower';
export type BackgroundKey = 'meadow' | 'beach' | 'city' | 'forest';

/* Top-level navigation views. */
export type ViewKey = 'sim' | 'modes' | 'guide';

/* How the Camera Modes page shows the creative-core modes. */
export type ModesDisplay = 'cards' | 'tabs';

/** A lighting theme — every painter re-renders the whole scene from this. */
export interface Theme {
  key: ThemeKey;
  /** scene illuminance (arbitrary units, drives exposure) */
  E: number;
  sat: number;
  contrast: number;
  vigBoost: number;
  sky: [string, string, string];
  sun: boolean;
  cloud: 'puffy' | 'band' | 'none';
  cloudTop: string;
  cloudBot: string;
  birds: boolean;
  mtnBack: string;
  mtnFront: string;
  snow: string;
  haze: string;
  lakeTop: string;
  lakeBot: string;
  glitter: string | null;
  shore: string;
  meadowFarA: string;
  meadowFarB: string;
  meadowNearA: string;
  meadowNearB: string;
  flowers: boolean;
  pathA: string;
  window: string;
  windowGlow: string | null;
  smoke: boolean;
  foliage: [string, string, string];
  pine: string;
  grass: [string, string, string];
  lamp: boolean;
  stars: boolean;
  moon: boolean;
}

/**
 * A layer painter. Receives a ctx already transformed into design
 * coordinates. `d` (subject distance, metres) is only used by subject
 * painters; place painters may ignore it.
 */
export type Painter = (g: CanvasRenderingContext2D, T: Theme, d: number) => void;

/** One paintable layer of a place, at its true distance (metres). */
export interface LayerDef {
  key: string;
  /** metres; Infinity for the backdrop; 'focus' = the subject plane */
  dist: number | 'focus';
  /** optional explicit compositing order (lower draws first); defaults to sorting by dist */
  z?: number;
  paint: Painter;
}

export interface SubjectDef {
  /** subject height, metres */
  h: number;
  minDist?: number;
  /** when switching to this subject closer than minDist, jump here */
  suggestDist?: number;
  paint: Painter;
}

export interface BackgroundDef {
  layers: LayerDef[];
}

/** A photo in the film strip. */
export interface Shot {
  url: string;
  cap: string;
}

/* =====================================================================
   optics.ts — pure optics math and dial constants (no state inside).
   ===================================================================== */

import { DW, DH, designPxPerM } from './scenes/scene';

export const W = DW, H = DH;                 // preview pixels
export const SENSOR_W = 36, SENSOR_H = 24;   // mm, full-frame
export const COC = 0.03;                     // circle of confusion, mm
export const PX_PER_MM = W / SENSOR_W;       // 44.4 px per sensor mm
export const S35 = Math.tan(Math.atan(SENSOR_W / (2 * 35))); // reference: 35 mm

export const APS = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22];
export const ISOS = [100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600];
export const SHUTTERS = [
  { s: 1 / 8000, l: '1/8000' }, { s: 1 / 4000, l: '1/4000' }, { s: 1 / 2000, l: '1/2000' },
  { s: 1 / 1000, l: '1/1000' }, { s: 1 / 500, l: '1/500' }, { s: 1 / 250, l: '1/250' },
  { s: 1 / 125, l: '1/125' }, { s: 1 / 60, l: '1/60' }, { s: 1 / 30, l: '1/30' },
  { s: 1 / 15, l: '1/15' }, { s: 1 / 8, l: '1/8' }, { s: 1 / 4, l: '1/4' },
  { s: 1 / 2, l: '1/2' }, { s: 1, l: '1"' }, { s: 2, l: '2"' },
];
export const GRAIN_ALPHA = [.025, .04, .06, .09, .13, .19, .27, .38, .52];

/** Subject-distance slider is logarithmic: 0…100 ⇄ 0.5…15 m. */
export const distOf = (t: number) => 0.5 * Math.pow(30, t / 100);
export const distToSlider = (d: number) => Math.round(100 * Math.log(d / 0.5) / Math.log(30));

export const fovScale = (f: number) => S35 / Math.tan(Math.atan(SENSOR_W / (2 * f))); // design px → sensor px
export const hFov = (f: number) => 2 * Math.atan(SENSOR_W / (2 * f)) * 180 / Math.PI;
export const vFov = (f: number) => 2 * Math.atan(SENSOR_H / (2 * f)) * 180 / Math.PI;

/** Defocus blur circle on the sensor, mm, for an object at dM (m, or Infinity). */
export function blurMm(dM: number, f: number, N: number, focusM: number) {
  const A = f / N, s = focusM * 1000, sf = s - f;
  if (sf <= 1) return 0;
  if (!isFinite(dM) || dM > 5000) return (A * f) / sf;
  const dm = dM * 1000;
  return (A * f * Math.abs(s - dm)) / (dm * sf);
}
export const blurPx = (dM: number, f: number, N: number, focusM: number) =>
  blurMm(dM, f, N, focusM) * PX_PER_MM;

/** Depth of field bounds in metres (focus at focusM). */
export function dof(f: number, N: number, focusM: number) {
  const s = focusM * 1000;
  const Hp = (f * f) / (N * COC) + f;            // hyperfocal, mm
  const near = (Hp * s) / (Hp + (s - f)) / 1000; // m
  const far = Hp > (s - f) ? (Hp * s) / (Hp - (s - f)) / 1000 : Infinity;
  return { near, far, hyperfocal: Hp / 1000 };
}

/** Scene brightness captured: 1.0 = correctly exposed. */
export const brightness = (iso: number, t: number, N: number, E: number) =>
  (iso / 100) * t * E / (N * N);

export const shakePx = (t: number, f: number) =>
  Math.min(15, Math.max(0, 1.35 * t * f - 1.1));

/**
 * Subject-motion smear, preview px. A subject crossing the frame at v m/s
 * (perpendicular to the axis) sweeps v·t metres during the exposure; through
 * the same rendered scale the subject itself is drawn at (designPxPerM ×
 * fovScale) that becomes a smear of v·t·px/m px. Blur relative to the
 * subject's own height is therefore physically exact: (v·t)/h.
 */
export const motionBlurPx = (v: number, t: number, d: number, f: number) =>
  v * t * designPxPerM(d) * fovScale(f);

export function fmtM(v: number) {
  if (!isFinite(v)) return '∞';
  if (v >= 10) return `${v.toFixed(0)} m`;
  if (v >= 1) return `${v.toFixed(1)} m`;
  return `${(v * 100).toFixed(0)} cm`;
}

/** Entrance-pupil iris radius for the aperture diagram. */
export const irisTargetR = (N: number) => 6 + 42 * Math.pow(1.4 / N, 0.55);

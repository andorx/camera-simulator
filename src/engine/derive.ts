/* =====================================================================
   derive.ts — pure functions turning the engine's animated `cur`
   values + target state into everything the overlays show (HUD,
   meter, stats, impact ladders, AF box, tips). Ported 1:1 from the
   vanilla updateOverlays / updateStats / updateImpacts / updateAf /
   updateTips.
   ===================================================================== */

import type { LiveFrame } from '../live';
import { THEMES } from '../scenes/scene';
import { SUBJECT_DEFS } from '../scenes/registry';
import { subjectGeometry } from '../scenes/scenes';
import {
  SHUTTERS, GRAIN_ALPHA, W, H,
  blurPx, dof, hFov, vFov, shakePx, brightness, fmtM,
} from '../optics';
import type { SimState } from '../store';

/** The engine's animated current values (see engine.ts). */
export interface Cur {
  f: number; N: number; iso: number; t: number; d: number;
  s: number; cx: number; cy: number;
}

export function deriveFrame(cur: Cur, st: SimState): LiveFrame {
  const T = THEMES[st.theme];
  const B = brightness(cur.iso, cur.t, cur.N, T.E);
  const stops = Math.log2(Math.max(B, 1e-4));

  /* ---- HUD chips ---- */
  const evCls = Math.abs(stops) < 0.6 ? 'ok' : Math.abs(stops) < 2 ? 'warn' : 'bad';

  /* ---- exposure meter ---- */
  const meterLeft = Math.max(1.5, Math.min(98.5, 50 + (stops / 3) * 50));
  const verdict =
    Math.abs(stops) < 0.5 ? 'Correct exposure' :
    Math.abs(stops) < 1.5 ? (stops > 0 ? 'Slightly overexposed' : 'Slightly underexposed') :
    Math.abs(stops) < 3 ? (stops > 0 ? 'Overexposed — highlights clipping' : 'Underexposed — shadows crushing') :
    (stops > 0 ? 'Blown out' : 'Far too dark');
  const verdictCls = Math.abs(stops) < 0.5 ? 'ok' : Math.abs(stops) < 1.5 ? 'warn' : 'bad';

  /* ---- shot intelligence stats ---- */
  const { near, far, hyperfocal } = dof(cur.f, cur.N, cur.d);
  const total = far - near;
  const bgPx = blurPx(Infinity, cur.f, cur.N, cur.d);
  const blurTag = bgPx < 2.5 ? 'subtle' : bgPx < 9 ? 'moderate' : bgPx < 28 ? 'strong' : 'creamy';
  const sh = shakePx(cur.t, cur.f);

  /* ---- explainer impact ladders ---- */
  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
  const { f, N, d, t } = cur;
  const iso = Math.max(100, Math.min(25600, cur.iso));

  const totM = far - near;
  const dofLvl = isFinite(totM) ? clamp01(Math.log10(1 + totM / 0.02) / 3.3) : 1;
  const isoStop = Math.log2(iso / 100);                              // 0…8
  const noiseLvl = GRAIN_ALPHA[Math.round(isoStop)] / GRAIN_ALPHA[8];
  const shStop = Math.log2(t * 8000);
  const { h: subjH } = subjectGeometry(SUBJECT_DEFS[st.subject].h, d);

  const ladders: Record<string, number> = {
    // shared factors (shown on several cards)
    dof: dofLvl,
    bgblur: clamp01(Math.sqrt(blurPx(Infinity, f, N, d) / 80)),
    shake: clamp01(shakePx(t, f) / 15),
    // focal length
    zoom: clamp01((f - 24) / 176),
    // aperture (per-dial light: ƒ/1.4 wide open = full volume)
    lightN: clamp01(1 - 2 * Math.log2(N / 1.4) / 8),
    diffr: N >= 16 ? clamp01(0.22 * (N - 14) / 2.2) : 0,
    // ISO
    lightIso: clamp01(isoStop / 8),
    noise: clamp01(noiseLvl),
    colour: clamp01(1 - noiseLvl),
    // shutter (t spans 1/8000 → 2 s ≈ 14 stops)
    lightT: clamp01(shStop / 14),
    freeze: clamp01(1 - shStop / 14),
    // subject distance — on-screen size of the subject
    subjsize: clamp01((Math.log(subjH * cur.s) - Math.log(24)) / (Math.log(1400) - Math.log(24))),
  };

  /* ---- AF box ---- */
  const { h, baseY } = subjectGeometry(SUBJECT_DEFS[st.subject].h, cur.d);
  const sx = (800 - cur.cx) * cur.s + W / 2;
  const sy = (baseY - h * 0.7 - cur.cy) * cur.s + H / 2;
  const side = Math.max(28, Math.min(340, h * 0.2 * cur.s));
  const inside = sx > -side && sx < W + side && sy > -side && sy < H + side;

  return {
    f: cur.f,
    N: cur.N,
    iso: cur.iso,
    shutterLabel: SHUTTERS[st.sh].l,
    evStops: stops,
    evCls,
    meterLeft,
    verdict,
    verdictCls,
    stats: {
      fov: `${hFov(cur.f).toFixed(1)}° × ${vFov(cur.f).toFixed(1)}°`,
      dof: `${fmtM(near)} – ${fmtM(far)}`,
      dofTotal: isFinite(total) ? fmtM(total) : 'infinite (∞)',
      hyperfocal: fmtM(hyperfocal),
      blur: `${blurTag} · ${bgPx.toFixed(0)} px`,
      shake: sh < 0.8 ? 'none' : `≈${sh.toFixed(0)} px smear`,
    },
    ladders,
    af: {
      inside,
      left: ((sx - side / 2) / W) * 100,
      top: ((sy - side / 2) / H) * 100,
      w: (side / W) * 100,
      h: (side / H) * 100,
    },
  };
}

export function deriveTips(cur: Cur, st: SimState): string[] {
  const tips: string[] = [];
  const T = THEMES[st.theme];
  const B = brightness(cur.iso, cur.t, cur.N, T.E);
  const stops = Math.log2(Math.max(B, 1e-4));
  const { near, far } = dof(cur.f, cur.N, cur.d);
  const total = far - near;
  const sh = shakePx(cur.t, cur.f);

  if (stops > 2) {
    const need = SHUTTERS.find(s => s.s >= cur.t / B) || SHUTTERS[SHUTTERS.length - 1];
    tips.push(`Overexposed +${stops.toFixed(1)} EV — try ${need.l} s, ISO ${Math.max(100, Math.round(cur.iso / B / 100) * 100)} or a smaller aperture.`);
  } else if (stops < -2) {
    const need = SHUTTERS.find(s => s.s >= cur.t / B) || SHUTTERS[SHUTTERS.length - 1];
    tips.push(`Underexposed ${stops.toFixed(1)} EV — try ${need.l} s, higher ISO or open the aperture.`);
  }
  if (isFinite(total) && total < 0.3 && cur.f >= 50)
    tips.push(`Razor-thin depth of field (${(total * 100).toFixed(0)} cm) — focus lands on the eyes or misses.`);
  if (isFinite(total) && total > 20)
    tips.push('Deep focus: everything from the subject to the horizon stays sharp.');
  if (!isFinite(far)) tips.push(`Focus is past the hyperfocal — everything from ${fmtM(near)} to ∞ is sharp.`);
  if (cur.N >= 16) tips.push('Stopped way down — diffraction is softening fine detail. ƒ/8–11 is usually the sweet spot.');
  if (sh >= 1.5) tips.push(`Handheld shake at ${Math.round(cur.f)}mm: keep shutter ≥ 1/${Math.max(1, Math.round(cur.f))} s (or brace).`);
  if (cur.iso >= 3200) tips.push(`ISO ${cur.iso >= 1000 ? Math.round(cur.iso / 100) / 10 + 'k' : cur.iso}: grain builds and colors wash out — expose brighter to keep noise down.`);
  if (cur.f >= 135) tips.push('Telephoto: compressed perspective and heavy background blur — even at small apertures.');

  return tips.slice(0, 3);
}

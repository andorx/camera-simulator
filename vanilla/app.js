/* =====================================================================
   app.js — camera simulator: optics physics, layered renderer, UI.
   Preview canvas is 1600×1067 (a 3:2 full-frame frame).
   ===================================================================== */

import {
  THEMES, DW, DH, personGeom,
  paintBackdrop, paintLake, paintMeadowFar, paintHouseTrees,
  paintMeadowNear, paintSubject, paintForeground,
} from './scene.js';
import { SUBJECTS, BACKGROUNDS, subjectGeometry } from './scenes.js';

const $ = s => document.querySelector(s);

/* --------------------------- constants ------------------------------ */
const W = DW, H = DH;                       // preview pixels
const SENSOR_W = 36, SENSOR_H = 24;         // mm, full-frame
const COC = 0.03;                           // circle of confusion, mm
const PX_PER_MM = W / SENSOR_W;             // 44.4 px per sensor mm
const S35 = Math.tan(Math.atan(SENSOR_W / (2 * 35))); // reference: 35 mm

const APS   = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22];
const ISOS  = [100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600];
const SHUTTERS = [
  { s: 1 / 8000, l: '1/8000' }, { s: 1 / 4000, l: '1/4000' }, { s: 1 / 2000, l: '1/2000' },
  { s: 1 / 1000, l: '1/1000' }, { s: 1 / 500, l: '1/500' }, { s: 1 / 250, l: '1/250' },
  { s: 1 / 125, l: '1/125' }, { s: 1 / 60, l: '1/60' }, { s: 1 / 30, l: '1/30' },
  { s: 1 / 15, l: '1/15' }, { s: 1 / 8, l: '1/8' }, { s: 1 / 4, l: '1/4' },
  { s: 1 / 2, l: '1/2' }, { s: 1, l: '1"' }, { s: 2, l: '2"' },
];
const GRAIN_ALPHA = [.025, .04, .06, .09, .13, .19, .27, .38, .52];

/* ----------------------------- state -------------------------------- */
const state = {
  focal: 50, ap: 4, iso: 0, sh: 5, dist: 3,
  theme: 'golden', grid: false, hud: true,
  subject: 'person', background: 'meadow',
};
// animated current values (lerped toward targets derived from `state`)
const cur = { f: 50, N: 5.6, iso: 100, t: 1 / 250, d: 3, s: 1, cx: 800, cy: 380 };

const theme = () => THEMES[state.theme];

/* --------------------------- optics math ----------------------------- */
const fovScale = f => S35 / Math.tan(Math.atan(SENSOR_W / (2 * f))); // design px → sensor px
const hFov = f => 2 * Math.atan(SENSOR_W / (2 * f)) * 180 / Math.PI;
const vFov = f => 2 * Math.atan(SENSOR_H / (2 * f)) * 180 / Math.PI;

/** Defocus blur circle on the sensor, mm, for an object at dM (m, or Infinity). */
function blurMm(dM, f, N, focusM) {
  const A = f / N, s = focusM * 1000, sf = s - f;
  if (sf <= 1) return 0;
  if (!isFinite(dM) || dM > 5000) return (A * f) / sf;
  const dm = dM * 1000;
  return (A * f * Math.abs(s - dm)) / (dm * sf);
}
const blurPx = (dM, f, N, focusM) => blurMm(dM, f, N, focusM) * PX_PER_MM;

/** Depth of field bounds in metres (focus at focusM). */
function dof(f, N, focusM) {
  const s = focusM * 1000;
  const Hp = (f * f) / (N * COC) + f;            // hyperfocal, mm
  const near = (Hp * s) / (Hp + (s - f)) / 1000; // m
  const far = Hp > (s - f) ? (Hp * s) / (Hp - (s - f)) / 1000 : Infinity;
  return { near, far, hyperfocal: Hp / 1000 };
}

/** Scene brightness captured: 1.0 = correctly exposed. */
const brightness = () =>
  (cur.iso / 100) * cur.t * theme().E / (cur.N * cur.N);

const shakePx = () => Math.min(15, Math.max(0, 1.35 * cur.t * cur.f - 1.1));

/* --------------------------- canvases -------------------------------- */
const sceneCv = $('#scene'), grainCv = $('#grain');
const ctx = sceneCv.getContext('2d');
const gctx = grainCv.getContext('2d');

const mk = (w, h) => Object.assign(document.createElement('canvas'), { width: w, height: h });
const tcv = mk(400, 267), tctx = tcv.getContext('2d');   // blur downsample buffer
const scv = mk(W, H), sctx = scv.getContext('2d');       // scratch copy
const hcv = mk(100, 67), hctx = hcv.getContext('2d', { willReadFrequently: true }); // histogram probe

/* Layers: far → near. `dist` in metres; 'focus' = the subject plane. */
const MEADOW_LAYERS = [
  { key: 'backdrop', dist: Infinity, paint: paintBackdrop },
  { key: 'lake',     dist: 130,      paint: paintLake },
  { key: 'meadowF',  dist: 60,       paint: paintMeadowFar },
  { key: 'house',    dist: 30,       paint: paintHouseTrees },
  { key: 'meadowN',  dist: 5,        paint: paintMeadowNear },
  { key: 'fg',       dist: 0.7,      paint: paintForeground },
];
const ALL_BACKGROUNDS = { meadow: { layers: MEADOW_LAYERS }, ...BACKGROUNDS };
const SUBJECT_DEFS = { person: { h: 1.75, paint: paintSubject }, ...SUBJECTS };

let layers = [];
function buildLayers() {
  const defs = [
    ...ALL_BACKGROUNDS[state.background].layers,
    { key: 'subject', dist: 'focus', paint: SUBJECT_DEFS[state.subject].paint },
  ];
  layers = defs.map(def => ({ ...def, cv: mk(W, H), drawn: { s: 0, cx: 0, cy: 0, d: 0 } }));
}

/* ------------------------- layer rendering --------------------------- */
function redrawLayers() {
  const T = theme();
  const { s, cx, cy, d } = cur;
  for (const L of layers) {
    const needs =
      Math.abs(s / L.drawn.s - 1) > 0.002 ||
      Math.abs(cx - L.drawn.cx) * s > 0.8 ||
      Math.abs(cy - L.drawn.cy) * s > 0.8 ||
      (L.key === 'subject' && Math.abs(d - L.drawn.d) > d * 0.004) ||
      L.drawn.theme !== state.theme ||
      L.drawn.paint !== L.paint;
    if (!needs) continue;
    const g = L.cv.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, W, H);
    g.setTransform(s, 0, 0, s, 800 - cx * s, 533 - cy * s);
    L.paint(g, T, d);
    L.drawn = { s, cx, cy, d, theme: state.theme, paint: L.paint };
  }
}

function drawWithBlur(g, cv, dx, dy, dw, dh, bpx) {
  bpx = Math.min(bpx, 240);
  if (bpx < 0.45) { g.drawImage(cv, dx, dy, dw, dh); return; }
  if (bpx <= 10) {
    g.filter = `blur(${bpx.toFixed(2)}px)`;
    g.drawImage(cv, dx, dy, dw, dh);
    g.filter = 'none';
    return;
  }
  tctx.clearRect(0, 0, tcv.width, tcv.height);
  tctx.filter = `blur(${(bpx / 4).toFixed(2)}px)`;
  tctx.drawImage(cv, 0, 0, tcv.width, tcv.height);
  tctx.filter = 'none';
  g.drawImage(tcv, dx, dy, dw, dh);
}

/* -------------------------- final composite -------------------------- */
let grainNow = { alpha: 0 };

function composite() {
  const T = theme();
  const { f, N, d, s, cx, cy } = cur;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  ctx.clearRect(0, 0, W, H);

  let maxBlur = 0;
  const order = [...layers].sort((a, b) => {
    const da = a.dist === 'focus' ? d : a.dist, db = b.dist === 'focus' ? d : b.dist;
    return db - da;
  });
  for (const L of order) {
    const ld = L.dist === 'focus' ? d : L.dist;
    const bpx = L.dist === 'focus' ? 0 : blurPx(ld, f, N, d);
    maxBlur = Math.max(maxBlur, bpx);
    const k = s / L.drawn.s;
    const dx = (L.drawn.cx - W / (2 * L.drawn.s) - cx) * s + W / 2;
    const dy = (L.drawn.cy - H / (2 * L.drawn.s) - cy) * s + H / 2;
    drawWithBlur(ctx, L.cv, dx, dy, W * k, H * k, bpx);
  }

  function copyToScratch() {
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    sctx.clearRect(0, 0, W, H);
    sctx.drawImage(sceneCv, 0, 0);
  }

  // pull the frame in a hair so blurred edges never show transparency
  if (maxBlur > 6) {
    copyToScratch();
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(scv, -W * 0.008, -H * 0.008, W * 1.016, H * 1.016);
  }

  // camera shake smear
  const sh = shakePx();
  if (sh >= 0.8) {
    copyToScratch();
    const ang = ((f * 37 + d * 11 + N) % 360) * Math.PI / 180;
    const ux = Math.cos(ang), uy = Math.sin(ang);
    ctx.clearRect(0, 0, W, H);
    const passes = [[0, .5], [.42, .25], [.8, .14], [1.25, .11]];
    for (const [off, a] of passes) {
      ctx.globalAlpha = a;
      ctx.drawImage(scv, -ux * sh * off, -uy * sh * off);
    }
    ctx.globalAlpha = 1;
  }

  // diffraction softening at tiny apertures
  if (N >= 16) {
    const soft = Math.min(2.2, 0.22 * (N - 14));
    copyToScratch();
    ctx.filter = `blur(${soft.toFixed(2)}px)`;
    ctx.drawImage(scv, 0, 0);
    ctx.filter = 'none';
  }

  // film grade for the scene
  copyToScratch();
  ctx.filter = `saturate(${T.sat}) contrast(${T.contrast})`;
  ctx.drawImage(scv, 0, 0);
  ctx.filter = 'none';

  // exposure
  const B = brightness();
  if (B > 1) {
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = Math.min(0.96, 1 - Math.pow(B, -0.55));
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    if (B > 1.6) {  // highlight bloom
      copyToScratch();
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = Math.min(0.6, (B - 1.6) * 0.18);
      ctx.filter = `blur(16px) brightness(${Math.min(2.6, B / 3)})`;
      ctx.drawImage(scv, 0, 0);
      ctx.filter = 'none'; ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    }
  } else if (B < 0.98) {
    ctx.fillStyle = '#000';
    ctx.globalAlpha = Math.min(0.965, 1 - Math.pow(B, 0.42));
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  // vignette — widest apertures breathe light onto the corners
  const openness = Math.max(0, Math.min(1, (2.8 - N) / (2.8 - 1.4)));
  const vig = 0.10 + 0.24 * openness + T.vigBoost;
  const rg = ctx.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H * 0.95);
  rg.addColorStop(0, 'rgba(0,0,0,0)');
  rg.addColorStop(1, `rgba(0,0,0,${vig.toFixed(3)})`);
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, W, H);

  updateOverlays(B);
}

/* ------------------------------ grain -------------------------------- */
const grainTile = mk(256, 256);
(function buildGrainTile() {
  const g = grainTile.getContext('2d');
  const img = g.createImageData(256, 256);
  const R = mulberry(1234);
  for (let i = 0; i < img.data.length; i += 4) {
    const L = (R() + R() - 1) * 108;          // quasi-gaussian luma noise
    const C = (R() - 0.5) * 56;               // chroma noise
    img.data[i]     = 128 + L + C;
    img.data[i + 1] = 128 + L;
    img.data[i + 2] = 128 + L - C;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
})();
function mulberry(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function grainAlpha() {
  const stops = Math.log2(cur.iso / 100);
  const base = GRAIN_ALPHA[Math.max(0, Math.min(8, Math.round(stops)))];
  const B = Math.max(0.07, brightness());
  return Math.min(0.85, base * Math.min(2.2, 1 / Math.sqrt(B)));
}
function drawGrain() {
  const a = grainAlpha();
  grainNow.alpha = a;
  gctx.setTransform(1, 0, 0, 1, 0, 0);
  gctx.clearRect(0, 0, W, H);
  if (a < 0.012) return;
  const pat = gctx.createPattern(grainTile, 'repeat');
  const stops = Math.log2(cur.iso / 100);
  const ox = -Math.random() * 256, oy = -Math.random() * 256;
  gctx.globalAlpha = a;
  gctx.translate(ox, oy);
  gctx.fillStyle = pat;
  gctx.fillRect(0, 0, W + 256, H + 256);
  // clumpy chroma pass at high ISO
  if (stops >= 4) {
    gctx.setTransform(1, 0, 0, 1, 0, 0);
    gctx.translate(-Math.random() * 256, -Math.random() * 256);
    gctx.scale(2.6, 2.6);
    gctx.globalAlpha = a * 0.5;
    gctx.fillStyle = pat;
    gctx.fillRect(0, 0, W, H);
  }
  gctx.setTransform(1, 0, 0, 1, 0, 0);
  gctx.globalAlpha = 1;
}

/* ---------------------------- histogram ------------------------------ */
const histoCv = $('#histo');
const hg = histoCv.getContext('2d');
function drawHistogram() {
  hctx.drawImage(sceneCv, 0, 0, 100, 67);
  const { data } = hctx.getImageData(0, 0, 100, 67);
  const bins = new Array(40).fill(0);
  for (let i = 0; i < data.length; i += 4) {
    const l = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    bins[Math.min(39, l / 256 * 40 | 0)]++;
  }
  const mx = Math.max(...bins);
  const w = histoCv.width, h = histoCv.height;
  hg.clearRect(0, 0, w, h);
  hg.fillStyle = 'rgba(255,255,255,.05)';
  hg.fillRect(0, 0, w, h);
  bins.forEach((b, i) => {
    const bh = Math.pow(b / mx, 0.6) * h;
    hg.fillStyle = '#ffb454';
    hg.fillRect(i * (w / 40) + 1, h - bh, w / 40 - 1.5, bh);
  });
}

/* ------------------------------ HUD ---------------------------------- */
const hud = {
  focal: $('#hudFocal'), ap: $('#hudAp'), iso: $('#hudIso'), sh: $('#hudShutter'), ev: $('#hudEv'),
  af: $('#afBox'), meterVal: $('#meterVal'), needle: $('#meterNeedle'), verdict: $('#meterVerdict'),
};

function updateOverlays(B) {
  const stops = Math.log2(Math.max(B, 1e-4));
  hud.focal.textContent = `${Math.round(cur.f)}mm`;
  hud.ap.textContent = String(cur.N < 10 ? +cur.N.toFixed(1) : Math.round(cur.N));
  hud.iso.textContent = cur.iso >= 1000 ? `${Math.round(cur.iso / 100) / 10}k` : Math.round(cur.iso);
  hud.sh.textContent = SHUTTERS[state.sh].l;
  hud.ev.textContent = `${stops >= 0 ? '+' : ''}${stops.toFixed(1)} EV`;
  hud.ev.className = 'chip ev ' + (Math.abs(stops) < 0.6 ? 'ok' : Math.abs(stops) < 2 ? 'warn' : 'bad');

  hud.meterVal.textContent = `${stops >= 0 ? '+' : ''}${stops.toFixed(1)} EV`;
  hud.needle.style.left = `${Math.max(1.5, Math.min(98.5, 50 + (stops / 3) * 50))}%`;
  hud.verdict.textContent =
    Math.abs(stops) < 0.5 ? 'Correct exposure' :
    Math.abs(stops) < 1.5 ? (stops > 0 ? 'Slightly overexposed' : 'Slightly underexposed') :
    Math.abs(stops) < 3 ? (stops > 0 ? 'Overexposed — highlights clipping' : 'Underexposed — shadows crushing') :
    (stops > 0 ? 'Blown out' : 'Far too dark');
  hud.verdict.className = 'meter-verdict ' + (Math.abs(stops) < 0.5 ? 'ok' : Math.abs(stops) < 1.5 ? 'warn' : 'bad');

  updateStats(stops);
  updateAf();
}

function fmtM(v) {
  if (!isFinite(v)) return '∞';
  if (v >= 10) return `${v.toFixed(0)} m`;
  if (v >= 1) return `${v.toFixed(1)} m`;
  return `${(v * 100).toFixed(0)} cm`;
}

function updateStats(stops) {
  const { near, far, hyperfocal } = dof(cur.f, cur.N, cur.d);
  const total = far - near;
  $('#stFov').textContent = `${hFov(cur.f).toFixed(1)}° × ${vFov(cur.f).toFixed(1)}°`;
  $('#stDof').textContent = `${fmtM(near)} – ${fmtM(far)}`;
  $('#stDofTotal').textContent = isFinite(total) ? fmtM(total) : 'infinite (∞)';
  $('#stHyperf').textContent = fmtM(hyperfocal);

  const bgPx = blurPx(Infinity, cur.f, cur.N, cur.d);
  const tag = bgPx < 2.5 ? 'subtle' : bgPx < 9 ? 'moderate' : bgPx < 28 ? 'strong' : 'creamy';
  $('#stBlur').textContent = `${tag} · ${bgPx.toFixed(0)} px`;

  const sh = shakePx();
  $('#stShake').textContent = sh < 0.8 ? 'none' : `≈${sh.toFixed(0)} px smear`;

  updateImpacts();
}

/* --------------------- explainer impact ladders ---------------------- */
/* One volume-style ladder per photo factor. Lit bars = that factor's
   strength right now (from the same math as the preview); the row's
   arrow shows which way the factor moves when you raise that dial.   */
const ladderEls = {};
function bootstrapLadders() {
  document.querySelectorAll('.irow').forEach(row => {
    const lad = document.createElement('span');
    lad.className = 'ladder';
    lad.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 5; i++) lad.appendChild(document.createElement('i'));
    row.insertBefore(lad, row.lastElementChild);       // between name and arrow
    (ladderEls[row.dataset.k] ??= []).push(lad);
  });
}
function setLadder(k, v) {
  const lit = Math.max(0, Math.min(5, Math.round(v * 5)));
  for (const lad of ladderEls[k] || []) {
    for (let i = 0; i < 5; i++) lad.children[i].classList.toggle('on', i < lit);
  }
}
function updateImpacts() {
  const clamp01 = v => Math.max(0, Math.min(1, v));
  const { f, N, d, t } = cur;
  const iso = Math.max(100, Math.min(25600, cur.iso));

  // shared factors (shown on several cards)
  const { far, near } = dof(f, N, d);
  const totM = far - near;
  const dofLvl = isFinite(totM) ? clamp01(Math.log10(1 + totM / 0.02) / 3.3) : 1;
  setLadder('dof', dofLvl);
  setLadder('bgblur', clamp01(Math.sqrt(blurPx(Infinity, f, N, d) / 80)));
  setLadder('shake', clamp01(shakePx() / 15));

  // focal length
  setLadder('zoom', clamp01((f - 24) / 176));

  // aperture (per-dial light: ƒ/1.4 wide open = full volume)
  setLadder('lightN', clamp01(1 - 2 * Math.log2(N / 1.4) / 8));
  setLadder('diffr', N >= 16 ? clamp01(0.22 * (N - 14) / 2.2) : 0);

  // ISO
  const isoStop = Math.log2(iso / 100);                              // 0…8
  const noiseLvl = GRAIN_ALPHA[Math.round(isoStop)] / GRAIN_ALPHA[8];
  setLadder('lightIso', clamp01(isoStop / 8));
  setLadder('noise', clamp01(noiseLvl));
  setLadder('colour', clamp01(1 - noiseLvl));

  // shutter (t spans 1/8000 → 2 s ≈ 14 stops)
  const shStop = Math.log2(t * 8000);
  setLadder('lightT', clamp01(shStop / 14));
  setLadder('freeze', clamp01(1 - shStop / 14));

  // subject distance — on-screen size of the subject
  const { h } = subjectGeometry(SUBJECT_DEFS[state.subject].h, d);
  setLadder('subjsize', clamp01((Math.log(h * cur.s) - Math.log(24)) / (Math.log(1400) - Math.log(24))));
}

function updateAf() {
  const { h, baseY } = subjectGeometry(SUBJECT_DEFS[state.subject].h, cur.d);
  const sx = (800 - cur.cx) * cur.s + W / 2;
  const sy = (baseY - h * 0.7 - cur.cy) * cur.s + H / 2;
  const side = Math.max(28, Math.min(340, h * 0.2 * cur.s));
  const inside = sx > -side && sx < W + side && sy > -side && sy < H + side;
  hud.af.hidden = !state.hud || !inside;
  if (!hud.af.hidden) {
    hud.af.style.left = `${(sx - side / 2) / W * 100}%`;
    hud.af.style.top = `${(sy - side / 2) / H * 100}%`;
    hud.af.style.width = `${side / W * 100}%`;
    hud.af.style.height = `${side / H * 100}%`;
  }
}

/* ------------------------------ tips --------------------------------- */
function updateTips() {
  const tips = [];
  const B = brightness(), stops = Math.log2(Math.max(B, 1e-4));
  const { near, far } = dof(cur.f, cur.N, cur.d);
  const total = far - near;
  const sh = shakePx();

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

  $('#tips').innerHTML = tips.slice(0, 3).map(t => `<li>${t}</li>`).join('');
}

/* ------------------------- aperture iris SVG ------------------------- */
const irisSvg = $('#irisSvg');
let irisR = 25;
function buildIris(r) {
  const cx = 60, cy = 60, Router = 50;
  let s = `<circle cx="${cx}" cy="${cy}" r="${Router + 5}" fill="#12151c" stroke="#3a4152" stroke-width="2"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${Router}" fill="#0c0e13" stroke="#4a5266" stroke-width="1.5"/>`;
  const pts = [];
  for (let i = 0; i < 9; i++) {
    const a0 = (i / 9) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1.35) / 9) * Math.PI * 2 - Math.PI / 2;
    const x0 = cx + Math.cos(a0) * Router, y0 = cy + Math.sin(a0) * Router;
    const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
    pts.push(`<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}"/>`);
  }
  s += `<g stroke="#5d6775" stroke-width="4" stroke-linecap="round">${pts.join('')}</g>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#ffb454" stroke-width="2"/>`;
  irisSvg.innerHTML = s;
}
const irisTargetR = () => 6 + 42 * Math.pow(1.4 / cur.N, 0.55);

/* --------------------------- render loop ----------------------------- */
let lastT = performance.now(), dirty = true, slowFrames = 0;

function targetCenter() {
  const { h, baseY } = subjectGeometry(SUBJECT_DEFS[state.subject].h, cur.d);
  return { cx: 800, cy: Math.max(150, Math.min(860, baseY - h * 0.7)) };
}

function tick(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;
  const k = 1 - Math.exp(-dt * 8);

  const prev = { ...cur };
  cur.f += (state.focal - cur.f) * k;
  cur.N += (APS[state.ap] - cur.N) * k;
  cur.iso *= Math.pow(ISOS[state.iso] / cur.iso, k);
  cur.t *= Math.pow(SHUTTERS[state.sh].s / cur.t, k);
  cur.d *= Math.pow(state.dist / cur.d, k);
  cur.s = fovScale(cur.f);
  const tc = targetCenter();
  cur.cx += (tc.cx - cur.cx) * k;
  cur.cy += (tc.cy - cur.cy) * k;

  const moved =
    Math.abs(cur.f - prev.f) > 0.01 || Math.abs(cur.N - prev.N) > 0.004 ||
    Math.abs(cur.iso - prev.iso) > 0.5 || Math.abs(cur.t - prev.t) / cur.t > 0.002 ||
    Math.abs(cur.d - prev.d) / cur.d > 0.0015 ||
    Math.abs(cur.cx - prev.cx) > 0.05 || Math.abs(cur.cy - prev.cy) > 0.05;

  if ((moved || dirty) && slowFrames < 2) {
    const t0 = performance.now();
    redrawLayers();
    composite();
    const cost = performance.now() - t0;
    slowFrames = cost > 26 ? 2 : 0;
    dirty = false;
  } else if (slowFrames > 0) slowFrames--;

  // iris
  const itr = irisTargetR();
  if (Math.abs(itr - irisR) > 0.15) { irisR += (itr - irisR) * 0.25; buildIris(irisR); }

  requestAnimationFrame(tick);
}

/* ------------------------------ inputs ------------------------------- */
function refreshOutputs() {
  $('#outFocal').textContent = `${state.focal} mm`;
  $('#outAp').textContent = `ƒ/${APS[state.ap]}`;
  $('#outIso').textContent = ISOS[state.iso] >= 1000 ? `${ISOS[state.iso] / 1000}k` : ISOS[state.iso];
  $('#outShutter').textContent = `${SHUTTERS[state.sh].l} s`;
  $('#outDist').textContent = state.dist >= 10 ? `${state.dist.toFixed(0)} m` : `${state.dist.toFixed(1)} m`;
  $('#pupilVal').textContent = `${(state.focal / APS[state.ap]).toFixed(1)} mm`;
}

$('#inFocal').addEventListener('input', e => { state.focal = +e.target.value; refreshOutputs(); dirty = true; });
$('#inAp').addEventListener('input', e => { state.ap = +e.target.value; refreshOutputs(); dirty = true; });
$('#inIso').addEventListener('input', e => { state.iso = +e.target.value; refreshOutputs(); dirty = true; });
$('#inShutter').addEventListener('input', e => { state.sh = +e.target.value; refreshOutputs(); dirty = true; });
const distOf = t => 0.5 * Math.pow(30, t / 100);
$('#inDist').addEventListener('input', e => { state.dist = distOf(+e.target.value); refreshOutputs(); dirty = true; });

document.querySelectorAll('.ticks span').forEach(el => {
  el.addEventListener('click', () => {
    const input = el.parentElement.dataset.for;
    const v = +el.dataset.v;
    if (input === 'inFocal') state.focal = v;
    if (input === 'inAp') state.ap = v;
    if (input === 'inIso') state.iso = v;
    if (input === 'inShutter') state.sh = v;
    if (input === 'inDist') state.dist = distOf(v);
    document.getElementById(input).value = v;
    refreshOutputs(); dirty = true;
  });
});

/* themes */
document.querySelectorAll('#themeSeg button').forEach(b => {
  b.addEventListener('click', () => {
    state.theme = b.dataset.theme;
    document.querySelectorAll('#themeSeg button').forEach(x => x.classList.toggle('active', x === b));
    dirty = true;
  });
});

/* subject & place */
function setSubject(k) {
  state.subject = k;
  const def = SUBJECT_DEFS[k];
  const lay = layers.find(l => l.key === 'subject');
  if (lay) lay.paint = def.paint;
  // a car needs room — pull back if we're inside its minimum distance
  if (def.suggestDist && state.dist < def.minDist) {
    state.dist = def.suggestDist;
    $('#inDist').value = Math.round(100 * Math.log(state.dist / 0.5) / Math.log(30));
  }
  refreshOutputs();
  dirty = true;
}
function setBackground(k) {
  state.background = k;
  buildLayers();
  dirty = true;
}
function syncSceneSegs() {
  document.querySelectorAll('#subjectSeg button').forEach(x =>
    x.classList.toggle('active', x.dataset.subject === state.subject));
  document.querySelectorAll('#bgSeg button').forEach(x =>
    x.classList.toggle('active', x.dataset.bg === state.background));
}
document.querySelectorAll('#subjectSeg button').forEach(b =>
  b.addEventListener('click', () => { setSubject(b.dataset.subject); syncSceneSegs(); }));
document.querySelectorAll('#bgSeg button').forEach(b =>
  b.addEventListener('click', () => { setBackground(b.dataset.bg); syncSceneSegs(); }));

/* presets */
const PRESETS = {
  classic:  { theme: 'golden',   focal: 50, ap: 4, iso: 0, sh: 5, dist: 3 },
  portrait: { theme: 'golden',   focal: 85, ap: 1, iso: 0, sh: 1, dist: 2.5 },
  landscape:{ theme: 'golden',   focal: 24, ap: 6, iso: 0, sh: 7, dist: 12 },
  night:    { theme: 'night',    focal: 35, ap: 0, iso: 6, sh: 7, dist: 3, background: 'city' },
};
document.querySelectorAll('.presets button').forEach(b => {
  b.addEventListener('click', () => {
    const p = PRESETS[b.dataset.preset];
    state.theme = p.theme; state.focal = p.focal; state.ap = p.ap;
    state.iso = p.iso; state.sh = p.sh; state.dist = p.dist;
    if (p.background && p.background !== state.background) {
      state.background = p.background; buildLayers();
    }
    document.querySelectorAll('#themeSeg button').forEach(x => x.classList.toggle('active', x.dataset.theme === p.theme));
    syncSceneSegs();
    $('#inFocal').value = p.focal; $('#inAp').value = p.ap; $('#inIso').value = p.iso;
    $('#inShutter').value = p.sh;
    $('#inDist').value = Math.round(100 * Math.log(p.dist / 0.5) / Math.log(30));
    refreshOutputs(); dirty = true;
  });
});

/* viewport toggles */
$('#btnGrid').addEventListener('click', e => {
  state.grid = !state.grid;
  $('#gridOverlay').hidden = !state.grid;
  e.currentTarget.classList.toggle('active', state.grid);
});
$('#btnHud').addEventListener('click', e => {
  state.hud = !state.hud;
  document.querySelectorAll('.hud').forEach(h => h.style.display = state.hud ? '' : 'none');
  e.currentTarget.classList.toggle('active', state.hud);
  updateAf();
});

/* --------------------------- capture flow ----------------------------- */
const shots = [];
function capture() {
  const cap = mk(W, H);
  const g = cap.getContext('2d');
  g.drawImage(sceneCv, 0, 0);
  if (grainNow.alpha > 0.012) {          // bake the grain into the photo
    g.globalCompositeOperation = 'overlay';
    g.globalAlpha = grainNow.alpha;
    g.drawImage(grainCv, 0, 0);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
  const url = cap.toDataURL('image/jpeg', 0.9);
  shots.push({
    url,
    cap: `${Math.round(state.focal)}mm ƒ/${APS[state.ap]} · ISO ${ISOS[state.iso]} · ${SHUTTERS[state.sh].l}s · ${state.dist.toFixed(1)}m`,
  });
  if (shots.length > 12) shots.shift();
  renderShots();

  const flash = $('#captureFlash');
  flash.classList.add('on');
  requestAnimationFrame(() => requestAnimationFrame(() => flash.classList.remove('on')));
}
function renderShots() {
  const box = $('#shots');
  box.innerHTML = '';
  shots.forEach((s, i) => {
    const fig = document.createElement('figure');
    fig.className = 'shot';
    fig.innerHTML = `<img src="${s.url}" alt="captured photo ${i + 1}"/><figcaption><b>#${i + 1}</b> ${s.cap}</figcaption>`;
    fig.addEventListener('click', () => {
      $('#modalImg').src = s.url;
      $('#modalCaption').textContent = s.cap;
      $('#modal').hidden = false;
    });
    box.appendChild(fig);
  });
  $('#btnClear').hidden = shots.length === 0;
  if (shots.length) box.lastChild.scrollIntoView({ inline: 'end', block: 'nearest', behavior: 'smooth' });
}
$('#btnCapture').addEventListener('click', capture);
$('#btnClear').addEventListener('click', () => { shots.length = 0; renderShots(); });
$('#modalClose').addEventListener('click', () => $('#modal').hidden = true);
$('#modal').addEventListener('click', e => { if (e.target === e.currentTarget) $('#modal').hidden = true; });
window.addEventListener('keydown', e => {
  if (e.key.toLowerCase() === 'c' && !/input|textarea/i.test(document.activeElement.tagName)) capture();
});

/* ------------------------------ boot --------------------------------- */
buildLayers();
refreshOutputs();
bootstrapLadders();
buildIris(irisTargetR());
redrawLayers();
composite();
drawGrain();
requestAnimationFrame(tick);
setInterval(drawGrain, 90);
setInterval(drawHistogram, 180);
setInterval(updateTips, 300);
updateTips();
drawHistogram();

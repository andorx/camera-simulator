/* =====================================================================
   engine.ts — the imperative render engine, ported from the vanilla
   app.js. Owns the layered canvases, the requestAnimationFrame lerp
   loop, layer blur/composite, film grain and the histogram. React
   never drives this; it only attaches canvases and reads published
   live values (see live.ts).
   ===================================================================== */

import { THEMES } from '../scenes/scene';
import { ALL_BACKGROUNDS, SUBJECT_DEFS } from '../scenes/registry';
import { subjectGeometry } from '../scenes/scenes';
import {
  W, H, APS, ISOS, SHUTTERS, GRAIN_ALPHA,
  fovScale, blurPx, brightness, shakePx,
} from '../optics';
import { useSim } from '../store';
import { useLive } from '../live';
import { deriveFrame, deriveTips, type Cur } from './derive';
import type { LayerDef, Shot } from '../types';

const mk = (w: number, h: number) =>
  Object.assign(document.createElement('canvas'), { width: w, height: h });

/* -------- grain tile (quasi-gaussian luma + chroma noise) ---------- */
const grainTile = mk(256, 256);
(function buildGrainTile() {
  const g = grainTile.getContext('2d')!;
  const img = g.createImageData(256, 256);
  let a = 1234;
  const R = () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
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

interface RuntimeLayer extends LayerDef {
  cv: HTMLCanvasElement;
  drawn: { s: number; cx: number; cy: number; d: number; theme?: string; paint?: LayerDef['paint'] };
}

export class CameraEngine {
  private sceneCv: HTMLCanvasElement | null = null;
  private grainCv: HTMLCanvasElement | null = null;
  private histoCv: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private gctx: CanvasRenderingContext2D | null = null;

  private tcv = mk(400, 267); private tctx = this.tcv.getContext('2d')!;  // blur downsample buffer
  private scv = mk(W, H);     private sctx = this.scv.getContext('2d')!;  // scratch copy
  private hcv = mk(100, 67);  private hctx = this.hcv.getContext('2d', { willReadFrequently: true })!;

  private layers: RuntimeLayer[] = [];
  /* animated current values (lerped toward targets from the store) */
  private cur: Cur = { f: 50, N: 5.6, iso: 100, t: 1 / 250, d: 3, s: 1, cx: 800, cy: 380 };
  private grainNow = { alpha: 0 };

  private lastT = performance.now();
  private dirty = true;
  private slowFrames = 0;
  private lastBackground = '';
  private lastSubject = '';
  private lastTheme = '';

  private running = false;
  private raf = 0;
  private timers: ReturnType<typeof setInterval>[] = [];

  /* ------------------------------ attach ---------------------------- */

  attach(sceneCv: HTMLCanvasElement, grainCv: HTMLCanvasElement) {
    this.sceneCv = sceneCv;
    this.grainCv = grainCv;
    this.ctx = sceneCv.getContext('2d');
    this.gctx = grainCv.getContext('2d');
    this.cur = { f: 50, N: 5.6, iso: 100, t: 1 / 250, d: 3, s: 1, cx: 800, cy: 380 };
    this.buildLayers();
    this.dirty = true;
  }

  attachHistogram(cv: HTMLCanvasElement) {
    this.histoCv = cv;
    this.drawHistogram();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastT = performance.now();
    this.raf = requestAnimationFrame(this.tick);
    // cadences identical to the vanilla boot block
    this.timers.push(setInterval(this.drawGrain, 90));
    this.timers.push(setInterval(this.drawHistogram, 180));
    this.timers.push(setInterval(this.publishTips, 300));
    this.drawGrain();
    this.drawHistogram();
    this.publishTips();
  }

  dispose() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    for (const t of this.timers) clearInterval(t);
    this.timers = [];
  }

  /* ------------------------------ layers ----------------------------- */

  private buildLayers() {
    const S = useSim.getState();
    this.lastBackground = S.background;
    this.lastSubject = S.subject;
    this.lastTheme = S.theme;
    const defs: LayerDef[] = [
      ...ALL_BACKGROUNDS[S.background].layers,
      { key: 'subject', dist: 'focus', paint: SUBJECT_DEFS[S.subject].paint },
    ];
    this.layers = defs.map(def => ({ ...def, cv: mk(W, H), drawn: { s: 0, cx: 0, cy: 0, d: 0 } }));
  }

  private redrawLayers() {
    const S = useSim.getState();
    const T = THEMES[S.theme];
    const { s, cx, cy, d } = this.cur;
    for (const L of this.layers) {
      const needs =
        Math.abs(s / L.drawn.s - 1) > 0.002 ||
        Math.abs(cx - L.drawn.cx) * s > 0.8 ||
        Math.abs(cy - L.drawn.cy) * s > 0.8 ||
        (L.key === 'subject' && Math.abs(d - L.drawn.d) > d * 0.004) ||
        L.drawn.theme !== S.theme ||
        L.drawn.paint !== L.paint;
      if (!needs) continue;
      const g = L.cv.getContext('2d')!;
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, W, H);
      g.setTransform(s, 0, 0, s, 800 - cx * s, 533 - cy * s);
      L.paint(g, T, d);
      L.drawn = { s, cx, cy, d, theme: S.theme, paint: L.paint };
    }
  }

  private drawWithBlur(g: CanvasRenderingContext2D, cv: HTMLCanvasElement, dx: number, dy: number, dw: number, dh: number, bpx: number) {
    bpx = Math.min(bpx, 240);
    if (bpx < 0.45) { g.drawImage(cv, dx, dy, dw, dh); return; }
    if (bpx <= 10) {
      g.filter = `blur(${bpx.toFixed(2)}px)`;
      g.drawImage(cv, dx, dy, dw, dh);
      g.filter = 'none';
      return;
    }
    this.tctx.clearRect(0, 0, this.tcv.width, this.tcv.height);
    this.tctx.filter = `blur(${(bpx / 4).toFixed(2)}px)`;
    this.tctx.drawImage(cv, 0, 0, this.tcv.width, this.tcv.height);
    this.tctx.filter = 'none';
    g.drawImage(this.tcv, dx, dy, dw, dh);
  }

  /* --------------------------- composite ----------------------------- */

  private composite() {
    const ctx = this.ctx!;
    const S = useSim.getState();
    const T = THEMES[S.theme];
    const { f, N, d, s, cx, cy } = this.cur;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
    ctx.clearRect(0, 0, W, H);

    let maxBlur = 0;
    const order = [...this.layers].sort((a, b) => {
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
      this.drawWithBlur(ctx, L.cv, dx, dy, W * k, H * k, bpx);
    }

    const copyToScratch = () => {
      this.sctx.setTransform(1, 0, 0, 1, 0, 0);
      this.sctx.clearRect(0, 0, W, H);
      this.sctx.drawImage(this.sceneCv!, 0, 0);
    };

    // pull the frame in a hair so blurred edges never show transparency
    if (maxBlur > 6) {
      copyToScratch();
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(this.scv, -W * 0.008, -H * 0.008, W * 1.016, H * 1.016);
    }

    // camera shake smear
    const sh = shakePx(this.cur.t, f);
    if (sh >= 0.8) {
      copyToScratch();
      const ang = ((f * 37 + d * 11 + N) % 360) * Math.PI / 180;
      const ux = Math.cos(ang), uy = Math.sin(ang);
      ctx.clearRect(0, 0, W, H);
      const passes: [number, number][] = [[0, .5], [.42, .25], [.8, .14], [1.25, .11]];
      for (const [off, a] of passes) {
        ctx.globalAlpha = a;
        ctx.drawImage(this.scv, -ux * sh * off, -uy * sh * off);
      }
      ctx.globalAlpha = 1;
    }

    // diffraction softening at tiny apertures
    if (N >= 16) {
      const soft = Math.min(2.2, 0.22 * (N - 14));
      copyToScratch();
      ctx.filter = `blur(${soft.toFixed(2)}px)`;
      ctx.drawImage(this.scv, 0, 0);
      ctx.filter = 'none';
    }

    // film grade for the scene
    copyToScratch();
    ctx.filter = `saturate(${T.sat}) contrast(${T.contrast})`;
    ctx.drawImage(this.scv, 0, 0);
    ctx.filter = 'none';

    // exposure
    const B = brightness(this.cur.iso, this.cur.t, N, T.E);
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
        ctx.drawImage(this.scv, 0, 0);
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

    // publish overlays (vanilla called updateOverlays(B) here)
    useLive.getState().setFrame(deriveFrame(this.cur, S));
  }

  /* ------------------------------ grain ------------------------------ */

  private grainAlpha() {
    const stops = Math.log2(this.cur.iso / 100);
    const base = GRAIN_ALPHA[Math.max(0, Math.min(8, Math.round(stops)))];
    const T = THEMES[useSim.getState().theme];
    const B = Math.max(0.07, brightness(this.cur.iso, this.cur.t, this.cur.N, T.E));
    return Math.min(0.85, base * Math.min(2.2, 1 / Math.sqrt(B)));
  }

  private drawGrain = () => {
    const gctx = this.gctx;
    if (!gctx) return;
    const a = this.grainAlpha();
    this.grainNow.alpha = a;
    gctx.setTransform(1, 0, 0, 1, 0, 0);
    gctx.clearRect(0, 0, W, H);
    if (a < 0.012) return;
    const pat = gctx.createPattern(grainTile, 'repeat');
    if (!pat) return;
    const stops = Math.log2(this.cur.iso / 100);
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
  };

  /* ---------------------------- histogram ---------------------------- */

  private drawHistogram = () => {
    const histoCv = this.histoCv;
    if (!histoCv || !this.sceneCv) return;
    const hg = histoCv.getContext('2d')!;
    this.hctx.drawImage(this.sceneCv, 0, 0, 100, 67);
    const { data } = this.hctx.getImageData(0, 0, 100, 67);
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
  };

  /* ------------------------------ tips ------------------------------- */

  private publishTips = () => {
    if (!this.running) return;
    useLive.getState().setTips(deriveTips(this.cur, useSim.getState()));
  };

  /* --------------------------- render loop --------------------------- */

  private targetCenter() {
    const S = useSim.getState();
    const { h, baseY } = subjectGeometry(SUBJECT_DEFS[S.subject].h, this.cur.d);
    return { cx: 800, cy: Math.max(150, Math.min(860, baseY - h * 0.7)) };
  }

  private tick = (now: number) => {
    if (!this.running) return;
    const S = useSim.getState();

    // watch scene changes that need layer rebuilds / forced redraws
    if (S.background !== this.lastBackground) {
      this.buildLayers();
      this.dirty = true;
    } else if (S.subject !== this.lastSubject) {
      this.lastSubject = S.subject;
      const lay = this.layers.find(l => l.key === 'subject');
      if (lay) lay.paint = SUBJECT_DEFS[S.subject].paint;
      this.dirty = true;
    } else if (S.theme !== this.lastTheme) {
      this.lastTheme = S.theme;
      this.dirty = true;
    }

    const dt = Math.min(0.05, (now - this.lastT) / 1000);
    this.lastT = now;
    const k = 1 - Math.exp(-dt * 8);

    const prev = { ...this.cur };
    const cur = this.cur;
    cur.f += (S.focal - cur.f) * k;
    cur.N += (APS[S.ap] - cur.N) * k;
    cur.iso *= Math.pow(ISOS[S.iso] / cur.iso, k);
    cur.t *= Math.pow(SHUTTERS[S.sh].s / cur.t, k);
    cur.d *= Math.pow(S.dist / cur.d, k);
    cur.s = fovScale(cur.f);
    const tc = this.targetCenter();
    cur.cx += (tc.cx - cur.cx) * k;
    cur.cy += (tc.cy - cur.cy) * k;

    const moved =
      Math.abs(cur.f - prev.f) > 0.01 || Math.abs(cur.N - prev.N) > 0.004 ||
      Math.abs(cur.iso - prev.iso) > 0.5 || Math.abs(cur.t - prev.t) / cur.t > 0.002 ||
      Math.abs(cur.d - prev.d) / cur.d > 0.0015 ||
      Math.abs(cur.cx - prev.cx) > 0.05 || Math.abs(cur.cy - prev.cy) > 0.05;

    if ((moved || this.dirty) && this.slowFrames < 2) {
      const t0 = performance.now();
      this.redrawLayers();
      this.composite();
      const cost = performance.now() - t0;
      this.slowFrames = cost > 26 ? 2 : 0;
      this.dirty = false;
    } else if (this.slowFrames > 0) this.slowFrames--;

    requestAnimationFrame(this.tick);
  };

  /* --------------------------- capture flow -------------------------- */

  capture(): Shot | null {
    if (!this.sceneCv || !this.grainCv) return null;
    const S = useSim.getState();
    const cap = mk(W, H);
    const g = cap.getContext('2d')!;
    g.drawImage(this.sceneCv, 0, 0);
    if (this.grainNow.alpha > 0.012) {          // bake the grain into the photo
      g.globalCompositeOperation = 'overlay';
      g.globalAlpha = this.grainNow.alpha;
      g.drawImage(this.grainCv, 0, 0);
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    }
    const url = cap.toDataURL('image/jpeg', 0.9);
    return {
      url,
      cap: `${Math.round(S.focal)}mm ƒ/${APS[S.ap]} · ISO ${ISOS[S.iso]} · ${SHUTTERS[S.sh].l}s · ${S.dist.toFixed(1)}m`,
    };
  }
}

/** One engine per page — components attach their canvases to it. */
export const engine = new CameraEngine();

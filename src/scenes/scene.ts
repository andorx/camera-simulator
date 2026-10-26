/* =====================================================================
   scene.ts — procedural layered scene for the camera simulator.
   Design space: 1600 × 1067 px == what a 35 mm lens sees (full-frame).
   Painters receive a ctx already transformed into design coordinates,
   and must cover the overscan region x ∈ [-800, 2800], y ∈ [-700, 1900]
   so wider lenses (24 mm) never reveal an edge.
   ===================================================================== */

import type { Theme, ThemeKey } from '../types';

export const DW = 1600, DH = 1067;
export const HORIZON = 460;
export const CAM_H = 1.15;             // camera height above ground, metres
export const PX_PER_DEG = (DH / 2) / (Math.atan(24 / 70) * 180 / Math.PI); // 35 mm vertical half-FOV

export const deg = (r: number) => (r * 180) / Math.PI;

/** Seeded RNG (mulberry32) so shapes never jitter between redraws. */
export function sr(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Screen geometry for a subject `hM` metres tall at distance `d` m. */
export function subjectGeometry(hM: number, d: number) {
  const pxPerM = 920 / (d + 1.8);
  const h = hM * pxPerM;
  const baseY = 665 + CAM_H * pxPerM;
  return { h, baseY };
}

/** Where a 1.75 m person at distance `d` (metres) sits in design space. */
export function personGeom(d: number) {
  return subjectGeometry(1.75, d);
}

/* ------------------------------ themes ------------------------------ */
export const THEMES: Record<ThemeKey, Theme> = {
  golden: {
    key: 'golden',
    E: 8000, sat: 1.05, contrast: 1.0, vigBoost: 0,
    sky: ['#5b9fd8', '#a9cfe8', '#fde3bb'], sun: true,
    cloud: 'puffy', cloudTop: '#ffffff', cloudBot: '#ffd9ae', birds: true,
    mtnBack: '#95a9c9', mtnFront: '#6d89ad', snow: 'rgba(255,230,238,.85)',
    haze: 'rgba(255,222,175,.30)',
    lakeTop: '#84b7cb', lakeBot: '#4c86a4', glitter: 'rgba(255,238,170,.95)', shore: '#d9c491',
    meadowFarA: '#a6c46e', meadowFarB: '#7fa753',
    meadowNearA: '#77a752', meadowNearB: '#517c3b',
    flowers: true, pathA: '#d3bd8c',
    window: '#ffd47e', windowGlow: 'rgba(255,190,90,.4)', smoke: true,
    foliage: ['#7fb069', '#a1c181', '#5d8f4f'], pine: '#37533f',
    grass: ['#4c7c36', '#5f9440', '#71a54c'],
    lamp: false, stars: false, moon: false,
  },
  overcast: {
    key: 'overcast',
    E: 1600, sat: 0.82, contrast: 0.98, vigBoost: 0.02,
    sky: ['#aebfc9', '#ccd6da', '#e6e4d7'], sun: false,
    cloud: 'band', cloudTop: '#e9eef1', cloudBot: '#c2cbd2', birds: false,
    mtnBack: '#a4b4be', mtnFront: '#8598a6', snow: 'rgba(240,245,250,.8)',
    haze: 'rgba(228,233,236,.38)',
    lakeTop: '#9db3bb', lakeBot: '#74909c', glitter: null, shore: '#cfc6ab',
    meadowFarA: '#9db06f', meadowFarB: '#7e9455',
    meadowNearA: '#759a52', meadowNearB: '#557a3f',
    flowers: true, pathA: '#c9bd9c',
    window: '#43525f', windowGlow: null, smoke: false,
    foliage: ['#7da86b', '#94b57e', '#628a52'], pine: '#3f5c48',
    grass: ['#547d3e', '#679146', '#4a703a'],
    lamp: false, stars: false, moon: false,
  },
  night: {
    key: 'night',
    E: 2.2, sat: 0.74, contrast: 0.96, vigBoost: 0.05,
    sky: ['#0a1024', '#131c36', '#28324e'], sun: false,
    cloud: 'none', cloudTop: '#000', cloudBot: '#000', birds: false,
    mtnBack: '#232e44', mtnFront: '#151e32', snow: 'rgba(205,218,240,.30)',
    haze: 'rgba(14,20,38,.5)',
    lakeTop: '#233246', lakeBot: '#121d2d', glitter: 'rgba(215,228,250,.75)', shore: '#3a3f52',
    meadowFarA: '#2c4630', meadowFarB: '#203626',
    meadowNearA: '#233d29', meadowNearB: '#172b1d',
    flowers: false, pathA: '#5a5545',
    window: '#ffcf6e', windowGlow: 'rgba(255,180,80,.55)', smoke: false,
    foliage: ['#22402e', '#2d4f38', '#1b3325'], pine: '#152820',
    grass: ['#1e3a26', '#27462e', '#152a1c'],
    lamp: true, stars: true, moon: true,
  },
};

/* --------------------------- tiny helpers --------------------------- */
export function ell(g: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, fill: string) {
  g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  g.fillStyle = fill; g.fill();
}
export function poly(g: CanvasRenderingContext2D, pts: [number, number][], fill: string) {
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.closePath(); g.fillStyle = fill; g.fill();
}
export function softBlob(g: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string, alpha: number) {
  const grd = g.createRadialGradient(x, y, 0, x, y, r);
  grd.addColorStop(0, fill); grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalAlpha = alpha; g.fillStyle = grd;
  g.fillRect(x - r, y - r, r * 2, r * 2);
  g.globalAlpha = 1;
}

/* ===================== shared: sky, sun/moon, clouds ================ */
export function paintSky(g: CanvasRenderingContext2D, T: Theme) {
  const r = sr(11);
  const grd = g.createLinearGradient(0, -700, 0, HORIZON);
  grd.addColorStop(0, T.sky[0]); grd.addColorStop(0.62, T.sky[1]); grd.addColorStop(1, T.sky[2]);
  g.fillStyle = grd; g.fillRect(-800, -700, 3600, HORIZON + 700);

  // subtle horizon atmospheric band
  if (T.key === 'golden') {
    const hg = g.createLinearGradient(0, HORIZON - 180, 0, HORIZON + 20);
    hg.addColorStop(0, 'rgba(255,200,130,0)');
    hg.addColorStop(1, 'rgba(255,185,110,.32)');
    g.fillStyle = hg; g.fillRect(-800, HORIZON - 180, 3600, 200);
  }

  // stars & milky way glow
  if (T.stars) {
    // faint milky way diagonal band
    g.save();
    g.translate(900, 120); g.rotate(-0.32);
    const mw = g.createLinearGradient(0, -180, 0, 180);
    mw.addColorStop(0, 'rgba(140,170,255,0)');
    mw.addColorStop(0.5, 'rgba(160,188,255,.07)');
    mw.addColorStop(1, 'rgba(140,170,255,0)');
    g.fillStyle = mw; g.fillRect(-1800, -180, 3600, 360);
    g.restore();

    const starCols = ['#dfe8ff', '#fff4e0', '#cad8ff', '#ffffff'];
    for (let i = 0; i < 240; i++) {
      const x = -800 + r() * 3600, y = -700 + r() * (HORIZON + 500), a = 0.18 + r() * 0.78;
      const s = 0.6 + r() * 1.8;
      g.globalAlpha = Math.max(0, a * (1 - y / (HORIZON + 600)));
      g.fillStyle = starCols[(i * 7) % 4];
      g.beginPath(); g.arc(x, y, s * 0.65, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
    // bright 4-point sparkle stars
    for (const [sx, sy, sc] of [[420, 40, 1.1], [1470, 90, 1.0], [1000, -260, 1.2], [180, 170, 0.8], [760, 115, 0.85], [1680, 210, 0.9]]) {
      softBlob(g, sx, sy, 10 * sc, 'rgba(210,228,255,.35)', 1);
      g.strokeStyle = 'rgba(235,242,255,.85)'; g.lineWidth = 1.3 * sc;
      g.beginPath();
      g.moveTo(sx - 8 * sc, sy); g.lineTo(sx + 8 * sc, sy);
      g.moveTo(sx, sy - 8 * sc); g.lineTo(sx, sy + 8 * sc);
      g.stroke();
      ell(g, sx, sy, 1.8 * sc, 1.8 * sc, '#ffffff');
    }
  }

  // sun / moon
  if (T.sun) {
    softBlob(g, 1180, 268, 340, 'rgba(255,195,120,.35)', 0.95);
    softBlob(g, 1180, 268, 180, 'rgba(255,222,160,.55)', 0.95);
    softBlob(g, 1180, 268, 82, 'rgba(255,244,210,.9)', 1);
    ell(g, 1180, 268, 36, 36, '#fffdf2');
    ell(g, 1180, 268, 31, 31, '#ffffff');
  }
  if (T.moon) {
    softBlob(g, 1180, 268, 160, 'rgba(180,205,255,.14)', 1);
    softBlob(g, 1180, 268, 70, 'rgba(210,225,255,.22)', 1);
    // subtle earthshine disc
    ell(g, 1180, 268, 28, 28, 'rgba(160,180,220,.12)');
    // illuminated crescent via off-center clip
    g.save();
    g.beginPath(); g.arc(1180, 268, 28, 0, Math.PI * 2); g.clip();
    ell(g, 1180, 268, 28, 28, '#eef2fa');
    // subtle lunar maria craters
    ell(g, 1168, 262, 6, 8, 'rgba(165,180,210,.38)');
    ell(g, 1173, 277, 4.5, 4.5, 'rgba(165,180,210,.45)');
    ell(g, 1163, 274, 3, 3.2, 'rgba(165,180,210,.35)');
    ell(g, 1193, 259, 25, 25, '#111a33'); // crescent shadow bite
    g.restore();
  }

  // clouds
  if (T.cloud === 'puffy') {
    const paintCumulus = (cx: number, cy: number, sc: number) => {
      g.save(); g.translate(cx, cy); g.scale(sc, sc);
      // warm ambient shadow base
      ell(g, 6, 20, 96, 16, 'rgba(180,130,110,.22)');
      ell(g, 0, 15, 88, 18, T.cloudBot);
      ell(g, -46, 14, 48, 15, T.cloudBot);
      ell(g, 48, 14, 46, 14, T.cloudBot);
      // billowy upper domes
      const domes: [number, number, number, number][] = [
        [-58, 6, 36, 24], [-26, -6, 46, 34], [14, -12, 52, 38],
        [52, -2, 40, 28], [76, 9, 28, 18], [-78, 12, 26, 16],
      ];
      for (const [dx, dy, rx, ry] of domes) {
        ell(g, dx, dy, rx, ry, T.cloudTop);
      }
      // sunlit top rim highlight
      for (const [dx, dy, rx, ry] of domes) {
        ell(g, dx + 3, dy - 3, rx * 0.82, ry * 0.78, '#ffffff');
      }
      // soft lower blend
      ell(g, 4, 12, 76, 14, T.cloudBot);
      ell(g, 2, 7, 70, 14, T.cloudTop);
      g.restore();
    };
    const puffs: [number, number, number][] = [
      [-340, 168, 0.95], [240, 148, 1.05], [640, 102, 0.88],
      [1020, 176, 0.78], [1460, 116, 1.12], [1940, 158, 0.92],
      [-40, 232, 0.68], [2360, 135, 0.85],
    ];
    for (const [cx, cy, sc] of puffs) paintCumulus(cx, cy, sc);
  } else if (T.cloud === 'band') {
    for (const [by, bh, a] of [[55, 72, .55], [175, 92, .7], [315, 78, .52]]) {
      const cg = g.createLinearGradient(0, by - bh / 2, 0, by + bh / 2);
      cg.addColorStop(0, 'rgba(233,238,241,0)');
      cg.addColorStop(0.45, `rgba(236,241,245,${a})`);
      cg.addColorStop(0.75, `rgba(186,198,207,${a})`);
      cg.addColorStop(1, 'rgba(233,238,241,0)');
      g.fillStyle = cg; g.fillRect(-800, by - bh / 2, 3600, bh);
    }
    // sculpted overcast cloud bank rollers
    for (let i = 0; i < 18; i++) {
      const cx = -700 + i * 210 + (r() - 0.5) * 60;
      const cy = 90 + (i % 3) * 95 + (r() - 0.5) * 20;
      ell(g, cx, cy + 12, 130 + r() * 50, 24, 'rgba(178,190,200,.45)');
      ell(g, cx, cy, 120 + r() * 40, 26, 'rgba(230,236,240,.55)');
    }
  }

  // birds
  if (T.birds) {
    g.strokeStyle = 'rgba(48,56,74,.78)'; g.lineCap = 'round';
    const flock: [number, number, number, number][] = [
      [380, 236, 1.05, -0.08], [430, 222, 0.85, 0.05], [468, 248, 0.7, -0.04],
      [345, 252, 0.75, 0.08], [498, 230, 0.6, 0.02], [525, 244, 0.5, -0.06],
    ];
    for (const [bx, by, s, tilt] of flock) {
      g.save(); g.translate(bx, by); g.rotate(tilt);
      g.lineWidth = 2.2 * s;
      g.beginPath();
      g.moveTo(-12 * s, 2 * s);
      g.quadraticCurveTo(-6 * s, -8 * s, 0, -1 * s);
      g.quadraticCurveTo(6 * s, -8 * s, 12 * s, 2 * s);
      g.stroke();
      g.restore();
    }
  }
}

/* ===================== LAYER: backdrop (infinity) ==================== */
/* Alpine mountains with 3D ridge facets, snowfields, treeline + haze.   */
export function paintBackdrop(g: CanvasRenderingContext2D, T: Theme) {
  paintSky(g, T);
  const r = sr(19);

  // --- Far alpine range ---
  const backPeaks: [number, number][] = [
    [-800, 460], [-560, 318], [-320, 272], [-190, 315], [-60, 236],
    [110, 304], [270, 268], [410, 312], [560, 244], [730, 308],
    [890, 278], [1040, 318], [1200, 254], [1370, 314], [1540, 276],
    [1720, 322], [1920, 264], [2120, 326], [2340, 284], [2580, 330],
    [2820, 290], [3300, 460],
  ];
  poly(g, backPeaks, T.mtnBack);

  // 3D ridge shading & snow caps on far peaks
  for (let i = 1; i < backPeaks.length - 1; i++) {
    const [px, py] = backPeaks[i];
    const [lx, ly] = backPeaks[i - 1];
    const [rx, ry] = backPeaks[i + 1];
    if (py < ly && py < ry) {
      const ridgeX = px + (r() - 0.5) * 28;
      poly(g, [[lx, ly], [px, py], [ridgeX, 460], [lx, 460]], 'rgba(15,25,45,.16)');
      poly(g, [[px, py], [rx, ry], [rx, 460], [ridgeX, 460]], 'rgba(255,245,230,.08)');

      // Detailed multi-finger snow cap
      const swL = (px - lx) * 0.42, swR = (rx - px) * 0.42;
      const shL = (ly - py) * 0.42, shR = (ry - py) * 0.42;
      poly(g, [
        [px, py],
        [px + swR, py + shR],
        [px + swR * 0.62, py + shR * 0.78],
        [px + swR * 0.35, py + shR * 1.18],
        [px + swR * 0.08, py + shR * 0.85],
        [px - swL * 0.22, py + shL * 1.22],
        [px - swL * 0.55, py + shL * 0.82],
        [px - swL, py + shL],
      ], T.snow);
      // Shaded snow on left slope
      poly(g, [
        [px, py],
        [px + swR * 0.08, py + shR * 0.85],
        [px - swL * 0.22, py + shL * 1.22],
        [px - swL * 0.55, py + shL * 0.82],
        [px - swL, py + shL],
      ], 'rgba(130,150,185,.25)');
    }
  }

  // mid-layer mist between far and front ranges
  const mHz = g.createLinearGradient(0, 290, 0, 440);
  mHz.addColorStop(0, 'rgba(0,0,0,0)'); mHz.addColorStop(1, T.haze);
  g.fillStyle = mHz; g.fillRect(-800, 290, 3600, 150);

  // --- Front mountain range ---
  const frontPeaks: [number, number][] = [
    [-800, 460], [-480, 366], [-240, 336], [-60, 378], [90, 322],
    [260, 368], [440, 344], [610, 382], [760, 332], [940, 376],
    [1100, 348], [1280, 384], [1440, 338], [1640, 382], [1840, 346],
    [2060, 388], [2280, 350], [2540, 396], [3300, 460],
  ];
  poly(g, frontPeaks, T.mtnFront);

  // 3D ridge facets & snow gullies on front range
  for (let i = 1; i < frontPeaks.length - 1; i++) {
    const [px, py] = frontPeaks[i];
    const [lx, ly] = frontPeaks[i - 1];
    const [rx, ry] = frontPeaks[i + 1];
    if (py < ly && py < ry) {
      const ridgeX = px + (r() - 0.5) * 24;
      poly(g, [[lx, ly], [px, py], [ridgeX, 460], [lx, 460]], 'rgba(10,18,35,.18)');
      poly(g, [[px, py], [rx, ry], [rx, 460], [ridgeX, 460]], 'rgba(255,240,215,.07)');
      const swL = (px - lx) * 0.25, swR = (rx - px) * 0.25;
      const shL = (ly - py) * 0.25, shR = (ry - py) * 0.25;
      poly(g, [
        [px, py], [px + swR, py + shR],
        [px + swR * 0.3, py + shR * 1.15],
        [px - swL * 0.3, py + shL * 0.9],
        [px - swL, py + shL],
      ], T.snow);
    }
  }

  // distant conifer treeline along the mountain base above the lake
  g.fillStyle = T.pine;
  g.globalAlpha = 0.65;
  g.beginPath();
  g.moveTo(-800, HORIZON + 2);
  for (let x = -800; x <= 2800; x += 14) {
    const th = 8 + r() * 18 + Math.sin(x * 0.012) * 6;
    g.lineTo(x + 7, HORIZON - th);
    g.lineTo(x + 14, HORIZON - 2 - r() * 5);
  }
  g.lineTo(2800, HORIZON + 2);
  g.closePath();
  g.fill();
  g.globalAlpha = 1;

  // aerial haze at the base of the mountains
  const hz = g.createLinearGradient(0, 340, 0, HORIZON);
  hz.addColorStop(0, 'rgba(0,0,0,0)'); hz.addColorStop(1, T.haze);
  g.fillStyle = hz; g.fillRect(-800, 340, 3600, HORIZON - 340);
}

/* ======================== LAYER: lake (130 m) ======================= */
export function paintLake(g: CanvasRenderingContext2D, T: Theme) {
  const r = sr(33);
  const grd = g.createLinearGradient(0, HORIZON, 0, 562);
  grd.addColorStop(0, T.lakeTop); grd.addColorStop(0.55, T.lakeBot); grd.addColorStop(1, T.lakeBot);
  g.fillStyle = grd; g.fillRect(-800, HORIZON, 3600, 104);

  // subtle vertical mountain reflection bands in the calm lake
  g.save();
  g.globalAlpha = 0.22;
  for (const [rx, rw] of [[-240, 260], [90, 280], [760, 300], [1440, 280], [1840, 260]]) {
    const rg = g.createLinearGradient(0, HORIZON, 0, HORIZON + 68);
    rg.addColorStop(0, T.mtnFront);
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg;
    g.fillRect(rx - rw / 2, HORIZON, rw, 68);
  }
  g.restore();

  // distant far-shoreline reflection line
  g.fillStyle = 'rgba(255,255,255,.22)';
  g.fillRect(-800, HORIZON, 3600, 1.8);

  // sun / moon glitter path
  if (T.glitter) {
    for (let i = 0; i < 65; i++) {
      const y = HORIZON + 2 + r() * 94;
      const spread = (y - HORIZON) * 1.15 + 10;
      const x = 1180 + (r() - 0.5) * spread * 2;
      g.globalAlpha = 0.22 + r() * 0.65;
      g.fillStyle = T.glitter;
      g.beginPath();
      g.roundRect(x, y, 5 + r() * 28, 1.4 + r() * 1.8, 1);
      g.fill();
    }
    g.globalAlpha = 1;
  }

  // delicate water ripples
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1.3;
  for (let i = 0; i < 38; i++) {
    const y = HORIZON + 6 + r() * 88, x = -800 + r() * 3600, w = 28 + r() * 85;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y + 2.5, x + w, y); g.stroke();
  }

  // pair of swimming ducks/swans on the right
  for (const [dx, dy, sc] of [[960, 526, 0.9], [992, 531, 0.72]]) {
    g.save(); g.translate(dx, dy); g.scale(sc, sc);
    // wake ripple
    g.strokeStyle = 'rgba(255,255,255,.26)'; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(-18, 2); g.lineTo(6, 0); g.lineTo(-16, 5); g.stroke();
    // body & neck
    ell(g, -2, 0, 8, 4.2, T.key === 'night' ? '#2c384a' : '#f4f1ea');
    poly(g, [[-10, 0], [-6, -3], [-6, 2]], T.key === 'night' ? '#1e2736' : '#dcd6c8');
    g.strokeStyle = T.key === 'night' ? '#2c384a' : '#f4f1ea'; g.lineWidth = 2.6; g.lineCap = 'round';
    g.beginPath(); g.moveTo(4, -1); g.quadraticCurveTo(7, -6, 5, -10); g.stroke();
    ell(g, 6, -10, 2.6, 2.2, T.key === 'night' ? '#2c384a' : '#f4f1ea');
    poly(g, [[8, -10.8], [11.5, -9.8], [8, -9]], '#e08a3c');
    g.restore();
  }

  // rustic wooden pier & moored rowboat on left-center
  g.save(); g.translate(470, 528);
  // pier pilings & water reflections
  const pierPosts = [-72, -38, -4, 30];
  for (const px of pierPosts) {
    g.fillStyle = 'rgba(20,24,30,.28)';
    g.fillRect(px - 2.5, 4, 5, 16);
    g.fillStyle = '#4a3525';
    g.fillRect(px - 3, -18, 6, 24);
    g.fillStyle = 'rgba(255,255,255,.12)';
    g.fillRect(px - 3, -18, 2, 24);
  }
  // pier deck planks
  g.fillStyle = '#6e4f36';
  g.fillRect(-82, -14, 120, 5);
  g.fillStyle = '#876346';
  for (let px = -80; px < 36; px += 8) {
    g.fillRect(px, -16, 6.5, 3);
  }
  // lantern post at end of pier
  g.fillStyle = '#3b2a1d';
  g.fillRect(28, -42, 4, 28);
  g.fillRect(28, -42, 11, 3);
  if (T.stars || T.key === 'golden') {
    const lGlow = T.stars ? 'rgba(255,190,85,.65)' : 'rgba(255,215,130,.35)';
    softBlob(g, 37, -34, T.stars ? 38 : 18, lGlow, 0.9);
    if (T.stars) softBlob(g, 37, 14, 24, 'rgba(255,185,75,.35)', 0.7);
  }
  ell(g, 37, -35, 3.5, 4.5, T.stars ? '#ffe29a' : '#ffd88a');

  // detailed wooden rowboat tied to pier
  g.save(); g.translate(68, 4);
  ell(g, 0, 7, 32, 5, 'rgba(15,22,32,.32)');
  g.fillStyle = '#6b3e26';
  g.beginPath();
  g.moveTo(-32, -3);
  g.quadraticCurveTo(0, 13, 32, -3);
  g.lineTo(27, 5);
  g.quadraticCurveTo(0, 15, -27, 5);
  g.closePath(); g.fill();
  g.strokeStyle = '#e8dfd1'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(-30, -2); g.quadraticCurveTo(0, 9, 30, -2); g.stroke();
  g.fillStyle = '#4a2a18';
  g.beginPath(); g.ellipse(0, -2, 26, 3.5, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#8c583a';
  g.fillRect(-12, -4.5, 5, 5);
  g.fillRect(6, -4.5, 5, 5);
  g.strokeStyle = '#c49a6c'; g.lineWidth = 2.2;
  g.beginPath(); g.moveTo(-8, -2); g.lineTo(18, 9); g.stroke();
  poly(g, [[16, 7], [25, 11], [23, 13.5], [15, 9.5]], '#b08455');
  g.strokeStyle = 'rgba(210,195,165,.6)'; g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(-30, -2); g.quadraticCurveTo(-36, 4, -38, -12); g.stroke();
  g.restore();
  g.restore();

  // natural curved shoreline with pebbles & reeds
  g.fillStyle = T.shore;
  g.beginPath();
  g.moveTo(-800, 554);
  for (let x = -800; x <= 2800; x += 160) {
    g.quadraticCurveTo(x + 80, 550 + Math.sin(x * 0.008) * 5, x + 160, 555);
  }
  g.lineTo(2800, 568); g.lineTo(-800, 568); g.closePath();
  g.fill();

  g.fillStyle = 'rgba(0,0,0,.12)';
  g.fillRect(-800, 552, 3600, 2.5);
  for (let i = 0; i < 65; i++) {
    const px = -700 + r() * 3400, py = 554 + r() * 9;
    ell(g, px, py, 3 + r() * 5, 1.5 + r() * 2, i % 2 ? 'rgba(90,85,78,.45)' : 'rgba(220,215,205,.35)');
  }

  // lakeside cattail / reed clusters
  const reedCluster = (rx: number, ry: number, count: number) => {
    for (let i = 0; i < count; i++) {
      const ox = rx + (r() - 0.5) * 38;
      const h = 22 + r() * 26;
      const lean = (r() - 0.5) * 10;
      g.strokeStyle = T.grass[i % 3]; g.lineWidth = 1.8;
      g.beginPath(); g.moveTo(ox, ry); g.quadraticCurveTo(ox + lean * 0.5, ry - h * 0.5, ox + lean, ry - h); g.stroke();
      if (i % 3 === 0) {
        g.strokeStyle = '#5c3a21'; g.lineWidth = 4.2; g.lineCap = 'round';
        g.beginPath();
        g.moveTo(ox + lean * 0.72, ry - h * 0.72);
        g.lineTo(ox + lean * 0.9, ry - h * 0.9);
        g.stroke();
      }
    }
  };
  reedCluster(140, 560, 14);
  reedCluster(360, 558, 10);
  reedCluster(1120, 560, 16);
  reedCluster(1580, 559, 12);
}

/* ==================== LAYER: far meadow (60 m) ====================== */
export function paintMeadowFar(g: CanvasRenderingContext2D, T: Theme) {
  const r = sr(44);
  const grd = g.createLinearGradient(0, 548, 0, 728);
  grd.addColorStop(0, T.meadowFarA); grd.addColorStop(1, T.meadowFarB);

  // Rolling hills silhouette across the top of the far meadow
  g.fillStyle = grd;
  g.beginPath();
  g.moveTo(-800, 558);
  g.quadraticCurveTo(-350, 538, 80, 556);
  g.quadraticCurveTo(420, 568, 760, 550);
  g.quadraticCurveTo(1120, 534, 1520, 555);
  g.quadraticCurveTo(1950, 570, 2800, 548);
  g.lineTo(2800, 728);
  g.lineTo(-800, 728);
  g.closePath();
  g.fill();

  // Secondary rolling hill fold with sunlit crest & soft valley shadow
  const hill2 = g.createLinearGradient(0, 585, 0, 680);
  hill2.addColorStop(0, T.meadowFarA);
  hill2.addColorStop(1, T.meadowFarB);
  g.fillStyle = 'rgba(0,0,0,.07)';
  g.beginPath();
  g.moveTo(-800, 616);
  g.quadraticCurveTo(-120, 582, 540, 618);
  g.quadraticCurveTo(1060, 642, 1640, 596);
  g.quadraticCurveTo(2200, 576, 2800, 612);
  g.lineTo(2800, 645); g.lineTo(-800, 645); g.closePath(); g.fill();

  g.fillStyle = hill2;
  g.beginPath();
  g.moveTo(-800, 620);
  g.quadraticCurveTo(-120, 586, 540, 622);
  g.quadraticCurveTo(1060, 646, 1640, 600);
  g.quadraticCurveTo(2200, 580, 2800, 616);
  g.lineTo(2800, 728); g.lineTo(-800, 728); g.closePath(); g.fill();

  // Distant dry-stone wall & hedgerow bushes along the hillside
  g.strokeStyle = T.key === 'night' ? '#363b45' : '#968f83';
  g.lineWidth = 4.5;
  g.beginPath();
  g.moveTo(-450, 606);
  g.quadraticCurveTo(40, 594, 520, 620);
  g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(-450, 604);
  g.quadraticCurveTo(40, 592, 520, 618);
  g.stroke();

  // Hedgerow shrubs along the stone wall and right ridge
  for (const [hx, hy, hs] of [[-220, 598, 1], [-195, 600, 0.8], [120, 598, 1.1], [150, 601, 0.85], [460, 615, 0.95], [1560, 596, 1.15], [1595, 599, 0.9], [1820, 588, 1.05]]) {
    ell(g, hx, hy + 3, 18 * hs, 9 * hs, 'rgba(0,0,0,.15)');
    ell(g, hx, hy, 16 * hs, 11 * hs, T.foliage[2]);
    ell(g, hx - 4 * hs, hy - 3 * hs, 12 * hs, 8 * hs, T.foliage[0]);
    ell(g, hx + 5 * hs, hy - 2 * hs, 10 * hs, 7 * hs, T.foliage[1]);
  }

  // Distant grazing sheep on the right pasture
  const sheepFlock: [number, number, number, number][] = [
    [880, 588, 1.0, 1], [916, 596, 0.92, -1], [955, 584, 0.85, 1],
    [1010, 602, 0.95, -1], [845, 604, 0.8, 1],
  ];
  for (const [sx, sy, sc, dir] of sheepFlock) {
    g.save(); g.translate(sx, sy); g.scale(sc * dir, sc);
    ell(g, 0, 5.5, 7.5, 2, 'rgba(0,0,0,.2)');
    g.strokeStyle = '#2d2926'; g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(-4, 2); g.lineTo(-4, 6);
    g.moveTo(4, 2); g.lineTo(4, 6);
    g.stroke();
    const wool = T.key === 'night' ? '#8c96a8' : '#f7f3e8';
    ell(g, 0, 0, 7.5, 5, wool);
    ell(g, -3, -1.5, 4.5, 3.8, wool);
    ell(g, 3, -1, 4.5, 3.8, wool);
    ell(g, 7.2, 0.5, 2.8, 2.2, '#2d2926');
    g.restore();
  }

  // grass texture strokes
  g.lineWidth = 1.5;
  for (let i = 0; i < 280; i++) {
    const x = -800 + r() * 3600, y = 562 + r() * 160;
    g.strokeStyle = r() > 0.5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.08)';
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 4, y - 6 - r() * 5); g.stroke();
  }
  // far wildflower drifts
  if (T.flowers) {
    const cols = ['#ffffff', '#ffd166', '#ff8fa3', '#e0c3fc'];
    for (let i = 0; i < 190; i++) {
      const fx = -800 + r() * 3600, fy = 568 + r() * 150;
      const c = cols[(r() * 4) | 0];
      ell(g, fx, fy, 2.0 + r() * 1.8, 1.4 + r() * 1.2, c);
    }
  }
  // winding country path with soft grassy verge & wheel tracks
  g.save();
  g.fillStyle = 'rgba(0,0,0,.1)';
  g.beginPath();
  g.moveTo(596, 555); g.quadraticCurveTo(646, 640, 674, 726);
  g.lineTo(766, 726); g.quadraticCurveTo(734, 640, 694, 555);
  g.closePath(); g.fill();

  g.fillStyle = T.pathA; g.globalAlpha = 0.9;
  g.beginPath();
  g.moveTo(600, 555); g.quadraticCurveTo(650, 640, 680, 726);
  g.lineTo(760, 726); g.quadraticCurveTo(730, 640, 690, 555);
  g.closePath(); g.fill();

  // center grassy strip in the country lane
  g.strokeStyle = T.meadowFarA; g.lineWidth = 8; g.globalAlpha = 0.45;
  g.beginPath();
  g.moveTo(645, 558); g.quadraticCurveTo(690, 640, 720, 724);
  g.stroke();
  g.restore();
}

/* =================== LAYER: cabin & trees (30 m) ==================== */
export function paintHouseTrees(g: CanvasRenderingContext2D, T: Theme) {
  const r = sr(55);

  /* --- layered conifer pines (right-center background of grove) --- */
  const paintPineTree = (px: number, py: number, ph: number, pw: number) => {
    g.save(); g.translate(px, py);
    g.fillStyle = '#4a3525';
    g.fillRect(-pw * 0.08, -28, pw * 0.16, 30);
    const tiers = 6;
    for (let i = 0; i < tiers; i++) {
      const t = i / tiers;
      const yBot = -18 - t * (ph - 28);
      const yTop = yBot - (ph / tiers) * 1.45;
      const w = pw * (1 - t * 0.72);
      poly(g, [
        [0, yTop],
        [w, yBot + 4],
        [w * 0.45, yBot - 2],
        [0, yBot + 6],
        [-w * 0.45, yBot - 2],
        [-w, yBot + 4],
      ], T.pine);
      poly(g, [
        [0, yTop],
        [w * 0.15, yBot + 2],
        [-w * 0.42, yBot - 2],
        [-w * 0.92, yBot + 2],
      ], 'rgba(160,210,140,.11)');
      poly(g, [
        [0, yTop],
        [w, yBot + 4],
        [w * 0.45, yBot - 2],
        [0, yBot + 6],
      ], 'rgba(0,0,0,.18)');
    }
    g.restore();
  };
  paintPineTree(1045, 718, 195, 62);
  paintPineTree(1110, 716, 155, 48);
  paintPineTree(1520, 720, 210, 66);

  /* --- silver birch grove (right) --- */
  const birch = (bx: number, bh: number, lean: number) => {
    g.save(); g.translate(bx, 718); g.rotate(lean);
    ell(g, 0, 4, 42, 7, 'rgba(0,0,0,.18)');

    for (let i = 0; i < 4; i++) {
      const cx = (r() - 0.5) * 115, cy = -bh + 15 - r() * 65, cr = 38 + r() * 34;
      ell(g, cx, cy, cr, cr * 0.78, T.foliage[2]);
    }

    g.fillStyle = '#dcd6c6';
    g.beginPath();
    g.moveTo(-9, 0); g.lineTo(-4.5, -bh); g.lineTo(4.5, -bh); g.lineTo(9, 0);
    g.closePath(); g.fill();
    g.fillStyle = '#f2efe4';
    g.beginPath();
    g.moveTo(-9, 0); g.lineTo(-4.5, -bh); g.lineTo(0, -bh); g.lineTo(-1, 0);
    g.closePath(); g.fill();

    g.strokeStyle = '#dcd6c6'; g.lineWidth = 4; g.lineCap = 'round';
    g.beginPath();
    g.moveTo(-2, -bh * 0.62); g.quadraticCurveTo(-24, -bh * 0.75, -42, -bh * 0.88);
    g.moveTo(2, -bh * 0.7); g.quadraticCurveTo(26, -bh * 0.82, 44, -bh * 0.94);
    g.stroke();

    g.fillStyle = '#38362e';
    poly(g, [[-9, 0], [-7.5, -24], [-1, -14], [4, -22], [9, 0]], '#38362e');
    for (let i = 0; i < 11; i++) {
      const ty = -34 - i * ((bh - 45) / 11);
      const tw = 5 + r() * 6;
      g.fillRect(-5 + r() * 5, ty, tw, 2.5 + r() * 2);
    }

    const puffs: [number, number, number, number][] = [
      [-48, -bh * 0.88, 44, 34], [46, -bh * 0.92, 42, 32],
      [-22, -bh - 18, 52, 40], [24, -bh - 14, 48, 36],
      [0, -bh - 34, 44, 34],
    ];
    for (const [cx, cy, rx, ry] of puffs) {
      ell(g, cx, cy + 5, rx, ry, T.foliage[0]);
      ell(g, cx - 5, cy - 4, rx * 0.78, ry * 0.75, T.foliage[1]);
    }
    g.restore();
  };
  birch(1185, 295, -0.025);
  birch(1315, 372, 0.018);
  birch(1435, 272, -0.012);

  /* --- detailed alpine log cabin (left) --- */
  g.save(); g.translate(265, 714);
  ell(g, 18, 6, 175, 14, 'rgba(0,0,0,.25)');

  // stone chimney
  g.fillStyle = '#6b5e58';
  g.fillRect(56, -188, 28, 66);
  g.fillStyle = 'rgba(0,0,0,.18)';
  g.fillRect(74, -188, 10, 66);
  for (const [sx, sy, sw, sh] of [[58, -182, 12, 7], [72, -180, 10, 7], [60, -171, 15, 8], [57, -160, 11, 7], [70, -159, 12, 8]]) {
    g.fillStyle = '#857770'; g.fillRect(sx, sy, sw, sh);
  }
  g.fillStyle = '#4f443f'; g.fillRect(53, -193, 34, 6);
  g.fillStyle = '#a8583b'; g.fillRect(63, -201, 14, 8);
  if (T.smoke) {
    softBlob(g, 76, -214, 16, 'rgba(245,245,240,.55)', 0.9);
    softBlob(g, 90, -236, 22, 'rgba(245,245,240,.42)', 0.85);
    softBlob(g, 108, -262, 28, 'rgba(245,245,240,.28)', 0.8);
    softBlob(g, 130, -290, 35, 'rgba(245,245,240,.16)', 0.75);
  }

  // lean-to woodshed on right wall with stacked split logs
  g.fillStyle = '#5c3c24';
  g.fillRect(114, -76, 46, 72);
  poly(g, [[110, -82], [168, -66], [168, -60], [110, -76]], '#472d1a');
  g.fillStyle = '#3d2616'; g.fillRect(154, -66, 6, 62);
  const logCols = ['#8c5f3c', '#754c2e', '#9e6f4a'];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const lx = 122 + col * 9.5 + (row % 2) * 3;
      const ly = -10 - row * 9;
      ell(g, lx, ly, 4.6, 4.2, '#593a22');
      ell(g, lx, ly, 3.6, 3.2, logCols[(row + col) % 3]);
    }
  }

  // river-stone foundation base
  g.fillStyle = '#5c5752';
  g.fillRect(-116, -16, 232, 18);
  for (let x = -110; x < 105; x += 18) {
    ell(g, x + 8, -7, 8, 5.5, x % 36 === 0 ? '#7d7770' : '#6c665f');
  }

  // main log cabin wall + gable triangle
  poly(g, [[-114, -14], [-114, -108], [0, -172], [114, -108], [114, -14]], '#8b5e3c');
  for (let y = -106; y < -16; y += 13) {
    g.fillStyle = 'rgba(255,220,180,.08)';
    g.fillRect(-114, y, 228, 3);
    g.fillStyle = 'rgba(0,0,0,.18)';
    g.fillRect(-114, y + 10, 228, 2.5);
  }
  for (let y = -102; y < -16; y += 13) {
    for (const side of [-1, 1]) {
      const cx = side * 116;
      ell(g, cx, y + 5, 6.5, 5.5, '#593922');
      ell(g, cx, y + 5, 4.8, 4.0, '#ba8c63');
      ell(g, cx, y + 5, 2.0, 1.8, '#8a5d3b');
    }
  }

  // under-eave shadow following the roof line
  poly(g, [[-116, -102], [0, -166], [116, -102], [116, -92], [0, -154], [-116, -92]], 'rgba(0,0,0,.26)');

  // round attic gable window
  if (T.windowGlow) softBlob(g, 0, -134, 28, T.windowGlow, 0.7);
  ell(g, 0, -134, 13, 13, '#3a2418');
  ell(g, 0, -134, 10, 10, T.window);
  g.strokeStyle = '#3a2418'; g.lineWidth = 2.2;
  g.beginPath();
  g.moveTo(-10, -134); g.lineTo(10, -134);
  g.moveTo(0, -144); g.lineTo(0, -124);
  g.stroke();

  // overhanging timber roof
  poly(g, [[-136, -100], [0, -178], [136, -100], [128, -92], [0, -166], [-128, -92]], '#472d1a');
  poly(g, [[-138, -103], [0, -182], [138, -103], [133, -97], [0, -173], [-133, -97]], '#694328');
  poly(g, [[-138, -103], [0, -182], [0, -173], [-133, -97]], 'rgba(255,230,190,.12)');

  // arched timber front door & stone entry steps
  g.fillStyle = '#78716a';
  g.fillRect(-28, -8, 56, 6);
  g.fillStyle = '#918980';
  g.fillRect(-24, -14, 48, 6);
  g.fillStyle = '#331f14';
  g.beginPath();
  g.moveTo(-22, -14); g.lineTo(-22, -62);
  g.quadraticCurveTo(0, -76, 22, -62);
  g.lineTo(22, -14); g.closePath(); g.fill();
  g.fillStyle = '#573624';
  g.beginPath();
  g.moveTo(-18, -14); g.lineTo(-18, -60);
  g.quadraticCurveTo(0, -72, 18, -60);
  g.lineTo(18, -14); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 1.4;
  for (const dx of [-9, 0, 9]) {
    g.beginPath(); g.moveTo(dx, -66); g.lineTo(dx, -14); g.stroke();
  }
  ell(g, 0, -52, 6, 6, '#331f14');
  ell(g, 0, -52, 4.2, 4.2, T.window);
  ell(g, 12, -38, 2.5, 2.5, '#d4af37');

  // windows with wooden shutters & flower boxes
  for (const wx of [-90, 46]) {
    if (T.windowGlow) softBlob(g, wx + 22, -68, 68, T.windowGlow, 0.92);
    g.fillStyle = '#38523d';
    g.fillRect(wx - 12, -90, 11, 44);
    g.fillRect(wx + 45, -90, 11, 44);
    g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 1.2;
    for (let sy = -85; sy < -48; sy += 5) {
      g.beginPath();
      g.moveTo(wx - 10, sy); g.lineTo(wx - 3, sy);
      g.moveTo(wx + 47, sy); g.lineTo(wx + 54, sy);
      g.stroke();
    }
    g.fillStyle = T.window; g.fillRect(wx, -90, 44, 42);
    g.fillStyle = 'rgba(255,255,255,.16)';
    poly(g, [[wx + 2, -88], [wx + 16, -88], [wx + 6, -50], [wx + 2, -50]], 'rgba(255,255,255,.16)');
    g.strokeStyle = '#3a2418'; g.lineWidth = 4; g.strokeRect(wx, -90, 44, 42);
    g.lineWidth = 2.6;
    g.beginPath();
    g.moveTo(wx + 22, -90); g.lineTo(wx + 22, -48);
    g.moveTo(wx, -69); g.lineTo(wx + 44, -69);
    g.stroke();
    g.fillStyle = '#4a2e1b';
    g.fillRect(wx - 4, -47, 52, 9);
    for (let fx = wx; fx <= wx + 40; fx += 8) {
      ell(g, fx + 2, -48, 5, 4, T.foliage[0]);
      if (fx % 16 === 0) ell(g, fx + 2, -51, 3, 3, '#e04f4f');
      else ell(g, fx + 3, -50, 2.5, 2.5, '#ff8fa3');
    }
  }

  // warm festoon string lights at night
  if (T.lamp) {
    g.strokeStyle = 'rgba(255,200,120,.4)'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(-128, -98); g.quadraticCurveTo(0, -76, 128, -98); g.stroke();
    for (let i = 0; i <= 8; i++) {
      const t = i / 8, lx = -126 + 252 * t;
      const ly = -98 + (1 - (2 * t - 1) ** 2) * 22;
      softBlob(g, lx, ly + 4, 18, 'rgba(255,190,85,.55)', 0.85);
      ell(g, lx, ly + 4, 3.2, 3.6, '#ffe299');
    }
  }
  g.restore();

  /* --- rustic split-rail wooden fence & shrubs towards the camera --- */
  for (let i = 0; i < 5; i++) {
    const fx = 445 + i * 60, fy = 710 + i * 3;
    ell(g, fx + 5, fy + 2, 12, 3.5, 'rgba(0,0,0,.2)');
    poly(g, [
      [fx, fy], [fx, fy - 48 - i * 2],
      [fx + 5, fy - 54 - i * 2],
      [fx + 10, fy - 48 - i * 2], [fx + 10, fy],
    ], '#8c6b48');
    g.fillStyle = '#ab8860';
    g.fillRect(fx, fy - 48 - i * 2, 3.5, 48 + i * 2);
  }
  for (const ry of [674, 692]) {
    poly(g, [[445, ry], [695, ry + 11], [695, ry + 18], [445, ry + 7]], '#7d5e3d');
    poly(g, [[445, ry], [695, ry + 11], [695, ry + 13.5], [445, ry + 2.5]], '#a6835c');
  }
}

/* ==================== LAYER: near meadow (5 m) ====================== */
export function paintMeadowNear(g: CanvasRenderingContext2D, T: Theme) {
  const r = sr(66);
  const grd = g.createLinearGradient(0, 708, 0, DH + 900);
  grd.addColorStop(0, T.meadowNearA); grd.addColorStop(1, T.meadowNearB);

  // Gently contoured foreground meadow top edge
  g.fillStyle = grd;
  g.beginPath();
  g.moveTo(-800, 718);
  g.quadraticCurveTo(-200, 704, 380, 718);
  g.quadraticCurveTo(720, 725, 1120, 710);
  g.quadraticCurveTo(1650, 698, 2800, 718);
  g.lineTo(2800, DH + 1700);
  g.lineTo(-800, DH + 1700);
  g.closePath();
  g.fill();

  // soft terrain contour shading
  for (let i = 0; i < 6; i++) {
    softBlob(g, -600 + r() * 3000, 780 + r() * 500, 180 + r() * 220, 'rgba(0,0,0,.15)', 0.35);
  }

  // winding country path widening into foreground with stepping stones
  g.save();
  g.fillStyle = 'rgba(0,0,0,.12)';
  g.beginPath();
  g.moveTo(674, 716); g.quadraticCurveTo(732, 900, 818, DH + 800);
  g.lineTo(1022, DH + 800); g.quadraticCurveTo(908, 900, 766, 716);
  g.closePath(); g.fill();

  g.fillStyle = T.pathA; g.globalAlpha = 0.92;
  g.beginPath();
  g.moveTo(680, 716); g.quadraticCurveTo(740, 900, 830, DH + 800);
  g.lineTo(1010, DH + 800); g.quadraticCurveTo(900, 900, 760, 716);
  g.closePath(); g.fill();
  g.globalAlpha = 1;

  // flat flagstones & pebbles along the path
  const stones: [number, number, number, number][] = [
    [722, 748, 22, 7], [748, 782, 28, 9], [735, 825, 34, 11],
    [778, 868, 38, 12], [762, 922, 44, 14], [818, 975, 48, 15],
    [805, 1035, 54, 16], [862, 1095, 58, 18],
  ];
  for (const [sx, sy, rx, ry] of stones) {
    ell(g, sx, sy + 2.5, rx, ry, 'rgba(0,0,0,.18)');
    ell(g, sx, sy, rx, ry, T.key === 'night' ? '#464a54' : '#b8b0a0');
    ell(g, sx - rx * 0.2, sy - ry * 0.2, rx * 0.65, ry * 0.6, 'rgba(255,255,255,.14)');
  }
  g.restore();

  // grass blade tufts across the near meadow
  g.lineWidth = 2;
  for (let i = 0; i < 420; i++) {
    const x = -800 + r() * 3600, y = 724 + r() * (DH + 600);
    g.strokeStyle = r() > 0.5 ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.09)';
    g.beginPath();
    g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 7, y - 10 - r() * 10);
    g.stroke();
  }

  // multi-petal wildflowers & lupine spikes
  if (T.flowers) {
    const petalCols = ['#ffffff', '#ffd166', '#ff8fa3', '#cdb4ff'];
    for (let i = 0; i < 115; i++) {
      const fx = -800 + r() * 3600;
      const fy = 735 + r() * (DH + 450);
      const s = 1.8 + (fy - 720) / 360 * 3.8;
      const col = petalCols[(r() * 4) | 0];
      g.strokeStyle = T.grass[0]; g.lineWidth = Math.max(1, s * 0.35);
      g.beginPath(); g.moveTo(fx, fy + s * 2.5); g.lineTo(fx, fy); g.stroke();
      if (i % 5 === 0) {
        for (let k = 0; k < 4; k++) {
          ell(g, fx + (k % 2 - 0.5) * s * 0.6, fy - k * s * 0.85, s * 0.75, s * 0.55, '#b892ff');
        }
      } else {
        ell(g, fx - s * 0.65, fy, s * 0.65, s * 0.5, col);
        ell(g, fx + s * 0.65, fy, s * 0.65, s * 0.5, col);
        ell(g, fx, fy - s * 0.55, s * 0.5, s * 0.65, col);
        ell(g, fx, fy + s * 0.55, s * 0.5, s * 0.65, col);
        ell(g, fx, fy, s * 0.45, s * 0.45, col === '#ffd166' ? '#e07a16' : '#f5b82e');
      }
    }
  }

  // ornate wrought-iron path lamppost (glows warmly at night)
  g.save(); g.translate(895, 785);
  ell(g, 0, 6, 36, 8, 'rgba(0,0,0,.24)');
  if (T.lamp) {
    ell(g, 0, 8, 85, 18, 'rgba(255,185,80,.14)');
  }
  poly(g, [[-12, 4], [-8, -28], [8, -28], [12, 4]], '#1e2229');
  g.fillStyle = '#262b33';
  g.fillRect(-9, -32, 18, 5);
  g.fillRect(-4.5, -216, 9, 188);
  g.fillRect(-16, -198, 32, 4);
  g.strokeStyle = '#262b33'; g.lineWidth = 2.5;
  g.beginPath();
  g.moveTo(-4, -206); g.quadraticCurveTo(-14, -212, -10, -220);
  g.moveTo(4, -206); g.quadraticCurveTo(14, -212, 10, -220);
  g.stroke();
  poly(g, [[-11, -216], [11, -216], [16, -242], [-16, -242]], T.lamp ? '#ffe29e' : 'rgba(210,225,238,.55)');
  g.strokeStyle = '#1e2229'; g.lineWidth = 2.4;
  g.beginPath();
  g.moveTo(-11, -216); g.lineTo(-16, -242);
  g.moveTo(11, -216); g.lineTo(16, -242);
  g.moveTo(0, -216); g.lineTo(0, -242);
  g.stroke();
  poly(g, [[-19, -242], [0, -256], [19, -242]], '#1e2229');
  ell(g, 0, -258, 3, 4, '#1e2229');

  if (T.lamp) {
    softBlob(g, 0, -232, 150, 'rgba(255,190,85,.55)', 0.92);
    softBlob(g, 0, -232, 55, 'rgba(255,230,160,.8)', 0.95);
    ell(g, 0, -229, 7, 9, '#fff6d6');
  }
  g.restore();
}

/* ==================== LAYER: subject (d metres) ===================== */
/* A 1.75 m person, drawn 1 unit = 1 cm, feet at personGeom(d).baseY.   */
export function paintSubject(g: CanvasRenderingContext2D, _T: Theme, d: number) {
  const { h, baseY } = personGeom(d);
  const u = h / 145;
  g.save();
  g.translate(800, baseY);
  g.scale(u, u);
  g.translate(0, -175); // y: 34 = top of hair … 175 = feet (141 cm span)

  const SKIN = '#efc49d', SKIN_SH = 'rgba(160,105,70,.35)';
  const HAIR = '#3a2b21', JEANS = '#3f5878', SHOE = '#33363d';

  // ground shadow
  ell(g, 2, 173, 17, 3.6, 'rgba(0,0,0,.22)');

  // legs
  g.fillStyle = JEANS;
  g.beginPath(); g.roundRect(-11.5, 96, 10.4, 76, 4); g.fill();
  g.beginPath(); g.roundRect(1.1, 96, 10.4, 76, 4); g.fill();
  g.fillRect(-12, 138, 24, 8); // hips
  g.fillStyle = 'rgba(255,255,255,.14)';
  g.fillRect(-8, 100, 1.6, 66); g.fillRect(4.5, 100, 1.6, 66); // seam highlights
  g.fillStyle = 'rgba(0,0,0,.18)';
  g.fillRect(-11.5, 166, 10.4, 3); g.fillRect(1.1, 166, 10.4, 3);

  // shoes
  g.fillStyle = SHOE;
  g.beginPath(); g.roundRect(-13.5, 168, 13, 7, 3); g.fill();
  g.beginPath(); g.roundRect(0.8, 168, 13, 7, 3); g.fill();
  g.fillStyle = '#202227';
  g.fillRect(-13.5, 173, 13, 1.8); g.fillRect(0.8, 173, 13, 1.8);

  // torso: striped tee
  g.save();
  g.beginPath();
  g.moveTo(-15, 138); g.quadraticCurveTo(-17.5, 108, -16, 96);
  g.quadraticCurveTo(-9, 86, -6.5, 74);
  g.lineTo(6.5, 74); g.quadraticCurveTo(9, 86, 16, 96);
  g.quadraticCurveTo(17.5, 108, 15, 138);
  g.closePath();
  g.fillStyle = '#f4f1e6'; g.fill();
  g.clip();
  g.fillStyle = '#2e8f83';
  for (let y = 76; y < 140; y += 9) g.fillRect(-20, y, 40, 3.6);
  g.restore();
  // collar
  g.strokeStyle = '#d8d3c2'; g.lineWidth = 1.8;
  g.beginPath(); g.moveTo(-6.5, 74); g.quadraticCurveTo(0, 79, 6.5, 74); g.stroke();

  // left arm (down) + watch
  g.strokeStyle = SKIN; g.lineWidth = 5.6; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-15, 100); g.quadraticCurveTo(-19.5, 115, -18.5, 132); g.stroke();
  g.strokeStyle = SKIN_SH; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(-17.6, 104); g.quadraticCurveTo(-20.6, 116, -19.6, 130); g.stroke();
  g.fillStyle = '#2b2f36'; g.fillRect(-22.2, 124, 7.2, 8.4);   // watch band
  g.fillStyle = '#cdd3da'; g.fillRect(-21.2, 125.4, 5.2, 6.2); // face
  g.fillStyle = '#8f97a1'; g.fillRect(-19.4, 127, 1.6, 3.2);

  // right arm (bent, holding a cup)
  g.strokeStyle = SKIN; g.lineWidth = 5.6;
  g.beginPath(); g.moveTo(15, 100); g.quadraticCurveTo(21, 110, 19, 118); g.stroke();
  g.beginPath(); g.moveTo(19, 118); g.quadraticCurveTo(16, 114, 10.5, 112.5); g.stroke();
  // cup + steam
  g.fillStyle = '#f7f4ec';
  g.beginPath(); g.moveTo(6, 112); g.lineTo(14.5, 112); g.lineTo(13.2, 121.5); g.lineTo(7.3, 121.5); g.closePath(); g.fill();
  g.fillStyle = '#b9875a'; g.fillRect(7.3, 112.4, 5.9, 1.6);
  g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 1.1;
  g.beginPath(); g.moveTo(9, 110); g.quadraticCurveTo(7.6, 107, 9.4, 104.6); g.stroke();
  g.beginPath(); g.moveTo(12, 110); g.quadraticCurveTo(13.6, 107.4, 12, 105); g.stroke();

  // neck — spans y 63→74: tucks under the chin (head drawn after, covers the top)
  // and meets the tee's straight neckline at y=74 (drawn earlier, so stop exactly there)
  g.fillStyle = SKIN; g.fillRect(-3.6, 63, 7.2, 11);
  g.fillStyle = SKIN_SH; g.fillRect(-3.6, 66, 7.2, 2.4);

  // head
  ell(g, 0, 52, 11.6, 13.6, SKIN);
  // ears
  ell(g, -11.2, 53, 2.1, 3.1, SKIN); ell(g, 11.2, 53, 2.1, 3.1, SKIN);

  // hair
  g.fillStyle = HAIR;
  g.beginPath();
  g.moveTo(-12, 50);
  g.quadraticCurveTo(-13.5, 38, -6, 35.6);
  g.quadraticCurveTo(0, 33, 6.5, 36);
  g.quadraticCurveTo(13.4, 39, 12, 51);
  g.quadraticCurveTo(11, 42, 7, 40.4);
  g.quadraticCurveTo(3, 44.6, -4.5, 43.6);
  g.quadraticCurveTo(-10, 42.8, -12, 50);
  g.closePath(); g.fill();
  // side hair
  g.beginPath(); g.ellipse(-11.6, 47.5, 2.3, 6.4, 0.12, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(11.6, 47.5, 2.3, 6.4, -0.12, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 0.8;
  g.beginPath(); g.moveTo(-6, 35.8); g.quadraticCurveTo(-1, 34, 5, 36.4); g.stroke();

  // face — brows, eyes, nose, lips, blush, freckles
  g.strokeStyle = '#4a3526'; g.lineWidth = 1.1; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-7.4, 48.4); g.quadraticCurveTo(-5, 47.2, -2.6, 48.6); g.stroke();
  g.beginPath(); g.moveTo(2.6, 48.6); g.quadraticCurveTo(5, 47.2, 7.4, 48.4); g.stroke();

  for (const ex of [-5, 5]) {
    ell(g, ex, 51.4, 2.5, 1.7, '#fff');
    ell(g, ex, 51.5, 1.35, 1.35, '#7a5230');   // iris
    ell(g, ex, 51.5, 0.62, 0.62, '#241a12');   // pupil
    ell(g, ex - 0.5, 50.8, 0.42, 0.42, '#fff'); // catchlight
    g.strokeStyle = '#3a2b21'; g.lineWidth = 0.9;
    g.beginPath(); g.moveTo(ex - 2.4, 50.1); g.quadraticCurveTo(ex, 49.3, ex + 2.4, 50.1); g.stroke(); // lash line
  }
  g.strokeStyle = SKIN_SH; g.lineWidth = 1;
  g.beginPath(); g.moveTo(0.4, 53.4); g.quadraticCurveTo(1.6, 56.4, 0.2, 57.6); g.stroke(); // nose
  g.strokeStyle = '#c2685f'; g.lineWidth = 1.3;
  g.beginPath(); g.moveTo(-2.6, 60.6); g.quadraticCurveTo(0, 62.4, 2.6, 60.6); g.stroke();  // lips
  g.strokeStyle = '#a94f48'; g.lineWidth = 0.8;
  g.beginPath(); g.moveTo(-1.6, 60.9); g.quadraticCurveTo(0, 61.9, 1.6, 60.9); g.stroke();
  ell(g, -7.4, 57, 1.9, 1.2, 'rgba(230,120,110,.22)');
  ell(g, 7.4, 57, 1.9, 1.2, 'rgba(230,120,110,.22)');
  g.fillStyle = 'rgba(120,80,50,.35)';
  for (const [fx, fy] of [[-3.4, 55.6], [3.4, 55.6], [-6.6, 55.2], [6.6, 55.2], [-1.4, 55.8]]) {
    g.fillRect(fx, fy, 0.55, 0.55);
  }

  g.restore();
}

/* ================== LAYER: foreground grass (0.7 m) ================= */
export function paintForeground(g: CanvasRenderingContext2D, T: Theme) {
  const r = sr(88);
  const cols = T.grass;
  const baseY = DH + 830;

  // lush blades across the bottom, radiating slightly
  for (let i = 0; i < 155; i++) {
    const x = -800 + r() * 3600;
    const hgt = 130 + r() * 320;
    const lean = (r() - 0.5) * 140;
    const w = 5 + r() * 8;
    const c = cols[(r() * 3) | 0];
    g.beginPath();
    g.moveTo(x - w / 2, baseY);
    g.quadraticCurveTo(x + lean * 0.3, baseY - hgt * 0.55, x + lean, baseY - hgt);
    g.quadraticCurveTo(x + lean * 0.3 + w * 0.4, baseY - hgt * 0.5, x + w / 2, baseY);
    g.closePath();
    g.fillStyle = c; g.fill();
  }

  // golden foxtail / wheat grass plumes in foreground
  const wheatPlume = (wx: number, wy: number, lean: number, sc: number) => {
    g.save();
    g.strokeStyle = T.key === 'night' ? '#3a4a38' : '#8fa852';
    g.lineWidth = 3.2 * sc;
    g.beginPath();
    g.moveTo(wx, baseY);
    g.quadraticCurveTo(wx + lean * 0.45, (wy + baseY) / 2, wx + lean, wy);
    g.stroke();
    g.translate(wx + lean, wy);
    g.rotate(lean * 0.003);
    const grainCol = T.key === 'night' ? '#5c6650' : '#dfbe6f';
    for (let i = 0; i < 9; i++) {
      const gy = -i * 7 * sc;
      ell(g, -4 * sc, gy, 4.5 * sc, 2.2 * sc, grainCol);
      ell(g, 4 * sc, gy - 3 * sc, 4.5 * sc, 2.2 * sc, grainCol);
    }
    g.restore();
  };
  wheatPlume(190, 1210, 42, 1.1);
  wheatPlume(440, 1250, -35, 0.95);
  wheatPlume(1120, 1190, -48, 1.15);
  wheatPlume(1380, 1220, 38, 1.0);

  // foreground chamomile / poppy blossoms for rich color bokeh
  const fgFlower = (fx: number, fy: number, sc: number, type: 'poppy' | 'daisy') => {
    g.strokeStyle = cols[0]; g.lineWidth = 3.6 * sc;
    g.beginPath(); g.moveTo(fx, baseY); g.quadraticCurveTo(fx + 10 * sc, (fy + baseY) / 2, fx, fy); g.stroke();
    g.save(); g.translate(fx, fy); g.scale(sc, sc);
    if (type === 'poppy') {
      const pCol = T.key === 'night' ? '#8a2be2' : '#e64833';
      const pHi = T.key === 'night' ? '#a450f0' : '#ff6b52';
      ell(g, -10, -2, 14, 11, pCol);
      ell(g, 10, -2, 14, 11, pCol);
      ell(g, 0, -9, 15, 11, pHi);
      ell(g, 0, 5, 14, 10, pHi);
      ell(g, 0, -1, 5.5, 5.5, '#241a18');
      ell(g, 0, -1, 2.5, 2.5, '#f2c94c');
    } else {
      const dCol = T.key === 'night' ? '#b8c4db' : '#ffffff';
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        g.save(); g.rotate(a);
        ell(g, 0, -13, 4.2, 8.5, dCol);
        g.restore();
      }
      ell(g, 0, 0, 7, 7, '#f5b82e');
      ell(g, -1.5, -1.5, 4, 4, '#ffe169');
    }
    g.restore();
  };
  fgFlower(240, 1150, 1.1, 'poppy');
  fgFlower(1310, 1165, 1.15, 'daisy');
  fgFlower(1430, 1210, 0.95, 'poppy');

  // dandelions — gorgeous bokeh balls when out of focus
  const dande = (dx: number, dy: number, s: number) => {
    g.strokeStyle = '#3f6d33'; g.lineWidth = 4 * s;
    g.beginPath(); g.moveTo(dx, baseY); g.quadraticCurveTo(dx + 14 * s, (dy + baseY) / 2, dx + 6 * s, dy); g.stroke();
    softBlob(g, dx + 6 * s, dy, 28 * s, 'rgba(255,252,240,.22)', 1);
    ell(g, dx + 6 * s, dy, 9 * s, 9 * s, '#e6d69b');
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2 + r() * 0.2;
      const rr = (12 + r() * 14) * s;
      const sx = dx + 6 * s + Math.cos(a) * rr, sy2 = dy + Math.sin(a) * rr;
      g.strokeStyle = 'rgba(248,246,238,.92)'; g.lineWidth = 1.1 * s;
      g.beginPath(); g.moveTo(dx + 6 * s, dy); g.lineTo(sx, sy2); g.stroke();
      ell(g, sx, sy2, 2.2 * s, 2.2 * s, '#faf8f2');
    }
    // a few seeds drifting
    for (let i = 0; i < 4; i++) {
      const fx = dx + 40 * s + r() * 130 * s, fy = dy - 40 * s - r() * 120 * s;
      g.strokeStyle = 'rgba(248,246,238,.55)'; g.lineWidth = 1 * s;
      g.beginPath(); g.moveTo(fx, fy + 10 * s); g.quadraticCurveTo(fx + 5 * s, fy, fx + 12 * s, fy - 8 * s); g.stroke();
      g.beginPath(); g.ellipse(fx + 12 * s, fy - 8 * s, 3.4 * s, 3.4 * s, 0, 0, Math.PI * 2);
      g.strokeStyle = 'rgba(248,246,238,.45)'; g.stroke();
    }
  };
  dande(320, 1180, 1.15);
  dande(1215, 1120, 1.3);
  dande(1500, 1230, 1.0);
  dande(60, 1300, 0.9);
}

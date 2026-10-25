/* =====================================================================
   scene.js — procedural layered scene for the camera simulator.
   Design space: 1600 × 1067 px == what a 35 mm lens sees (full-frame).
   Painters receive a ctx already transformed into design coordinates,
   and must cover the overscan region x ∈ [-800, 2800], y ∈ [-700, 1900]
   so wider lenses (24 mm) never reveal an edge.
   ===================================================================== */

export const DW = 1600, DH = 1067;
export const HORIZON = 460;
export const CAM_H = 1.1;              // camera height above ground, metres
export const PX_PER_DEG = (DH / 2) / (Math.atan(24 / 70) * 180 / Math.PI); // 35 mm vertical half-FOV

export const deg = r => (r * 180) / Math.PI;

/** Seeded RNG (mulberry32) so shapes never jitter between redraws. */
export function sr(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Where a 1.75 m person at distance `d` (metres) sits in design space. */
export function personGeom(d) {
  const h = deg(2 * Math.atan(0.875 / d)) * PX_PER_DEG;          // px tall
  const baseY = HORIZON + deg(Math.atan(CAM_H / d)) * PX_PER_DEG; // feet y
  return { h, baseY };
}

/* ------------------------------ themes ------------------------------ */
export const THEMES = {
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
export function ell(g, x, y, rx, ry, fill) {
  g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  g.fillStyle = fill; g.fill();
}
export function poly(g, pts, fill) {
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.closePath(); g.fillStyle = fill; g.fill();
}
export function softBlob(g, x, y, r, fill, alpha) {
  const grd = g.createRadialGradient(x, y, 0, x, y, r);
  grd.addColorStop(0, fill); grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.globalAlpha = alpha; g.fillStyle = grd;
  g.fillRect(x - r, y - r, r * 2, r * 2);
  g.globalAlpha = 1;
}

/* ===================== shared: sky, sun/moon, clouds ================ */
export function paintSky(g, T) {
  const r = sr(11);
  const grd = g.createLinearGradient(0, -700, 0, HORIZON);
  grd.addColorStop(0, T.sky[0]); grd.addColorStop(0.62, T.sky[1]); grd.addColorStop(1, T.sky[2]);
  g.fillStyle = grd; g.fillRect(-800, -700, 3600, HORIZON + 700);

  // stars
  if (T.stars) {
    for (let i = 0; i < 170; i++) {
      const x = -800 + r() * 3600, y = -700 + r() * (HORIZON + 500), a = 0.15 + r() * 0.75;
      const s = 0.6 + r() * 1.6;
      g.globalAlpha = a * (1 - y / (HORIZON + 600)); g.fillStyle = '#dfe8ff';
      g.fillRect(x, y, s, s);
    }
    g.globalAlpha = 1;
    for (const [sx, sy] of [[420, 40], [1470, 90], [1000, -260]]) {
      g.strokeStyle = 'rgba(230,238,255,.8)'; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(sx - 7, sy); g.lineTo(sx + 7, sy);
      g.moveTo(sx, sy - 7); g.lineTo(sx, sy + 7); g.stroke();
    }
  }

  // sun / moon
  if (T.sun) {
    softBlob(g, 1180, 268, 260, 'rgba(255,214,150,.5)', 0.9);
    softBlob(g, 1180, 268, 90, 'rgba(255,240,200,.85)', 1);
    ell(g, 1180, 268, 34, 34, '#fff7e0');
  }
  if (T.moon) {
    softBlob(g, 1180, 268, 120, 'rgba(200,215,255,.16)', 1);
    ell(g, 1180, 268, 27, 27, '#e9edf5');
    ell(g, 1192, 260, 24, 24, '#0d1530'); // crescent bite
    ell(g, 1170, 276, 4, 4, 'rgba(160,175,205,.5)');
    ell(g, 1188, 258, 2.6, 2.6, 'rgba(160,175,205,.4)');
  }

  // clouds
  if (T.cloud === 'puffy') {
    const puffs = [[260, 150], [620, 105], [1040, 178], [1450, 118], [1900, 160], [80, 230]];
    for (const [cx, cy] of puffs) {
      const n = 4 + Math.floor(r() * 3);
      for (let i = 0; i < n; i++) {
        const px = cx + (r() - 0.5) * 150, py = cy + (r() - 0.5) * 34;
        ell(g, px, py, 46 + r() * 34, 20 + r() * 12, T.cloudTop);
      }
      ell(g, cx, cy + 16, 80, 14, T.cloudBot);
    }
  } else if (T.cloud === 'band') {
    for (const [by, bh, a] of [[60, 70, .5], [180, 90, .65], [330, 80, .5]]) {
      const cg = g.createLinearGradient(0, by - bh / 2, 0, by + bh / 2);
      cg.addColorStop(0, 'rgba(233,238,241,0)');
      cg.addColorStop(0.5, `rgba(198,208,215,${a})`);
      cg.addColorStop(1, 'rgba(233,238,241,0)');
      g.fillStyle = cg; g.fillRect(-800, by - bh / 2, 3600, bh);
    }
  }

  // birds
  if (T.birds) {
    g.strokeStyle = 'rgba(50,60,80,.8)'; g.lineWidth = 2.4;
    for (const [bx, by, s] of [[380, 236, 1], [430, 222, .8], [468, 248, .65]]) {
      g.beginPath();
      g.moveTo(bx - 11 * s, by); g.quadraticCurveTo(bx - 5 * s, by - 7 * s, bx, by - 1);
      g.quadraticCurveTo(bx + 5 * s, by - 7 * s, bx + 11 * s, by);
      g.stroke();
    }
  }
}

/* ===================== LAYER: backdrop (infinity) ==================== */
/* Mountains + haze on top of the shared sky. */
export function paintBackdrop(g, T) {
  paintSky(g, T);

  // mountain ranges
  const back = [[-800, 460], [-320, 296], [-80, 252], [250, 308], [520, 262], [860, 314], [1180, 268],
                [1520, 320], [1900, 282], [2300, 338], [2800, 300], [3300, 460]];
  poly(g, back, T.mtnBack);
  const front = [[-800, 460], [-250, 358], [50, 326], [420, 372], [700, 336], [1050, 378],
                 [1400, 342], [1750, 390], [2100, 352], [2500, 408], [3300, 460]];
  poly(g, front, T.mtnFront);

  // snow caps on the back range
  for (let i = 1; i < back.length - 1; i += 2) {
    const [x, y] = back[i];
    poly(g, [[x - 34, y + 30], [x, y], [x + 34, y + 30], [x + 22, y + 24], [x + 8, y + 34], [x - 8, y + 26]], T.snow);
  }

  // aerial haze at the base of the mountains
  const hz = g.createLinearGradient(0, 330, 0, HORIZON);
  hz.addColorStop(0, 'rgba(0,0,0,0)'); hz.addColorStop(1, T.haze);
  g.fillStyle = hz; g.fillRect(-800, 330, 3600, HORIZON - 330);
}

/* ======================== LAYER: lake (130 m) ======================= */
export function paintLake(g, T) {
  const r = sr(33);
  const grd = g.createLinearGradient(0, HORIZON, 0, 560);
  grd.addColorStop(0, T.lakeTop); grd.addColorStop(1, T.lakeBot);
  g.fillStyle = grd; g.fillRect(-800, HORIZON, 3600, 100);

  // sun / moon glitter path
  if (T.glitter) {
    for (let i = 0; i < 46; i++) {
      const y = HORIZON + 3 + r() * 94;
      const spread = (y - HORIZON) * 1.15 + 8;
      const x = 1180 + (r() - 0.5) * spread * 2;
      g.globalAlpha = 0.25 + r() * 0.6;
      g.fillStyle = T.glitter;
      g.fillRect(x, y, 6 + r() * 26, 1.6 + r() * 1.8);
    }
    g.globalAlpha = 1;
  }

  // ripples
  g.strokeStyle = 'rgba(255,255,255,.10)'; g.lineWidth = 1.4;
  for (let i = 0; i < 26; i++) {
    const y = HORIZON + 8 + r() * 88, x = -800 + r() * 3600, w = 30 + r() * 80;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y + 3, x + w, y); g.stroke();
  }

  // little rowboat
  g.save(); g.translate(500, 512);
  g.fillStyle = 'rgba(30,34,44,.9)';
  g.beginPath(); g.moveTo(-26, 0); g.quadraticCurveTo(0, 14, 26, 0);
  g.quadraticCurveTo(0, 5, -26, 0); g.fill();
  g.strokeStyle = 'rgba(230,235,240,.7)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(-6, 2); g.lineTo(6, 2); g.stroke();
  if (T.stars) { ell(g, -14, -3, 4, 5, '#ffb454'); } // little lantern at night
  g.restore();

  // shoreline
  g.fillStyle = T.shore; g.fillRect(-800, 556, 3600, 10);
  g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(-800, 564, 3600, 3);
}

/* ==================== LAYER: far meadow (60 m) ====================== */
export function paintMeadowFar(g, T) {
  const r = sr(44);
  const grd = g.createLinearGradient(0, 560, 0, 722);
  grd.addColorStop(0, T.meadowFarA); grd.addColorStop(1, T.meadowFarB);
  g.fillStyle = grd; g.fillRect(-800, 560, 3600, 162);

  // grass texture strokes
  g.lineWidth = 1.6;
  for (let i = 0; i < 260; i++) {
    const x = -800 + r() * 3600, y = 566 + r() * 152;
    g.strokeStyle = r() > 0.5 ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.07)';
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 4, y - 6 - r() * 5); g.stroke();
  }
  // far flowers
  if (T.flowers) {
    const cols = ['#ffffff', '#ffd166', '#ff8fa3', '#e8e8e8'];
    for (let i = 0; i < 150; i++) {
      ell(g, -800 + r() * 3600, 572 + r() * 142, 1.6 + r() * 1.6, 1.6 + r() * 1.6, cols[(r() * 4) | 0]);
    }
  }
  // path begins
  g.fillStyle = T.pathA; g.globalAlpha = 0.85;
  g.beginPath();
  g.moveTo(600, 560); g.quadraticCurveTo(650, 640, 680, 722);
  g.lineTo(760, 722); g.quadraticCurveTo(730, 640, 690, 560);
  g.closePath(); g.fill(); g.globalAlpha = 1;
}

/* =================== LAYER: cabin & trees (30 m) ==================== */
export function paintHouseTrees(g, T) {
  const r = sr(55);

  /* --- birch grove (right) --- */
  const birch = (bx, bh, lean) => {
    g.save(); g.translate(bx, 716); g.rotate(lean);
    g.fillStyle = '#e9e5d7'; g.fillRect(-7, -bh, 14, bh);
    g.fillStyle = 'rgba(40,40,34,.85)';
    for (let i = 0; i < 7; i++) g.fillRect(-7 + r() * 9, -bh + 14 + i * (bh / 8), 7 + r() * 6, 3.5);
    // canopies
    for (let i = 0; i < 5; i++) {
      const cx = (r() - 0.5) * 120, cy = -bh - 20 - r() * 70, cr = 34 + r() * 42;
      ell(g, cx, cy, cr, cr * 0.8, T.foliage[(r() * 3) | 0]);
    }
    for (let i = 0; i < 3; i++) ell(g, (r() - .5) * 100, -bh - 10 - r() * 40, 26 + r() * 20, 20 + r() * 14, T.foliage[2]);
    g.restore();
  };
  birch(1180, 300, -0.03);
  birch(1315, 380, 0.02);
  birch(1440, 268, -0.01);
  // dark pine
  poly(g, [[1060, 716], [1092, 560], [1063, 578], [1030, 590], [1005, 600], [1030, 620], [990, 646], [1035, 660], [975, 716]], T.pine);
  poly(g, [[1075, 700], [1105, 588], [1080, 598], [1052, 608], [1075, 640], [1040, 668], [1080, 690]], 'rgba(255,255,255,.05)');

  /* --- cabin (left) --- */
  g.save(); g.translate(265, 712);
  // ground shadow
  ell(g, 10, 4, 150, 12, 'rgba(0,0,0,.22)');
  // firewood
  g.fillStyle = '#7a5236';
  for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(150 + (i % 3) * 18, -4 - Math.floor(i / 3) * 15, 8, 0, Math.PI * 2); g.fill(); }
  // walls
  g.fillStyle = '#8b5e3c'; g.fillRect(-110, -108, 220, 108);
  g.fillStyle = 'rgba(0,0,0,.14)';
  for (let y = -96; y < 0; y += 14) g.fillRect(-110, y, 220, 2);
  // roof
  poly(g, [[-128, -104], [0, -168], [128, -104]], '#54371f');
  poly(g, [[-128, -104], [0, -168], [0, -104]], 'rgba(255,255,255,.07)');
  // chimney
  g.fillStyle = '#6e4433'; g.fillRect(58, -178, 22, 46);
  if (T.smoke) {
    ell(g, 78, -196, 9, 8, 'rgba(245,245,240,.55)');
    ell(g, 90, -218, 13, 11, 'rgba(245,245,240,.4)');
    ell(g, 106, -243, 17, 14, 'rgba(245,245,240,.26)');
  }
  // door + windows
  g.fillStyle = '#4a2f24'; g.fillRect(-20, -62, 40, 62);
  g.fillStyle = '#c9a86a'; g.fillRect(14, -34, 6, 6);
  for (const wx of [-84, 44]) {
    if (T.windowGlow) softBlob(g, wx + 22, -66, 60, T.windowGlow, 0.9);
    g.fillStyle = T.window; g.fillRect(wx, -88, 44, 42);
    g.strokeStyle = '#3a2418'; g.lineWidth = 4; g.strokeRect(wx, -88, 44, 42);
    g.beginPath(); g.moveTo(wx + 22, -88); g.lineTo(wx + 22, -46);
    g.moveTo(wx, -67); g.lineTo(wx + 44, -67); g.stroke();
  }
  // string lights at night
  if (T.lamp) {
    g.strokeStyle = 'rgba(255,200,120,.35)'; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(-124, -110); g.quadraticCurveTo(0, -84, 124, -110); g.stroke();
    for (let i = 0; i <= 6; i++) {
      const t = i / 6, lx = -124 + 248 * t;
      const ly = -110 - (1 - (2 * t - 1) ** 2) * 26;
      ell(g, lx, ly + 5, 3.4, 3.4, '#ffd47e');
      softBlob(g, lx, ly + 5, 16, 'rgba(255,190,90,.5)', .8);
    }
  }
  g.restore();

  /* --- fence towards the camera --- */
  g.fillStyle = '#9a7a52';
  for (let i = 0; i < 4; i++) {
    const fx = 470 + i * 62, fy = 710 + i * 3;
    g.fillRect(fx, fy - 46 - i * 3, 9, 48 + i * 3);
  }
  g.fillRect(470, 692, 250, 7); g.fillRect(470, 676, 250, 6);
}

/* ==================== LAYER: near meadow (5 m) ====================== */
export function paintMeadowNear(g, T) {
  const r = sr(66);
  const grd = g.createLinearGradient(0, 718, 0, DH + 900);
  grd.addColorStop(0, T.meadowNearA); grd.addColorStop(1, T.meadowNearB);
  g.fillStyle = grd; g.fillRect(-800, 718, 3600, DH + 900 - 718 + 800);

  // soft terrain shading
  for (let i = 0; i < 5; i++) {
    softBlob(g, -600 + r() * 3000, 800 + r() * 500, 180 + r() * 220, 'rgba(0,0,0,.16)', 0.35);
  }
  // grass strokes
  g.lineWidth = 2;
  for (let i = 0; i < 420; i++) {
    const x = -800 + r() * 3600, y = 726 + r() * (DH + 600);
    g.strokeStyle = r() > 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.08)';
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 6, y - 9 - r() * 9); g.stroke();
  }
  // flowers
  if (T.flowers) {
    const cols = ['#ffffff', '#ffd166', '#ff8fa3', '#cdb4ff'];
    for (let i = 0; i < 130; i++) {
      const y = 740 + r() * (DH + 500), s = 2 + (y - 720) / 340 * 4.2;
      ell(g, -800 + r() * 3600, y, s, s, cols[(r() * 4) | 0]);
    }
  }
  // path continues, widening
  g.fillStyle = T.pathA; g.globalAlpha = 0.9;
  g.beginPath();
  g.moveTo(680, 718); g.quadraticCurveTo(740, 900, 830, DH + 800);
  g.lineTo(1010, DH + 800); g.quadraticCurveTo(900, 900, 760, 718);
  g.closePath(); g.fill(); g.globalAlpha = 1;

  // night: lamppost by the path
  if (T.lamp) {
    g.save(); g.translate(985, 980);
    ell(g, 0, 6, 60, 12, 'rgba(255,180,80,.10)');
    g.fillStyle = '#23272e'; g.fillRect(-4, -220, 8, 226);
    g.beginPath(); g.moveTo(-14, -220); g.lineTo(14, -220); g.lineTo(9, -238); g.lineTo(-9, -238); g.closePath(); g.fill();
    softBlob(g, 0, -236, 130, 'rgba(255,190,90,.5)', 0.9);
    ell(g, 0, -231, 7, 8, '#ffdf9e');
    g.restore();
  }
}

/* ==================== LAYER: subject (d metres) ===================== */
/* A 1.75 m person, drawn 1 unit = 1 cm, feet at personGeom(d).baseY.   */
export function paintSubject(g, T, d) {
  const { h, baseY } = personGeom(d);
  const u = h / 175;
  g.save();
  g.translate(800, baseY);
  g.scale(u, u);
  g.translate(0, -175); // y: 0 = top of head … 175 = feet

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
  g.quadraticCurveTo(-9, 88, -6.5, 80);
  g.lineTo(6.5, 80); g.quadraticCurveTo(9, 88, 16, 96);
  g.quadraticCurveTo(17.5, 108, 15, 138);
  g.closePath();
  g.fillStyle = '#f4f1e6'; g.fill();
  g.clip();
  g.fillStyle = '#2e8f83';
  for (let y = 82; y < 140; y += 9) g.fillRect(-20, y, 40, 3.6);
  g.restore();
  // collar
  g.strokeStyle = '#d8d3c2'; g.lineWidth = 1.8;
  g.beginPath(); g.moveTo(-6.5, 80); g.quadraticCurveTo(0, 85, 6.5, 80); g.stroke();

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

  // neck
  g.fillStyle = SKIN; g.fillRect(-3.6, 66, 7.2, 8);
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
export function paintForeground(g, T) {
  const r = sr(88);
  const cols = T.grass;

  // blades across the bottom, radiating slightly
  for (let i = 0; i < 130; i++) {
    const x = -800 + r() * 3600;
    const baseY = DH + 830;
    const hgt = 120 + r() * 300;
    const lean = (r() - 0.5) * 130;
    const w = 5 + r() * 8;
    const c = cols[(r() * 3) | 0];
    g.beginPath();
    g.moveTo(x - w / 2, baseY);
    g.quadraticCurveTo(x + lean * 0.3, baseY - hgt * 0.55, x + lean, baseY - hgt);
    g.quadraticCurveTo(x + lean * 0.3 + w * 0.4, baseY - hgt * 0.5, x + w / 2, baseY);
    g.closePath();
    g.fillStyle = c; g.fill();
  }

  // dandelions — gorgeous bokeh balls when out of focus
  const dande = (dx, dy, s) => {
    g.strokeStyle = '#3f6d33'; g.lineWidth = 4 * s;
    g.beginPath(); g.moveTo(dx, DH + 830); g.quadraticCurveTo(dx + 14 * s, (dy + DH + 830) / 2, dx + 6 * s, dy); g.stroke();
    ell(g, dx + 6 * s, dy, 9 * s, 9 * s, '#e6d69b');
    for (let i = 0; i < 26; i++) {
      const a = (i / 26) * Math.PI * 2 + r() * 0.2;
      const rr = (11 + r() * 13) * s;
      const sx = dx + 6 * s + Math.cos(a) * rr, sy2 = dy + Math.sin(a) * rr;
      g.strokeStyle = 'rgba(248,246,238,.92)'; g.lineWidth = 1.1 * s;
      g.beginPath(); g.moveTo(dx + 6 * s, dy); g.lineTo(sx, sy2); g.stroke();
      ell(g, sx, sy2, 2.1 * s, 2.1 * s, '#faf8f2');
    }
    // a few seeds drifting
    for (let i = 0; i < 4; i++) {
      const fx = dx + 40 * s + r() * 130 * s, fy = dy - 40 * s - r() * 120 * s;
      g.strokeStyle = 'rgba(248,246,238,.5)'; g.lineWidth = 1 * s;
      g.beginPath(); g.moveTo(fx, fy + 10 * s); g.quadraticCurveTo(fx + 5 * s, fy, fx + 12 * s, fy - 8 * s); g.stroke();
      g.beginPath(); g.ellipse(fx + 12 * s, fy - 8 * s, 3.4 * s, 3.4 * s, 0, 0, Math.PI * 2);
      g.strokeStyle = 'rgba(248,246,238,.4)'; g.stroke();
    }
  };
  dande(320, 1180, 1.15);
  dande(1215, 1120, 1.3);
  dande(1500, 1230, 1.0);
  dande(60, 1300, 0.9);
}

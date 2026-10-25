/* =====================================================================
   scenes.ts — extra subjects (dog, car, flower) and places (beach,
   city, forest) for the camera simulator. Painters share the helpers
   and themes exported from scene.ts; every place defines layers at
   real distances so depth-of-field stays physically honest.
   ===================================================================== */

import type { BackgroundDef, SubjectDef, Theme, ThemeKey } from '../types';
import {
  HORIZON, DH, CAM_H, PX_PER_DEG, paintSky,
  sr, ell, poly, softBlob, deg,
} from './scene';

export const SUN_X = 1180, SUN_Y = 268;

/** Screen geometry for a subject `hM` metres tall at distance `d` m. */
export function subjectGeometry(hM: number, d: number) {
  const h = deg(2 * Math.atan(hM / 2 / d)) * PX_PER_DEG;
  const baseY = HORIZON + deg(Math.atan(CAM_H / d)) * PX_PER_DEG;
  return { h, baseY };
}

/* ========================== SUBJECTS ================================ */

/* ------------------------------ dog (0.6 m) ------------------------- */
/* Front-facing sitting shiba inu — simple flat shapes + line work.    */
/* 1 unit = 1 cm, y 0…60.                                              */
function paintShiba(g: CanvasRenderingContext2D, _T: Theme, d: number) {
  const { h, baseY } = subjectGeometry(0.6, d);
  const u = h / 60;
  g.save(); g.translate(800, baseY); g.scale(u, u); g.translate(0, -60);

  const FUR = '#e09a54', FUR_D = '#c07b3c', CREAM = '#f7efe0', INK = '#33251b';

  ell(g, 0, 59, 20, 3.2, 'rgba(0,0,0,.25)');

  // curled tail — one orange loop with a cream core, peeking past the flank
  g.lineCap = 'round';
  g.strokeStyle = FUR_D; g.lineWidth = 5.2;
  g.beginPath(); g.arc(17, 32, 6.2, Math.PI * 0.75, Math.PI * 2.55); g.stroke();
  g.strokeStyle = CREAM; g.lineWidth = 2.4;
  g.beginPath(); g.arc(17, 32, 3.6, Math.PI * 1.05, Math.PI * 2.3); g.stroke();

  // haunches + body
  ell(g, -11, 42, 7.5, 9.5, FUR);
  ell(g, 11, 42, 7.5, 9.5, FUR);
  ell(g, 0, 40, 14.5, 11, FUR);
  ell(g, 0, 45, 7.5, 8.5, CREAM); // chest urajiro

  // front legs — plain columns with cream paws
  for (const lx of [-8.5, 3]) {
    g.fillStyle = FUR;
    g.beginPath(); g.roundRect(lx, 38, 5.5, 19, 2.5); g.fill();
    g.fillStyle = CREAM;
    g.beginPath(); g.roundRect(lx - 0.5, 53.5, 6.5, 4.5, 2); g.fill();
  }

  // head
  ell(g, 0, 13.5, 11.5, 10.5, FUR);

  // ears — upright triangles with cream lining
  poly(g, [[-10.5, 6], [-14, -4], [-4.5, 5]], FUR_D);
  poly(g, [[10.5, 6], [14, -4], [4.5, 5]], FUR_D);
  poly(g, [[-10, 5], [-12, -1], [-6.6, 4.2]], CREAM);
  poly(g, [[10, 5], [12, -1], [6.6, 4.2]], CREAM);

  // urajiro — cream cheeks + muzzle
  ell(g, -5, 16.5, 3.6, 4.6, CREAM);
  ell(g, 5, 16.5, 3.6, 4.6, CREAM);
  ell(g, 0, 18.5, 6.2, 4.8, CREAM);

  // eyes — two ink almonds, one catchlight each
  for (const ex of [-4.6, 4.6]) {
    ell(g, ex, 12.3, 1.3, 1.7, INK);
    ell(g, ex - 0.4, 11.7, 0.4, 0.4, '#fff');
  }

  // nose
  g.fillStyle = INK;
  g.beginPath(); g.ellipse(0, 15.8, 2.2, 1.7, 0, Math.PI, 0); g.fill();

  // the shiba smile — one stroke
  g.strokeStyle = INK; g.lineWidth = 0.9;
  g.beginPath();
  g.moveTo(0, 16.8); g.lineTo(0, 18.4);
  g.moveTo(0, 18.4); g.quadraticCurveTo(-2.2, 20.2, -4.2, 18.6);
  g.moveTo(0, 18.4); g.quadraticCurveTo(2.2, 20.2, 4.2, 18.6);
  g.stroke();

  // collar + tag
  g.strokeStyle = '#c0392b'; g.lineWidth = 2.6;
  g.beginPath(); g.ellipse(0, 22.6, 10.2, 3, 0, 0.15, Math.PI - 0.15); g.stroke();
  ell(g, 0, 25.6, 1.9, 2.1, '#f1c40f');
  ell(g, 0, 25.6, 0.9, 1.1, '#b8860b');

  g.restore();
}

/* ------------------------------ car (1.45 m) ------------------------ */
/* Side-view vintage coupe facing left. x −215…215, y 0 roof…145.      */
function paintCar(g: CanvasRenderingContext2D, T: Theme, d: number) {
  const { h, baseY } = subjectGeometry(1.45, d);
  const u = h / 145;
  g.save(); g.translate(800, baseY); g.scale(u, u); g.translate(0, -145);
  const night = T.key === 'night';
  const RED = '#c94f43', RED_D = '#a53a30', CREAM = '#f2e8d5', CHROME = '#cdd3da';

  ell(g, 0, 141, 205, 9, 'rgba(0,0,0,.28)');

  // headlight beam at night
  if (night) {
    const beam = g.createLinearGradient(-200, 0, -390, 0);
    beam.addColorStop(0, 'rgba(255,236,180,.4)');
    beam.addColorStop(1, 'rgba(255,236,180,0)');
    g.fillStyle = beam;
    g.beginPath(); g.moveTo(-198, 88); g.lineTo(-390, 62); g.lineTo(-390, 122); g.lineTo(-198, 102); g.closePath(); g.fill();
    softBlob(g, -200, 92, 42, 'rgba(255,240,200,.65)', 1);
    softBlob(g, 208, 92, 26, 'rgba(255,80,60,.5)', 1);
  }

  // cabin / roof (two-tone cream top)
  g.fillStyle = CREAM;
  g.beginPath();
  g.moveTo(-98, 70);
  g.quadraticCurveTo(-88, 26, -52, 20);
  g.lineTo(52, 20);
  g.quadraticCurveTo(88, 26, 98, 70);
  g.closePath(); g.fill();
  g.fillStyle = 'rgba(0,0,0,.08)';
  g.fillRect(-98, 62, 196, 8);

  // glass
  const glass = g.createLinearGradient(0, 26, 0, 66);
  glass.addColorStop(0, night ? '#28313f' : '#b8d8e8');
  glass.addColorStop(1, night ? '#161d28' : '#7fa8be');
  poly(g, [[-52, 26], [52, 26], [76, 66], [-74, 66]], '#000');
  g.fillStyle = glass; g.fillRect(-52, 26, 128, 40);
  // driver silhouette
  g.fillStyle = 'rgba(25,28,36,.75)';
  ell(g, 22, 42, 7, 8, 'rgba(25,28,36,.75)');
  poly(g, [[13, 48], [31, 48], [34, 62], [11, 62]], 'rgba(25,28,36,.55)');
  // pillar + chrome trim
  g.fillStyle = CREAM; g.fillRect(-4, 26, 9, 40);
  g.strokeStyle = CHROME; g.lineWidth = 2;
  g.beginPath(); g.moveTo(-52, 26); g.lineTo(52, 26); g.lineTo(76, 66); g.lineTo(-74, 66); g.closePath(); g.stroke();

  // main body
  g.fillStyle = RED;
  g.beginPath(); g.roundRect(-212, 68, 424, 44, [26, 26, 14, 14]);
  g.fill();
  // skirt (two-tone lower band)
  g.fillStyle = CREAM;
  g.beginPath(); g.roundRect(-212, 104, 424, 14, [0, 0, 10, 10]); g.fill();
  g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(-212, 114, 424, 4);

  // body shading + highlight
  g.fillStyle = 'rgba(255,255,255,.22)';
  g.beginPath(); g.roundRect(-196, 71, 392, 8, 4); g.fill();
  g.fillStyle = 'rgba(0,0,0,.15)';
  g.beginPath(); g.roundRect(-206, 96, 412, 6, 3); g.fill();

  // door line + handle
  g.strokeStyle = RED_D; g.lineWidth = 2.2;
  g.beginPath(); g.moveTo(-4, 68); g.quadraticCurveTo(-2, 95, 0, 112); g.stroke();
  g.fillStyle = CHROME;
  g.beginPath(); g.roundRect(8, 80, 15, 4.5, 2); g.fill();
  g.beginPath(); g.roundRect(-30, 80, 15, 4.5, 2); g.fill();

  // side mirror
  g.fillStyle = RED; g.beginPath(); g.roundRect(-72, 38, 12, 7, 3); g.fill();
  g.fillRect(-64, 44, 3, 6);

  // antenna
  g.strokeStyle = '#3a3f47'; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(-140, 22); g.lineTo(-152, -6); g.stroke();

  // bumpers
  g.fillStyle = CHROME;
  g.beginPath(); g.roundRect(-224, 98, 26, 12, 5); g.fill();
  g.beginPath(); g.roundRect(198, 98, 26, 12, 5); g.fill();

  // lights + grill
  ell(g, -200, 88, 7.5, 7.5, night ? '#fff2c8' : '#f4ecd8');
  g.strokeStyle = CHROME; g.lineWidth = 2.4;
  g.beginPath(); g.arc(-200, 88, 7.5, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.4;
  for (const gy of [92, 96, 100]) { g.beginPath(); g.moveTo(-212, gy); g.lineTo(-198, gy); g.stroke(); }
  g.fillStyle = night ? '#ff6a55' : '#b8452f';
  g.beginPath(); g.roundRect(203, 84, 9, 11, 2); g.fill();

  // wheels: arch → tire → hub
  for (const wx of [-118, 118]) {
    ell(g, wx, 118, 30, 30, '#1d1f24');           // arch shadow
    ell(g, wx, 118, 25, 25, '#232630');           // tire
    ell(g, wx, 118, 13.5, 13.5, '#aab2bc');       // hub
    g.strokeStyle = '#7d8791'; g.lineWidth = 3;
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5 - Math.PI / 2;
      g.beginPath(); g.moveTo(wx, 118); g.lineTo(wx + Math.cos(a) * 12, 118 + Math.sin(a) * 12); g.stroke();
    }
    ell(g, wx, 118, 3.4, 3.4, '#4a525c');
  }

  // front badge
  ell(g, -206, 80, 3, 3, CHROME);

  g.restore();
}

/* ----------------------------- flower (1.1 m) ----------------------- */
/* Sunflower in a terracotta pot. y 0 bloom top…110 ground.            */
function paintFlower(g: CanvasRenderingContext2D, _T: Theme, d: number) {
  const { h, baseY } = subjectGeometry(1.1, d);
  const u = h / 110;
  g.save(); g.translate(800, baseY); g.scale(u, u); g.translate(0, -110);

  ell(g, 0, 108, 27, 3.6, 'rgba(0,0,0,.25)');

  // pot
  poly(g, [[-28, 78], [28, 78], [22, 108], [-22, 108]], '#c46a4a');
  poly(g, [[6, 78], [28, 78], [22, 108], [8, 108]], 'rgba(0,0,0,.18)'); // shade side
  g.fillStyle = '#b35c3e';
  g.beginPath(); g.roundRect(-31, 71, 62, 10, 3); g.fill();
  g.fillStyle = 'rgba(255,255,255,.14)';
  g.beginPath(); g.roundRect(-27, 73, 10, 60, 3); g.fill();
  // soil
  ell(g, 0, 73.5, 24, 3.6, '#4a3220');
  ell(g, -6, 72.6, 8, 1.6, 'rgba(90,62,38,.9)');

  // stem
  g.strokeStyle = '#4a7a35'; g.lineWidth = 4; g.lineCap = 'round';
  g.beginPath(); g.moveTo(0, 74); g.quadraticCurveTo(4, 56, 0, 40); g.stroke();

  // leaves
  const leaf = (lx: number, ly: number, rot: number, len: number, w: number) => {
    g.save(); g.translate(lx, ly); g.rotate(rot);
    g.fillStyle = '#5d9440';
    g.beginPath(); g.moveTo(0, 0);
    g.quadraticCurveTo(len * 0.5, -w, len, 0);
    g.quadraticCurveTo(len * 0.5, w, 0, 0);
    g.fill();
    g.strokeStyle = 'rgba(30,60,20,.5)'; g.lineWidth = 0.9;
    g.beginPath(); g.moveTo(1, 0); g.lineTo(len - 2, 0); g.stroke();
    for (let i = 1; i <= 3; i++) {
      const t = i / 4;
      g.beginPath(); g.moveTo(len * t, 0); g.lineTo(len * t + 3, -w * 0.6 * (1 - t)); g.stroke();
    }
    g.restore();
  };
  leaf(-4, 62, -0.5, 26, 7);
  leaf(2, 70, 0.45, 18, 5.5);

  // ladybug on the big leaf
  ell(g, -14, 60, 2.6, 2.2, '#d64541');
  ell(g, -16.2, 59.6, 1, 1, '#26221e');
  g.strokeStyle = '#26221e'; g.lineWidth = 0.5;
  g.beginPath(); g.moveTo(-15.8, 58.6); g.lineTo(-12.4, 61.2); g.stroke();
  ell(g, -14.6, 59.4, 0.4, 0.4, '#26221e');
  ell(g, -13.4, 60.4, 0.4, 0.4, '#26221e');

  // petals — two rings
  const petal = (angle: number, r0: number, r1: number, w: number, fill: string) => {
    g.save(); g.translate(0, 27); g.rotate(angle);
    g.fillStyle = fill;
    g.beginPath(); g.moveTo(0, -r0);
    g.quadraticCurveTo(w, -(r0 + r1) / 2, 0, -r1);
    g.quadraticCurveTo(-w, -(r0 + r1) / 2, 0, -r0);
    g.fill(); g.restore();
  };
  for (let i = 0; i < 14; i++) petal((i / 14) * Math.PI * 2, 9, 27, 5.4, i % 2 ? '#f5a623' : '#ef9a1c');
  for (let i = 0; i < 9; i++) petal((i / 9) * Math.PI * 2 + 0.3, 7.5, 19, 4.6, '#ffc93c');

  // seed disc with fibonacci spiral
  ell(g, 0, 27, 10.8, 10.8, '#7a4a26');
  g.strokeStyle = '#5a361e'; g.lineWidth = 1.6;
  g.beginPath(); g.arc(0, 27, 10, 0, Math.PI * 2); g.stroke();
  for (let i = 0; i < 42; i++) {
    const rr = 1.18 * Math.sqrt(i), a = i * 2.399963;
    ell(g, Math.cos(a) * rr, 27 + Math.sin(a) * rr, 0.85, 0.85, i % 3 ? '#5a361e' : '#8a5a30');
  }
  g.strokeStyle = 'rgba(255,235,200,.5)'; g.lineWidth = 1.8;
  g.beginPath(); g.arc(0, 27, 8.4, Math.PI * 1.05, Math.PI * 1.55); g.stroke();

  g.restore();
}

export const SUBJECTS: Record<'dog' | 'car' | 'flower', SubjectDef> = {
  dog:    { h: 0.6,  minDist: 1,   paint: paintShiba },
  car:    { h: 1.45, minDist: 4, suggestDist: 7, paint: paintCar },
  flower: { h: 1.1,  minDist: 1.2, paint: paintFlower },
};

/* ========================== PLACES ================================== */

/* ------------------------------- BEACH ------------------------------ */
interface BeachPal {
  seaA: string; seaB: string; glitter: string | null; island: string;
  sandA: string; sandB: string; wet: string; dune: string;
  palm: [string, string, string]; trunk: string; lamp: boolean;
}
const beachPal: Record<ThemeKey, BeachPal> = {
  golden:    { seaA: '#57b2cc', seaB: '#9ad8e4', glitter: 'rgba(255,240,180,.95)', island: '#5b7f94',
               sandA: '#eed8a6', sandB: '#dfc188', wet: '#d8c391', dune: '#cdb47e',
               palm: ['#4e8f4f', '#69a866', '#3d7a40'], trunk: '#8a6a4a', lamp: false },
  overcast:  { seaA: '#8fa9b4', seaB: '#bdd0d6', glitter: null, island: '#7d94a1',
               sandA: '#d5caad', sandB: '#c3b698', wet: '#bdb294', dune: '#b8ad8e',
               palm: ['#5a8a5e', '#73997a', '#4a7a50'], trunk: '#7d6852', lamp: false },
  night:     { seaA: '#1d3450', seaB: '#0f1f33', glitter: 'rgba(210,225,255,.7)', island: '#0d1826',
               sandA: '#5c5346', sandB: '#463f35', wet: '#3a3a44', dune: '#3f3a30',
               palm: ['#1e3d2a', '#2a4f36', '#16301f'], trunk: '#4a3d30', lamp: true },
};

function paintBeachSea(g: CanvasRenderingContext2D, T: Theme) {
  const P = beachPal[T.key];
  paintSky(g, T);
  const grd = g.createLinearGradient(0, HORIZON, 0, 565);
  grd.addColorStop(0, P.seaA); grd.addColorStop(1, P.seaB);
  g.fillStyle = grd; g.fillRect(-800, HORIZON, 3600, 106);
  // horizon kiss
  g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(-800, HORIZON, 3600, 2);
  // glitter path under the sun/moon
  if (P.glitter) {
    const r = sr(31);
    for (let i = 0; i < 60; i++) {
      const y = HORIZON + 3 + r() * 98;
      const spread = (y - HORIZON) * 1.3 + 8;
      g.globalAlpha = 0.2 + r() * 0.6;
      g.fillStyle = P.glitter;
      g.fillRect(SUN_X + (r() - 0.5) * spread * 2, y, 6 + r() * 30, 1.6 + r() * 1.8);
    }
    g.globalAlpha = 1;
  }
  // wave lines
  g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 1.6;
  const r2 = sr(32);
  for (let i = 0; i < 30; i++) {
    const y = HORIZON + 8 + r2() * 92, x = -800 + r2() * 3600, w = 40 + r2() * 110;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y + 3.5, x + w, y); g.stroke();
  }
  // distant islands
  for (const [ix, iw, ih] of [[-420, 220, 26], [2050, 300, 34]]) {
    ell(g, ix, HORIZON + 4, iw / 2, ih, P.island);
    ell(g, ix + iw / 4, HORIZON - ih * 0.75, 6, 10, P.island); // island palm
  }
  // little sailboat
  g.save(); g.translate(1340, HORIZON + 34);
  g.fillStyle = 'rgba(40,48,60,.95)';
  g.beginPath(); g.moveTo(-22, 0); g.quadraticCurveTo(0, 10, 22, 0); g.closePath(); g.fill();
  g.fillStyle = 'rgba(250,250,248,.95)';
  poly(g, [[2, -2], [2, -40], [22, -2]], 'rgba(250,250,248,.95)');
  poly(g, [[-3, -2], [-3, -32], [-18, -2]], 'rgba(250,250,248,.85)');
  g.fillStyle = '#c0392b'; g.fillRect(1, -44, 12, 5);
  g.restore();
}

function paintBeachDunes(g: CanvasRenderingContext2D, T: Theme) {
  const P = beachPal[T.key];
  const r = sr(45);
  // dune mounds
  for (const [dx2, dw, dh] of [[-300, 1300, 60], [900, 1500, 80], [2100, 1100, 55]]) {
    ell(g, dx2, 596, dw / 2, dh, P.dune);
  }
  ell(g, 300, 614, 900, 44, P.sandA);
  // dune grass tufts
  g.lineWidth = 2;
  for (let i = 0; i < 70; i++) {
    const x = -800 + r() * 3600, y = 570 + r() * 46;
    g.strokeStyle = P.palm[(r() * 3) | 0];
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (r() - .5) * 10, y - 12 - r() * 10, x + (r() - .5) * 20, y - 20 - r() * 14); g.stroke();
  }

  // palm tree
  const palm = (px: number, size: number, flip: boolean) => {
    g.save(); g.translate(px, 640); g.scale(flip ? -size : size, size);
    g.strokeStyle = P.trunk; g.lineWidth = 13; g.lineCap = 'round';
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(18, -110, 44, -218); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 3;
    for (let i = 1; i <= 5; i++) {
      const t = i / 6;
      g.beginPath(); g.moveTo(18 * t * t + 4, -218 * t - 3); g.lineTo(18 * t * t + 10, -218 * t - 3); g.stroke();
    }
    const cx2 = 44, cy2 = -218;
    for (const c of [[-2, -6], [3, -7]]) ell(g, cx2 + c[0], cy2 + c[1], 6, 6, '#6b4a2e');
    for (let i = 0; i < 9; i++) {
      const a = -Math.PI * 0.95 + (i / 8) * Math.PI * 0.92;
      const frondLen = 78 + r() * 30;
      const tipX = cx2 + Math.cos(a) * frondLen, tipY = cy2 + Math.sin(a) * frondLen * 0.75 + 26;
      g.strokeStyle = P.palm[i % 3]; g.lineWidth = 3;
      g.beginPath(); g.moveTo(cx2, cy2); g.quadraticCurveTo((cx2 + tipX) / 2, Math.min(cy2, tipY) - 18, tipX, tipY); g.stroke();
      g.lineWidth = 1.4;
      for (let t = 0.15; t <= 0.95; t += 0.1) {
        const nx = cx2 + (tipX - cx2) * t, ny = cy2 + (-18 * Math.sin(Math.PI * t)) + (tipY - cy2) * t;
        g.strokeStyle = P.palm[(i + 1) % 3];
        g.beginPath(); g.moveTo(nx, ny); g.lineTo(nx - 7, ny - 4); g.stroke();
        g.beginPath(); g.moveTo(nx, ny); g.lineTo(nx + 7, ny - 4); g.stroke();
      }
    }
    g.restore();
  };
  palm(180, 1, false);
  palm(1480, 0.85, true);

  // striped beach umbrella
  g.save(); g.translate(1240, 636); g.rotate(-0.12);
  ell(g, 0, 4, 60, 8, 'rgba(0,0,0,.18)');
  g.strokeStyle = '#8a6a4a'; g.lineWidth = 5;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -110); g.stroke();
  for (let i = 0; i < 8; i++) {
    g.fillStyle = i % 2 ? '#f4f1e6' : '#d1495b';
    g.beginPath(); g.moveTo(0, -108);
    g.arc(0, -108, 78, Math.PI + (i / 8) * Math.PI, Math.PI + ((i + 1) / 8) * Math.PI);
    g.closePath(); g.fill();
  }
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2;
  g.beginPath(); g.arc(0, -108, 78, Math.PI, Math.PI * 2); g.stroke();
  ell(g, 0, -110, 4, 4, '#8a6a4a');
  g.restore();
}

function paintBeachSand(g: CanvasRenderingContext2D, T: Theme) {
  const P = beachPal[T.key];
  const r = sr(46);
  const grd = g.createLinearGradient(0, 618, 0, DH + 900);
  grd.addColorStop(0, P.sandA); grd.addColorStop(1, P.sandB);
  g.fillStyle = grd; g.fillRect(-800, 618, 3600, DH + 900 - 618 + 800);
  // wet sheen near the waterline
  const wet = g.createLinearGradient(0, 618, 0, 700);
  wet.addColorStop(0, P.wet); wet.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = wet; g.fillRect(-800, 618, 3600, 82);
  // foam scallops
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3;
  for (let i = 0; i < 5; i++) {
    const y = 624 + i * 10;
    g.beginPath();
    for (let x = -800; x < 2800; x += 60) g.quadraticCurveTo(x + 30, y + 5, x + 60, y);
    g.stroke();
  }
  // sand speckles
  for (let i = 0; i < 500; i++) {
    const x = -800 + r() * 3600, y = 640 + r() * (DH + 600);
    g.fillStyle = r() > 0.5 ? 'rgba(255,255,255,.16)' : 'rgba(120,95,60,.14)';
    g.fillRect(x, y, 1.6 + r() * 1.6, 1.2 + r() * 1.2);
  }
  // footprints
  g.fillStyle = 'rgba(120,95,60,.2)';
  for (let i = 0; i < 9; i++) {
    const t = i / 8, x = 500 + t * 260, y = 700 + t * 300;
    ell(g, x, y, 5 - t * 2, 8 - t * 3, 'rgba(120,95,60,.2)');
    ell(g, x + 16, y + 26, 5 - t * 2, 8 - t * 3, 'rgba(120,95,60,.16)');
  }
  // shells
  const shell = (sx: number, sy: number, s: number) => {
    g.save(); g.translate(sx, sy); g.rotate(s);
    g.fillStyle = '#f2e3d0';
    g.beginPath(); g.ellipse(0, 0, 12, 9, 0, Math.PI, 0); g.fill();
    g.strokeStyle = 'rgba(160,120,90,.5)'; g.lineWidth = 1;
    for (const a of [-0.5, 0, 0.5]) {
      g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(a) * 11, -Math.cos(a) * 8); g.stroke();
    }
    g.restore();
  };
  shell(950, 850, 0.3); shell(1120, 1000, -0.4); shell(240, 900, 0.1);
}

function paintBeachFg(g: CanvasRenderingContext2D, T: Theme) {
  const P = beachPal[T.key];
  const r = sr(47);
  // dune grass cluster, bottom-left
  for (let i = 0; i < 46; i++) {
    const x = -160 + r() * 520;
    const hgt = 220 + r() * 380;
    const lean = (r() - 0.5) * 240;
    const w = 6 + r() * 7;
    g.beginPath();
    g.moveTo(x - w / 2, DH + 850);
    g.quadraticCurveTo(x + lean * 0.3, DH + 850 - hgt * 0.6, x + lean, DH + 850 - hgt);
    g.quadraticCurveTo(x + lean * 0.3 + w * 0.4, DH + 850 - hgt * 0.55, x + w / 2, DH + 850);
    g.closePath();
    g.fillStyle = P.palm[(r() * 3) | 0]; g.fill();
  }
  // beach ball, bottom-right
  g.save(); g.translate(1420, 1020);
  ell(g, 0, 46, 96, 12, 'rgba(0,0,0,.15)');
  const cols = ['#e74c3c', '#f4f1e6', '#3498db', '#f4f1e6', '#f1c40f', '#f4f1e6'];
  for (let i = 0; i < 6; i++) {
    g.fillStyle = cols[i];
    g.beginPath(); g.moveTo(0, -84);
    g.arc(0, -84, 88, Math.PI / 2 + (i / 6) * Math.PI, Math.PI / 2 + ((i + 1) / 6) * Math.PI);
    g.closePath(); g.fill();
  }
  g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 2;
  g.beginPath(); g.arc(0, -84, 88, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 5;
  g.beginPath(); g.arc(0, -84, 72, Math.PI * 1.15, Math.PI * 1.5); g.stroke();
  g.restore();
  // starfish
  g.save(); g.translate(760, 1200); g.rotate(0.4);
  g.fillStyle = '#e08a5a';
  g.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5 - Math.PI / 2;
    const a2 = a + Math.PI / 5;
    g.lineTo(Math.cos(a) * 42, Math.sin(a) * 42);
    g.lineTo(Math.cos(a2) * 16, Math.sin(a2) * 16);
  }
  g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.25)';
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5 - Math.PI / 2;
    g.fillRect(Math.cos(a) * 22 - 1.5, Math.sin(a) * 22 - 1.5, 3, 3);
  }
  g.restore();
}

/* -------------------------------- CITY ------------------------------ */
interface CityPal {
  skyline: string; towerA: string; towerB: string; towerGlass: string;
  winHi: string; winLo: string; winDim: string;
  shop: string; shopB: string; awningA: string; awningB: string;
  road: string; roadLine: string; walk: string; curb: string;
  neon: boolean; lampGlow: string | null; hydrant: string;
}
const cityPal: Record<ThemeKey, CityPal> = {
  golden:   { skyline: '#5f7ba0', towerA: '#7d8fa8', towerB: '#93a3b8', towerGlass: '#8fb0c8',
              winHi: '#ffe2a8', winLo: '#7c8aa0', winDim: '#3d4a5c',
              shop: '#9a7a5e', shopB: '#8a6a50', awningA: '#c95f4e', awningB: '#f4f1e6',
              road: '#5a5e68', roadLine: 'rgba(250,245,220,.75)', walk: '#8a8d95', curb: '#4c4f58',
              neon: false, lampGlow: null, hydrant: '#c0392b' },
  overcast: { skyline: '#8b98a6', towerA: '#a3aebb', towerB: '#b7c1cb', towerGlass: '#b9c6d0',
              winHi: '#dfe6ec', winLo: '#c3ccd4', winDim: '#5d6873',
              shop: '#8d8578', shopB: '#7d7568', awningA: '#8a6a62', awningB: '#d8d4c8',
              road: '#6b6f78', roadLine: 'rgba(255,255,255,.7)', walk: '#9aa0a8', curb: '#5a5e66',
              neon: false, lampGlow: null, hydrant: '#a93226' },
  night:    { skyline: '#131b2c', towerA: '#1c2740', towerB: '#243052', towerGlass: '#2a3a5e',
              winHi: '#ffd47e', winLo: '#f2e2b8', winDim: '#101828',
              shop: '#2a2e3a', shopB: '#232734', awningA: '#5e3a3a', awningB: '#3a3f4c',
              road: '#20242e', roadLine: 'rgba(240,235,210,.8)', walk: '#39404e', curb: '#171b24',
              neon: true, lampGlow: 'rgba(255,190,90,.5)', hydrant: '#8e2b20' },
};

function paintCityBackdrop(g: CanvasRenderingContext2D, T: Theme) {
  const P = cityPal[T.key];
  paintSky(g, T);
  const r = sr(21);
  // far skyline silhouette
  let x = -800;
  while (x < 2800) {
    const w = 70 + r() * 130, h = 120 + r() * 200;
    g.fillStyle = P.skyline;
    g.fillRect(x, HORIZON - h, w, h + 10);
    if (r() > 0.6) { // water tower / antenna
      g.fillRect(x + w * 0.3, HORIZON - h - 16, 4, 16);
      ell(g, x + w * 0.3 + 2, HORIZON - h - 18, 7, 6, P.skyline);
    }
    if (P.neon) {
      g.fillStyle = 'rgba(255,220,140,.5)';
      for (let i = 0; i < 8; i++) if (r() < 0.28) g.fillRect(x + 6 + r() * (w - 12), HORIZON - h + 8 + r() * (h - 20), 2.4, 3);
    }
    x += w + 8 + r() * 30;
  }
  const hz = g.createLinearGradient(0, 260, 0, HORIZON);
  hz.addColorStop(0, 'rgba(0,0,0,0)');
  hz.addColorStop(1, T.key === 'night' ? 'rgba(10,16,30,.35)' : 'rgba(240,220,180,.22)');
  g.fillStyle = hz; g.fillRect(-800, 260, 3600, HORIZON - 260);
  // far cross-street band fills the horizon gap between towers
  const fb = g.createLinearGradient(0, HORIZON, 0, HORIZON + 80);
  fb.addColorStop(0, P.walk); fb.addColorStop(1, P.road);
  g.fillStyle = fb; g.fillRect(-800, HORIZON - 2, 3600, 84);
  g.fillStyle = P.roadLine;
  for (let i = 0; i < 9; i++) {
    if (r() < 0.5) continue;
    const cx2 = -700 + r() * 3000, cw = 10 + r() * 14;
    g.globalAlpha = 0.5 + r() * 0.4;
    g.fillRect(cx2, HORIZON + 16 + r() * 34, cw, 3.5); // distant traffic
  }
  g.globalAlpha = 1;
}

function paintCityTowers(g: CanvasRenderingContext2D, T: Theme) {
  const P = cityPal[T.key];
  const r = sr(22);
  const towers = [[-560, 130, 300], [-360, 170, 380], [-140, 110, 240], [40, 150, 340],
                  [230, 120, 260], [420, 160, 400], [620, 130, 300], [830, 175, 380], [1060, 135, 280]];
  for (const [tx, tw, th] of towers) {
    const top = HORIZON + 6 - th;
    g.fillStyle = r() > 0.5 ? P.towerA : P.towerB;
    g.fillRect(tx, top, tw, th);
    // glass accent strip
    if (r() > 0.45) {
      const gl = g.createLinearGradient(tx, top, tx + tw, top + th);
      gl.addColorStop(0, P.towerGlass); gl.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gl; g.fillRect(tx + tw * 0.12, top, tw * 0.3, th);
    }
    // window grid
    const cols = Math.max(3, Math.floor(tw / 22)), rows = Math.floor(th / 26);
    for (let c = 0; c < cols; c++) for (let rw = 0; rw < rows; rw++) {
      const wx = tx + 8 + c * (tw - 16) / cols, wy = top + 10 + rw * (th - 14) / rows;
      if (P.neon) g.fillStyle = r() < 0.34 ? (r() < 0.3 ? P.winHi : '#bcd2f0') : P.winDim;
      else g.fillStyle = wy < top + th * 0.45 ? P.winHi : P.winLo;
      g.fillRect(wx, wy, (tw - 16) / cols - 6, (th - 14) / rows - 9);
    }
    // roof box + antenna
    g.fillStyle = 'rgba(0,0,0,.25)';
    g.fillRect(tx + tw * 0.2, top - 14, tw * 0.25, 14);
    g.strokeStyle = 'rgba(30,35,48,.8)'; g.lineWidth = 2.4;
    g.beginPath(); g.moveTo(tx + tw * 0.72, top); g.lineTo(tx + tw * 0.72, top - 34); g.stroke();
    if (P.neon) ell(g, tx + tw * 0.72, top - 36, 3, 3, '#ff5f5f');
  }
}

function paintCityShops(g: CanvasRenderingContext2D, T: Theme) {
  const P = cityPal[T.key];
  const r = sr(23);
  const base = 528;
  const shops = [[-720, 340], [-380, 300], [-60, 360], [320, 310], [660, 350], [1040, 300], [1400, 340]];
  for (const [sx, sw] of shops) {
    const sh = 150 + r() * 60, top = base - sh;
    g.fillStyle = r() > 0.5 ? P.shop : P.shopB;
    g.fillRect(sx, top, sw, sh);
    g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(sx, top, sw, 10);
    g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(sx + sw * 0.08, top + 14, sw * 0.1, sh - 26);
    // cornice
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(sx - 6, top - 8, sw + 12, 10);
    // big storefront window
    const wx = sx + 18, ww = sw * 0.55, wy = base - 78;
    g.fillStyle = P.neon ? '#f8c87a' : T.key === 'overcast' ? '#39434e' : '#4e6070';
    g.fillRect(wx, wy, ww, 62);
    g.strokeStyle = 'rgba(20,24,32,.6)'; g.lineWidth = 4;
    g.strokeRect(wx, wy, ww, 62);
    g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + 62); g.stroke();
    if (P.neon) { // silhouette browsing inside
      g.fillStyle = 'rgba(40,30,20,.7)';
      ell(g, wx + ww * 0.32, wy + 26, 9, 12, 'rgba(40,30,20,.7)');
      g.fillRect(wx + ww * 0.32 - 12, wy + 36, 24, 26);
    }
    // door
    g.fillStyle = P.neon ? '#e8b56a' : '#3a4450';
    g.fillRect(sx + sw * 0.72, base - 74, 34, 74);
    g.strokeStyle = 'rgba(20,24,32,.6)'; g.lineWidth = 3;
    g.strokeRect(sx + sw * 0.72, base - 74, 34, 74);
    // awning
    const ay = base - 86;
    g.fillStyle = P.awningA;
    g.beginPath(); g.moveTo(sx + 8, ay); g.lineTo(sx + sw - 8, ay);
    g.lineTo(sx + sw - 16, ay + 26); g.lineTo(sx + 16, ay + 26); g.closePath(); g.fill();
    g.fillStyle = P.awningB;
    const seg = (sw - 32) / 6;
    for (let i = 0; i < 6; i += 2) {
      g.beginPath();
      g.moveTo(sx + 16 + i * seg, ay + 26); g.lineTo(sx + 16 + (i + 1) * seg, ay + 26);
      g.lineTo(sx + 10 + (i + 1) * seg * (sw - 16) / (sw - 32), ay);
      g.lineTo(sx + 8 + i * seg, ay);
      g.closePath(); g.fill();
    }
    // neon signs at night
    if (P.neon) {
      const neonCols = ['#ff5f8a', '#4fd6c8', '#ffd166'];
      const nc = neonCols[(r() * 3) | 0];
      const nx = sx + 24, ny = top + 26;
      softBlob(g, nx + 34, ny + 12, 60, nc, 0.35);
      g.strokeStyle = nc; g.lineWidth = 3.4;
      g.beginPath(); g.roundRect(nx, ny, 68, 26, 8); g.stroke();
      g.fillStyle = nc; g.font = 'bold 17px sans-serif';
      g.fillText(r() > 0.5 ? 'OPEN' : 'CAFÉ', nx + 12, ny + 19);
      // vertical sign
      const vc = neonCols[(r() * 3) | 0];
      g.strokeStyle = vc; g.lineWidth = 3;
      g.beginPath(); g.roundRect(sx + sw - 26, top + 34, 18, 74, 5); g.stroke();
      ell(g, sx + sw - 17, top + 42, 3, 3, vc);
    }
  }
  // street lamps on the sidewalk
  for (const lx of [-240, 380, 1000, 1620]) {
    g.save(); g.translate(lx, base);
    g.fillStyle = '#1d222c';
    g.fillRect(-3, -170, 6, 170);
    g.beginPath(); g.moveTo(-3, -170); g.lineTo(-30, -170); g.lineTo(-30, -162); g.lineTo(3, -162); g.closePath(); g.fill();
    if (P.lampGlow) {
      softBlob(g, -30, -158, 66, P.lampGlow, 1);
      ell(g, -30, -158, 7, 9, '#ffe1a0');
    } else {
      ell(g, -30, -158, 7, 9, '#d8dde4');
    }
    g.restore();
  }
}

function paintCityStreet(g: CanvasRenderingContext2D, T: Theme) {
  const P = cityPal[T.key];
  const vp = HORIZON + 8;               // vanishing y
  const halfAt = (y: number) => 14 + (y - vp) * (260 - 14) / (1900 - vp);
  // ground plane: sidewalks fill everything below the shop line
  g.fillStyle = P.walk;
  g.fillRect(-800, 526, 3600, DH + 900 - 526 + 400);
  g.fillStyle = 'rgba(0,0,0,.2)';
  g.fillRect(-800, 526, 3600, 3);       // building baseline
  // sidewalk shading near the road
  g.fillStyle = 'rgba(255,255,255,.05)';
  g.beginPath();
  g.moveTo(800 - halfAt(1900) - 420, 1900); g.lineTo(800 - halfAt(vp) - 30, vp);
  g.lineTo(800 - halfAt(vp) - 4, vp); g.lineTo(800 - halfAt(1900) - 60, 1900);
  g.closePath(); g.fill();
  g.beginPath();
  g.moveTo(800 + halfAt(1900) + 420, 1900); g.lineTo(800 + halfAt(vp) + 30, vp);
  g.lineTo(800 + halfAt(vp) + 4, vp); g.lineTo(800 + halfAt(1900) + 60, 1900);
  g.closePath(); g.fill();
  // road
  g.fillStyle = P.road;
  poly(g, [[800 - halfAt(vp), vp], [800 + halfAt(vp), vp], [800 + halfAt(1900), 1900], [800 - halfAt(1900), 1900]], P.road);
  // curbs
  g.strokeStyle = P.curb; g.lineWidth = 4;
  g.beginPath(); g.moveTo(800 - halfAt(vp) - 2, vp); g.lineTo(800 - halfAt(1900) - 26, 1900); g.stroke();
  g.beginPath(); g.moveTo(800 + halfAt(vp) + 2, vp); g.lineTo(800 + halfAt(1900) + 26, 1900); g.stroke();
  // center dashes
  g.fillStyle = P.roadLine;
  let y = vp + 14;
  while (y < 1900) {
    const len = 10 + (y - vp) / 9, w = 2.5 + (y - vp) / 160;
    g.globalAlpha = 0.5 + Math.min(0.5, (y - vp) / 900);
    g.fillRect(800 - w / 2, y, w, len);
    y += len * 2.1;
  }
  g.globalAlpha = 1;
  // side lane lines
  g.strokeStyle = P.roadLine; g.lineWidth = 2;
  g.beginPath(); g.moveTo(800 - halfAt(vp) * 0.55, vp + 6); g.lineTo(800 - halfAt(1900) * 0.55, 1900); g.stroke();
  g.beginPath(); g.moveTo(800 + halfAt(vp) * 0.55, vp + 6); g.lineTo(800 + halfAt(1900) * 0.55, 1900); g.stroke();
  // crosswalk
  g.fillStyle = P.roadLine;
  for (let i = -2; i <= 2; i++) {
    g.save(); g.translate(800 + i * 34, 700); g.rotate(0.05);
    g.fillRect(-6, 0, 13, 52);
    g.restore();
  }
  // manholes
  for (const [mx, my] of [[680, 760], [940, 940]]) {
    ell(g, mx, my, 20, 7, '#2c313b');
    g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 1.6;
    g.beginPath(); g.ellipse(mx, my, 15, 5, 0, 0, Math.PI * 2); g.stroke();
  }
  // sidewalk paving joints
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1.6;
  for (let sy2 = vp + 20; sy2 < 1900; sy2 += 46 + (sy2 - vp) / 14) {
    const off = halfAt(sy2) + 26;
    g.beginPath(); g.moveTo(800 - off - 0, sy2); g.lineTo(800 - off - 30 - (sy2 - vp) / 8, sy2 + 10); g.stroke();
    g.beginPath(); g.moveTo(800 + off, sy2); g.lineTo(800 + off + 30 + (sy2 - vp) / 8, sy2 + 10); g.stroke();
  }
  if (P.lampGlow) {
    // light pools from the lamps
    for (const lx of [-240, 380, 1000, 1620]) {
      const py = 660 + Math.abs(lx - 380) * 0.06;
      ell(g, lx - 10, py, 90, 20, 'rgba(255,190,90,.08)');
    }
  }
}

function paintCityFg(g: CanvasRenderingContext2D, T: Theme) {
  const P = cityPal[T.key];
  // fire hydrant, bottom-left
  g.save(); g.translate(250, 1060);
  ell(g, 0, 8, 30, 7, 'rgba(0,0,0,.3)');
  g.fillStyle = P.hydrant;
  g.beginPath(); g.roundRect(-14, -78, 28, 82, 8); g.fill();
  g.beginPath(); g.arc(0, -80, 15, Math.PI, 0); g.fill();
  g.fillRect(-20, -60, 40, 9);
  ell(g, -22, -56, 6, 6, P.hydrant);
  ell(g, 22, -56, 6, 6, P.hydrant);
  ell(g, 0, -96, 5, 5, '#e8c79a');
  g.fillStyle = 'rgba(255,255,255,.18)';
  g.beginPath(); g.roundRect(-13, -76, 7, 74, 4); g.fill();
  g.restore();
  // parking meter, right
  g.save(); g.translate(1380, 1075);
  ell(g, 0, 6, 22, 6, 'rgba(0,0,0,.3)');
  g.fillStyle = '#2a2f38'; g.fillRect(-4, -150, 8, 150);
  g.fillStyle = '#3a414d';
  g.beginPath(); g.roundRect(-16, -196, 32, 50, 6); g.fill();
  g.fillStyle = T.key === 'night' ? '#9fe8d8' : '#c8e8d8';
  g.fillRect(-11, -190, 22, 22);
  g.fillStyle = '#23272f'; g.fillRect(-11, -163, 22, 5);
  ell(g, 0, -138, 4, 4, '#23272f');
  g.restore();
  // pigeon
  g.save(); g.translate(920, 1010);
  g.fillStyle = '#8d95a8';
  ell(g, 0, 0, 26, 17, '#8d95a8');
  ell(g, 18, -12, 9, 8, '#7d8598');
  ell(g, 24, -14, 4, 3.4, '#3a3f4c');
  ell(g, 25.5, -13, 1.6, 1.6, '#d8a548');
  g.fillStyle = '#6d7588';
  poly(g, [[-24, -2], [-44, -12], [-40, 4]], '#6d7588');
  g.strokeStyle = '#d8a548'; g.lineWidth = 2.4;
  g.beginPath(); g.moveTo(20, 8); g.lineTo(22, 15); g.moveTo(8, 8); g.lineTo(8, 15); g.stroke();
  ell(g, 0, 2, 8, 4, 'rgba(255,255,255,.25)');
  g.restore();
}

/* ------------------------------- FOREST ----------------------------- */
interface ForestPal {
  backGlow: string; mist: string; wallA: string; wallB: string;
  firFar: string; firMid: string; trunkMid: string;
  floorA: string; floorB: string; litter: string;
  fern: [string, string, string]; birch: string; birchDash: string;
  shafts: boolean; fireflies: boolean;
}
const forestPal: Record<ThemeKey, ForestPal> = {
  golden:   { backGlow: '#f6e2b0', mist: 'rgba(255,236,190,.4)', wallA: '#87a88a', wallB: '#6f9479',
              firFar: '#5d8468', firMid: '#3e6350', trunkMid: '#6b5644',
              floorA: '#7d9c50', floorB: '#567a38', litter: 'rgba(120,90,40,.35)',
              fern: ['#5d9440', '#71a84e', '#4a7c34'], birch: '#e8e4d4', birchDash: '#33332c',
              shafts: true, fireflies: false },
  overcast: { backGlow: '#cdd6d2', mist: 'rgba(220,228,232,.5)', wallA: '#87a08e', wallB: '#6e8a7a',
              firFar: '#5c7a68', firMid: '#40584c', trunkMid: '#5d5044',
              floorA: '#6d8552', floorB: '#4c6238', litter: 'rgba(100,80,45,.4)',
              fern: ['#57874a', '#69985c', '#46723c'], birch: '#dcdad0', birchDash: '#3a3a34',
              shafts: false, fireflies: false },
  night:    { backGlow: '#1c2a44', mist: 'rgba(18,28,44,.55)', wallA: '#1f3230', wallB: '#16261f',
              firFar: '#172a24', firMid: '#101d18', trunkMid: '#2c2620',
              floorA: '#22331f', floorB: '#131e0f', litter: 'rgba(30,24,12,.5)',
              fern: ['#1d3a26', '#25452e', '#142818'], birch: '#8d8a7c', birchDash: '#26241e',
              shafts: false, fireflies: true },
};

function paintForestBackdrop(g: CanvasRenderingContext2D, T: Theme) {
  const P = forestPal[T.key];
  const r = sr(61);
  const grd = g.createLinearGradient(0, -700, 0, HORIZON + 60);
  grd.addColorStop(0, T.sky[0]);
  grd.addColorStop(0.7, P.backGlow);
  grd.addColorStop(1, P.wallB);
  g.fillStyle = grd; g.fillRect(-800, -700, 3600, DH + 1600); // down past the frame
  if (T.stars) {
    for (let i = 0; i < 90; i++) {
      const x = -800 + r() * 3600, y = -700 + r() * 800;
      g.globalAlpha = 0.1 + r() * 0.5; g.fillStyle = '#dfe8ff';
      g.fillRect(x, y, 1.2, 1.2);
    }
    g.globalAlpha = 1;
  }
  // far canopy wall (jagged)
  g.fillStyle = P.wallA;
  g.beginPath(); g.moveTo(-800, HORIZON + 40);
  let x = -800;
  while (x < 2800) {
    const w = 40 + r() * 90, h = 60 + r() * 160;
    g.lineTo(x + w / 2, HORIZON + 20 - h);
    g.lineTo(x + w, HORIZON + 10 - h * 0.4);
    x += w;
  }
  g.lineTo(2800, HORIZON + 40); g.closePath(); g.fill();
  // faint trunks in the mist
  g.fillStyle = P.wallB;
  for (let i = 0; i < 14; i++) {
    const tx = -800 + r() * 3600;
    g.fillRect(tx, HORIZON - 60 - r() * 80, 10 + r() * 8, 140);
  }
  const mg = g.createLinearGradient(0, HORIZON - 160, 0, HORIZON + 40);
  mg.addColorStop(0, 'rgba(0,0,0,0)'); mg.addColorStop(1, P.mist);
  g.fillStyle = mg; g.fillRect(-800, HORIZON - 160, 3600, 200);
  // god rays
  if (P.shafts) {
    for (const [sx2, sw2] of [[240, 90], [620, 130], [1060, 70], [1420, 110]]) {
      g.fillStyle = 'rgba(255,242,200,.09)';
      poly(g, [[sx2, -700], [sx2 + sw2, -700], [sx2 + sw2 * 2.4 + 160, HORIZON + 30], [sx2 + sw2 * 2.4 - 60, HORIZON + 30]], 'rgba(255,242,200,.09)');
    }
  }
}

function fir(g: CanvasRenderingContext2D, x: number, base: number, h: number, w: number, color: string) {
  // x = center, base = ground line, h = tree height, w ≈ half-width at the base
  g.fillStyle = color;
  g.beginPath(); g.moveTo(x, base - h);
  for (let i = 0; i < 4; i++) {
    const t0 = 0.2 + i * 0.2, t1 = t0 + 0.05;
    g.lineTo(x + w * t0, base - h * t0);   // out to a tier tip
    g.lineTo(x + w * t1, base - h * t1);   // down to the tier base
  }
  g.lineTo(x + w * 0.95, base - 6);
  g.lineTo(x - w * 0.95, base - 6);
  for (let i = 3; i >= 0; i--) {
    const t0 = 0.2 + i * 0.2, t1 = t0 + 0.05;
    g.lineTo(x - w * t1, base - h * t1);
    g.lineTo(x - w * t0, base - h * t0);
  }
  g.closePath(); g.fill();
  // right-side shading
  g.fillStyle = 'rgba(0,0,0,.2)';
  g.beginPath(); g.moveTo(x, base - h);
  for (let i = 0; i < 4; i++) {
    const t0 = 0.2 + i * 0.2, t1 = t0 + 0.05;
    g.lineTo(x + w * t0 * 0.45, base - h * t0);
    g.lineTo(x + w * t1 * 0.45, base - h * t1);
  }
  g.lineTo(x + w * 0.42, base - 6); g.lineTo(x, base - 6);
  g.closePath(); g.fill();
  g.fillStyle = '#4a3a2c';
  g.fillRect(x - w * 0.06, base - 8, w * 0.12, 10);
}

function paintForestFar(g: CanvasRenderingContext2D, T: Theme) {
  const P = forestPal[T.key];
  const r = sr(62);
  for (let i = 0; i < 16; i++) {
    fir(g, -700 + i * 230 + r() * 90, HORIZON + 28, 190 + r() * 130, 90 + r() * 50, P.firFar);
  }
  const mg = g.createLinearGradient(0, HORIZON - 140, 0, HORIZON + 40);
  mg.addColorStop(0, 'rgba(0,0,0,0)'); mg.addColorStop(1, P.mist);
  g.fillStyle = mg; g.fillRect(-800, HORIZON - 140, 3600, 200);
}

function paintForestMid(g: CanvasRenderingContext2D, T: Theme) {
  const P = forestPal[T.key];
  const r = sr(63);
  for (let i = 0; i < 9; i++) {
    fir(g, -600 + i * 430 + r() * 160, HORIZON + 90, 320 + r() * 190, 150 + r() * 70, P.firMid);
  }
  // broadleaf trunks
  for (const [tx, th] of [[-380, 420], [260, 360], [1180, 400], [1720, 340]]) {
    g.fillStyle = P.trunkMid;
    g.beginPath();
    g.moveTo(tx - 16, HORIZON + 60);
    g.quadraticCurveTo(tx - 6, HORIZON - th * 0.5, tx - 2, HORIZON - th);
    g.lineTo(tx + 14, HORIZON - th);
    g.quadraticCurveTo(tx + 18, HORIZON - th * 0.5, tx + 24, HORIZON + 60);
    g.closePath(); g.fill();
    ell(g, tx + 4, HORIZON - th - 20, 90, 60, P.firMid);
    ell(g, tx - 40, HORIZON - th + 10, 70, 46, P.firFar);
  }
}

function paintForestNear(g: CanvasRenderingContext2D, T: Theme) {
  const P = forestPal[T.key];
  const r = sr(64);
  // big birch framing the left edge
  g.fillStyle = P.birch;
  g.beginPath();
  g.moveTo(20, -700); g.quadraticCurveTo(80, 200, 60, DH + 900);
  g.lineTo(160, DH + 900); g.quadraticCurveTo(150, 200, 110, -700);
  g.closePath(); g.fill();
  g.fillStyle = P.birchDash;
  for (let i = 0; i < 14; i++) {
    const t = i / 14, y = -600 + t * (DH + 1400);
    const cx2 = 80 + t * 40;
    g.fillRect(cx2 - 28 + r() * 40, y, 22 + r() * 14, 6);
  }
  // dark pine trunk right
  g.fillStyle = P.trunkMid;
  g.beginPath();
  g.moveTo(1460, -700); g.quadraticCurveTo(1520, 200, 1530, DH + 900);
  g.lineTo(1620, DH + 900); g.quadraticCurveTo(1600, 200, 1550, -700);
  g.closePath(); g.fill();
  // ferns along the base of the trunks
  const fern = (fx: number, fy: number, s: number, rot: number) => {
    g.save(); g.translate(fx, fy); g.rotate(rot); g.scale(s, s);
    g.strokeStyle = P.fern[0]; g.lineWidth = 3;
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(20, -50, 60, -80); g.stroke();
    for (let i = 0; i < 12; i++) {
      const t = 0.12 + i * 0.072;
      const px = 20 * 2 * t * (1 - t) * 1.5 + 60 * t * t, py = -50 * 2 * t * (1 - t) - 80 * t * t;
      const ll = 16 * (1 - t) + 4;
      g.strokeStyle = P.fern[(i + 1) % 3]; g.lineWidth = 2.4;
      g.beginPath(); g.moveTo(px, py); g.lineTo(px - ll * 0.7, py - ll * 0.55); g.stroke();
      g.beginPath(); g.moveTo(px, py); g.lineTo(px + ll * 0.35, py - ll * 0.7); g.stroke();
    }
    g.restore();
  };
  fern(180, 760, 1.1, -0.15);
  fern(300, 790, 0.9, 0.1);
  fern(1420, 780, 1.0, 0.2);
  // fireflies at night
  if (P.fireflies) {
    for (let i = 0; i < 16; i++) {
      const fx = -500 + r() * 3000, fy = 80 + r() * 460;
      softBlob(g, fx, fy, 16, 'rgba(217,245,138,.75)', 0.9);
      ell(g, fx, fy, 1.8, 1.8, '#fbffcf');
    }
  }
}

function paintForestFloor(g: CanvasRenderingContext2D, T: Theme) {
  const P = forestPal[T.key];
  const r = sr(65);
  const grd = g.createLinearGradient(0, 620, 0, DH + 900);
  grd.addColorStop(0, P.floorA); grd.addColorStop(1, P.floorB);
  g.fillStyle = grd; g.fillRect(-800, 620, 3600, DH + 900 - 620 + 800);
  // soft shade patches
  for (let i = 0; i < 6; i++) {
    softBlob(g, -600 + r() * 3000, 720 + r() * 500, 200 + r() * 240, 'rgba(0,0,0,.16)', 0.4);
  }
  // leaf litter
  for (let i = 0; i < 320; i++) {
    const x = -800 + r() * 3600, y = 640 + r() * (DH + 600);
    g.fillStyle = P.litter;
    ell(g, x, y, 2.4 + r() * 2.6, 1.2 + r(), P.litter);
  }
  // moss patches
  for (let i = 0; i < 12; i++) {
    ell(g, -800 + r() * 3600, 700 + r() * (DH + 300), 26 + r() * 40, 8 + r() * 10, 'rgba(90,140,60,.25)');
  }
  // mushrooms
  const shroom = (mx: number, my: number, s: number) => {
    g.save(); g.translate(mx, my); g.scale(s, s);
    g.fillStyle = '#e8dcc4';
    g.beginPath(); g.moveTo(-6, 0); g.quadraticCurveTo(-5, -14, 0, -16); g.quadraticCurveTo(5, -14, 6, 0); g.closePath(); g.fill();
    g.fillStyle = '#c0392b';
    g.beginPath(); g.ellipse(0, -15, 14, 10, 0, Math.PI, 0); g.fill();
    g.fillStyle = '#f4f1e6';
    ell(g, -5, -19, 2.4, 1.7, '#f4f1e6');
    ell(g, 4, -21, 1.9, 1.4, '#f4f1e6');
    ell(g, 0, -24, 1.5, 1.2, '#f4f1e6');
    g.strokeStyle = 'rgba(120,60,40,.4)'; g.lineWidth = 1;
    for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 4, -16); g.lineTo(i * 4.6, -22); g.stroke(); }
    g.restore();
  };
  shroom(560, 900, 1.3); shroom(600, 915, 0.9); shroom(1180, 860, 1.1); shroom(-140, 1000, 1.6);
}

function paintForestFg(g: CanvasRenderingContext2D, T: Theme) {
  const P = forestPal[T.key];
  // two big arching fern fronds bottom-left
  const frond = (fx: number, rot: number, len: number, s: number) => {
    g.save(); g.translate(fx, DH + 860); g.rotate(rot); g.scale(s, s);
    g.strokeStyle = P.fern[0]; g.lineWidth = 7;
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(len * 0.3, -len * 0.9, len * 0.85, -len * 1.15); g.stroke();
    for (let i = 0; i < 16; i++) {
      const t = 0.08 + i * 0.058;
      const px = 2 * 0.3 * t * (1 - t) * len + t * t * len * 0.85;
      const py = -0.9 * len * 2 * t * (1 - t) - 1.15 * len * t * t;
      const ll = (1 - t) * 64 + 10;
      for (const dir of [-1, 1]) {
        g.strokeStyle = P.fern[1 + (i % 2)]; g.lineWidth = 5;
        g.beginPath(); g.moveTo(px, py);
        g.quadraticCurveTo(px + dir * ll * 0.5, py - ll * 0.3, px + dir * ll * 0.85, py - ll * 0.05);
        g.stroke();
      }
    }
    g.restore();
  };
  frond(120, -0.5, 420, 1.0);
  frond(320, -0.75, 360, 0.9);
  frond(1560, 0.6, 400, 0.95);
  // mushroom, bottom-right
  g.save(); g.translate(1330, DH + 300); g.scale(2.6, 2.6);
  g.fillStyle = '#e8dcc4';
  g.beginPath(); g.moveTo(-6, 0); g.quadraticCurveTo(-5, -14, 0, -16); g.quadraticCurveTo(5, -14, 6, 0); g.closePath(); g.fill();
  g.fillStyle = '#c0392b';
  g.beginPath(); g.ellipse(0, -15, 14, 10, 0, Math.PI, 0); g.fill();
  ell(g, -5, -19, 2.4, 1.7, '#f4f1e6');
  ell(g, 4, -21, 1.9, 1.4, '#f4f1e6');
  g.restore();
}

export const BACKGROUNDS: Record<'beach' | 'city' | 'forest', BackgroundDef> = {
  beach: {
    layers: [
      { key: 'sea',   dist: Infinity, paint: paintBeachSea },
      { key: 'dunes', dist: 28,       paint: paintBeachDunes },
      { key: 'sand',  dist: 6,        paint: paintBeachSand },
      { key: 'fg',    dist: 0.7,      paint: paintBeachFg },
    ],
  },
  city: {
    layers: [
      { key: 'skyline', dist: Infinity, paint: paintCityBackdrop },
      { key: 'towers',  dist: 160,      paint: paintCityTowers },
      { key: 'shops',   dist: 26,       paint: paintCityShops },
      { key: 'street',  dist: 8,        paint: paintCityStreet },
      { key: 'fg',      dist: 0.8,      paint: paintCityFg },
    ],
  },
  forest: {
    layers: [
      { key: 'wall',   dist: Infinity, paint: paintForestBackdrop },
      { key: 'firfar', dist: 250,      paint: paintForestFar },
      { key: 'firmed', dist: 45,       paint: paintForestMid },
      { key: 'near',   dist: 8,        paint: paintForestNear },
      { key: 'floor',  dist: 3,        paint: paintForestFloor },
      { key: 'fg',     dist: 0.7,      paint: paintForestFg },
    ],
  },
};

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
/* Front-facing sitting shiba inu — plush proportions, urajiro markings */
/* and signature brow spots. 1 unit = 1 cm, y 0…60.                     */
function paintShiba(g: CanvasRenderingContext2D, _T: Theme, d: number) {
  const { h, baseY } = subjectGeometry(0.6, d);
  const u = h / 60;
  g.save(); g.translate(800, baseY); g.scale(u, u); g.translate(0, -60);

  const FUR = '#df8a3b';
  const FUR_L = '#eb9f54';
  const FUR_D = '#b86823';
  const CREAM = '#fbf3e4';
  const CREAM_SH = '#e6d8c0';
  const INK = '#261a12';

  // ground shadow
  ell(g, 0, 58.6, 18.5, 3, 'rgba(0,0,0,.24)');

  // --- curled plush tail (peeking over right hip) ---
  g.save();
  g.lineCap = 'round';
  g.strokeStyle = FUR_D; g.lineWidth = 6.8;
  g.beginPath(); g.arc(13.5, 35.5, 6.2, -Math.PI * 0.85, Math.PI * 0.65); g.stroke();
  g.strokeStyle = FUR; g.lineWidth = 5.6;
  g.beginPath(); g.arc(13.5, 35.5, 6.0, -Math.PI * 0.8, Math.PI * 0.55); g.stroke();
  g.strokeStyle = CREAM; g.lineWidth = 3.2;
  g.beginPath(); g.arc(13.5, 35.5, 4.2, -Math.PI * 0.65, Math.PI * 0.35); g.stroke();
  ell(g, 10.2, 32.8, 2.2, 2.2, CREAM); // fluffy tail-tip curl
  g.restore();

  // --- hind haunches & tucked back paws ---
  ell(g, -10.2, 46.5, 6.8, 9.8, FUR_D);
  ell(g, 10.2, 46.5, 6.8, 9.8, FUR_D);
  ell(g, -9.6, 46.2, 6.2, 9.2, FUR);
  ell(g, 9.6, 46.2, 6.2, 9.2, FUR);
  // hind paws peeking out on sides
  ell(g, -11.8, 56.2, 3.8, 2.1, CREAM_SH);
  ell(g, 11.8, 56.2, 3.8, 2.1, CREAM_SH);
  ell(g, -11.6, 55.9, 3.5, 1.9, CREAM);
  ell(g, 11.6, 55.9, 3.5, 1.9, CREAM);

  // --- main sitting torso (connects neck y=20 smoothly to rump y=56) ---
  g.fillStyle = FUR;
  g.beginPath();
  g.moveTo(-9.2, 21);
  g.quadraticCurveTo(-14.5, 32, -13.2, 49);
  g.quadraticCurveTo(-11, 56.5, 0, 56.5);
  g.quadraticCurveTo(11, 56.5, 13.2, 49);
  g.quadraticCurveTo(14.5, 32, 9.2, 21);
  g.closePath();
  g.fill();

  // warm shoulder highlight
  ell(g, -6.5, 29, 4.5, 6.5, FUR_L);
  ell(g, 6.5, 29, 4.5, 6.5, FUR_L);

  // --- chest urajiro (plush cream shield) ---
  g.fillStyle = CREAM_SH;
  g.beginPath();
  g.moveTo(-7.2, 23.5);
  g.quadraticCurveTo(-10.8, 32, -7.8, 43.5);
  g.quadraticCurveTo(0, 49.5, 7.8, 43.5);
  g.quadraticCurveTo(10.8, 32, 7.2, 23.5);
  g.closePath();
  g.fill();

  g.fillStyle = CREAM;
  g.beginPath();
  g.moveTo(-6.6, 23.5);
  g.quadraticCurveTo(-9.8, 31.5, -7.0, 42);
  g.quadraticCurveTo(0, 47.5, 7.0, 42);
  g.quadraticCurveTo(9.8, 31.5, 6.6, 23.5);
  g.closePath();
  g.fill();

  // subtle chest fur V-tuft
  g.strokeStyle = CREAM_SH; g.lineWidth = 0.9; g.lineCap = 'round';
  g.beginPath();
  g.moveTo(-2.6, 31); g.lineTo(0, 33.8); g.lineTo(2.6, 31);
  g.moveTo(-1.8, 36.5); g.lineTo(0, 38.8); g.lineTo(1.8, 36.5);
  g.stroke();

  // --- front legs (tapered columns + cream socks + round paws) ---
  // center belly shadow between front legs
  ell(g, 0, 49, 3.2, 6.5, 'rgba(90,45,12,.22)');

  for (const s of [-1, 1]) {
    const lx = s * 6.4;
    // upper leg (sesame orange)
    g.fillStyle = FUR;
    g.beginPath();
    g.moveTo(lx - 3.3, 35);
    g.lineTo(lx + 3.3, 35);
    g.lineTo(lx + 2.8, 50);
    g.lineTo(lx - 2.8, 50);
    g.closePath();
    g.fill();

    // cream sock (lower leg)
    g.fillStyle = CREAM;
    g.beginPath();
    g.moveTo(lx - 2.9, 47.5);
    g.quadraticCurveTo(lx, 46.2, lx + 2.9, 47.5);
    g.lineTo(lx + 2.7, 56.8);
    g.lineTo(lx - 2.7, 56.8);
    g.closePath();
    g.fill();

    // front paw
    ell(g, lx, 57.2, 3.6, 2.1, CREAM_SH);
    ell(g, lx, 56.9, 3.4, 1.9, CREAM);
    // toe clefts
    g.strokeStyle = 'rgba(80,50,30,.35)'; g.lineWidth = 0.65;
    g.beginPath();
    g.moveTo(lx - 1.1, 56.2); g.lineTo(lx - 1.1, 58.4);
    g.moveTo(lx + 1.1, 56.2); g.lineTo(lx + 1.1, 58.4);
    g.stroke();
  }

  // --- red collar + gold bell/tag ---
  g.strokeStyle = '#962318'; g.lineWidth = 3.4; g.lineCap = 'round';
  g.beginPath(); g.ellipse(0, 22.2, 9.6, 2.9, 0, 0.12, Math.PI - 0.12); g.stroke();
  g.strokeStyle = '#d63a2a'; g.lineWidth = 2.2;
  g.beginPath(); g.ellipse(0, 22.0, 9.5, 2.8, 0, 0.15, Math.PI - 0.15); g.stroke();
  // gold bell
  ell(g, 0, 25.8, 2.2, 2.2, '#d49b1a');
  ell(g, -0.3, 25.5, 1.8, 1.8, '#f7cd46');
  ell(g, -0.7, 24.9, 0.6, 0.6, '#fff6cc');
  g.strokeStyle = '#6e4e0a'; g.lineWidth = 0.7;
  g.beginPath(); g.moveTo(-1.4, 26.2); g.lineTo(1.4, 26.2); g.stroke();
  ell(g, 0, 26.8, 0.55, 0.55, '#523906');

  // --- ears (plush triangular shiba ears, slightly forward-tilted) ---
  for (const s of [-1, 1]) {
    // outer ear
    g.fillStyle = FUR_D;
    g.beginPath();
    g.moveTo(s * 3.8, 6.2);
    g.quadraticCurveTo(s * 8.2, 0.4, s * 11.4, 0.8);
    g.quadraticCurveTo(s * 13.8, 5.2, s * 11.8, 11.5);
    g.closePath();
    g.fill();

    // main ear fur
    g.fillStyle = FUR;
    g.beginPath();
    g.moveTo(s * 4.2, 6.2);
    g.quadraticCurveTo(s * 8.2, 1.1, s * 11.0, 1.4);
    g.quadraticCurveTo(s * 13.1, 5.4, s * 11.4, 11.2);
    g.closePath();
    g.fill();

    // inner ear shadow + cream fluff
    poly(g, [[s * 5.6, 6.6], [s * 10.3, 2.6], [s * 10.6, 9.8]], '#d9b89c');
    poly(g, [[s * 6.0, 7.2], [s * 9.8, 3.6], [s * 10.2, 9.6]], CREAM);
  }

  // --- head (broad skull + signature round fluffy shiba cheeks) ---
  g.fillStyle = FUR;
  g.beginPath();
  g.moveTo(0, 4.6);
  g.quadraticCurveTo(-8.8, 4.6, -11.4, 10.2);
  g.quadraticCurveTo(-14.2, 15.2, -11.8, 19.2);
  g.quadraticCurveTo(-7.8, 23.4, 0, 23.4);
  g.quadraticCurveTo(7.8, 23.4, 11.8, 19.2);
  g.quadraticCurveTo(14.2, 15.2, 11.4, 10.2);
  g.quadraticCurveTo(8.8, 4.6, 0, 4.6);
  g.closePath();
  g.fill();

  // subtle crown & forehead fur shading
  ell(g, 0, 8.2, 6.8, 3.0, FUR_L);
  g.strokeStyle = FUR_D; g.lineWidth = 0.8;
  g.beginPath(); g.moveTo(0, 5.8); g.lineTo(0, 10.2); g.stroke();

  // --- signature urajiro cheek & chin mask ---
  g.fillStyle = CREAM;
  g.beginPath();
  // starts at left cheek, sweeps under left eye, up muzzle sides, mirrors right
  g.moveTo(-11.8, 14.8);
  g.quadraticCurveTo(-8.8, 13.8, -5.2, 15.0);
  g.quadraticCurveTo(-2.8, 15.6, -2.0, 13.2);
  g.quadraticCurveTo(0, 12.6, 2.0, 13.2);
  g.quadraticCurveTo(2.8, 15.6, 5.2, 15.0);
  g.quadraticCurveTo(8.8, 13.8, 11.8, 14.8);
  g.quadraticCurveTo(13.0, 18.2, 10.2, 20.6);
  g.quadraticCurveTo(6.2, 23.5, 0, 23.5);
  g.quadraticCurveTo(-6.2, 23.5, -10.2, 20.6);
  g.quadraticCurveTo(-13.0, 18.2, -11.8, 14.8);
  g.closePath();
  g.fill();

  // Keep the orange nose bridge strip down to the nose
  g.fillStyle = FUR;
  g.beginPath();
  g.moveTo(-2.3, 10.5);
  g.quadraticCurveTo(0, 10.2, 2.3, 10.5);
  g.lineTo(1.5, 14.8);
  g.quadraticCurveTo(0, 15.2, -1.5, 14.8);
  g.closePath();
  g.fill();

  // --- iconic cream "maru" eyebrow spots ---
  g.save();
  g.fillStyle = CREAM;
  g.beginPath(); g.ellipse(-4.4, 9.6, 1.7, 1.05, -0.2, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(4.4, 9.6, 1.7, 1.05, 0.2, 0, Math.PI * 2); g.fill();
  g.restore();

  // --- eyes (tilted almond shiba eyes + catchlights) ---
  for (const s of [-1, 1]) {
    const ex = s * 4.8, ey = 12.3;
    g.save();
    g.translate(ex, ey);
    g.rotate(s * -0.14);
    // outer dark eye contour
    ell(g, 0, 0, 1.85, 1.45, INK);
    // warm dark iris
    ell(g, 0, 0.05, 1.35, 1.15, '#3b2416');
    ell(g, 0, 0.05, 0.8, 0.75, INK);
    // bright catchlight + secondary glint
    ell(g, -0.45 * s, -0.4, 0.45, 0.42, '#ffffff');
    ell(g, 0.4 * s, 0.35, 0.22, 0.22, 'rgba(255,255,255,.75)');
    g.restore();
  }

  // --- plump muzzle & happy mouth ---
  ell(g, 0, 17.6, 4.6, 3.2, CREAM);
  // pink tongue peeking under smile
  g.fillStyle = '#e87a82';
  g.beginPath();
  g.arc(0, 18.6, 1.45, 0, Math.PI);
  g.fill();
  // ω shiba smile
  g.strokeStyle = INK; g.lineWidth = 0.85; g.lineCap = 'round';
  g.beginPath();
  g.moveTo(0, 16.4); g.lineTo(0, 17.8);
  g.moveTo(0, 17.8); g.quadraticCurveTo(-1.8, 19.4, -3.8, 17.9);
  g.moveTo(0, 17.8); g.quadraticCurveTo(1.8, 19.4, 3.8, 17.9);
  g.stroke();

  // --- nose (rounded triangle) ---
  g.fillStyle = INK;
  g.beginPath();
  g.moveTo(-2.1, 14.8);
  g.quadraticCurveTo(0, 14.3, 2.1, 14.8);
  g.quadraticCurveTo(2.2, 16.2, 0, 16.8);
  g.quadraticCurveTo(-2.2, 16.2, -2.1, 14.8);
  g.closePath();
  g.fill();
  ell(g, -0.5, 15.0, 0.65, 0.32, 'rgba(255,255,255,.35)');

  // subtle whisker dots on muzzle
  g.fillStyle = 'rgba(60,35,20,.28)';
  for (const s of [-1, 1]) {
    ell(g, s * 2.5, 17.1, 0.25, 0.25, 'rgba(60,35,20,.28)');
    ell(g, s * 3.3, 16.7, 0.25, 0.25, 'rgba(60,35,20,.28)');
  }

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
  const grd = g.createLinearGradient(0, HORIZON, 0, 568);
  grd.addColorStop(0, P.seaA); grd.addColorStop(0.55, P.seaB); grd.addColorStop(1, P.seaB);
  g.fillStyle = grd; g.fillRect(-800, HORIZON, 3600, 110);

  // subtle deep-water horizon band
  g.fillStyle = 'rgba(15,45,70,.16)';
  g.fillRect(-800, HORIZON, 3600, 14);
  // horizon kiss
  g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(-800, HORIZON, 3600, 2);

  // volcanic tropical islands & coastal headland with lighthouse
  // Left archipelago island
  poly(g, [
    [-580, HORIZON + 3], [-520, HORIZON - 18], [-440, HORIZON - 42],
    [-370, HORIZON - 24], [-310, HORIZON - 34], [-220, HORIZON + 3],
  ], P.island);
  poly(g, [
    [-440, HORIZON - 42], [-370, HORIZON - 24], [-310, HORIZON - 34], [-220, HORIZON + 3], [-395, HORIZON + 3],
  ], 'rgba(255,245,220,.08)'); // sunlit right slope

  // Right headland peninsula + miniature lighthouse
  poly(g, [
    [1760, HORIZON + 3], [1830, HORIZON - 22], [1940, HORIZON - 48],
    [2040, HORIZON - 30], [2160, HORIZON - 54], [2340, HORIZON + 3],
  ], P.island);
  poly(g, [
    [1760, HORIZON + 3], [1830, HORIZON - 22], [1940, HORIZON - 48], [1900, HORIZON + 3],
  ], 'rgba(255,245,220,.09)');
  // lighthouse on headland point (x=1830, y=HORIZON-22)
  g.save(); g.translate(1830, HORIZON - 21);
  poly(g, [[-4.5, 2], [-3, -24], [3, -24], [4.5, 2]], T.key === 'night' ? '#8c96a8' : '#f7f4ec');
  poly(g, [[-3.8, -8], [-3.3, -16], [3.3, -16], [3.8, -8]], '#c94a3f');
  g.fillStyle = '#2c3545'; g.fillRect(-4.5, -26, 9, 2.5);
  poly(g, [[-3.5, -26], [0, -32], [3.5, -26]], '#c94a3f');
  if (T.key === 'night') {
    // rotating lighthouse beam & warm lantern beacon
    softBlob(g, 0, -27, 26, 'rgba(255,230,150,.85)', 1);
    const beamL = g.createLinearGradient(0, -27, -220, -55);
    beamL.addColorStop(0, 'rgba(255,240,180,.38)');
    beamL.addColorStop(1, 'rgba(255,240,180,0)');
    g.fillStyle = beamL;
    g.beginPath(); g.moveTo(0, -27); g.lineTo(-220, -68); g.lineTo(-220, -34); g.closePath(); g.fill();
    ell(g, 0, -27, 2.8, 2.8, '#fffbe0');
  }
  g.restore();

  // glitter path under the sun/moon
  if (P.glitter) {
    const r = sr(31);
    for (let i = 0; i < 75; i++) {
      const y = HORIZON + 3 + r() * 98;
      const spread = (y - HORIZON) * 1.35 + 8;
      g.globalAlpha = 0.22 + r() * 0.65;
      g.fillStyle = P.glitter;
      g.beginPath();
      g.roundRect(SUN_X + (r() - 0.5) * spread * 2, y, 5 + r() * 32, 1.5 + r() * 1.8, 1);
      g.fill();
    }
    g.globalAlpha = 1;
  }

  // rolling ocean swells & whitecaps
  const r2 = sr(32);
  for (let i = 0; i < 38; i++) {
    const y = HORIZON + 7 + r2() * 94, x = -800 + r2() * 3600, w = 45 + r2() * 120;
    g.strokeStyle = i % 3 === 0 ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.14)';
    g.lineWidth = 1.4 + (y - HORIZON) * 0.012;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + w * 0.35, y - 2.2, x + w * 0.7, y + 1.5);
    g.quadraticCurveTo(x + w * 0.85, y + 2.5, x + w, y);
    g.stroke();
  }

  // distant smaller sailboat on left-center horizon
  g.save(); g.translate(580, HORIZON + 18); g.scale(0.58, 0.58);
  ell(g, 0, 4, 22, 3, 'rgba(20,35,50,.28)');
  poly(g, [[-18, 0], [18, 0], [14, 5], [-13, 5]], '#34495e');
  poly(g, [[1, -2], [1, -34], [16, -2]], 'rgba(250,248,242,.92)');
  poly(g, [[-2, -2], [-2, -28], [-14, -2]], 'rgba(240,236,228,.85)');
  g.restore();

  // main graceful sloop sailboat with billowing sails & water reflection
  g.save(); g.translate(1340, HORIZON + 36);
  // water reflection of sails & hull
  g.fillStyle = 'rgba(255,255,255,.14)';
  poly(g, [[-14, 6], [16, 6], [10, 28], [-8, 24]], 'rgba(255,255,255,.14)');
  ell(g, 0, 5, 28, 3.5, 'rgba(20,35,55,.35)');
  // wake ripple
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(-36, 4); g.lineTo(24, 3); g.stroke();
  // hull + cabin coachroof + trim stripe
  poly(g, [[-26, -1], [26, -1], [21, 5.5], [-20, 5.5]], '#283545');
  g.fillStyle = '#e8dfd1'; g.fillRect(-23, 0.5, 44, 1.5);
  poly(g, [[-8, -1], [-4, -5], [8, -5], [11, -1]], '#f4f1ea');
  // mast & boom
  g.strokeStyle = '#3d4856'; g.lineWidth = 1.8;
  g.beginPath(); g.moveTo(0, -5); g.lineTo(0, -48); g.moveTo(0, -6); g.lineTo(23, -5); g.stroke();
  // billowing mainsail (curved leech)
  g.fillStyle = T.key === 'night' ? '#cad4e3' : '#fbfaf6';
  g.beginPath();
  g.moveTo(1.5, -45);
  g.quadraticCurveTo(18, -26, 22, -6);
  g.quadraticCurveTo(11, -4.5, 1.5, -6);
  g.closePath(); g.fill();
  // coral/gold accent stripe on mainsail
  poly(g, [[1.5, -22], [15.5, -20], [18, -14], [1.5, -16]], '#e05a47');
  // billowing headsail / jib
  g.fillStyle = T.key === 'night' ? '#b8c4d6' : '#f2efe6';
  g.beginPath();
  g.moveTo(-1.5, -40);
  g.quadraticCurveTo(-14, -22, -21, -3);
  g.quadraticCurveTo(-10, -2, -1.5, -5);
  g.closePath(); g.fill();
  // masthead pennant
  poly(g, [[0, -48], [11, -46], [0, -44]], '#e05a47');
  if (T.key === 'night') {
    softBlob(g, 0, -48, 12, 'rgba(255,210,120,.65)', 0.9);
    ell(g, 0, -48, 2, 2, '#ffe599');
  }
  g.restore();
}

function paintBeachDunes(g: CanvasRenderingContext2D, T: Theme) {
  const P = beachPal[T.key];
  const r = sr(45);

  // sculpted wind-swept dune ridges with sunlit windward & shaded leeward faces
  for (const [dx2, dw, dh] of [[-320, 1340, 66], [920, 1540, 84], [2120, 1140, 58]]) {
    ell(g, dx2, 598, dw / 2, dh, P.dune);
    // sunlit crest highlight
    ell(g, dx2 + dw * 0.08, 594, dw * 0.38, dh * 0.72, P.sandA);
  }
  // foreground dune ridge
  g.fillStyle = P.sandA;
  g.beginPath();
  g.moveTo(-800, 622);
  g.quadraticCurveTo(-240, 566, 320, 602);
  g.quadraticCurveTo(780, 624, 1240, 584);
  g.quadraticCurveTo(1760, 558, 2800, 616);
  g.lineTo(2800, 642); g.lineTo(-800, 642); g.closePath(); g.fill();

  // weathered wooden sand-fence along the left dune crest
  g.save();
  g.strokeStyle = 'rgba(70,55,40,.45)'; g.lineWidth = 1.4;
  g.beginPath();
  g.moveTo(-140, 590); g.quadraticCurveTo(-20, 596, 110, 608);
  g.moveTo(-140, 602); g.quadraticCurveTo(-20, 608, 110, 620);
  g.stroke();
  for (let i = 0; i < 14; i++) {
    const t = i / 13;
    const fx = -140 + t * 250;
    const fy = 584 + t * 20 + Math.sin(t * 4) * 2;
    const tilt = (r() - 0.5) * 0.14;
    g.save(); g.translate(fx, fy); g.rotate(tilt);
    g.fillStyle = i % 2 ? '#8c765c' : '#7a654d';
    g.fillRect(-2, 0, 4, 26);
    g.restore();
  }
  g.restore();

  // dune grass tufts
  g.lineWidth = 2;
  for (let i = 0; i < 80; i++) {
    const x = -800 + r() * 3600, y = 568 + r() * 48;
    g.strokeStyle = P.palm[(r() * 3) | 0];
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + (r() - .5) * 12, y - 12 - r() * 10, x + (r() - .5) * 22, y - 22 - r() * 14); g.stroke();
  }

  // lush coconut palm trees with ringed trunks & feathered fronds
  const palm = (px: number, size: number, flip: boolean) => {
    g.save(); g.translate(px, 640); g.scale(flip ? -size : size, size);
    // ground shadow
    ell(g, 18, 4, 52, 8, 'rgba(0,0,0,.18)');
    // tapered curved trunk
    g.fillStyle = P.trunk;
    g.beginPath();
    g.moveTo(-11, 4);
    g.quadraticCurveTo(10, -108, 39, -218);
    g.lineTo(49, -218);
    g.quadraticCurveTo(24, -108, 9, 4);
    g.closePath(); g.fill();
    // sunlit trunk edge highlight
    g.strokeStyle = 'rgba(255,235,195,.2)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(6, 2); g.quadraticCurveTo(22, -108, 47, -216); g.stroke();
    // bark ring segments
    g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 2.2;
    for (let i = 1; i <= 14; i++) {
      const t = i / 15;
      const bx = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * 17 + t * t * 44;
      const by = -218 * t;
      const bw = 9 * (1 - t * 0.48);
      g.beginPath(); g.moveTo(bx - bw, by); g.quadraticCurveTo(bx, by + 2.5, bx + bw, by - 1); g.stroke();
    }
    const cx2 = 44, cy2 = -218;
    // green crownshaft & coconut cluster
    poly(g, [[cx2 - 5, cy2 + 4], [cx2 + 5, cy2 + 4], [cx2 + 7, cy2 - 8], [cx2 - 6, cy2 - 8]], P.palm[2]);
    for (const [ox, oy] of [[-5, 2], [4, 3], [0, 6], [-2, 0]]) {
      ell(g, cx2 + ox, cy2 + oy, 5.8, 5.2, '#5c3d22');
      ell(g, cx2 + ox + 1.2, cy2 + oy - 1.2, 2.5, 2, 'rgba(255,230,190,.22)');
    }
    // arching feather fronds with dense leaflet silhouettes
    const frondAngles = [-2.85, -2.45, -2.0, -1.55, -1.05, -0.65, -0.25, 0.15, 0.52];
    for (let i = 0; i < frondAngles.length; i++) {
      const a = frondAngles[i];
      const frondLen = 88 + (i % 3) * 14;
      const tipX = cx2 + Math.cos(a) * frondLen;
      const tipY = cy2 + Math.sin(a) * frondLen * 0.72 + 32;
      const ctrlX = (cx2 + tipX) / 2 + (tipX > cx2 ? 10 : -10);
      const ctrlY = Math.min(cy2, tipY) - 24;
      const col = P.palm[i % 3];
      // main rachis stem
      g.strokeStyle = col; g.lineWidth = 3.2;
      g.beginPath(); g.moveTo(cx2, cy2 - 3); g.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY); g.stroke();
      // hanging leaflets along the curve
      g.fillStyle = col;
      for (let t = 0.12; t <= 0.94; t += 0.065) {
        const u = 1 - t;
        const nx = u * u * cx2 + 2 * u * t * ctrlX + t * t * tipX;
        const ny = u * u * (cy2 - 3) + 2 * u * t * ctrlY + t * t * tipY;
        const leafL = Math.sin(t * Math.PI) * 22 + 5;
        poly(g, [
          [nx - 2, ny],
          [nx + (tipX > cx2 ? -4 : 4), ny + leafL],
          [nx + 2.5, ny + 1],
        ], col);
      }
    }
    g.restore();
  };
  palm(180, 1, false);
  palm(1480, 0.86, true);

  // surfboard stuck upright in the sand near the right palm
  g.save(); g.translate(1355, 634); g.rotate(0.14);
  ell(g, 0, 3, 18, 4, 'rgba(0,0,0,.2)');
  g.fillStyle = '#f7f3e6';
  g.beginPath();
  g.moveTo(-11, 2);
  g.quadraticCurveTo(-14, -48, 0, -96);
  g.quadraticCurveTo(14, -48, 11, 2);
  g.closePath(); g.fill();
  // teal & coral racing stripes on surfboard
  g.save(); g.clip();
  g.fillStyle = '#2a9d8f'; g.fillRect(-3, -98, 6, 102);
  g.fillStyle = '#e76f51';
  g.fillRect(-16, -54, 32, 7);
  g.fillRect(-16, -42, 32, 4);
  g.restore();
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(-11, 2); g.quadraticCurveTo(-14, -48, 0, -96); g.quadraticCurveTo(14, -48, 11, 2);
  g.stroke();
  g.restore();

  // beach towel + wooden lounge chair under the umbrella
  g.save(); g.translate(1235, 638);
  // striped beach mat/towel on sand
  poly(g, [[-68, 4], [42, 2], [54, 14], [-58, 16]], '#e9c46a');
  poly(g, [[-52, 4], [26, 2.5], [34, 14], [-44, 15.5]], '#2a9d8f');
  // wooden folding deckchair
  g.strokeStyle = '#7a593c'; g.lineWidth = 3.2; g.lineCap = 'round';
  g.beginPath();
  g.moveTo(-42, 8); g.lineTo(-10, -28); // backrest frame
  g.moveTo(-28, -8); g.lineTo(24, 8);   // seat frame
  g.moveTo(-16, -18); g.lineTo(8, 8);   // support leg
  g.stroke();
  // striped canvas sling
  g.strokeStyle = '#f4f1e6'; g.lineWidth = 5;
  g.beginPath(); g.moveTo(-12, -26); g.quadraticCurveTo(-16, -6, 18, 4); g.stroke();
  g.strokeStyle = '#e05a47'; g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(-12, -26); g.quadraticCurveTo(-16, -6, 18, 4); g.stroke();
  g.restore();

  // striped beach umbrella with scalloped valance
  g.save(); g.translate(1240, 636); g.rotate(-0.12);
  ell(g, -4, 4, 66, 9, 'rgba(0,0,0,.22)');
  g.strokeStyle = '#7d5c3b'; g.lineWidth = 5.5;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -114); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(-1.2, 0); g.lineTo(-1.2, -114); g.stroke();

  const uR = 82, uY = -110;
  for (let i = 0; i < 8; i++) {
    const a0 = Math.PI + (i / 8) * Math.PI;
    const a1 = Math.PI + ((i + 1) / 8) * Math.PI;
    const x0 = Math.cos(a0) * uR, y0 = uY + Math.sin(a0) * uR * 0.72;
    const x1 = Math.cos(a1) * uR, y1 = uY + Math.sin(a1) * uR * 0.72;
    g.fillStyle = i % 2 ? '#f7f4ea' : '#d1495b';
    g.beginPath();
    g.moveTo(0, uY - 22);
    g.quadraticCurveTo(x0 * 0.55, uY - 16, x0, y0);
    g.lineTo(x1, y1);
    g.quadraticCurveTo(x1 * 0.55, uY - 16, 0, uY - 22);
    g.closePath(); g.fill();
    // hanging scalloped valance tab
    g.beginPath();
    g.moveTo(x0, y0);
    g.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + 9, x1, y1);
    g.closePath(); g.fill();
  }
  ell(g, 0, uY - 24, 4.5, 4.5, '#7d5c3b');
  // warm beach lantern hanging under umbrella at night
  if (P.lamp) {
    softBlob(g, -18, uY + 6, 48, 'rgba(255,190,85,.6)', 0.9);
    ell(g, -18, uY + 6, 4, 5, '#ffe599');
  }
  g.restore();
}

function paintBeachSand(g: CanvasRenderingContext2D, T: Theme) {
  const P = beachPal[T.key];
  const r = sr(46);
  const grd = g.createLinearGradient(0, 616, 0, DH + 900);
  grd.addColorStop(0, P.sandA); grd.addColorStop(1, P.sandB);
  g.fillStyle = grd; g.fillRect(-800, 616, 3600, DH + 900 - 616 + 800);

  // wet mirror sheen near the waterline
  const wet = g.createLinearGradient(0, 616, 0, 718);
  wet.addColorStop(0, P.wet);
  wet.addColorStop(0.55, P.wet);
  wet.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = wet; g.fillRect(-800, 616, 3600, 102);

  // shallow turquoise swash wave lapping onto the wet sand
  const swash = g.createLinearGradient(0, 616, 0, 668);
  swash.addColorStop(0, P.seaB);
  swash.addColorStop(1, 'rgba(180,230,240,.18)');
  g.fillStyle = swash;
  g.beginPath();
  g.moveTo(-800, 616);
  for (let x = -800; x <= 2800; x += 120) {
    g.quadraticCurveTo(x + 60, 654 + Math.sin(x * 0.009) * 14, x + 120, 642 + Math.cos(x * 0.007) * 10);
  }
  g.lineTo(2800, 616); g.closePath(); g.fill();

  // lacy seafoam scallops & receding foam lines
  for (let row = 0; row < 4; row++) {
    const baseY = 626 + row * 14;
    g.strokeStyle = row === 3 ? 'rgba(255,255,255,.78)' : 'rgba(255,255,255,.42)';
    g.lineWidth = row === 3 ? 3.4 : 2.2;
    g.beginPath();
    g.moveTo(-800, baseY);
    for (let x = -800; x <= 2800; x += 72) {
      const waveOff = Math.sin(x * 0.009 + row) * 8;
      g.quadraticCurveTo(x + 36, baseY + 7 + waveOff, x + 72, baseY + waveOff * 0.6);
    }
    g.stroke();
  }

  // subtle wind-blown sand ripple contours
  g.strokeStyle = 'rgba(120,90,50,.09)'; g.lineWidth = 1.8;
  for (let i = 0; i < 28; i++) {
    const rx = -700 + r() * 3400, ry = 710 + r() * (DH + 400), rw = 70 + r() * 140;
    g.beginPath(); g.moveTo(rx, ry); g.quadraticCurveTo(rx + rw * 0.5, ry + 5, rx + rw, ry - 1); g.stroke();
  }

  // sand speckles & tiny pebbles
  for (let i = 0; i < 520; i++) {
    const x = -800 + r() * 3600, y = 640 + r() * (DH + 600);
    g.fillStyle = r() > 0.5 ? 'rgba(255,255,255,.17)' : 'rgba(120,95,60,.15)';
    g.fillRect(x, y, 1.6 + r() * 1.8, 1.2 + r() * 1.4);
  }

  // realistic barefoot footprints with heel, arch & toes
  const drawFootprint = (fx: number, fy: number, sc: number, rot: number, leftFoot: boolean) => {
    g.save(); g.translate(fx, fy); g.rotate(rot); g.scale(leftFoot ? sc : -sc, sc);
    // sole & heel impression
    ell(g, 0, -3, 4.8, 6.2, 'rgba(110,85,50,.22)');
    ell(g, -0.6, 5.5, 3.6, 4.2, 'rgba(110,85,50,.2)');
    // 5 toes
    const toes: [number, number, number][] = [[-3.4, -10.5, 1.5], [-1.3, -11.2, 1.2], [0.6, -11.0, 1.1], [2.3, -10.3, 1.0], [3.8, -9.2, 0.9]];
    for (const [tx, ty, tr] of toes) ell(g, tx, ty, tr, tr * 1.15, 'rgba(110,85,50,.22)');
    g.restore();
  };
  for (let i = 0; i < 9; i++) {
    const t = i / 8, x = 480 + t * 260, y = 695 + t * 310;
    const sc = 1.25 - t * 0.35;
    drawFootprint(x, y, sc, 0.55, true);
    drawFootprint(x + 22, y + 24, sc, 0.55, false);
  }

  // weathered driftwood log & pebbles on left-mid sand
  g.save(); g.translate(310, 775); g.rotate(-0.08);
  ell(g, 0, 7, 68, 9, 'rgba(0,0,0,.18)');
  g.fillStyle = T.key === 'night' ? '#4a433b' : '#9c8b76';
  g.beginPath();
  g.moveTo(-62, 2); g.quadraticCurveTo(0, -8, 62, 0);
  g.lineTo(56, 8); g.quadraticCurveTo(0, 3, -58, 9);
  g.closePath(); g.fill();
  g.strokeStyle = 'rgba(255,245,230,.22)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(-54, 1); g.quadraticCurveTo(0, -5, 52, 0); g.stroke();
  g.restore();

  // detailed ribbed scallop & spiral shells
  const shell = (sx: number, sy: number, rot: number, sc: number, col: string) => {
    g.save(); g.translate(sx, sy); g.rotate(rot); g.scale(sc, sc);
    ell(g, 1, 2, 14, 8, 'rgba(0,0,0,.16)');
    // fan ears at hinge
    poly(g, [[-8, 2], [8, 2], [5, 6], [-5, 6]], col);
    g.fillStyle = col;
    g.beginPath(); g.ellipse(0, 0, 14, 11, 0, Math.PI, 0); g.fill();
    g.strokeStyle = 'rgba(150,105,80,.45)'; g.lineWidth = 1.1;
    for (const a of [-0.75, -0.45, -0.15, 0.15, 0.45, 0.75]) {
      g.beginPath(); g.moveTo(0, 3); g.lineTo(Math.sin(a) * 13, -Math.cos(a) * 10); g.stroke();
    }
    g.restore();
  };
  shell(950, 850, 0.3, 1.05, '#f5e4d3');
  shell(1120, 1000, -0.4, 1.2, '#f0d2c8');
  shell(240, 900, 0.15, 0.95, '#f7ebd9');

  // cute little red beach crab near the waterline
  g.save(); g.translate(1035, 738); g.rotate(-0.15);
  ell(g, 0, 4, 15, 5, 'rgba(0,0,0,.18)');
  g.strokeStyle = '#c0392b'; g.lineWidth = 1.8; g.lineCap = 'round';
  for (const s of [-1, 1]) {
    for (const ly of [-2, 1, 4]) {
      g.beginPath(); g.moveTo(s * 6, ly); g.quadraticCurveTo(s * 13, ly - 3, s * 16, ly + 3); g.stroke();
    }
    // raised pincer claws
    g.beginPath(); g.moveTo(s * 5, -3); g.quadraticCurveTo(s * 11, -10, s * 8, -14); g.stroke();
    ell(g, s * 8.5, -14, 3.2, 2.2, '#d94636');
  }
  ell(g, 0, 0, 9.5, 6.5, '#d94636');
  ell(g, 0, -1, 7, 4, '#ea6352');
  // stalk eyes
  ell(g, -3.2, -7.2, 1.3, 1.3, '#1e1e1e');
  ell(g, 3.2, -7.2, 1.3, 1.3, '#1e1e1e');
  g.restore();
}

function paintBeachFg(g: CanvasRenderingContext2D, T: Theme) {
  const P = beachPal[T.key];
  const r = sr(47);
  const baseY = DH + 850;

  // coastal sea-oats & dune grass cluster, bottom-left
  for (let i = 0; i < 52; i++) {
    const x = -160 + r() * 540;
    const hgt = 220 + r() * 390;
    const lean = (r() - 0.5) * 240;
    const w = 6 + r() * 7;
    g.beginPath();
    g.moveTo(x - w / 2, baseY);
    g.quadraticCurveTo(x + lean * 0.3, baseY - hgt * 0.6, x + lean, baseY - hgt);
    g.quadraticCurveTo(x + lean * 0.3 + w * 0.4, baseY - hgt * 0.55, x + w / 2, baseY);
    g.closePath();
    g.fillStyle = P.palm[(r() * 3) | 0]; g.fill();
  }
  // golden sea-oat seed plumes on the tallest stems
  const oatCol = T.key === 'night' ? '#665e4d' : '#e6ca85';
  for (const [ox, oy, lean] of [[140, 1140, 48], [260, 1185, 62], [65, 1210, -34]]) {
    g.strokeStyle = P.palm[1]; g.lineWidth = 3.5;
    g.beginPath(); g.moveTo(ox, baseY); g.quadraticCurveTo(ox + lean * 0.5, (oy + baseY) / 2, ox + lean, oy); g.stroke();
    for (let k = 0; k < 7; k++) {
      ell(g, ox + lean + (k % 2 - 0.5) * 8, oy - k * 9, 6, 3.2, oatCol);
    }
  }

  // tropical hibiscus blossom in bottom-left corner
  g.save(); g.translate(295, 1235);
  ell(g, -18, 8, 22, 12, P.palm[0]);
  ell(g, 18, 12, 20, 11, P.palm[2]);
  const hibCol = T.key === 'night' ? '#9e3b5a' : '#ff5c77';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - 0.3;
    g.save(); g.rotate(a);
    ell(g, 0, -16, 11, 15, hibCol);
    g.restore();
  }
  ell(g, 0, 0, 6, 6, '#b82542');
  g.strokeStyle = '#ffd166'; g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(9, -11); g.stroke();
  ell(g, 9, -11, 2.5, 2.5, '#ffd166');
  g.restore();

  // glossy beach ball, bottom-right
  g.save(); g.translate(1420, 1020);
  ell(g, 0, 14, 96, 14, 'rgba(0,0,0,.2)');
  g.save();
  g.beginPath(); g.arc(0, -76, 88, 0, Math.PI * 2); g.clip();
  const cols = ['#e74c3c', '#f7f4ea', '#3498db', '#f7f4ea', '#f1c40f', '#2ecc71'];
  for (let i = 0; i < 6; i++) {
    g.fillStyle = cols[i];
    g.beginPath();
    g.moveTo(0, -164);
    const x0 = -110 + i * 38, x1 = -110 + (i + 1) * 38;
    g.quadraticCurveTo(x0, -76, 0, 12);
    g.quadraticCurveTo(x1, -76, 0, -164);
    g.closePath(); g.fill();
  }
  // top polar white circle patch + specular sheen & bottom shadow
  ell(g, 0, -146, 22, 10, '#ffffff');
  const ballSh = g.createRadialGradient(-26, -108, 12, 0, -76, 92);
  ballSh.addColorStop(0, 'rgba(255,255,255,.38)');
  ballSh.addColorStop(0.55, 'rgba(0,0,0,0)');
  ballSh.addColorStop(1, 'rgba(0,0,0,.28)');
  g.fillStyle = ballSh; g.fillRect(-90, -166, 180, 180);
  g.restore();
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2;
  g.beginPath(); g.arc(0, -76, 88, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 5; g.lineCap = 'round';
  g.beginPath(); g.arc(0, -76, 72, Math.PI * 1.15, Math.PI * 1.48); g.stroke();
  g.restore();

  // sculpted starfish with bumpy ossicle texture
  g.save(); g.translate(760, 1195); g.rotate(0.38);
  // cast shadow
  g.save(); g.translate(3, 5);
  g.fillStyle = 'rgba(0,0,0,.22)';
  g.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5 - Math.PI / 2;
    const a2 = a + Math.PI / 5;
    g.lineTo(Math.cos(a) * 44, Math.sin(a) * 44);
    g.lineTo(Math.cos(a2) * 17, Math.sin(a2) * 17);
  }
  g.closePath(); g.fill();
  g.restore();

  // main starfish body
  g.fillStyle = '#e07a4b';
  g.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5 - Math.PI / 2;
    const a2 = a + Math.PI / 5;
    g.lineTo(Math.cos(a) * 44, Math.sin(a) * 44);
    g.lineTo(Math.cos(a2) * 17, Math.sin(a2) * 17);
  }
  g.closePath(); g.fill();

  // raised central ridge & bumpy ossicle dots along each arm
  ell(g, 0, 0, 9, 9, '#f0986c');
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5 - Math.PI / 2;
    for (const d of [10, 18, 26, 33]) {
      const rDot = 2.8 - d * 0.05;
      ell(g, Math.cos(a) * d, Math.sin(a) * d, rDot, rDot, '#f7bfa0');
    }
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

  // distant suspension bridge silhouette across the left-center horizon
  g.save();
  g.strokeStyle = P.skyline; g.fillStyle = P.skyline;
  for (const bx of [-340, -140]) {
    g.fillRect(bx - 5, HORIZON - 96, 10, 98);
    g.fillRect(bx - 4, HORIZON - 78, 8, 3);
    g.fillRect(bx - 4, HORIZON - 52, 8, 3);
  }
  g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(-480, HORIZON - 18); g.lineTo(10, HORIZON - 18); g.stroke();
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(-480, HORIZON - 18); g.quadraticCurveTo(-410, HORIZON - 24, -340, HORIZON - 94);
  g.moveTo(-340, HORIZON - 94); g.quadraticCurveTo(-240, HORIZON - 14, -140, HORIZON - 94);
  g.moveTo(-140, HORIZON - 94); g.quadraticCurveTo(-65, HORIZON - 24, 10, HORIZON - 18);
  g.stroke();
  g.restore();

  // far skyline silhouette with stepped art-deco spires, angled towers & water tanks
  let x = -800;
  let idx = 0;
  while (x < 2800) {
    const w = 68 + r() * 124, h = 125 + r() * 210;
    const top = HORIZON - h;
    g.fillStyle = P.skyline;
    g.fillRect(x, top, w, h + 10);

    // varied crown styles: art-deco stepped spire, slanted roof, or water tower
    const style = idx % 3;
    if (style === 0) {
      // stepped art-deco crown + spire
      g.fillRect(x + w * 0.18, top - 18, w * 0.64, 18);
      g.fillRect(x + w * 0.32, top - 34, w * 0.36, 16);
      g.fillRect(x + w * 0.48, top - 62, 3, 28);
      if (P.neon) ell(g, x + w * 0.495, top - 63, 2.5, 2.5, '#ff5f5f');
    } else if (style === 1) {
      // angled modernist crown
      poly(g, [[x, top], [x + w, top - 24], [x + w, top]], P.skyline);
    } else if (r() > 0.35) {
      // classic rooftop wooden water tower on stilts
      const wx = x + w * 0.3;
      g.fillRect(wx + 2, top - 12, 2, 12);
      g.fillRect(wx + 12, top - 12, 2, 12);
      g.fillRect(wx, top - 24, 16, 12);
      poly(g, [[wx - 2, top - 24], [wx + 8, top - 31], [wx + 18, top - 24]], P.skyline);
    }

    if (P.neon) {
      g.fillStyle = 'rgba(255,220,140,.55)';
      for (let i = 0; i < 10; i++) {
        if (r() < 0.34) g.fillRect(x + 6 + r() * (w - 14), top + 8 + r() * (h - 20), 2.6, 3.2);
      }
    }
    x += w + 8 + r() * 28;
    idx++;
  }

  const hz = g.createLinearGradient(0, 250, 0, HORIZON);
  hz.addColorStop(0, 'rgba(0,0,0,0)');
  hz.addColorStop(1, T.key === 'night' ? 'rgba(10,16,30,.4)' : 'rgba(240,220,180,.25)');
  g.fillStyle = hz; g.fillRect(-800, 250, 3600, HORIZON - 250);

  // far cross-street band fills the horizon gap between towers
  const fb = g.createLinearGradient(0, HORIZON, 0, HORIZON + 80);
  fb.addColorStop(0, P.walk); fb.addColorStop(1, P.road);
  g.fillStyle = fb; g.fillRect(-800, HORIZON - 2, 3600, 84);
  g.fillStyle = P.roadLine;
  for (let i = 0; i < 9; i++) {
    if (r() < 0.45) continue;
    const cx2 = -700 + r() * 3000, cw = 10 + r() * 14;
    g.globalAlpha = 0.5 + r() * 0.4;
    g.fillRect(cx2, HORIZON + 16 + r() * 34, cw, 3.5);
  }
  g.globalAlpha = 1;

  // distant avenue bokeh lights at night (headlights & ruby taillights)
  if (P.neon) {
    const bokehLights: [number, number, string][] = [
      [788, HORIZON + 10, '#fff2cc'], [796, HORIZON + 12, '#fff2cc'],
      [808, HORIZON + 11, '#ff4d4d'], [816, HORIZON + 13, '#ff4d4d'],
      [775, HORIZON + 16, '#ffd166'],
    ];
    for (const [bx, by, col] of bokehLights) {
      softBlob(g, bx, by, 10, col, 0.75);
      ell(g, bx, by, 2.2, 2.2, col);
    }
  }
}

function paintCityTowers(g: CanvasRenderingContext2D, T: Theme) {
  const P = cityPal[T.key];
  const r = sr(22);
  const towers: [number, number, number][] = [
    [-560, 130, 300], [-360, 170, 380], [-140, 110, 240], [40, 150, 340],
    [230, 120, 260], [420, 160, 400], [620, 130, 300], [830, 175, 380], [1060, 135, 280],
    [1260, 155, 330], [1480, 140, 290],
  ];
  for (let idx = 0; idx < towers.length; idx++) {
    const [tx, tw, th] = towers[idx];
    const top = HORIZON + 6 - th;
    const baseCol = r() > 0.5 ? P.towerA : P.towerB;

    // 3D side wall return for architectural depth
    const sideW = 22;
    const isLeftOfSun = tx < 800;
    const sx = isLeftOfSun ? tx + tw : tx - sideW;
    g.fillStyle = baseCol;
    g.fillRect(sx, top + 6, sideW, th - 6);
    g.fillStyle = isLeftOfSun ? 'rgba(255,245,220,.08)' : 'rgba(0,0,0,.24)';
    g.fillRect(sx, top + 6, sideW, th - 6);

    // main tower facade
    g.fillStyle = baseCol;
    g.fillRect(tx, top, tw, th);

    // stepped architectural crown setback + cornice ledges
    g.fillStyle = 'rgba(0,0,0,.2)';
    g.fillRect(tx - 3, top, tw + 6, 5);
    if (idx % 2 === 0) {
      g.fillStyle = baseCol;
      g.fillRect(tx + tw * 0.14, top - 22, tw * 0.72, 22);
      g.fillStyle = 'rgba(0,0,0,.22)';
      g.fillRect(tx + tw * 0.12, top - 22, tw * 0.76, 4);
    }

    // glass curtain-wall diagonal reflection sheen
    if (r() > 0.4) {
      const gl = g.createLinearGradient(tx, top, tx + tw, top + th);
      gl.addColorStop(0, P.towerGlass); gl.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gl; g.fillRect(tx + tw * 0.1, top + 5, tw * 0.34, th - 5);
    }

    // vertical stone pilasters / mullions
    g.fillStyle = 'rgba(0,0,0,.1)';
    g.fillRect(tx + 4, top + 5, 3, th - 5);
    g.fillRect(tx + tw - 7, top + 5, 3, th - 5);

    // window grid with warm interior blinds & recessed sills
    const cols = Math.max(3, Math.floor(tw / 22)), rows = Math.floor(th / 26);
    const ww = (tw - 18) / cols - 6, wh = (th - 16) / rows - 9;
    for (let c = 0; c < cols; c++) {
      for (let rw = 0; rw < rows; rw++) {
        const wx = tx + 9 + c * (tw - 18) / cols, wy = top + 11 + rw * (th - 16) / rows;
        let lit = false;
        if (P.neon) {
          lit = r() < 0.36;
          g.fillStyle = lit ? (r() < 0.35 ? P.winHi : '#bcd2f0') : P.winDim;
        } else {
          g.fillStyle = wy < top + th * 0.45 ? P.winHi : P.winLo;
        }
        g.fillRect(wx, wy, ww, wh);
        // window sill & top shadow
        g.fillStyle = 'rgba(0,0,0,.22)';
        g.fillRect(wx, wy, ww, 1.5);
        if (lit && r() < 0.45) {
          // half-drawn Venetian blind inside lit office window
          g.fillStyle = 'rgba(255,248,225,.35)';
          g.fillRect(wx, wy + 1.5, ww, wh * 0.42);
        }
      }
    }

    // roof mechanical penthouse + antenna + red aviation beacon
    g.fillStyle = 'rgba(0,0,0,.28)';
    const roofY = idx % 2 === 0 ? top - 22 : top;
    g.fillRect(tx + tw * 0.22, roofY - 14, tw * 0.26, 14);
    g.strokeStyle = 'rgba(30,35,48,.85)'; g.lineWidth = 2.4;
    g.beginPath(); g.moveTo(tx + tw * 0.7, roofY); g.lineTo(tx + tw * 0.7, roofY - 36); g.stroke();
    if (P.neon) {
      softBlob(g, tx + tw * 0.7, roofY - 38, 12, 'rgba(255,75,75,.65)', 0.9);
      ell(g, tx + tw * 0.7, roofY - 38, 2.8, 2.8, '#ff6b6b');
    }
  }
}

function paintCityShops(g: CanvasRenderingContext2D, T: Theme) {
  const P = cityPal[T.key];
  const r = sr(23);
  const base = 528;
  const shops: [number, number][] = [
    [-720, 336], [-380, 298], [-60, 356], [320, 312],
    [660, 348], [1040, 298], [1400, 338], [1760, 320],
  ];
  const signNames = ['CAFÉ', 'BOOKS', 'OPEN', 'BAKERY', 'JAZZ', 'BISTRO', 'FLORA', 'CINEMA'];

  for (let idx = 0; idx < shops.length; idx++) {
    const [sx, sw] = shops[idx];
    const sh = 158 + r() * 62, top = base - sh;
    const isAlt = r() > 0.5;
    g.fillStyle = isAlt ? P.shop : P.shopB;
    g.fillRect(sx, top, sw, sh);

    // subtle horizontal brick/stone courses & side pilaster shadow
    g.fillStyle = 'rgba(0,0,0,.09)';
    g.fillRect(sx, top, 8, sh);
    g.fillRect(sx + sw - 8, top, 8, sh);
    for (let by = top + 18; by < base - 95; by += 14) {
      g.fillRect(sx + 8, by, sw - 16, 1.2);
    }

    // ornate stepped cornice with corbel brackets
    g.fillStyle = 'rgba(0,0,0,.28)';
    g.fillRect(sx - 6, top - 9, sw + 12, 11);
    g.fillStyle = 'rgba(255,255,255,.1)';
    g.fillRect(sx - 6, top - 9, sw + 12, 2.5);
    g.fillStyle = 'rgba(0,0,0,.32)';
    for (let bx = sx + 6; bx < sx + sw - 6; bx += 22) {
      g.fillRect(bx, top + 2, 5, 7);
    }

    // upper-story arched / pedimented apartment windows
    const uCols = Math.max(3, Math.floor(sw / 78));
    const uSpacing = (sw - 36) / uCols;
    for (let uc = 0; uc < uCols; uc++) {
      const uwx = sx + 24 + uc * uSpacing;
      const uwy = top + 24;
      const uww = 26, uwh = 38;
      // window pediment lintel & sill
      poly(g, [[uwx - 3, uwy], [uwx + uww / 2, uwy - 7], [uwx + uww + 3, uwy]], 'rgba(0,0,0,.26)');
      const uLit = P.neon ? r() < 0.48 : false;
      g.fillStyle = uLit ? '#ffd88a' : (T.key === 'overcast' ? '#434f5c' : '#384656');
      g.fillRect(uwx, uwy, uww, uwh);
      // sash frame
      g.strokeStyle = 'rgba(22,26,34,.65)'; g.lineWidth = 2.2;
      g.strokeRect(uwx, uwy, uww, uwh);
      g.beginPath(); g.moveTo(uwx, uwy + uwh / 2); g.lineTo(uwx + uww, uwy + uwh / 2); g.stroke();
      // stone sill + window flower box
      g.fillStyle = 'rgba(220,215,205,.35)';
      g.fillRect(uwx - 3, uwy + uwh, uww + 6, 4);
    }

    // wrought-iron fire escape balcony & ladder on alternate buildings
    if (idx % 2 === 1) {
      const fx = sx + sw * 0.52, fy = top + 62;
      g.strokeStyle = 'rgba(20,24,32,.72)'; g.lineWidth = 1.8;
      g.strokeRect(fx, fy - 12, 68, 12);
      for (let rx = fx + 6; rx < fx + 68; rx += 7) {
        g.beginPath(); g.moveTo(rx, fy - 12); g.lineTo(rx, fy); g.stroke();
      }
      // diagonal fire-escape stair
      g.beginPath(); g.moveTo(fx + 8, fy - 12); g.lineTo(fx + 52, fy + 24); g.stroke();
    }

    // ground-floor storefront wainscoting base
    g.fillStyle = 'rgba(0,0,0,.22)';
    g.fillRect(sx + 14, base - 16, sw * 0.58, 16);

    // big storefront display window
    const wx = sx + 18, ww = sw * 0.55, wy = base - 78, wh = 62;
    if (P.neon) softBlob(g, wx + ww / 2, wy + wh / 2, 75, 'rgba(255,200,110,.25)', 0.9);
    g.fillStyle = P.neon ? '#f8c87a' : T.key === 'overcast' ? '#39434e' : '#4e6070';
    g.fillRect(wx, wy, ww, wh);
    // diagonal glass reflection
    poly(g, [[wx + 6, wy + 2], [wx + 34, wy + 2], [wx + 14, wy + wh - 2], [wx + 2, wy + wh - 2]], 'rgba(255,255,255,.12)');

    // warm interior pendant lamps & display silhouettes
    for (const px of [wx + ww * 0.28, wx + ww * 0.72]) {
      g.strokeStyle = 'rgba(30,24,20,.6)'; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(px, wy); g.lineTo(px, wy + 14); g.stroke();
      poly(g, [[px - 6, wy + 18], [px, wy + 12], [px + 6, wy + 18]], '#2b2420');
      ell(g, px, wy + 19, 3, 2, '#fff3c4');
    }
    if (P.neon) {
      g.fillStyle = 'rgba(40,30,20,.68)';
      ell(g, wx + ww * 0.34, wy + 30, 8, 10, 'rgba(40,30,20,.68)');
      g.fillRect(wx + ww * 0.34 - 11, wy + 39, 22, 23);
    }

    // storefront window frame & mullions
    g.strokeStyle = 'rgba(20,24,32,.68)'; g.lineWidth = 4;
    g.strokeRect(wx, wy, ww, wh);
    g.lineWidth = 2.5;
    g.beginPath();
    g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh);
    g.moveTo(wx, wy + 15); g.lineTo(wx + ww, wy + 15); // transom bar
    g.stroke();

    // paneled entrance door with transom window & potted topiary shrub
    const dx = sx + sw * 0.73, dw = 36, dy = base - 76, dh = 76;
    g.fillStyle = '#262c36';
    g.fillRect(dx - 3, dy - 3, dw + 6, dh + 3);
    g.fillStyle = P.neon ? '#e8b56a' : '#3a4450';
    g.fillRect(dx + 3, dy + 3, dw - 6, 14);  // transom glass
    g.fillRect(dx + 3, dy + 21, dw - 6, 30); // door glass
    g.fillStyle = '#d4af37';
    g.fillRect(dx + dw - 7, dy + 42, 2.5, 7); // brass handle
    // potted sidewalk plant beside the door
    const potX = dx - 12;
    poly(g, [[potX - 6, base - 14], [potX + 6, base - 14], [potX + 4.5, base], [potX - 4.5, base]], '#a6533b');
    ell(g, potX, base - 21, 9, 10, T.foliage[2]);
    ell(g, potX - 2, base - 23, 6.5, 7.5, T.foliage[0]);

    // striped awning with scalloped valance along the bottom edge
    const ay = base - 88, awH = 24;
    // awning cast shadow on shopfront
    g.fillStyle = 'rgba(0,0,0,.22)';
    g.fillRect(sx + 12, ay + awH, sw - 24, 9);
    // awning slope
    g.fillStyle = P.awningA;
    g.beginPath();
    g.moveTo(sx + 8, ay); g.lineTo(sx + sw - 8, ay);
    g.lineTo(sx + sw - 14, ay + awH); g.lineTo(sx + 14, ay + awH);
    g.closePath(); g.fill();
    const nStripes = 8;
    const topSeg = (sw - 16) / nStripes;
    const botSeg = (sw - 28) / nStripes;
    for (let i = 0; i < nStripes; i++) {
      const bx0 = sx + 14 + i * botSeg, bx1 = bx0 + botSeg;
      const tx0 = sx + 8 + i * topSeg, tx1 = tx0 + topSeg;
      const col = i % 2 === 0 ? P.awningB : P.awningA;
      if (i % 2 === 0) {
        poly(g, [[tx0, ay], [tx1, ay], [bx1, ay + awH], [bx0, ay + awH]], col);
      }
      // scalloped valance flap at bottom
      g.fillStyle = col;
      g.beginPath();
      g.moveTo(bx0, ay + awH);
      g.quadraticCurveTo((bx0 + bx1) / 2, ay + awH + 8, bx1, ay + awH);
      g.closePath(); g.fill();
    }

    // sidewalk A-frame chalkboard sign in front of alternate shops
    if (idx % 2 === 0) {
      const cx2 = sx + sw * 0.64;
      g.strokeStyle = '#5c4028'; g.lineWidth = 2.2;
      g.beginPath();
      g.moveTo(cx2 - 7, base + 2); g.lineTo(cx2, base - 20); g.lineTo(cx2 + 7, base + 2);
      g.stroke();
      poly(g, [[cx2 - 5, base - 3], [cx2 - 1, base - 18], [cx2 + 5, base - 18], [cx2 + 2, base - 3]], '#262b30');
    }

    // neon signs at night (or vintage signboard in day)
    const label = signNames[idx % signNames.length];
    if (P.neon) {
      const neonCols = ['#ff5f8a', '#4fd6c8', '#ffd166'];
      const nc = neonCols[(idx + 1) % 3];
      const nx = sx + 22, ny = top + 72;
      softBlob(g, nx + 38, ny + 13, 64, nc, 0.38);
      g.fillStyle = 'rgba(15,18,26,.85)';
      g.beginPath(); g.roundRect(nx, ny, 76, 26, 7); g.fill();
      g.strokeStyle = nc; g.lineWidth = 3.0;
      g.beginPath(); g.roundRect(nx, ny, 76, 26, 7); g.stroke();
      g.fillStyle = nc; g.font = 'bold 15px sans-serif';
      g.fillText(label, nx + 11, ny + 18);

      // vertical projecting blade neon sign
      const vc = neonCols[(idx + 2) % 3];
      const vx = sx + sw - 26, vy = top + 30;
      softBlob(g, vx + 9, vy + 36, 48, vc, 0.3);
      g.fillStyle = 'rgba(15,18,26,.85)';
      g.beginPath(); g.roundRect(vx, vy, 18, 72, 5); g.fill();
      g.strokeStyle = vc; g.lineWidth = 2.8;
      g.beginPath(); g.roundRect(vx, vy, 18, 72, 5); g.stroke();
      for (let d = 0; d < 4; d++) ell(g, vx + 9, vy + 14 + d * 15, 3, 3, vc);
    } else {
      // classic painted shop fascia signboard during day
      const nx = sx + 22, ny = base - 116;
      g.fillStyle = '#2c333e';
      g.beginPath(); g.roundRect(nx, ny, 82, 22, 4); g.fill();
      g.strokeStyle = '#d4af37'; g.lineWidth = 1.5;
      g.beginPath(); g.roundRect(nx + 2, ny + 2, 78, 18, 3); g.stroke();
      g.fillStyle = '#f4ebd9'; g.font = 'bold 13px sans-serif';
      g.fillText(label, nx + 14, ny + 15);
    }
  }

  // urban sidewalk trees in tree grates
  for (const tx of [-540, 120, 840, 1520]) {
    g.save(); g.translate(tx, base + 2);
    ell(g, 0, 2, 22, 5, 'rgba(0,0,0,.28)');
    g.fillStyle = '#4a382b';
    g.beginPath();
    g.moveTo(-5, 0); g.lineTo(-3, -78); g.lineTo(3, -78); g.lineTo(5, 0);
    g.closePath(); g.fill();
    ell(g, 0, -96, 36, 30, T.foliage[2]);
    ell(g, -14, -88, 26, 22, T.foliage[0]);
    ell(g, 14, -90, 26, 22, T.foliage[0]);
    ell(g, -4, -104, 28, 22, T.foliage[1]);
    g.restore();
  }

  // ornate cast-iron street lamps on the sidewalk
  for (const lx of [-240, 380, 1000, 1620]) {
    g.save(); g.translate(lx, base);
    // fluted base & column
    poly(g, [[-8, 2], [-5, -24], [5, -24], [8, 2]], '#1a1f28');
    g.fillStyle = '#1d222c';
    g.fillRect(-3.2, -172, 6.4, 150);
    // curved scroll bracket arm
    g.strokeStyle = '#1d222c'; g.lineWidth = 4;
    g.beginPath();
    g.moveTo(0, -154); g.quadraticCurveTo(-2, -174, -28, -172);
    g.stroke();
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(-2, -144); g.quadraticCurveTo(-12, -164, -22, -170);
    g.stroke();
    // lantern cap
    poly(g, [[-38, -166], [-28, -175], [-18, -166]], '#1d222c');
    if (P.lampGlow) {
      softBlob(g, -28, -158, 76, P.lampGlow, 1);
      softBlob(g, -28, -158, 28, 'rgba(255,235,175,.85)', 1);
      ell(g, -28, -158, 7.5, 9.5, '#fff0b8');
    } else {
      ell(g, -28, -158, 7.5, 9.5, '#d8dde4');
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
  g.fillStyle = 'rgba(0,0,0,.22)';
  g.fillRect(-800, 526, 3600, 3.5);     // building baseline

  // sidewalk shading near the road
  g.fillStyle = 'rgba(255,255,255,.06)';
  g.beginPath();
  g.moveTo(800 - halfAt(1900) - 420, 1900); g.lineTo(800 - halfAt(vp) - 30, vp);
  g.lineTo(800 - halfAt(vp) - 4, vp); g.lineTo(800 - halfAt(1900) - 60, 1900);
  g.closePath(); g.fill();
  g.beginPath();
  g.moveTo(800 + halfAt(1900) + 420, 1900); g.lineTo(800 + halfAt(vp) + 30, vp);
  g.lineTo(800 + halfAt(vp) + 4, vp); g.lineTo(800 + halfAt(1900) + 60, 1900);
  g.closePath(); g.fill();

  // road asphalt
  g.fillStyle = P.road;
  poly(g, [[800 - halfAt(vp), vp], [800 + halfAt(vp), vp], [800 + halfAt(1900), 1900], [800 - halfAt(1900), 1900]], P.road);

  // subtle wet-asphalt reflection sheen & neon glints at night
  if (P.neon) {
    const rSheen = g.createLinearGradient(620, vp, 980, vp);
    rSheen.addColorStop(0, 'rgba(255,95,138,.06)');
    rSheen.addColorStop(0.5, 'rgba(255,210,120,.08)');
    rSheen.addColorStop(1, 'rgba(79,214,200,.06)');
    poly(g, [[800 - halfAt(vp), vp], [800 + halfAt(vp), vp], [800 + halfAt(1900), 1900], [800 - halfAt(1900), 1900]], 'rgba(0,0,0,.12)');
    g.fillStyle = rSheen;
    g.beginPath();
    g.moveTo(800 - halfAt(vp), vp); g.lineTo(800 + halfAt(vp), vp);
    g.lineTo(800 + halfAt(1900), 1900); g.lineTo(800 - halfAt(1900), 1900);
    g.closePath(); g.fill();
  }

  // curbs with granite block joints
  g.strokeStyle = P.curb; g.lineWidth = 5;
  g.beginPath(); g.moveTo(800 - halfAt(vp) - 2, vp); g.lineTo(800 - halfAt(1900) - 26, 1900); g.stroke();
  g.beginPath(); g.moveTo(800 + halfAt(vp) + 2, vp); g.lineTo(800 + halfAt(1900) + 26, 1900); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(800 - halfAt(vp) - 4, vp); g.lineTo(800 - halfAt(1900) - 29, 1900); g.stroke();
  g.beginPath(); g.moveTo(800 + halfAt(vp) + 4, vp); g.lineTo(800 + halfAt(1900) + 29, 1900); g.stroke();

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

  // perspective zebra crosswalk
  g.fillStyle = P.roadLine;
  for (let i = -3; i <= 3; i++) {
    const cx0 = 800 + i * 24, cx1 = 800 + i * 27;
    poly(g, [
      [cx0 - 6, 696], [cx0 + 6, 696],
      [cx1 + 7.5, 750], [cx1 - 7.5, 750],
    ], P.roadLine);
  }

  // cast-iron manhole covers with waffle grid & rising steam wisps
  for (const [mx, my] of [[680, 760], [940, 940]]) {
    ell(g, mx, my + 2, 22, 8, 'rgba(0,0,0,.35)');
    ell(g, mx, my, 21, 7.5, '#2c313b');
    g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 1.4;
    g.beginPath(); g.ellipse(mx, my, 16, 5.5, 0, 0, Math.PI * 2); g.stroke();
    g.beginPath();
    g.moveTo(mx - 14, my); g.lineTo(mx + 14, my);
    g.moveTo(mx, my - 5); g.lineTo(mx, my + 5);
    g.stroke();
    // subtle rising street-steam wisp
    softBlob(g, mx - 4, my - 16, 18, 'rgba(235,240,248,.14)', 0.9);
    softBlob(g, mx + 5, my - 34, 24, 'rgba(235,240,248,.09)', 0.8);
  }

  // sidewalk flagstone paving joints
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 1.6;
  for (let sy2 = vp + 20; sy2 < 1900; sy2 += 44 + (sy2 - vp) / 14) {
    const off = halfAt(sy2) + 26;
    g.beginPath(); g.moveTo(800 - off, sy2); g.lineTo(800 - off - 45 - (sy2 - vp) / 6, sy2 + 12); g.stroke();
    g.beginPath(); g.moveTo(800 + off, sy2); g.lineTo(800 + off + 45 + (sy2 - vp) / 6, sy2 + 12); g.stroke();
  }
  if (P.lampGlow) {
    for (const lx of [-240, 380, 1000, 1620]) {
      const py = 660 + Math.abs(lx - 380) * 0.06;
      ell(g, lx - 10, py, 96, 22, 'rgba(255,190,90,.10)');
    }
  }
}

function paintCityFg(g: CanvasRenderingContext2D, T: Theme) {
  const P = cityPal[T.key];

  // detailed cast-iron fire hydrant, bottom-left
  g.save(); g.translate(250, 1060);
  ell(g, 4, 8, 34, 8, 'rgba(0,0,0,.34)');
  // base flange
  g.fillStyle = '#5c1912';
  g.beginPath(); g.roundRect(-20, -6, 40, 12, 4); g.fill();
  // main fluted barrel
  g.fillStyle = P.hydrant;
  g.beginPath(); g.roundRect(-15, -78, 30, 76, 6); g.fill();
  // vertical flutes & specular highlight
  g.fillStyle = 'rgba(255,255,255,.2)';
  g.beginPath(); g.roundRect(-12, -74, 6, 66, 3); g.fill();
  g.fillStyle = 'rgba(0,0,0,.2)';
  g.beginPath(); g.roundRect(6, -74, 6, 66, 3); g.fill();
  // upper collar & domed bonnet
  g.fillStyle = '#802118';
  g.beginPath(); g.roundRect(-19, -82, 38, 8, 3); g.fill();
  g.fillStyle = P.hydrant;
  g.beginPath(); g.arc(0, -82, 16, Math.PI, 0); g.fill();
  // top pentagon operating nut
  poly(g, [[-6, -97], [0, -103], [6, -97], [4, -93], [-4, -93]], '#e8c79a');
  // side hose nozzles + front pumper nozzle + hanging chain
  g.fillStyle = P.hydrant;
  g.fillRect(-24, -61, 48, 12);
  ell(g, -25, -55, 6.5, 6.5, '#d6b68a');
  ell(g, 25, -55, 6.5, 6.5, '#d6b68a');
  ell(g, 0, -52, 9.5, 9.5, '#7a1f16');
  ell(g, 0, -52, 7, 7, '#e8c79a');
  ell(g, 0, -52, 2.8, 2.8, '#9e825c');
  g.strokeStyle = 'rgba(220,205,180,.55)'; g.lineWidth = 1.4;
  g.beginPath(); g.moveTo(-24, -52); g.quadraticCurveTo(-14, -36, -2, -46); g.stroke();
  g.restore();

  // vintage coin parking meter, right
  g.save(); g.translate(1380, 1075);
  ell(g, 0, 6, 24, 6.5, 'rgba(0,0,0,.32)');
  // post & collar
  g.fillStyle = '#262b34'; g.fillRect(-4.5, -148, 9, 152);
  g.fillStyle = 'rgba(255,255,255,.15)'; g.fillRect(-3.5, -148, 2.5, 152);
  g.fillStyle = '#1b1f26'; g.beginPath(); g.roundRect(-9, -152, 18, 8, 2); g.fill();
  // arched meter housing
  g.fillStyle = '#3a414d';
  g.beginPath();
  g.moveTo(-18, -148); g.lineTo(-18, -182);
  g.arc(0, -182, 18, Math.PI, 0);
  g.lineTo(18, -148); g.closePath(); g.fill();
  // arched dial window with time scale & needle
  g.fillStyle = T.key === 'night' ? '#b8f0e2' : '#e6f2ec';
  g.beginPath(); g.arc(0, -179, 13, Math.PI, 0); g.closePath(); g.fill();
  // red "violation/time" sector & dial ticks
  g.fillStyle = '#e04f4f';
  g.beginPath(); g.moveTo(0, -179); g.arc(0, -179, 11.5, Math.PI * 1.72, Math.PI * 2); g.closePath(); g.fill();
  g.strokeStyle = '#23272f'; g.lineWidth = 1.6;
  g.beginPath(); g.moveTo(0, -179); g.lineTo(-5, -188); g.stroke();
  // coin slot & turn knob
  g.fillStyle = '#1f232b'; g.fillRect(-11, -172, 22, 4);
  g.fillStyle = '#8f97a3'; g.fillRect(4, -164, 5, 8);
  ell(g, -4, -160, 4.5, 4.5, '#8f97a3');
  g.restore();

  // lifelike city pigeons (one standing alert, one pecking crumbs)
  const drawPigeon = (px: number, py: number, sc: number, pecking: boolean) => {
    g.save(); g.translate(px, py); g.scale(sc, sc);
    ell(g, -2, 16, 22, 5, 'rgba(0,0,0,.26)');
    // coral legs & toes
    g.strokeStyle = '#d96b52'; g.lineWidth = 2.4; g.lineCap = 'round';
    g.beginPath();
    g.moveTo(-2, 6); g.lineTo(-4, 15); g.moveTo(-8, 15); g.lineTo(1, 15);
    g.moveTo(7, 6); g.lineTo(6, 15); g.moveTo(2, 15); g.lineTo(11, 15);
    g.stroke();
    // tail feathers
    poly(g, [[-18, 0], [-44, -9], [-41, 4], [-16, 6]], '#4a5264');
    poly(g, [[-36, -6], [-42, -8], [-39, 3], [-33, 2]], '#262b36'); // dark tail band
    // plump body
    ell(g, -2, 0, 23, 14, '#7d879c');
    // wing with two signature black wing bars
    ell(g, -5, -1, 17, 10, '#96a0b5');
    g.strokeStyle = '#2d3340'; g.lineWidth = 2.8;
    g.beginPath();
    g.moveTo(-12, -8); g.quadraticCurveTo(-10, 0, -14, 6);
    g.moveTo(-5, -9); g.quadraticCurveTo(-3, -1, -7, 6);
    g.stroke();
    // neck & iridescent green/violet gorget sheen
    g.save();
    if (pecking) { g.translate(14, 4); g.rotate(0.65); }
    else { g.translate(15, -8); }
    ell(g, 0, 2, 8.5, 9, '#687288');
    ell(g, 1, 3, 6.5, 5.5, '#3b9c88'); // green iridescence
    ell(g, -1, 6, 6, 4, '#7d5296');    // purple iridescence
    // head, orange eye & beak with white cere
    ell(g, 3, -5, 7.5, 6.8, '#5c657a');
    poly(g, [[9, -6], [16, -3.5], [9, -2]], '#333842');
    ell(g, 9.5, -5.5, 2.2, 1.5, '#f0ece1'); // white cere
    ell(g, 4.5, -6, 2.1, 2.1, '#e67e22');
    ell(g, 4.5, -6, 0.9, 0.9, '#111');
    g.restore();
    g.restore();
  };
  drawPigeon(920, 1010, 1.0, false);
  drawPigeon(995, 1028, 0.88, true);
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
  grd.addColorStop(0.68, P.backGlow);
  grd.addColorStop(1, P.wallB);
  g.fillStyle = grd; g.fillRect(-800, -700, 3600, DH + 1600);

  if (T.stars) {
    for (let i = 0; i < 110; i++) {
      const x = -800 + r() * 3600, y = -700 + r() * 800;
      g.globalAlpha = 0.12 + r() * 0.55; g.fillStyle = '#dfe8ff';
      g.beginPath(); g.arc(x, y, 0.8 + r() * 0.8, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
  }

  // distant misty woodland ridge
  g.fillStyle = P.wallA;
  g.globalAlpha = 0.55;
  g.beginPath(); g.moveTo(-800, HORIZON + 40);
  for (let rx = -800; rx <= 2800; rx += 90) {
    g.lineTo(rx + 45, HORIZON - 110 - Math.sin(rx * 0.005) * 65 - r() * 45);
  }
  g.lineTo(2800, HORIZON + 40); g.closePath(); g.fill();
  g.globalAlpha = 1;

  // far canopy wall (jagged spruce & broadleaf crowns)
  g.fillStyle = P.wallA;
  g.beginPath(); g.moveTo(-800, HORIZON + 40);
  let x = -800;
  while (x < 2800) {
    const w = 38 + r() * 82, h = 65 + r() * 165;
    g.lineTo(x + w * 0.25, HORIZON + 12 - h * 0.55);
    g.lineTo(x + w / 2, HORIZON + 20 - h);
    g.lineTo(x + w * 0.75, HORIZON + 12 - h * 0.6);
    g.lineTo(x + w, HORIZON + 10 - h * 0.35);
    x += w;
  }
  g.lineTo(2800, HORIZON + 40); g.closePath(); g.fill();

  // cathedral-like ancient tree trunks & boughs in the mist
  g.fillStyle = P.wallB;
  for (let i = 0; i < 18; i++) {
    const tx = -750 + i * 195 + (r() - 0.5) * 60;
    const tw = 11 + r() * 10, th = 140 + r() * 110;
    g.fillRect(tx, HORIZON - th + 40, tw, th + 20);
    // reaching upper branch in mist
    g.strokeStyle = P.wallB; g.lineWidth = tw * 0.45;
    g.beginPath();
    g.moveTo(tx + tw / 2, HORIZON - th * 0.45);
    g.quadraticCurveTo(tx + (i % 2 ? 28 : -28), HORIZON - th * 0.65, tx + (i % 2 ? 52 : -52), HORIZON - th * 0.78);
    g.stroke();
  }

  const mg = g.createLinearGradient(0, HORIZON - 170, 0, HORIZON + 45);
  mg.addColorStop(0, 'rgba(0,0,0,0)'); mg.addColorStop(1, P.mist);
  g.fillStyle = mg; g.fillRect(-800, HORIZON - 170, 3600, 215);

  // volumetric sunbeams / god rays with floating golden pollen motes
  if (P.shafts) {
    for (const [sx2, sw2] of [[180, 85], [560, 135], [980, 95], [1360, 115]]) {
      const rayG = g.createLinearGradient(0, -400, 0, HORIZON + 40);
      rayG.addColorStop(0, 'rgba(255,242,195,.14)');
      rayG.addColorStop(1, 'rgba(255,235,180,.03)');
      poly(g, [
        [sx2, -700], [sx2 + sw2, -700],
        [sx2 + sw2 * 2.4 + 170, HORIZON + 40],
        [sx2 + sw2 * 2.4 - 60, HORIZON + 40],
      ], 'rgba(255,242,200,.085)');
      g.fillStyle = rayG;
      g.beginPath();
      g.moveTo(sx2, -700); g.lineTo(sx2 + sw2, -700);
      g.lineTo(sx2 + sw2 * 2.4 + 170, HORIZON + 40);
      g.lineTo(sx2 + sw2 * 2.4 - 60, HORIZON + 40);
      g.closePath(); g.fill();
    }
    // sunlit pollen motes floating in the beams
    for (let i = 0; i < 36; i++) {
      const px = 220 + r() * 1450, py = 60 + r() * 380;
      ell(g, px, py, 1.5 + r() * 1.5, 1.5 + r() * 1.5, 'rgba(255,246,205,.55)');
    }
  }
}

function fir(g: CanvasRenderingContext2D, x: number, base: number, h: number, w: number, color: string) {
  // x = center, base = ground line, h = tree height, w ≈ half-width at the base
  // tapered trunk with flared root base
  g.fillStyle = '#4a3829';
  poly(g, [
    [x - w * 0.11, base + 2],
    [x - w * 0.055, base - h * 0.25],
    [x + w * 0.055, base - h * 0.25],
    [x + w * 0.11, base + 2],
  ], '#4a3829');

  // 6 organic drooping bough tiers from top to bottom
  const tiers = 6;
  for (let i = 0; i < tiers; i++) {
    const t = i / (tiers - 1); // 0 = top spire, 1 = lowest bough
    const tierTop = base - h + t * (h * 0.72);
    const tierH = (h * 0.24) * (0.55 + t * 0.65);
    const tierBot = tierTop + tierH;
    const tw = w * (0.22 + t * 0.82);

    // main bough silhouette with scalloped needle tips
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(x, tierTop);
    g.quadraticCurveTo(x + tw * 0.45, tierTop + tierH * 0.55, x + tw, tierBot);
    g.quadraticCurveTo(x + tw * 0.65, tierBot + 6, x + tw * 0.35, tierBot - 3);
    g.quadraticCurveTo(x, tierBot + 8, x - tw * 0.35, tierBot - 3);
    g.quadraticCurveTo(x - tw * 0.65, tierBot + 6, x - tw, tierBot);
    g.quadraticCurveTo(x - tw * 0.45, tierTop + tierH * 0.55, x, tierTop);
    g.closePath();
    g.fill();

    // sunlit left needle cluster highlight
    g.fillStyle = 'rgba(200,235,175,.09)';
    g.beginPath();
    g.moveTo(x, tierTop);
    g.quadraticCurveTo(x - tw * 0.45, tierTop + tierH * 0.55, x - tw * 0.92, tierBot - 1);
    g.quadraticCurveTo(x - tw * 0.4, tierBot + 2, x - tw * 0.1, tierBot - 2);
    g.closePath();
    g.fill();

    // shaded right bough side
    g.fillStyle = 'rgba(0,0,0,.18)';
    g.beginPath();
    g.moveTo(x, tierTop);
    g.quadraticCurveTo(x + tw * 0.45, tierTop + tierH * 0.55, x + tw, tierBot);
    g.quadraticCurveTo(x + tw * 0.55, tierBot + 5, x, tierBot + 4);
    g.closePath();
    g.fill();
  }
}

function paintForestFar(g: CanvasRenderingContext2D, T: Theme) {
  const P = forestPal[T.key];
  const r = sr(62);
  for (let i = 0; i < 16; i++) {
    fir(g, -700 + i * 230 + r() * 90, HORIZON + 28, 195 + r() * 135, 88 + r() * 48, P.firFar);
  }
  const mg = g.createLinearGradient(0, HORIZON - 140, 0, HORIZON + 45);
  mg.addColorStop(0, 'rgba(0,0,0,0)'); mg.addColorStop(1, P.mist);
  g.fillStyle = mg; g.fillRect(-800, HORIZON - 140, 3600, 190);
}

function paintForestMid(g: CanvasRenderingContext2D, T: Theme) {
  const P = forestPal[T.key];
  const r = sr(63);
  for (let i = 0; i < 9; i++) {
    fir(g, -600 + i * 430 + r() * 160, HORIZON + 90, 325 + r() * 185, 145 + r() * 68, P.firMid);
  }
  // ancient gnarled broadleaf oaks with fork limbs & layered foliage
  for (const [tx, th] of [[-380, 420], [260, 360], [1180, 400], [1720, 340]]) {
    g.save();
    g.fillStyle = P.trunkMid;
    g.beginPath();
    g.moveTo(tx - 24, HORIZON + 72);
    g.quadraticCurveTo(tx - 10, HORIZON + 20, tx - 8, HORIZON - th * 0.5);
    g.lineTo(tx - 3, HORIZON - th);
    g.lineTo(tx + 15, HORIZON - th);
    g.quadraticCurveTo(tx + 18, HORIZON - th * 0.45, tx + 30, HORIZON + 72);
    g.closePath(); g.fill();
    // bark highlight on left
    g.fillStyle = 'rgba(255,235,200,.1)';
    g.fillRect(tx - 8, HORIZON - th * 0.8, 5, th * 0.8);
    // fork branches
    g.strokeStyle = P.trunkMid; g.lineWidth = 9; g.lineCap = 'round';
    g.beginPath();
    g.moveTo(tx, HORIZON - th * 0.65); g.quadraticCurveTo(tx - 36, HORIZON - th * 0.82, tx - 58, HORIZON - th * 0.95);
    g.moveTo(tx + 8, HORIZON - th * 0.72); g.quadraticCurveTo(tx + 42, HORIZON - th * 0.86, tx + 64, HORIZON - th * 0.98);
    g.stroke();
    // multi-dome canopy
    ell(g, tx + 6, HORIZON - th - 22, 98, 62, P.firMid);
    ell(g, tx - 46, HORIZON - th + 6, 74, 48, P.firFar);
    ell(g, tx + 52, HORIZON - th + 4, 72, 46, P.firFar);
    ell(g, tx - 10, HORIZON - th - 32, 68, 42, P.wallA);
    g.restore();
  }

  // graceful woodland stag (deer with antlers) standing in the glade on the right-center
  g.save(); g.translate(1035, HORIZON + 82);
  ell(g, 0, 2, 24, 5, 'rgba(0,0,0,.22)');
  const deerCol = T.key === 'night' ? '#1c2b24' : '#7a5235';
  const deerHi = T.key === 'night' ? '#283d33' : '#9c6b46';
  // slender legs
  g.strokeStyle = deerCol; g.lineWidth = 2.8; g.lineCap = 'round';
  g.beginPath();
  g.moveTo(-13, -18); g.lineTo(-15, 2);
  g.moveTo(-7, -18); g.lineTo(-5, 2);
  g.moveTo(9, -18); g.lineTo(8, 2);
  g.moveTo(14, -18); g.lineTo(16, 2);
  g.stroke();
  // torso & cream tail
  ell(g, 0, -21, 18, 9.5, deerCol);
  ell(g, -2, -23, 14, 6.5, deerHi);
  ell(g, -18, -23, 3.5, 2.2, '#e8dcc8');
  // proud neck & head looking left
  poly(g, [[8, -24], [16, -22], [19, -42], [12, -42]], deerCol);
  ell(g, 13, -44, 6.5, 4.2, deerCol);
  ell(g, 8, -44, 4.5, 2.8, deerCol); // muzzle
  // ears
  ell(g, 17, -48, 2.2, 4.2, deerCol);
  // branching antlers
  g.strokeStyle = T.key === 'night' ? '#3a4a42' : '#d6c5a9'; g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(15, -47); g.quadraticCurveTo(12, -58, 6, -64);
  g.moveTo(11, -55); g.lineTo(7, -58);
  g.moveTo(13, -59); g.lineTo(15, -64);
  g.moveTo(17, -47); g.quadraticCurveTo(22, -57, 26, -63);
  g.moveTo(21, -55); g.lineTo(25, -57);
  g.stroke();
  g.restore();
}

function paintForestNear(g: CanvasRenderingContext2D, T: Theme) {
  const P = forestPal[T.key];
  const r = sr(64);

  // --- Big silver birch framing the left edge with bark curls & upper branch ---
  // flared mossy root buttress at base
  poly(g, [[28, DH + 900], [58, 720], [162, 720], [196, DH + 900]], P.birch);
  g.fillStyle = P.birch;
  g.beginPath();
  g.moveTo(20, -700); g.quadraticCurveTo(80, 200, 60, DH + 900);
  g.lineTo(160, DH + 900); g.quadraticCurveTo(150, 200, 110, -700);
  g.closePath(); g.fill();
  // shaded right side of birch trunk
  g.fillStyle = 'rgba(0,0,0,.16)';
  g.beginPath();
  g.moveTo(85, -700); g.quadraticCurveTo(125, 200, 128, DH + 900);
  g.lineTo(160, DH + 900); g.quadraticCurveTo(150, 200, 110, -700);
  g.closePath(); g.fill();
  // overhead birch branch reaching across top-left with hanging leaf clusters
  g.strokeStyle = P.birch; g.lineWidth = 16; g.lineCap = 'round';
  g.beginPath(); g.moveTo(118, 175); g.quadraticCurveTo(235, 130, 365, 95); g.stroke();
  g.lineWidth = 8;
  g.beginPath(); g.moveTo(235, 132); g.quadraticCurveTo(295, 165, 345, 178); g.stroke();
  for (const [lx, ly, lr] of [[240, 118, 38], [305, 102, 44], [365, 96, 36], [325, 168, 32], [190, 142, 34]]) {
    ell(g, lx, ly + 4, lr, lr * 0.72, P.fern[2]);
    ell(g, lx - 4, ly - 2, lr * 0.82, lr * 0.62, P.fern[1]);
  }
  // dark diamond bark scars & horizontal lenticels on birch
  g.fillStyle = P.birchDash;
  for (let i = 0; i < 20; i++) {
    const t = i / 20, y = -600 + t * (DH + 1400);
    const cx2 = 82 + t * 38;
    const bx = cx2 - 26 + r() * 38, bw = 18 + r() * 18;
    g.fillRect(bx, y, bw, 4.5 + r() * 3);
    if (i % 3 === 0) {
      poly(g, [[bx - 4, y + 2], [bx + 6, y - 5], [bx + 14, y + 2], [bx + 6, y + 9]], P.birchDash);
    }
  }
  // mossy collar at base of birch
  ell(g, 112, 765, 58, 18, P.fern[2]);
  ell(g, 108, 762, 46, 13, P.fern[0]);

  // --- Ancient rough-barked pine/oak trunk framing the right edge ---
  g.fillStyle = P.trunkMid;
  g.beginPath();
  g.moveTo(1460, -700); g.quadraticCurveTo(1520, 200, 1530, DH + 900);
  g.lineTo(1620, DH + 900); g.quadraticCurveTo(1600, 200, 1550, -700);
  g.closePath(); g.fill();
  // vertical bark crevices & sunlit left rim
  g.strokeStyle = 'rgba(255,235,195,.12)'; g.lineWidth = 5;
  g.beginPath(); g.moveTo(1464, -700); g.quadraticCurveTo(1524, 200, 1534, DH + 900); g.stroke();
  g.strokeStyle = 'rgba(0,0,0,.26)'; g.lineWidth = 3.5;
  for (const ox of [18, 38, 58]) {
    g.beginPath(); g.moveTo(1465 + ox, -700); g.quadraticCurveTo(1525 + ox, 200, 1535 + ox, DH + 900); g.stroke();
  }
  // bracket / shelf fungi (polypore mushrooms) growing on the right tree trunk
  for (const [fy, fs] of [[420, 1.1], [436, 0.85], [585, 1.25], [602, 0.9]]) {
    g.save(); g.translate(1516, fy); g.scale(fs, fs);
    ell(g, -4, 3, 16, 6, '#5c3c24');
    ell(g, -5, 0, 15, 5.5, '#d9ab6c');
    ell(g, -4, -1, 10, 3.5, '#f2d5a7');
    g.restore();
  }
  // climbing ivy vine wrapping the right trunk
  g.strokeStyle = P.fern[2]; g.lineWidth = 2.5;
  g.beginPath(); g.moveTo(1532, 780); g.quadraticCurveTo(1560, 620, 1525, 480); g.quadraticCurveTo(1555, 360, 1520, 240); g.stroke();
  for (let iy = 260; iy <= 740; iy += 34) {
    const ix = 1532 + Math.sin(iy * 0.03) * 14;
    ell(g, ix - 6, iy, 7, 5, P.fern[0]);
    ell(g, ix + 6, iy - 12, 7, 5, P.fern[1]);
  }

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
  fern(175, 765, 1.15, -0.18);
  fern(235, 775, 0.95, 0.08);
  fern(305, 790, 0.9, 0.22);
  fern(1420, 780, 1.05, -0.35);
  fern(1465, 792, 0.9, 0.15);

  // woodland bluebell / foxglove flower spikes near the birch base
  for (const [bx, by, sc] of [[215, 778, 1.0], [232, 786, 0.85], [1395, 788, 0.95]]) {
    g.save(); g.translate(bx, by); g.scale(sc, sc);
    g.strokeStyle = P.fern[0]; g.lineWidth = 2.2;
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(4, -24, 12, -44); g.stroke();
    const bellCol = T.key === 'night' ? '#7a8cff' : '#8c7ae6';
    for (let k = 0; k < 5; k++) {
      const t = 0.3 + k * 0.16;
      const px = 8 * t, py = -44 * t;
      ell(g, px + 4, py + 3, 3.2, 4.5, bellCol);
    }
    g.restore();
  }

  // fireflies at night
  if (P.fireflies) {
    for (let i = 0; i < 24; i++) {
      const fx = -500 + r() * 3000, fy = 80 + r() * 580;
      softBlob(g, fx, fy, 20, 'rgba(217,245,138,.78)', 0.92);
      ell(g, fx, fy, 2.0, 2.0, '#fbffcf');
    }
  }
}

function paintForestFloor(g: CanvasRenderingContext2D, T: Theme) {
  const P = forestPal[T.key];
  const r = sr(65);
  const grd = g.createLinearGradient(0, 610, 0, DH + 900);
  grd.addColorStop(0, P.floorA); grd.addColorStop(1, P.floorB);

  // contoured mossy forest glade top edge (mounds instead of flat line)
  g.fillStyle = grd;
  g.beginPath();
  g.moveTo(-800, 622);
  g.quadraticCurveTo(-280, 604, 240, 620);
  g.quadraticCurveTo(680, 632, 1140, 612);
  g.quadraticCurveTo(1680, 598, 2800, 622);
  g.lineTo(2800, DH + 1700);
  g.lineTo(-800, DH + 1700);
  g.closePath();
  g.fill();

  // winding dirt & moss woodland trail through the glade
  g.save();
  g.fillStyle = T.key === 'night' ? 'rgba(22,20,16,.55)' : 'rgba(115,88,58,.42)';
  g.beginPath();
  g.moveTo(740, 622);
  g.quadraticCurveTo(690, 820, 770, DH + 600);
  g.lineTo(940, DH + 600);
  g.quadraticCurveTo(830, 820, 810, 622);
  g.closePath(); g.fill();
  g.restore();

  // soft dappled canopy shade & sunlit floor patches
  for (let i = 0; i < 7; i++) {
    softBlob(g, -600 + r() * 3000, 720 + r() * 500, 200 + r() * 240, 'rgba(0,0,0,.17)', 0.42);
  }
  if (P.shafts) {
    for (const [lx, ly, lr] of [[520, 740, 140], [820, 810, 170], [1140, 760, 130]]) {
      ell(g, lx, ly, lr, lr * 0.28, 'rgba(255,240,175,.14)');
    }
  }

  // mossy woodland boulders & fallen log with shelf moss
  const drawMossyRock = (rx: number, ry: number, rw: number, rh: number) => {
    g.save(); g.translate(rx, ry);
    ell(g, 0, 5, rw * 1.05, rh * 0.35, 'rgba(0,0,0,.26)');
    // stone body
    g.fillStyle = T.key === 'night' ? '#2c3238' : '#6e7378';
    g.beginPath();
    g.moveTo(-rw, 2);
    g.quadraticCurveTo(-rw * 0.85, -rh, -rw * 0.15, -rh * 1.05);
    g.quadraticCurveTo(rw * 0.75, -rh * 0.92, rw, 2);
    g.quadraticCurveTo(0, 8, -rw, 2);
    g.closePath(); g.fill();
    // shaded right rock face
    poly(g, [[-rw * 0.1, -rh], [rw * 0.75, -rh * 0.85], [rw, 2], [0, 6]], 'rgba(0,0,0,.2)');
    // plush green moss cap on top of rock
    g.fillStyle = P.fern[0];
    g.beginPath();
    g.moveTo(-rw * 0.78, -rh * 0.42);
    g.quadraticCurveTo(-rw * 0.2, -rh * 1.12, rw * 0.65, -rh * 0.52);
    g.quadraticCurveTo(rw * 0.2, -rh * 0.22, -rw * 0.2, -rh * 0.35);
    g.quadraticCurveTo(-rw * 0.5, -rh * 0.18, -rw * 0.78, -rh * 0.42);
    g.closePath(); g.fill();
    ell(g, -rw * 0.2, -rh * 0.75, rw * 0.35, rh * 0.22, P.fern[1]);
    g.restore();
  };
  drawMossyRock(430, 825, 48, 32);
  drawMossyRock(475, 836, 28, 19);
  drawMossyRock(1235, 895, 56, 36);

  // fallen mossy log on left-mid floor
  g.save(); g.translate(1080, 745); g.rotate(0.08);
  ell(g, 0, 9, 92, 11, 'rgba(0,0,0,.25)');
  g.fillStyle = P.trunkMid;
  g.beginPath(); g.roundRect(-84, -12, 168, 22, 9); g.fill();
  g.fillStyle = 'rgba(0,0,0,.22)';
  g.fillRect(-84, 0, 168, 10);
  // hollow log end rings
  ell(g, -82, -1, 7, 11, '#3b2d20');
  ell(g, -82, -1, 4.5, 7.5, '#8c6d4e');
  // moss blanket along top of log
  ell(g, -18, -11, 46, 5.5, P.fern[0]);
  ell(g, 34, -10, 32, 4.5, P.fern[1]);
  g.restore();

  // leaf litter & colorful fallen autumn leaves (amber, russet, gold)
  const leafCols = [P.litter, 'rgba(185,95,45,.55)', 'rgba(215,155,55,.5)', 'rgba(145,70,35,.5)'];
  for (let i = 0; i < 340; i++) {
    const x = -800 + r() * 3600, y = 640 + r() * (DH + 600);
    const col = T.key === 'night' ? P.litter : leafCols[(i * 5) % 4];
    ell(g, x, y, 2.6 + r() * 3.0, 1.3 + r() * 1.2, col);
  }

  // lush velvet moss cushions
  for (let i = 0; i < 16; i++) {
    const mx = -800 + r() * 3600, my = 690 + r() * (DH + 300);
    const mw = 28 + r() * 44, mh = 9 + r() * 11;
    ell(g, mx, my, mw, mh, 'rgba(70,125,48,.32)');
    ell(g, mx - mw * 0.15, my - 2, mw * 0.65, mh * 0.65, 'rgba(115,170,75,.25)');
  }

  // detailed fly-agaric & golden chanterelle mushrooms (glowing softly at night!)
  const shroom = (mx: number, my: number, s: number) => {
    g.save(); g.translate(mx, my); g.scale(s, s);
    ell(g, 0, 2, 12, 3.5, 'rgba(0,0,0,.26)');
    if (T.key === 'night') {
      softBlob(g, 0, -14, 26, 'rgba(140,235,210,.28)', 0.85);
    }
    // under-cap radial gill fan
    ell(g, 0, -14, 13.5, 4.5, '#d1c2a5');
    // bulbous stem + dainty skirt ring (annulus)
    g.fillStyle = '#efe5d0';
    g.beginPath();
    g.moveTo(-6.5, 1);
    g.quadraticCurveTo(-5, -8, -3.5, -15);
    g.lineTo(3.5, -15);
    g.quadraticCurveTo(5, -8, 6.5, 1);
    g.closePath(); g.fill();
    poly(g, [[-4, -11], [4, -11], [6.5, -7], [-6.5, -7]], '#e2d4b7');
    // domed red cap
    g.fillStyle = '#c93829';
    g.beginPath(); g.ellipse(0, -14, 15, 11, 0, Math.PI, 0); g.fill();
    // sunlit cap highlight
    ell(g, -4, -20, 7, 4, 'rgba(255,160,130,.28)');
    // raised cream warts
    for (const [wx, wy, wr] of [[-6, -18, 2.4], [4, -20, 2.0], [0, -23, 1.6], [-10, -15, 1.5], [9, -16, 1.7]]) {
      ell(g, wx, wy, wr, wr * 0.72, '#fbf7ec');
    }
    g.restore();
  };
  shroom(560, 900, 1.35);
  shroom(602, 916, 0.92);
  shroom(582, 922, 0.65);
  shroom(1180, 860, 1.15);
  shroom(1212, 872, 0.78);
  shroom(-140, 1000, 1.6);
}

function paintForestFg(g: CanvasRenderingContext2D, T: Theme) {
  const P = forestPal[T.key];

  // detailed arching fern fronds with pinnae leaflets & curled koru fiddleheads
  const frond = (fx: number, rot: number, len: number, s: number) => {
    g.save(); g.translate(fx, DH + 860); g.rotate(rot); g.scale(s, s);
    g.strokeStyle = P.fern[0]; g.lineWidth = 7; g.lineCap = 'round';
    g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(len * 0.3, -len * 0.9, len * 0.85, -len * 1.15); g.stroke();
    for (let i = 0; i < 18; i++) {
      const t = 0.07 + i * 0.052;
      const px = 2 * 0.3 * t * (1 - t) * len + t * t * len * 0.85;
      const py = -0.9 * len * 2 * t * (1 - t) - 1.15 * len * t * t;
      const ll = (1 - t) * 68 + 10;
      for (const dir of [-1, 1]) {
        const col = P.fern[1 + (i % 2)];
        g.fillStyle = col;
        g.beginPath();
        g.moveTo(px, py - 3);
        g.quadraticCurveTo(px + dir * ll * 0.55, py - ll * 0.34, px + dir * ll * 0.9, py - ll * 0.04);
        g.quadraticCurveTo(px + dir * ll * 0.45, py + 2, px, py + 3);
        g.closePath();
        g.fill();
      }
    }
    g.restore();
  };
  frond(120, -0.5, 425, 1.0);
  frond(320, -0.75, 365, 0.9);
  frond(1560, 0.6, 405, 0.95);

  // curled spiral fern fiddlehead (koru) in bottom-left foreground
  g.save(); g.translate(235, DH + 230);
  g.strokeStyle = P.fern[1]; g.lineWidth = 8; g.lineCap = 'round';
  g.beginPath();
  g.moveTo(-18, 220);
  g.quadraticCurveTo(-8, 80, 14, 0);
  g.arc(28, 4, 15, Math.PI, Math.PI * 2.65);
  g.stroke();
  ell(g, 28, 4, 7, 7, P.fern[0]);
  g.restore();

  // mossy foreground rock + cluster of detailed mushrooms & clover, bottom-right
  g.save(); g.translate(1330, DH + 300);
  // mossy stone mound
  ell(g, -22, 18, 86, 38, P.fern[2]);
  ell(g, -26, 12, 72, 28, P.fern[0]);
  // main large mushroom + companion baby mushroom
  for (const [ox, oy, sc] of [[0, 0, 2.6], [42, 14, 1.55]]) {
    g.save(); g.translate(ox, oy); g.scale(sc, sc);
    ell(g, 0, -14, 13.5, 4.5, '#cbb999');
    g.fillStyle = '#efe4ce';
    g.beginPath();
    g.moveTo(-6, 0); g.quadraticCurveTo(-5, -14, 0, -16);
    g.quadraticCurveTo(5, -14, 6, 0); g.closePath(); g.fill();
    poly(g, [[-4, -10], [4, -10], [6.5, -6.5], [-6.5, -6.5]], '#dfd1b4');
    g.fillStyle = '#c43728';
    g.beginPath(); g.ellipse(0, -15, 14.5, 10.5, 0, Math.PI, 0); g.fill();
    ell(g, -5, -19, 2.5, 1.8, '#fbf7ec');
    ell(g, 4, -21, 2.0, 1.5, '#fbf7ec');
    ell(g, 0, -24, 1.6, 1.2, '#fbf7ec');
    ell(g, 8, -17, 1.6, 1.2, '#fbf7ec');
    g.restore();
  }
  g.restore();

  // foreground glowing fireflies / sunlit pollen bokeh orbs
  const orbCol = T.key === 'night' ? 'rgba(215,250,130,.75)' : 'rgba(255,238,165,.45)';
  for (const [bx, by, br] of [[420, 1140, 22], [1190, 1170, 26], [1450, 1090, 20], [180, 1080, 18]]) {
    softBlob(g, bx, by, br, orbCol, 0.9);
    ell(g, bx, by, 3.2, 3.2, '#fffbe0');
  }
}

export const BACKGROUNDS: Record<'beach' | 'city' | 'forest', BackgroundDef> = {
  beach: {
    layers: [
      { key: 'sea',   dist: Infinity,       paint: paintBeachSea },
      { key: 'dunes', dist: 28,             paint: paintBeachDunes },
      { key: 'sand',  dist: 6,  z: 20,      paint: paintBeachSand },
      { key: 'fg',    dist: 0.7,            paint: paintBeachFg },
    ],
  },
  city: {
    layers: [
      { key: 'skyline', dist: Infinity,     paint: paintCityBackdrop },
      { key: 'towers',  dist: 160,          paint: paintCityTowers },
      { key: 'shops',   dist: 26,           paint: paintCityShops },
      { key: 'street',  dist: 8,  z: 20,    paint: paintCityStreet },
      { key: 'fg',      dist: 0.8,          paint: paintCityFg },
    ],
  },
  forest: {
    layers: [
      { key: 'wall',   dist: Infinity,      paint: paintForestBackdrop },
      { key: 'firfar', dist: 250,           paint: paintForestFar },
      { key: 'firmed', dist: 45,            paint: paintForestMid },
      { key: 'floor',  dist: 3,   z: 20,    paint: paintForestFloor },
      { key: 'near',   dist: 8,             paint: paintForestNear },
      { key: 'fg',     dist: 0.7,           paint: paintForestFg },
    ],
  },
};

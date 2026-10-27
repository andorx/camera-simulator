/* =====================================================================
   live.ts — animated "current" values published by the render engine
   (after each composite, like the vanilla DOM updates). HUD, meter,
   stats, ladders, AF box and tips subscribe to this store; nothing
   here is written by React.
   ===================================================================== */

import { create } from 'zustand';

export interface AfBox {
  inside: boolean;
  left: number;  // % of viewport width
  top: number;   // % of viewport height
  w: number;     // %
  h: number;     // %
}

export interface LiveStats {
  fov: string;
  dof: string;
  dofTotal: string;
  hyperfocal: string;
  blur: string;
  shake: string;
  motion: string;
}

export interface LiveFrame {
  /* animated dial values (for HUD chips) */
  f: number;
  N: number;
  iso: number;
  shutterLabel: string;   // from the target state, like vanilla
  evStops: number;
  evCls: string;          // chip class suffix: ok | warn | bad
  /* exposure meter */
  meterLeft: number;      // needle position, %
  verdict: string;
  verdictCls: string;
  /* shot intelligence */
  stats: LiveStats;
  /* explainer impact ladders, 0…1 per factor key */
  ladders: Record<string, number>;
  /* AF box geometry (visibility also depends on the HUD toggle) */
  af: AfBox;
}

export interface LiveState {
  frame: LiveFrame;
  tips: string[];
  setFrame: (f: LiveFrame) => void;
  setTips: (t: string[]) => void;
}

export const useLive = create<LiveState>()((set) => ({
  frame: {
    f: 50, N: 5.6, iso: 100, shutterLabel: '1/250',
    evStops: 0, evCls: 'ok',
    meterLeft: 50, verdict: 'Correct exposure', verdictCls: 'ok',
    stats: {
      fov: '39.6° × 27.0°',
      dof: '2.94 – 3.06 m',
      dofTotal: '0.12 m',
      hyperfocal: '14.9 m',
      blur: 'subtle · 1 px',
      shake: 'none',
      motion: 'frozen',
    },
    ladders: {},
    af: { inside: true, left: 46, top: 30, w: 8, h: 12 },
  },
  tips: [],
  setFrame: (frame) => set({ frame }),
  setTips: (tips) => set({ tips }),
}));

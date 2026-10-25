/* =====================================================================
   guides.ts — Quick Guide content: scenarios grouped by what matters
   most (subject / place / condition). Each entry names the best-fit
   Canon mode, a starting exposure (real-world values — the page snaps
   them to the nearest simulated dial when loading the simulator),
   field notes and pro tips. Pure data: no imports except types.
   ===================================================================== */

import type { BackgroundKey, SubjectKey, ThemeKey } from '../types';

export type GuideCatId = 'subject' | 'place' | 'condition';

export interface GuideCategory {
  id: GuideCatId;
  label: string;
  blurb: string;
}

/** A starting exposure, exactly as you'd tell a human. Values may be
    finer-grained than the simulator's dials (ƒ/1.8, 1/200 s…) — the
    page clamps to the nearest simulated value when applying. */
export interface GuideShot {
  /** ƒ-number: 1.8, 2.8, 8 … */
  f: number;
  /** shutter in seconds: 0.004 = 1/250, 4 = four seconds */
  sec: number;
  iso: number;
  /** focal length in mm */
  focal: number;
  /** metering / AF / drive fine print */
  note?: string;
}

/** Mapping onto the live simulator. Exposure is re-tuned for the
    simulator's light levels where the real-world recipe would
    mis-meter, then snapped to the nearest dial values on apply. */
export interface GuideSim {
  f: number;
  sec: number;
  iso: number;
  focal: number;
  /** subject distance in metres (car reads best at ~7 m and beyond) */
  dist: number;
  theme: ThemeKey;
  subject: SubjectKey;
  background: BackgroundKey;
}

export interface GuideScenario {
  id: string;
  cat: GuideCatId;
  icon: string;
  title: string;
  /** Canon mode dial position: Av, Tv, M, B … */
  mode: string;
  /** one-line reason this mode wins here */
  why: string;
  shot: GuideShot;
  /** 2–4 practical pro tips */
  tips: string[];
  /** absent = no faithful simulator mapping for this scenario */
  sim?: GuideSim;
  /** shown on cards without a simulator mapping */
  simWhy?: string;
}

export const CATEGORIES: GuideCategory[] = [
  { id: 'subject',   label: 'Subject',   blurb: "What's in front of the lens — the settings follow the subject." },
  { id: 'place',     label: 'Place',     blurb: 'Where you are standing — match the light and the background.' },
  { id: 'condition', label: 'Condition', blurb: 'The light or the technique — special situations with fixed recipes.' },
];

export const SCENARIOS: GuideScenario[] = [
  /* ------------------------- SUBJECT ------------------------- */
  {
    id: 'portrait', cat: 'subject', icon: '🧑', title: 'Portrait', mode: 'Av',
    why: 'Wide open blurs the background — you choose the ƒ-stop and the camera keeps the rest honest.',
    shot: { f: 1.8, sec: 1 / 200, iso: 100, focal: 85,
            note: 'Evaluative metering · One-Shot AF, centre point on the near eye · Single-Shot drive' },
    tips: [
      'Focus on the near eye — at ƒ/1.8 the depth of field is only a few centimetres.',
      'Keep the shutter at 1/(2× focal length) or faster: ≥ 1/160 s at 85 mm to kill shake.',
      'Open shade is a free softbox; turn the subject towards the light for catchlights.',
      'Background too busy? Step closer or zoom longer — compression melts it further.',
    ],
    sim: { f: 2, sec: 1 / 2000, iso: 100, focal: 85, dist: 2.5, theme: 'golden', subject: 'person', background: 'meadow' },
  },
  {
    id: 'group', cat: 'subject', icon: '👥', title: 'Group photo', mode: 'Av',
    why: 'Two rows of faces need depth of field — aperture is the lever that sets it.',
    shot: { f: 5.6, sec: 1 / 250, iso: 100, focal: 35,
            note: 'One-Shot AF on the front row · 3-frame bursts · step everyone’s toes onto one line' },
    tips: [
      'ƒ/5.6–8 gets a two-row group sharp; ƒ/1.8 leaves the back row soft.',
      'Never drop below 1/125 s — someone always sways or blinks.',
      'Count down and shoot a burst of 3; the middle frame usually wins.',
      'Faces on the same plane: line the toes up before you line the eyes up.',
    ],
    sim: { f: 5.6, sec: 1 / 250, iso: 100, focal: 35, dist: 5, theme: 'golden', subject: 'person', background: 'meadow' },
  },
  {
    id: 'pet', cat: 'subject', icon: '🐕', title: 'Pet & dog', mode: 'Tv',
    why: 'You set a sprint-freezing shutter and let the aperture follow the light.',
    shot: { f: 2.8, sec: 1 / 1000, iso: 400, focal: 135,
            note: 'AI Servo AF · High-speed continuous · focus point on the eye, not the nose' },
    tips: [
      '1/1000 s freezes a full sprint; 1/500 is enough for a trotting dog.',
      'AI Servo + burst: hold the focus point on the eye, shoot the run, sort later.',
      'Get low — shooting at the dog’s eye level makes the portrait.',
      'Dark fur drinks light: dial in +0.3 to +0.7 EV so the coat keeps its texture.',
    ],
    sim: { f: 2.8, sec: 1 / 4000, iso: 400, focal: 135, dist: 3, theme: 'golden', subject: 'dog', background: 'meadow' },
  },
  {
    id: 'flower', cat: 'subject', icon: '🌸', title: 'Flower / close-up', mode: 'Av',
    why: 'Aperture is the creative tool here — wide for dreamy, stopped down for detail.',
    shot: { f: 2.8, sec: 1 / 500, iso: 100, focal: 85,
            note: 'One-Shot AF · Live View + 10× for critical focus · shield the flower from wind' },
    tips: [
      'At macro distances ƒ/2.8 gives millimetres of depth — stop to ƒ/8 when you want it all sharp.',
      'Rock the camera gently forward and back to land focus on the stigma; shoot a burst.',
      'Calm morning air and overcast light beat wind and harsh sun.',
      'A white reflector — even a notebook — opens up shaded petals.',
    ],
    sim: { f: 2.8, sec: 1 / 1000, iso: 100, focal: 85, dist: 1.3, theme: 'golden', subject: 'flower', background: 'meadow' },
  },
  {
    id: 'sports', cat: 'subject', icon: '⚽', title: 'Sports & wildlife', mode: 'Tv',
    why: 'Shutter speed is king; everything else bends around it.',
    shot: { f: 4, sec: 1 / 1000, iso: 800, focal: 200,
            note: 'AI Servo AF, Case 2 (ignore obstacles) · High-speed continuous · back-button focus' },
    tips: [
      '1/1000 s freezes running players; 1/2000+ for birds and motorsport.',
      'ISO Auto with a 1/1000 floor — modern Canons stay clean to ISO 6400 and beyond.',
      'Ears back, wings up: shoot through the action and cull later.',
      'Pan with the subject at 1/30–1/60 s for a speed-blur background and a sharp athlete.',
    ],
    sim: { f: 4, sec: 1 / 2000, iso: 400, focal: 200, dist: 9, theme: 'golden', subject: 'car', background: 'meadow' },
  },
  {
    id: 'kids', cat: 'subject', icon: '🧒', title: 'Kids indoors', mode: 'Tv',
    why: 'Weak room light plus non-stop motion: lock a safe shutter and let ISO climb.',
    shot: { f: 2, sec: 1 / 250, iso: 1600, focal: 50,
            note: 'AI Servo AF · ISO Auto capped at 6400 · bounce flash if you have one' },
    tips: [
      '1/250 s is the floor for a playing child; 1/60 turns a giggle into a smear.',
      'Open to ƒ/1.8–2.8 before raising ISO, and face kids towards the window.',
      'Noise is fixable, motion blur is not — let ISO run to 6400.',
      'Kneel or sit on the floor: shoot at their eye level, not yours.',
    ],
    sim: { f: 2, sec: 1 / 1600, iso: 400, focal: 50, dist: 3, theme: 'overcast', subject: 'person', background: 'meadow' },
  },

  /* -------------------------- PLACE -------------------------- */
  {
    id: 'landscape', cat: 'place', icon: '🏔️', title: 'Landscape', mode: 'Av',
    why: 'You control depth of field at its sharpest; the camera meters the scene.',
    shot: { f: 8, sec: 1 / 125, iso: 100, focal: 24,
            note: 'Evaluative · tripod + 2 s self-timer · focus a third into the scene' },
    tips: [
      'ƒ/8–11 is most lenses’ sweet spot; past ƒ/16 diffraction softens everything.',
      'Focus a third into the scene (or at the hyperfocal) rather than at infinity.',
      'Sky much brighter than the land? Grad ND filter, or expose for the sky and lift the shadows.',
      'The 2-second timer removes the last trace of shake on a tripod.',
    ],
    sim: { f: 8, sec: 1 / 125, iso: 100, focal: 24, dist: 12, theme: 'golden', subject: 'person', background: 'meadow' },
  },
  {
    id: 'beach', cat: 'place', icon: '🏖️', title: 'Beach & snow', mode: 'Av',
    why: 'Sand and snow fool the meter into grey — Av plus exposure compensation keeps them white.',
    shot: { f: 8, sec: 1 / 500, iso: 100, focal: 35,
            note: '+1 to +2 EV compensation · highlight alert ON · polariser for water glare' },
    tips: [
      'The meter reads all that white as mid-grey: dial in +1 to +2 EV until highlights just hold.',
      'Trust the blinkies (highlight alert), not the LCD — screens lie in bright sun.',
      'A polariser deepens skies and kills glare; past ~30 mm it can uneven the sky.',
      'Shoot early or late: hard noon light on sand is brutal.',
    ],
    sim: { f: 8, sec: 1 / 125, iso: 100, focal: 35, dist: 10, theme: 'golden', subject: 'person', background: 'beach' },
  },
  {
    id: 'city-night', cat: 'place', icon: '🌃', title: 'City at night', mode: 'M',
    why: 'Neon and streetlights defeat auto exposure — set it yourself and trust the histogram.',
    shot: { f: 2.8, sec: 1 / 30, iso: 6400, focal: 35,
            note: 'Evaluative, no comp · brace on a rail or wall · RAW for mixed white balance' },
    tips: [
      'Handheld recipe: ƒ/2.8, 1/30 s braced, ISO 6400 — wait for the street to clear.',
      'On a tripod, switch to ƒ/8, ISO 100 and 2–8 s for clean files and light trails.',
      'Pick one light source to look right and let the rest go colour-wild.',
      'Sodium and LED street lamps fool AWB — shoot RAW and fix white balance later.',
    ],
    sim: { f: 2.8, sec: 1 / 30, iso: 12800, focal: 35, dist: 6, theme: 'night', subject: 'person', background: 'city' },
  },
  {
    id: 'forest', cat: 'place', icon: '🌲', title: 'Forest & woodland', mode: 'Av',
    why: 'Pick the aperture for busy backgrounds; keep an eye on the shutter in the shade.',
    shot: { f: 4, sec: 1 / 60, iso: 400, focal: 50,
            note: 'Evaluative · watch for hot spots · polariser kills leaf glare' },
    tips: [
      'Overcast days are best in woodland: even light and saturated greens.',
      'Look for natural frames and leading paths; shoot straight up at 24 mm for canopies.',
      'Sunbeams: expose for the beam (−0.7 EV) and let the shade fall dark.',
      'Ferns and moss love a polariser — it removes the sheen and doubles the colour.',
    ],
    sim: { f: 4, sec: 1 / 400, iso: 400, focal: 50, dist: 5, theme: 'overcast', subject: 'person', background: 'forest' },
  },
  {
    id: 'home-window', cat: 'place', icon: '🪟', title: 'Home & window light', mode: 'Av',
    why: 'One window is a two-metre softbox — aperture sets the look and the camera balances the rest.',
    shot: { f: 2, sec: 1 / 250, iso: 800, focal: 50,
            note: '−0.3 EV or spot meter on the lit cheek · subject at 45° to the glass · One-Shot AF on the near eye' },
    tips: [
      'Side-on windows sculpt; a white curtain turns a harsh sunbeam into softbox light.',
      'Turn the face towards the glass until both eyes catch a highlight — that is your free catchlight.',
      'The meter sees a dark room and brightens the face: −0.3 to −0.7 EV keeps skin from blowing.',
      'Overhead lights off — tungsten plus daylight is a white-balance fight nobody wins.',
    ],
    sim: { f: 2, sec: 1 / 3200, iso: 800, focal: 50, dist: 2.5, theme: 'overcast', subject: 'person', background: 'meadow' },
  },
  {
    id: 'party', cat: 'place', icon: '🎉', title: 'Party / low light', mode: 'Av',
    why: 'Open wide, let ISO float, and trade a little noise for the mood.',
    shot: { f: 2, sec: 1 / 125, iso: 3200, focal: 35,
            note: 'Evaluative · bounce flash off the ceiling if allowed · bursts of 2–3' },
    tips: [
      'ƒ/1.8–2.8 keeps the glow of the room; direct on-camera flash flattens everything.',
      'IS lenses buy 2–3 stops against shake — but they cannot freeze a dancing subject.',
      'AWB chokes on party LEDs: shoot RAW and set white balance later.',
      'A touch under (−0.3 EV) is safer — noise cleans up, clipped lights never do.',
    ],
    sim: { f: 2, sec: 1 / 30, iso: 6400, focal: 35, dist: 2.5, theme: 'night', subject: 'person', background: 'meadow' },
  },
  {
    id: 'concert', cat: 'place', icon: '🎤', title: 'Concert & stage', mode: 'M',
    why: 'Moving spotlights break every auto mode — lock exposure to the performer’s highlights.',
    shot: { f: 2.8, sec: 1 / 250, iso: 3200, focal: 135,
            note: 'Spot meter on the face · High-speed continuous · no flash (banned anyway)' },
    tips: [
      'Meter the lit face and lock it — let the stage fall to black around it.',
      'Zooms are ƒ/2.8-limited: budget 1/250 s for movement and let ISO float 1600–6400.',
      'Wait for the peak — the mic lean, the arm raise — instead of spraying.',
      'Red stage lights clip first: expose for highlights and shoot RAW.',
    ],
    sim: { f: 2, sec: 1 / 60, iso: 12800, focal: 85, dist: 8, theme: 'night', subject: 'person', background: 'city' },
  },
  {
    id: 'museum', cat: 'place', icon: '🏛️', title: 'Museums & churches', mode: 'Av',
    why: 'Flash and tripods are banned — Av with floating ISO trades a little grain for a safe shutter.',
    shot: { f: 2.8, sec: 1 / 60, iso: 3200, focal: 24,
            note: 'Evaluative · IS on, brace against a pillar · silent shutter where the rules allow' },
    tips: [
      '1/60 s is the handheld floor at 24 mm; IS buys 2–3 more stops for stills, zero for moving people.',
      'Open the aperture only after ISO is already high — lens corners go soft long before sensors do.',
      'Spotlit altars and stained glass: meter the brights and let the nave fall dark and moody.',
      'Handheld bracketing (±2 EV) merges into clean HDR later — a tripod is not the only answer.',
    ],
    sim: { f: 2.8, sec: 1 / 8, iso: 3200, focal: 24, dist: 8, theme: 'night', subject: 'person', background: 'city' },
  },

  /* ------------------------ CONDITION ------------------------ */
  {
    id: 'sunset', cat: 'condition', icon: '🌅', title: 'Sunset / golden hour', mode: 'Av',
    why: 'Expose for the sky and the light itself becomes the subject.',
    shot: { f: 5.6, sec: 1 / 250, iso: 100, focal: 35,
            note: 'Meter off the sky, AE-lock, recompose · RAW · +1.3 EV or fill flash for portraits' },
    tips: [
      'Meter off the bright sky (or −0.7 EV) to keep the colour; silhouettes are a feature.',
      'Arrive 40 minutes before sunset and stay 20 after — the best light often comes last.',
      'Clouds catch the colour; an empty horizon makes a flat sunset shot.',
      'Portraits into the sun need +1.3 EV or fill flash, or faces go black.',
    ],
    sim: { f: 5.6, sec: 1 / 250, iso: 100, focal: 35, dist: 6, theme: 'golden', subject: 'person', background: 'beach' },
  },
  {
    id: 'candlelight', cat: 'condition', icon: '🕯️', title: 'Candlelight', mode: 'M',
    why: 'A flickering flame is the only light source — Manual locks exposure and keeps the warmth.',
    shot: { f: 1.8, sec: 1 / 60, iso: 6400, focal: 35,
            note: 'Spot meter on the face, never the flame · shoot RAW · bursts of 2–3 to beat the flicker' },
    tips: [
      'Expose for faces and let flames bloom — a clipped candle looks natural, a crushed face does not.',
      'ISO 6400 is the entry ticket, not a failure — grain is part of the candlelight look.',
      'Kill the mixed light: overheads off, or the white-balance fight ruins the warmth you came for.',
      'Elbows on the table turn 1/60 s from risky to routine at 35 mm.',
    ],
    sim: { f: 2, sec: 1 / 30, iso: 6400, focal: 35, dist: 2, theme: 'night', subject: 'person', background: 'city' },
  },
  {
    id: 'waterfall', cat: 'condition', icon: '💦', title: 'Silky waterfalls', mode: 'Tv',
    why: 'Shutter speed is the whole picture: seconds turn falling water to silk.',
    shot: { f: 11, sec: 1 / 4, iso: 100, focal: 24,
            note: 'Tripod · ND8–ND1000 filter · 2 s timer · manual focus' },
    tips: [
      '1/4–2 s is the silky range; 1/8 keeps texture, 2"+ turns water to glass.',
      'Daylight is too bright for seconds — an ND filter is mandatory, not optional.',
      'Keep the falls shaded: sunlit water blows out during long exposures.',
      'Cover the viewfinder (DSLRs) and use the timer; stray light and pokes ruin frames.',
    ],
    simWhy: 'No moving water in the simulator yet — the blur is the whole point of this one.',
  },
  {
    id: 'fireworks', cat: 'condition', icon: '🎆', title: 'Fireworks', mode: 'B',
    why: 'The sky is black and the meter is blind — hold Bulb open for the burst itself.',
    shot: { f: 8, sec: 4, iso: 100, focal: 24,
            note: 'Bulb + remote release · tripod · manual focus pre-set to ∞' },
    tips: [
      'Open the shutter at launch, close after 2–3 bursts — the shells expose themselves.',
      'ƒ/8 at ISO 100 is fireworks magic; the bursts are their own flash.',
      'Black-card trick: cover the lens between bursts to stack shells into one frame.',
      'Include a skyline or water reflection for context; plain sky gets old fast.',
    ],
    simWhy: 'Multi-second light trails aren’t simulated — the shutter tops out at 2".',
  },
  {
    id: 'stars', cat: 'condition', icon: '✨', title: 'Starry sky', mode: 'M',
    why: 'The night sky has one fixed recipe — Manual just holds it.',
    shot: { f: 2, sec: 15, iso: 3200, focal: 16,
            note: 'Manual focus at ∞ via Live View 10× · 2 s timer · RAW' },
    tips: [
      'The 500 rule: 500 ÷ focal length is the longest exposure before stars trail (≈31 s at 16 mm).',
      'ƒ/2 · 15 s · ISO 3200 is the classic start; verify focus at 10× and iterate.',
      'Any modern Canon handles ISO 3200 — bigger pixels beat more megapixels here.',
      'Drive 30 minutes from city glow; it transforms the sky more than any setting.',
    ],
    sim: { f: 2, sec: 1 / 30, iso: 6400, focal: 24, dist: 10, theme: 'night', subject: 'person', background: 'meadow' },
  },
];

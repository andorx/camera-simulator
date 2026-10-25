/* Camera Modes content — Canon mode-dial reference for the Camera Modes tab.
   Pure typed data, no JSX: CameraModesPage.tsx renders everything below. */

/** Who sets a given exposure parameter in a mode. */
export type ParamOwner = 'you' | 'camera' | 'flex' | 'saved';

export interface ModeControls {
  aperture: ParamOwner;
  shutter: ParamOwner;
  iso: ParamOwner;
}

export interface CameraMode {
  id: string;
  /** Dial marking, e.g. "A+", "Tv", "C1–C3". */
  dial: string;
  name: string;
  /** Extra naming context (e.g. "Time value — Nikon & Sony call it S"). */
  aka?: string;
  tagline: string;
  what: string;
  /** One-liner for the comparison table. */
  bestFor: string;
  /** 0–5 creative-control meter. */
  controlLevel: number;
  /** 0–5 effort-to-master meter. */
  difficulty: number;
  controls: ModeControls;
  whenToUse: string[];
  tips: string[];
  /** "Pairs well with the Simulator" hint. */
  simulator: string;
  /** Where the mode lives (bodies / dial notes). */
  availability?: string;
}

export interface LadderStep {
  dial: string;
  label: string;
  desc: string;
}

export interface SceneMode {
  icon: string;
  name: string;
  does: string;
  /** Manual equivalent a P/Av/Tv/M shooter would dial in. */
  equiv: string;
}

export interface SceneGroup {
  id: string;
  label: string;
  blurb: string;
  scenes: SceneMode[];
}

/* ---------- the creative ladder shown in the hero ---------- */

export const CREATIVE_LADDER: LadderStep[] = [
  {
    dial: 'A+',
    label: 'Camera drives',
    desc: 'Scene Intelligent Auto reads the scene and sets aperture, shutter and ISO — even whether the flash pops. You frame and press.',
  },
  {
    dial: 'P',
    label: 'Camera suggests',
    desc: 'Program AE picks a balanced aperture/shutter pair; you keep ISO, exposure compensation and Program Shift.',
  },
  {
    dial: 'Av · Tv',
    label: 'You claim one dial',
    desc: 'Own depth of field (Av) or motion (Tv); the camera follows along the other dial and keeps exposure on target.',
  },
  {
    dial: 'M',
    label: 'You drive',
    desc: 'Aperture and shutter are both yours; the meter needle becomes an advisor, not the boss.',
  },
];

/* ---------- the main mode dial ---------- */

export const CAMERA_MODES: CameraMode[] = [
  {
    id: 'a-plus',
    dial: 'A+',
    name: 'Scene Intelligent Auto',
    tagline: 'Full auto — the camera reads the scene and drives every dial.',
    what:
      'A+ is the green, point-and-shoot mode. The camera analyses brightness, colour, faces, distance and movement, then picks aperture, shutter speed, ISO, white balance, Picture Style, AF behaviour and drive — and pops the built-in flash when it thinks you need it. Most advanced settings are locked out, so results are consistent but not negotiated.',
    bestFor: 'Snapshots, lending the camera out',
    controlLevel: 0,
    difficulty: 0,
    controls: { aperture: 'camera', shutter: 'camera', iso: 'camera' },
    whenToUse: [
      'Snapshots where getting the shot matters more than how',
      'Handing the camera to someone else',
      'First days with a new body — nail framing and focus before exposure',
    ],
    tips: [
      'It aims for average: tricky light (backlight, snow, stage spotlights) will fool it',
      'You can usually still choose where focus lands — half-press and steer the AF point',
      'Blurry backgrounds or dark faces are your cue to climb the ladder to P',
    ],
    simulator:
      'Pick a scene and shoot without touching a slider — that is A+. Then nudge one slider to see what the camera was deciding for you.',
  },
  {
    id: 'p',
    dial: 'P',
    name: 'Program AE',
    tagline: 'The camera picks the aperture/shutter pair; you keep the steering wheel.',
    what:
      'Program AE meters the scene and chooses a matched aperture + shutter combination for correct exposure. Unlike A+, every other decision stays yours: ISO (or Auto ISO), exposure compensation, white balance, AF, drive and flash. Program Shift slides you along the same-exposure pairs — half-press, turn the Main Dial, and 1/125 · ƒ/8 becomes 1/250 · ƒ/5.6: same brightness, different look.',
    bestFor: 'Fast-changing walk-around light',
    controlLevel: 2,
    difficulty: 1,
    controls: { aperture: 'camera', shutter: 'camera', iso: 'you' },
    whenToUse: [
      'Walk-around, events and travel when the light keeps changing',
      'You want exposure compensation and Auto ISO — A+ locks them out',
      'You care about ISO and flash, and are happy to delegate the ƒ/shutter split',
    ],
    tips: [
      'P is not a beginner mode — pros use it as an intelligent default',
      'Watch the shutter speed P picks in dim light; raise ISO before it drops below hand-holdable',
      'Program Shift resets when the meter timer lapses; exposure compensation still applies on top',
    ],
    simulator:
      'Set ISO yourself and chase 0 EV on the meter — that is the P workflow: the camera solves ƒ + shutter, you trim brightness.',
  },
  {
    id: 'tv',
    dial: 'Tv',
    name: 'Shutter-priority AE',
    aka: 'Time value — Nikon & Sony label the same mode “S”',
    tagline: 'You own time; the camera matches the aperture.',
    what:
      'Tv (Time value) makes shutter speed your creative control: dial 1/1000 to freeze a striker mid-kick, or 1/15 to turn a waterfall to silk. The camera meters and opens or closes the aperture to keep exposure correct. If the light out-runs the lens — aperture blinking at its limit — change ISO or exposure compensation, or enable the Safety Shift custom function so the camera quietly overrides your shutter rather than blow the frame.',
    bestFor: 'Motion — freeze it or paint with it',
    controlLevel: 4,
    difficulty: 2,
    controls: { aperture: 'camera', shutter: 'you', iso: 'you' },
    whenToUse: [
      'Action and sports — 1/1000 s and faster freezes athletes, birds, splash droplets',
      'Panning — 1/30–1/60 s follow a moving subject to smear the background',
      'Waterfalls and traffic trails — 1 s and longer on a tripod for silky motion',
    ],
    tips: [
      'Handheld floor is roughly 1/(focal length in mm): 1/50 s at 50 mm — faster on crop bodies',
      'Aperture blinking wide open in bright sun? Raise the shutter, drop ISO, or add an ND filter',
      'Image Stabilisation frees you to go slower, but it fixes your shake, not the subject’s',
    ],
    simulator:
      'Drag the shutter slider on the Simulator tab: 1/1000 freezes the action scene, 1/15 turns motion into streaks.',
  },
  {
    id: 'av',
    dial: 'Av',
    name: 'Aperture-priority AE',
    aka: 'Aperture value — Nikon & Sony label the same mode “A”',
    tagline: 'You own depth of field; the camera matches time.',
    what:
      'Av (Aperture value) makes the iris your control. Open to ƒ/1.8 and the focus plane becomes a razor-thin slice — backgrounds dissolve into bokeh. Stop down to ƒ/11 and near-to-far sharpness returns. The camera meters and sets shutter speed to match, which makes Av the everyday mode for most Canon shooters: control the look, delegate the maths.',
    bestFor: 'Depth of field, portraits → landscapes',
    controlLevel: 4,
    difficulty: 2,
    controls: { aperture: 'you', shutter: 'camera', iso: 'you' },
    whenToUse: [
      'Portraits — ƒ/1.4–ƒ/2.8 lifts the subject off the background',
      'Landscapes — ƒ/8–ƒ/11 for deep focus (past ƒ/16 diffraction softens detail)',
      'Dim rooms — shoot wide open to gather light without touching the shutter',
    ],
    tips: [
      'Watch the shutter the camera picks: a wide ƒ in low light can sink below hand-holdable — raise ISO',
      'Pair Av with Auto ISO + a minimum shutter speed to automate that safety net',
      'Most lenses are sharpest about two stops from wide open — roughly ƒ/4–ƒ/8',
    ],
    simulator:
      'Try ƒ/1.4 on the Simulator tab and watch the background melt — then stop down to ƒ/11 and see it snap back.',
  },
  {
    id: 'm',
    dial: 'M',
    name: 'Manual exposure',
    tagline: 'Both dials are yours; the meter becomes an advisor.',
    what:
      'Manual hands you aperture and shutter together (and ISO, unless you delegate it to Auto ISO). Nothing drifts frame to frame: the exposure you set is the exposure you get. The light meter still runs — the viewfinder scale shows how far your settings sit from the camera’s metered middle grey, and you decide whether to agree with it.',
    bestFor: 'Consistency — studio, night, sets',
    controlLevel: 5,
    difficulty: 4,
    controls: { aperture: 'you', shutter: 'you', iso: 'you' },
    whenToUse: [
      'Studio strobes — flash output is fixed, so metering cannot help; start near ƒ/8 · 1/125 · ISO 100',
      'Series that must match: products, panorama stitches, timelapse ramps',
      'Night and astro, where meters wander',
    ],
    tips: [
      'With Auto ISO, M behaves like a third priority mode: you set ƒ + shutter, ISO floats, exposure comp steers it',
      'Respect flash sync speed (typically 1/200–1/250 s) when strobes are involved',
      'The meter aims for middle grey — snow and stage blacks need your deliberate override',
    ],
    simulator:
      'Chase the EV needle to 0 with both sliders, then deliberately sit at −1 EV for moodier results.',
  },
  {
    id: 'b',
    dial: 'B',
    name: 'Bulb',
    tagline: 'The shutter stays open for as long as you hold it.',
    what:
      'Bulb keeps the shutter open from the moment you press until you release — and on many bodies you can also reach it in M by dialling past 30″. It is the mode for exposures the camera will not time for you: star trails that need minutes, fireworks layered onto one frame, lightning, light painting and empty streets after midnight.',
    bestFor: 'Exposures past 30 seconds',
    controlLevel: 5,
    difficulty: 5,
    controls: { aperture: 'you', shutter: 'you', iso: 'you' },
    whenToUse: [
      'Star trails and astro landscapes — many minutes per frame',
      'Fireworks — open on the launch, close after the bloom',
      'Light painting and car trails at night',
    ],
    tips: [
      'A remote switch or the Canon smartphone app is essentially required — finger pressure shakes the camera',
      'Tripod, plus mirror lock or Live View to kill slap; cover the viewfinder to stop stray light',
      'Long-exposure noise reduction takes a second, dark frame — expect double the wait per shot',
    ],
    simulator:
      'The Simulator tops out at 2″ — Bulb is what you reach for when even that is not enough.',
  },
  {
    id: 'fv',
    dial: 'Fv',
    name: 'Flexible-priority AE',
    tagline: 'Every dial starts auto; claim only what you care about.',
    availability: 'Newer bodies — the EOS R-series mirrorless line, plus DSLRs like the 90D and the M6 Mark II.',
    what:
      'Fv treats aperture, shutter and ISO as slots that are each either AUTO or yours. Turn a dial to claim that parameter and set it; press the same control to hand it back. Claim nothing and it behaves like Program; claim only aperture and it is Av; claim only shutter and it is Tv; claim both and it is M with Auto ISO.',
    bestFor: 'One mode that flexes P → M',
    controlLevel: 3,
    difficulty: 3,
    controls: { aperture: 'flex', shutter: 'flex', iso: 'flex' },
    whenToUse: [
      'Shoots that change character mid-way — candids that become action',
      'You want one dial position that morphs between P, Av, Tv and M',
      'Learning: claim one parameter at a time and watch what the camera does with the rest',
    ],
    tips: [
      'Glance at the HUD before shooting — it is easy to turn a dial and silently claim a parameter',
      'Unclaimed parameters float to protect your exposure; claimed ones are law',
      'Some shooters set Fv and never leave it; others find the flexibility itself a distraction',
    ],
    simulator:
      'The Simulator is fully manual — a perfect gym for practising what each claimed Fv dial does.',
  },
  {
    id: 'c',
    dial: 'C1–C3',
    name: 'Custom shooting modes',
    tagline: 'Bookmark entire camera setups to one dial click.',
    what:
      'C1, C2 and C3 each store a complete snapshot of the camera: shooting mode, ƒ, shutter, ISO, AF operation and points, drive, metering, white balance, Picture Style and a long list of menu settings. Set the camera up exactly how a job needs, then use Menu → “Register camera settings” (or the touchscreen shortcut) to pin that state to a dial position.',
    bestFor: 'Instant recall of proven setups',
    controlLevel: 5,
    difficulty: 2,
    controls: { aperture: 'saved', shutter: 'saved', iso: 'saved' },
    whenToUse: [
      'Repeat recipes: C1 = studio flash, C2 = birds in flight, C3 = video or landscape',
      'Fast context switches — event to portrait, day to night',
      'Two photographers sharing one body, each with their own slot',
    ],
    tips: [
      'Tweaks made in a C slot vanish at power-off unless you re-register — or enable “Auto update”',
      'Registration remembers which mode you saved from — M, Av, Tv, whatever the recipe needs',
      'They are free experiments: store a known-good baseline, then break it on purpose',
    ],
    simulator:
      'The quick-setup preset buttons are mini C-modes: one click restores a full known-good recipe.',
  },
];

/* ---------- SCN special scene modes ---------- */

export const SCENE_GROUPS: SceneGroup[] = [
  {
    id: 'people',
    label: 'People',
    blurb: 'faces, families, warm evening light',
    scenes: [
      {
        icon: '👤',
        name: 'Portrait',
        does: 'Wide aperture, softened skin tones, flash off — the camera hunts for faces and melts the background.',
        equiv: 'Av ƒ/2–ƒ/4 · Portrait Picture Style',
      },
      {
        icon: '🌃',
        name: 'Night Portrait',
        does: 'Slow-sync flash: a long shutter exposes the city behind while the flash freezes your subject in front.',
        equiv: 'Av slow shutter + slow-sync flash',
      },
      {
        icon: '🧒',
        name: 'Kids',
        does: 'Faster shutter, Servo AF that tracks sprinting children, continuous burst and punchier colours.',
        equiv: 'Tv 1/250+ · AI Servo · burst drive',
      },
      {
        icon: '🕯️',
        name: 'Candlelight',
        does: 'Flash off, warm white balance, high ISO — the camera asks you to hold very still.',
        equiv: 'Av wide open · ISO 1600+ · warm WB',
      },
    ],
  },
  {
    id: 'places',
    label: 'Places & light',
    blurb: 'landscapes and contrast rescue',
    scenes: [
      {
        icon: '🏔️',
        name: 'Landscape',
        does: 'Narrow aperture for front-to-back sharpness, vivid blues and greens, base ISO, flash off.',
        equiv: 'Av ƒ/8–ƒ/11 · ISO 100 · Landscape style',
      },
      {
        icon: '🌅',
        name: 'HDR Backlight Control',
        does: 'Fires three exposures and merges them in-camera so backlit subjects survive harsh contrast.',
        equiv: 'AEB bracket ±2 EV · tone-mapped in post',
      },
    ],
  },
  {
    id: 'close',
    label: 'Close & everyday',
    blurb: 'flowers, food, small details',
    scenes: [
      {
        icon: '🌸',
        name: 'Close-up',
        does: 'Moderately open aperture and careful focusing for flowers and details near the lens.',
        equiv: 'Av ƒ/2.8–ƒ/5.6 · spot AF',
      },
      {
        icon: '🍜',
        name: 'Food',
        does: 'Warm, slightly vivid, flash off, shallow focus — tuned for plates on café tables.',
        equiv: 'Av ƒ/2.8 · warm WB · close focus',
      },
    ],
  },
  {
    id: 'action',
    label: 'Action',
    blurb: 'anything that moves fast',
    scenes: [
      {
        icon: '🏃',
        name: 'Sports',
        does: 'Fast shutter, predictive Servo AF, high-speed burst and freer ISO — built to freeze athletes.',
        equiv: 'Tv 1/1000+ · AI Servo · high burst',
      },
    ],
  },
];

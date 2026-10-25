# 📷 Camera Simulator

An interactive webapp that shows — with real optics math — how **focal length**, **ƒ-stop (aperture)**, and **ISO** (plus shutter speed and subject distance) shape a photo. Everything in the preview is computed live from the physics; nothing is a canned image.

This repo contains **two versions of the same app**:

| Version | Location | Stack |
|---|---|---|
| **React app** (primary) | repo root | Vite · React 19 · TypeScript · Zustand |
| **Vanilla original** (kept for comparison) | `vanilla/` | plain HTML/CSS/JS, no build step |

## Run the React app

```bash
npm install
npm run dev        # then open http://localhost:5173
```

Production build: `npm run build` · preview: `npm run preview`

## Run the vanilla version

```bash
# any static file server, e.g.
python3 -m http.server 8000 --directory vanilla
# then open http://localhost:8000
```

Or just open `vanilla/index.html` directly in a browser.

## Scenes

- **Subjects**: 🧍 person · 🐕 dog · 🚗 vintage car · 🌻 potted sunflower — each drawn with fine detail (eyes, fur, seed spirals) so you can judge focus. Picking the car automatically pulls back to a workable distance.
- **Places**: 🏔️ lakeside meadow · 🏖️ beach (palms, umbrella, sailboat) · 🌆 city street (skyline, neon, crosswalk) · 🌲 forest (fir tiers, ferns, fireflies at night)
- **Light**: ☀️ golden hour · ☁️ overcast · 🌙 night — every place is re-lit by each theme, so ISO/noise trade-offs always matter.

## What it simulates

| Control | Physics model | What you'll see |
|---|---|---|
| **Focal length** (24–200 mm) | FOV = 2·atan(sensor/2f), projection geometry | Zoom/framing; longer lenses shrink depth of field and magnify shake; framing centers on the subject |
| **Aperture** (ƒ/1.4–ƒ/22) | Defocus circle `b = A·f·\|s−d\| / (d(s−f))` per scene layer at its true distance | Real depth-of-field falloff — every layer (sea, towers, firs, cabin…) blurs by its own distance; wide-open vignette; ƒ/16+ diffraction softening |
| **ISO** (100–25600) | Gain + noise variance grows with ISO (and with underexposure) | Brightness, animated luminance + chroma grain, washed colors |
| Shutter speed (1/8000–2 s) | Exposure + handheld 1/focal-mm rule | Light control, camera-shake smear when too slow |
| Subject distance (0.5–15 m) | Focus plane + perspective projection | Subject walks closer/farther; focus follows them; foreground/background re-blur |

Also live: exposure meter (±3 EV), luminance histogram, DOF near/far bounds, hyperfocal distance, background-blur strength, contextual shooting tips, and a shutter button that saves photos to a film strip. The explainer cards carry **impact ladders** — volume-style bars showing how strong each photo factor (light, depth of field, background blur, grain, shake…) is at the current settings, with ↑/↓ arrows telling you which way each factor moves when you raise that dial.

## React app architecture

```
src/
├── main.tsx / App.tsx        # composition root — mirrors the original HTML layout
├── styles.css                # the original stylesheet, unchanged (global)
├── types.ts                  # Theme / Painter / LayerDef / SubjectDef …
├── optics.ts                 # pure optics math + dial constants (APS, ISOS, SHUTTERS…)
├── store.ts                  # Zustand: target camera state, presets, film strip
├── live.ts                   # Zustand: animated values published by the engine
├── scenes/
│   ├── scene.ts              # themes, helpers, sky, person, lakeside place
│   ├── scenes.ts             # dog/car/flower subjects, beach/city/forest places
│   └── registry.ts           # merged subject/place menus
├── engine/
│   ├── engine.ts             # imperative rAF engine: layers, blur, grain, histogram
│   └── derive.ts             # cur → HUD / meter / stats / ladders / AF / tips
└── components/               # one component per UI section (1:1 with the HTML)
```

**Design notes**

- The canvas renderer is **imperative and lives outside React** (`engine/`). A `CameraEngine` owns the layered offscreen canvases, the lerp loop (`cur` animated toward store targets), blur/composite passes, film grain and histogram — identical math and update cadence to the vanilla `app.js`.
- **Two stores**: `store.ts` holds dial *targets* (what the controls write); `live.ts` holds *animated* values the engine publishes after each composite (what the HUD/meter/stats/ladders read). Slider drags never re-render the canvas pipeline.
- `scene.ts` / `scenes.ts` are the vanilla painter modules ported nearly line-for-line — they only received type annotations.
- Components mirror the original HTML sections so the two versions are easy to diff visually.

Assumptions: 36×24 mm full-frame sensor, CoC 0.03 mm, focus locked on the subject.

## Original vanilla files

See `vanilla/README.md` — the untouched original app (`index.html`, `styles.css`, `app.js`, `scene.js`, `scenes.js`).

# 📷 Camera Simulator

An interactive webapp that shows — with real optics math — how **focal length**, **ƒ-stop (aperture)**, and **ISO** (plus shutter speed and subject distance) shape a photo. Everything in the preview is computed live from the physics; nothing is a canned image.

## Run it

No build step, no dependencies:

```bash
# any static file server, e.g.
python3 -m http.server 8000
# then open http://localhost:8000
```

Or just open `index.html` directly in a browser.

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

## Files

- `index.html` / `styles.css` — UI
- `scene.js` — shared themes/helpers, sky, the person, and the lakeside place
- `scenes.js` — dog/car/flower subjects and the beach/city/forest places (each layer at a real distance)
- `app.js` — optics math, canvas renderer, controls

Assumptions: 36×24 mm full-frame sensor, CoC 0.03 mm, focus locked on the subject.

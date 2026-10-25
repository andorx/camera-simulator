import { useCallback, useEffect, useRef, useState } from 'react';
import { engine } from '../engine/engine';
import { useSim } from '../store';
import { useLive } from '../live';

export default function Viewport() {
  const sceneRef = useRef<HTMLCanvasElement>(null);
  const grainRef = useRef<HTMLCanvasElement>(null);

  const grid = useSim(s => s.grid);
  const hud = useSim(s => s.hud);
  const toggleGrid = useSim(s => s.toggleGrid);
  const toggleHud = useSim(s => s.toggleHud);
  const addShot = useSim(s => s.addShot);

  const frame = useLive(s => s.frame);
  const [flash, setFlash] = useState(false);

  /* attach the engine to the preview canvases */
  useEffect(() => {
    if (!sceneRef.current || !grainRef.current) return;
    engine.attach(sceneRef.current, grainRef.current);
    engine.start();
    return () => engine.dispose();
  }, []);

  const capture = useCallback(() => {
    const shot = engine.capture();
    if (shot) addShot(shot);
    setFlash(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setFlash(false)));
  }, [addShot]);

  /* keyboard shortcut: C */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'c' && !/input|textarea/i.test(document.activeElement?.tagName ?? '')) {
        capture();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [capture]);

  const apTxt = String(frame.N < 10 ? +(frame.N.toFixed(1)) : Math.round(frame.N));
  const isoTxt = frame.iso >= 1000 ? `${Math.round(frame.iso / 100) / 10}k` : `${Math.round(frame.iso)}`;
  const evTxt = `${frame.evStops >= 0 ? '+' : ''}${frame.evStops.toFixed(1)} EV`;
  const afVisible = hud && frame.af.inside;

  return (
    <div className="viewport" id="viewport">
      <canvas id="scene" ref={sceneRef} width={1600} height={1067} />
      <canvas id="grain" ref={grainRef} width={1600} height={1067} />

      {grid && <div className="grid-overlay" id="gridOverlay" />}

      {hud && (
        <>
          <div className="hud hud-tl" id="hudMain">
            <span className="chip" id="hudFocal">{`${Math.round(frame.f)}mm`}</span>
            <span className="chip">ƒ<span id="hudAp">{apTxt}</span></span>
            <span className="chip">ISO <span id="hudIso">{isoTxt}</span></span>
            <span className="chip" id="hudShutter">{frame.shutterLabel}</span>
          </div>
          <div className="hud hud-tr">
            <span className={`chip ev ${frame.evCls}`} id="hudEv">{evTxt}</span>
          </div>
        </>
      )}

      <div className="af" id="afBox" hidden={!afVisible}
           style={{
             left: `${frame.af.left}%`,
             top: `${frame.af.top}%`,
             width: `${frame.af.w}%`,
             height: `${frame.af.h}%`,
           }}>
        <i></i><i></i><i></i><i></i>
      </div>

      <div className="view-actions">
        <button className={`icon-btn${grid ? ' active' : ''}`} id="btnGrid" title="Toggle rule-of-thirds grid"
                onClick={toggleGrid}>⌗</button>
        <button className={`icon-btn${hud ? ' active' : ''}`} id="btnHud" title="Toggle HUD overlays"
                onClick={toggleHud}>HUD</button>
      </div>

      <button className="shutter-btn" id="btnCapture" title="Capture photo (C)" onClick={capture}>
        <span></span>
      </button>
      <div className={`capture-flash${flash ? ' on' : ''}`} id="captureFlash"></div>
    </div>
  );
}

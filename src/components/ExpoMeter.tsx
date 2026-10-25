import { useEffect, useRef } from 'react';
import { engine } from '../engine/engine';
import { useLive } from '../live';

export default function ExpoMeter() {
  const histoRef = useRef<HTMLCanvasElement>(null);
  const frame = useLive(s => s.frame);

  useEffect(() => {
    if (histoRef.current) engine.attachHistogram(histoRef.current);
  }, []);

  const evTxt = `${frame.evStops >= 0 ? '+' : ''}${frame.evStops.toFixed(1)} EV`;

  return (
    <div className="card">
      <div className="meter">
        <div className="meter-head">
          <span>Exposure meter</span>
          <output id="meterVal">{evTxt}</output>
        </div>
        <div className="meter-scale">
          <div className="meter-zone"></div>
          <div className="meter-needle" id="meterNeedle" style={{ left: `${frame.meterLeft}%` }}></div>
          <div className="meter-ticks">
            <b>-3</b><b>-2</b><b>-1</b><b>0</b><b>+1</b><b>+2</b><b>+3</b>
          </div>
        </div>
        <div className={`meter-verdict ${frame.verdictCls}`} id="meterVerdict">{frame.verdict}</div>
        <canvas id="histo" ref={histoRef} width={240} height={64} title="Live luminance histogram"></canvas>
      </div>
    </div>
  );
}

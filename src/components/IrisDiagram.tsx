import { useLive } from '../live';
import { useSim } from '../store';
import { irisTargetR, APS } from '../optics';

/** Aperture iris diagram — pupil follows the animated ƒ-number. */
export default function IrisDiagram() {
  const N = useLive(s => s.frame.N);
  const focal = useSim(s => s.focal);
  const ap = useSim(s => s.ap);

  const r = irisTargetR(N);
  const cx = 60, cy = 60, Router = 50;
  const blades = [];
  for (let i = 0; i < 9; i++) {
    const a0 = (i / 9) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1.35) / 9) * Math.PI * 2 - Math.PI / 2;
    const x0 = cx + Math.cos(a0) * Router, y0 = cy + Math.sin(a0) * Router;
    const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
    blades.push(<line key={i} x1={x0.toFixed(1)} y1={y0.toFixed(1)} x2={x1.toFixed(1)} y2={y1.toFixed(1)} />);
  }

  return (
    <div className="iris-row">
      <svg id="irisSvg" viewBox="0 0 120 120" width="86" height="86" aria-hidden="true">
        <circle cx={cx} cy={cy} r={Router + 5} fill="#12151c" stroke="#3a4152" strokeWidth="2" />
        <circle cx={cx} cy={cy} r={Router} fill="#0c0e13" stroke="#4a5266" strokeWidth="1.5" />
        <g stroke="#5d6775" strokeWidth="4" strokeLinecap="round">{blades}</g>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#ffb454" strokeWidth="2" />
      </svg>
      <div className="iris-note">
        <div><b id="pupilVal">{(focal / APS[ap]).toFixed(1)} mm</b> entrance pupil</div>
        <p>ƒ-number = focal length ÷ pupil diameter. Wide open = max light, min depth of field.</p>
      </div>
    </div>
  );
}

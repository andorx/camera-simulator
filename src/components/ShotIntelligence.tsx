import { useLive } from '../live';

export default function ShotIntelligence() {
  const stats = useLive(s => s.frame.stats);
  const tips = useLive(s => s.tips);

  return (
    <div className="card">
      <h3 className="card-title">Shot intelligence</h3>
      <dl className="stats">
        <div><dt>Field of view</dt><dd id="stFov">{stats.fov}</dd></div>
        <div><dt>Depth of field</dt><dd id="stDof">{stats.dof}</dd></div>
        <div><dt>Total in focus</dt><dd id="stDofTotal">{stats.dofTotal}</dd></div>
        <div><dt>Hyperfocal</dt><dd id="stHyperf">{stats.hyperfocal}</dd></div>
        <div><dt>Background blur @∞</dt><dd id="stBlur">{stats.blur}</dd></div>
        <div><dt>Camera shake</dt><dd id="stShake">{stats.shake}</dd></div>
        <div><dt>Subject motion</dt><dd id="stMotion">{stats.motion}</dd></div>
      </dl>
      {tips.length > 0 && (
        <ul className="tips" id="tips">
          {tips.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      )}
    </div>
  );
}

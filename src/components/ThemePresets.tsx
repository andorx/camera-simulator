import { useSim } from '../store';
import { PRESETS } from '../store';
import { THEME_OPTIONS } from '../scenes/registry';

export default function ThemePresets() {
  const theme = useSim(s => s.theme);
  const setTheme = useSim(s => s.setTheme);
  const applyPreset = useSim(s => s.applyPreset);

  return (
    <div className="card">
      <div className="seg" id="themeSeg" role="tablist" aria-label="Scene light">
        {THEME_OPTIONS.map(o => (
          <button key={o.key} data-theme={o.key} className={o.key === theme ? 'active' : ''}
                  onClick={() => setTheme(o.key)}>{o.label}</button>
        ))}
      </div>
      <div className="presets">
        <span className="presets-label">Quick setups:</span>
        {Object.entries(PRESETS).map(([key, p]) => (
          <button key={key} data-preset={key} onClick={() => applyPreset(key)}>{p.label}</button>
        ))}
      </div>
    </div>
  );
}

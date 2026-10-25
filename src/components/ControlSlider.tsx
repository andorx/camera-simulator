import type { ReactNode } from 'react';

interface Tick {
  v: number;      // raw slider value to jump to
  label: string;
}

interface Props {
  id: string;
  label: string;
  hint: string;
  output: string;
  value: number;
  min: number;
  max: number;
  ticks: Tick[];
  tight?: boolean;
  onChange: (v: number) => void;
  children?: ReactNode;   // extra content (aperture iris)
}

export default function ControlSlider({
  id, label, hint, output, value, min, max, ticks, tight, onChange, children,
}: Props) {
  return (
    <div className="ctl" id={`ctl${id}`}>
      <div className="ctl-head">
        <label htmlFor={`in${id}`}>{label} <em>{hint}</em></label>
        <output id={`out${id}`}>{output}</output>
      </div>
      <input type="range" id={`in${id}`} min={min} max={max} step={1} value={value}
             onChange={e => onChange(+e.target.value)} />
      <div className={`ticks${tight ? ' tight' : ''}`} data-for={`in${id}`}>
        {ticks.map(t => (
          <span key={t.v} data-v={t.v} onClick={() => onChange(t.v)}>{t.label}</span>
        ))}
      </div>
      {children}
    </div>
  );
}

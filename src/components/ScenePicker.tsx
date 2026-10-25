import { useSim } from '../store';
import { SUBJECT_OPTIONS, BACKGROUND_OPTIONS } from '../scenes/registry';

export default function ScenePicker() {
  const subject = useSim(s => s.subject);
  const background = useSim(s => s.background);
  const setSubject = useSim(s => s.setSubject);
  const setBackground = useSim(s => s.setBackground);

  return (
    <div className="card">
      <div className="scene-row">
        <span className="scene-label">Subject</span>
        <div className="seg seg-4" id="subjectSeg">
          {SUBJECT_OPTIONS.map(o => (
            <button key={o.key} data-subject={o.key} className={o.key === subject ? 'active' : ''}
                    onClick={() => setSubject(o.key)}>{o.label}</button>
          ))}
        </div>
      </div>
      <div className="scene-row">
        <span className="scene-label">Place</span>
        <div className="seg seg-4" id="bgSeg">
          {BACKGROUND_OPTIONS.map(o => (
            <button key={o.key} data-bg={o.key} className={o.key === background ? 'active' : ''}
                    onClick={() => setBackground(o.key)}>{o.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

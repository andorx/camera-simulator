import { useEffect } from 'react';
import { useSim } from '../store';

export default function CaptureModal() {
  const shots = useSim(s => s.shots);
  const openShot = useSim(s => s.openShot);
  const openShotAt = useSim(s => s.openShotAt);

  const shot = openShot != null ? shots[openShot] : null;

  /* close on Escape */
  useEffect(() => {
    if (!shot) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') openShotAt(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shot, openShotAt]);

  if (!shot) return null;

  return (
    <div className="modal" id="modal" onClick={e => { if (e.target === e.currentTarget) openShotAt(null); }}>
      <div className="modal-body">
        <img id="modalImg" src={shot.url} alt="Captured photo" />
        <p id="modalCaption">{shot.cap}</p>
        <button className="ghost-btn" id="modalClose" onClick={() => openShotAt(null)}>Close</button>
      </div>
    </div>
  );
}

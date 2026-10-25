import { useEffect, useRef } from 'react';
import { useSim } from '../store';

export default function FilmStrip() {
  const shots = useSim(s => s.shots);
  const clearShots = useSim(s => s.clearShots);
  const openShotAt = useSim(s => s.openShotAt);
  const boxRef = useRef<HTMLDivElement>(null);

  /* scroll the newest shot into view (vanilla did this per render) */
  useEffect(() => {
    boxRef.current?.lastElementChild?.scrollIntoView({ inline: 'end', block: 'nearest', behavior: 'smooth' });
  }, [shots.length]);

  return (
    <div className="filmstrip-card card">
      <div className="filmstrip-head">
        <h3>Film strip</h3>
        {shots.length > 0 && (
          <button className="ghost-btn" id="btnClear" onClick={clearShots}>Clear all</button>
        )}
      </div>
      <div className="shots" id="shots" ref={boxRef}>
        {shots.length === 0 ? (
          <p className="empty-hint">Captured photos land here — press the shutter button or hit <kbd>C</kbd>.</p>
        ) : shots.map((s, i) => (
          <figure className="shot" key={`${i}-${s.url.slice(-16)}`} onClick={() => openShotAt(i)}>
            <img src={s.url} alt={`captured photo ${i + 1}`} />
            <figcaption><b>#{i + 1}</b> {s.cap}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

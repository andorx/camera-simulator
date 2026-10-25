import { useLive } from '../live';

interface RowProps {
  k: string;
  name: string;
  dir: 'up' | 'dn';
  title: string;
  ladders: Record<string, number>;
}

function ImpactRow({ k, name, dir, title, ladders }: RowProps) {
  const v = Math.max(0, Math.min(1, ladders[k] ?? 0));
  const lit = Math.round(v * 5);
  return (
    <div className="irow" data-k={k}>
      <span className="iname">{name}</span>
      <span className="ladder" aria-hidden="true">
        {[0, 1, 2, 3, 4].map(i => <i key={i} className={i < lit ? 'on' : ''} />)}
      </span>
      <span className={`idir ${dir}`} title={title}>{dir === 'up' ? '↑' : '↓'}</span>
    </div>
  );
}

export default function Explainers() {
  const ladders = useLive(s => s.frame.ladders);

  return (
    <>
      <p className="impact-legend">
        <b>Impact ladders</b> · bars = how strong each factor is right now ·
        <span className="dir up">↑</span> rises / <span className="dir dn">↓</span> falls when you raise that dial
      </p>
      <section className="explainers">
        <article className="card">
          <h4>🔭 Focal length</h4>
          <p>Sets your angle of view — 24 mm captures the whole scene, 200 mm isolates the subject. Longer lenses magnify <em>and</em> shrink depth of field, so backgrounds melt away faster.</p>
          <div className="impact">
            <div className="impact-cap">zoom in · 24 → 200 mm</div>
            <ImpactRow k="zoom" name="Zoom / framing" dir="up" title="Rises as you zoom in" ladders={ladders} />
            <ImpactRow k="bgblur" name="Background blur" dir="up" title="Rises as you zoom in" ladders={ladders} />
            <ImpactRow k="dof" name="Depth of field" dir="dn" title="Falls as you zoom in" ladders={ladders} />
            <ImpactRow k="shake" name="Handheld shake" dir="up" title="Rises as you zoom in" ladders={ladders} />
          </div>
        </article>
        <article className="card">
          <h4>🕳️ ƒ-stop (aperture)</h4>
          <p>The iris opening. Low ƒ-numbers (ƒ/1.4) pour in light and blur everything off the focus plane; high numbers (ƒ/16+) keep near-and-far sharp but starve the sensor — and past ƒ/16, diffraction softens detail.</p>
          <div className="impact">
            <div className="impact-cap">stop down · ƒ/1.4 → ƒ/22</div>
            <ImpactRow k="lightN" name="Light gathered" dir="dn" title="Falls as you stop down" ladders={ladders} />
            <ImpactRow k="dof" name="Depth of field" dir="up" title="Rises as you stop down" ladders={ladders} />
            <ImpactRow k="bgblur" name="Background blur" dir="dn" title="Falls as you stop down" ladders={ladders} />
            <ImpactRow k="diffr" name="Diffraction" dir="up" title="Rises past ƒ/16" ladders={ladders} />
          </div>
        </article>
        <article className="card">
          <h4>📈 ISO</h4>
          <p>Amplifies the signal. Each doubling buys a stop of brightness for dark scenes, but amplifies noise too — grain crawls in from ISO 800 and gets loud at 6400+. Try the 🌙 Night scene and watch it work.</p>
          <div className="impact">
            <div className="impact-cap">raise gain · 100 → 25.6k</div>
            <ImpactRow k="lightIso" name="Brightness" dir="up" title="Rises as you raise ISO" ladders={ladders} />
            <ImpactRow k="noise" name="Grain / noise" dir="up" title="Rises as you raise ISO" ladders={ladders} />
            <ImpactRow k="colour" name="Colour & contrast" dir="dn" title="Falls as you raise ISO" ladders={ladders} />
          </div>
        </article>
        <article className="card">
          <h4>🎬 Shutter &amp; distance</h4>
          <p>Shutter speed trades light for freeze — slower than 1/focal (mm) and handheld shake smears the frame. Subject distance moves the focus plane: everything except the subject re-blurs around it.</p>
          <div className="impact">
            <div className="impact-cap">slow down · 1/8000 → 2″</div>
            <ImpactRow k="lightT" name="Light gathered" dir="up" title="Rises as the shutter slows" ladders={ladders} />
            <ImpactRow k="freeze" name="Freeze power" dir="dn" title="Falls as the shutter slows" ladders={ladders} />
            <ImpactRow k="shake" name="Shake smear" dir="up" title="Rises as the shutter slows" ladders={ladders} />
            <div className="impact-cap gap">walk back · 0.5 → 15 m</div>
            <ImpactRow k="subjsize" name="Subject size" dir="dn" title="Falls as the subject walks away" ladders={ladders} />
            <ImpactRow k="bgblur" name="Background blur" dir="dn" title="Falls as the subject walks away" ladders={ladders} />
            <ImpactRow k="dof" name="Depth of field" dir="up" title="Rises as the subject walks away" ladders={ladders} />
          </div>
        </article>
      </section>
    </>
  );
}

import { useSim } from '../store';
import { APS, ISOS, SHUTTERS, distOf, distToSlider } from '../optics';
import ControlSlider from './ControlSlider';
import IrisDiagram from './IrisDiagram';

export default function ControlsCard() {
  const focal = useSim(s => s.focal);
  const ap = useSim(s => s.ap);
  const iso = useSim(s => s.iso);
  const sh = useSim(s => s.sh);
  const dist = useSim(s => s.dist);

  const setFocal = useSim(s => s.setFocal);
  const setAp = useSim(s => s.setAp);
  const setIso = useSim(s => s.setIso);
  const setShutter = useSim(s => s.setShutter);
  const setDist = useSim(s => s.setDist);

  return (
    <div className="card controls">
      <ControlSlider
        id="Focal" label="Focal length" hint="zoom · framing · background blur"
        output={`${focal} mm`} value={focal} min={24} max={200}
        onChange={setFocal}
        ticks={[
          { v: 24, label: '24' }, { v: 35, label: '35' }, { v: 50, label: '50' },
          { v: 85, label: '85' }, { v: 135, label: '135' }, { v: 200, label: '200' },
        ]}
      />

      <ControlSlider
        id="Ap" label="Aperture" hint="light · depth of field"
        output={`ƒ/${APS[ap]}`} value={ap} min={0} max={8}
        onChange={setAp}
        ticks={APS.map(v => ({ v: APS.indexOf(v), label: String(v) }))}
      >
        <IrisDiagram />
      </ControlSlider>

      <ControlSlider
        id="Iso" label="ISO" hint="sensitivity · noise"
        output={ISOS[iso] >= 1000 ? `${ISOS[iso] / 1000}k` : `${ISOS[iso]}`}
        value={iso} min={0} max={8}
        onChange={setIso}
        ticks={[
          { v: 0, label: '100' }, { v: 1, label: '200' }, { v: 2, label: '400' },
          { v: 3, label: '800' }, { v: 4, label: '1600' }, { v: 5, label: '3200' },
          { v: 6, label: '6400' }, { v: 7, label: '12.8k' }, { v: 8, label: '25.6k' },
        ]}
      />

      <ControlSlider
        id="Shutter" label="Shutter speed" hint="light · motion & shake"
        output={`${SHUTTERS[sh].l} s`} value={sh} min={0} max={14}
        onChange={setShutter} tight
        ticks={[
          { v: 0, label: '8k' }, { v: 1, label: '4k' }, { v: 2, label: '2k' },
          { v: 3, label: '1k' }, { v: 4, label: '500' }, { v: 5, label: '250' },
          { v: 6, label: '125' }, { v: 7, label: '60' }, { v: 8, label: '30' },
          { v: 9, label: '15' }, { v: 10, label: '8' }, { v: 11, label: '4' },
          { v: 12, label: '½' }, { v: 13, label: '1″' }, { v: 14, label: '2″' },
        ]}
      />

      <ControlSlider
        id="Dist" label="Subject distance" hint="framing · focus plane"
        output={dist >= 10 ? `${dist.toFixed(0)} m` : `${dist.toFixed(1)} m`}
        value={distToSlider(dist)} min={0} max={100}
        onChange={v => setDist(distOf(v))}
        ticks={[
          { v: 0, label: '0.5m' }, { v: 40, label: '1m' }, { v: 63, label: '3m' },
          { v: 84, label: '7.5m' }, { v: 100, label: '15m' },
        ]}
      />
    </div>
  );
}

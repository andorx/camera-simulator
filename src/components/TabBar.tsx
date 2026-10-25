import type { ReactNode } from 'react';
import { useSim } from '../store';
import type { ViewKey } from '../types';

const TABS: { key: ViewKey; label: string; icon: ReactNode }[] = [
  {
    key: 'sim',
    label: 'Simulator',
    icon: (
      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
        <path d="M4.5 7.5h3l1.8-2.2h5.4l1.8 2.2h3v11h-15z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <circle cx="12" cy="13" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    key: 'modes',
    label: 'Camera Modes',
    icon: (
      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
        <circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 3.4v2.8M20.6 12h-2.8M12 20.6v-2.8M3.4 12h2.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="12" cy="12" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    key: 'guide',
    label: 'Quick Guide',
    icon: (
      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
        <circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M15.6 8.4l-2.1 5.1-5.1 2.1 2.1-5.1z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function TabBar() {
  const view = useSim(s => s.view);
  const setView = useSim(s => s.setView);

  return (
    <nav className="tabs" role="tablist" aria-label="App sections">
      {TABS.map(t => (
        <button
          key={t.key}
          role="tab"
          aria-selected={view === t.key}
          className={view === t.key ? 'active' : ''}
          onClick={() => setView(t.key)}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </nav>
  );
}

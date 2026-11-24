import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';

type CycleData = { starts: string[]; cycleLength: number; periodLength: number };
type ProfileId = 'maina' | 'girlfriend';
type CycleProfiles = Record<ProfileId, CycleData>;
const storageKey = 'canopy-cycle-profiles-v1';
const legacyStorageKey = 'canopy-cycle-tracker-v1';
const initialProfiles: CycleProfiles = {
  maina: { starts: [], cycleLength: 25, periodLength: 5 },
  girlfriend: { starts: [], cycleLength: 28, periodLength: 5 },
};
const profileDetails: Record<ProfileId, { label: string; heart: string; className: string }> = {
  maina: { label: 'MAINA', heart: '💚', className: 'maina' },
  girlfriend: { label: 'MY GIRLFRIEND', heart: '🩷', className: 'girlfriend' },
};

function isCycleData(value: unknown): value is CycleData {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CycleData>;
  return Array.isArray(item.starts)
    && item.starts.every((start) => typeof start === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(start) && !Number.isNaN(Date.parse(`${start}T12:00:00`)))
    && typeof item.cycleLength === 'number' && item.cycleLength >= 15 && item.cycleLength <= 60
    && typeof item.periodLength === 'number' && item.periodLength >= 1 && item.periodLength <= 10;
}

function isCycleProfiles(value: unknown): value is CycleProfiles {
  if (!value || typeof value !== 'object') return false;
  const profiles = value as Partial<Record<ProfileId, unknown>>;
  return isCycleData(profiles.maina) && isCycleData(profiles.girlfriend);
}

function shiftDate(value: string, days: number) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dateNumber(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString([], { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
}

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export default function CycleTracker() {
  const [profiles, setProfiles] = useState<CycleProfiles>(initialProfiles);
  const [activeProfile, setActiveProfile] = useState<ProfileId>('maina');
  const [startDraft, setStartDraft] = useState(todayKey());
  const [storageReady, setStorageReady] = useState(false);
  const data = profiles[activeProfile];

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved === null) {
        const legacySaved = window.localStorage.getItem(legacyStorageKey);
        if (legacySaved) {
          const legacyData: unknown = JSON.parse(legacySaved);
          if (!isCycleData(legacyData)) throw new Error('Saved cycle data has an unexpected format and was not changed.');
          setProfiles({ ...initialProfiles, maina: legacyData });
        } else {
          setProfiles(initialProfiles);
        }
      } else {
        const parsed: unknown = JSON.parse(saved);
        if (!isCycleProfiles(parsed)) throw new Error('Saved cycle profiles have an unexpected format and were not changed.');
        setProfiles(parsed);
      }
      setStorageReady(true);
    } catch (error) {
      notifications.show({
        title: 'CYCLE PROFILES COULD NOT BE LOADED',
        message: error instanceof Error ? error.message : 'The browser could not access its local storage.',
      });
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(profiles));
    } catch (error) {
      notifications.show({
        title: 'CYCLE PROFILES COULD NOT BE SAVED',
        message: error instanceof Error ? error.message : 'The browser could not access its local storage.',
      });
    }
  }, [profiles, storageReady]);

  const starts = useMemo(() => [...data.starts].sort(), [data.starts]);
  const lastStart = starts[starts.length - 1];
  const recentStarts = starts.slice(-7);
  const recentIntervals = recentStarts.slice(1).map((start, index) => (
    Math.round((dateNumber(start) - dateNumber(recentStarts[index])) / 86_400_000)
  )).filter((days) => days >= 15 && days <= 60);
  const predictedCycleLength = recentIntervals.length
    ? Math.round(recentIntervals.reduce((sum, days) => sum + days, 0) / recentIntervals.length)
    : data.cycleLength;
  const nextStart = lastStart ? shiftDate(lastStart, predictedCycleLength) : null;
  const forecasts = lastStart
    ? Array.from({ length: 5 }, (_, index) => {
      const start = shiftDate(lastStart, predictedCycleLength * (index + 1));
      return { start, end: shiftDate(start, data.periodLength - 1) };
    })
    : [];
  const elapsedDays = lastStart
    ? Math.floor((dateNumber(todayKey()) - dateNumber(lastStart)) / 86_400_000)
    : null;
  const cycleDay = elapsedDays !== null && elapsedDays >= 0 ? (elapsedDays % predictedCycleLength) + 1 : null;

  function addStart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (startDraft > todayKey()) {
      notifications.show({ title: 'CHOOSE A PAST OR CURRENT DATE', message: 'A logged period start cannot be in the future.' });
      return;
    }
    if (starts.includes(startDraft)) {
      notifications.show({ title: 'DATE ALREADY LOGGED', message: 'That start date is already in your cycle history.' });
      return;
    }
    setProfiles((current) => ({
      ...current,
      [activeProfile]: { ...current[activeProfile], starts: [...current[activeProfile].starts, startDraft] },
    }));
    notifications.show({ title: 'PERIOD START LOGGED', message: 'Your private cycle record was saved on this device.' });
  }

  function updateNumber(key: 'cycleLength' | 'periodLength', value: string) {
    const number = Number(value);
    const min = key === 'cycleLength' ? 15 : 1;
    const max = key === 'cycleLength' ? 60 : 10;
    if (!Number.isInteger(number) || number < min || number > max) return;
    setProfiles((current) => ({
      ...current,
      [activeProfile]: { ...current[activeProfile], [key]: number },
    }));
  }

  function clearHistory() {
    setProfiles((current) => ({
      ...current,
      [activeProfile]: { ...current[activeProfile], starts: [] },
    }));
  }

  return (
    <section className={`cycle-tracker profile-${profileDetails[activeProfile].className}`}>
      <header className="cycle-heading">
        <div><span className="card-kicker">HEALTH · PRIVATE CYCLE TRACKER</span><h2>Separate cycle profiles.</h2><p>Each profile has its own dates, cycle length, period length, and next-start prediction.</p></div>
        <span className="cycle-length-chip">{profileDetails[activeProfile].heart} {profileDetails[activeProfile].label}</span>
      </header>
      <nav aria-label="Period tracker profiles" className="cycle-profile-switcher">
        {(Object.keys(profileDetails) as ProfileId[]).map((profile) => (
          <button
            aria-pressed={activeProfile === profile}
            className={`cycle-profile-button${activeProfile === profile ? ' active' : ''}`}
            key={profile}
            onClick={() => setActiveProfile(profile)}
            type="button"
          >
            <span aria-hidden="true" className={`cycle-profile-heart ${profileDetails[profile].className}`}>{profileDetails[profile].heart}</span>
            <span><b>{profileDetails[profile].label}</b><small>{profile === 'maina' ? 'MAINA · 25-DAY STARTING SETTING' : 'PARTNER · 28-DAY STARTING SETTING'}</small></span>
          </button>
        ))}
      </nav>
      <p className="cycle-privacy-note">These are separate profiles on this device, not password-protected accounts. Only add or view your girlfriend’s health information with her consent.</p>
      <div className="cycle-dashboard">
        <div className="cycle-summary">
          <div className="cycle-orbit" aria-hidden="true"><span>{cycleDay ? `DAY ${cycleDay}` : 'LOG A START'}</span></div>
          <div className="cycle-estimate">
            <span className="card-kicker">ESTIMATED NEXT START</span>
            <strong>{nextStart ? formatDate(nextStart) : 'Add your last start date'}</strong>
            <small>{lastStart
              ? recentIntervals.length
                ? `Auto-estimated from ${recentIntervals.length} recent cycle interval${recentIntervals.length === 1 ? '' : 's'} · ${predictedCycleLength} days`
                : `Based on the ${data.cycleLength}-day starting setting · log more starts to personalize it`
              : `No dates logged yet · ${data.cycleLength} days is a starting setting, not a medical prediction.`}</small>
          </div>
        </div>
        <div className="cycle-settings">
          <form onSubmit={addStart}>
            <label htmlFor="cycle-start-date">Log the first day of a period</label>
            <div><input id="cycle-start-date" max={todayKey()} onChange={(event) => setStartDraft(event.currentTarget.value)} type="date" value={startDraft} /><Button className="form-button" type="submit">LOG START DATE</Button></div>
          </form>
          <div className="cycle-number-settings">
            <label>Typical cycle length <span><input aria-label="Cycle length in days" max="60" min="15" onChange={(event) => updateNumber('cycleLength', event.currentTarget.value)} type="number" value={data.cycleLength} /> days</span></label>
            <label>Typical period length <span><input aria-label="Period length in days" max="10" min="1" onChange={(event) => updateNumber('periodLength', event.currentTarget.value)} type="number" value={data.periodLength} /> days</span></label>
          </div>
          <small className="cycle-predictor-note">After at least two logged starts, the prediction uses the average of up to six recent cycle gaps.</small>
        </div>
      </div>
      <section aria-labelledby="cycle-forecast-title" className="cycle-forecast">
        <header className="cycle-forecast-heading">
          <div><span className="card-kicker">NEXT FIVE CYCLES</span><h3 id="cycle-forecast-title">A rolling outlook</h3></div>
          <span className="cycle-forecast-refresh">RECALCULATES AS YOU LOG</span>
        </header>
        {forecasts.length ? (
          <ol className="cycle-forecast-grid">
            {forecasts.map((forecast, index) => (
              <li className={`cycle-forecast-card${index === 0 ? ' next' : ''}`} key={forecast.start}>
                <span>CYCLE {index + 1}</span>
                <strong>{formatDate(forecast.start)}</strong>
                <small>{data.periodLength} day{data.periodLength === 1 ? '' : 's'} · through {formatDate(forecast.end)}</small>
              </li>
            ))}
          </ol>
        ) : (
          <p className="cycle-forecast-empty">Log a period start to begin your five-cycle outlook. Each new start will update the dates using your recent cycle history.</p>
        )}
        <p className="cycle-forecast-method">Uses the average of up to six recent cycle gaps; before you have a gap to average, it uses your typical cycle-length setting.</p>
      </section>
      <div className="cycle-history-heading"><span className="card-kicker">RECENT START DATES</span><button className="text-button" disabled={!starts.length} onClick={clearHistory} type="button">CLEAR HISTORY</button></div>
      {starts.length ? (
        <div className="cycle-history">{starts.slice(-6).reverse().map((start) => <span key={start}>{formatDate(start)}</span>)}</div>
      ) : <p className="cycle-empty">No dates logged. Add a start date whenever you choose.</p>}
      <p className="cycle-disclaimer">Cycle length can vary. Predictions are estimates, not medical advice or contraception. These profiles are not password-protected; only use your girlfriend’s profile with her consent. Clear each profile’s history separately whenever you want.</p>
    </section>
  );
}

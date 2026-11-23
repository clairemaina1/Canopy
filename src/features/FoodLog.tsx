import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Button, Progress, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';

type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
type FoodEntry = { id: string; date: string; name: string; meal: MealType; calories: number };
type SavedFoodData = { entries: FoodEntry[]; target: number | null };

const storageKey = 'canopy-food-log-v1';
const offlineEstimates: Array<{ name: string; calories: number; portion: string }> = [
  { name: 'banana', calories: 105, portion: '1 medium banana' },
  { name: 'egg', calories: 78, portion: '1 large egg' },
  { name: 'cooked rice', calories: 205, portion: '1 cooked cup' },
  { name: 'chapati', calories: 250, portion: '1 medium piece (varies by recipe)' },
  { name: 'ugali', calories: 180, portion: '1 small serving (varies by recipe)' },
  { name: 'chicken breast', calories: 165, portion: '100 g, cooked' },
  { name: 'avocado', calories: 160, portion: '½ medium avocado' },
  { name: 'plain yogurt', calories: 150, portion: '1 cup, plain' },
  { name: 'oats', calories: 150, portion: '½ cup, dry' },
  { name: 'handful of nuts', calories: 170, portion: 'about 28 g' },
];

function getToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isSavedFoodData(value: unknown): value is SavedFoodData {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<SavedFoodData>;
  return Array.isArray(candidate.entries)
    && (candidate.target === null || typeof candidate.target === 'number')
    && candidate.entries.every((entry) => Boolean(entry)
      && typeof entry.id === 'string'
      && typeof entry.date === 'string'
      && typeof entry.name === 'string'
      && typeof entry.meal === 'string'
      && typeof entry.calories === 'number');
}

function errorText(error: unknown) {
  return error instanceof Error ? error.message : 'The browser could not access its local storage.';
}

export default function FoodLog() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [target, setTarget] = useState<number | null>(null);
  const [targetDraft, setTargetDraft] = useState('');
  const [foodName, setFoodName] = useState('');
  const [meal, setMeal] = useState<MealType>('BREAKFAST');
  const [calories, setCalories] = useState('');
  const [estimateNote, setEstimateNote] = useState('');
  const [storageReady, setStorageReady] = useState(false);
  const todayEntries = useMemo(() => entries.filter((entry) => entry.date === getToday()), [entries]);
  const totalCalories = todayEntries.reduce((total, entry) => total + entry.calories, 0);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (!isSavedFoodData(parsed)) throw new Error('The saved food log has an unexpected format and was not changed.');
        setEntries(parsed.entries);
        setTarget(parsed.target);
        setTargetDraft(parsed.target?.toString() ?? '');
      }
      setStorageReady(true);
    } catch (error) {
      notifications.show({
        title: 'LOCAL FOOD LOG NOT READY',
        message: `${errorText(error)} Your current entries will stay in memory and will not be overwritten.`,
      });
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ entries, target }));
    } catch (error) {
      setStorageReady(false);
      notifications.show({ title: 'FOOD LOG COULD NOT BE SAVED', message: errorText(error) });
    }
  }, [entries, storageReady, target]);

  function estimateOffline() {
    const query = foodName.trim().toLowerCase();
    const match = offlineEstimates.find((item) => query.includes(item.name));
    if (!match) {
      setEstimateNote('No local match. Add the calories from your packaging or a source you trust.');
      return;
    }
    setCalories(String(match.calories));
    setEstimateNote(`Offline estimate: ${match.calories} kcal for ${match.portion}. Adjust for your actual portion.`);
  }

  function addFood(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = foodName.trim();
    const calorieValue = Number(calories);
    if (!trimmedName || !Number.isFinite(calorieValue) || calorieValue <= 0) {
      notifications.show({ title: 'CHECK THIS ENTRY', message: 'Add a food name and a calorie amount greater than zero.' });
      return;
    }
    setEntries((current) => [...current, {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: getToday(),
      name: trimmedName,
      meal,
      calories: Math.round(calorieValue),
    }]);
    setFoodName('');
    setCalories('');
    setEstimateNote('');
  }

  function saveTarget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(targetDraft);
    if (!Number.isFinite(value) || value <= 0) {
      notifications.show({ title: 'ENTER YOUR OWN TARGET', message: 'Use a number greater than zero, or leave the target unset.' });
      return;
    }
    setTarget(Math.round(value));
  }

  function clearToday() {
    setEntries((current) => current.filter((entry) => entry.date !== getToday()));
  }

  const targetProgress = target ? Math.min(100, Math.round((totalCalories / target) * 100)) : 0;

  return (
    <div className="content learning-page food-page">
      <header className="page-heading">
        <div className="eyebrow"><span className="eyebrow-dot" /> A NEUTRAL, MANUAL FOOD LOG</div>
        <h1>Notice what nourishes you.</h1>
        <p>Log meals and snacks by hand. Set your own optional daily target—Canopy will never choose a body goal for you.</p>
      </header>

      <div className="food-dashboard">
        <section className="food-total-card">
          <span className="card-kicker">TODAY · FOOD & SNACKS</span>
          <div className="food-calorie-total">{totalCalories.toLocaleString()} <span>kcal</span></div>
          {target ? (
            <>
              <Progress className="task-progress" value={targetProgress} size="sm" />
              <div className="food-target-caption">{totalCalories <= target ? `${(target - totalCalories).toLocaleString()} kcal to your personal target` : `${(totalCalories - target).toLocaleString()} kcal over your personal target`}</div>
            </>
          ) : <p className="food-target-caption">NO TARGET SET · your log still works without one</p>}
        </section>

        <section className="surface-card food-target-card">
          <span className="card-kicker">YOUR CHOICE, YOUR TARGET</span>
          <form className="target-form" onSubmit={saveTarget}>
            <TextInput aria-label="Daily calorie target" min="1" onChange={(event) => setTargetDraft(event.currentTarget.value)} placeholder="Optional · enter your own kcal target" type="number" value={targetDraft} />
            <Button className="form-button" type="submit">SET MY TARGET</Button>
          </form>
          <small>Canopy does not prescribe calorie targets. Consider a qualified health professional for personal nutrition guidance.</small>
        </section>
      </div>

      <div className="food-log-layout">
        <section className="surface-card food-entry-card">
          <div className="card-kicker">ADD A MEAL OR SNACK</div>
          <form className="food-entry-form" onSubmit={addFood}>
            <TextInput aria-label="Food name" onChange={(event) => setFoodName(event.currentTarget.value)} placeholder="What did you have?" value={foodName} />
            <select aria-label="Meal or snack" onChange={(event) => setMeal(event.currentTarget.value as MealType)} value={meal}>
              <option>BREAKFAST</option><option>LUNCH</option><option>DINNER</option><option>SNACK</option>
            </select>
            <div className="calorie-input-row">
              <TextInput aria-label="Calories in this portion" min="1" onChange={(event) => setCalories(event.currentTarget.value)} placeholder="Calories for your portion" type="number" value={calories} />
              <Button className="secondary-button" onClick={estimateOffline} type="button">OFFLINE ESTIMATE</Button>
            </div>
            {estimateNote && <p aria-live="polite" className="estimate-note">{estimateNote}</p>}
            <Button className="form-button" type="submit">ADD TO TODAY</Button>
          </form>
          <div className="offline-food-notice"><b>PRIVACY:</b> This log is saved in this browser on this device only. No food data is sent to an AI service.</div>
        </section>

        <section className="surface-card food-list-card">
          <div className="food-list-heading">
            <div><span className="card-kicker">TODAY'S ENTRIES</span><h2>{todayEntries.length} item{todayEntries.length === 1 ? '' : 's'}</h2></div>
            <button className="text-button" disabled={todayEntries.length === 0} onClick={clearToday} type="button">CLEAR TODAY</button>
          </div>
          {todayEntries.length === 0 ? (
            <p className="empty-food">Nothing logged yet. Start with a meal or snack when it suits you.</p>
          ) : (
            <div className="food-entry-list">
              {todayEntries.map((entry) => (
                <article className="food-entry" key={entry.id}>
                  <div><span className="card-kicker">{entry.meal}</span><b>{entry.name}</b></div>
                  <strong>{entry.calories.toLocaleString()} kcal</strong>
                  <button aria-label={`Remove ${entry.name}`} onClick={() => setEntries((current) => current.filter((item) => item.id !== entry.id))} type="button">×</button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="food-estimator-note">
        <span className="card-kicker">ABOUT OFFLINE ESTIMATES</span>
        <p>Estimates use a tiny on-device reference for common portions. They are approximations, not AI analysis; recipes, brands, and serving sizes can change the number. If tracking ever feels stressful, it’s okay to stop or clear the log.</p>
      </section>
    </div>
  );
}

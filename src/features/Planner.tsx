import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Button, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import SemesterStudy from './SemesterStudy';
import { extractDocumentText } from './documentText';

type EventKind = 'class' | 'study' | 'personal' | 'travel';
type CalendarEvent = {
  id: string;
  title: string;
  startsAt: string;
  kind: EventKind;
  reminderMinutes: number;
};

const eventStorageKey = 'canopy-calendar-events-v1';
const reminderStorageKey = 'canopy-calendar-reminders-v1';
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function addDays(value: string, days: number) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

function makeStart(date: string, hour: number, minute = 0) {
  return `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function validDate(year: number, month: number, day: number) {
  const date = new Date(year, month, day);
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day
    ? dateKey(date)
    : null;
}

function lineDate(line: string, currentYear: number): string | null {
  const iso = line.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (iso) return validDate(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));

  const monthDayFirst = line.match(/\b([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(\d{4}))?\b/i);
  const dayMonthFirst = line.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)(?:,?\s+(\d{4}))?\b/i);
  const dayMonthName = dayMonthFirst?.[2].slice(0, 3).toLowerCase();
  const dayMonthHasRealMonth = Boolean(dayMonthName && monthNames.some((name) => name.slice(0, 3).toLowerCase() === dayMonthName));
  const match = dayMonthHasRealMonth ? dayMonthFirst : monthDayFirst;
  const isDayFirst = dayMonthHasRealMonth;
  if (!match) {
    if (/\btomorrow\b/i.test(line)) return addDays(dateKey(new Date()), 1);
    return null;
  }
  const monthName = (isDayFirst ? match[2] : match[1]).slice(0, 3).toLowerCase();
  const month = monthNames.findIndex((name) => name.slice(0, 3).toLowerCase() === monthName);
  if (month < 0) return null;
  const day = Number(isDayFirst ? match[1] : match[2]);
  const year = Number(match[3]) || currentYear;
  return validDate(year, month, day);
}

function lineTime(line: string): { hour: number; minute: number } | null {
  const twelveHour = line.match(/\b(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)\b/i);
  if (twelveHour) {
    let hour = Number(twelveHour[1]) % 12;
    if (/p/i.test(twelveHour[3])) hour += 12;
    return { hour, minute: Number(twelveHour[2] ?? 0) };
  }
  const twentyFourHour = line.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (twentyFourHour) return { hour: Number(twentyFourHour[1]), minute: Number(twentyFourHour[2]) };
  const eveningTime = line.match(/\b(?:at|around)\s+(\d{1,2})\b/i);
  if (eveningTime) {
    let hour = Number(eveningTime[1]);
    if (/\b(evening|night)\b/i.test(line) && hour < 12) hour += 12;
    return hour <= 23 ? { hour, minute: 0 } : null;
  }
  return null;
}

function cleanEventTitle(line: string) {
  return line
    .replace(/\b\d{4}-\d{1,2}-\d{1,2}\b/g, '')
    .replace(/\b\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+\d{4}\b/gi, '')
    .replace(/\b[A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?\b/gi, '')
    .replace(/\b(?:[01]?\d|2[0-3]):[0-5]\d(?:\s*[-–—]\s*(?:[01]?\d|2[0-3]):[0-5]\d)?\b/g, '')
    .replace(/\b(?:at|around)\s+\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)?\b/gi, '')
    .replace(/\b\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)\b/gi, '')
    .replace(/\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/gi, '')
    .replace(/^[\s,;:·–—-]+|[\s,;:·–—-]+$/g, '')
    .trim();
}

function isClassEventTitle(title: string) {
  return /\b(?:class|lecture|exam|school|tutorial|lab|seminar|lesson)\b|\b(?:zoom|teams|webex|google meet)\b/i.test(title);
}

function isOnlineClassTitle(title: string) {
  return /\b(?:online|virtual|zoom|teams|webex|google meet)\b/i.test(title);
}

function eventReminderMinutes(title: string, kind: EventKind) {
  return kind === 'class' && isOnlineClassTitle(title) ? 3 : 10;
}

function parseEvents(text: string): CalendarEvent[] {
  const year = new Date().getFullYear();
  return text.split(/\r?\n/).flatMap((rawLine) => {
    const line = rawLine.trim();
    if (!line) return [];
    const date = lineDate(line, year);
    const time = lineTime(line);
    if (!date || !time) return [];
    const title = cleanEventTitle(line) || 'Scheduled commitment';
    const kind: EventKind = isClassEventTitle(title) ? 'class' : 'personal';
    return [{ id: createId(), title, startsAt: makeStart(date, time.hour, time.minute), kind, reminderMinutes: eventReminderMinutes(title, kind) }];
  });
}

function extractTopics(text: string) {
  const ignored = /^(course outline|full semester schedule|school timetable|my typical day|my mental day|course topics|subjects|contents?)\b/i;
  const seen = new Set<string>();
  return text.split(/\r?\n/).map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter((line) => line.length >= 5 && line.length <= 110 && !ignored.test(line) && !lineDate(line, new Date().getFullYear()))
    .filter((line) => {
      const key = line.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
}

function eventDate(event: CalendarEvent) {
  return event.startsAt.slice(0, 10);
}

function eventTime(event: CalendarEvent) {
  return new Date(event.startsAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function eventMatches(value: unknown): value is CalendarEvent {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<CalendarEvent>;
  return typeof item.id === 'string'
    && typeof item.title === 'string'
    && typeof item.startsAt === 'string'
    && ['class', 'study', 'personal', 'travel'].includes(item.kind ?? '')
    && typeof item.reminderMinutes === 'number';
}

type RoutineConstraints = {
  wakeMinutes: number | null;
  sleepMinutes: number | null;
  busyRanges: Array<{ start: number; end: number }>;
};

function parseClock(hourText: string, minuteText: string | undefined, period: string) {
  const hour = Number(hourText);
  const minute = Number(minuteText ?? 0);
  if (hour < 1 || hour > 12 || minute > 59) return null;
  return (hour % 12 + (/p/i.test(period) ? 12 : 0)) * 60 + minute;
}

function parseRoutineConstraints(text: string): RoutineConstraints {
  const wakeMatch = text.match(/\b(?:wake(?:\s+up)?|get\s+up)\s*(?:at|around|by)?\s*(\d{1,2})(?::([0-5]\d))?\s*(a\.?m\.?|p\.?m\.?)\b/i);
  const sleepMatch = text.match(/\b(?:sleep|bed|go\s+to\s+bed)\s*(?:at|around|by)?\s*(\d{1,2})(?::([0-5]\d))?\s*(a\.?m\.?|p\.?m\.?)\b/i);
  const busyRanges: RoutineConstraints['busyRanges'] = [];
  const rangePattern = /\b(\d{1,2})(?::([0-5]\d))?\s*(a\.?m\.?|p\.?m\.?)\s*(?:-|–|—|to)\s*(\d{1,2})(?::([0-5]\d))?\s*(a\.?m\.?|p\.?m\.?)\b/gi;
  for (const match of text.matchAll(rangePattern)) {
    const start = parseClock(match[1], match[2], match[3]);
    let end = parseClock(match[4], match[5], match[6]);
    if (start === null || end === null) continue;
    if (end <= start) end += 24 * 60;
    busyRanges.push({ start, end });
  }
  const wakeMinutes = wakeMatch ? parseClock(wakeMatch[1], wakeMatch[2], wakeMatch[3]) : null;
  let sleepMinutes = sleepMatch ? parseClock(sleepMatch[1], sleepMatch[2], sleepMatch[3]) : null;
  if (sleepMinutes !== null && sleepMinutes < 6 * 60) sleepMinutes += 24 * 60;
  return { wakeMinutes, sleepMinutes, busyRanges };
}

function isRoutineAvailable(start: Date, routine: RoutineConstraints) {
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = startMinutes + 60;
  if (routine.wakeMinutes !== null && startMinutes < routine.wakeMinutes) return false;
  if (routine.sleepMinutes !== null && endMinutes > routine.sleepMinutes) return false;
  return !routine.busyRanges.some(({ start: busyStart, end: busyEnd }) => {
    const overlaps = (rangeStart: number, rangeEnd: number) => startMinutes < rangeEnd && endMinutes > rangeStart;
    return overlaps(busyStart, busyEnd)
      || (busyEnd > 24 * 60 && overlaps(busyStart - 24 * 60, busyEnd - 24 * 60));
  });
}

export default function Planner() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [draftEvents, setDraftEvents] = useState<CalendarEvent[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(dateKey(new Date()));
  const [scheduleText, setScheduleText] = useState('');
  const [outlineText, setOutlineText] = useState('');
  const [semesterUnits, setSemesterUnits] = useState<string[]>([]);
  const [fixedText, setFixedText] = useState('');
  const [routineText, setRoutineText] = useState('');
  const [commuteMinutes, setCommuteMinutes] = useState('60');
  const [trafficMinutes, setTrafficMinutes] = useState('15');
  const [studyHour, setStudyHour] = useState('18');
  const [importStatus, setImportStatus] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualTime, setManualTime] = useState('18:00');
  const [reminderPermission, setReminderPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundUnlocked, setSoundUnlocked] = useState(false);
  const [message, setMessage] = useState('');
  const firedRef = useRef<Set<string>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);

  const todayKey = dateKey(new Date());
  const monthTitle = `${monthNames[calendarMonth.getMonth()]} ${calendarMonth.getFullYear()}`;
  const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay();
  const monthDays = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const calendarCells = Array.from({ length: Math.ceil((firstDay + monthDays) / 7) * 7 }, (_, index) => {
    const day = index - firstDay + 1;
    return day > 0 && day <= monthDays
      ? new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day)
      : null;
  });
  const selectedEvents = events.filter((event) => eventDate(event) === selectedDate).sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(eventStorageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (!Array.isArray(parsed) || !parsed.every(eventMatches)) throw new Error('Saved calendar data has an unexpected format.');
        setEvents(parsed.map((event) => {
          const kind = event.kind === 'personal' && isClassEventTitle(event.title) ? 'class' : event.kind;
          const reminderMinutes = eventReminderMinutes(event.title, kind);
          return event.kind === kind && event.reminderMinutes === reminderMinutes
            ? event
            : { ...event, kind, reminderMinutes };
        }));
      }
      const fired = window.localStorage.getItem(reminderStorageKey);
      if (fired) {
        const parsed: unknown = JSON.parse(fired);
        if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === 'string')) throw new Error('Saved reminder data has an unexpected format.');
        firedRef.current = new Set(parsed);
      }
      setStorageReady(true);
    } catch (error) {
      notifications.show({
        title: 'CALENDAR STORAGE NOT READY',
        message: error instanceof Error ? error.message : 'The browser could not load calendar data.',
      });
    }
    if ('Notification' in window) setReminderPermission(Notification.permission);
    else setReminderPermission('unsupported');
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(eventStorageKey, JSON.stringify(events));
    } catch (error) {
      notifications.show({
        title: 'CALENDAR COULD NOT BE SAVED',
        message: error instanceof Error ? error.message : 'The browser could not save this schedule.',
      });
    }
  }, [events, storageReady]);

  useEffect(() => {
    if (!storageReady) return undefined;
    const checkReminders = () => {
      const now = Date.now();
      events.forEach((event) => {
        if (event.reminderMinutes < 0) return;
        const start = new Date(event.startsAt).getTime();
        const reminderAt = start - event.reminderMinutes * 60_000;
        if (now < reminderAt || now >= start || firedRef.current.has(event.id)) return;
        firedRef.current.add(event.id);
        notifications.show({ title: `REMINDER · ${event.title}`, message: `Starts at ${eventTime(event)}.` });
        if (reminderPermission === 'granted') {
          new Notification(event.title, { body: `Starts at ${eventTime(event)}.`, tag: event.id });
        }
        if (soundEnabled && audioContextRef.current) {
          const oscillator = audioContextRef.current.createOscillator();
          const gain = audioContextRef.current.createGain();
          oscillator.frequency.value = 740;
          gain.gain.setValueAtTime(0.0001, audioContextRef.current.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.15, audioContextRef.current.currentTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioContextRef.current.currentTime + 0.7);
          oscillator.connect(gain);
          gain.connect(audioContextRef.current.destination);
          oscillator.start();
          oscillator.stop(audioContextRef.current.currentTime + 0.72);
        }
        try {
          window.localStorage.setItem(reminderStorageKey, JSON.stringify([...firedRef.current]));
        } catch (error) {
          notifications.show({
            title: 'REMINDER STATE COULD NOT BE SAVED',
            message: error instanceof Error ? error.message : 'The browser could not save reminder history.',
          });
        }
      });
    };
    checkReminders();
    const intervalId = window.setInterval(checkReminders, 15_000);
    window.addEventListener('focus', checkReminders);
    document.addEventListener('visibilitychange', checkReminders);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', checkReminders);
      document.removeEventListener('visibilitychange', checkReminders);
    };
  }, [events, reminderPermission, soundEnabled, storageReady]);

  async function enableReminders() {
    try {
      let permission: NotificationPermission | 'unsupported' = 'unsupported';
      if ('Notification' in window) {
        permission = Notification.permission === 'default'
          ? await Notification.requestPermission()
          : Notification.permission;
        setReminderPermission(permission);
      } else {
        setReminderPermission('unsupported');
      }
      if ('AudioContext' in window) {
        const context = audioContextRef.current ?? new AudioContext();
        await context.resume();
        audioContextRef.current = context;
      }
      setSoundUnlocked(true);
      notifications.show({
        title: 'REMINDERS ENABLED',
        message: permission === 'granted'
          ? 'Approved events can send browser alerts while CANOPY stays open.'
          : 'In-app reminders are active; browser alerts may need notification permission.',
      });
    } catch (error) {
      notifications.show({
        title: 'REMINDERS COULD NOT BE ENABLED',
        message: error instanceof Error ? error.message : 'Check browser notification and audio permissions, then try again.',
      });
    }
  }

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
    for (const file of files) {
      if (file.size > 20 * 1024 * 1024) {
        notifications.show({ title: 'FILE TOO LARGE', message: `${file.name} is over 20 MB. Choose a smaller file.` });
        continue;
      }
      try {
        const extracted = await extractDocumentText(file, setImportStatus);
        if (!extracted.trim()) throw new Error(`No readable text was found in ${file.name}. You can still paste its schedule manually.`);
        setScheduleText((current) => `${current}${current.trim() ? '\n' : ''}${extracted}`);
        setImportStatus(`Read ${file.name} locally. Review the extracted text before generating a plan.`);
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'The file could not be read.';
        setImportStatus(reason);
        notifications.show({ title: `COULD NOT READ ${file.name}`, message: reason });
      }
    }
  }

  function generatePlan() {
    const importedEvents = parseEvents(`${scheduleText}\n${fixedText}`);
    const topicMap = new Map<string, string>();
    [...semesterUnits, ...extractTopics(outlineText)].forEach((topic) => topicMap.set(topic.toLowerCase(), topic));
    const topics = Array.from(topicMap.values()).slice(0, 15);
    const commitments = [...events, ...importedEvents];
    const drafts = [...importedEvents];
    const commute = Math.max(0, Number(commuteMinutes) || 0) + Math.max(0, Number(trafficMinutes) || 0);
    const routine = parseRoutineConstraints(routineText);
    let unscheduledTopics = 0;

    importedEvents.filter((event) => event.kind === 'class' && commute > 0).forEach((event) => {
      const departure = new Date(new Date(event.startsAt).getTime() - commute * 60_000);
      if (dateKey(departure) === eventDate(event)) {
        drafts.push({
          id: createId(),
          title: `Travel buffer · ${event.title}`,
          startsAt: makeStart(eventDate(event), departure.getHours(), departure.getMinutes()),
          kind: 'travel',
          reminderMinutes: 10,
        });
      }
    });

    const startDate = addDays(todayKey, 1);
    const blockedStarts = new Set(commitments.map((event) => new Date(event.startsAt).getTime()));
    topics.forEach((topic, index) => {
      let dayOffset = Math.floor(index / 2);
      let start = new Date(makeStart(addDays(startDate, dayOffset), Number(studyHour)));
      let attempts = 0;
      while (
        attempts < 24 * 30
        && (start.getHours() > 21 || blockedStarts.has(start.getTime()) || !isRoutineAvailable(start, routine))
      ) {
        if (start.getHours() > 21) {
          dayOffset += 1;
          start = new Date(makeStart(addDays(startDate, dayOffset), Number(studyHour)));
        } else {
          start = new Date(start.getTime() + 60 * 60_000);
        }
        attempts += 1;
      }
      if (attempts >= 24 * 30) {
        unscheduledTopics += 1;
        return;
      }
      blockedStarts.add(start.getTime());
      drafts.push({
        id: createId(),
        title: `Study · ${topic}`,
        startsAt: makeStart(dateKey(start), start.getHours()),
        kind: 'study',
        reminderMinutes: 10,
      });
    });
    setDraftEvents(drafts.sort((a, b) => a.startsAt.localeCompare(b.startsAt)));
    const routineNote = routine.wakeMinutes !== null || routine.sleepMinutes !== null || routine.busyRanges.length
      ? ' Daily routine limits were applied.'
      : '';
    const unscheduledNote = unscheduledTopics
      ? ` ${unscheduledTopics} topic${unscheduledTopics === 1 ? ' could' : 's could'} not fit the next 30 days of your routine.`
      : '';
    const unitNote = semesterUnits.length ? ` Included ${semesterUnits.length} current semester unit${semesterUnits.length === 1 ? '' : 's'}.` : '';
    setMessage(`Prepared ${drafts.length} draft event${drafts.length === 1 ? '' : 's'} from the text and course outline.${unitNote}${routineNote} Review and approve the ones you want.${unscheduledNote}`);
  }

  function addManualEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = manualTitle.trim();
    if (!title) return;
    const kind: EventKind = isClassEventTitle(title) ? 'class' : 'personal';
    const newEvent: CalendarEvent = {
      id: createId(),
      title,
      startsAt: `${selectedDate}T${manualTime}`,
      kind,
      reminderMinutes: eventReminderMinutes(title, kind),
    };
    setDraftEvents((current) => [...current, newEvent].sort((a, b) => a.startsAt.localeCompare(b.startsAt)));
    setManualTitle('');
    setMessage('Added to drafts. Approve the event to place it on your calendar and enable reminders.');
  }

  function approveEvent(event: CalendarEvent) {
    setEvents((current) => current.some((item) => item.id === event.id) ? current : [...current, event].sort((a, b) => a.startsAt.localeCompare(b.startsAt)));
    setDraftEvents((current) => current.filter((item) => item.id !== event.id));
    setSelectedDate(eventDate(event));
    setMessage(`Approved “${event.title}”. Its ${event.reminderMinutes}-minute reminder is synced to your schedule.`);
  }

  function dismissDraft(id: string) {
    setDraftEvents((current) => current.filter((item) => item.id !== id));
  }

  function removeEvent(id: string) {
    setEvents((current) => current.filter((event) => event.id !== id));
    firedRef.current.delete(id);
  }

  function moveMonth(amount: number) {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  }

  const reminderActionLabel = reminderPermission === 'granted'
    ? soundUnlocked ? 'BROWSER ALERTS & SOUND READY' : 'UNLOCK ALARM SOUND'
    : reminderPermission === 'denied'
      ? soundUnlocked ? 'ALERTS BLOCKED · SOUND READY' : 'ALERTS BLOCKED · UNLOCK SOUND'
      : soundUnlocked ? 'ENABLE BROWSER ALERTS' : 'ENABLE BROWSER ALERTS & SOUND';

  return (
    <div className="content learning-page planner-page">
      <header className="page-heading">
        <div className="eyebrow"><span className="eyebrow-dot" /> YOUR TIME · YOUR APPROVAL</div>
        <h1>Make a schedule that fits your real life.</h1>
        <p>Import a timetable, course outline, or reminders; review the suggested plan; approve only what works for you.</p>
      </header>

      <section className="planner-calendar-layout">
        <section className="planner-panel calendar-panel">
          <div className="planner-panel-heading">
            <div><span className="card-kicker">EVENTS & CALENDAR</span><h2>Your calendar</h2></div>
            <div className="calendar-month-control">
              <button aria-label="Previous month" onClick={() => moveMonth(-1)} type="button">‹</button>
              <b>{monthTitle}</b>
              <button aria-label="Next month" onClick={() => moveMonth(1)} type="button">›</button>
            </div>
          </div>
          <div className="calendar-grid" role="grid" aria-label={`${monthTitle} calendar`}>
            {weekDays.map((day) => <span className="calendar-weekday" key={day}>{day}</span>)}
            {calendarCells.map((date, index) => {
              const key = date ? dateKey(date) : `empty-${index}`;
              const hasEvents = date ? events.some((event) => eventDate(event) === key) : false;
              return date ? (
                <button aria-label={`${monthNames[date.getMonth()]} ${date.getDate()}${hasEvents ? ', has events' : ''}`} aria-pressed={selectedDate === key} className={`calendar-day${selectedDate === key ? ' selected' : ''}${todayKey === key ? ' today' : ''}${hasEvents ? ' has-events' : ''}`} key={key} onClick={() => setSelectedDate(key)} type="button">
                  <span>{date.getDate()}</span>{hasEvents && <i aria-hidden="true" />}
                </button>
              ) : <span aria-hidden="true" className="calendar-day empty" key={key} />
            })}
          </div>
          <div className="selected-day-events">
            <div className="card-kicker">{new Date(`${selectedDate}T12:00`).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}</div>
            {selectedEvents.length ? selectedEvents.map((event) => (
              <article className={`calendar-event ${event.kind}`} key={event.id}>
                <time>{eventTime(event)}</time><span><b>{event.title}</b><small>{event.kind.toUpperCase()} · {event.reminderMinutes} MIN REMINDER</small></span>
                <button aria-label={`Remove ${event.title}`} onClick={() => removeEvent(event.id)} type="button">×</button>
              </article>
            )) : <p className="planner-empty">Nothing approved for this day yet.</p>}
          </div>
        </section>

        <section className="planner-panel">
          <div className="planner-panel-heading">
            <div><span className="card-kicker">REMINDERS & ALARMS</span><h2>Your approved schedule</h2></div>
            <span className={`permission-chip ${storageReady ? 'ready' : ''}`}>{storageReady ? 'AUTO-SYNC ON' : 'LOADING'}</span>
          </div>
          <p className="planner-helper">Reminders automatically follow approved events. Online classes alert 3 minutes before; other events use their listed lead time. Keep CANOPY open for in-app alarms. Enable browser permission for desktop alerts; sound may need unlocking again after reopening CANOPY.</p>
          <div className="reminder-actions">
            <Button className="form-button" onClick={enableReminders} type="button">{reminderActionLabel}</Button>
            <label className="alarm-toggle"><input checked={soundEnabled} onChange={(event) => setSoundEnabled(event.currentTarget.checked)} type="checkbox" /> Sound alarm</label>
          </div>
          <form className="manual-event-form" onSubmit={addManualEvent}>
            <span className="card-kicker">ADD A PERSONAL EVENT</span>
            <TextInput aria-label="Event title" onChange={(event) => setManualTitle(event.currentTarget.value)} placeholder="e.g. Review aviation notes" value={manualTitle} />
            <div><input aria-label="Event time" onChange={(event) => setManualTime(event.currentTarget.value)} type="time" value={manualTime} /><Button className="secondary-button" type="submit">ADD TO DRAFTS</Button></div>
          </form>
        </section>
      </section>

      <section className="planner-panel planner-import">
        <div className="planner-panel-heading">
          <div><span className="card-kicker">BUILD A STUDY PLAN</span><h2>Bring your real commitments</h2></div>
          <span className="privacy-chip">READ ON THIS DEVICE · NOT UPLOADED</span>
        </div>
        <p className="planner-helper">Choose text, PDF, or image files. Text is read locally; scanned PDFs (up to 8 pages) and images use English OCR in your browser. Check extracted text carefully—OCR and date recognition can make mistakes.</p>
        <label className="planner-file-picker">
          <input accept=".txt,.md,.csv,.pdf,image/*" multiple onChange={handleFiles} type="file" />
          <span>＋ &nbsp; ADD TEXT, PDF OR IMAGES</span>
          <small>Maximum 20 MB per file</small>
        </label>
        {importStatus && <p aria-live="polite" className="import-status">{importStatus}</p>}
        <label className="planner-field">
          <span>EVENTS & EXAM DATES</span>
          <textarea onChange={(event) => setScheduleText(event.currentTarget.value)} placeholder={'Paste one commitment per line, for example:\n2026-11-28 14:00 — Database Systems exam\nDec 2, 2026 at 9am — Flight school information session'} value={scheduleText} />
        </label>
        <div className="planner-input-grid">
          <label className="planner-field"><span>COURSE OUTLINE & TOPICS</span><textarea onChange={(event) => setOutlineText(event.currentTarget.value)} placeholder={'Paste course topics, assignment names, or revision goals.\nExample:\nDatabase normalization\nReact forms and validation\nMeteorology: cloud types'} value={outlineText} /></label>
          <label className="planner-field"><span>FIXED SCHOOL / WORK TIMETABLE</span><textarea onChange={(event) => setFixedText(event.currentTarget.value)} placeholder="Paste classes or work commitments, including dates and start times when known." value={fixedText} /></label>
          <label className="planner-field"><span>MY TYPICAL DAY & APPROVED ROUTINE</span><small>Use times like “Wake 7 AM, classes 9 AM–2 PM, sleep 11 PM.” Ranges repeat daily.</small><textarea onChange={(event) => setRoutineText(event.currentTarget.value)} placeholder="Include wake/sleep times and any recurring busy ranges." value={routineText} /></label>
        </div>
        <div className="planner-preferences">
          <label><span>Commute each way</span><input min="0" max="240" onChange={(event) => setCommuteMinutes(event.currentTarget.value)} type="number" value={commuteMinutes} /> min</label>
          <label><span>Traffic buffer</span><input min="0" max="180" onChange={(event) => setTrafficMinutes(event.currentTarget.value)} type="number" value={trafficMinutes} /> min</label>
          <label><span>Preferred study start</span><select onChange={(event) => setStudyHour(event.currentTarget.value)} value={studyHour}>{[8, 9, 10, 14, 15, 16, 17, 18, 19, 20].map((hour) => <option key={hour} value={hour}>{new Date(2000, 0, 1, hour).toLocaleTimeString([], { hour: 'numeric' })}</option>)}</select></label>
        </div>
        <div className="planner-generation-actions">
          <Button className="form-button" onClick={generatePlan} type="button">GENERATE A DRAFT PLAN</Button>
          <span>Current semester units are included automatically. Drafts remain unapproved until you choose.</span>
        </div>
      </section>

      <SemesterStudy onUnitsChange={setSemesterUnits} />

      {message && <p aria-live="polite" className="planner-message">{message}</p>}
      {draftEvents.length > 0 && (
        <section className="planner-panel draft-plan">
          <div className="planner-panel-heading">
            <div><span className="card-kicker">NOT APPROVED YET</span><h2>Review your plan</h2></div>
            <Button className="form-button" onClick={() => { setEvents((current) => [...current, ...draftEvents].sort((a, b) => a.startsAt.localeCompare(b.startsAt))); setDraftEvents([]); setMessage('All reviewed drafts are now approved and on your calendar.'); }} type="button">APPROVE ALL DRAFTS</Button>
          </div>
          <div className="draft-event-list">
            {draftEvents.map((event) => (
              <article className={`draft-event ${event.kind}`} key={event.id}>
                <div><span className="card-kicker">{event.kind.toUpperCase()}</span><b>{event.title}</b><small>{new Date(event.startsAt).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</small></div>
                <button className="text-button" onClick={() => approveEvent(event)} type="button">APPROVE</button>
                <button aria-label={`Remove draft ${event.title}`} className="draft-dismiss" onClick={() => dismissDraft(event.id)} type="button">×</button>
              </article>
            ))}
          </div>
        </section>
      )}
      <p className="planner-disclaimer">CANOPY stores approved events in this browser on this device. It does not send files to a server. Reminders are not guaranteed when the browser is closed, the device is asleep, or notifications are blocked.</p>
    </div>
  );
}

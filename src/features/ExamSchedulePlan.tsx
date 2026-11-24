import { useMemo, useState } from 'react';
import { Button } from '@mantine/core';

type ExamEntry = {
  code?: string;
  name: string;
  examDate?: string;
  examTime?: string;
  group?: string;
  venue?: string;
  lecturer?: string;
};
type StudySession = { focus: string; unit: ExamEntry };
type PlanDay = { date: string; sessions: StudySession[]; exams: ExamEntry[] };

const studyFocuses = ['Learn one core idea', 'Practice an exam-style question', 'Recall, then correct mistakes'];
const dayFormatter = new Intl.DateTimeFormat('en-KE', { weekday: 'short', day: 'numeric', month: 'short' });
const longDateFormatter = new Intl.DateTimeFormat('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function dateFromKey(date: string) {
  return new Date(`${date}T12:00:00`);
}

function daysBetween(start: string, end: string) {
  return Math.round((dateFromKey(end).getTime() - dateFromKey(start).getTime()) / 86_400_000);
}

function makePlan(units: ExamEntry[], blocksPerDay: number): PlanDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = toDateKey(today);
  const upcoming = units.filter((unit) => unit.examDate && unit.examDate >= todayKey).sort((left, right) => left.examDate!.localeCompare(right.examDate!));
  if (!upcoming.length) return [];

  const lastExam = upcoming.at(-1)!.examDate!;
  const sessionCounts = new Map<string, number>();
  const plan: PlanDay[] = [];
  const cursor = new Date(today);

  while (toDateKey(cursor) <= lastExam) {
    const date = toDateKey(cursor);
    const exams = upcoming.filter((unit) => unit.examDate === date);
    const available = upcoming.filter((unit) => unit.examDate! > date);
    const sessions: StudySession[] = [];

    if (!exams.length) {
      for (let block = 0; block < blocksPerDay && available.length; block += 1) {
        const unit = [...available].sort((left, right) => {
          const leftKey = `${left.code ?? ''}-${left.name}`;
          const rightKey = `${right.code ?? ''}-${right.name}`;
          const leftScore = daysBetween(date, left.examDate!) + (sessionCounts.get(leftKey) ?? 0) * 3;
          const rightScore = daysBetween(date, right.examDate!) + (sessionCounts.get(rightKey) ?? 0) * 3;
          return leftScore - rightScore || left.examDate!.localeCompare(right.examDate!);
        })[0];
        const unitKey = `${unit.code ?? ''}-${unit.name}`;
        sessions.push({ focus: studyFocuses[block % studyFocuses.length], unit });
        sessionCounts.set(unitKey, (sessionCounts.get(unitKey) ?? 0) + 1);
      }
    }

    plan.push({ date, sessions, exams });
    cursor.setDate(cursor.getDate() + 1);
  }

  return plan;
}

export default function ExamSchedulePlan({ units }: { units: ExamEntry[] }) {
  const [blocksPerDay, setBlocksPerDay] = useState(3);
  const [showFullPlan, setShowFullPlan] = useState(false);
  const upcomingExams = useMemo(() => {
    const today = toDateKey(new Date());
    return units.filter((unit) => unit.examDate && unit.examDate >= today).sort((left, right) => left.examDate!.localeCompare(right.examDate!) || (left.examTime ?? '').localeCompare(right.examTime ?? ''));
  }, [units]);
  const plan = useMemo(() => makePlan(units, blocksPerDay), [blocksPerDay, units]);
  const visiblePlan = showFullPlan ? plan : plan.slice(0, 5);

  return (
    <section className="exam-plan" aria-label="December exam dates and study plan">
      <header className="exam-plan-heading">
        <div><span className="card-kicker">DECEMBER 2026 · EXAM COUNTDOWN</span><h3>Exam schedule</h3></div>
        <span className="exam-plan-count">{upcomingExams.length} UPCOMING</span>
      </header>

      <details className="exam-timetable">
        <summary>Full exam timetable · {upcomingExams.length} papers</summary>
        <ol className="exam-timetable-list">
          {upcomingExams.map((exam) => (
            <li className="exam-timetable-item" key={`${exam.code}-${exam.examDate}`}>
              <div className="exam-timetable-date"><b>{dayFormatter.format(dateFromKey(exam.examDate!))}</b><span>{exam.examTime}</span></div>
              <div className="exam-timetable-course"><b>{exam.code} · {exam.name}</b><span>{exam.group}</span><span>{exam.venue} · {exam.lecturer}</span></div>
            </li>
          ))}
        </ol>
      </details>

      <div className="revision-plan-heading">
        <div><span className="card-kicker">A FLEXIBLE STARTING POINT</span><h3>Your daily revision plan</h3></div>
        <label className="revision-block-control">FOCUSED BLOCKS / DAY
          <select aria-label="Focused study blocks per day" onChange={(event) => setBlocksPerDay(Number(event.currentTarget.value))} value={blocksPerDay}>
            <option value={2}>2 blocks</option>
            <option value={3}>3 blocks</option>
            <option value={4}>4 blocks</option>
          </select>
        </label>
      </div>
      <p className="revision-plan-note">Each block is 45 minutes, with at least a 10-minute break. This is a starting pace, not a test of willpower—adjust it around your energy and other commitments.</p>

      {plan.length ? (
        <ol className="revision-day-list">
          {visiblePlan.map((day) => (
            <li className="revision-day" key={day.date}>
              <div className="revision-day-heading">
                <b>{longDateFormatter.format(dateFromKey(day.date))}</b>
                {day.exams.length > 0 && <span>EXAM{day.exams.length > 1 ? 'S' : ''} TODAY</span>}
              </div>
              {day.exams.map((exam) => <p className="revision-exam-today" key={exam.code}>{exam.code} · {exam.name} · {exam.examTime}</p>)}
              {day.sessions.length > 0 ? (
                <ol className="revision-session-list">
                  {day.sessions.map((session, index) => (
                    <li key={`${day.date}-${index}`}><span>BLOCK {index + 1} · {session.focus}</span><b>{session.unit.code} · {session.unit.name}</b></li>
                  ))}
                </ol>
              ) : !day.exams.length ? <p className="revision-exam-today">Your exam days are over. Rest and check any remaining exam-card details.</p> : null}
            </li>
          ))}
        </ol>
      ) : <p className="revision-plan-note">There are no upcoming exam dates in this list. Add or restore a scheduled unit to see a revision plan.</p>}

      {plan.length > 5 && (
        <Button className="revision-show-more" onClick={() => setShowFullPlan((current) => !current)} type="button" variant="subtle">
          {showFullPlan ? 'SHOW NEXT 5 DAYS' : `SHOW FULL PLAN · ${plan.length} DAYS`}
        </Button>
      )}
    </section>
  );
}

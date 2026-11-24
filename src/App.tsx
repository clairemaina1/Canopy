import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button, Checkbox, Progress, Textarea, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import BasketballPath from './features/BasketballPath';
import ChessTrainer from './features/ChessTrainer';
import CodeRoadmap from './features/CodeRoadmap';
import CycleTracker from './features/CycleTracker';
import FlightSchool from './features/FlightSchool';
import FoodLog from './features/FoodLog';
import GuitarStudio from './features/GuitarStudio';
import GymPlanner from './features/GymPlanner';
import Planner from './features/Planner';
import WritingStudio from './features/WritingStudio';

type Page = 'Overview' | 'My goals' | 'Planner' | 'Career' | 'Writing Studio' | 'Chess' | 'Guitar' | 'Code Lab' | 'Flight School' | 'Basketball' | 'Gym' | 'Food Log' | 'Wellbeing';
type TaskCategory = 'Career' | 'Creative' | 'Learning' | 'Personal';
type Task = { id: number; title: string; category: TaskCategory; done: boolean };

const navigation: Array<{ label: Page; icon: string }> = [
  { label: 'Overview', icon: '◈' },
  { label: 'My goals', icon: '◎' },
  { label: 'Planner', icon: '▦' },
  { label: 'Career', icon: '↗' },
  { label: 'Writing Studio', icon: '✎' },
  { label: 'Chess', icon: '♞' },
  { label: 'Guitar', icon: '♫' },
  { label: 'Code Lab', icon: '⌘' },
  { label: 'Flight School', icon: '✈' },
  { label: 'Basketball', icon: '◉' },
  { label: 'Gym', icon: '↗' },
  { label: 'Food Log', icon: '◒' },
  { label: 'Wellbeing', icon: '☼' },
];

const initialTasks: Task[] = [
  { id: 1, title: 'Review the portfolio case study', category: 'Career', done: true },
  { id: 2, title: 'Practice guitar for twenty minutes', category: 'Creative', done: false },
  { id: 3, title: 'Study one chess pattern', category: 'Learning', done: false },
];

const goals = [
  { title: 'Build stronger foundations', detail: 'CODING', activity: 'Code & create', target: 5, icon: '⌁' },
  { title: 'Make music part of the week', detail: 'GUITAR', activity: 'Guitar hour', target: 4, icon: '♪' },
  { title: 'Move with intention', detail: 'MOVEMENT', activity: 'Move & play', target: 5, icon: '↗' },
];

const careerProjects = [
  { id: 'billboardhub', title: 'BillboardHub', type: 'OUTDOOR AD INVENTORY', image: '/images/projects/billboardhub.jpg', summary: 'A map-led marketplace for roadside advertising spaces around Nairobi.', audience: 'Advertisers and billboard owners', next: 'Validate inventory, availability, pricing, and how an owner confirms a booking.', skills: 'Mapping UI · data modelling · search filters · booking workflows' },
  { id: 'atelier', title: 'Atelier Cards', type: 'CREATIVE CLIENT STUDIO', image: '/images/projects/atelier-cards.jpg', summary: 'A private client directory with portfolio-view context for a creative studio.', audience: 'Independent photographers and creative studios', next: 'Map a client lifecycle from enquiry to delivery; define what client data is truly necessary.', skills: 'CRUD · privacy · client records · exportable data' },
  { id: 'mood-music', title: 'Mood / Music', type: 'MOOD-LED DISCOVERY', image: '/images/projects/mood-music.jpg', summary: 'A visual way to choose a soundtrack based on the feeling or moment you want.', audience: 'Listeners looking for a feeling, not just a genre', next: 'Test the mood categories with real listeners and prototype one recommendation flow.', skills: 'Interaction design · content models · recommendation basics' },
  { id: 'opportunities', title: 'Opportunity Tracker', type: 'APPLICATION WORKSPACE', image: '/images/projects/opportunity-tracker.jpg', summary: 'A dashboard concept for tracking applications, deadlines, follow-ups, and outcomes.', audience: 'Students managing internships, scholarships, or early-career applications', next: 'Build a reliable deadline model, reminders, status history, and a useful empty state.', skills: 'Forms · date handling · filters · notifications · dashboard design' },
  { id: 'skytrack-live', title: 'SkyTrack Live', type: 'FLIGHT AWARENESS', image: '/images/projects/skytrack-live.jpg', summary: 'A flight-tracking map paired with a compact operational list.', audience: 'Aviation learners and operations teams', next: 'Document data provenance, update frequency, map accessibility, and what the display cannot guarantee.', skills: 'Maps · streaming concepts · API boundaries · data freshness' },
  { id: 'skytrack-allocation', title: 'SkyTrack Allocation', type: 'CREW WORKFLOW', image: '/images/projects/skytrack-allocation.jpg', summary: 'A crew-allocation screen for matching people to a planned flight and reviewing a dispatch decision.', audience: 'Dispatchers and crew planners', next: 'Write scheduling rules and conflict cases before implementing any automatic assignments.', skills: 'Workflow modelling · constraints · audit history · role-based access' },
];

function App() {
  const [activePage, setActivePage] = useState<Page>('Overview');
  const [visitedPages, setVisitedPages] = useState<Set<Page>>(() => new Set(['Overview']));
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [practiceCounts, setPracticeCounts] = useState<Record<string, number>>({});
  const completedTasks = tasks.filter((task) => task.done).length;
  const taskProgress = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const today = new Date();
  const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();

  function navigateTo(page: Page) {
    window.scrollTo(0, 0);
    setActivePage(page);
    setVisitedPages((current) => current.has(page) ? current : new Set(current).add(page));
  }

  function toggleTask(id: number) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    );
  }

  function addTask(title: string, category: TaskCategory) {
    setTasks((current) => [...current, { id: Date.now(), title, category, done: false }]);
  }

  function logPractice(title: string) {
    setPracticeCounts((current) => ({ ...current, [title]: (current[title] ?? 0) + 1 }));
    notifications.show({ title: 'SESSION LOGGED', message: `${title} added to your progress.` });
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <button className="brand" type="button" onClick={() => navigateTo('Overview')} aria-label="CANOPY home">
          <span className="brand-mark">C</span>
          <span>CANOPY</span>
        </button>

        <div className="workspace-label">MAINA'S SPACE</div>
        <nav className="navigation" aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              aria-label={item.label}
              aria-current={activePage === item.label ? 'page' : undefined}
              className={`nav-item${activePage === item.label ? ' active' : ''}`}
              key={item.label}
              onClick={() => navigateTo(item.label)}
              type="button"
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
              {activePage === item.label && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-avatar">M</div>
          <div>
            <div className="profile-name">MAINA</div>
            <div className="profile-caption">PERSONAL WORKSPACE</div>
          </div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="breadcrumb">MY WORKSPACE <span>/</span> {activePage.toUpperCase()}</div>
          <div className="topbar-right">
            <span className="date-label">{dateLabel}</span>
            <button className="avatar-small" type="button" aria-label="MAINA profile">M</button>
          </div>
        </header>

        {activePage === 'Overview' && (
          <OverviewPage
            tasks={tasks}
            taskProgress={taskProgress}
            completedTasks={completedTasks}
            selectedMood={selectedMood}
            setSelectedMood={setSelectedMood}
            toggleTask={toggleTask}
          />
        )}
        {activePage === 'My goals' && (
          <GoalsPage
            tasks={tasks}
            toggleTask={toggleTask}
            addTask={addTask}
            practiceCounts={practiceCounts}
            logPractice={logPractice}
          />
        )}
        {activePage === 'Career' && <CareerPage />}
        {visitedPages.has('Writing Studio') && <div hidden={activePage !== 'Writing Studio'}><WritingStudio /></div>}
        <div hidden={activePage !== 'Planner'}><Planner /></div>
        {visitedPages.has('Chess') && <div hidden={activePage !== 'Chess'}><ChessTrainer /></div>}
        {visitedPages.has('Guitar') && <div hidden={activePage !== 'Guitar'}><GuitarStudio /></div>}
        {visitedPages.has('Code Lab') && <div hidden={activePage !== 'Code Lab'}><CodeRoadmap /></div>}
        {visitedPages.has('Flight School') && <div hidden={activePage !== 'Flight School'}><FlightSchool /></div>}
        {visitedPages.has('Basketball') && <div hidden={activePage !== 'Basketball'}><BasketballPath /></div>}
        {visitedPages.has('Gym') && <div hidden={activePage !== 'Gym'}><GymPlanner isActive={activePage === 'Gym'} /></div>}
        {visitedPages.has('Food Log') && <div hidden={activePage !== 'Food Log'}><FoodLog /></div>}
        {activePage === 'Wellbeing' && (
          <WellbeingPage selectedMood={selectedMood} setSelectedMood={setSelectedMood} />
        )}
      </section>
    </main>
  );
}

function PageHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="page-heading">
      <div className="eyebrow"><span className="eyebrow-dot" /> {eyebrow}</div>
      <h1>{title}</h1>
      <p>{copy}</p>
    </div>
  );
}

function OverviewPage({
  tasks,
  taskProgress,
  completedTasks,
  selectedMood,
  setSelectedMood,
  toggleTask,
}: {
  tasks: Task[];
  taskProgress: number;
  completedTasks: number;
  selectedMood: string | null;
  setSelectedMood: (mood: string) => void;
  toggleTask: (id: number) => void;
}) {
  return (
    <div className="content">
      <div className="welcome-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR SPACE, IN FOCUS</div>
          <h1>A little more <span>you.</span></h1>
          <p className="welcome-copy">Good day, MAINA. Make room for what matters.</p>
        </div>
        <div className="week-card">
          <span>YOUR WEEK</span>
          <strong>{getWeekLabel()}</strong>
          <small>One step at a time <b>↗</b></small>
        </div>
      </div>

      <section className="focus-card">
        <div className="focus-copy">
          <span className="focus-tag">A NOTE TO YOURSELF</span>
          <h2>Grow quietly.<br />Move boldly.</h2>
          <p>A calm place for ambition, reflection, and play.</p>
        </div>
        <div className="focus-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit-core">✦</div>
          <span className="horizon horizon-one" />
          <span className="horizon horizon-two" />
        </div>
      </section>

      <div className="section-heading">
        <div><h2>Your day, gently organized</h2><p>A few things to keep your momentum going.</p></div>
      </div>

      <div className="dashboard-grid">
        <section className="surface-card">
          <div className="card-heading">
            <div><span className="card-kicker">TODAY’S MOMENTUM</span><h3>A few things to do</h3></div>
            <span className="count-pill">{completedTasks}/{tasks.length}</span>
          </div>
          <Progress className="task-progress" value={taskProgress} size="xs" />
          <div className="task-list">
            {tasks.slice(0, 4).map((task) => (
              <TaskRow key={task.id} task={task} toggleTask={toggleTask} />
            ))}
          </div>
        </section>

        <section className="surface-card checkin-card">
          <div className="card-heading">
            <div><span className="card-kicker">A MOMENT FOR YOU</span><h3>How are you feeling?</h3></div>
            <span className="checkin-spark">✳</span>
          </div>
          <p>Take a breath and check in with yourself. There’s no right answer.</p>
          <MoodOptions selectedMood={selectedMood} setSelectedMood={setSelectedMood} />
        </section>
      </div>
    </div>
  );
}

function TaskRow({ task, toggleTask }: { task: Task; toggleTask: (id: number) => void }) {
  return (
    <label className={`task-row${task.done ? ' task-done' : ''}`}>
      <Checkbox checked={task.done} onChange={() => toggleTask(task.id)} aria-label={task.title} />
      <span className="task-title">{task.title}</span>
      <span className={`task-category ${task.category.toLowerCase()}`}>{task.category}</span>
    </label>
  );
}

function GoalsPage({
  tasks,
  toggleTask,
  addTask,
  practiceCounts,
  logPractice,
}: {
  tasks: Task[];
  toggleTask: (id: number) => void;
  addTask: (title: string, category: TaskCategory) => void;
  practiceCounts: Record<string, number>;
  logPractice: (title: string) => void;
}) {
  const [taskTitle, setTaskTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Personal');

  function submitTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = taskTitle.trim();
    if (!title) return;
    addTask(title, category);
    setTaskTitle('');
    notifications.show({ title: 'TASK ADDED', message: 'Your next small step is on the list.' });
  }

  return (
    <div className="content">
      <PageHeading eyebrow="DIRECTION" title="Your goals" copy="The important things, with enough room to breathe." />
      <div className="goal-grid">
        {goals.map((goal, index) => (
          <section className="goal-card" key={goal.title}>
            <div className={`goal-symbol symbol-${index + 1}`} aria-hidden="true">{goal.icon}</div>
            <span className="card-kicker">ACTIVE GOAL {index + 1}</span>
            <h2>{goal.title}</h2>
            <p>{goal.detail} · {practiceCounts[goal.activity] ?? 0} OF {goal.target} SESSIONS</p>
            <Progress value={Math.min(100, ((practiceCounts[goal.activity] ?? 0) / goal.target) * 100)} className="task-progress" size="sm" />
            <button className="text-button goal-session-button" onClick={() => logPractice(goal.activity)} type="button">LOG A SESSION +</button>
          </section>
        ))}
      </div>
      <section className="surface-card wide-section">
        <div className="card-heading">
          <div><span className="card-kicker">YOUR NEXT STEPS</span><h3>Make a little progress</h3></div>
          <span className="count-pill">{tasks.filter((task) => task.done).length}/{tasks.length} DONE</span>
        </div>
        <form className="add-task-form" onSubmit={submitTask}>
          <TextInput
            aria-label="New task"
            onChange={(event) => setTaskTitle(event.currentTarget.value)}
            placeholder="Add a small, doable next step..."
            value={taskTitle}
          />
          <select aria-label="Task category" onChange={(event) => setCategory(event.currentTarget.value as TaskCategory)} value={category}>
            <option>Personal</option><option>Career</option><option>Creative</option><option>Learning</option>
          </select>
          <Button className="form-button" type="submit">ADD STEP</Button>
        </form>
        <div className="task-list">
          {tasks.map((task) => <TaskRow key={task.id} task={task} toggleTask={toggleTask} />)}
        </div>
      </section>
    </div>
  );
}

function CareerPage() {
  const [selectedId, setSelectedId] = useState(careerProjects[0].id);
  const selectedProject = careerProjects.find((project) => project.id === selectedId) ?? careerProjects[0];

  return (
    <div className="content career-page">
      <PageHeading eyebrow="YOUR PRODUCT STUDIO" title="From vibe code to product thinking" copy="The business ideas you have already been shaping—collected as prototypes, with a clear next step for each." />
      <div className="portfolio-layout">
        <div className="portfolio-grid" aria-label="Your product prototypes">
          {careerProjects.map((project) => (
            <button aria-pressed={selectedId === project.id} className={`portfolio-card${selectedId === project.id ? ' active' : ''}`} key={project.id} onClick={() => setSelectedId(project.id)} type="button">
              <img alt={`${project.title} prototype screenshot`} loading="lazy" src={project.image} />
              <span className="portfolio-card-copy"><small>{project.type}</small><b>{project.title}</b></span>
            </button>
          ))}
        </div>
        <section className="portfolio-detail">
          <span className="card-kicker">{selectedProject.type} · VIBE-CODED PROTOTYPE</span>
          <h2>{selectedProject.title}</h2>
          <p>{selectedProject.summary}</p>
          <dl>
            <div><dt>WHO IT SERVES</dt><dd>{selectedProject.audience}</dd></div>
            <div><dt>PRODUCT QUESTION</dt><dd>{selectedProject.next}</dd></div>
            <div><dt>SKILLS TO GROW</dt><dd>{selectedProject.skills}</dd></div>
          </dl>
          <p className="portfolio-note">A polished prototype is a strong start. The next level is validating the problem, making trade-offs explicit, and explaining the system behind the screen.</p>
        </section>
      </div>
    </div>
  );
}

function WellbeingPage({
  selectedMood,
  setSelectedMood,
}: {
  selectedMood: string | null;
  setSelectedMood: (mood: string) => void;
}) {
  return (
    <div className="content">
      <PageHeading eyebrow="A MOMENT FOR YOU" title="Come back to yourself" copy="Rest is part of progress, not a break from it." />
      <div className="wellbeing-grid">
        <section className="surface-card mood-panel">
          <span className="card-kicker">DAILY CHECK-IN</span>
          <h2>How does today feel?</h2>
          <MoodOptions selectedMood={selectedMood} setSelectedMood={setSelectedMood} />
          {selectedMood && <p className="mood-acknowledgement">Thank you for checking in. You chose <strong>{selectedMood.toUpperCase()}</strong>.</p>}
        </section>
        <section className="reflection-card">
          <span className="reflection-mark">✦</span>
          <span className="card-kicker">A QUIET REMINDER</span>
          <blockquote>“Let the day be enough. Let the next step be small.”</blockquote>
          <small>FOR MAINA, WHENEVER IT HELPS</small>
          <div className="reflection-image" aria-hidden="true" />
        </section>
      </div>
      <section className="journal-card">
        <div className="journal-heading">
          <div><span className="card-kicker">PRIVATE JOURNAL</span><h2>Let it out. Let it go.</h2></div>
          <span className="privacy-chip">ON THIS DEVICE ONLY · NOT SAVED</span>
        </div>
        <p>Write it out or record a voice note. Nothing is uploaded or kept after you release it.</p>
        <PrivateVent />
      </section>
      <CycleTracker />
      <div className="rest-grid">
        <RestPrompt icon="≈" title="Reset" copy="Two minutes of slow breathing" />
        <RestPrompt icon="♪" title="Create" copy="Pick up the guitar" />
        <RestPrompt icon="◌" title="Reflect" copy="Write one honest line" />
      </div>
    </div>
  );
}

function PrivateVent() {
  const [draft, setDraft] = useState('');
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const discardRecordingRef = useRef(false);

  useEffect(() => () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      discardRecordingRef.current = true;
      recorder.stop();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
  }, []);

  useEffect(() => {
    if (!recording) return undefined;
    const intervalId = window.setInterval(() => setRecordingSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(intervalId);
  }, [recording]);

  function clearAudio() {
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    audioUrlRef.current = null;
    setAudioUrl(null);
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      notifications.show({ title: 'VOICE NOTES UNAVAILABLE', message: 'This browser does not support private audio recording.' });
      return;
    }
    try {
      clearAudio();
      discardRecordingRef.current = false;
      setRecordingSeconds(0);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        recorder.ondataavailable = null;
        recorder.onstop = null;
        if (discardRecordingRef.current) {
          discardRecordingRef.current = false;
          return;
        }
        setRecording(false);
        const firstBlob = chunks.find((chunk): chunk is Blob => chunk instanceof Blob);
        const recordingBlob = new Blob(chunks, { type: recorder.mimeType || firstBlob?.type || 'audio/webm' });
        if (recordingBlob.size > 0) {
          const nextUrl = URL.createObjectURL(recordingBlob);
          audioUrlRef.current = nextUrl;
          setAudioUrl(nextUrl);
        }
      };
      recorder.start();
      setRecording(true);
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setRecording(false);
      notifications.show({
        title: 'MICROPHONE NOT READY',
        message: error instanceof Error ? error.message : 'Allow microphone access in your browser to record a note.',
      });
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  }

  function releaseAndErase() {
    if (recorderRef.current?.state === 'recording') {
      discardRecordingRef.current = true;
      recorderRef.current.stop();
    }
    setDraft('');
    clearAudio();
    setRecording(false);
    setRecordingSeconds(0);
    notifications.show({ title: 'RELEASED & ERASED', message: 'Your private vent was cleared from this page.' });
  }

  return (
    <div className="vent-panel">
      <Textarea
        aria-label="Private vent"
        autosize
        className="vent-input"
        minRows={4}
        maxRows={9}
        onChange={(event) => setDraft(event.currentTarget.value)}
        placeholder="Start wherever you are. You don't have to make it sound okay..."
        value={draft}
      />
      <div className="vent-actions">
        <div className="voice-controls">
          {!recording && !audioUrl && (
            <Button className="secondary-button" onClick={startRecording} type="button">◉ &nbsp; RECORD A VOICE NOTE</Button>
          )}
          {recording && (
            <Button className="recording-button" onClick={stopRecording} type="button">
              <span className="recording-dot" /> STOP RECORDING · {formatTime(recordingSeconds)}
            </Button>
          )}
          {audioUrl && (
            <>
              <audio aria-label="Your temporary voice note" controls src={audioUrl} />
              <Button className="secondary-button" onClick={clearAudio} type="button">DELETE VOICE NOTE</Button>
            </>
          )}
        </div>
        <Button className="release-button" disabled={!draft.trim() && !audioUrl && !recording} onClick={releaseAndErase} type="button">
          RELEASE & ERASE
        </Button>
      </div>
      <small className="privacy-note">Voice stays in temporary browser memory only. Releasing it erases it; leaving this page clears it too.</small>
    </div>
  );
}

function MoodOptions({
  selectedMood,
  setSelectedMood,
}: {
  selectedMood: string | null;
  setSelectedMood: (mood: string) => void;
}) {
  return (
    <div className="mood-options" role="group" aria-label="How are you feeling?">
      {[['☀', 'Great'], ['◡', 'Okay'], ['☁', 'Low']].map(([icon, mood]) => (
        <button
          aria-pressed={selectedMood === mood}
          className={`mood-option${selectedMood === mood ? ' selected' : ''}`}
          key={mood}
          onClick={() => {
            setSelectedMood(mood);
            notifications.show({
              title: 'CHECK-IN SAVED',
              message: `Thanks for checking in, MAINA. Today feels ${mood.toLowerCase()}.`,
            });
          }}
          type="button"
        >
          <span aria-hidden="true">{icon}</span><b>{mood.toUpperCase()}</b>
        </button>
      ))}
    </div>
  );
}

function RestPrompt({ icon, title, copy }: { icon: string; title: string; copy: string }) {
  const [started, setStarted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(120);
  const isBreathing = title === 'Reset';
  const prompt = title === 'Create'
    ? 'Choose a favorite song and play it through without stopping.'
    : 'What can you release today, and what would you like to carry forward?';

  useEffect(() => {
    if (!isBreathing || !started) return undefined;
    if (secondsRemaining <= 0) {
      setStarted(false);
      notifications.show({ title: 'TWO-MINUTE RESET COMPLETE', message: 'Take this calmer pace with you, MAINA.' });
      return undefined;
    }
    const timerId = window.setTimeout(() => setSecondsRemaining((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timerId);
  }, [isBreathing, secondsRemaining, started]);

  function togglePrompt() {
    if (isBreathing && secondsRemaining === 0) setSecondsRemaining(120);
    setStarted((value) => !value);
  }

  const breathingPhase = secondsRemaining % 10;
  const breathingIn = breathingPhase === 0 || breathingPhase >= 7;
  const activeCopy = isBreathing
    ? `${breathingIn ? 'Breathe in slowly' : 'Breathe out slowly'} · ${formatTime(secondsRemaining)}`
    : prompt;

  return (
    <button aria-pressed={started} className={`rest-card${started ? ' rest-card-active' : ''}`} onClick={togglePrompt} type="button">
      <span>{icon}</span>
      <b>{isBreathing && started ? 'BREATHE WITH ME' : started ? `${title.toUpperCase()} PROMPT` : title.toUpperCase()}</b>
      <small>{started ? activeCopy : copy}</small>
    </button>
  );
}

function getWeekLabel() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `WEEK ${weekNumber}`;
}

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

export default App;

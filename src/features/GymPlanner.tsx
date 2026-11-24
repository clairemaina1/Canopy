import { useEffect, useRef, useState } from 'react';
import { Progress } from '@mantine/core';

type Exercise = {
  id: string;
  name: string;
  area: string;
  sets: string;
  cue: string;
  easier: string;
  animation: string;
};

const routine: Array<{ day: string; focus: string; note: string; exercises: Exercise[] }> = [
  {
    day: 'MONDAY',
    focus: 'Upper body · back & arms',
    note: 'A controlled upper-body day with simple bodyweight and light household-weight options.',
    exercises: [
      { id: 'wall-pushup', name: 'Wall push-up', area: 'CHEST · ARMS', sets: '2 × 8', cue: 'Keep your body long, hands around chest height, and bend your elbows only as far as feels comfortable.', easier: 'Stand closer to the wall to make each rep lighter.', animation: 'wall-pushup' },
      { id: 'backpack-row', name: 'Light backpack row', area: 'BACK · BICEPS', sets: '2 × 8 each side', cue: 'Use a light, securely closed backpack. Hinge only a little and pull toward your hip without twisting.', easier: 'Practise the pull with an empty bag or no load.', animation: 'backpack-row' },
      { id: 'prone-w-raise', name: 'Prone W raise', area: 'UPPER BACK', sets: '2 × 6', cue: 'Lie face down comfortably, draw elbows toward a W, and lift only a small amount without straining your neck.', easier: 'Keep your forehead supported and slide your arms instead of lifting.', animation: 'prone-w-raise' },
      { id: 'bottle-curl', name: 'Water-bottle curl', area: 'BICEPS', sets: '2 × 8', cue: 'Use a small, sealed bottle. Keep your elbow by your side and lower it slowly.', easier: 'Use a lighter bottle or practise without a weight.', animation: 'bottle-curl' },
    ],
  },
  {
    day: 'WEDNESDAY',
    focus: 'Cardio day · easy pace + core',
    note: 'A low-impact cardio day. Use the pace that lets you speak comfortably; a short session still counts.',
    exercises: [
      { id: 'step-jack', name: 'Low-impact step jacks', area: 'CARDIO', sets: '3 × 30 sec', cue: 'Step one foot out at a time while your arms move comfortably; keep the pace easy.', easier: 'Make the steps smaller and keep your arms low.', animation: 'step-jack' },
      { id: 'side-step', name: 'Side steps', area: 'CARDIO', sets: '3 × 30 sec', cue: 'Step side to side in a clear space, staying tall and moving at a steady pace.', easier: 'Hold a stable support and take smaller steps.', animation: 'side-step' },
      { id: 'dead-bug', name: 'Dead bug', area: 'CORE', sets: '2 × 5 each side', cue: 'Lie comfortably, move one arm and the opposite leg slowly, and keep the range small enough to stay steady.', easier: 'Move one heel at a time while keeping both arms still.', animation: 'dead-bug' },
      { id: 'side-plank', name: 'Knee-down side plank', area: 'CORE', sets: '2 × 10–20 sec each side', cue: 'Support yourself on one forearm and bent knees. Lift only if you can breathe normally and stay comfortable.', easier: 'Keep your hips down and practise a gentle side-body brace.', animation: 'side-plank' },
    ],
  },
  {
    day: 'FRIDAY',
    focus: 'Leg day · legs & core',
    note: 'Friday is always leg day in this plan. Use a sturdy support and comfortable range; stop if anything hurts.',
    exercises: [
      { id: 'chair-squat', name: 'Chair squat', area: 'LEGS', sets: '2 × 8', cue: 'Sit hips back toward a stable chair, tap it lightly, then stand with control.', easier: 'Use a higher seat and hold a stable support.', animation: 'chair-squat' },
      { id: 'supported-split-squat', name: 'Supported split squat', area: 'LEGS', sets: '2 × 6 each side', cue: 'Hold a stable support, take a short split stance, and bend both knees only a little.', easier: 'Use a very shallow bend or practise the stance without lowering.', animation: 'supported-split-squat' },
      { id: 'glute-bridge', name: 'Glute bridge', area: 'GLUTES · LEGS', sets: '2 × 8', cue: 'Lie on your back with knees bent and lift your hips gently; stop before your lower back arches.', easier: 'Make the lift small or practise tightening your glutes without lifting.', animation: 'glute-bridge' },
      { id: 'calf-raise', name: 'Supported calf raise', area: 'LOWER LEGS', sets: '2 × 10', cue: 'Hold a stable support, rise and lower slowly, and keep the range comfortable.', easier: 'Stay seated and lift your heels gently.', animation: 'calf-raise' },
      { id: 'standing-hip-hinge', name: 'Standing hip hinge', area: 'HAMSTRINGS · GLUTES', sets: '2 × 8', cue: 'Send your hips back with soft knees and a neutral, comfortable spine. Practise unloaded.', easier: 'Use a wall behind you as a target and keep the movement small.', animation: 'standing-hip-hinge' },
      { id: 'bird-dog', name: 'Bird dog', area: 'CORE · BACK', sets: '2 × 5 each side', cue: 'From hands and knees, reach opposite hand and foot without twisting; pause, then switch.', easier: 'Slide one foot back along the floor without lifting it.', animation: 'bird-dog' },
    ],
  },
];

export default function GymPlanner({ isActive }: { isActive: boolean }) {
  const [dayIndex, setDayIndex] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const currentDay = routine[dayIndex];

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    mediaQuery.addEventListener('change', updateMotionPreference);
    return () => mediaQuery.removeEventListener('change', updateMotionPreference);
  }, []);
  const completedCount = currentDay.exercises.filter((exercise) => completed.includes(`${currentDay.day}:${exercise.id}`)).length;

  function toggleExercise(id: string) {
    const key = `${currentDay.day}:${id}`;
    setCompleted((items) => items.includes(key) ? items.filter((item) => item !== key) : [...items, key]);
  }

  return (
    <div className="content learning-page gym-page">
      <header className="page-heading">
        <div className="eyebrow"><span className="eyebrow-dot" /> YOUR SPLIT · YOUR PACE</div>
        <h1>Train the way you actually train.</h1>
        <p>Upper body, back, arms, legs, core, and one cardio day. Friday stays leg day. These are beginner options—not a medical or individualized program.</p>
      </header>

      <div className="gym-week-strip" aria-label="Weekly training split">
        {routine.map((day, index) => (
          <button aria-pressed={dayIndex === index} className={`gym-day-tab${dayIndex === index ? ' active' : ''}${day.day === 'FRIDAY' ? ' leg-day' : ''}`} key={day.day} onClick={() => setDayIndex(index)} type="button">
            <span>{day.day}{day.day === 'FRIDAY' ? ' · LEG DAY' : ''}</span><b>{day.focus}</b>
          </button>
        ))}
      </div>

      <section className="surface-card gym-day-overview">
        <div><span className="card-kicker">{currentDay.day === 'FRIDAY' ? 'FRIDAY · LEG DAY' : currentDay.day}</span><h2>{currentDay.focus}</h2><p>{currentDay.note}</p></div>
        <div className="routine-progress"><strong>{completedCount}/{currentDay.exercises.length}</strong><span>EXERCISES CHECKED</span><Progress className="task-progress" value={(completedCount / currentDay.exercises.length) * 100} size="xs" /></div>
      </section>

      <div className="exercise-grid">
        {currentDay.exercises.map((exercise) => {
          const checked = completed.includes(`${currentDay.day}:${exercise.id}`);
          return (
            <article className={`exercise-card${checked ? ' complete' : ''}`} key={exercise.id}>
              <ExercisePreview exercise={exercise} isActive={isActive} prefersReducedMotion={prefersReducedMotion} />
              <div className="exercise-copy">
                <span className="card-kicker">{exercise.area} · {exercise.sets.toUpperCase()}</span>
                <h2>{exercise.name}</h2>
                <p>{exercise.cue}</p>
                <small className="exercise-easier"><b>EASIER OPTION</b> · {exercise.easier}</small>
                <button aria-pressed={checked} className="exercise-check" onClick={() => toggleExercise(exercise.id)} type="button">{checked ? '✓ DONE FOR TODAY' : 'MARK COMPLETE'}</button>
              </div>
            </article>
          );
        })}
      </div>

      <section className="practice-safety gym-safety">
        <b>YOUR BODY SETS THE PACE</b>
        <p>The guides show one position at a time; tap through them at your own pace. They are movement diagrams, not form coaching. Rest between sets and stop if something hurts, feels unusual, or makes you dizzy. If you have an injury or health condition, get individual guidance first.</p>
      </section>
    </div>
  );
}

function ExercisePreview({ exercise, isActive, prefersReducedMotion }: { exercise: Exercise; isActive: boolean; prefersReducedMotion: boolean }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const poses = exercisePoses[exercise.animation] ?? ['stand', 'squat'];
  const pose = poses[phase];
  const autoPlaying = isActive && isVisible && isPlaying && !prefersReducedMotion;

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview) return undefined;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.3 });
    observer.observe(preview);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!autoPlaying) return undefined;
    const intervalId = window.setInterval(() => setPhase((current) => current === 0 ? 1 : 0), 2200);
    return () => window.clearInterval(intervalId);
  }, [autoPlaying]);

  function stepPhase() {
    if (autoPlaying) setIsPlaying(false);
    setPhase((current) => current === 0 ? 1 : 0);
  }

  return (
    <div ref={previewRef} className={`exercise-preview${autoPlaying ? ' is-playing' : ''}`} data-exercise={exercise.id} data-phase={phase === 0 ? 'start' : 'movement'}>
      <div aria-hidden="true" className="exercise-guide-meta">
        <span className="exercise-guide-badge"><i />{autoPlaying ? 'AUTO DEMO' : 'MOVEMENT GUIDE'}</span>
        <span className="exercise-guide-count">0{phase + 1}<span>/ 02</span></span>
      </div>
      <svg aria-label={`${exercise.name}: ${phase === 0 ? 'start position' : 'controlled movement position'}`} className="exercise-guide-svg" role="img" viewBox="36 10 208 126">
        <circle className="exercise-guide-orbit" cx="140" cy="82" r="54" />
        <path className="exercise-guide-floor" d="M38 128H242" />
        {phase === 1 && <path className="exercise-motion-path" d={exerciseMotionPaths[exercise.id]} markerEnd={`url(#guide-arrow-${exercise.id})`} />}
        <defs>
          <marker id={`guide-arrow-${exercise.id}`} markerHeight="8" markerUnits="strokeWidth" markerWidth="8" orient="auto" refX="7" refY="4" viewBox="0 0 8 8">
            <path className="exercise-motion-arrowhead" d="M1 1L7 4L1 7" />
          </marker>
        </defs>
        <PoseFigure key={pose} pose={pose} x={140} />
      </svg>
      <div className="exercise-guide-controls">
        <div aria-hidden="true" className="exercise-guide-progress"><span /></div>
        <div className="exercise-guide-status"><span>STEP {phase + 1} OF 2</span><span>{prefersReducedMotion ? 'MANUAL GUIDE' : autoPlaying ? 'LOOPING DEMO' : 'PAUSED'}</span></div>
        <div className="exercise-guide-actions">
          <button aria-label={`Show ${phase === 0 ? 'movement' : 'start'} position for ${exercise.name}`} className="exercise-guide-step" onClick={stepPhase} type="button">
            {phase === 0 ? 'SHOW MOVEMENT' : 'BACK TO START'}
          </button>
          <button aria-label={prefersReducedMotion ? 'Automatic movement is disabled by your reduced motion setting' : `${autoPlaying ? 'Pause' : 'Play'} movement demo for ${exercise.name}`} disabled={prefersReducedMotion} onClick={() => setIsPlaying((current) => !current)} type="button">
            {prefersReducedMotion ? 'MOTION OFF' : autoPlaying ? 'PAUSE' : 'PLAY'}
          </button>
        </div>
      </div>
    </div>
  );
}

type PoseName = 'stand' | 'squat' | 'wall-pushup' | 'wall-press' | 'hinge' | 'row' | 'prone' | 'prone-w'
  | 'curl-down' | 'curl-up' | 'step-in' | 'step-out' | 'deadbug' | 'deadbug-reach' | 'side-plank-low'
  | 'side-plank-high' | 'split' | 'split-lower' | 'bridge-low' | 'bridge-high' | 'calf-flat' | 'calf-up'
  | 'all-fours' | 'bird-dog';

const exercisePoses: Record<string, [PoseName, PoseName]> = {
  'wall-pushup': ['wall-pushup', 'wall-press'],
  'backpack-row': ['hinge', 'row'],
  'prone-w-raise': ['prone', 'prone-w'],
  'bottle-curl': ['curl-down', 'curl-up'],
  'step-jack': ['step-in', 'step-out'],
  'side-step': ['step-in', 'step-out'],
  'dead-bug': ['deadbug', 'deadbug-reach'],
  'side-plank': ['side-plank-low', 'side-plank-high'],
  'chair-squat': ['stand', 'squat'],
  'supported-split-squat': ['split', 'split-lower'],
  'glute-bridge': ['bridge-low', 'bridge-high'],
  'calf-raise': ['calf-flat', 'calf-up'],
  'standing-hip-hinge': ['stand', 'hinge'],
  'bird-dog': ['all-fours', 'bird-dog'],
};

const exerciseMotionPaths: Record<string, string> = {
  'wall-pushup': 'M177 69C188 64 198 64 209 68',
  'backpack-row': 'M184 76C173 68 164 65 153 64',
  'prone-w-raise': 'M119 78C108 70 107 60 114 51',
  'bottle-curl': 'M149 94C157 84 158 73 152 64',
  'step-jack': 'M161 85Q179 76 196 57',
  'side-step': 'M163 97C177 94 187 95 199 98',
  'dead-bug': 'M168 92C181 83 192 78 204 75',
  'side-plank': 'M176 88C188 77 195 68 198 58',
  'chair-squat': 'M181 64C188 75 187 86 180 96',
  'supported-split-squat': 'M178 67C187 79 186 89 181 99',
  'glute-bridge': 'M169 103Q186 85 201 95',
  'calf-raise': 'M164 82C168 73 167 64 163 55',
  'standing-hip-hinge': 'M177 67Q193 68 204 79',
  'bird-dog': 'M164 64C181 59 196 53 208 50',
};

const poseArt: Record<PoseName, { head: [number, number]; torso: string; arms: [string, string]; legs: [string, string] }> = {
  stand: { head: [0, -82], torso: 'M-10 -70 Q0 -75 10 -70 L9 -37 Q0 -31 -9 -37Z', arms: ['M-8 -64 Q-17 -51 -15 -34', 'M8 -64 Q17 -51 15 -34'], legs: ['M-5 -36 Q-8 -18 -10 0', 'M5 -36 Q8 -18 10 0'] },
  squat: { head: [0, -69], torso: 'M-10 -58 Q0 -63 10 -58 L12 -38 Q0 -31 -12 -38Z', arms: ['M-8 -54 Q2 -48 14 -47', 'M8 -54 Q18 -48 27 -47'], legs: ['M-8 -37 Q-15 -28 -15 -17 L-3 -10 L-3 0', 'M8 -37 Q17 -29 14 -18 L5 -10 L8 0'] },
  'wall-pushup': { head: [-29, -51], torso: 'M-22 -49 Q-5 -54 14 -43 L12 -30 Q-5 -37 -24 -34Z', arms: ['M-13 -47 Q-2 -40 12 -42', 'M-8 -45 Q0 -36 14 -36'], legs: ['M8 -32 Q22 -29 37 -28', 'M8 -35 Q25 -37 39 -36'] },
  'wall-press': { head: [-29, -51], torso: 'M-22 -49 Q-5 -54 14 -43 L12 -30 Q-5 -37 -24 -34Z', arms: ['M-13 -47 Q-1 -48 12 -46', 'M-9 -44 Q0 -43 14 -42'], legs: ['M8 -32 Q22 -29 37 -28', 'M8 -35 Q25 -37 39 -36'] },
  hinge: { head: [14, -65], torso: 'M-8 -57 Q3 -66 15 -63 L27 -42 Q16 -34 5 -34 L-2 -47Z', arms: ['M0 -52 Q12 -44 21 -34', 'M9 -51 Q21 -44 30 -35'], legs: ['M5 -35 Q2 -18 -3 0', 'M8 -35 Q14 -17 18 0'] },
  row: { head: [14, -65], torso: 'M-8 -57 Q3 -66 15 -63 L27 -42 Q16 -34 5 -34 L-2 -47Z', arms: ['M0 -52 Q-1 -40 10 -38', 'M9 -51 Q5 -40 16 -38'], legs: ['M5 -35 Q2 -18 -3 0', 'M8 -35 Q14 -17 18 0'] },
  prone: { head: [-34, -17], torso: 'M-25 -22 Q0 -31 27 -20 L25 -7 Q0 -14 -24 -8Z', arms: ['M-12 -21 Q-24 -13 -28 -4', 'M-4 -21 Q-15 -11 -19 -3'], legs: ['M18 -12 Q30 -10 43 -7', 'M20 -10 Q34 -8 48 -5'] },
  'prone-w': { head: [-34, -17], torso: 'M-25 -22 Q0 -31 27 -20 L25 -7 Q0 -14 -24 -8Z', arms: ['M-12 -21 Q-25 -34 -35 -26', 'M-4 -21 Q-9 -36 1 -42'], legs: ['M18 -12 Q30 -10 43 -7', 'M20 -10 Q34 -8 48 -5'] },
  'curl-down': { head: [0, -82], torso: 'M-10 -70 Q0 -75 10 -70 L9 -37 Q0 -31 -9 -37Z', arms: ['M-8 -64 Q-16 -51 -13 -35', 'M8 -64 Q15 -51 13 -35'], legs: ['M-5 -36 Q-8 -18 -10 0', 'M5 -36 Q8 -18 10 0'] },
  'curl-up': { head: [0, -82], torso: 'M-10 -70 Q0 -75 10 -70 L9 -37 Q0 -31 -9 -37Z', arms: ['M-8 -64 Q-15 -51 -10 -44', 'M8 -64 Q15 -51 10 -44'], legs: ['M-5 -36 Q-8 -18 -10 0', 'M5 -36 Q8 -18 10 0'] },
  'step-in': { head: [0, -82], torso: 'M-10 -70 Q0 -75 10 -70 L9 -37 Q0 -31 -9 -37Z', arms: ['M-8 -64 Q-15 -51 -14 -35', 'M8 -64 Q15 -51 14 -35'], legs: ['M-5 -36 Q-8 -18 -8 0', 'M5 -36 Q8 -18 8 0'] },
  'step-out': { head: [0, -82], torso: 'M-10 -70 Q0 -75 10 -70 L9 -37 Q0 -31 -9 -37Z', arms: ['M-8 -64 Q-15 -76 -21 -86', 'M8 -64 Q15 -76 21 -86'], legs: ['M-5 -36 Q-15 -18 -24 0', 'M5 -36 Q15 -18 24 0'] },
  deadbug: { head: [-37, -17], torso: 'M-27 -22 Q0 -31 25 -20 L23 -7 Q0 -14 -26 -8Z', arms: ['M-11 -22 Q-16 -37 -19 -48', 'M-4 -22 Q-7 -38 -8 -49'], legs: ['M13 -12 Q23 -23 27 -36', 'M18 -11 Q30 -22 38 -34'] },
  'deadbug-reach': { head: [-37, -17], torso: 'M-27 -22 Q0 -31 25 -20 L23 -7 Q0 -14 -26 -8Z', arms: ['M-11 -22 Q-24 -35 -32 -43', 'M-4 -22 Q2 -37 4 -48'], legs: ['M13 -12 Q19 -23 15 -37', 'M18 -11 Q31 -21 48 -22'] },
  'side-plank-low': { head: [-34, -44], torso: 'M-24 -42 Q0 -50 24 -41 L22 -27 Q0 -34 -23 -28Z', arms: ['M-11 -41 Q-22 -37 -30 -27', 'M-4 -41 Q8 -45 15 -50'], legs: ['M14 -30 Q24 -19 20 -8 L7 -6 L2 0', 'M19 -29 Q33 -21 27 -10 L17 -7 L12 0'] },
  'side-plank-high': { head: [-34, -58], torso: 'M-24 -56 Q0 -64 24 -55 L22 -41 Q0 -48 -23 -42Z', arms: ['M-11 -55 Q-22 -49 -30 -38', 'M-4 -55 Q8 -59 15 -64'], legs: ['M14 -44 Q25 -29 32 -14 L45 0', 'M19 -43 Q33 -29 40 -14 L53 0'] },
  split: { head: [0, -82], torso: 'M-10 -70 Q0 -75 10 -70 L9 -37 Q0 -31 -9 -37Z', arms: ['M-8 -64 Q-16 -51 -14 -34', 'M8 -64 Q16 -51 14 -34'], legs: ['M-5 -36 Q-15 -20 -24 0', 'M5 -36 Q15 -22 27 -4'] },
  'split-lower': { head: [0, -69], torso: 'M-10 -58 Q0 -63 10 -58 L10 -37 Q0 -31 -10 -37Z', arms: ['M-8 -54 Q-16 -45 -14 -30', 'M8 -54 Q16 -45 14 -30'], legs: ['M-7 -36 Q-17 -24 -23 -12 L-12 -6 L-8 0', 'M7 -36 Q14 -22 26 -18 L31 -9 L35 0'] },
  'bridge-low': { head: [-38, -18], torso: 'M-28 -23 Q0 -30 20 -22 L22 -10 Q0 -14 -27 -9Z', arms: ['M-10 -22 Q-12 -12 -8 0', 'M-3 -22 Q-1 -12 2 0'], legs: ['M14 -13 Q28 -18 34 -30 L45 -31', 'M18 -12 Q31 -19 38 -30 L50 -31'] },
  'bridge-high': { head: [-38, -18], torso: 'M-28 -23 Q-5 -42 20 -22 L22 -10 Q0 -14 -27 -9Z', arms: ['M-10 -22 Q-12 -12 -8 0', 'M-3 -22 Q-1 -12 2 0'], legs: ['M14 -13 Q28 -18 34 -30 L45 -31', 'M18 -12 Q31 -19 38 -30 L50 -31'] },
  'calf-flat': { head: [0, -82], torso: 'M-10 -70 Q0 -75 10 -70 L9 -37 Q0 -31 -9 -37Z', arms: ['M-8 -64 Q-16 -51 -15 -34', 'M8 -64 Q16 -51 15 -34'], legs: ['M-5 -36 Q-8 -18 -10 0', 'M5 -36 Q8 -18 10 0'] },
  'calf-up': { head: [0, -82], torso: 'M-10 -70 Q0 -75 10 -70 L9 -37 Q0 -31 -9 -37Z', arms: ['M-8 -64 Q-16 -51 -15 -34', 'M8 -64 Q16 -51 15 -34'], legs: ['M-5 -36 Q-8 -18 -10 -7', 'M5 -36 Q8 -18 10 -7'] },
  'all-fours': { head: [-24, -48], torso: 'M-16 -46 Q0 -52 24 -42 L22 -30 Q0 -35 -17 -31Z', arms: ['M-9 -44 Q-17 -31 -19 -18', 'M-1 -43 Q-5 -30 -4 -17'], legs: ['M16 -33 Q25 -24 29 -15 L28 0', 'M20 -32 Q33 -24 38 -15 L39 0'] },
  'bird-dog': { head: [-24, -48], torso: 'M-16 -46 Q0 -52 24 -42 L22 -30 Q0 -35 -17 -31Z', arms: ['M-9 -44 Q-20 -50 -34 -55', 'M-1 -43 Q-5 -30 -4 -17'], legs: ['M16 -33 Q25 -24 29 -15 L28 0', 'M20 -32 Q32 -39 44 -49'] },
};

function PoseFigure({ pose, x }: { pose: PoseName; x: number }) {
  const art = poseArt[pose];
  return (
    <g className="exercise-figure" transform={`translate(${x} 126)`}>
      <g className="exercise-figure-pose" data-pose={pose}>
        {pose === 'wall-pushup' || pose === 'wall-press' ? <path className="exercise-prop" d="M20 -85V-18H32" /> : null}
        {pose === 'squat' ? <path className="exercise-prop" d="M19 -36V-2M19 -36H42V-2" /> : null}
        {pose === 'row' ? <rect className="exercise-prop" height="13" rx="3" width="17" x="23" y="-35" /> : null}
        {pose === 'curl-up' || pose === 'curl-down' ? <rect className="exercise-prop bottle" height="11" rx="4" width="6" x="7" y={pose === 'curl-up' ? '-53' : '-34'} /> : null}
        <path className="exercise-limb exercise-legs" d={art.legs[0]} />
        <path className="exercise-limb exercise-legs" d={art.legs[1]} />
        <path className="exercise-limb exercise-arms" d={art.arms[0]} />
        <path className="exercise-limb exercise-arms" d={art.arms[1]} />
        <path className="exercise-torso" d={art.torso} />
        <circle className="exercise-head" cx={art.head[0]} cy={art.head[1]} r="8" />
      </g>
    </g>
  );
}

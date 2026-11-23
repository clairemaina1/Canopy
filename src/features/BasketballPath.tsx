import { useState } from 'react';
import { Button, Progress } from '@mantine/core';

type DrillVisual = 'dribble' | 'pass' | 'height-change' | 'jump-stop' | 'layup' | 'pivot' | 'bounce-pass' | 'shot' | 'catch-shot' | 'crossover' | 'defense' | 'two-on-one' | 'film';
type Drill = { name: string; visual: DrillVisual; cue: string };
type SkillLevel = { title: string; tag: string; cue: string; drills: Drill[] };

const skillLevels: SkillLevel[] = [
  {
    title: 'Find your feel', tag: 'LEVEL 1 · START HERE', cue: 'Stay relaxed. Control comes before speed.',
    drills: [
      { name: 'Stationary right-hand dribbles · 3 × 20', visual: 'dribble', cue: 'Use finger pads, keep the bounce near your right hip, and look up between reps.' },
      { name: 'Stationary left-hand dribbles · 3 × 20', visual: 'dribble', cue: 'Mirror the same small, controlled bounce with your left hand.' },
      { name: 'Chest pass to a wall or partner · 3 × 10', visual: 'pass', cue: 'Step toward a safe target and push the ball from chest height.' },
    ],
  },
  {
    title: 'Move with the ball', tag: 'LEVEL 2 · CONTROL', cue: 'Keep your eyes up for a few dribbles at a time.',
    drills: [
      { name: 'Walking dribble, right hand · 4 lengths', visual: 'dribble', cue: 'Walk at an easy pace and bounce beside—not far in front of—you.' },
      { name: 'Walking dribble, left hand · 4 lengths', visual: 'dribble', cue: 'Repeat on your left, using a clear lane and a comfortable speed.' },
      { name: 'Low-to-high dribble changes · 3 × 8', visual: 'height-change', cue: 'Practise a low bounce, then a slightly higher one without losing control.' },
    ],
  },
  {
    title: 'Footwork & finishing', tag: 'LEVEL 3 · BALANCE', cue: 'Learn the rhythm slowly before adding speed.',
    drills: [
      { name: 'Jump-stop into a balanced stance · 3 × 6', visual: 'jump-stop', cue: 'Take two easy steps, land softly on both feet, and pause without travelling.' },
      { name: 'Close-range right-side layup steps · 3 × 5', visual: 'layup', cue: 'Walk through the two-step rhythm on the right before adding a ball or jump.' },
      { name: 'Close-range left-side layup steps · 3 × 5', visual: 'layup', cue: 'Mirror the steps on the left. Ask a coach to check the footwork.' },
    ],
  },
  {
    title: 'Pass, pivot, protect', tag: 'LEVEL 4 · TEAM PLAY', cue: 'Pivot without travelling; pass to a safe target.',
    drills: [
      { name: 'Right- and left-foot pivots · 3 × 8', visual: 'pivot', cue: 'Keep one foot planted, turn gently around it, and stay balanced.' },
      { name: 'Chest-pass target practice · 3 × 10', visual: 'pass', cue: 'Aim for a partner’s chest or a safe wall target; step into the pass.' },
      { name: 'Bounce-pass target practice · 3 × 10', visual: 'bounce-pass', cue: 'Aim the bounce about two-thirds of the way to a partner.' },
    ],
  },
  {
    title: 'Build your shot', tag: 'LEVEL 5 · CONSISTENCY', cue: 'Start close and use a comfortable, repeatable form.',
    drills: [
      { name: 'Close-range form shots · 5 × 5', visual: 'shot', cue: 'Use a close, comfortable spot and focus on a steady finish—not distance.' },
      { name: 'Catch, set, and shoot at close range · 3 × 5', visual: 'catch-shot', cue: 'Catch with balance, set your feet, then shoot at an easy pace.' },
      { name: 'Record makes and attempts', visual: 'film', cue: 'Write down makes and attempts without rushing or judging the result.' },
    ],
  },
  {
    title: 'Read the defender', tag: 'LEVEL 6 · DECISIONS', cue: 'Change pace only when you can keep control.',
    drills: [
      { name: 'Stationary crossover, both directions · 3 × 8', visual: 'crossover', cue: 'Move the ball across your body at knee height and stay in control.' },
      { name: 'Crossover into a controlled two-step finish · 3 × 5', visual: 'layup', cue: 'Practise the change of direction slowly, then take balanced steps to the hoop.' },
      { name: 'Mirror a partner’s side steps · 4 × 20 sec', visual: 'defense', cue: 'Stay in a comfortable stance and mirror gently; no contact or max-speed cuts.' },
    ],
  },
  {
    title: 'Play the whole floor', tag: 'LEVEL 7 · ADVANCED', cue: 'Use these in coached, game-like practice—not as a promise of pro skill.',
    drills: [
      { name: 'Read-and-react 2-on-1 with a coach or partner', visual: 'two-on-one', cue: 'Choose pass or drive based on space in a supervised, low-speed drill.' },
      { name: 'Weak-hand finish after a controlled change of direction', visual: 'layup', cue: 'Work close to the basket and keep the movement smooth and balanced.' },
      { name: 'Review one possession and identify one decision', visual: 'film', cue: 'Use a recording only with everyone’s permission; note one choice to practise.' },
    ],
  },
];

export default function BasketballPath() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [completedDrills, setCompletedDrills] = useState<string[]>([]);
  const [trickCount, setTrickCount] = useState(0);
  const current = skillLevels[levelIndex];
  const completedInLevel = current.drills.filter((drill) => completedDrills.includes(`${levelIndex}:${drill.name}`)).length;
  let unlockedThrough = 0;
  for (let index = 0; index < skillLevels.length - 1; index += 1) {
    if (!skillLevels[index].drills.every((drill) => completedDrills.includes(`${index}:${drill.name}`))) break;
    unlockedThrough = index + 1;
  }

  function toggleDrill(drill: Drill) {
    const key = `${levelIndex}:${drill.name}`;
    setCompletedDrills((items) => items.includes(key) ? items.filter((item) => item !== key) : [...items, key]);
  }

  return (
    <div className="content learning-page basketball-page">
      <header className="page-heading">
        <div className="eyebrow"><span className="eyebrow-dot" /> START SIMPLE · BUILD THE BASICS</div>
        <h1>Find your game.</h1>
        <p>Every practice has a visual, one simple cue, and a way to make it easier. Move up when the basics feel steady.</p>
      </header>

      <section className="court-hero">
        <span className="card-kicker">PRACTICE, NOT PRESSURE</span>
        <h2>Strong fundamentals<br />make room for creativity.</h2>
      </section>

      <div className="skill-levels" aria-label="Basketball skill levels">
        {skillLevels.map((level, index) => (
          <button
            aria-current={index === levelIndex ? 'step' : undefined}
            aria-disabled={index > unlockedThrough}
            className={`skill-level${index === levelIndex ? ' active' : ''}${index > unlockedThrough ? ' locked' : ''}`}
            key={level.title}
            onClick={() => index <= unlockedThrough && setLevelIndex(index)}
            type="button"
          >
            <span>{index < unlockedThrough ? '✓' : `0${index + 1}`}</span><b>{level.title}</b><small>{index === 6 ? 'ADVANCED' : index < 2 ? 'BEGINNER' : 'BUILDING'}</small>
          </button>
        ))}
      </div>

      <section className="surface-card basketball-detail">
        <div className="basketball-heading">
          <div><span className="card-kicker">{current.tag}</span><h2>{current.title}</h2><p>{current.cue}</p></div>
          <div className="level-progress-copy">{completedInLevel}/{current.drills.length} DRILLS<Progress className="task-progress" value={(completedInLevel / current.drills.length) * 100} size="xs" /></div>
        </div>
        <div className="basketball-drills">
          {current.drills.map((drill) => {
            const checked = completedDrills.includes(`${levelIndex}:${drill.name}`);
            return (
              <article className={`basketball-drill-card${checked ? ' complete' : ''}`} key={drill.name}>
                <DrillIllustration visual={drill.visual} />
                <div className="basketball-drill-copy">
                  <label><input checked={checked} onChange={() => toggleDrill(drill)} type="checkbox" /><b>{drill.name}</b></label>
                  <p>{drill.cue}</p>
                </div>
              </article>
            );
          })}
        </div>
        {completedInLevel === current.drills.length && (
          <div className="level-complete" role="status">LEVEL COMPLETE · You're ready to explore the next set.</div>
        )}
      </section>

      <section className="trick-card">
        <div><span className="card-kicker">TRICK OF THE DAY · STATIONARY FIGURE EIGHT</span><h2>Wrap the ball around your legs.</h2><p>Start without dribbling. Pass the ball around one leg, then the other; reverse direction when it feels smooth.</p></div>
        <div className="trick-counter"><strong>{trickCount}</strong><span>ROUNDS</span><Button className="form-button" onClick={() => setTrickCount((count) => count + 1)}>LOG A ROUND</Button></div>
      </section>
      <p className="practice-safety">Warm up, use a clear space, and pause for pain or dizziness. Ask a coach to check your form as drills get faster.</p>
    </div>
  );
}

function DrillIllustration({ visual }: { visual: DrillVisual }) {
  const label = visual.replace('-', ' ');
  const showsHoop = ['layup', 'shot', 'catch-shot'].includes(visual);
  const showsOpponent = ['defense', 'two-on-one'].includes(visual);

  return (
    <svg aria-label={`${label} practice diagram`} className={`basketball-visual ${visual}`} role="img" viewBox="0 0 160 100">
      <path className="court-line" d="M8 87H152M30 87V73M130 87V73" />
      {showsHoop && <g className="hoop"><path d="M126 25V49H147" /><path d="M128 50H147" /><path d="M130 51L132 60M136 51L138 60M142 51L144 60" /></g>}
      {showsOpponent && <Player x={119} y={83} className="opponent" />}
      <Player x={visual === 'layup' || visual === 'shot' ? 50 : 72} y={84} className="attacker" />
      {visual === 'pass' && <><Player x={124} y={84} className="teammate" /><path className="ball-path" d="M81 43Q101 20 119 42" /><Ball x={101} y={29} /></>}
      {visual === 'bounce-pass' && <><Player x={124} y={84} className="teammate" /><path className="ball-path dotted" d="M81 43Q92 82 110 48" /><Ball x={96} y={74} /></>}
      {visual === 'dribble' && <><path className="ball-path dotted" d="M80 49Q91 62 81 78" /><Ball x={81} y={78} /></>}
      {visual === 'height-change' && <><Ball x={85} y={68} /><Ball x={85} y={48} /><path className="ball-path" d="M98 73V43" /></>}
      {visual === 'jump-stop' && <><path className="motion-arrow" d="M39 54H60M97 54H119" /><path className="stop-mark" d="M78 40V55M85 40V55" /></>}
      {visual === 'layup' && <><path className="ball-path" d="M61 35Q95 10 126 36" /><Ball x={104} y={24} /></>}
      {visual === 'pivot' && <><path className="motion-arrow" d="M51 53A22 22 0 0 1 88 43" /><path className="motion-arrow reverse" d="M94 61A22 22 0 0 1 58 71" /></>}
      {visual === 'shot' && <><path className="ball-path" d="M83 47Q102 8 130 31" /><Ball x={111} y={18} /></>}
      {visual === 'catch-shot' && <><path className="ball-path" d="M104 39Q117 26 126 37" /><Ball x={105} y={38} /><path className="motion-arrow" d="M78 57H96" /></>}
      {visual === 'crossover' && <><Ball x={66} y={75} /><Ball x={94} y={75} /><path className="ball-path" d="M65 70Q79 94 95 70" /></>}
      {visual === 'defense' && <><path className="motion-arrow" d="M58 44H40M96 44H114" /><path className="defense-space" d="M71 60H111" /></>}
      {visual === 'two-on-one' && <><Player x={122} y={84} className="teammate" /><path className="motion-arrow" d="M84 55H114" /><Ball x={93} y={47} /></>}
      {visual === 'film' && <><rect className="film-frame" x="100" y="23" width="47" height="34" rx="4" /><path className="film-mark" d="M119 32L132 40L119 48Z" /></>}
    </svg>
  );
}

function Player({ x, y, className }: { x: number; y: number; className: string }) {
  return (
    <g className={`basketball-player ${className}`} transform={`translate(${x} ${y})`}>
      <circle cx="0" cy="-37" r="7" />
      <path d="M0 -29V-9M0 -24L-11 -14M0 -24L12 -14M0 -9L-9 0M0 -9L10 0" />
    </g>
  );
}

function Ball({ x, y }: { x: number; y: number }) {
  return <circle className="basketball-ball" cx={x} cy={y} r="5" />;
}

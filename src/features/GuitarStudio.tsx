import { useEffect, useRef, useState } from 'react';
import { Button, Progress } from '@mantine/core';
import { notifications } from '@mantine/notifications';

type ChordName = 'G' | 'C' | 'D' | 'Em' | 'Am' | 'Fmaj7' | 'A' | 'E';
type ChordShape = { [stringNumber: number]: { fret: number; finger: number } | 'open' | 'mute' };

const chordShapes: Record<ChordName, ChordShape> = {
  G: { 6: { fret: 3, finger: 2 }, 5: { fret: 2, finger: 1 }, 4: 'open', 3: 'open', 2: 'open', 1: { fret: 3, finger: 3 } },
  C: { 6: 'mute', 5: { fret: 3, finger: 3 }, 4: { fret: 2, finger: 2 }, 3: 'open', 2: { fret: 1, finger: 1 }, 1: 'open' },
  D: { 6: 'mute', 5: 'mute', 4: 'open', 3: { fret: 2, finger: 1 }, 2: { fret: 3, finger: 3 }, 1: { fret: 2, finger: 2 } },
  Em: { 6: 'open', 5: { fret: 2, finger: 2 }, 4: { fret: 2, finger: 3 }, 3: 'open', 2: 'open', 1: 'open' },
  Am: { 6: 'mute', 5: 'open', 4: { fret: 2, finger: 2 }, 3: { fret: 2, finger: 3 }, 2: { fret: 1, finger: 1 }, 1: 'open' },
  Fmaj7: { 6: 'mute', 5: { fret: 3, finger: 3 }, 4: { fret: 3, finger: 4 }, 3: { fret: 2, finger: 2 }, 2: { fret: 1, finger: 1 }, 1: 'open' },
  A: { 6: 'mute', 5: 'open', 4: { fret: 2, finger: 1 }, 3: { fret: 2, finger: 2 }, 2: { fret: 2, finger: 3 }, 1: 'open' },
  E: { 6: 'open', 5: { fret: 2, finger: 2 }, 4: { fret: 2, finger: 3 }, 3: { fret: 1, finger: 1 }, 2: 'open', 1: 'open' },
};

const songSets = {
  'NO CAPO': [
    { title: 'Amazing Grace', note: 'Traditional · beginner arrangement', chords: ['G', 'C', 'G', 'D'] as ChordName[], pattern: 'D · D U · U D U' },
    { title: 'Ode to Joy', note: 'Beethoven · public-domain melody', chords: ['C', 'G', 'C', 'G'] as ChordName[], pattern: 'D · D · D U D U' },
    { title: 'Three-chord campfire', note: 'Original practice progression', chords: ['G', 'C', 'D', 'G'] as ChordName[], pattern: 'D · D U · U D U' },
    { title: 'Twinkle, Twinkle Little Star', note: 'Public-domain melody · easy chord loop', chords: ['C', 'G', 'C', 'G'] as ChordName[], pattern: 'D · D · D U D U' },
    { title: 'Frère Jacques', note: 'Traditional · public-domain round', chords: ['C', 'G', 'C', 'G'] as ChordName[], pattern: 'D · D U · D U' },
    { title: 'When the Saints Go Marching In', note: 'Traditional · public-domain arrangement', chords: ['G', 'C', 'G', 'D'] as ChordName[], pattern: 'D · D U · U D U' },
    { title: 'Auld Lang Syne', note: 'Traditional · public-domain arrangement', chords: ['G', 'D', 'G', 'C'] as ChordName[], pattern: 'D · D U · D U' },
  ],
  'CAPO SETUPS': [
    { title: 'Scarborough Fair', note: 'Traditional · simplified accompaniment, capo 2', chords: ['Am', 'G', 'Am', 'Em'] as ChordName[], pattern: 'D · D U · D U' },
    { title: 'Greensleeves', note: 'Traditional · easy-shape arrangement, capo 1', chords: ['Am', 'G', 'Fmaj7', 'E'] as ChordName[], pattern: 'D · D · D U D U' },
    { title: 'Sunshine in C', note: 'Original practice progression · capo 3', chords: ['C', 'Fmaj7', 'C', 'G'] as ChordName[], pattern: 'D · D U · U D U' },
    { title: 'House of the Rising Sun', note: 'Traditional · simplified chord cycle, capo 2', chords: ['Am', 'C', 'D', 'Fmaj7'] as ChordName[], pattern: 'D · D U · D U' },
    { title: 'Wayfaring Stranger', note: 'Traditional · beginner arrangement, capo 2', chords: ['Em', 'G', 'D', 'Em'] as ChordName[], pattern: 'D · D · D U D U' },
    { title: 'Danny Boy', note: 'Public-domain melody · simplified chord cycle, capo 2', chords: ['G', 'C', 'D', 'G'] as ChordName[], pattern: 'D · D U · U D U' },
    { title: 'Auld Lang Syne · higher key', note: 'Traditional · easy shapes, capo 2', chords: ['G', 'D', 'G', 'C'] as ChordName[], pattern: 'D · D U · D U' },
  ],
};

const chordFrequencies: Record<ChordName, number[]> = {
  G: [98, 123.47, 146.83, 196, 246.94, 392],
  C: [130.81, 164.81, 196, 261.63, 329.63],
  D: [146.83, 220, 293.66, 369.99],
  Em: [82.41, 123.47, 164.81, 196, 246.94, 329.63],
  Am: [110, 164.81, 220, 261.63, 329.63],
  Fmaj7: [130.81, 174.61, 220, 261.63, 329.63],
  A: [110, 164.81, 220, 277.18, 329.63],
  E: [82.41, 123.47, 164.81, 207.65, 246.94, 329.63],
};

const lessons = ['SONGS', 'FINGER PICKING', 'BARRE CHORDS'] as const;
type Lesson = typeof lessons[number];

export default function GuitarStudio() {
  const [lesson, setLesson] = useState<Lesson>('SONGS');
  const [songSet, setSongSet] = useState<keyof typeof songSets>('NO CAPO');
  const [songIndex, setSongIndex] = useState(0);
  const [selectedChord, setSelectedChord] = useState<ChordName>('G');
  const [playingPattern, setPlayingPattern] = useState(false);
  const [playingSong, setPlayingSong] = useState(false);
  const [beat, setBeat] = useState(-1);
  const [tempo, setTempo] = useState(78);
  const [practiceDays, setPracticeDays] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const songTimerRef = useRef<number | null>(null);
  const song = songSets[songSet][songIndex];
  const beats = song.pattern.split(' ').filter((value) => value !== '·');

  function stopSongPreview() {
    if (songTimerRef.current !== null) window.clearTimeout(songTimerRef.current);
    songTimerRef.current = null;
    oscillatorsRef.current.forEach((oscillator) => oscillator.stop());
    oscillatorsRef.current = [];
    setPlayingSong(false);
  }

  function playChord(context: AudioContext, chord: ChordName, startAt: number) {
    chordFrequencies[chord].forEach((frequency, index, frequencies) => {
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      const noteStart = startAt + index * 0.035;
      oscillator.type = 'triangle';
      oscillator.frequency.value = frequency;
      envelope.gain.setValueAtTime(0.0001, noteStart);
      envelope.gain.exponentialRampToValueAtTime(0.12 / Math.sqrt(frequencies.length), noteStart + 0.018);
      envelope.gain.exponentialRampToValueAtTime(0.0001, noteStart + 1.65);
      oscillator.connect(envelope);
      envelope.connect(context.destination);
      oscillator.onended = () => {
        oscillatorsRef.current = oscillatorsRef.current.filter((item) => item !== oscillator);
      };
      oscillatorsRef.current.push(oscillator);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + 1.7);
    });
  }

  async function playSongPreview() {
    if (playingSong) {
      stopSongPreview();
      return;
    }
    if (!('AudioContext' in window)) {
      notifications.show({ title: 'AUDIO PREVIEW UNAVAILABLE', message: 'This browser does not support local audio playback.' });
      return;
    }
    try {
      const context = audioContextRef.current ?? new AudioContext();
      audioContextRef.current = context;
      await context.resume();
      setPlayingPattern(false);
      setPlayingSong(true);
      const barDuration = 60 / tempo * 4;
      const startAt = context.currentTime + 0.08;
      song.chords.forEach((chord, index) => playChord(context, chord, startAt + index * barDuration));
      songTimerRef.current = window.setTimeout(() => {
        songTimerRef.current = null;
        setPlayingSong(false);
      }, song.chords.length * barDuration * 1000);
    } catch (error) {
      setPlayingSong(false);
      notifications.show({
        title: 'AUDIO PREVIEW COULD NOT START',
        message: error instanceof Error ? error.message : 'Allow audio playback in this browser, then try again.',
      });
    }
  }

  useEffect(() => {
    if (!playingPattern) return undefined;
    let currentBeat = -1;
    const intervalId = window.setInterval(() => {
      currentBeat += 1;
      if (currentBeat >= beats.length) {
        setBeat(-1);
        setPlayingPattern(false);
        return;
      }
      setBeat(currentBeat);
    }, 60_000 / tempo);
    return () => window.clearInterval(intervalId);
  }, [beats.length, playingPattern, tempo]);

  useEffect(() => () => {
    if (songTimerRef.current !== null) window.clearTimeout(songTimerRef.current);
    oscillatorsRef.current.forEach((oscillator) => oscillator.stop());
    void audioContextRef.current?.close();
  }, []);

  function changeSet(set: keyof typeof songSets) {
    stopSongPreview();
    setSongSet(set);
    setSongIndex(0);
  }

  function selectSong(index: number) {
    stopSongPreview();
    setSongIndex(index);
  }

  function finishPractice() {
    setPracticeDays((days) => days + 1);
  }

  return (
    <div className="content learning-page guitar-page">
      <header className="page-heading guitar-heading">
        <div className="eyebrow"><span className="eyebrow-dot" /> SMALL CHORDS, BIG FEELING</div>
        <h1>Guitar, one string at a time.</h1>
        <p>Beginner-friendly songs, chord shapes, rhythm, fingerpicking, and barre-chord foundations.</p>
      </header>

      <nav aria-label="Guitar lessons" className="lesson-tabs">
        {lessons.map((item) => (
          <button aria-pressed={lesson === item} className={lesson === item ? 'selected' : ''} key={item} onClick={() => setLesson(item)} type="button">{item}</button>
        ))}
      </nav>

      {lesson === 'SONGS' && (
        <div className="guitar-workspace">
          <section className="surface-card song-list-card">
            <div className="card-kicker">PICK A SONG OR EXERCISE</div>
            <div className="song-set-tabs">
              {(Object.keys(songSets) as Array<keyof typeof songSets>).map((set) => (
                <button aria-pressed={songSet === set} className={songSet === set ? 'selected' : ''} key={set} onClick={() => changeSet(set)} type="button">{set}</button>
              ))}
            </div>
            <div className="song-list">
              {songSets[songSet].map((item, index) => (
                <button aria-pressed={songIndex === index} className={`song-choice${songIndex === index ? ' active' : ''}`} key={item.title} onClick={() => selectSong(index)} type="button">
                  <span><b>{item.title}</b><small>{item.note}</small></span><span className="song-arrow">→</span>
                </button>
              ))}
            </div>
            <div className="practice-count"><span>YOUR PRACTICE SESSIONS</span><strong>{practiceDays}</strong></div>
          </section>

          <section className="surface-card chord-workspace">
            <div className="song-header">
              <div><span className="card-kicker">{songSet === 'NO CAPO' ? 'NO CAPO' : 'CAPO RECOMMENDED'}</span><h2>{song.title}</h2><p>{song.note}</p></div>
              <button className="text-button" onClick={finishPractice} type="button">LOG PRACTICE +</button>
            </div>
            <div className="chord-progression" aria-label="Chord progression">
              {song.chords.map((chord, index) => (
                <button aria-pressed={selectedChord === chord} className={selectedChord === chord ? 'current' : ''} key={`${chord}-${index}`} onClick={() => setSelectedChord(chord)} type="button">{chord}</button>
              ))}
            </div>
            <div className="song-audio-preview">
              <Button className="form-button" onClick={playSongPreview} type="button">{playingSong ? 'STOP AUDIO PREVIEW' : 'HEAR THIS CHORD PROGRESSION'}</Button>
              <span>Local synthesized string tones · {tempo} BPM · no recording or lyrics</span>
            </div>
            <div className="chord-detail">
              <ChordDiagram chord={selectedChord} />
              <div className="chord-instructions">
                <span className="card-kicker">CHORD SHAPE · {selectedChord}</span>
                <h3>Place fingers, then strum slowly.</h3>
                <p>String numbers are shown from <b>1 (thinnest, high E)</b> to <b>6 (thickest, low E)</b>. Numbers in the dots tell you which fretting-hand finger to use.</p>
                <div className="string-legend"><span>○ OPEN STRING</span><span>× DON'T PLAY</span><span>● FINGER NUMBER</span></div>
              </div>
            </div>
            <div className="strum-panel">
              <div className="strum-heading"><div><span className="card-kicker">STRUMMING PATTERN</span><h3>Down · down-up · up-down-up</h3></div><label>TEMPO <input aria-label="Strumming tempo" max="140" min="50" onChange={(event) => setTempo(Number(event.currentTarget.value))} type="range" value={tempo} /><span>{tempo} BPM</span></label></div>
              <div className="strum-beats" aria-label="Strumming beats">
                {beats.map((direction, index) => <span className={beat === index ? 'active' : ''} key={`${direction}-${index}`}>{direction === 'D' ? '↓' : '↑'}<small>{direction}</small></span>)}
              </div>
              <Button className="form-button" onClick={() => { setBeat(-1); setPlayingPattern((value) => !value); }}>{playingPattern ? 'STOP PATTERN' : 'PRACTICE THE RHYTHM'}</Button>
            </div>
          </section>
        </div>
      )}

      {lesson === 'FINGER PICKING' && (
        <TechniqueLesson
          title="Finger picking"
          eyebrow="THUMB · INDEX · MIDDLE · RING"
          image="/images/guitar.jpeg"
          steps={['Rest your thumb on the lowest note in the chord.', 'Use index, middle, and ring fingers on strings 3, 2, and 1.', 'Try the slow pattern: P – I – M – A – M – I.', 'Keep your hand relaxed; repeat the pattern on G, C, and Em.']}
          notation={['P = thumb', 'I = index', 'M = middle', 'A = ring finger']}
        />
      )}

      {lesson === 'BARRE CHORDS' && (
        <TechniqueLesson
          title="Barre-chord foundations"
          eyebrow="BUILD COMFORT BEFORE SPEED"
          image="/images/guitar.jpeg"
          steps={['Start with a short, gentle barre on the first two strings.', 'Place the index finger close behind the fret wire, not on top of it.', 'Add one finger at a time and check each string separately.', 'Rest whenever your wrist feels strained; a clean partial chord is progress.']}
          notation={['Index = mini-barre', 'Thumb = relaxed support', 'Fret 1 = start small', 'No pain = stop if it hurts']}
        />
      )}
    </div>
  );
}

function ChordDiagram({ chord }: { chord: ChordName }) {
  const shape = chordShapes[chord];
  const xStart = 32;
  const spacing = 19;
  const yStart = 42;
  const fretSpacing = 22;

  return (
    <svg aria-label={`${chord} chord diagram, strings numbered one through six`} className="chord-diagram" role="img" viewBox="0 0 160 174">
      <text className="diagram-fret-label" textAnchor="middle" x="14" y="61">1</text>
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const stringNumber = 6 - index;
        const x = xStart + index * spacing;
        const placement = shape[stringNumber];
        return (
          <g key={stringNumber}>
            <line className="diagram-string" x1={x} x2={x} y1={yStart} y2={yStart + fretSpacing * 4} />
            <text className="diagram-string-label" textAnchor="middle" x={x} y="160">{stringNumber}</text>
            {placement === 'open' && <text className="diagram-note" textAnchor="middle" x={x} y="28">○</text>}
            {placement === 'mute' && <text className="diagram-note mute" textAnchor="middle" x={x} y="28">×</text>}
            {typeof placement === 'object' && (
              <g>
                <circle className="diagram-finger" cx={x} cy={yStart + (placement.fret - 0.5) * fretSpacing} r="8" />
                <text className="diagram-finger-number" textAnchor="middle" x={x} y={yStart + (placement.fret - 0.5) * fretSpacing + 3}>{placement.finger}</text>
              </g>
            )}
          </g>
        );
      })}
      {[0, 1, 2, 3, 4].map((fret) => (
        <line className={fret === 0 ? 'diagram-nut' : 'diagram-fret'} key={fret} x1={xStart} x2={xStart + spacing * 5} y1={yStart + fret * fretSpacing} y2={yStart + fret * fretSpacing} />
      ))}
    </svg>
  );
}

function TechniqueLesson({
  title,
  eyebrow,
  image,
  steps,
  notation,
}: {
  title: string;
  eyebrow: string;
  image: string;
  steps: string[];
  notation: string[];
}) {
  const [step, setStep] = useState(0);
  return (
    <section className="technique-card" style={{ backgroundImage: `linear-gradient(90deg, #102018f5, #12251ddd 60%, #1020188f), url('${image}')` }}>
      <div className="technique-content">
        <span className="card-kicker">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{steps[step]}</p>
        <Progress className="task-progress" value={((step + 1) / steps.length) * 100} size="sm" />
        <div className="technique-actions">
          <Button className="secondary-button" disabled={step === 0} onClick={() => setStep((current) => current - 1)}>PREVIOUS</Button>
          <span>STEP {step + 1} / {steps.length}</span>
          <Button className="form-button" onClick={() => setStep((current) => (current + 1) % steps.length)}>NEXT STEP</Button>
        </div>
      </div>
      <div className="technique-notation">{notation.map((item) => <span key={item}>{item}</span>)}</div>
    </section>
  );
}

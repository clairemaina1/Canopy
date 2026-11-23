import { useState } from 'react';
import { Progress } from '@mantine/core';
import StudyTutor from './StudyTutor';

const syllabus = [
  { title: 'The training journey & air law', area: 'START HERE', overview: 'Understand the local licensing path, school responsibilities, student privileges, and the rules that shape flight training.', activity: 'Make a question list for a KCAA-approved training organisation. Confirm current requirements directly with the school and KCAA.', label: 'the training journey and air law', keyIdeas: ['approved training organisation', 'licence privileges', 'current rules'], lesson: 'Flight training combines ground study, supervised practical lessons, preparation, debriefs, and assessments. The regulator sets the legal framework; an approved training organisation explains the current route, entry requirements, examinations, and privileges for the licence you are considering. Requirements can change, so use current KCAA guidance and the school’s approved materials rather than a generic app as authority.', question: 'Which source should confirm current licensing requirements in Kenya?' },
  { title: 'Principles of flight', area: 'AERODYNAMICS', overview: 'Build a classroom-level picture of lift, drag, thrust, weight, stability, and control—without treating short explanations as a substitute for instruction.', activity: 'Draw the four forces and explain in your own words how they interact.', label: 'the four forces of flight', keyIdeas: ['lift', 'weight', 'thrust', 'drag'], lesson: 'A useful first model groups forces into lift and weight, and thrust and drag. Lift is the aerodynamic force produced by airflow around a wing; it is affected by airspeed, air density, wing shape, and angle of attack. Weight acts toward Earth’s centre, thrust is produced by the propulsion system, and drag resists motion through air. The forces change together; this model is for ground-school understanding, not a way to make flight decisions.', question: 'Which force opposes thrust, and which force balances lift in steady level flight?' },
  { title: 'Aircraft and systems', area: 'AIRCRAFT KNOWLEDGE', overview: 'Get familiar with airframes, engines, electrical systems, instruments, and why each aircraft has its own approved documentation.', activity: 'Use the aircraft reference below to note questions. Never infer a procedure from an image.', label: 'aircraft systems and documentation', keyIdeas: ['airframe', 'engine', 'instruments', 'approved manual'], lesson: 'An aircraft is a set of connected systems: the airframe carries loads, the powerplant provides propulsion, and electrical, fuel, control, and instrument systems support operation. A cockpit instrument shows only what its sensor and design can report. Aircraft models and configurations differ, so limitations, indications, and procedures must come from the approved aircraft flight manual or pilot operating handbook and instructor-led training—not from a photograph or a general summary.', question: 'Why can’t a cockpit image tell you the approved procedure for an aircraft?' },
  { title: 'Meteorology', area: 'WEATHER', overview: 'Study the atmosphere, clouds, wind, pressure, visibility, and how weather information is taught and interpreted in formal training.', activity: 'Keep a weather vocabulary journal. Real flight decisions belong to your instructor and official sources.', label: 'weather foundations', keyIdeas: ['pressure', 'temperature', 'moisture', 'wind'], lesson: 'Weather develops as air moves and exchanges heat and moisture. Pressure, temperature, and moisture influence stability and cloud formation; wind is air moving from higher toward lower pressure, modified by local conditions. Visibility and cloud are part of a larger picture that also includes changing forecasts and hazards. Pilots learn to use official, current weather products with instructors. A classroom explanation is not a go/no-go decision tool.', question: 'Name two atmospheric factors that influence cloud formation.' },
  { title: 'Navigation concepts', area: 'MAPS & POSITION', overview: 'Learn map symbols, coordinates, direction, time, and the classroom concepts behind navigation and flight planning.', activity: 'Sketch a route on paper and label the information you would need to ask your instructor about.', label: 'navigation concepts', keyIdeas: ['latitude', 'longitude', 'heading', 'track'], lesson: 'Latitude and longitude describe a position on Earth. A chart communicates geography and relevant information using a legend. Heading is the direction an aircraft points; track is the path it follows over the ground. Wind can make them differ. Classroom navigation brings position, direction, time, distance, and approved planning methods together. Actual route planning and navigation must use current charts, aircraft information, and instruction.', question: 'How is an aircraft’s heading different from its ground track?' },
  { title: 'Performance & loading', area: 'PLANNING', overview: 'Explore why aircraft mass, balance, runway conditions, and performance limits matter; calculations must use the correct aircraft documents and instruction.', activity: 'Ask your school which approved workbook they use for weight-and-balance exercises.', label: 'aircraft loading and performance', keyIdeas: ['mass', 'centre of gravity', 'performance chart', 'approved data'], lesson: 'Mass affects the energy and performance an aircraft needs. The centre of gravity describes how the aircraft’s mass is distributed and must remain within approved limits. Performance also depends on aircraft configuration, atmosphere, runway, and other factors. Training teaches how to use the correct aircraft-specific charts and data. Never use an example calculation from an app to plan or authorize a real flight.', question: 'Why must weight-and-balance results be checked against aircraft-specific limits?' },
  { title: 'Human performance', area: 'THE PILOT', overview: 'Learn about fatigue, attention, perception, workload, health, communication, and the discipline to pause or ask for help.', activity: 'Write down what a safe, supported learning environment would look like for you.', label: 'human performance', keyIdeas: ['fatigue', 'attention', 'workload', 'communication'], lesson: 'People have limits in attention, memory, perception, and physical readiness. Fatigue and stress can make tasks harder; workload can rise when several demands compete. Aviation training treats self-awareness, clear communication, checklists, and asking for help as safety skills. A learner should be able to pause, tell an instructor about a concern, and learn without pressure to continue when unwell or unsure.', question: 'What is one sign that workload is becoming too high for a learner?' },
  { title: 'Communications & procedures', area: 'SAFETY CULTURE', overview: 'Study how clear communication and aircraft-specific checklists support reliable teamwork. Practical phraseology and procedures are taught by instructors.', activity: 'Listen to instructor-approved classroom examples and note unfamiliar terms; do not transmit on aviation frequencies.', label: 'aviation communication and checklists', keyIdeas: ['clear message', 'readback', 'checklist', 'instructor'], lesson: 'Aviation communication aims to be concise, clear, and unambiguous. Standard phraseology helps trained participants share information consistently; readbacks let a speaker confirm that important instructions were understood. Checklists support memory but are specific to an aircraft and operation. Learn phraseology and procedures from approved teaching material. This lesson is not authorization to transmit on an aviation frequency or perform a procedure.', question: 'Why does a readback help a team catch misunderstandings?' },
  { title: 'Simulation, briefing & debriefing', area: 'TRAINING METHOD', overview: 'Understand how lessons are prepared, practised, reviewed, and sometimes repeated. Progress is built from feedback—not only flight hours.', activity: 'Try a simple study loop: prepare one question, learn a concept, then write what remains unclear.', label: 'briefing and debriefing', keyIdeas: ['lesson objective', 'briefing', 'practice', 'debrief'], lesson: 'A briefing sets the lesson goal, context, and expectations. Practice gives the learner a chance to try a skill under supervision. A debrief compares what happened with the lesson objective and identifies one next step. Repeating a lesson is a normal way to build consistency. Simulation can help rehearse concepts, but it does not replace an instructor or approved practical training.', question: 'What should a useful debrief help you decide?' },
  { title: 'Revision & progress checks', area: 'CONSOLIDATE', overview: 'Plan regular revision, practise explaining concepts simply, and use only the assessment materials specified by your training organisation.', activity: 'Teach one ground-school idea back to yourself in three sentences.', label: 'ground-school revision', keyIdeas: ['active recall', 'spaced practice', 'feedback', 'official syllabus'], lesson: 'Active recall means trying to retrieve an idea before looking at notes. Spaced practice revisits it over time rather than repeating everything once. Short explanations reveal what is clear and what needs another pass; feedback corrects misunderstandings. Use your training organisation’s current syllabus and assessment material to decide what to study. A self-check can guide revision, but it is not an official assessment.', question: 'How does spaced practice differ from cramming one long session?' },
];

const facts = [
  'A conventional altimeter estimates altitude from static air pressure. The instrument setting and interpretation are taught carefully because pressure varies.',
  'A training flight includes preparation and a debrief; the time in the air is only one part of a lesson.',
  'Weather, aircraft serviceability, and instructor availability can change a planned lesson. A cancellation can be a normal safety decision, not a setback.',
  'Aircraft layouts differ. A cockpit picture is a useful prompt for questions, but only the correct aircraft documents and an instructor explain its controls.',
  'Checklists help pilots manage tasks and memory under workload. Their exact content is aircraft-specific and learned through approved training.',
  'Ground school connects several subjects: weather, navigation, aircraft knowledge, human performance, rules, and planning all inform later lessons.',
];

const dayInLife = [
  { time: 'Before the lesson', title: 'Study & get organised', detail: 'Review a ground-school topic, check messages from the school, pack notes, and allow time for travel.' },
  { time: 'At the school', title: 'Brief, ask, prepare', detail: 'Meet the instructor, discuss the lesson goal and conditions, and follow the school’s supervised preparation process.' },
  { time: 'The lesson', title: 'Practise with feedback', detail: 'A training sortie may feel repetitive. Your instructor chooses what is appropriate; weather or aircraft changes may shorten or cancel it.' },
  { time: 'Afterward', title: 'Debrief & record', detail: 'Talk through what went well and what needs practice, write down questions, and plan the next study session.' },
  { time: 'The unglamorous bits', title: 'Wait, revise, budget', detail: 'Scheduling, costs, exams, travel, maintenance delays, and repeating a skill are part of the journey too. Progress is not a highlight reel.' },
];

export default function FlightSchool() {
  const [activeModule, setActiveModule] = useState(0);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [factIndex, setFactIndex] = useState(0);
  const currentModule = syllabus[activeModule];
  const progress = Math.round((completedModules.length / syllabus.length) * 100);

  function toggleModule(index: number) {
    setCompletedModules((items) => items.includes(index) ? items.filter((item) => item !== index) : [...items, index]);
  }

  function nextFact() {
    setFactIndex((index) => (index + 1) % facts.length);
  }

  return (
    <div className="content learning-page flight-page">
      <header className="page-heading">
        <div className="eyebrow"><span className="eyebrow-dot" /> AVIATION, INCLUDING THE ORDINARY DAYS</div>
        <h1>Learn the ground before the sky.</h1>
        <p>A realistic first look at flight school alongside your Strathmore BBIT. This is a study roadmap, not flight instruction.</p>
      </header>

      <section className="flight-reality">
        <div className="flight-reality-copy">
          <span className="card-kicker">A DAY IN THE LIFE · AN EXAMPLE, NOT A PROMISE</span>
          <h2>Less movie montage.<br />More preparation, practice, and debrief.</h2>
          <p>Every school and training day is different. Some days are mostly study or waiting; weather and safety can change plans.</p>
        </div>
        <div className="flight-day-timeline">
          {dayInLife.map((item, index) => (
            <article className="flight-day-item" key={item.title}>
              <span className="flight-day-number">{String(index + 1).padStart(2, '0')}</span>
              <div><small>{item.time}</small><h3>{item.title}</h3><p>{item.detail}</p></div>
            </article>
          ))}
        </div>
      </section>

      <div className="flight-photo-fact-grid">
        <figure className="flight-reference-card">
          <img alt="Aircraft cockpit and systems reference image shared by MAINA" loading="lazy" src="/images/flight-school/aircraft-panel-reference.jpg" />
          <figcaption>The aircraft panel picture you shared. Use it to spark questions—not to identify or operate controls without an instructor.</figcaption>
        </figure>
        <section aria-live="polite" className="flight-fact-card">
          <span className="card-kicker">A SMALL AVIATION FACT</span>
          <p>{facts[factIndex]}</p>
          <button className="text-button" onClick={nextFact} type="button">ANOTHER FACT <span>↻</span></button>
          <div className="flight-moodboard-images" aria-label="Aviation inspiration images">
            <img alt="Aircraft on the ground" loading="lazy" src="/images/flight.jpeg" />
            <img alt="Cockpit interior moodboard image" loading="lazy" src="/images/cockpit.jpeg" />
          </div>
        </section>
      </div>

      <section className="groundschool-section">
        <div className="groundschool-heading">
          <div><span className="card-kicker">A BEGINNER GROUND-SCHOOL SYLLABUS</span><h2>Build the knowledge in layers.</h2><p>Topics are a general orientation. Follow the current syllabus of a KCAA-approved training organisation.</p></div>
          <div className="groundschool-progress"><strong>{completedModules.length}/{syllabus.length}</strong><span>TOPICS EXPLORED</span><Progress className="task-progress" value={progress} size="xs" /></div>
        </div>
        <div className="groundschool-layout">
          <nav aria-label="Ground-school syllabus" className="groundschool-list">
            {syllabus.map((module, index) => (
              <button aria-current={activeModule === index ? 'step' : undefined} className={`groundschool-topic${activeModule === index ? ' active' : ''}${completedModules.includes(index) ? ' complete' : ''}`} key={module.title} onClick={() => setActiveModule(index)} type="button">
                <span>{completedModules.includes(index) ? '✓' : String(index + 1).padStart(2, '0')}</span>
                <span><small>{module.area}</small><b>{module.title}</b></span>
              </button>
            ))}
          </nav>
          <article className="groundschool-detail">
            <span className="card-kicker">{currentModule.area} · TOPIC {String(activeModule + 1).padStart(2, '0')}</span>
            <h3>{currentModule.title}</h3>
            <p>{currentModule.overview}</p>
            <div className="groundschool-activity"><b>LOW-PRESSURE STUDY IDEA</b><p>{currentModule.activity}</p></div>
            <button aria-pressed={completedModules.includes(activeModule)} className="exercise-check" onClick={() => toggleModule(activeModule)} type="button">
              {completedModules.includes(activeModule) ? '✓ MARK AS UNEXPLORED' : 'MARK TOPIC EXPLORED'}
            </button>
          </article>
        </div>
        <details className="lesson-notes aviation-notes">
          <summary>OPEN TEACHING NOTES · KEY IDEAS & CHECK QUESTION</summary>
          <p>{currentModule.lesson}</p>
          <p><b>Explain this back:</b> {currentModule.question}</p>
          <div>{currentModule.keyIdeas.map((idea) => <span key={idea}>{idea}</span>)}</div>
        </details>
        <StudyTutor concept={currentModule} key={currentModule.label} subject="AVIATION STUDY" />
      </section>

      <section className="flight-boundary">
        <b>KEEP THE BOUNDARY CLEAR</b>
        <p>Before spending money or making training decisions, speak with a KCAA-approved school and verify current requirements with KCAA. Only a qualified instructor and approved aircraft documents can guide actual flight operations.</p>
      </section>
    </div>
  );
}

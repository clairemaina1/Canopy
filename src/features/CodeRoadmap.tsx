import { useState } from 'react';
import StudyTutor, { type TutorConcept } from './StudyTutor';

type CodeLine = { code: string; explanation: string };
type Project = {
  id: string;
  title: string;
  track: string;
  stack: string;
  goal: string;
  steps: string[];
  code: CodeLine[];
  checkpoint: string;
};

const projects: Project[] = [
  {
    id: 'brief',
    title: 'Start with the problem',
    track: 'IT & IS FOUNDATIONS',
    stack: 'Requirements · user stories · acceptance criteria',
    goal: 'Turn one of your business ideas into a small, testable project before writing code.',
    steps: [
      'Choose one user, such as a venue owner adding an advertising space to BillboardHub.',
      'Write the problem in one sentence, without naming a solution.',
      'List the user, their goal, and the information the system must remember.',
      'Write three acceptance checks in plain language: what should happen when the user succeeds, makes a mistake, or has no results?',
      'Sketch the screens and data flow; keep the first version to one useful journey.',
    ],
    code: [
      { code: 'USER: venue owner', explanation: 'Name a real user role instead of a vague “everyone”.' },
      { code: 'GOAL: list one available space', explanation: 'Describe the user outcome in a simple verb phrase.' },
      { code: 'CHECK: a listing needs a title and location', explanation: 'An acceptance check makes the requirement testable.' },
    ],
    checkpoint: 'Deliverable: a one-page brief, one user journey, a screen sketch, and measurable acceptance checks.',
  },
  {
    id: 'html',
    title: 'BillboardHub · build the page',
    track: 'FRONTEND · HTML',
    stack: 'HTML · semantic structure · accessibility',
    goal: 'Create a useful directory page before adding styling or behaviour.',
    steps: [
      'Create a page with one clear heading and a list of billboard spaces.',
      'Use semantic elements so the content makes sense to browsers and assistive technology.',
      'Add a button with an action users can understand; do not make a decorative element pretend to be a button.',
      'Open the page in a browser and check that its content still makes sense without CSS.',
    ],
    code: [
      { code: '<main class="directory">', explanation: 'Starts the primary content area; the class is a styling hook.' },
      { code: '  <h1>Billboard spaces</h1>', explanation: 'A descriptive top-level heading tells people what this page is for.' },
      { code: '  <article class="space-card">', explanation: 'An article groups one self-contained listing.' },
      { code: '    <h2>Westlands · city view</h2>', explanation: 'A second-level heading names this individual listing.' },
      { code: '    <p>Ask the owner about availability.</p>', explanation: 'A paragraph gives context without promising live availability.' },
      { code: '    <button type="button">View space</button>', explanation: 'A real button supports keyboard and pointer interaction.' },
      { code: '  </article>', explanation: 'Closes the listing article.' },
      { code: '</main>', explanation: 'Closes the primary content area.' },
    ],
    checkpoint: 'Deliverable: a readable HTML directory with at least three sample listings.',
  },
  {
    id: 'css',
    title: 'Make the listing feel polished',
    track: 'FRONTEND · CSS',
    stack: 'CSS · responsive layout · visual hierarchy',
    goal: 'Give BillboardHub a layout that works on a phone, laptop, and wide screen.',
    steps: [
      'Set a small design system: page background, text colour, spacing scale, and one accent.',
      'Use CSS Grid or Flexbox for a flexible card layout instead of fixed screen coordinates.',
      'Add hover and keyboard-focus states so the controls are easy to find.',
      'Test at a narrow viewport; avoid horizontal scrolling and tiny text.',
    ],
    code: [
      { code: '.space-grid {', explanation: 'Selects the container that holds all listing cards.' },
      { code: '  display: grid;', explanation: 'Uses CSS Grid to arrange cards in rows and columns.' },
      { code: '  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));', explanation: 'Fits as many readable cards as the available width allows.' },
      { code: '  gap: 1rem;', explanation: 'Adds consistent space between cards.' },
      { code: '}', explanation: 'Closes the CSS rule.' },
      { code: '.space-card:focus-within { outline: 2px solid teal; }', explanation: 'Shows a visible focus cue when someone uses a keyboard inside a card.' },
    ],
    checkpoint: 'Deliverable: a responsive card grid with visible focus and hover states.',
  },
  {
    id: 'javascript',
    title: 'Mood / Music · add interaction',
    track: 'FRONTEND · JAVASCRIPT',
    stack: 'JavaScript · arrays · functions · DOM',
    goal: 'Filter a playlist or listing collection from user-selected criteria.',
    steps: [
      'Represent each item as an object with named fields rather than parallel arrays.',
      'Write one function that receives a list and a filter value.',
      'Use filter to select matching items and map to display the results.',
      'Handle an empty result with a useful message; do not leave a blank panel.',
      'Try a few inputs, including one that has no matches.',
    ],
    code: [
      { code: 'const tracks = [', explanation: 'Creates a constant reference to the sample playlist array.' },
      { code: '  { title: "Slow Sunday", mood: "calm" },', explanation: 'An object keeps a track title and mood together.' },
      { code: '  { title: "Runway Lights", mood: "focus" },', explanation: 'A second sample can be included in the same data structure.' },
      { code: '];', explanation: 'Closes the array.' },
      { code: 'function byMood(items, mood) {', explanation: 'Declares a reusable function with the items and chosen mood as inputs.' },
      { code: '  return items.filter((item) => item.mood === mood);', explanation: 'Returns only items whose mood exactly matches the selected value.' },
      { code: '}', explanation: 'Closes the function.' },
    ],
    checkpoint: 'Deliverable: a filter that works for several moods and explains when no items match.',
  },
  {
    id: 'typescript',
    title: 'Opportunity Tracker · model the data',
    track: 'FRONTEND · TYPESCRIPT',
    stack: 'TypeScript · types · safe data changes',
    goal: 'Describe the data shape so mistakes are caught while you build.',
    steps: [
      'List the fields one opportunity needs: title, organisation, status, and due date.',
      'Give each field a type; use a union for a short list of allowed statuses.',
      'Create one valid example and let the editor check it.',
      'Try misspelling a field or status and observe the type error.',
    ],
    code: [
      { code: 'type Status = "saved" | "applied" | "interview";', explanation: 'Defines the only three status strings this first version allows.' },
      { code: 'type Opportunity = {', explanation: 'Starts a named shape for one opportunity record.' },
      { code: '  title: string;', explanation: 'Requires a text title.' },
      { code: '  organisation: string;', explanation: 'Requires a text organisation name.' },
      { code: '  status: Status;', explanation: 'Restricts status to one of the values defined above.' },
      { code: '};', explanation: 'Closes the type definition.' },
    ],
    checkpoint: 'Deliverable: typed records and a deliberate answer for optional or missing information.',
  },
  {
    id: 'react',
    title: 'Atelier Cards · build reusable UI',
    track: 'FRONTEND · REACT',
    stack: 'React · TypeScript · components · state',
    goal: 'Turn a screen into small components that can be reused and updated.',
    steps: [
      'Split the page into components such as a card list, one card, and a filter.',
      'Pass card information as props; keep each component focused on one job.',
      'Use state only for information that changes because of user interaction.',
      'Add loading, empty, and error states before connecting a real service.',
      'Keep the interface keyboard-accessible and test each control.',
    ],
    code: [
      { code: 'type CardProps = { title: string; note: string };', explanation: 'Describes the data the reusable card must receive.' },
      { code: 'function IdeaCard({ title, note }: CardProps) {', explanation: 'Defines a React component and safely unpacks its typed props.' },
      { code: '  return <article><h2>{title}</h2><p>{note}</p></article>;', explanation: 'Returns semantic JSX and inserts the provided values.' },
      { code: '}', explanation: 'Closes the component function.' },
    ],
    checkpoint: 'Deliverable: a reusable card component and a screen with loading, empty, and error states.',
  },
  {
    id: 'api',
    title: 'SkyTrack · create a backend API',
    track: 'BACKEND · NODE.JS',
    stack: 'Node.js · Express · HTTP · validation',
    goal: 'Build a small server endpoint that returns structured data to a frontend.',
    steps: [
      'Learn the request/response cycle: the browser requests a URL and the server returns a status plus data.',
      'Add a read-only endpoint for sample flight-study cards; do not connect it to live aircraft systems.',
      'Validate user input at the server boundary, even if the browser already checks it.',
      'Return clear status codes and a consistent error shape.',
      'Keep secrets out of source code and use sample data until you have a protected database.',
    ],
    code: [
      { code: 'import express from "express";', explanation: 'Imports the Express web framework from the installed package.' },
      { code: 'const app = express();', explanation: 'Creates the server application that will receive HTTP requests.' },
      { code: 'const studyCards = [{ id: 1, title: "Weather basics" }];', explanation: 'Provides one fictional record so the route can run without a database.' },
      { code: 'app.get("/api/study-cards", (_request, response) => {', explanation: 'Registers a GET route; the underscore marks the unused request parameter.' },
      { code: '  response.status(200).json({ items: studyCards });', explanation: 'Sends a success status and JSON payload to the caller.' },
      { code: '});', explanation: 'Closes the route handler.' },
      { code: 'app.listen(3000, "127.0.0.1");', explanation: 'Starts on port 3000 and binds only to this computer for the beginner exercise.' },
    ],
    checkpoint: 'Deliverable: a local API endpoint with documented success and error responses.',
  },
  {
    id: 'sql',
    title: 'Atelier Cards · store structured data',
    track: 'DATA · SQL',
    stack: 'SQL · PostgreSQL concepts · relationships',
    goal: 'Design a small relational database and query it safely.',
    steps: [
      'Identify entities separately: users, ideas, and tags are not one giant table.',
      'Give each row a primary key and connect related rows with foreign keys.',
      'Write SELECT, INSERT, UPDATE, and DELETE queries against practice data.',
      'Use parameters for values supplied by users; never build a query by joining raw input into SQL.',
      'Sketch an entity-relationship diagram and explain each relationship.',
    ],
    code: [
      { code: 'CREATE TABLE ideas (', explanation: 'Creates a table for idea records.' },
      { code: '  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,', explanation: 'Creates a unique PostgreSQL identifier automatically for each row.' },
      { code: '  title TEXT NOT NULL,', explanation: 'Requires each idea to have a text title.' },
      { code: '  status TEXT NOT NULL', explanation: 'Stores a status; a production schema should also constrain allowed values.' },
      { code: ');', explanation: 'Finishes the table definition.' },
    ],
    checkpoint: 'Deliverable: an ER diagram, a schema, sample records, and four basic queries.',
  },
  {
    id: 'connect',
    title: 'Connect the frontend and backend',
    track: 'FULL STACK',
    stack: 'React · HTTP · API · database',
    goal: 'Trace one feature from a click in the browser all the way to stored data.',
    steps: [
      'Draw the path: form → frontend validation → HTTP request → backend validation → database → response → updated screen.',
      'Show a loading state while the request is in progress.',
      'Show a human-readable error if the server is unavailable or rejects the input.',
      'Never trust the browser to enforce permissions or protect private data; check those on the server.',
      'Test success, invalid input, no results, and server failure.',
    ],
    code: [
      { code: 'const response = await fetch("/api/opportunities");', explanation: 'The browser requests data from the backend route.' },
      { code: 'if (!response.ok) throw new Error("Could not load opportunities");', explanation: 'Turns a non-success HTTP status into an error the UI can handle.' },
      { code: 'const opportunities = await response.json();', explanation: 'Reads and parses the JSON response body.' },
    ],
    checkpoint: 'Deliverable: one feature that works end-to-end with loading, empty, success, and error states.',
  },
  {
    id: 'java',
    title: 'SkyTrack Allocation · learn Java',
    track: 'BACKEND · JAVA',
    stack: 'Java · object-oriented design · domain rules',
    goal: 'Practise representing a business rule with a small, testable Java model.',
    steps: [
      'Model a flight-study session with a title, duration, and completion state.',
      'Keep validation rules near the data they protect.',
      'Write a small method that calculates total completed study time.',
      'Separate the domain model from a future web interface or database.',
      'Compare how Java expresses the same ideas as TypeScript.',
    ],
    code: [
      { code: 'record StudySession(String title, int minutes, boolean complete) {', explanation: 'Declares an immutable Java data record with three typed fields.' },
      { code: '  boolean isValid() {', explanation: 'Starts a method that checks whether this session is usable.' },
      { code: '    return !title.isBlank() && minutes > 0;', explanation: 'Requires a non-empty title and a positive duration.' },
      { code: '  }', explanation: 'Closes the validation method.' },
      { code: '}', explanation: 'Closes the record declaration.' },
    ],
    checkpoint: 'Deliverable: a model class and a short explanation of its fields and validation rule.',
  },
  {
    id: 'python',
    title: 'Practice analytics · use Python',
    track: 'DATA · PYTHON',
    stack: 'Python · collections · simple reporting',
    goal: 'Summarize your own sample practice data without sending it to a service.',
    steps: [
      'Create a few fictional practice-session records.',
      'Use a list of dictionaries to hold the sample data.',
      'Calculate total minutes and average session length.',
      'Handle an empty list so your calculation never divides by zero.',
      'Describe what the numbers do and do not tell you.',
    ],
    code: [
      { code: 'sessions = [{"minutes": 20}, {"minutes": 35}]', explanation: 'Creates two fictional session records in a Python list.' },
      { code: 'total = sum(session["minutes"] for session in sessions)', explanation: 'Adds the minutes from each record using a generator expression.' },
      { code: 'average = total / len(sessions) if sessions else 0', explanation: 'Calculates the average only when data exists; otherwise it returns zero.' },
      { code: 'print(f"Practice minutes: {total}; average: {average}")', explanation: 'Formats and prints a readable summary.' },
    ],
    checkpoint: 'Deliverable: a tiny report and a note on sample size and privacy.',
  },
  {
    id: 'test',
    title: 'Test, document, and ship',
    track: 'QUALITY · DELIVERY',
    stack: 'Testing · Git · documentation · deployment concepts',
    goal: 'Make a project understandable and safer to change.',
    steps: [
      'Write tests for expected behaviour, edge cases, and invalid input.',
      'Use Git status and diffs to understand your changes before saving a commit.',
      'Document setup steps, environment variables, and known limitations.',
      'Use separate development and production configuration; never commit secrets.',
      'Deploy only after checking the build, tests, accessibility, and privacy implications.',
    ],
    code: [
      { code: 'test("only shows available spaces", () => {', explanation: 'Names the behaviour under test so a failure is understandable.' },
      { code: '  expect(filterAvailable(sampleSpaces)).toHaveLength(1);', explanation: 'Checks the result against a small, controlled sample.' },
      { code: '});', explanation: 'Closes the test case.' },
    ],
    checkpoint: 'Deliverable: a README, a few focused tests, and a reviewed change list.',
  },
];

const courseNotes: Record<string, TutorConcept> = {
  brief: {
    label: 'requirements and user stories',
    keyIdeas: ['stakeholder', 'user story', 'acceptance criteria', 'scope'],
    lesson: 'Requirements describe a problem and the conditions a solution must satisfy. A stakeholder is anyone affected by the system. A user story names a user, their goal, and why it matters; acceptance criteria turn that goal into observable checks. Scope separates the first useful release from later ideas, which helps a team estimate, test, and explain its choices.',
    question: 'Write one acceptance criterion for a user who cannot find an available listing.',
  },
  html: {
    label: 'semantic HTML',
    keyIdeas: ['semantic element', 'heading', 'button', 'accessibility'],
    lesson: 'HTML describes the meaning and structure of content. Elements such as main, nav, article, and button communicate purpose to browsers and assistive technology. Headings form an outline; use them in a logical order. A button is for an action, while a link navigates. Clear labels and native controls make a page easier to use with a keyboard.',
    question: 'When would you use a link instead of a button?',
  },
  css: {
    label: 'responsive CSS layout',
    keyIdeas: ['box model', 'grid', 'responsive', 'focus'],
    lesson: 'CSS controls presentation. The box model determines how content, padding, borders, and margins contribute to an element’s size. Grid and Flexbox arrange content relative to available space; responsive designs adapt instead of assuming one screen width. Focus styles reveal keyboard position. Reusable spacing and colour tokens make later changes consistent.',
    question: 'Why is a flexible grid safer than fixed-width columns on a phone?',
  },
  javascript: {
    label: 'JavaScript data and functions',
    keyIdeas: ['array', 'object', 'function', 'filter'],
    lesson: 'JavaScript values can be grouped into arrays and objects. An array holds an ordered collection; an object groups named fields for one item. Functions take inputs, perform a task, and can return a result. Array filter creates a new array containing only items that pass a condition, so the original data remains available.',
    question: 'What should your interface show when filter returns an empty array?',
  },
  typescript: {
    label: 'TypeScript types',
    keyIdeas: ['type', 'union', 'compile', 'runtime'],
    lesson: 'TypeScript checks how values are used while you write code. A type describes the expected shape; a union limits a value to several allowed alternatives. Type annotations are removed during compilation and do not validate untrusted data at runtime, so an API response still needs runtime checks before the application trusts it.',
    question: 'Why does a TypeScript type not replace validation of a server response?',
  },
  react: {
    label: 'React components and state',
    keyIdeas: ['component', 'props', 'state', 'render'],
    lesson: 'A React component is a function that returns UI for its inputs. Props are values supplied by the parent; state is component-owned information that changes over time. When state changes, React renders the component again. Keep components focused, use stable keys for lists, and represent loading, empty, success, and error states explicitly.',
    question: 'Would a selected filter be a prop or state, and why?',
  },
  api: {
    label: 'HTTP APIs',
    keyIdeas: ['request', 'response', 'status code', 'validation'],
    lesson: 'An API is a contract between programs. An HTTP request has a method, URL, headers, and sometimes a body. The server validates input and returns a status code plus a response body, often JSON. A 2xx status indicates success; other status families communicate client or server problems. Never treat browser-side validation as a security boundary.',
    question: 'What should the frontend do when the API returns a non-success status?',
  },
  sql: {
    label: 'relational data and SQL',
    keyIdeas: ['table', 'primary key', 'foreign key', 'query'],
    lesson: 'A relational database stores entities in tables. A primary key identifies one row; a foreign key connects a row to another table and can enforce that relationship. Constraints protect data quality. Queries read or change records. Values from users should be passed as parameters rather than concatenated into SQL text.',
    question: 'How would you connect an idea to the user who created it?',
  },
  connect: {
    label: 'the full-stack request path',
    keyIdeas: ['frontend', 'backend', 'database', 'response'],
    lesson: 'A full-stack feature begins with an interaction in the frontend. The browser sends a request to the backend; the backend checks permissions and validates data before reading or writing a database. It then returns a response that the frontend uses to update the screen. Each boundary can fail, so show loading, empty, success, and error states.',
    question: 'Where should the app check whether a user is allowed to change a record?',
  },
  java: {
    label: 'Java records and validation',
    keyIdeas: ['record', 'field', 'method', 'validation'],
    lesson: 'Java is statically typed and commonly used for object-oriented services. A record is a concise way to model immutable data with named components. Methods express behaviour associated with that model. Validation checks whether input satisfies domain rules; invalid data should be rejected clearly before it reaches later processing.',
    question: 'What should happen if a study session has a blank title?',
  },
  python: {
    label: 'Python collections and summaries',
    keyIdeas: ['list', 'dictionary', 'sum', 'edge case'],
    lesson: 'Python lists hold ordered values and dictionaries map keys to values. A list of dictionaries is useful for small records. A generator expression can transform or select values without writing a manual loop. Before calculating an average, handle the empty-list case to avoid division by zero and misleading output.',
    question: 'What should an average function return when there are no sessions?',
  },
  test: {
    label: 'tests and delivery',
    keyIdeas: ['test case', 'edge case', 'git diff', 'secret'],
    lesson: 'A test case describes a behaviour and verifies the result. Edge cases include empty data, invalid input, and failures. Git status and diff show what changed before a commit. Secrets such as passwords and API keys belong in protected configuration, not source control. A README should let another person run and understand the project.',
    question: 'Name one edge case you would test for an availability filter.',
  },
};

const homeLabSteps = [
  {
    title: '1 · Understand the idea without buying anything',
    tag: 'NO HARDWARE',
    detail: 'A server is a program that waits for requests. Your current computer can run one for practice. Learn the difference between your browser, a server process, a port, and a database using sample data.',
    task: 'Sketch a diagram: browser → local server → sample data. Label what stays on your computer.',
  },
  {
    title: '2 · Make a localhost-only project',
    tag: 'NO HARDWARE',
    detail: 'Build a tiny personal study dashboard and keep it available only on your own computer while learning. A loopback address is intentionally different from exposing a service to the internet.',
    task: 'Add a status page and a short README explaining how to stop the local service.',
  },
  {
    title: '3 · Learn Linux in a disposable environment',
    tag: 'OPTIONAL VM',
    detail: 'When ready, use a virtual machine on your own computer to practise files, users, updates, and service logs. Keep it isolated; do not expose ports or experiment on networks you do not own.',
    task: 'Write down how you would update, restart, and back up a practice service before changing anything.',
  },
  {
    title: '4 · Plan a first Raspberry Pi build',
    tag: 'WHEN YOU HAVE A PI',
    detail: 'Start with the official Raspberry Pi setup guidance and a harmless local project: a private revision dashboard, reading list, or practice timer. No sensor or extra hardware is required for a first web project.',
    task: 'List the board, power supply, storage, cooling needs, and a safe place for backups before purchasing.',
  },
  {
    title: '5 · Keep a home server private and maintainable',
    tag: 'HOME NETWORK',
    detail: 'Use strong unique credentials, updates, least-privilege accounts, backups, and a firewall. Keep the service on your private network; do not configure router port forwarding for this beginner path.',
    task: 'Make a monthly maintenance checklist: updates, backup check, disk space, and service status.',
  },
];

const architecture = [
  ['01', 'FRONTEND', 'Screens, forms, accessibility', 'HTML · CSS · JS · React'],
  ['02', 'BACKEND', 'Rules, validation, API responses', 'Node.js · Java · Python'],
  ['03', 'DATA', 'Tables, relationships, queries', 'SQL · PostgreSQL concepts'],
  ['04', 'QUALITY', 'Tests, documentation, delivery', 'Git · tests · deployment'],
];

export default function CodeRoadmap() {
  const [selectedId, setSelectedId] = useState(projects[0].id);
  const [activeTab, setActiveTab] = useState<'path' | 'homelab'>('path');
  const [doneSteps, setDoneSteps] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [hint, setHint] = useState('');
  const project = projects.find((item) => item.id === selectedId) ?? projects[0];
  const projectDone = doneSteps.filter((id) => id.startsWith(`${project.id}:`) && !id.endsWith(':complete')).length;

  function toggleStep(key: string) {
    setDoneSteps((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  }

  function selectProject(id: string) {
    setSelectedId(id);
    setDraft('');
    setHint('');
  }

  function requestHint() {
    const text = draft.trim();
    if (!text) {
      setHint('Write the part you are stuck on first. This guide works offline and will not send your code anywhere.');
      return;
    }
    const lower = text.toLowerCase();
    if (lower.includes('api') || lower.includes('server') || lower.includes('fetch')) {
      setHint('Trace the request: check the URL, method, server response status, and response body. Then show loading, success, and error states separately.');
    } else if (lower.includes('sql') || lower.includes('table') || lower.includes('database')) {
      setHint('Name the entity first. Give each row a primary key, then describe its relationship to other entities. Use placeholders for user-supplied query values.');
    } else if (lower.includes('css') || lower.includes('layout') || lower.includes('style')) {
      setHint('Start with semantic HTML, then inspect the parent layout. Prefer grid/flex and responsive constraints over fixed pixel positioning.');
    } else {
      setHint('Break the task into input → transformation → output. Describe one expected case and one edge case, then implement the smallest testable step.');
    }
  }

  return (
    <div className="content learning-page code-roadmap">
      <header className="code-hero">
        <div>
          <span className="card-kicker">CANOPY CODE STUDIO · YOUR BBIT SIDEKICK</span>
          <h1>Build ideas into real systems.</h1>
          <p>Start with tiny, interest-led projects and follow each feature from the screen to the server, data, tests, and delivery. Every example line has an explanation.</p>
        </div>
        <div className="code-hero-stats">
          <span><b>{projects.length}</b> guided stages</span>
          <span><b>4</b> system layers</span>
          <span><b>0</b> code sent to AI</span>
        </div>
      </header>

      <div className="code-architecture" aria-label="Full-stack system layers">
        {architecture.map(([number, title, description, stack]) => (
          <article className="architecture-layer" key={title}>
            <span>{number}</span><b>{title}</b><p>{description}</p><small>{stack}</small>
          </article>
        ))}
      </div>

      <div className="code-tabs" role="tablist" aria-label="Code learning sections">
        <button aria-selected={activeTab === 'path'} className={activeTab === 'path' ? 'active' : ''} onClick={() => setActiveTab('path')} role="tab" type="button">LEARNING PATH</button>
        <button aria-selected={activeTab === 'homelab'} className={activeTab === 'homelab' ? 'active' : ''} onClick={() => setActiveTab('homelab')} role="tab" type="button">HOME LAB · START WITHOUT A PI</button>
      </div>

      {activeTab === 'path' ? (
        <div className="code-workbench">
          <aside className="project-index">
            <span className="card-kicker">YOUR BUILD LADDER</span>
            <p>Go in order, or jump to the piece you are curious about.</p>
            {projects.map((item, index) => (
              <button aria-current={item.id === project.id ? 'step' : undefined} className={`project-pick${item.id === project.id ? ' selected' : ''}`} key={item.id} onClick={() => selectProject(item.id)} type="button">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span><small>{item.track}</small><b>{item.title}</b></span>
                {doneSteps.includes(`${item.id}:complete`) && <i aria-label="Completed">✓</i>}
              </button>
            ))}
          </aside>

          <main className="project-lesson">
            <div className="lesson-heading">
              <span className="card-kicker">{project.track}</span>
              <h2>{project.title}</h2>
              <p>{project.goal}</p>
              <div className="lesson-stack">{project.stack}</div>
            </div>

            <section className="lesson-steps">
              <h3>Build it in small steps</h3>
              {project.steps.map((step, index) => {
                const key = `${project.id}:${index}`;
                const checked = doneSteps.includes(key);
                return (
                  <label className={`lesson-step${checked ? ' complete' : ''}`} key={key}>
                    <input checked={checked} onChange={() => toggleStep(key)} type="checkbox" />
                    <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
                    <span>{step}</span>
                  </label>
                );
              })}
            </section>

            <details className="lesson-notes">
              <summary>OPEN FULL LESSON NOTES · KEY IDEAS & CHECK QUESTION</summary>
              <p>{courseNotes[project.id].lesson}</p>
              <p><b>Explain this back:</b> {courseNotes[project.id].question}</p>
              <div>{courseNotes[project.id].keyIdeas.map((idea) => <span key={idea}>{idea}</span>)}</div>
            </details>

            <StudyTutor concept={courseNotes[project.id]} key={project.id} subject="TECH STUDY" />

            <section className="explained-code">
              <div className="explained-code-heading"><div><span className="card-kicker">READ EVERY LINE</span><h3>Starter example</h3></div><span>{projectDone}/{project.steps.length} steps</span></div>
              <div className="explained-code-lines">
                {project.code.map((line, index) => (
                  <div className="explained-code-line" key={`${index}-${line.code}`}>
                    <code><span>{String(index + 1).padStart(2, '0')}</span>{line.code}</code>
                    <p>{line.explanation}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="code-checkpoint">
              <b>YOUR CHECKPOINT</b>
              <p>{project.checkpoint}</p>
              <button className="text-button" onClick={() => toggleStep(`${project.id}:complete`)} type="button">
                {doneSteps.includes(`${project.id}:complete`) ? 'MARK AS IN PROGRESS' : 'MARK THIS STAGE COMPLETE'} <span>→</span>
              </button>
            </section>

            <section className="offline-assist">
              <div><span className="card-kicker">OFFLINE THINKING PROMPT</span><h3>Stuck? Untangle the next step.</h3><p>This is a small rule-based hint, not a connected AI. Your code stays in this browser.</p></div>
              <textarea aria-label="Describe the coding concept you are stuck on" onChange={(event) => setDraft(event.target.value)} placeholder="What are you trying to make, and what is confusing?" value={draft} />
              <button className="text-button" onClick={requestHint} type="button">GET A STUDY HINT <span>→</span></button>
              {hint && <p aria-live="polite" className="assist-hint">{hint}</p>}
            </section>
          </main>
        </div>
      ) : (
        <section className="homelab-page">
          <header className="homelab-intro">
            <span className="card-kicker">NO RASPBERRY PI? NO PROBLEM.</span>
            <h2>Learn home servers one calm step at a time.</h2>
            <p>You can understand the ideas on your current computer. This path stays local and defensive: no scanning networks, no exposing services to the public internet, and no purchase required to begin.</p>
          </header>
          <div className="homelab-steps">
            {homeLabSteps.map((step, index) => {
              const key = `lab:${index}`;
              const checked = doneSteps.includes(key);
              return (
                <article className={`homelab-step${checked ? ' complete' : ''}`} key={key}>
                  <div className="homelab-step-heading"><span className="step-number">{String(index + 1).padStart(2, '0')}</span><span className="card-kicker">{step.tag}</span></div>
                  <h3>{step.title}</h3>
                  <p>{step.detail}</p>
                  <div className="homelab-task"><b>TRY THIS</b><span>{step.task}</span></div>
                  <label className="homelab-check"><input checked={checked} onChange={() => toggleStep(key)} type="checkbox" /> I have tried or planned this step</label>
                </article>
              );
            })}
          </div>
          <aside className="homelab-ideas">
            <span className="card-kicker">WHEN YOU ARE READY FOR A REAL PROJECT</span>
            <h3>Small, useful things you could host privately</h3>
            <ul><li>A revision dashboard for ground-school notes</li><li>A personal reading and project log</li><li>A local practice timer or workout tracker</li><li>A private portfolio preview for your business prototypes</li></ul>
            <p>Start with a local-only version, keep backups, and ask a trusted adult or experienced mentor before changing router or network settings.</p>
          </aside>
        </section>
      )}
    </div>
  );
}

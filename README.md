# CANOPY

CANOPY is a local-first personal learning and planning web app for MAINA. It brings a calendar and study planner together with guided learning, creative practice, career projects, and wellbeing tools.

## Features

- **Planner:** monthly calendar, schedule import, editable event drafts, per-event approval, routines, semester units, and reminders synchronized to approved events. Online classes receive a 3-minute reminder; other events use their displayed lead time.
- **Semester study:** organize up to seven units, attach past papers and notes, select detected questions, and practice teach-back. Unit names can be added to generated study-plan drafts.
- **Learning:** BBIT-oriented Code Lab and home-lab projects, aviation ground-school lessons, a seven-level chess trainer, guitar lessons, and progressive basketball drills.
- **Career and writing:** interactive case studies for six business concepts and a private, offline Substack-style writing studio.
- **Wellbeing and health:** temporary text/voice venting, two independent cycle logs, a manual food log, and paced gym routines.

## Technology

- React 18 and TypeScript
- Vite 5
- Mantine UI and notifications
- `chess.js` for chess rules
- PDF.js and Tesseract.js for in-browser document text extraction and OCR
- Browser `localStorage` for device-local app data

CANOPY is a client-side app; it does not include an application server or account system. It is separate from Fine Chakula.

## Requirements

- Node.js 20 or newer
- npm

## Getting started

```powershell
npm install
npm run dev
```

Vite prints the local development URL in the terminal (normally `http://localhost:5173/`).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server with hot reload. |
| `npm run build` | Run TypeScript project checks and create the production bundle. |
| `npm run preview` | Serve the built `dist/` bundle locally. |

Build and preview:

```powershell
npm run build
npm run preview
```

## Project layout

```text
public/images/       Supplied moodboard, portfolio, aviation, and exercise imagery
src/features/        Feature pages and local document extraction
src/styles/          Global styles
src/App.tsx          App shell and dashboard navigation
src/main.tsx         React entry point and providers
index.html           Vite document entry
vite.config.ts       Vite and React plugin configuration
```

## Data and privacy

App data is stored in this browser on this device; it is not synchronized to a server. Imported documents are read locally. Semester study stores extracted text and file names (up to 30,000 characters per source); original uploads are not retained. Ending a semester removes its units and extracted text but does not remove approved calendar events.

The vent is temporary and browser-only. Voice recording requires microphone permission and HTTPS or localhost. Cycle profiles are not password-protected accounts; only enter or view another person's health information with their consent. Cycle predictions are estimates, not medical advice or contraception.

## Reminder behavior

Reminders are checked against the approved calendar while CANOPY is open, including when another dashboard page is selected. Desktop notifications require browser permission. Audio playback requires a user gesture after opening CANOPY. A closed tab, sleeping device, or blocked notification can delay or prevent an alert; use a dedicated alarm for time-critical reminders.

## Known limitations

- Question detection and teach-back feedback are heuristic, offline keyword checks—not AI-generated teaching, semantic grading, or verified model answers.
- Writing Studio organizes and lightly expands supplied notes using local templates; it does not invent facts or call a generative AI service.
- Food estimates are approximate reference values, not AI meal analysis.
- Scanned-PDF OCR checks up to eight pages and uses the English language model.
- Exercise illustrations are simplified visual aids, not form demonstrations.

Review generated schedule drafts before approving them. Ask a qualified instructor or health professional for advice where appropriate.

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Button, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import StudyTutor, { type TutorConcept } from './StudyTutor';
import ExamSchedulePlan from './ExamSchedulePlan';
import StudyGuideBuilder from './StudyGuideBuilder';
import { strathmoreExamSchedule } from './strathmoreExams';
import { extractDocumentText } from './documentText';

type StudyMaterial = { id: string; fileName: string; text: string; addedAt: string };
type StudyUnit = {
  id: string;
  name: string;
  code?: string;
  examDate?: string;
  examTime?: string;
  group?: string;
  venue?: string;
  lecturer?: string;
  materials: StudyMaterial[];
};
type Semester = { name: string; units: StudyUnit[] };

const storageKey = 'canopy-semester-study-v1';
const maxUnits = 9;
const maxMaterialsPerUnit = 10;
const maxSourceTextLength = 30_000;
const initialSemester: Semester = {
  name: 'DECEMBER 2026 EXAMS',
  units: strathmoreExamSchedule.map((exam) => ({
    ...exam,
    id: `exam-${exam.code.toLowerCase().replaceAll(' ', '-')}`,
    materials: [],
  })),
};
const stopWords = new Set([
  'about', 'after', 'again', 'also', 'among', 'because', 'been', 'before', 'being', 'between', 'could',
  'does', 'each', 'from', 'have', 'into', 'more', 'most', 'other', 'over', 'same', 'should', 'some',
  'such', 'than', 'that', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'those', 'through',
  'under', 'very', 'what', 'when', 'where', 'which', 'while', 'with', 'would', 'your', 'explain',
  'describe', 'discuss', 'define', 'compare', 'evaluate', 'outline', 'identify', 'question', 'answer', 'design',
]);

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isStudyMaterial(value: unknown): value is StudyMaterial {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<StudyMaterial>;
  return typeof item.id === 'string'
    && typeof item.fileName === 'string'
    && typeof item.text === 'string'
    && item.text.length <= maxSourceTextLength
    && typeof item.addedAt === 'string';
}

function isStudyUnit(value: unknown): value is StudyUnit {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<StudyUnit>;
  return typeof item.id === 'string'
    && typeof item.name === 'string'
    && item.name.length > 0
    && item.name.length <= 80
    && (item.code === undefined || typeof item.code === 'string')
    && (item.examDate === undefined || (typeof item.examDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.examDate)))
    && (item.examTime === undefined || typeof item.examTime === 'string')
    && (item.group === undefined || typeof item.group === 'string')
    && (item.venue === undefined || typeof item.venue === 'string')
    && (item.lecturer === undefined || typeof item.lecturer === 'string')
    && Array.isArray(item.materials)
    && item.materials.length <= maxMaterialsPerUnit
    && item.materials.every(isStudyMaterial);
}

function isSemester(value: unknown): value is Semester {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<Semester>;
  return typeof item.name === 'string'
    && item.name.length <= 80
    && Array.isArray(item.units)
    && item.units.length <= maxUnits
    && item.units.every(isStudyUnit);
}

function extractQuestions(text: string) {
  const actionWords = /\b(?:analyse|analyze|assess|calculate|compare|define|describe|differentiate|discuss|distinguish|evaluate|explain|identify|illustrate|justify|list|outline|state|summarise|summarize)\b/i;
  const sentences = text.split(/\r?\n/).flatMap((line) => line.match(/[^.!?]+[.!?]?/g) ?? []);
  const seen = new Set<string>();
  return sentences.map((sentence) => sentence.replace(/^\s*(?:(?:question\s*)?\d{1,2}[.)]|\(?[a-z]\))\s*/i, '').trim())
    .filter((sentence) => sentence.length >= 20 && sentence.length <= 500 && (sentence.includes('?') || actionWords.test(sentence)))
    .filter((sentence) => {
      const key = sentence.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 12);
}

function extractKeyIdeas(text: string) {
  const frequencies = new Map<string, number>();
  const words = text.toLowerCase().match(/[a-z][a-z'-]{3,}/g) ?? [];
  words.forEach((word) => {
    const normalized = word.endsWith('ies')
      ? `${word.slice(0, -3)}y`
      : word.endsWith('s') && !/(?:ss|us|is)$/.test(word) ? word.slice(0, -1) : word;
    if (!stopWords.has(normalized)) frequencies.set(normalized, (frequencies.get(normalized) ?? 0) + 1);
  });
  return Array.from(frequencies.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 8)
    .map(([word]) => word);
}

function makeTutorConcept(unit: StudyUnit, sourceText: string, questions: string[], selectedQuestion: string): TutorConcept {
  const keyIdeas = extractKeyIdeas(sourceText);
  const question = selectedQuestion || questions[0] || `Explain the main ideas from the ${unit.name} material you uploaded.`;
  const excerpt = sourceText.slice(0, 1_200).trim().replace(/[.!?]+$/, '');
  const hasAnswerGuide = unit.materials.some((material) => /answer|solution|mark.?scheme/i.test(material.fileName));
  const answerGuideNote = hasAnswerGuide
    ? 'Use the uploaded answer guide to check accuracy after you have tried the question yourself.'
    : 'No answer guide was identified by filename. Upload your lecturer’s marking scheme or notes for verified solutions.';
  return {
    label: `${unit.name} past-paper questions`,
    keyIdeas: keyIdeas.length ? keyIdeas : [unit.name.toLowerCase()],
    lesson: `Start with the command word in the question, identify exactly what it asks, and plan a short answer using evidence from your course notes. Your uploaded source begins: “${excerpt}”. ${answerGuideNote}`,
    question,
  };
}

export default function SemesterStudy({ onUnitsChange }: { onUnitsChange: (units: string[]) => void }) {
  const [semester, setSemester] = useState<Semester>(initialSemester);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [unitName, setUnitName] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [storageReady, setStorageReady] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [confirmUnitDelete, setConfirmUnitDelete] = useState(false);
  const [confirmSemesterDelete, setConfirmSemesterDelete] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (!isSemester(parsed)) throw new Error('Saved semester data has an unexpected format and was not changed.');
        const migratedUnits = parsed.units.map((unit) => {
          const examDetails = strathmoreExamSchedule.find((exam) => exam.code === unit.code
            || exam.name.toLowerCase() === unit.name.toLowerCase()
            || unit.name.toLowerCase().includes(exam.name.toLowerCase()));
          return examDetails ? { ...examDetails, ...unit } : unit;
        });
        if (parsed.units.length === 0 && parsed.name === 'CURRENT SEMESTER') {
          setSemester(initialSemester);
          setSelectedUnitId(initialSemester.units[0]?.id ?? '');
        } else {
          if (migratedUnits.some((unit) => Boolean(unit.code))) {
            strathmoreExamSchedule.forEach((exam) => {
              if (migratedUnits.length < maxUnits && !migratedUnits.some((unit) => unit.code === exam.code)) {
                migratedUnits.push({
                  ...exam,
                  id: `exam-${exam.code.toLowerCase().replaceAll(' ', '-')}`,
                  materials: [],
                });
              }
            });
          }
          const migratedSemester = { ...parsed, units: migratedUnits };
          setSemester(migratedSemester);
          setSelectedUnitId(migratedSemester.units[0]?.id ?? '');
        }
      }
      setStorageReady(true);
    } catch (error) {
      notifications.show({
        title: 'SEMESTER DATA COULD NOT BE LOADED',
        message: error instanceof Error ? error.message : 'The browser could not access its local storage.',
      });
    }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(semester));
    } catch (error) {
      notifications.show({
        title: 'SEMESTER DATA COULD NOT BE SAVED',
        message: error instanceof Error ? error.message : 'The browser could not save these units and materials.',
      });
    }
  }, [semester, storageReady]);

  useEffect(() => {
    onUnitsChange(semester.units.map((unit) => unit.name));
  }, [onUnitsChange, semester.units]);

  const selectedUnit = semester.units.find((unit) => unit.id === selectedUnitId) ?? semester.units[0];
  const sourceText = useMemo(
    () => selectedUnit?.materials.map((material) => material.text).join('\n\n') ?? '',
    [selectedUnit],
  );
  const questions = useMemo(() => extractQuestions(sourceText), [sourceText]);
  const tutorConcept = useMemo(
    () => selectedUnit ? makeTutorConcept(selectedUnit, sourceText, questions, selectedQuestion) : null,
    [questions, selectedQuestion, selectedUnit, sourceText],
  );

  function addUnit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = unitName.trim();
    if (semester.units.length >= maxUnits) {
      notifications.show({ title: 'NINE UNITS ALREADY ADDED', message: 'Remove a unit before adding another.' });
      return;
    }
    if (name.length < 2) {
      notifications.show({ title: 'ADD A UNIT NAME', message: 'Unit names need at least two characters.' });
      return;
    }
    if (semester.units.some((unit) => unit.name.toLowerCase() === name.toLowerCase())) {
      notifications.show({ title: 'UNIT ALREADY EXISTS', message: 'Each unit in a semester needs a distinct name.' });
      return;
    }
    const unit: StudyUnit = { id: createId(), name, materials: [] };
    setSemester((current) => ({ ...current, units: [...current.units, unit] }));
    setSelectedUnitId(unit.id);
    setSelectedQuestion('');
    setUnitName('');
    setImportStatus('');
  }

  function deleteSelectedUnit() {
    if (!selectedUnit) return;
    const nextUnit = semester.units.find((unit) => unit.id !== selectedUnit.id);
    setSemester((current) => ({ ...current, units: current.units.filter((unit) => unit.id !== selectedUnit.id) }));
    setSelectedUnitId(nextUnit?.id ?? '');
    setConfirmUnitDelete(false);
    setImportStatus('');
  }

  function deleteSemester() {
    setSemester({ name: 'NEW SEMESTER', units: [] });
    setSelectedUnitId('');
    setConfirmSemesterDelete(false);
    setImportStatus('');
  }

  async function handleMaterialFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = '';
    const targetUnitId = selectedUnit?.id;
    if (!targetUnitId) return;
    let remainingSlots = maxMaterialsPerUnit - (selectedUnit?.materials.length ?? 0);

    for (const file of files) {
      if (remainingSlots <= 0) {
        notifications.show({ title: 'SOURCE LIMIT REACHED', message: `Each unit can store up to ${maxMaterialsPerUnit} papers or notes. Remove one to make room.` });
        break;
      }
      if (file.size > 20 * 1024 * 1024) {
        notifications.show({ title: 'FILE TOO LARGE', message: `${file.name} is over 20 MB. Choose a smaller file.` });
        continue;
      }
      try {
        setImportStatus(`Reading ${file.name} locally…`);
        const extracted = await extractDocumentText(file, setImportStatus);
        if (!extracted.trim()) throw new Error(`No readable text was found in ${file.name}.`);
        const wasTruncated = extracted.length > maxSourceTextLength;
        const material: StudyMaterial = {
          id: createId(),
          fileName: file.name,
          text: extracted.slice(0, maxSourceTextLength),
          addedAt: new Date().toISOString(),
        };
        setSemester((current) => ({
          ...current,
          units: current.units.map((unit) => unit.id === targetUnitId
            ? { ...unit, materials: [...unit.materials, material] }
            : unit),
        }));
        remainingSlots -= 1;
        setImportStatus(wasTruncated
          ? `Read ${file.name} on this device. The stored text is limited to ${maxSourceTextLength.toLocaleString()} characters.`
          : `Read ${file.name} on this device. Review the extracted text and detected questions below.`);
      } catch (error) {
        const reason = error instanceof Error ? error.message : 'The file could not be read.';
        setImportStatus(reason);
        notifications.show({ title: `COULD NOT READ ${file.name}`, message: reason });
      }
    }
  }

  function removeMaterial(materialId: string) {
    if (!selectedUnit) return;
    setSemester((current) => ({
      ...current,
      units: current.units.map((unit) => unit.id === selectedUnit.id
        ? { ...unit, materials: unit.materials.filter((material) => material.id !== materialId) }
        : unit),
    }));
  }

  function renameSemester(value: string) {
    setSemester((current) => ({ ...current, name: value.slice(0, 80) }));
  }

  return (
    <section className="semester-study planner-panel">
      <header className="semester-heading">
        <div><span className="card-kicker">TEACH IT BACK · YOUR DECEMBER 2026 EXAMS</span><h2>Nine exams, one study space.</h2></div>
        <span className="semester-unit-count">{semester.units.length}/{maxUnits} UNITS</span>
      </header>
      <p className="semester-intro">The timetable you shared lists nine exams, so they’re preloaded below. Add papers, notes, or mark schemes for source-based guides and worked Q&amp;A; remove any exam that isn’t yours. Unit names also feed the study-plan generator above.</p>
      <div className="semester-management">
        <TextInput aria-label="Semester name" label="SEMESTER" onChange={(event) => renameSemester(event.currentTarget.value)} placeholder="e.g. Semester 1 · 2027" value={semester.name} />
        <form className="semester-add-unit" onSubmit={addUnit}>
          <TextInput aria-label="New unit name" label="ADD A UNIT" onChange={(event) => setUnitName(event.currentTarget.value)} placeholder="e.g. Database Systems" value={unitName} />
          <Button className="secondary-button" disabled={semester.units.length >= maxUnits} type="submit">ADD UNIT</Button>
        </form>
        <Button className="semester-clear-button" disabled={!semester.units.length} onClick={() => setConfirmSemesterDelete(true)} type="button">END SEMESTER · DELETE ALL</Button>
      </div>
      {confirmSemesterDelete && (
        <div aria-label="Confirm end semester" className="semester-confirm" role="group">
          <p>Delete this semester’s units and all extracted paper text? Approved calendar events are not changed.</p>
          <Button className="semester-clear-button" onClick={deleteSemester} type="button">DELETE SEMESTER</Button>
          <button className="text-button" onClick={() => setConfirmSemesterDelete(false)} type="button">CANCEL</button>
        </div>
      )}

      {semester.units.some((unit) => unit.examDate) && <ExamSchedulePlan units={semester.units} />}

      {semester.units.length > 0 ? (
        <>
          <nav aria-label="Semester units" className="semester-unit-tabs">
            {semester.units.map((unit) => (
              <button aria-pressed={selectedUnit?.id === unit.id} className={selectedUnit?.id === unit.id ? 'active' : ''} key={unit.id} onClick={() => { setSelectedUnitId(unit.id); setSelectedQuestion(''); setConfirmUnitDelete(false); setImportStatus(''); }} type="button">
                <b>{unit.code ?? unit.name}</b><small>{unit.name}{unit.examDate ? ` · ${new Date(`${unit.examDate}T12:00:00`).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}` : ''} · {unit.materials.length} SOURCES</small>
              </button>
            ))}
          </nav>
          {selectedUnit && (
            <div className="semester-unit-workspace">
              <div className="semester-unit-heading">
                <div><span className="card-kicker">CURRENT UNIT</span><h3>{selectedUnit.code ? `${selectedUnit.code} · ` : ''}{selectedUnit.name}</h3>{selectedUnit.examDate && <p className="semester-exam-meta">Exam {new Date(`${selectedUnit.examDate}T12:00:00`).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })} · {selectedUnit.examTime} · {selectedUnit.venue}</p>}</div>
                <Button className="semester-clear-button" onClick={() => setConfirmUnitDelete(true)} type="button">DELETE THIS UNIT</Button>
              </div>
              {confirmUnitDelete && (
                <div aria-label={`Confirm deleting ${selectedUnit.name}`} className="semester-confirm" role="group">
                  <p>Delete {selectedUnit.name} and its uploaded material from this device?</p>
                  <Button className="semester-clear-button" onClick={deleteSelectedUnit} type="button">DELETE UNIT</Button>
                  <button className="text-button" onClick={() => setConfirmUnitDelete(false)} type="button">KEEP UNIT</button>
                </div>
              )}
              <label className="semester-file-picker">
                <input accept=".txt,.md,.csv,.pdf,image/*" multiple onChange={handleMaterialFiles} type="file" />
                <span>＋ ADD PAST PAPERS, NOTES OR MARK SCHEMES</span>
                <small>Text, PDF, or image · up to {maxMaterialsPerUnit} sources · 20 MB each · stored text capped at {maxSourceTextLength.toLocaleString()} characters per file</small>
              </label>
              {importStatus && <p aria-live="polite" className="semester-import-status">{importStatus}</p>}

              {selectedUnit.materials.length > 0 ? (
                <>
                  <div className="semester-material-list">
                    {selectedUnit.materials.map((material) => (
                      <details className="semester-material" key={material.id}>
                        <summary><span><b>{material.fileName}</b><small>Added {new Date(material.addedAt).toLocaleDateString()}</small></span></summary>
                        <button aria-label={`Remove ${material.fileName}`} className="text-button semester-remove-material" onClick={() => removeMaterial(material.id)} type="button">REMOVE SOURCE</button>
                        <pre>{material.text}</pre>
                      </details>
                    ))}
                  </div>
                  <section className="semester-questions">
                    <span className="card-kicker">POSSIBLE PAST-PAPER QUESTIONS</span>
                    {questions.length ? (
                      <>
                        <label className="semester-question-select"><span>QUESTION FOR TEACH-BACK</span><select aria-label="Question for teach-back" onChange={(event) => setSelectedQuestion(event.currentTarget.value)} value={selectedQuestion || questions[0]}>{questions.map((question, index) => <option key={`${index}-${question}`} value={question}>QUESTION {index + 1} · {question.slice(0, 90)}</option>)}</select></label>
                        <ol>{questions.map((question, index) => <li key={`${index}-${question}`}>{question}</li>)}</ol>
                      </>
                    ) : <p>No clear question stems were detected. Review the source text and add your lecturer’s notes or answer guide.</p>}
                  </section>
                  {tutorConcept && <StudyTutor concept={tutorConcept} key={`${selectedUnit.id}-${selectedQuestion}-${selectedUnit.materials.map((material) => material.id).join('-')}`} subject="UNIT STUDY" />}
                  <p className="semester-source-note">This offline coach checks for key terms from the uploaded text. It cannot verify a model answer; use your lecturer’s notes or official marking scheme when checking correctness.</p>
                </>
              ) : (
                <div className="semester-empty">
                  <span aria-hidden="true">⌁</span>
                  <h3>Give {selectedUnit.name} its first source.</h3>
                  <p>Upload a past paper, course outline, or notes for a source-based guide. You can still build a provisional starter guide without files.</p>
                </div>
              )}
              {semester.units.map((unit) => <StudyGuideBuilder active={unit.id === selectedUnit.id} key={unit.id} unit={unit} />)}
            </div>
          )}
        </>
      ) : (
        <div className="semester-empty">
          <span aria-hidden="true">07</span>
          <h3>Start with your first unit.</h3>
          <p>Add up to nine unit names for the current semester. You can delete one unit or clear the semester when it ends, then start a fresh set.</p>
        </div>
      )}
      <p className="semester-privacy">Files are read and stored in this browser on this device. Nothing is sent until you tap a guide button; then the selected unit’s extracted text and file names go to Canopy’s server and Vercel AI Gateway. Generated guides stay in this open session—download a Markdown copy to keep one.</p>
    </section>
  );
}

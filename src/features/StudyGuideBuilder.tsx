import { useState } from 'react';
import { Button } from '@mantine/core';
import { strathmorePastPapersUrl } from './strathmoreExams';

type StudyUnitSource = { fileName: string; text: string };
type StudyUnitInput = { code?: string; name: string; examDate?: string; materials: StudyUnitSource[] };
type Topic = { title: string; simpleExplanation: string; workedExample: string; examTip: string };
type PracticeQuestion = { question: string; answer: string; reasoning: string; sourceReference: string };
type StudyGuide = { overview: string; topics: Topic[]; practiceQuestions: PracticeQuestion[]; knowledgeGaps: string[] };

function downloadGuide(unit: StudyUnitInput, guide: StudyGuide) {
  const content = [
    `# ${unit.code ? `${unit.code}: ` : ''}${unit.name}`,
    '',
    `Exam date: ${unit.examDate ?? 'Not listed'}`,
    '',
    '## Start here',
    guide.overview,
    '',
    '## Core topics',
    ...guide.topics.flatMap((topic, index) => [
      `### ${index + 1}. ${topic.title}`,
      topic.simpleExplanation,
      '',
      `**Worked example:** ${topic.workedExample}`,
      '',
      `**Exam tip:** ${topic.examTip}`,
      '',
    ]),
    '## Practice questions and answers',
    ...guide.practiceQuestions.flatMap((item, index) => [
      `### ${index + 1}. ${item.question}`,
      `**Answer:** ${item.answer}`,
      '',
      `**Reasoning:** ${item.reasoning}`,
      '',
      `**Source:** ${item.sourceReference}`,
      '',
    ]),
    '## Check with your course outline',
    ...(guide.knowledgeGaps.length ? guide.knowledgeGaps.map((gap) => `- ${gap}`) : ['- Compare this guide with your official course outline.']),
  ].join('\n');
  const blobUrl = URL.createObjectURL(new Blob([content], { type: 'text/markdown;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = `Canopy-${unit.code ?? unit.name}-study-guide.md`.replace(/[^a-zA-Z0-9.-]+/g, '-');
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1_000);
}

export default function StudyGuideBuilder({ unit, active }: { unit: StudyUnitInput; active: boolean }) {
  const [guide, setGuide] = useState<StudyGuide | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const sourceCharacters = unit.materials.reduce((total, material) => total + material.text.length, 0);

  async function generateGuide() {
    setIsGenerating(true);
    setError('');
    try {
      let remainingCharacters = 210_000;
      const materials = unit.materials.map((material) => {
        const text = material.text.slice(0, remainingCharacters);
        remainingCharacters -= text.length;
        return { fileName: material.fileName, text };
      }).filter((material) => material.text.length > 0);
      const response = await fetch('/api/generate-study-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitCode: unit.code ?? '',
          unitTitle: unit.name,
          examDate: unit.examDate,
          materials,
        }),
      });
      const result = await response.json() as { guide?: StudyGuide; error?: string };
      if (!response.ok || !result.guide) throw new Error(result.error || 'Canopy could not build this study guide. Please try again.');
      setGuide(result.guide);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Canopy could not build this study guide. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section aria-label={`${unit.name} beginner study guide`} className="study-guide-builder" hidden={!active}>
      <header className="study-guide-heading">
        <div><span className="card-kicker">TEACH FROM ZERO · PRACTICE WITH ANSWERS</span><h4>Build a study guide</h4></div>
        {guide && <Button className="study-guide-download" onClick={() => downloadGuide(unit, guide)} type="button" variant="subtle">DOWNLOAD .MD</Button>}
      </header>
      <p className="study-guide-intro">Get plain-language explanations, worked examples, and exam-style Q&amp;A. Uploaded papers and notes ground the guide; without them, it&apos;s a provisional primer, not the official Strathmore syllabus.</p>
      <div className="study-guide-actions">
        <Button className="study-guide-generate" disabled={isGenerating} loading={isGenerating} onClick={generateGuide} type="button">
          {isGenerating ? 'BUILDING YOUR GUIDE…' : unit.materials.length ? 'BUILD SOURCE-BASED GUIDE + Q&A' : 'BUILD STARTER GUIDE + Q&A'}
        </Button>
        <a href={strathmorePastPapersUrl} rel="noreferrer" target="_blank">Open official SU+ BBIT Past Examinations archive</a>
      </div>
      <p className="study-guide-source-note">
        {unit.materials.length
          ? `${unit.materials.length} source${unit.materials.length === 1 ? '' : 's'} ready · ${sourceCharacters.toLocaleString()} extracted characters. ${sourceCharacters > 210_000 ? 'Generation uses the first 210,000 characters across these files.' : 'Only these unit sources are sent when you generate.'}`
          : 'SU+ may require your Strathmore sign-in. Search by course code and year, then upload papers you can access; December 2026 exams have not happened yet.'}
      </p>
      {error && <p aria-live="polite" className="study-guide-error" role="alert">{error}</p>}
      {isGenerating && <p aria-live="polite" className="study-guide-status">Building a beginner guide and worked questions from the selected unit…</p>}
      {guide && (
        <div className="study-guide-result">
          <div className="study-guide-overview"><span className="card-kicker">START HERE</span><p>{guide.overview}</p></div>
          <section className="study-guide-topics">
            <h5>Core ideas, step by step</h5>
            <ol>
              {guide.topics.map((topic, index) => (
                <li className="study-guide-topic" key={`${index}-${topic.title}`}>
                  <h6>{topic.title}</h6>
                  <p>{topic.simpleExplanation}</p>
                  <p><b>Worked example:</b> {topic.workedExample}</p>
                  <p><b>Exam tip:</b> {topic.examTip}</p>
                </li>
              ))}
            </ol>
          </section>
          <section className="study-guide-questions">
            <h5>Practice questions with worked answers</h5>
            <ol>
              {guide.practiceQuestions.map((item, index) => (
                <li key={`${index}-${item.question}`}>
                  <details>
                    <summary><span>Q{index + 1}</span>{item.question}</summary>
                    <div className="study-guide-answer"><p><b>Worked answer</b><br />{item.answer}</p><p><b>Why this works</b><br />{item.reasoning}</p><small>Source: {item.sourceReference}</small></div>
                  </details>
                </li>
              ))}
            </ol>
          </section>
          {guide.knowledgeGaps.length > 0 && (
            <section className="study-guide-gaps"><h5>Check these against your course outline</h5><ul>{guide.knowledgeGaps.map((gap, index) => <li key={`${index}-${gap}`}>{gap}</li>)}</ul></section>
          )}
          <p className="study-guide-disclaimer">Practice questions are paraphrased/generated for revision, not a complete transcript or official answer key. Check important answers against your lecturer&apos;s notes or marking scheme. Download this guide to keep it after closing Canopy.</p>
        </div>
      )}
    </section>
  );
}

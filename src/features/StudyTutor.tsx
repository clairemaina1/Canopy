import { useState, type FormEvent } from 'react';

export type TutorConcept = { label: string; keyIdeas: string[]; lesson: string; question: string };
type TutorReply = { explanation: string; gaps: string[]; covered: string[] };

export default function StudyTutor({ subject, concept }: { subject: string; concept: TutorConcept }) {
  const [recall, setRecall] = useState('');
  const [reply, setReply] = useState<TutorReply | null>(null);

  function submitRecall(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = recall.trim().toLowerCase();
    if (text.length < 20) {
      setReply({
        explanation: 'Add a few sentences from memory so I can check the ideas. It is okay to be unsure—uncertainty helps choose what to review.',
        gaps: concept.keyIdeas,
        covered: [],
      });
      return;
    }
    const covered = concept.keyIdeas.filter((idea) => text.includes(idea.toLowerCase()));
    const gaps = concept.keyIdeas.filter((idea) => !text.includes(idea.toLowerCase()));
    setReply({
      explanation: gaps.length
        ? `You recalled ${covered.length} of ${concept.keyIdeas.length} target ideas. Review the missing ideas below, then explain the topic again in your own words.`
        : 'Your explanation includes the key ideas in this lesson. Try the follow-up question to check whether you can apply them.',
      gaps,
      covered,
    });
  }

  return (
    <section className="study-tutor">
      <div className="study-tutor-heading">
        <div><span className="card-kicker">TEACH IT BACK · PRIVATE STUDY COACH</span><h3>Explain {concept.label} from memory.</h3></div>
        <span className="privacy-chip">ON THIS DEVICE</span>
      </div>
      <p className="study-tutor-intro">Write freely in the blank space. This offline coach checks for key terms, points out missing ideas, and shows the lesson again. It cannot judge meaning like a human teacher.</p>
      <form className="study-tutor-form" onSubmit={submitRecall}>
        <textarea aria-label={`Explain ${concept.label} in your own words`} onChange={(event) => setRecall(event.currentTarget.value)} placeholder={`Without looking at the notes, explain what you remember about ${concept.label}…`} value={recall} />
        <button className="text-button" type="submit">CHECK MY UNDERSTANDING <span>→</span></button>
      </form>
      {reply && (
        <div aria-live="polite" className="study-tutor-reply">
          <b>{subject.toUpperCase()} · FEEDBACK</b>
          <p>{reply.explanation}</p>
          {reply.covered.length > 0 && <p><strong>Ideas you mentioned:</strong> {reply.covered.join(' · ')}</p>}
          {reply.gaps.length > 0 && <p><strong>Revisit:</strong> {reply.gaps.join(' · ')}</p>}
          <div className="study-tutor-lesson"><span className="card-kicker">SHORT RE-TEACH</span><p>{concept.lesson}</p><b>TRY NEXT: {concept.question}</b></div>
        </div>
      )}
    </section>
  );
}

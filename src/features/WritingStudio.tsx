import { useState } from 'react';
import { Button, Textarea, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';

type Voice = 'REFLECTIVE' | 'CONVERSATIONAL' | 'ESSAYISTIC';

const sectionTitles = [
  'The thought I want to follow',
  'What becomes clearer when I look closer',
  'The tension I want to leave room for',
  'Where I find myself landing',
];

const sectionTransitions = [
  'I want to begin with the moment or image behind these notes. That is where a reader can meet me: in the detail that made me stop and pay attention.',
  'The second layer changes the angle. A piece can be more honest when it shows how one idea shifts beside another, rather than pretending everything arrived fully formed.',
  'I can let this tension stay in the draft instead of smoothing it away. Sometimes the space between what I want and what I know is the most interesting part.',
  'This is what I want to carry beyond the page. I can leave a question open and still say something meaningful about why I return to it.',
];

const sectionReflections = [
  'What makes this more than a passing note is the life around it. I want to add the ordinary scene, conversation, or small detail that first made it feel real. That is where the essay can become recognizably mine.',
  'The difference between these thoughts is useful. One can name what I notice while the other reveals what I am still learning; together they give a reader a reason to keep following the idea.',
  'I do not have to resolve every question to write honestly about it. I can say what I believe today, admit what I cannot explain yet, and let that uncertainty be part of the story instead of hiding it.',
  'After following these details, I am left with a more specific view of what matters to me. I can carry that into the next thing I make, read, or notice, without pretending this is the last word.',
];

function splitThoughts(raw: string) {
  const seen = new Set<string>();
  return raw.split(/\r?\n/).flatMap((line) => {
    const cleanLine = line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim();
    return cleanLine.match(/[^.!?]+[.!?]?/g) ?? [];
  }).map((thought) => thought.trim()).filter((thought) => {
    const key = thought.toLowerCase().replace(/[.!?]+$/, '');
    if (thought.length < 8 || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 24);
}

function titleFromThought(thought: string) {
  const words = thought.replace(/[.!?]+$/, '').split(/\s+/);
  const title = words.length > 10 ? `${words.slice(0, 10).join(' ')}…` : words.join(' ');
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function quoteThought(thought: string) {
  return `“${thought.replace(/[.!?]+$/, '')}”`;
}

function articleWordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function buildArticle(thoughts: string[], title: string, throughline: string, voice: Voice) {
  const articleTitle = title.trim() || titleFromThought(throughline || thoughts[0]);
  const topic = throughline.trim() || 'the ideas I keep returning to';
  const openings: Record<Voice, string> = {
    REFLECTIVE: `Some thoughts arrive in no particular order. Mine began as a handful of notes, then slowly gathered around ${topic}. This draft follows that thread without making it neater or more certain than it really is; I want to see what the ideas reveal when I give them room.`,
    CONVERSATIONAL: `I had a few thoughts rattling around and decided to put them somewhere I could see them. Reading the notes together helped me notice ${topic}. So here is the longer version: what I keep thinking about, what I am still figuring out, and why I want to stay with it.`,
    ESSAYISTIC: `A passing thought can be easy to dismiss. These notes kept returning, though, and began to gather around ${topic}. I am treating that recurrence as an invitation: to look carefully, leave room for contradiction, and trace what these ideas mean to me before trying to make them mean something to everyone.`,
  };
  const closings: Record<Voice, string> = {
    REFLECTIVE: 'I do not need to turn this into a final answer. For now, I am glad I followed the thought far enough to see its edges: the parts I can name, the parts I want to question, and the details I still want to bring into the light. That feels like a worthwhile place to pause—and a good place to begin again.',
    CONVERSATIONAL: 'I am leaving this with a little more clarity than I had when I started, even if I do not have everything figured out. Maybe that is enough for one draft. The thoughts are still mine to revisit, add to, and change my mind about—and I would rather keep that honesty than force a perfect ending.',
    ESSAYISTIC: 'The notes remain open, as does the question beneath them. What I have now is not a verdict but a clearer account of where my attention has gone and why. I can return with more examples, more context, and a different point of view. For today, following the thread is enough.',
  };
  const groupCount = Math.min(4, Math.max(3, Math.ceil(thoughts.length / 2)));
  const groupSize = Math.ceil(thoughts.length / groupCount);
  const sections: string[] = [];

  for (let index = 0; index < groupCount; index += 1) {
    const group = thoughts.slice(index * groupSize, (index + 1) * groupSize);
    if (!group.length) continue;
    const transition = sectionTransitions[Math.min(index, sectionTransitions.length - 1)];
    const reflection = sectionReflections[Math.min(index, sectionReflections.length - 1)];
    const pairedThoughts = group.length > 1
      ? ` The next note I want to set beside it is ${quoteThought(group[1])}.`
      : '';
    sections.push(`## ${sectionTitles[index]}\n\nAt the center of this section is ${quoteThought(group[0])}.${pairedThoughts}\n\n${transition} ${reflection}`);
  }

  return [
    `# ${articleTitle}`,
    '',
    `*A personal essay draft about ${topic}.*`,
    '',
    openings[voice],
    '',
    ...sections.flatMap((section) => [section, '']),
    '## A place to pause',
    '',
    closings[voice],
  ].join('\n').trim();
}

export default function WritingStudio() {
  const [thoughtDump, setThoughtDump] = useState('');
  const [title, setTitle] = useState('');
  const [throughline, setThroughline] = useState('');
  const [voice, setVoice] = useState<Voice>('REFLECTIVE');
  const [article, setArticle] = useState('');

  function generateArticle() {
    const thoughts = splitThoughts(thoughtDump);
    if (thoughts.length < 3) {
      notifications.show({
        title: 'ADD A FEW MORE THOUGHTS',
        message: 'A handful of distinct ideas gives the article organizer enough material to build a throughline.',
      });
      return;
    }
    setArticle(buildArticle(thoughts, title, throughline, voice));
  }

  async function copyArticle() {
    try {
      await navigator.clipboard.writeText(article);
      notifications.show({ title: 'ARTICLE COPIED', message: 'Your draft is ready to paste into Substack.' });
    } catch (error) {
      notifications.show({
        title: 'COULD NOT COPY ARTICLE',
        message: error instanceof Error ? error.message : 'Allow clipboard access, then try again.',
      });
    }
  }

  function downloadArticle() {
    try {
      const file = new Blob([article], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      const articleTitle = article.split('\n', 1)[0].replace(/^#\s*/, '');
      const fileName = (title || articleTitle || 'canopy-article').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'canopy-article';
      link.download = `${fileName}.md`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      notifications.show({
        title: 'COULD NOT DOWNLOAD ARTICLE',
        message: error instanceof Error ? error.message : 'Your browser could not create the article file.',
      });
    }
  }

  const wordCount = articleWordCount(article);

  return (
    <div className="content learning-page writing-page">
      <header className="page-heading">
        <div className="eyebrow"><span className="eyebrow-dot" /> SUBSTACK · FROM THOUGHTS TO ESSAY</div>
        <h1>Give your thoughts a place to land.</h1>
        <p>Drop in the loose ideas, questions, and little things you keep noticing. Shape them into a personal essay draft.</p>
      </header>

      <div className="writing-layout">
        <section className="writing-panel">
          <div className="writing-panel-heading">
            <div><span className="card-kicker">01 · THE RAW MATERIAL</span><h2>Start with the unfiltered version.</h2></div>
            <span className="writing-local-chip">PRIVATE · ON THIS DEVICE</span>
          </div>
          <p className="writing-helper">Paste fragments, questions, memories, opinions, or a messy paragraph. Use a new line for separate thoughts. Three or more distinct ideas help create a fuller draft.</p>
          <Textarea
            aria-label="Thought dump"
            className="writing-thoughts"
            minRows={12}
            onChange={(event) => setThoughtDump(event.currentTarget.value)}
            placeholder={'I keep thinking about…\nSomething I love is…\nA question I can’t shake…\nA tiny detail that stayed with me…'}
            value={thoughtDump}
          />
          <div className="writing-options">
            <TextInput aria-label="Working title (optional)" label="WORKING TITLE · OPTIONAL" onChange={(event) => setTitle(event.currentTarget.value)} placeholder="A title will be suggested from your notes" value={title} />
            <TextInput aria-label="What ties these thoughts together? (optional)" label="THE THROUGHLINE · OPTIONAL" onChange={(event) => setThroughline(event.currentTarget.value)} placeholder="e.g. why making things helps me feel grounded" value={throughline} />
            <label className="writing-voice"><span>VOICE</span><select aria-label="Article voice" onChange={(event) => {
              const value = event.currentTarget.value;
              if (value === 'REFLECTIVE' || value === 'CONVERSATIONAL' || value === 'ESSAYISTIC') setVoice(value);
            }} value={voice}><option value="REFLECTIVE">Reflective</option><option value="CONVERSATIONAL">Conversational</option><option value="ESSAYISTIC">Essayistic</option></select></label>
          </div>
          <Button className="form-button writing-generate" onClick={generateArticle} type="button">ORGANIZE INTO AN ARTICLE</Button>
          <p className="writing-privacy">This offline organizer works only with your text. It does not call an AI service, upload, or save your thoughts. It adds structure and transitions, not new facts or experiences—edit the draft and add details in your own voice before publishing.</p>
        </section>

        <section aria-label="Article draft" className="writing-panel writing-output">
          <div className="writing-panel-heading">
            <div><span className="card-kicker">02 · YOUR ARTICLE DRAFT</span><h2>Make it yours before it goes out.</h2></div>
            <span className="writing-word-count">{wordCount ? `${wordCount} WORDS` : 'NO DRAFT YET'}</span>
          </div>
          {article ? (
            <>
              <Textarea aria-label="Editable article draft" className="writing-article" minRows={24} onChange={(event) => setArticle(event.currentTarget.value)} value={article} />
              <div className="writing-actions">
                <Button className="secondary-button" onClick={copyArticle} type="button">COPY FOR SUBSTACK</Button>
                <Button className="secondary-button" onClick={downloadArticle} type="button">DOWNLOAD .MD</Button>
              </div>
            </>
          ) : (
            <div className="writing-empty">
              <span aria-hidden="true">✦</span>
              <h3>Your essay will take shape here.</h3>
              <p>The draft gets a title, an opening, clear sections, and a closing reflection. You can edit the full article here, then copy it or download it as Markdown.</p>
            </div>
          )}
          <p className="writing-editor-note">This is a first draft, not a fact-check or a substitute for your own final edit. Your raw notes and draft stay only in this page until you copy or download them.</p>
        </section>
      </div>
    </div>
  );
}

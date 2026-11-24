import { useState } from 'react';
import { Button, Textarea, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';

type Voice = 'YEARNING' | 'REFLECTIVE' | 'CONVERSATIONAL' | 'ESSAYISTIC';

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

function articleWordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function buildArticle(thoughts: string[], title: string, throughline: string, scene: string, longing: string, voice: Voice) {
  const articleTitle = title.trim() || titleFromThought(throughline || thoughts[0]);
  const openingScene = scene.trim() || thoughts[0];
  const bodyThoughts = scene.trim() ? thoughts : thoughts.slice(1);
  const paragraphCount = Math.min(4, Math.max(1, Math.ceil(bodyThoughts.length / 3)));
  const paragraphSize = Math.ceil(bodyThoughts.length / paragraphCount);
  const paragraphs = Array.from({ length: paragraphCount }, (_, index) =>
    bodyThoughts.slice(index * paragraphSize, (index + 1) * paragraphSize).join(' '),
  ).filter(Boolean);
  const endings: Record<Exclude<Voice, 'YEARNING'>, string> = {
    REFLECTIVE: 'I am still working out what this want asks of me. I can name it more clearly now.',
    CONVERSATIONAL: 'I do not have an answer yet. I just know I needed to say it plainly.',
    ESSAYISTIC: 'The question remains open; I will not pretend the wanting has become an answer.',
  };
  const closing = voice === 'YEARNING' ? longing.trim() : endings[voice];

  return [
    `# ${articleTitle}`,
    throughline.trim() ? `*${throughline.trim()}*` : '',
    '',
    openingScene,
    '',
    ...paragraphs,
    '',
    closing,
  ].filter(Boolean).join('\n\n').trim();
}

export default function WritingStudio() {
  const [thoughtDump, setThoughtDump] = useState('');
  const [scene, setScene] = useState('');
  const [longing, setLonging] = useState('');
  const [title, setTitle] = useState('');
  const [throughline, setThroughline] = useState('');
  const [voice, setVoice] = useState<Voice>('YEARNING');
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
    setArticle(buildArticle(thoughts, title, throughline, scene, longing, voice));
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
        <div className="eyebrow"><span className="eyebrow-dot" /> SUBSTACK · PERSONAL ESSAY STUDIO</div>
        <h1>Start with the detail you can&apos;t forget.</h1>
        <p>Write the moment as you remember it, then the thing you still want. No tidy lesson required.</p>
      </header>

      <div className="writing-layout">
        <section className="writing-panel">
          <div className="writing-panel-heading">
            <div><span className="card-kicker">01 · THE RAW MATERIAL</span><h2>Start where it happened.</h2></div>
            <span className="writing-local-chip">PRIVATE · ON THIS DEVICE</span>
          </div>
          <p className="writing-helper">Write the room, the light, one sound, the object under your hand, the words you couldn&apos;t say. Then add the thoughts you keep circling. Specifics make the ache legible.</p>
          <Textarea
            aria-label="Thought dump"
            className="writing-thoughts"
            minRows={12}
            onChange={(event) => setThoughtDump(event.currentTarget.value)}
            placeholder={'I keep thinking about…\nSomething I love is…\nA question I can’t shake…\nA tiny detail that stayed with me…'}
            value={thoughtDump}
          />
          <div className="writing-details">
            <Textarea
              aria-label="Opening scene or vivid detail"
              className="writing-scene"
              label="OPENING SCENE · A REAL MOMENT"
              minRows={4}
              onChange={(event) => setScene(event.currentTarget.value)}
              placeholder="What was the light doing? What sound did no one else notice? What were you holding? Include the small detail you still remember."
              value={scene}
            />
            <Textarea
              aria-label="The sentence you are still longing to say"
              className="writing-longing"
              label="THE WANTING · IN YOUR OWN WORDS"
              minRows={4}
              onChange={(event) => setLonging(event.currentTarget.value)}
              placeholder="I still wish… / I miss… / I wanted… / I thought I would be over…"
              value={longing}
            />
          </div>
          <div className="writing-options">
            <TextInput aria-label="Working title (optional)" label="WORKING TITLE · OPTIONAL" onChange={(event) => setTitle(event.currentTarget.value)} placeholder="A title will be suggested from your notes" value={title} />
            <TextInput aria-label="What ties these thoughts together? (optional)" label="THE THROUGHLINE · OPTIONAL" onChange={(event) => setThroughline(event.currentTarget.value)} placeholder="e.g. why making things helps me feel grounded" value={throughline} />
            <label className="writing-voice"><span>VOICE</span><select aria-label="Article voice" onChange={(event) => {
              const value = event.currentTarget.value;
              if (value === 'YEARNING' || value === 'REFLECTIVE' || value === 'CONVERSATIONAL' || value === 'ESSAYISTIC') setVoice(value);
            }} value={voice}><option value="YEARNING">Yearning · intimate</option><option value="REFLECTIVE">Reflective</option><option value="CONVERSATIONAL">Conversational</option><option value="ESSAYISTIC">Essayistic</option></select></label>
          </div>
          <Button className="form-button writing-generate" onClick={generateArticle} type="button">ORGANIZE INTO AN ARTICLE</Button>
          <p className="writing-privacy">Your words stay on this device. The organizer keeps your scene and notes intact, adds only light structure, and never invents memories, dialogue, or sensory details. Give the draft your own final rhythm before publishing.</p>
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
              <h3>What did the room look like?</h3>
              <p>Start with a real moment: a detail under your fingers, a sound still in your ear, a sentence you wish you had said. Leave the explanation for later.</p>
            </div>
          )}
          <p className="writing-editor-note">This is a first draft, not a fact-check or a substitute for your own final edit. Your raw notes and draft stay only in this page until you copy or download them.</p>
        </section>
      </div>
    </div>
  );
}

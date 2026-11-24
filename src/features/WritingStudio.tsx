import { useState } from 'react';
import { Button, Textarea, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';

type ArticleLength = 'REFLECTION' | 'ESSAY' | 'GUIDE';

const ARTICLE_LENGTHS: Record<ArticleLength, { min: number; max: number }> = {
  REFLECTION: { min: 500, max: 800 },
  ESSAY: { min: 800, max: 1200 },
  GUIDE: { min: 1200, max: 1800 },
};

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

function buildArticle(rawDraft: string, title: string, throughline: string, scene: string, closingThought: string) {
  const firstThought = splitThoughts(rawDraft)[0];
  const articleTitle = title.trim() || titleFromThought(throughline || firstThought);

  return [
    `# ${articleTitle}`,
    throughline.trim() ? `*${throughline.trim()}*` : '',
    scene.trim(),
    rawDraft.trim(),
    closingThought.trim(),
  ].filter(Boolean).join('\n\n').trim();
}

export default function WritingStudio() {
  const [thoughtDump, setThoughtDump] = useState('');
  const [scene, setScene] = useState('');
  const [closingThought, setClosingThought] = useState('');
  const [title, setTitle] = useState('');
  const [throughline, setThroughline] = useState('');
  const [length, setLength] = useState<ArticleLength>('ESSAY');
  const [article, setArticle] = useState('');

  function generateArticle() {
    const thoughts = splitThoughts(thoughtDump);
    if (thoughts.length < 3) {
      notifications.show({
        title: 'ADD A LITTLE MORE OF YOUR DRAFT',
        message: 'Add at least three distinct thoughts or sentences. A full draft works too.',
      });
      return;
    }
    setArticle(buildArticle(thoughtDump, title, throughline, scene, closingThought));
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
  const targetLength = ARTICLE_LENGTHS[length];

  return (
    <div className="content learning-page writing-page">
      <header className="page-heading">
        <div className="eyebrow"><span className="eyebrow-dot" /> SUBSTACK · PERSONAL ESSAY STUDIO</div>
        <h1>Write it the way you would tell it.</h1>
        <p>A love letter, a reflection, or a full guide can all start with your actual thought. This tool keeps your words yours.</p>
      </header>

      <div className="writing-layout">
        <section className="writing-panel">
          <div className="writing-panel-heading">
            <div><span className="card-kicker">01 · THE RAW MATERIAL</span><h2>Put down the whole thought.</h2></div>
            <span className="writing-local-chip">PRIVATE · ON THIS DEVICE</span>
          </div>
          <p className="writing-helper">Be direct, tender, funny, and firm where it feels true. Keep your English/Swahili/Sheng code-switching, slang, caps, side comments, repetition, and emojis. Specific moments and honest opinions are the point; no generic lesson needed.</p>
          <Textarea
            aria-label="Your article notes and draft"
            className="writing-thoughts"
            minRows={12}
            onChange={(event) => setThoughtDump(event.currentTarget.value)}
            placeholder={'Write the full thought, not just bullet points. Keep your paragraph breaks, headings, exact phrasing, code-switching, and emojis. A rough draft is welcome.'}
            value={thoughtDump}
          />
          <div className="writing-details">
            <Textarea
              aria-label="Opening moment or detail (optional)"
              className="writing-scene"
              label="OPENING MOMENT · OPTIONAL"
              minRows={4}
              onChange={(event) => setScene(event.currentTarget.value)}
              placeholder="A specific moment or detail you might want to open with. Leave this blank if your piece starts with an opinion."
              value={scene}
            />
            <Textarea
              aria-label="Closing thought (optional)"
              className="writing-longing"
              label="CLOSING THOUGHT · OPTIONAL"
              minRows={4}
              onChange={(event) => setClosingThought(event.currentTarget.value)}
              placeholder="Your final thought, exactly how you want to say it. Leave it blank if the draft already has its ending."
              value={closingThought}
            />
          </div>
          <div className="writing-options">
            <TextInput aria-label="Working title (optional)" label="WORKING TITLE · OPTIONAL" onChange={(event) => setTitle(event.currentTarget.value)} placeholder="A title will be suggested from your notes" value={title} />
            <TextInput aria-label="What ties these thoughts together? (optional)" label="THE THROUGHLINE · OPTIONAL" onChange={(event) => setThroughline(event.currentTarget.value)} placeholder="e.g. why making things helps me feel grounded" value={throughline} />
            <label className="writing-length"><span>TARGET LENGTH</span><select aria-label="Target article length" onChange={(event) => {
              const value = event.currentTarget.value;
              if (value === 'REFLECTION' || value === 'ESSAY' || value === 'GUIDE') setLength(value);
            }} value={length}><option value="REFLECTION">Short reflection · 500–800 words</option><option value="ESSAY">Full essay · 800–1,200 words</option><option value="GUIDE">Long guide · 1,200–1,800 words</option></select></label>
          </div>
          <Button className="form-button writing-generate" onClick={generateArticle} type="button">ORGANIZE INTO AN ARTICLE</Button>
          <p className="writing-privacy">Everything stays on this device. Your notes and paragraphs stay in your wording, including their code-switching and punctuation; the organizer only places your title, optional opening, draft, and closing thought in order. It never translates, pads, or invents lines.</p>
        </section>

        <section aria-label="Article draft" className="writing-panel writing-output">
          <div className="writing-panel-heading">
            <div><span className="card-kicker">02 · YOUR ARTICLE DRAFT</span><h2>Make it yours before it goes out.</h2></div>
            <span aria-live="polite" className="writing-word-count">{wordCount ? `${wordCount.toLocaleString()} / ${targetLength.min.toLocaleString()}–${targetLength.max.toLocaleString()} WORDS` : `AIM ${targetLength.min.toLocaleString()}–${targetLength.max.toLocaleString()} WORDS`}</span>
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
              <h3>What do you keep coming back to?</h3>
              <p>Start with a memory, a strong opinion, a question, or a sentence you wish you had said. Paste a full rough draft if it is already taking shape.</p>
            </div>
          )}
          <p className="writing-editor-note">Edit the organized draft right here before copying or downloading. The target length is a guide, not a rule, and the draft will never add a lesson or tidy away your voice.</p>
        </section>
      </div>
    </div>
  );
}

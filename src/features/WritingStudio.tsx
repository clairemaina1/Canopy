import { useState } from 'react';
import { Button, Textarea, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';

type ArticleLength = 'REFLECTION' | 'ESSAY' | 'GUIDE';

const ARTICLE_LENGTHS: Record<ArticleLength, { min: number; max: number }> = {
  REFLECTION: { min: 500, max: 800 },
  ESSAY: { min: 800, max: 1200 },
  GUIDE: { min: 1200, max: 1800 },
};

function articleWordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export default function WritingStudio() {
  const [thoughtDump, setThoughtDump] = useState('');
  const [scene, setScene] = useState('');
  const [closingThought, setClosingThought] = useState('');
  const [title, setTitle] = useState('');
  const [throughline, setThroughline] = useState('');
  const [length, setLength] = useState<ArticleLength>('ESSAY');
  const [article, setArticle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  async function generateArticle() {
    if (thoughtDump.trim().length < 30) {
      notifications.show({
        title: 'ADD A LITTLE MORE SOURCE MATERIAL',
        message: 'Give Canopy a few real thoughts, a rough paragraph, or a full draft to build from.',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/write-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: thoughtDump, scene, closingThought, title, throughline, length }),
      });
      const result: unknown = await response.json();
      if (!result || typeof result !== 'object') throw new Error('Canopy could not read the writing response. Please try again.');
      const payload = result as { text?: unknown; error?: unknown };
      if (!response.ok || typeof payload.text !== 'string') {
        throw new Error(typeof payload.error === 'string' ? payload.error : 'Canopy could not expand this draft. Please try again.');
      }
      setArticle(payload.text);
      notifications.show({ title: 'YOUR FIRST DRAFT IS READY', message: 'Canopy added depth and structure while keeping your voice in the room.' });
    } catch (error) {
      notifications.show({
        title: 'COULD NOT EXPAND YOUR DRAFT',
        message: error instanceof Error ? error.message : 'Check your connection and try again.',
      });
    } finally {
      setIsGenerating(false);
    }
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
        <h1>Your voice, with more room to breathe.</h1>
        <p>Bring the raw thought. Canopy will give it shape, depth, and sharper language without sanding off your lingo, humor, emojis, or human touch.</p>
      </header>

      <div className="writing-layout">
        <section className="writing-panel">
          <div className="writing-panel-heading">
            <div><span className="card-kicker">01 · THE RAW MATERIAL</span><h2>Put down the whole thought.</h2></div>
            <span className="writing-local-chip">AI-ASSISTED · SENT ON REQUEST</span>
          </div>
          <p className="writing-helper">Be direct, tender, funny, or firm where it feels true. Keep your English/Swahili/Sheng code-switching, slang, caps, side comments, repetition, and emojis. Canopy should add thought and useful vocabulary—not flatten your style or invent a generic lesson.</p>
          <Textarea
            aria-label="Your article notes and draft"
            className="writing-thoughts"
            minRows={12}
            onChange={(event) => setThoughtDump(event.currentTarget.value)}
            placeholder={'Drop the full messy thought: bullet points, paragraph breaks, exact phrases, Sheng/Swahili, side comments, and emojis. Canopy will build it out without inventing your life for you.'}
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
          <Button className="form-button writing-generate" loading={isGenerating} onClick={generateArticle} type="button">{isGenerating ? 'BUILDING YOUR DRAFT…' : 'ADD DEPTH IN MY VOICE'}</Button>
          <p className="writing-privacy">When you choose to generate, your notes are sent to Vercel AI Gateway for drafting. Canopy does not save them to a server; the draft stays editable in this browser. Review added details before sharing—AI can make mistakes.</p>
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
              <p>Start with a memory, a strong opinion, a question, or a sentence you wish you had said. Canopy will add shape and substance while keeping your language and point of view intact.</p>
            </div>
          )}
          <p className="writing-editor-note">Edit the expanded draft here before copying or downloading. The target length is a guide, not a rule. Canopy develops your ideas, but the final voice and every factual detail are yours to approve.</p>
        </section>
      </div>
    </div>
  );
}

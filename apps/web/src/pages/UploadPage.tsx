import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { PageHead } from '../ui/PageHead';
import { Drop } from '../ui/Drop';
import { Scan } from '../ui/Scan';
import { Btn } from '../ui/Btn';
import { Icon } from '../ui/Icon';
import { useUploadCv, useCvAnalysis } from '../hooks/useCvAnalysis';
import { useProfile } from '../hooks/useProfile';
import { useRoadmapView } from '../hooks/useRoadmapView';
import { useToggleTask } from '../hooks/useRoadmap';
import { useUcai } from '../stores/ucai';
import { analyseText } from '../lib/cv-analyser';
import { readCV, READ_ERRORS, withTimeout } from '../lib/read-cv';
import { normalizeIndustry } from '../lib/industry';
import { toast } from '../lib/toast';
import { reducedMotion } from '../lib/fx';
import { wordCount } from '../lib/dates';

type Scanning = { name: string; kind: 'api'; id: string } | { name: string; kind: 'local'; text: string; src: 'docx' | 'txt' | 'paste' } | null;

export function UploadPage() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const upload = useUploadCv();
  const toggle = useToggleTask();
  const { data: profile } = useProfile();
  const { tasks } = useRoadmapView();
  const patch = useUcai((s) => s.patch);
  const [scanning, setScanning] = useState<Scanning>(null);
  const [paste, setPaste] = useState('');
  const scanRef = useRef<HTMLDivElement>(null);
  const pasteRef = useRef<HTMLTextAreaElement>(null);
  const { data: analysis } = useCvAnalysis(scanning?.kind === 'api' ? scanning.id : null);
  const apiReady = scanning?.kind === 'api' ? analysis?.status === 'completed' : true;

  useEffect(() => {
    if (scanning) scanRef.current?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
  }, [scanning]);

  const giveUp = (msg: string) => {
    setScanning(null);
    toast(msg);
    pasteRef.current?.focus();
    pasteRef.current?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
  };

  const onFile = async (file: File) => {
    const name = file.name || 'your CV';
    if (/\.pdf$/i.test(name) || file.type === 'application/pdf') {
      try {
        const r = await upload.mutateAsync({ file, targetIndustry: normalizeIndustry(profile?.targetIndustry), fieldOfStudy: profile?.fieldOfStudy ?? '' });
        patch({ cvAnalysisId: r.id, cvFile: name, cvAcks: [] });
        qc.removeQueries({ queryKey: ['cv-analysis', r.id] });
        setScanning({ name, kind: 'api', id: r.id });
      } catch (e) {
        giveUp((e as Error).message || READ_ERRORS.unknown);
      }
      return;
    }
    try {
      const { text, src } = await withTimeout(readCV(file), 15000);
      if (text.trim().length < 40) { giveUp('That file had almost no text in it. Paste your CV text below instead.'); return; }
      setScanning({ name, kind: 'local', text, src });
    } catch (e) {
      giveUp(READ_ERRORS[(e as Error).message] ?? READ_ERRORS.unknown);
    }
  };

  const onPaste = () => {
    const text = paste.trim();
    if (wordCount(text) < 60) { toast('Paste a bit more — at least the profile and your experience.'); pasteRef.current?.focus(); return; }
    setScanning({ name: 'pasted text', kind: 'local', text, src: 'paste' });
  };

  const onDone = useCallback(() => {
    if (!scanning) return;
    if (scanning.kind === 'local') {
      const cv = analyseText(scanning.text, scanning.src);
      if (cv.words < 60) { giveUp('That looks too short to be a CV. Paste the whole thing.'); return; }
      patch({ cv, wc: { swaps: {}, cut: [], spell: [] } });
      toast(`Read ${cv.words} words · ${cv.weak.length + cv.cuts.length + cv.usedUS.length} things to look at`);
      nav('/wordcheck');
      return;
    }
    if (analysis?.extractedText) patch({ cv: analyseText(analysis.extractedText, 'pdf'), wc: { swaps: {}, cut: [], spell: [] } });
    qc.invalidateQueries({ queryKey: ['score'] });
    qc.invalidateQueries({ queryKey: ['score-history'] });
    const t = tasks.find((x) => !x.done && /upload/i.test(x.name) && /\bcv\b/i.test(x.name));
    if (t) { toggle.mutate(t.id); useUcai.getState().markDayDone(); }
    toast('Analysis ready · one fix to start with', { key: 'cv-ready' });
    nav('/feedback');
  }, [scanning, analysis, patch, nav, qc, tasks, toggle]);

  return (
    <>
      <PageHead eyebrow="Your CV" title="Upload your CV" lede="We read it the way a UK recruiter and an applicant tracking system would, then give you one thing to fix first." />
      <Drop accept=".pdf,.docx,.txt,.md" onFile={onFile}>
        <h2 className="h2">Drop your CV here, or browse</h2>
        <p className="muted" style={{ margin: '6px 0 0' }}>PDF for full AI feedback · Word (.docx) or plain text for Word check, read in your browser</p>
      </Drop>
      {scanning && (
        <div className="card" style={{ marginTop: 18 }} ref={scanRef}>
          <Scan name={scanning.name} ready={apiReady} onDone={onDone} />
        </div>
      )}
      <section className="card" style={{ marginTop: 18 }}>
        <div className="card-head" style={{ marginBottom: 8 }}><h2 className="h3">Or paste your CV text</h2><span className="small muted">Works with any file, including PDF</span></div>
        <p className="small muted" style={{ margin: '0 0 12px' }}>Open your CV, select all, copy, and paste it here. Nothing leaves your browser; this feeds Word check.</p>
        <textarea ref={pasteRef} rows={6} placeholder="Paste the text of your CV…" aria-label="Paste your CV text" value={paste} onChange={(e) => setPaste(e.target.value)} />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
          <Btn variant="primary" onClick={onPaste}><Icon name="check" />Analyse this text</Btn>
          <Btn variant="ghost" to="/feedback">See my last feedback</Btn>
        </div>
      </section>
      <div className="tips">
        <div className="card"><p className="eyebrow">UK convention</p><h3 className="h3">Leave out photo and date of birth</h3><p className="muted small" style={{ margin: '6px 0 0' }}>UK employers don’t expect them, and some screen them out to avoid bias.</p></div>
        <div className="card"><p className="eyebrow">Length</p><h3 className="h3">Two pages is the ceiling</h3><p className="muted small" style={{ margin: '6px 0 0' }}>For graduate roles, one strong page often beats two thin ones.</p></div>
        <div className="card"><p className="eyebrow">ATS</p><h3 className="h3">Keep it machine-readable</h3><p className="muted small" style={{ margin: '6px 0 0' }}>Standard fonts, no text inside images, skills as plain text.</p></div>
      </div>
    </>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { readCourseDraft, saveCourseDraft, clearCourseDraft, getLocalCourseProgress } from '@/lib/course-progress';
import { captureDeviceScope } from '@/lib/device-privacy';
interface Reflection { text?: string; wordCount?: number; practice?: { date: string; note: string } }
interface Props {
  content: { prompt: string; placeholder?: string; minWords?: number };
  activityId?: string;
  initialResponse?: Reflection;
  onComplete: (response: Reflection) => unknown | Promise<unknown>;
}
export default function OpenResponse({ content, activityId, initialResponse, onComplete }: Props) {
  const scope = useRef(captureDeviceScope());
  const stored = initialResponse ?? (activityId ? getLocalCourseProgress().find(r => r.activity_id === activityId)?.response as Reflection | undefined : undefined);
  const [text, setText] = useState(() => (activityId ? readCourseDraft(activityId) : undefined) ?? stored?.text ?? '');
  const [submitted, setSubmitted] = useState(() => !!stored?.text && (!activityId || readCourseDraft(activityId) === undefined));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [practiceNote, setPracticeNote] = useState(stored?.practice?.note ?? '');
  const [practice, setPractice] = useState(stored?.practice);
  const dirty = useRef(false);
  useEffect(() => {
    if (!dirty.current && initialResponse?.text && (!activityId || readCourseDraft(activityId) === undefined)) {
      setText(initialResponse.text); setSubmitted(true); setPractice(initialResponse.practice); setPracticeNote(initialResponse.practice?.note ?? '');
    }
  }, [initialResponse, activityId]);
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const ready = wordCount >= (content.minWords ?? 10);
  const save = async (followup = practice) => {
    if (!scope.current.valid()) return;
    setBusy(true); setError('');
    try {
      const result = await onComplete({ text, wordCount, ...(followup ? { practice: followup } : {}) });
      if (!scope.current.valid()) return;
      if (result === false) throw new Error('Could not save. Please try again.');
      if (activityId) clearCourseDraft(activityId);
      dirty.current = false; setSubmitted(true); setPractice(followup);
    } catch { if (scope.current.valid()) setError('Could not save. Keep this page open and try again.'); }
    finally { if (scope.current.valid()) setBusy(false); }
  };
  return <div className="space-y-4">
    <label htmlFor={`reflection-${activityId ?? 'text'}`} className="block text-sm leading-relaxed">{content.prompt}</label>
    <Textarea id={`reflection-${activityId ?? 'text'}`} value={text} disabled={submitted || busy} rows={6} placeholder={content.placeholder || 'Write your thoughts…'} onChange={e => {
      const value = e.target.value; dirty.current = true; setText(value);
      if (activityId && scope.current.valid()) {
        try { saveCourseDraft(activityId, value); setError(''); } catch { setError('Draft could not be saved on this device. Keep this page open.'); }
      }
    }} />
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {!submitted ? <div className="flex items-center justify-between gap-3"><p className="text-xs text-muted-foreground">{wordCount} / {content.minWords ?? 10} words minimum{activityId && !error ? ' · Draft kept on this device' : ''}</p><button disabled={!ready || busy} onClick={() => void save()} className="min-h-[44px] px-4 rounded-xl bg-primary text-primary-foreground disabled:opacity-40">{busy ? 'Saving…' : 'Save reflection'}</button></div>
    : <><p role="status" className="text-sm text-primary">Reflection saved. You can return to it in this lesson.</p><button className="min-h-[44px] px-4 border border-border rounded-xl" onClick={() => { dirty.current = true; setSubmitted(false); }}>Edit reflection</button>
      <div className="space-y-2 border-t border-border pt-4"><label htmlFor={`practice-${activityId ?? 'text'}`} className="block text-sm">After trying this in daily life, what happened?</label>
      {practice && <p className="text-xs text-muted-foreground">Last practice recorded: {new Date(practice.date).toLocaleDateString()}</p>}
      <Textarea id={`practice-${activityId ?? 'text'}`} value={practiceNote} onChange={e => setPracticeNote(e.target.value)} placeholder="What worked? What would you change?" />
      <button disabled={!practiceNote.trim() || busy} className="min-h-[44px] px-4 rounded-xl border border-border disabled:opacity-40" onClick={() => void save({ date: new Date().toISOString(), note: practiceNote.trim() })}>Save practice check-in</button></div></>}
  </div>;
}

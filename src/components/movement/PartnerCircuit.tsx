import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, Footprints, Play, RotateCcw } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useMultiHeartRate } from '@/hooks/useMultiHeartRate';
import { supabase } from '@/integrations/supabase/client';
import { toLocalDateStr } from '@/lib/local-date';
import { getUserAge } from '@/data/workouts';
import { PARTNER_PROGRAM, getPartnerSession, type PartnerSession, type StationBlock } from '@/data/partner-program';
import {
  PARTNER_NOTES_PREFIX, PARTNER_PROGRESS_EVENT, addSessionLog, buildWorkoutLogRow, getLegacyPartnerHistory, getNextSessionId,
  getPartnerProgress, getPartnerSettings, parsePartnerNotes, savePartnerProgress, savePartnerSettings, totalTurns,
  type LegacyPartnerSession, type PartnerProgress, type PartnerSessionLog, type PartnerSettings, type PartnerSlot, type PartnerTurnRecord,
} from '@/lib/partner-progress';
import ClassMode from './partner/ClassMode';
import { PreviewTile } from './partner/StationTile';
import ProgramGrid from './partner/ProgramGrid';
import PartnerHistory from './partner/PartnerHistory';
import { buildPrefill, createActiveClass, hrSummary, restoreActiveClass, type ActiveClass } from './partner/class-engine';
import { unlockClassAudio } from './partner/class-sound';

const classKey = (userId?: string) => `signal_partner_class_v1:${userId ?? 'guest'}`;
const BLOCKS: StationBlock[] = ['Strength', 'Reformer', 'Core'];

export default function PartnerCircuit() {
  const { user } = useAuth();
  return <Hub key={user?.id ?? 'guest'} user={user} />;
}

function firstName(value?: string | null) {
  return value?.trim().split(/\s+/)[0] || '';
}

function ageFromDob(dob?: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) age--;
  return age > 10 && age < 100 ? age : null;
}

function readActive(userId?: string): ActiveClass | null {
  try {
    const raw = localStorage.getItem(classKey(userId));
    return raw ? restoreActiveClass(JSON.parse(raw), id => !!getPartnerSession(id)) : null;
  } catch {
    return null;
  }
}

function Hub({ user }: { user: User | null }) {
  const userId = user?.id;
  const { displayName, dateOfBirth } = useProfile();
  const hr = useMultiHeartRate();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const pushedClass = useRef(false);

  const [progress, setProgress] = useState<PartnerProgress>(() => getPartnerProgress(userId));
  const [settings, setSettings] = useState<PartnerSettings>(() => getPartnerSettings(userId));
  const [active, setActiveState] = useState<ActiveClass | null>(() => readActive(userId));
  const [legacy, setLegacy] = useState<LegacyPartnerSession[]>(() => getLegacyPartnerHistory(userId));
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const syncLock = useRef(false);

  // Names + ages: partner A defaults to the member's first name and profile age.
  const defaultA = firstName(displayName) || firstName(user?.user_metadata?.full_name as string | undefined) || 'Partner A';
  const names: Record<PartnerSlot, string> = { A: settings.A.name.trim() || defaultA, B: settings.B.name.trim() || 'Partner B' };
  const profileAge = ageFromDob(dateOfBirth) ?? getUserAge();
  const effectiveSettings: PartnerSettings = { ...settings, A: { ...settings.A, name: names.A, age: settings.A.age ?? profileAge }, B: { ...settings.B, name: names.B } };

  const updateSettings = (patch: (prev: PartnerSettings) => PartnerSettings) => setSettings(prev => {
    const next = patch(prev);
    savePartnerSettings(next, userId);
    return next;
  });

  // Persist the class in progress on every change (it is restored paused).
  const setActive = useCallback((next: ActiveClass | null | ((prev: ActiveClass) => ActiveClass)) => {
    setActiveState(prev => {
      const value = typeof next === 'function' ? (prev ? next(prev) : prev) : next;
      try {
        if (value) localStorage.setItem(classKey(userId), JSON.stringify(value));
        else localStorage.removeItem(classKey(userId));
      } catch { /* storage full or private mode — the class still runs */ }
      return value;
    });
  }, [userId]);
  const onClassChange = useCallback((next: ActiveClass | ((prev: ActiveClass) => ActiveClass)) => setActive(next), [setActive]);

  useEffect(() => {
    const reload = () => setProgress(getPartnerProgress(userId));
    window.addEventListener(PARTNER_PROGRESS_EVENT, reload);
    return () => window.removeEventListener(PARTNER_PROGRESS_EVENT, reload);
  }, [userId]);

  const commitProgress = useCallback((next: PartnerProgress) => {
    setProgress(next);
    if (!savePartnerProgress(next, userId)) toast.error('Device storage is unavailable. Keep this page open until the session is saved.');
  }, [userId]);

  // Older logs (legacy rotation) still feed load prefill by exercise name.
  const history = useMemo(() => {
    const old = legacy.map(s => ({ date: s.date, records: s.records as unknown as PartnerTurnRecord[] }));
    return [...old, ...progress.logs].sort((a, b) => a.date.localeCompare(b.date)) as PartnerSessionLog[];
  }, [legacy, progress.logs]);

  const nextId = getNextSessionId(progress);
  const paramSession = params.get('session');
  const selected: PartnerSession | undefined = (paramSession && getPartnerSession(paramSession)) || (nextId ? getPartnerSession(nextId) : undefined) || PARTNER_PROGRAM.sessions[0];
  const activeSession = active ? getPartnerSession(active.sessionId) : undefined;
  const classOpen = params.get('class') === '1' && !!active && !!activeSession;

  const selectSession = (id: string) => setParams(prev => { const p = new URLSearchParams(prev); p.set('session', id); return p; }, { replace: true });
  const clearSelection = () => setParams(prev => { const p = new URLSearchParams(prev); p.delete('session'); return p; }, { replace: true });
  const openClass = () => {
    if (params.get('class') === '1') return;
    pushedClass.current = true;
    setParams(prev => { const p = new URLSearchParams(prev); p.set('class', '1'); return p; });
  };
  const closeClass = useCallback((dropSession = false) => {
    if (pushedClass.current && !dropSession) { pushedClass.current = false; navigate(-1); return; }
    pushedClass.current = false;
    setParams(prev => { const p = new URLSearchParams(prev); p.delete('class'); if (dropSession) p.delete('session'); return p; }, { replace: true });
  }, [navigate, setParams]);

  // A stale ?class=1 with nothing to resume is dropped.
  useEffect(() => {
    if (params.get('class') === '1' && !active) setParams(prev => { const p = new URLSearchParams(prev); p.delete('class'); return p; }, { replace: true });
  }, [params, active, setParams]);

  // Cloud history (signed in): restore programme sessions and earlier circuits from workout_logs.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    void (async () => {
      const { data, error } = await supabase.from('workout_logs').select('id, session_date, duration_minutes, notes, exercises')
        .eq('user_id', userId).eq('completed', true).like('notes', `${PARTNER_NOTES_PREFIX}%`).order('session_date', { ascending: true });
      if (error || cancelled || !data) return;
      const restored: PartnerSessionLog[] = [];
      const oldRows: LegacyPartnerSession[] = [];
      for (const row of data) {
        if (!Array.isArray(row.exercises)) continue;
        const records = row.exercises as unknown as PartnerTurnRecord[];
        const sid = parsePartnerNotes(row.notes) ?? records.find(r => r?.session_id)?.session_id ?? null;
        const session = sid ? getPartnerSession(sid) : undefined;
        if (session) {
          const nameOf = (slot: PartnerSlot) => records.find(r => r.partner === slot && r.partnerName)?.partnerName ?? `Partner ${slot}`;
          restored.push({ id: row.id, sessionId: session.id, title: session.title, date: row.session_date, elapsed: (row.duration_minutes ?? 0) * 60, mode: 'pace', partners: { A: nameOf('A'), B: nameOf('B') }, records, turnsPlanned: totalTurns(session.stations.length, session.rounds), synced: true });
        } else {
          const planId = ['lower-strength', 'upper-strength', 'lower-pump', 'upper-pump'].find(id => row.notes?.toLowerCase().includes(id.replace('-', ' body · ')));
          oldRows.push({ id: row.id, planId: planId ?? (row.notes ?? '').replace(PARTNER_NOTES_PREFIX, ''), date: row.session_date, elapsed: (row.duration_minutes ?? 0) * 60, records: records as unknown as LegacyPartnerSession['records'], synced: true });
        }
      }
      if (restored.length) {
        setProgress(prev => {
          let next = prev;
          for (const log of restored) {
            if (next.logs.some(l => l.id === log.id)) continue;
            next = addSessionLog(next, log, !next.completed[log.sessionId]);
          }
          if (next !== prev) savePartnerProgress(next, userId);
          return next;
        });
      }
      if (oldRows.length) setLegacy(prev => {
        const merged = new Map(prev.map(s => [s.id, s]));
        oldRows.forEach(s => { if (!merged.has(s.id)) merged.set(s.id, s); });
        return [...merged.values()].sort((a, b) => a.date.localeCompare(b.date));
      });
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const sync = useCallback(async (log: PartnerSessionLog) => {
    if (!userId || syncLock.current) return;
    syncLock.current = true;
    setSyncingId(log.id);
    try {
      const session = getPartnerSession(log.sessionId);
      const { error } = await supabase.from('workout_logs').upsert(buildWorkoutLogRow(log, userId, session), { onConflict: 'id' });
      if (error) throw error;
      setProgress(prev => {
        const next = { ...prev, logs: prev.logs.map(l => (l.id === log.id ? { ...l, synced: true } : l)) };
        savePartnerProgress(next, userId);
        return next;
      });
      toast.success('Session saved to My Log.');
    } catch {
      toast.error('Saved on this device, but the cloud save failed.', { action: { label: 'Retry', onClick: () => { void sync(log); } } });
    } finally {
      syncLock.current = false;
      setSyncingId(null);
    }
  }, [userId]);

  function startClass(session: PartnerSession) {
    unlockClassAudio();
    const next = createActiveClass(
      { session, prefill: buildPrefill(session, history) },
      { id: crypto.randomUUID(), date: toLocalDateStr(), mode: settings.mode, partners: names },
    );
    setActive(next);
    setConfirmReplace(false);
    openClass();
  }

  function resumeClass() {
    unlockClassAudio();
    openClass();
  }

  async function saveClass(a: ActiveClass, countAsDone: boolean) {
    const session = getPartnerSession(a.sessionId);
    if (!session) return;
    const log: PartnerSessionLog = {
      id: a.id, sessionId: session.id, title: session.title, date: a.date, elapsed: a.elapsed, mode: a.mode,
      partners: a.partners, records: a.records, turnsPlanned: totalTurns(session.stations.length, session.rounds), synced: false,
      hr: Object.fromEntries((['A', 'B'] as PartnerSlot[]).flatMap(slot => { const h = hrSummary(a.hr[slot]); return h ? [[slot, h]] : []; })),
    };
    const next = addSessionLog(progress, log, countAsDone && a.records.length > 0);
    commitProgress(next);
    setActive(null);
    closeClass(true);
    const upcoming = getNextSessionId(next);
    toast.success(countAsDone ? `${session.title} ticked off.` : 'Session saved.', { description: upcoming ? `Up next: ${getPartnerSession(upcoming)?.title}` : 'That completes the 8-week series.' });
    if (userId) void sync(log);
  }

  function discardClass() {
    setActive(null);
    closeClass(true);
  }

  if (!selected) return <div className="card-warm p-5 text-sm text-muted-foreground">The partner series is loading…</div>;

  const isNext = selected.id === nextId;
  const selectedDone = progress.completed[selected.id];
  const turns = totalTurns(selected.stations.length, selected.rounds);
  const activeIsSelected = !!active && active.sessionId === selected.id;

  return (
    <div className="space-y-5" data-testid="partner-hub">
      {active && activeSession && !activeIsSelected && (
        <div className="card-warm flex flex-col gap-3 border-2 border-move/40 p-4 sm:flex-row sm:items-center" role="status">
          <div className="flex-1">
            <p className="eyebrow text-move">Class in progress</p>
            <p className="text-sm font-semibold">{activeSession.title} · turn {Math.min(active.turn + 1, totalTurns(activeSession.stations.length))} of {totalTurns(activeSession.stations.length, activeSession.rounds)}</p>
          </div>
          <button type="button" onClick={resumeClass} className="touch-btn rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background">Resume class</button>
        </div>
      )}

      <section className="card-warm space-y-4 p-5" aria-labelledby="partner-next-heading">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow text-move">{isNext ? 'Next session' : selectedDone ? 'Done · preview' : 'Preview'} · Partner series</p>
            <h2 id="partner-next-heading" className="display-serif mt-1 text-[1.9rem] leading-[1.05]">Week {selected.week} · Session {selected.index}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{selected.focus} body · {selected.style}</p>
          </div>
          {!isNext && nextId && (
            <button type="button" onClick={clearSelection} className="shrink-0 text-xs font-medium underline underline-offset-2">Back to next</button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs">
          <span className="rounded-full bg-move/15 px-3 py-1 font-semibold">{selected.style}</span>
          <span className="rounded-full border border-border px-3 py-1">{selected.focus} body</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1"><Clock className="h-3 w-3" /> about {selected.estMinutes} min</span>
          <span className="rounded-full border border-border px-3 py-1">{selected.rounds} rounds · {turns} turns</span>
        </div>

        <div className="space-y-2.5" data-testid="partner-preview-grid">
          {BLOCKS.map(block => {
            const row = selected.stations.map((s, i) => ({ s, i })).filter(x => x.s.block === block);
            if (!row.length) return null;
            return (
              <div key={block}>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{block}</p>
                <div className="grid grid-cols-3 gap-2">
                  {row.map(({ s, i }) => <PreviewTile key={s.id} station={s} number={i + 1} />)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-1 rounded-full bg-muted p-1" role="group" aria-label="Timing mode">
            {([['pace', 'Partner pace'], ['timer', 'Class timer']] as const).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                aria-pressed={settings.mode === mode}
                onClick={() => updateSettings(prev => ({ ...prev, mode }))}
                className={`min-h-[40px] rounded-full text-sm font-medium transition-colors ${settings.mode === mode ? 'bg-foreground text-background' : 'text-muted-foreground'}`}
              >{label}</button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {settings.mode === 'pace'
              ? 'The worker taps Swap when their reps are done — the reps set how long the treadmill runs.'
              : `${selected.workSeconds} s work, ${selected.transitionSeconds} s to swap. It moves on by itself with 3-2-1 beeps.`}
          </p>
        </div>

        {confirmReplace ? (
          <div className="space-y-2 rounded-2xl border border-border p-3">
            <p className="text-sm">Start {selected.title}? The class in progress ({activeSession?.title}) will be discarded.</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => startClass(selected)} className="touch-btn flex-1 rounded-full bg-foreground px-4 py-3 text-sm font-semibold text-background">Start new class</button>
              <button type="button" onClick={() => setConfirmReplace(false)} className="touch-btn flex-1 rounded-full border border-border px-4 py-3 text-sm">Keep it</button>
            </div>
          </div>
        ) : activeIsSelected ? (
          <div className="flex gap-2">
            <button type="button" onClick={resumeClass} className="touch-btn inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3.5 text-base font-semibold text-background">
              <Play className="h-4 w-4" /> Resume class · turn {Math.min(active!.turn + 1, turns)}/{turns}
            </button>
            <button type="button" onClick={() => startClass(selected)} className="touch-btn inline-flex items-center justify-center rounded-full border border-border px-4" aria-label="Restart this class from turn 1">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => (active ? setConfirmReplace(true) : startClass(selected))}
            className="touch-btn inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3.5 text-base font-semibold text-background"
          >
            <Play className="h-4 w-4" /> Start class
          </button>
        )}

        <details className="rounded-2xl bg-muted/50 p-3 text-sm">
          <summary className="cursor-pointer font-medium">Warm-up, treadmill & cool-down</summary>
          <div className="mt-2 space-y-2">
            <p className="flex gap-2"><Footprints className="mt-0.5 h-4 w-4 shrink-0 text-move" /><span><strong>Treadmill partner:</strong> {selected.treadmill}</span></p>
            {selected.warmup.length > 0 && <div><p className="font-semibold">Warm-up</p><ul className="list-disc pl-5 text-muted-foreground">{selected.warmup.map(w => <li key={w}>{w}</li>)}</ul></div>}
            {selected.cooldown.length > 0 && <div><p className="font-semibold">Cool-down</p><ul className="list-disc pl-5 text-muted-foreground">{selected.cooldown.map(c => <li key={c}>{c}</li>)}</ul></div>}
            {selected.coachNote && <p className="text-muted-foreground">{selected.coachNote}</p>}
          </div>
        </details>
      </section>

      <section className="card-warm space-y-3 p-5" aria-labelledby="partner-names-heading">
        <div>
          <p className="eyebrow text-move">Who's training</p>
          <h3 id="partner-names-heading" className="font-display text-xl">{names.A} & {names.B}</h3>
        </div>
        {(['A', 'B'] as PartnerSlot[]).map(slot => (
          <div key={slot} className="grid grid-cols-[1fr_88px] gap-2">
            <label className="text-xs text-muted-foreground">
              Partner {slot}{slot === 'A' ? ' (you)' : ''}
              <input
                value={settings[slot].name}
                placeholder={slot === 'A' ? defaultA : "Friend's name"}
                maxLength={24}
                onChange={e => updateSettings(prev => ({ ...prev, [slot]: { ...prev[slot], name: e.target.value } }))}
                className="mt-1 block w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              Age
              <input
                inputMode="numeric"
                value={settings[slot].age ?? ''}
                placeholder={slot === 'A' && profileAge ? String(profileAge) : '—'}
                onChange={e => {
                  const n = parseInt(e.target.value.replace(/\D/g, ''), 10);
                  updateSettings(prev => ({ ...prev, [slot]: { ...prev[slot], age: Number.isFinite(n) && n > 0 && n < 100 ? n : null } }));
                }}
                className="mt-1 block w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground tabular-nums"
                aria-label={`Partner ${slot} age`}
              />
            </label>
          </div>
        ))}
        <p className="text-xs text-muted-foreground">Ages set each partner's heart-rate zones (max HR ≈ 208 − 0.7 × age). Heart-rate straps are optional — connect them in class mode.</p>
      </section>

      <ProgramGrid program={PARTNER_PROGRAM} progress={progress} nextId={nextId} selectedId={selected.id} onSelect={selectSession} />

      <details className="card-warm p-5 text-sm">
        <summary className="cursor-pointer font-display text-lg">How the series works</summary>
        <div className="mt-3 space-y-3">
          <p className="text-muted-foreground">{PARTNER_PROGRAM.summary}</p>
          {PARTNER_PROGRAM.phases.length > 0 && (
            <ul className="space-y-1.5">
              {PARTNER_PROGRAM.phases.map(p => (
                <li key={p.name}><strong>{p.name}</strong> · weeks {p.weeks.join(', ')} · {p.reps} reps · RIR {p.rir} — <span className="text-muted-foreground">{p.goal}</span></li>
              ))}
            </ul>
          )}
          {PARTNER_PROGRAM.evidence.length > 0 && (
            <div>
              <p className="font-semibold">The evidence behind it</p>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">{PARTNER_PROGRAM.evidence.map(e => <li key={e}>{e}</li>)}</ul>
            </div>
          )}
        </div>
      </details>

      <PartnerHistory logs={progress.logs} legacy={legacy} canSync={!!userId} syncingId={syncingId} onRetry={log => void sync(log)} />
      {!userId && <p className="text-xs text-muted-foreground">Sessions are saved on this device. Sign in before training to save them to your account.</p>}

      {classOpen && active && activeSession && (
        <ClassMode
          session={activeSession}
          active={active}
          onChange={onClassChange}
          history={history}
          settings={effectiveSettings}
          onToggleMute={() => updateSettings(prev => ({ ...prev, muted: !prev.muted }))}
          hr={hr}
          onSave={saveClass}
          onDiscard={discardClass}
          onMinimise={() => { setActive(prev => ({ ...prev, running: false })); closeClass(); }}
        />
      )}
    </div>
  );
}

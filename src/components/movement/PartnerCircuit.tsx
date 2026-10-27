import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, Footprints, Play, RotateCcw, ShieldCheck } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useMultiHeartRate } from '@/hooks/useMultiHeartRate';
import { supabase } from '@/integrations/supabase/client';
import { toLocalDateStr } from '@/lib/local-date';
import { getUserAge, getUserWeight } from '@/data/workouts';
import {
  PARTNER_PROGRAM, adaptForKit, barbellStations, extraStrengthRoundMinutes, getPartnerSession, type PartnerSession, type StationBlock,
} from '@/data/partner-program';
import {
  PARTNER_NOTES_PREFIX, PARTNER_PROGRESS_EVENT, addSessionLog, buildWorkoutLogRow, getLegacyPartnerHistory, getNextSessionId,
  getPartnerProgress, getPartnerSettings, parsePartnerNotes, partnerCalories, plannedLoad, rowCounts, savePartnerProgress, savePartnerSettings, totalTurns,
  type LegacyPartnerSession, type PartnerHRSummary, type PartnerProgress, type PartnerSessionLog, type PartnerSettings, type PartnerSlot, type PartnerTurnRecord,
} from '@/lib/partner-progress';
import ClassMode from './partner/ClassMode';
import { PreviewTile } from './partner/StationTile';
import ProgramGrid from './partner/ProgramGrid';
import PartnerHistory from './partner/PartnerHistory';
import { classTurns, createActiveClass, hrSummary, restoreActiveClass, type ActiveClass } from './partner/class-engine';
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

/**
 * A number box that keeps what's being typed and saves only a number in range.
 * Saving on every keystroke would wipe "6" on the way to "65" kg, because 6 isn't
 * a weight, so the box could never be filled in.
 */
function NumberField({ value, onChange, min, max, decimal = false, placeholder, label }: {
  value: number | null; onChange: (n: number | null) => void; min: number; max: number;
  decimal?: boolean; placeholder: string; label: string;
}) {
  const [text, setText] = useState(value == null ? '' : String(value));
  const parse = (raw: string) => {
    const n = decimal ? parseFloat(raw.replace(',', '.')) : parseInt(raw, 10);
    return Number.isFinite(n) && n >= min && n <= max ? n : null;
  };
  // Pick up a value set elsewhere (another tab, a reset) unless it is what's typed.
  useEffect(() => {
    setText(prev => (parse(prev) === value ? prev : value == null ? '' : String(value)));
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <input
      inputMode={decimal ? 'decimal' : 'numeric'}
      value={text}
      placeholder={placeholder}
      onChange={e => {
        const raw = e.target.value.replace(decimal ? /[^\d.,]/g : /\D/g, '');
        setText(raw);
        const n = parse(raw);
        if (n !== value) onChange(n);
      }}
      onBlur={() => setText(value == null ? '' : String(value))}
      className="mt-1 block w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground tabular-nums"
      aria-label={label}
    />
  );
}

function Hub({ user }: { user: User | null }) {
  const userId = user?.id;
  const { displayName, dateOfBirth } = useProfile();
  const hr = useMultiHeartRate();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const pushedClass = useRef(false);
  const primaryButton = useRef<HTMLButtonElement>(null);

  const [progress, setProgress] = useState<PartnerProgress>(() => getPartnerProgress(userId));
  const [settings, setSettings] = useState<PartnerSettings>(() => getPartnerSettings(userId));
  const [active, setActiveState] = useState<ActiveClass | null>(() => readActive(userId));
  const [legacy, setLegacy] = useState<LegacyPartnerSession[]>(() => getLegacyPartnerHistory(userId));
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);

  // Names + ages: partner A defaults to the member's first name and profile age.
  const defaultA = firstName(displayName) || firstName(user?.user_metadata?.full_name as string | undefined) || 'Partner A';
  const names: Record<PartnerSlot, string> = { A: settings.A.name.trim() || defaultA, B: settings.B.name.trim() || 'Partner B' };
  const profileAge = ageFromDob(dateOfBirth) ?? getUserAge();
  const profileWeight = getUserWeight();
  const effectiveSettings: PartnerSettings = {
    ...settings,
    A: { ...settings.A, name: names.A, age: settings.A.age ?? profileAge, weightKg: settings.A.weightKg ?? profileWeight },
    B: { ...settings.B, name: names.B },
  };

  const updateSettings = (patch: (prev: PartnerSettings) => PartnerSettings) => setSettings(prev => {
    const next = patch(prev);
    savePartnerSettings(next, userId);
    return next;
  });

  // Sessions as trained with this kit (no rack safeties → dumbbell squat and bench).
  const forKit = useCallback((s: PartnerSession | undefined) => (s ? adaptForKit(s, { safeties: settings.safeties }) : undefined), [settings.safeties]);

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

  // For async callbacks: update from the latest progress without a state-updater function, so the
  // save (and its change event, which other screens listen to) never runs during a render.
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const updateProgress = useCallback((fn: (prev: PartnerProgress) => PartnerProgress) => {
    const prev = progressRef.current;
    const next = fn(prev);
    if (next === prev) return;
    progressRef.current = next;
    setProgress(next);
    savePartnerProgress(next, userId);
  }, [userId]);

  const nextId = getNextSessionId(progress);
  const paramSession = params.get('session');
  const selected: PartnerSession | undefined = forKit((paramSession && getPartnerSession(paramSession)) || (nextId ? getPartnerSession(nextId) : undefined) || PARTNER_PROGRAM.sessions[0]);
  const activeSession = active ? forKit(getPartnerSession(active.sessionId)) : undefined;
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

  // Focus goes back to Start / Resume when class mode closes.
  const wasOpen = useRef(classOpen);
  useEffect(() => {
    if (wasOpen.current && !classOpen) primaryButton.current?.focus({ preventScroll: true });
    wasOpen.current = classOpen;
  }, [classOpen]);

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
          restored.push({
            id: row.id, sessionId: session.id, title: session.title, date: row.session_date, elapsed: (row.duration_minutes ?? 0) * 60, mode: 'pace',
            partners: { A: nameOf('A'), B: nameOf('B') }, records, turnsPlanned: totalTurns(session.stations.length, session.rounds), synced: true,
            counted: rowCounts(row),
          });
        } else {
          const planId = ['lower-strength', 'upper-strength', 'lower-pump', 'upper-pump'].find(id => row.notes?.toLowerCase().includes(id.replace('-', ' body · ')));
          oldRows.push({ id: row.id, planId: planId ?? (row.notes ?? '').replace(PARTNER_NOTES_PREFIX, ''), date: row.session_date, elapsed: (row.duration_minutes ?? 0) * 60, records: records as unknown as LegacyPartnerSession['records'], synced: true });
        }
      }
      if (restored.length) {
        updateProgress(prev => {
          let next = prev;
          for (const log of restored) {
            if (next.logs.some(l => l.id === log.id)) continue;
            // An unticked save stays unticked on every device.
            next = addSessionLog(next, log, log.counted !== false && !next.completed[log.sessionId]);
          }
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
  }, [userId, updateProgress]);

  // Cloud saves run one at a time from a queue, so a save made during another sync is never dropped.
  const logsRef = useRef(progress.logs);
  logsRef.current = progress.logs;
  const queue = useRef<Array<{ log: PartnerSessionLog; notify: boolean }>>([]);
  const pumping = useRef(false);
  const retryRef = useRef<(log: PartnerSessionLog) => void>(() => {});

  const syncOne = useCallback(async (log: PartnerSessionLog, notify: boolean) => {
    if (!userId) return;
    setSyncingId(log.id);
    try {
      const session = getPartnerSession(log.sessionId);
      const { error } = await supabase.from('workout_logs').upsert(buildWorkoutLogRow(log, userId, session), { onConflict: 'id' });
      if (error) throw error;
      updateProgress(prev => ({ ...prev, logs: prev.logs.map(l => (l.id === log.id ? { ...l, synced: true } : l)) }));
    } catch {
      if (notify) toast.error('Saved on this device, but the cloud save failed.', { action: { label: 'Retry', onClick: () => retryRef.current(log) } });
    } finally {
      setSyncingId(null);
    }
  }, [userId, updateProgress]);

  const pump = useCallback(async () => {
    if (!userId || pumping.current) return;
    pumping.current = true;
    try {
      while (queue.current.length) {
        const { log, notify } = queue.current[0];
        const latest = logsRef.current.find(l => l.id === log.id) ?? log;
        if (!latest.synced) await syncOne(latest, notify);
        queue.current.shift();
      }
    } finally {
      pumping.current = false;
    }
  }, [userId, syncOne]);

  const enqueue = useCallback((log: PartnerSessionLog, notify: boolean) => {
    const queued = queue.current.find(q => q.log.id === log.id);
    if (queued) { queued.log = log; queued.notify ||= notify; } else queue.current.push({ log, notify });
    void pump();
  }, [pump]);
  retryRef.current = log => enqueue(log, true);

  // Retry anything saved only on this device: on load and whenever the connection comes back.
  useEffect(() => {
    if (!userId) return;
    const retry = () => logsRef.current.filter(l => !l.synced).forEach(l => enqueue(l, false));
    retry();
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, [userId, enqueue]);

  function startClass(session: PartnerSession) {
    unlockClassAudio();
    const next = createActiveClass(
      { session },
      { id: crypto.randomUUID(), date: toLocalDateStr(), mode: settings.mode, partners: names, extraRound: settings.extraRound },
    );
    setActive(next);
    setConfirmReplace(false);
    openClass();
  }

  function resumeClass() {
    unlockClassAudio();
    openClass();
  }

  /** Heart rate and estimated calories per partner for a class. */
  function classStats(a: ActiveClass): Partial<Record<PartnerSlot, PartnerHRSummary>> {
    return Object.fromEntries((['A', 'B'] as PartnerSlot[]).map(slot => {
      const h = hrSummary(a.hr[slot]);
      const { kcal } = partnerCalories(a.hr[slot], a.elapsed, effectiveSettings[slot]);
      return [slot, { avg: h?.avg ?? 0, max: h?.max ?? 0, effortMinutes: h?.effortMinutes ?? 0, kcal }];
    }));
  }

  /**
   * Save a class to the plan, today's Move log and the cloud. A finished class
   * saves itself and stays open on the summary (`close` false) until Done.
   */
  function saveClass(a: ActiveClass, countAsDone: boolean, close = true) {
    const session = forKit(getPartnerSession(a.sessionId));
    if (!session) return;
    const counted = countAsDone && a.records.length > 0;
    const log: PartnerSessionLog = {
      id: a.id, sessionId: session.id, title: session.title, date: a.date, elapsed: a.elapsed, mode: a.mode,
      partners: a.partners, records: a.records, turnsPlanned: classTurns(session, a), synced: false, counted,
      ...(a.extraRound ? { extraRound: true } : {}),
      hr: classStats(a),
    };
    const next = addSessionLog(progress, log, counted);
    commitProgress(next);
    if (close) {
      setActive(null);
      closeClass(true);
    } else {
      setActive({ ...a, running: false, saved: true });
    }
    const upcoming = getNextSessionId(next);
    toast.success(counted ? `${session.title} saved to today's log.` : 'Session saved to today\'s log.', { description: upcoming ? `Up next: ${getPartnerSession(upcoming)?.title}` : 'That completes the 8-week series.' });
    if (userId) enqueue(log, true);
  }

  function finishClass() {
    setActive(null);
    closeClass(true);
  }

  function discardClass() {
    setActive(null);
    closeClass(true);
  }

  if (!selected) return <div className="card-warm p-5 text-sm text-muted-foreground">The partner series is loading…</div>;

  const isNext = selected.id === nextId;
  const selectedDone = progress.completed[selected.id];
  const extraMinutes = extraStrengthRoundMinutes(selected);
  const turns = classTurns(selected, { extraRound: settings.extraRound });
  const activeIsSelected = !!active && active.sessionId === selected.id;
  const activeTurns = active && activeSession ? classTurns(activeSession, active) : 0;
  const bars = barbellStations(selected).length;
  const swapped = selected !== getPartnerSession(selected.id);

  return (
    <div className="space-y-5" data-testid="partner-hub">
      {active && activeSession && !activeIsSelected && (
        <div className="card-warm flex flex-col gap-3 border-2 border-move/40 p-4 sm:flex-row sm:items-center" role="status">
          <div className="flex-1">
            <p className="eyebrow text-move">Class in progress</p>
            <p className="text-sm font-semibold">{activeSession.title} · turn {Math.min(active.turn + 1, activeTurns)} of {activeTurns}</p>
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
          <span className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1"><Clock className="h-3 w-3" /> about {selected.estMinutes + (settings.extraRound ? extraMinutes : 0)} min</span>
          <span className="rounded-full border border-border px-3 py-1">{selected.rounds}{settings.extraRound ? ' + 1' : ''} rounds · {turns} turns</span>
          {swapped && <span className="rounded-full border border-border px-3 py-1">Dumbbell squat & bench (no rack safeties)</span>}
        </div>

        <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-start lg:gap-6 lg:space-y-0">
          <div className="space-y-2.5" data-testid="partner-preview-grid">
            {BLOCKS.map(block => {
              const row = selected.stations.map((s, i) => ({ s, i })).filter(x => x.s.block === block);
              if (!row.length) return null;
              return (
                <div key={block}>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{block}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {row.map(({ s, i }) => <PreviewTile key={s.id} station={s} number={i + 1} load={plannedLoad(s, selected.week).load} />)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-4">
            {settings.safeties === null && (
              <div className="space-y-2 rounded-2xl border border-move/40 bg-move/5 p-3" role="group" aria-labelledby="partner-rack-check">
                <p id="partner-rack-check" className="flex items-center gap-1.5 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-move" /> Quick rack check</p>
                <p className="text-xs text-muted-foreground">Does your rack have safety arms or straps that would catch the bar? Your spotter is on the treadmill.</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => updateSettings(prev => ({ ...prev, safeties: true }))} className="touch-btn flex-1 rounded-full border border-border bg-background px-3 py-2.5 text-sm font-medium">Yes, it has safeties</button>
                  <button type="button" onClick={() => updateSettings(prev => ({ ...prev, safeties: false }))} className="touch-btn flex-1 rounded-full border border-border bg-background px-3 py-2.5 text-sm font-medium">No, hooks only</button>
                </div>
              </div>
            )}

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
                  : `About ${selected.workSeconds} s of work per station (longer for big sets), then ${selected.transitionSeconds} s to swap. It moves on by itself with 3-2-1 beeps.`}
                {settings.mode === 'timer' && bars >= 2 && ' Two barbell stations today: partner pace gives you time to change plates.'}
              </p>
              <button
                type="button"
                aria-pressed={settings.extraRound}
                onClick={() => updateSettings(prev => ({ ...prev, extraRound: !prev.extraRound }))}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 text-left text-sm transition-colors ${settings.extraRound ? 'border-foreground bg-foreground/5' : 'border-border'}`}
              >
                <span><span className="font-medium">Add a 3rd round of the strength stations</span><span className="block text-xs text-muted-foreground">+6 turns, about {extraMinutes} min. More muscle-building volume.</span></span>
                <span className={`h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors ${settings.extraRound ? 'bg-foreground' : 'bg-muted'}`} aria-hidden="true">
                  <span className={`block h-5 w-5 rounded-full bg-background shadow transition-transform ${settings.extraRound ? 'translate-x-5' : ''}`} />
                </span>
              </button>
            </div>

            {confirmReplace ? (
              <div className="space-y-2 rounded-2xl border border-border p-3" role="alertdialog" aria-label={activeIsSelected ? 'Restart this class?' : 'Start a new class?'}>
                <p className="text-sm">
                  {activeIsSelected
                    ? 'Restart from turn 1? Turns logged so far will be discarded.'
                    : `Start ${selected.title}? The class in progress (${activeSession?.title}) will be discarded.`}
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => startClass(selected)} className="touch-btn flex-1 rounded-full bg-foreground px-4 py-3 text-sm font-semibold text-background">{activeIsSelected ? 'Restart' : 'Start new class'}</button>
                  {/* Keep it is the safe default. */}
                  <button type="button" autoFocus onClick={() => setConfirmReplace(false)} className="touch-btn flex-1 rounded-full border border-border px-4 py-3 text-sm">Keep it</button>
                </div>
              </div>
            ) : activeIsSelected ? (
              <div className="flex gap-2">
                <button ref={primaryButton} type="button" onClick={resumeClass} className="touch-btn inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3.5 text-base font-semibold text-background">
                  <Play className="h-4 w-4" /> Resume class · turn {Math.min(active!.turn + 1, activeTurns)}/{activeTurns}
                </button>
                <button type="button" onClick={() => setConfirmReplace(true)} className="touch-btn inline-flex items-center justify-center rounded-full border border-border px-4" aria-label="Restart this class from turn 1">
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                ref={primaryButton}
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
          </div>
        </div>
      </section>

      <section className="card-warm space-y-3 p-5" aria-labelledby="partner-names-heading">
        <div>
          <p className="eyebrow text-move">Who's training</p>
          <h3 id="partner-names-heading" className="font-display text-xl">{names.A} & {names.B}</h3>
        </div>
        {(['A', 'B'] as PartnerSlot[]).map(slot => (
          <div key={slot} className="grid grid-cols-[1fr_72px_80px] gap-2">
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
              <NumberField
                value={settings[slot].age}
                min={10}
                max={99}
                placeholder={slot === 'A' && profileAge ? String(profileAge) : '—'}
                onChange={age => updateSettings(prev => ({ ...prev, [slot]: { ...prev[slot], age } }))}
                label={`Partner ${slot} age`}
              />
            </label>
            <label className="text-xs text-muted-foreground">
              Weight kg
              <NumberField
                value={settings[slot].weightKg ?? null}
                min={25}
                max={300}
                decimal
                placeholder={slot === 'A' && profileWeight ? String(profileWeight) : '—'}
                onChange={weightKg => updateSettings(prev => ({ ...prev, [slot]: { ...prev[slot], weightKg } }))}
                label={`Partner ${slot} weight in kg`}
              />
            </label>
          </div>
        ))}
        <p className="text-xs text-muted-foreground">Age sets each partner's heart-rate zones (max HR ≈ 208 − 0.7 × age); age and body weight give the calorie estimate at the end. Heart-rate straps are optional — connect them in class mode.</p>
        {settings.safeties !== null && (
          <p className="text-xs text-muted-foreground">
            Rack safeties: <strong className="text-foreground">{settings.safeties ? 'yes' : 'no — squat and bench use dumbbells'}</strong>{' '}
            <button type="button" onClick={() => updateSettings(prev => ({ ...prev, safeties: !prev.safeties }))} className="underline underline-offset-2">Change</button>
          </p>
        )}
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
          <div>
            <p className="font-semibold">Kit and safety</p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>{PARTNER_PROGRAM.equipment.join(' · ')}</li>
              {PARTNER_PROGRAM.safety.map(s => <li key={s}>{s}</li>)}
            </ul>
          </div>
          {PARTNER_PROGRAM.evidence.length > 0 && (
            <div>
              <p className="font-semibold">The evidence behind it</p>
              <ul className="list-disc space-y-1 pl-5 text-muted-foreground">{PARTNER_PROGRAM.evidence.map(e => <li key={e}>{e}</li>)}</ul>
            </div>
          )}
        </div>
      </details>

      <PartnerHistory logs={progress.logs} legacy={legacy} canSync={!!userId} syncingId={syncingId} onRetry={log => enqueue(log, true)} />
      {!userId && <p className="text-xs text-muted-foreground">Sessions are saved on this device. Sign in before training to save them to your account.</p>}

      {classOpen && active && activeSession && (
        <ClassMode
          session={activeSession}
          active={active}
          onChange={onClassChange}
          settings={effectiveSettings}
          onToggleMute={() => updateSettings(prev => ({ ...prev, muted: !prev.muted }))}
          hr={hr}
          onSave={saveClass}
          onDone={finishClass}
          onDiscard={discardClass}
          onMinimise={() => { setActive(prev => ({ ...prev, running: false })); closeClass(); }}
        />
      )}
    </div>
  );
}

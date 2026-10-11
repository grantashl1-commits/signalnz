import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toLocalDateStr } from '@/lib/local-date';
import { PARTNER_PLANS, CIRCUIT_TURNS, circuitTurn, nextPartnerCircuit } from '@/data/partner-circuits';
import { toast } from 'sonner';
type SetRecord = { exercise_name: string; exercise_id: string; partner: string; round: number; reps: string; weight: string; completed: boolean };
type Session = { id: string; planId: string; date: string; turn: number; elapsed: number; records: SetRecord[]; synced: boolean };
type Stored = { active: Session | null; history: Session[] };
export default function PartnerCircuit() {
 const { user } = useAuth();
 return <Circuit key={user?.id ?? 'guest'} userId={user?.id} />;
}
function Circuit({ userId }: { userId?: string }) {
 const key = `signal_partner_circuits_v1:${userId ?? 'guest'}`;
 const [stored, setStored] = useState<Stored>(() => { try { return JSON.parse(localStorage.getItem(key) ?? '{"active":null,"history":[]}'); } catch { return { active: null, history: [] }; } });
 const [selected, setSelected] = useState(() => nextPartnerCircuit(stored.history.length).id);
 const [running, setRunning] = useState(false);
 const [reps, setReps] = useState('');
 const [weight, setWeight] = useState('');
 const [saving, setSaving] = useState<string | null>(null);
 const lock = useRef(false);
 const edited = useRef(false);
 const active = stored.active;
 const plan = PARTNER_PLANS.find(p => p.id === (active?.planId ?? selected)) ?? PARTNER_PLANS[0];
 const turn = circuitTurn(active?.turn ?? 0);
 const exercise = plan.exercises[turn.station];
 useEffect(() => { try { localStorage.setItem(key, JSON.stringify(stored)); } catch { toast.error('Device storage is unavailable. Keep this session open.'); } }, [stored, key]);
 useEffect(() => {
  if (!running || !active) return;
  let last = Date.now();
  const timer = setInterval(() => { const now = Date.now(); const seconds = Math.floor((now - last) / 1000); if (!seconds) return; last += seconds * 1000; setStored(prev => prev.active ? { ...prev, active: { ...prev.active, elapsed: prev.active.elapsed + seconds } } : prev); }, 1000);
  return () => clearInterval(timer);
 }, [running, active?.id]);
 useEffect(() => {
  if (!active) return;
  const prior = [...stored.history].reverse().flatMap(s => [...s.records].reverse()).find(r => r.exercise_id === exercise.id && r.partner === turn.partner);
  setWeight(prior?.weight ?? ''); setReps('');
 }, [active?.id, active?.turn, exercise.id, turn.partner]);
 useEffect(() => {
  if (!userId) return;
  let cancelled = false;
  void (async () => {
   const { data, error } = await supabase.from('workout_logs').select('id, session_date, duration_minutes, notes, exercises').eq('user_id', userId).eq('completed', true).like('notes', 'Partner circuit · %').order('session_date', { ascending: true });
   if (error || cancelled) return;
   const restored: Session[] = (data ?? []).flatMap(row => {
    const match = PARTNER_PLANS.find(p => row.notes?.includes(p.name));
    if (!match || !Array.isArray(row.exercises)) return [];
    return [{ id: row.id, planId: match.id, date: row.session_date, turn: CIRCUIT_TURNS, elapsed: (row.duration_minutes ?? 0) * 60, records: row.exercises as unknown as SetRecord[], synced: true }];
   });
   setStored(prev => { const merged = new Map(prev.history.map(s => [s.id, s])); restored.forEach(s => merged.set(s.id, s)); const history = [...merged.values()].sort((a, b) => a.date.localeCompare(b.date)); if (!prev.active && !edited.current) setSelected(nextPartnerCircuit(history.length).id); return { ...prev, history }; });
  })();
  return () => { cancelled = true; };
 }, [userId]);
 async function sync(session: Session) {
  if (!userId || lock.current) return;
  lock.current = true; setSaving(session.id);
  try {
   const title = PARTNER_PLANS.find(p => p.id === session.planId)?.name ?? session.planId;
   const { error } = await supabase.from('workout_logs').upsert({ id: session.id, user_id: userId, session_date: session.date, workout_template_id: null, duration_minutes: Math.max(1, Math.round(session.elapsed / 60)), exercises: session.records, notes: `Partner circuit · ${title} · 2 rounds`, completed: true }, { onConflict: 'id' });
   if (error) throw error;
   setStored(prev => ({ ...prev, history: prev.history.map(s => s.id === session.id ? { ...s, synced: true } : s) }));
   toast.success('Session saved to My Log.');
  } catch { toast.error('Session saved on this device. Retry cloud save below.'); }
  finally { lock.current = false; setSaving(null); }
 }
 function start() {
  edited.current = true;
  setStored(prev => ({ ...prev, active: { id: crypto.randomUUID(), planId: selected, date: toLocalDateStr(), turn: 0, elapsed: 0, records: [], synced: false } })); setRunning(true);
 }
 function completeTurn() {
  if (!active || !running || !reps.trim()) return;
  const next = { ...active, turn: active.turn + 1, records: [...active.records, { exercise_name: exercise.name, exercise_id: exercise.id, partner: turn.partner, round: turn.round, reps: reps.trim(), weight: weight.trim(), completed: true }] };
  if (next.turn === CIRCUIT_TURNS) {
   setRunning(false); setStored(prev => ({ active: null, history: [...prev.history, next] })); setSelected(nextPartnerCircuit(stored.history.length + 1).id); void sync(next);
   toast.success('Two rounds complete for both partners.');
  } else setStored(prev => ({ ...prev, active: next }));
 }
 return <div className="space-y-5">
  <div className="card-warm p-5 space-y-3">
   <p className="eyebrow text-move">Partner training · about 45 minutes</p>
   <h2 className="font-display text-2xl">Strength, reformer & core</h2>
   <p className="text-sm text-muted-foreground">9 stations, 2 rounds. Partner A completes the reps while B walks or jogs on the treadmill, then swap. Both complete each station before moving on.</p>
   <p className="text-sm text-muted-foreground">This BFT-inspired hybrid alternates upper and lower body, with heavier Strength and higher-rep Pump sessions. Repeat the rotation to track progress. It is an independent home programme, with reformer Pilates added to your partner format.</p>
   <p className="text-sm">Warm up for 5 minutes. Leave 1–3 good reps in reserve on strength lifts. Rest 45–90 seconds between stations as needed; keep treadmill effort easy enough to lift well. Allow 2–3 minutes to cool down.</p>
   <p className="text-sm">When both rounds reach the top of the rep range with controlled form, increase the smallest available weight increment next time. Use familiar reformer setups and machine-specific springs.</p>
   {!active && <><label className="block text-sm" htmlFor="partner-plan">Choose your session</label><select id="partner-plan" value={selected} onChange={e => { edited.current = true; setSelected(e.target.value); }} className="w-full rounded-xl p-3 bg-background border border-border">{PARTNER_PLANS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select><button className="touch-btn rounded-full px-5 py-3 bg-primary text-primary-foreground" onClick={start}>Start partner circuit</button></>}
  </div>
  {active && <div className="card-warm p-5 space-y-4">
   <div className="flex justify-between gap-3"><h3 className="font-display text-xl">{plan.name}</h3><span className="tabular-nums">{Math.floor(active.elapsed / 60)}:{String(active.elapsed % 60).padStart(2, '0')}</span></div>
   <progress aria-label="Session progress" className="w-full" value={active.turn} max={CIRCUIT_TURNS} />
   <p className="text-sm">Round {turn.round} of 2 · Station {turn.station + 1} of 9 · {exercise.block}</p>
   <h3 className="font-display text-xl">Partner {turn.partner}: {exercise.name}</h3>
   <p className="text-sm">Partner {turn.partner === 'A' ? 'B' : 'A'}: treadmill until these reps are complete.</p>
   <p className="text-sm font-medium">Target: {exercise.reps}</p><p className="text-sm text-muted-foreground">{exercise.cue}</p><p className="text-xs text-muted-foreground">{exercise.load}</p>
   <div className="grid sm:grid-cols-2 gap-3"><label className="text-sm">Reps completed (each side where applicable)<input value={reps} onChange={e => setReps(e.target.value)} placeholder="e.g. 10 each side" className="block w-full border border-border rounded-xl bg-background p-3 mt-1" /></label><label className="text-sm">Load / springs<input value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g. 12 kg per DB" className="block w-full border border-border rounded-xl bg-background p-3 mt-1" /></label></div>
   <div className="flex flex-wrap gap-3"><button onClick={() => setRunning(v => !v)} className="touch-btn border rounded-full px-4 py-3">{running ? 'Pause' : 'Resume'}</button><button disabled={!running || !reps.trim()} onClick={completeTurn} className="touch-btn bg-primary text-primary-foreground rounded-full px-5 py-3 disabled:opacity-40">{active.turn === 35 ? 'Finish circuit' : 'Reps done — swap / next'}</button></div>
   {!running && <p className="text-sm">Paused. Your place is saved on this device.</p>}
  </div>}
  <div className="card-warm p-5 space-y-3"><h3 className="font-display text-xl">Your nine stations</h3>{plan.exercises.map((e, i) => <div key={e.id} className="border-b border-border pb-3"><p className="text-xs text-muted-foreground">{i + 1} · {e.block}</p><p className="text-sm font-medium">{e.name} · {e.reps}</p><p className="text-xs text-muted-foreground">{e.cue}</p></div>)}</div>
  {stored.history.length > 0 && <div className="card-warm p-5 space-y-3"><h3 className="font-display text-xl">Completed circuits</h3>{[...stored.history].reverse().slice(0, 8).map(s => <div key={s.id} className="border-b pb-3"><details><summary className="cursor-pointer text-sm">{s.date} · {PARTNER_PLANS.find(p => p.id === s.planId)?.name} · {s.records.length} sets</summary><ul className="text-xs space-y-1 mt-2">{s.records.map((r, i) => <li key={i}>Round {r.round} · {r.partner} · {r.exercise_name}: {r.reps} · {r.weight || 'Bodyweight'}</li>)}</ul></details>{userId && !s.synced && <button disabled={saving !== null} onClick={() => void sync(s)} className="text-sm underline mt-2">{saving === s.id ? 'Saving…' : 'Retry cloud save'}</button>}</div>)}</div>}
  {!userId && <p className="text-xs text-muted-foreground">Sessions are saved on this device. Sign in before training to save to your account.</p>}
 </div>;
}

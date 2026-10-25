import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft, Footprints, HeartPulse, LayoutGrid, Maximize, Minimize, Minus, Pause, Play, Repeat2, Square, Volume2, VolumeX,
} from "lucide-react";
import { SWAP_SAFETY, type PartnerSession } from "@/data/partner-program";
import { getMaxHR } from "@/data/workouts";
import { useWakeLock } from "@/hooks/useWakeLock";
import { haptic } from "@/hooks/use-mobile";
import type { StrapSlot, StrapState } from "@/hooks/useMultiHeartRate";
import {
  formatKg, lastLogFor, loadKind, parseLoadKg, repsPlaceholderFor, suggestNext, summarisePartner,
  type PartnerSessionLog, type PartnerSettings, type PartnerSlot,
} from "@/lib/partner-progress";
import {
  backTurn, buildPrefill, classTurnAt, classTurns, extraStationsFor, hrSummary, isClassComplete, remainingSeconds, swapNow, tickClass,
  type ActiveClass, type ClassContext,
} from "./class-engine";
import { countdownBeep, swapChime, buzz, suspendClassAudio, unlockClassAudio } from "./class-sound";
import { ClassTile } from "./StationTile";
import StationArt from "./StationArt";
import { BluetoothNotice, PartnerHRTile } from "./PartnerHRTiles";
import "./class-mode.css";

export const DEFAULT_PARTNER_AGE = 38;

type Updater = ActiveClass | ((prev: ActiveClass) => ActiveClass);

interface Props {
  session: PartnerSession;
  active: ActiveClass;
  onChange: (next: Updater) => void;
  history: PartnerSessionLog[];
  settings: PartnerSettings;
  onToggleMute: () => void;
  hr: {
    straps: Record<StrapSlot, StrapState>;
    isSupported: boolean;
    connect: (slot: StrapSlot) => void;
    disconnect: (slot: StrapSlot) => void;
  };
  onSave: (active: ActiveClass, countAsDone: boolean) => Promise<void> | void;
  onDiscard: () => void;
  /** Hide class mode; the class stays saved (paused) on this device. */
  onMinimise: () => void;
}

/** Tablet/TV landscape gets the full station grid; phones get the large active station. */
function useWideLayout(query = "(min-width: 1024px)") {
  const [wide, setWide] = useState(() => typeof window !== "undefined" && !!window.matchMedia?.(query).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return;
    const onChange = () => setWide(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [query]);
  return wide;
}

const fmt = (secs: number) => `${Math.floor(secs / 60)}:${String(Math.max(0, secs) % 60).padStart(2, "0")}`;
const SLOTS: PartnerSlot[] = ["A", "B"];

export default function ClassMode({ session, active, onChange, history, settings, onToggleMute, hr, onSave, onDiscard, onMinimise }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const total = classTurns(session, active);
  const complete = isClassComplete(active, session);
  const [stage, setStage] = useState<"class" | "summary">(complete ? "summary" : "class");
  const [view, setView] = useState<"grid" | "hr">("grid");
  const [fullscreen, setFullscreen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const wake = useWakeLock();
  const wide = useWideLayout();
  const landscape = useWideLayout("(orientation: landscape) and (max-height: 600px)");

  const { A: nameA, B: nameB } = active.partners;
  const prefill = useMemo(
    () => buildPrefill(session, history, { partners: { A: nameA, B: nameB }, extraRound: active.extraRound }),
    [session, history, nameA, nameB, active.extraRound],
  );
  const ctx: ClassContext = useMemo(() => ({ session, prefill }), [session, prefill]);
  const maxHR = useMemo(() => ({
    A: getMaxHR(settings.A.age ?? DEFAULT_PARTNER_AGE),
    B: getMaxHR(settings.B.age ?? DEFAULT_PARTNER_AGE),
  }), [settings.A.age, settings.B.age]);

  // Latest values for the 1 Hz clock without re-creating the interval.
  const live = useRef({ ctx, bpm: { A: hr.straps.A.bpm, B: hr.straps.B.bpm }, maxHR });
  live.current = { ctx, bpm: { A: hr.straps.A.connected ? hr.straps.A.bpm : 0, B: hr.straps.B.connected ? hr.straps.B.bpm : 0 }, maxHR };

  useEffect(() => {
    if (!active.running) return;
    let last = Date.now();
    const id = window.setInterval(() => {
      const now = Date.now();
      const secs = Math.floor((now - last) / 1000);
      if (secs < 1) return;
      last += secs * 1000;
      const { ctx: c, bpm, maxHR: m } = live.current;
      onChange(prev => tickClass(prev, c, secs, { bpm, maxHR: m }));
    }, 250);
    return () => window.clearInterval(id);
  }, [active.running, onChange]);

  useEffect(() => { if (complete) setStage("summary"); }, [complete]);

  // Focus moves into the dialog when it opens and when it switches to the summary.
  useEffect(() => { root.current?.focus({ preventScroll: true }); }, [stage]);

  // Audio: after a reload (or ?class=1) the hub's Start button never ran, so the first
  // tap or key press in class mode unlocks the beeps. The clock is suspended on close.
  useEffect(() => {
    const unlock = () => unlockClassAudio();
    window.addEventListener("pointerdown", unlock, { once: true, capture: true });
    window.addEventListener("keydown", unlock, { once: true, capture: true });
    return () => {
      window.removeEventListener("pointerdown", unlock, { capture: true });
      window.removeEventListener("keydown", unlock, { capture: true });
      suspendClassAudio();
    };
  }, []);

  // Screen on while the class is open; re-acquire when the tab comes back.
  const { request: requestWake, release: releaseWake } = wake;
  useEffect(() => {
    void requestWake();
    const onVisible = () => { if (document.visibilityState === "visible") void requestWake(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { document.removeEventListener("visibilitychange", onVisible); void releaseWake(); };
  }, [requestWake, releaseWake]);

  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    };
  }, []);
  const canFullscreen = typeof document !== "undefined" && !!document.documentElement.requestFullscreen;
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void root.current?.requestFullscreen?.().catch(() => {});
  };

  // Lock the page behind the overlay.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Cues: 3-2-1 beeps in class-timer mode, a chime + buzz on every swap.
  const remaining = remainingSeconds(active, session);
  const cue = useRef({ turn: active.turn, phase: active.phase, remaining });
  useEffect(() => {
    const prev = cue.current;
    cue.current = { turn: active.turn, phase: active.phase, remaining };
    const swapped = active.turn > prev.turn || (active.phase === "swap" && prev.phase === "work");
    if (swapped) {
      if (!settings.muted) swapChime();
      buzz([70, 50, 70]);
      haptic("medium");
    } else if (active.running && !settings.muted && remaining != null && remaining !== prev.remaining && remaining >= 1 && remaining <= 3) {
      countdownBeep();
    }
  }, [active.turn, active.phase, remaining, active.running, settings.muted]);

  const t = classTurnAt(session, Math.min(active.turn, total - 1), active.extraRound);
  const station = session.stations[t.station];
  const workerName = active.partners[t.worker];
  const treadmillName = active.partners[t.treadmill];
  const nextTurn = active.turn + 1 < total ? classTurnAt(session, active.turn + 1, active.extraRound) : null;
  const nextStation = nextTurn ? session.stations[nextTurn.station] : null;
  const draft = active.draft?.turn === active.turn ? active.draft : prefill(active.turn, active.records);
  const prior = lastLogFor(history, t.worker, station.id, station.name, workerName);
  const earlier = lastLogFor([{ records: active.records }], t.worker, station.id, station.name, workerName);
  const suggestion = earlier ? null : suggestNext(station, prior, { style: session.style });
  const kind = loadKind(station);
  // Tiles already done in this round (round 3 only repeats the strength stations).
  const perRound = session.stations.length * 2;
  const extraStations = extraStationsFor(session, active.extraRound);
  const inExtraRound = t.round > session.rounds;
  const turnInRound = inExtraRound ? active.turn - perRound * session.rounds : active.turn % perRound;
  const stationDone = (i: number) => turnInRound > i * 2 + 1 || (inExtraRound && i >= extraStations);
  const roundLabel = inExtraRound ? "Strength round 3" : `Round ${t.round}/${session.rounds}`;
  const swapping = active.mode === "timer" && active.phase === "swap";

  const setDraft = (patch: Partial<{ reps: string; weight: string; skipped: boolean }>) =>
    onChange(prev => {
      const base = prev.draft?.turn === prev.turn ? prev.draft : prefill(prev.turn, prev.records);
      return { ...prev, draft: { ...base, ...patch, turn: prev.turn } };
    });

  const swap = useCallback(() => {
    unlockClassAudio();
    haptic("light");
    onChange(prev => swapNow({ ...prev, running: true }, ctx));
  }, [ctx, onChange]);
  const back = () => onChange(prev => backTurn(prev));
  const togglePause = () => { unlockClassAudio(); onChange(prev => ({ ...prev, running: !prev.running })); };
  const endEarly = () => { onChange(prev => ({ ...prev, running: false })); setConfirmEnd(false); setStage("summary"); };

  // Keyboard for TV / laptop: P = pause, N or → = swap, B or ← = back, Esc = close the
  // confirm or minimise. Space and Enter are left to whichever button has focus.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (stage !== "class" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") { e.preventDefault(); if (confirmEnd) setConfirmEnd(false); else onMinimise(); return; }
      if (confirmEnd || target?.closest("input, textarea, select")) return;
      const key = e.key.toLowerCase();
      if (key === "p") { e.preventDefault(); togglePause(); }
      else if (key === "n" || e.key === "ArrowRight") { e.preventDefault(); swap(); }
      else if (key === "b" || e.key === "ArrowLeft") { e.preventDefault(); back(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const clock = active.mode === "timer" ? fmt(remaining ?? 0) : fmt(active.turnElapsed);
  const clockLabel = !active.running ? "Paused" : active.mode === "timer" ? (active.phase === "swap" ? "Swap" : "Work") : "This turn";
  const effort = (slot: PartnerSlot) => Math.round(active.hr[slot].effortSeconds / 60);
  const hrInfo = (slot: PartnerSlot) => ({ slot, name: active.partners[slot], strap: hr.straps[slot], maxHR: maxHR[slot], effortMinutes: effort(slot) });
  const swapLabel = active.turn === total - 1 ? "Finish" : active.mode === "timer" && active.phase === "work" ? "Swap now" : "Swap";
  const liveLine = `${workerName} on station ${t.station + 1}, ${station.name}. ${treadmillName} on the treadmill.`;

  if (stage === "summary") {
    return createPortal(
      <div ref={root} tabIndex={-1} className="pc-class fixed inset-0 z-[85] overflow-y-auto outline-none" role="dialog" aria-modal="true" aria-label="Class summary">
        <Summary
          session={session}
          active={active}
          total={total}
          saving={saving}
          onBack={complete ? undefined : () => setStage("class")}
          onDiscard={onDiscard}
          onSave={async countAsDone => { setSaving(true); try { await onSave(active, countAsDone); } finally { setSaving(false); } }}
        />
      </div>,
      document.body,
    );
  }

  const controls = (
    <div className="flex items-center gap-2">
      <IconButton label="Back one turn" shortcut="B" onClick={back} disabled={active.turn === 0}><ChevronLeft className="h-5 w-5" /></IconButton>
      <IconButton label={active.running ? "Pause" : "Resume"} shortcut="P" onClick={togglePause}>
        {active.running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </IconButton>
      <button type="button" className="pc-btn pc-btn-primary min-h-[56px] flex-1 text-lg" onClick={swap} data-testid="class-swap" title={`${swapLabel} (N)`}>
        <Repeat2 className="h-5 w-5" /> {swapLabel}
      </button>
    </div>
  );

  const stationLine = `${station.shortLabel} ${station.reps}${station.rir ? ` · RIR ${station.rir}` : ""}`;
  const who = (
    <div className="space-y-2.5">
      <div className="pc-panel p-3 lg:p-4">
        <p className="pc-caps text-xs" style={{ color: "var(--pc-teal)" }}>Working · Station {t.station + 1}</p>
        <p className="pc-who mt-1 font-bold" data-testid="class-worker"><span className="pc-caps">{workerName}</span> · {stationLine}</p>
        <p className="pc-sub pc-muted mt-1 line-clamp-2">{station.cue}</p>
        {(station.load || station.alt) && (
          <details className="pc-sub pc-muted mt-1">
            <summary className="cursor-pointer select-none">Load{station.alt ? " & easier swap" : ""}</summary>
            {station.load && <p className="mt-1">{station.load}</p>}
            {station.alt && <p className="mt-1">Swap: {station.alt}</p>}
          </details>
        )}
      </div>
      <div className="pc-panel p-3 lg:p-4">
        <p className="pc-caps text-xs" style={{ color: "var(--pc-amber)" }}><Footprints className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />Treadmill</p>
        <p className="pc-who mt-1" data-testid="class-treadmill"><span className="pc-caps font-bold">{treadmillName}</span> · Treadmill — <span className="pc-muted">{session.treadmill}</span></p>
        {nextTurn && nextStation && (
          <p className="pc-sub pc-muted mt-1">Next: {active.partners[nextTurn.worker]} → {nextStation.shortLabel}{nextTurn.round !== t.round ? ` (${nextTurn.round > session.rounds ? "strength round 3" : `round ${nextTurn.round}`})` : ""}</p>
        )}
        <details className="pc-sub pc-muted mt-1">
          <summary className="cursor-pointer select-none">Swapping on the treadmill</summary>
          <p className="mt-1">{SWAP_SAFETY}</p>
        </details>
      </div>
    </div>
  );

  const loadLabel = kind === "reformer" ? "Springs" : kind === "bodyweight" ? "Load (optional)" : kind === "barbell" ? "Total kg (incl. 20 kg bar)" : "kg per dumbbell";
  const numericLoad = kind === "barbell" || kind === "dumbbell";
  const quickLog = (
    <div className="pc-panel p-3 lg:p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="pc-caps text-xs pc-muted">{workerName}'s log · {roundLabel.toLowerCase()}</p>
        <button
          type="button"
          className="pc-sub rounded-full px-2.5 py-1 font-semibold"
          style={draft.skipped ? { background: "var(--pc-amber)", color: "#2b1a00" } : { border: "1px solid var(--pc-line)" }}
          aria-pressed={!!draft.skipped}
          onClick={() => setDraft({ skipped: !draft.skipped })}
        >
          {draft.skipped ? "Skipped" : "Skip station"}
        </button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2" style={draft.skipped ? { opacity: 0.45 } : undefined}>
        <label className="text-xs font-semibold pc-muted">
          {station.timed ? "Time" : "Reps done"}
          <input
            className="pc-input pc-num mt-1"
            inputMode={station.timed ? "text" : "numeric"}
            value={draft.reps}
            placeholder={repsPlaceholderFor(station)}
            disabled={!!draft.skipped}
            onChange={e => setDraft({ reps: e.target.value })}
            aria-label={`${station.timed ? "Time" : "Reps"} for ${workerName}`}
          />
        </label>
        <label className="text-xs font-semibold pc-muted">
          {loadLabel}
          <input
            className="pc-input pc-num mt-1"
            inputMode={kind === "reformer" ? "text" : "decimal"}
            placeholder={kind === "reformer" ? "e.g. 1 red + 1 blue" : kind === "bodyweight" ? "Bodyweight" : "kg"}
            value={draft.weight}
            disabled={!!draft.skipped}
            onChange={e => setDraft({ weight: e.target.value })}
            onBlur={e => {
              if (!numericLoad) return;
              // "bar + 10 a side" → 40 kg, "2 x 10" → 10 kg, "12,5" → 12.5 kg.
              const n = parseLoadKg(e.target.value, kind === "barbell");
              const tidy = n != null && n > 0 ? formatKg(n) : "";
              if (tidy !== e.target.value.trim()) setDraft({ weight: tidy });
            }}
            aria-label={`Load for ${workerName}`}
          />
        </label>
      </div>
      {earlier && <p className="pc-sub pc-muted mt-2">Round 1: {earlier.repsLogged === false ? "reps not logged" : earlier.reps}{earlier.weight ? ` @ ${earlier.weight}` : ""}</p>}
      {suggestion && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className="pc-sub" data-testid="class-suggestion">{suggestion.text}</p>
          {suggestion.weight && suggestion.weight !== draft.weight && (
            <button type="button" className="pc-btn min-h-[36px] text-sm" onClick={() => setDraft({ weight: suggestion.weight })}>
              Use {suggestion.weight}
            </button>
          )}
        </div>
      )}
      {!suggestion && !earlier && <p className="pc-sub pc-muted mt-2">{prior ? `Last: ${prior.repsLogged === false ? "reps not logged" : prior.reps}${prior.weight ? ` @ ${prior.weight}` : ""}` : "First time — pick a load that leaves the target reps in reserve."}</p>}
    </div>
  );

  const progress = (
    <div className="flex gap-[3px]" role="progressbar" aria-label="Class progress" aria-valuemin={0} aria-valuemax={total} aria-valuenow={active.turn}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className="pc-seg flex-1" data-state={i < active.turn ? "done" : i === active.turn ? "now" : "todo"} />
      ))}
    </div>
  );

  const viewToggle = (
    <IconButton label={view === "hr" ? "Show station grid" : "Show heart-rate screen"} onClick={() => setView(v => (v === "hr" ? "grid" : "hr"))} pressed={view === "hr"}>
      {view === "hr" ? <LayoutGrid className="h-5 w-5" /> : <HeartPulse className="h-5 w-5" />}
    </IconButton>
  );
  const muteToggle = (
    <IconButton label={settings.muted ? "Turn sound on" : "Mute beeps"} onClick={onToggleMute}>
      {settings.muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
    </IconButton>
  );
  const fullscreenToggle = canFullscreen ? (
    <IconButton label={fullscreen ? "Exit full screen" : "Full screen"} onClick={toggleFullscreen}>
      {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
    </IconButton>
  ) : null;
  const minimise = <IconButton label="Minimise class (keeps your place)" shortcut="Esc" onClick={onMinimise}><Minus className="h-5 w-5" /></IconButton>;
  const endButton = (
    <button type="button" className="pc-btn" onClick={() => setConfirmEnd(true)}><Square className="h-4 w-4" /> End class</button>
  );
  const titleBlock = (
    <div className="min-w-0 flex-1">
      <p className="pc-caps pc-sub pc-num" style={{ color: "var(--pc-teal)" }}>{roundLabel} · Turn {Math.min(active.turn + 1, total)}/{total}</p>
      <h1 className="pc-title truncate">{session.title}</h1>
      <p className="pc-sub pc-muted pc-num">Class {fmt(active.elapsed)} · {active.mode === "timer" ? "Class timer" : "Partner pace"}</p>
    </div>
  );
  const clockBlock = (
    <div className={wide ? "text-center" : "flex items-end gap-2"}>
      <p className="pc-clock pc-num" data-testid="class-clock">{clock}</p>
      <p className={`pc-caps pc-sub pc-muted ${wide ? "" : "pb-1.5"}`}>{clockLabel}</p>
    </div>
  );
  const hrTile = (slot: PartnerSlot, variant: "strip" | "screen" | "mini") => (
    <PartnerHRTile key={slot} {...hrInfo(slot)} variant={variant} isSupported={hr.isSupported} onConnect={hr.connect} onDisconnect={hr.disconnect} />
  );

  const hrScreen = (
    <div className="pc-hr-screen flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4 lg:px-8 lg:pb-6">
      <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2 lg:gap-5">{SLOTS.map(slot => hrTile(slot, "screen"))}</div>
      <BluetoothNotice isSupported={hr.isSupported} />
      <div className="pc-panel flex flex-col gap-3 p-3 sm:flex-row sm:items-center lg:p-4">
        <p className="pc-who min-w-0 flex-1 truncate"><span className="pc-caps font-bold">{workerName}</span> · Station {t.station + 1} {station.shortLabel} · <span className="pc-caps font-bold">{treadmillName}</span> on the treadmill</p>
        <div className="sm:w-[380px]">{controls}</div>
      </div>
    </div>
  );

  const wideGrid = (
    <>
      <div className="pc-hr-strip grid grid-cols-2 gap-4 px-8 pb-4 pt-1" data-testid="hr-strip">
        {SLOTS.map(slot => hrTile(slot, "strip"))}
        {!hr.isSupported && <div className="col-span-2 -mt-2"><BluetoothNotice isSupported={false} /></div>}
      </div>
      <div className="flex min-h-0 flex-1 gap-5 px-8 pb-5">
        <div className="grid min-h-0 flex-1 grid-cols-3 grid-rows-3 gap-3 2xl:gap-4" data-testid="class-grid">
          {session.stations.map((s, i) => (
            <ClassTile key={s.id} station={s} number={i + 1} active={i === t.station} done={stationDone(i)} workerName={i === t.station ? workerName : undefined} />
          ))}
        </div>
        <aside className="flex w-[30%] min-w-[340px] max-w-[580px] flex-col gap-2.5 overflow-y-auto">
          {who}
          {quickLog}
          <div className="mt-auto">{controls}</div>
        </aside>
      </div>
    </>
  );

  const activeCard = (
    <div className="pc-tile pc-active-card gap-3" data-active="true" data-block={station.block} style={{ transform: "none", flexDirection: "row" }}>
      <div className="pc-art relative aspect-square w-[44%] shrink-0">
        <StationArt station={station} animate fallbackSize={150} />
        <span className="pc-badge pc-num absolute left-1.5 top-1.5">{t.station + 1}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <p className="pc-caps text-xs text-move">{station.block} · {workerName}</p>
        <p className="pc-caps text-[22px]">{station.shortLabel}</p>
        <p className="pc-num text-lg font-semibold">{station.reps}</p>
        <p className="pc-sub pc-muted pc-num">{[station.rir && `RIR ${station.rir}`, station.tempo && `tempo ${station.tempo}`].filter(Boolean).join(" · ")}</p>
      </div>
    </div>
  );

  const landscapeScreen = (
    <div className="pc-landscape-body">
      <div className="pc-landscape-exercise">
        {activeCard}
        <div className="pc-landscape-hr grid grid-cols-2 gap-2">{SLOTS.map(slot => hrTile(slot, "mini"))}</div>
      </div>
      <aside className="pc-landscape-info">
        {quickLog}
        {who}
        <BluetoothNotice isSupported={hr.isSupported} />
      </aside>
      <div className="pc-landscape-controls">{controls}</div>
    </div>
  );

  const phoneStack = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-4">
        {activeCard}
        <div className="grid grid-cols-2 gap-2">{SLOTS.map(slot => hrTile(slot, "mini"))}</div>
        <BluetoothNotice isSupported={hr.isSupported} />
        <div className="flex justify-between gap-1" aria-label="Stations">
          {session.stations.map((s, i) => (
            <span
              key={s.id}
              className="pc-station-dot pc-num flex h-9 w-9 items-center justify-center rounded-full text-sm font-extrabold"
              data-block={s.block}
              data-done={stationDone(i)}
              aria-current={i === t.station ? "step" : undefined}
              title={s.shortLabel}
            >{i + 1}</span>
          ))}
        </div>
        {quickLog}
        {who}
        <div className="flex justify-center pt-1">{endButton}</div>
      </div>
      <div className="pc-footer border-t px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3">
        {controls}
      </div>
    </div>
  );

  return createPortal(
    <div ref={root} tabIndex={-1} className="pc-class fixed inset-0 z-[85] flex flex-col overflow-hidden outline-none" data-landscape={landscape} role="dialog" aria-modal="true" aria-label={`${session.title} — class mode`} data-testid="class-mode">
      <p className="sr-only" aria-live="polite" aria-atomic="true">{liveLine}</p>
      {wide || landscape ? (
        <header className="pc-class-header flex items-center gap-4 px-8 pb-2 pt-5">
          {titleBlock}
          {clockBlock}
          <div className="flex flex-1 items-center justify-end gap-2">{viewToggle}{muteToggle}{fullscreenToggle}{endButton}{minimise}</div>
        </header>
      ) : (
        <header className="px-4 pt-[max(12px,env(safe-area-inset-top))]">
          <div className="flex items-start gap-2">{titleBlock}{minimise}</div>
          <div className="mt-1 flex items-center gap-2 pb-2">
            {clockBlock}
            <div className="ml-auto flex gap-2">{viewToggle}{muteToggle}{fullscreenToggle}</div>
          </div>
        </header>
      )}

      <div className={`pc-class-progress pb-3 ${wide ? "px-8" : "px-4"}`}>{progress}</div>

      {swapping && (
        <div className={`pb-3 ${wide ? "px-8" : "px-4"}`} role="status">
          <p className="pc-panel pc-sub px-3 py-2" style={{ borderColor: "var(--pc-amber)" }}><strong className="pc-caps" style={{ color: "var(--pc-amber)" }}>Swap · </strong>{SWAP_SAFETY}</p>
        </div>
      )}

      {view === "hr" ? hrScreen : landscape ? landscapeScreen : wide ? wideGrid : phoneStack}

      {confirmEnd && (
        <div className="pc-end-overlay absolute inset-0 z-10 flex items-center justify-center p-6" role="alertdialog" aria-modal="true" aria-labelledby="pc-end-title" aria-describedby="pc-end-desc">
          <div className="pc-panel w-full max-w-md space-y-4 p-5">
            <p id="pc-end-title" className="pc-title">End the class now?</p>
            <p id="pc-end-desc" className="pc-sub pc-muted">{active.turn} of {total} turns logged. You can save what you've done or keep going.</p>
            <div className="flex gap-2">
              <button type="button" className="pc-btn flex-1" autoFocus onClick={() => setConfirmEnd(false)}>Keep going</button>
              <button type="button" className="pc-btn pc-btn-primary flex-1" onClick={endEarly}>End class</button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}

function IconButton({ label, onClick, children, disabled, pressed, shortcut, className = "" }: { label: string; onClick: () => void; children: ReactNode; disabled?: boolean; pressed?: boolean; shortcut?: string; className?: string }) {
  return (
    <button
      type="button"
      className={`pc-btn pc-btn-icon ${className}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-keyshortcuts={shortcut}
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-pressed={pressed}
      style={disabled ? { opacity: 0.4 } : pressed ? { background: "var(--pc-teal)", color: "#062420" } : undefined}
    >
      {children}
    </button>
  );
}

function Summary({ session, active, total, saving, onBack, onDiscard, onSave }: {
  session: PartnerSession;
  active: ActiveClass;
  total: number;
  saving: boolean;
  onBack?: () => void;
  onDiscard: () => void;
  onSave: (countAsDone: boolean) => void;
}) {
  const complete = active.turn >= total;
  const [countAsDone, setCountAsDone] = useState(complete || active.turn >= total / 2);
  const skipped = active.records.filter(r => r.completed === false).length;
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  return (
    <div className="mx-auto flex min-h-full max-w-5xl flex-col gap-5 px-4 py-6 lg:px-8 lg:py-10" data-testid="class-summary">
      <div>
        <p className="pc-caps pc-sub" style={{ color: "var(--pc-teal)" }}>{complete ? "Class complete" : `Ended early · ${active.turn} of ${total} turns`}</p>
        <h1 className="mt-1 text-3xl font-extrabold lg:text-5xl">{session.title}</h1>
        <p className="pc-sub pc-muted mt-1 pc-num">Class time {fmt(active.elapsed)}{skipped ? ` · ${skipped} station${skipped === 1 ? "" : "s"} skipped` : ""}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {SLOTS.map(slot => {
          const s = summarisePartner(active.records, slot);
          const h = hrSummary(active.hr[slot]);
          return (
            <div key={slot} className="pc-panel p-5" data-testid={`summary-${slot}`}>
              <p className="pc-caps text-xl">{active.partners[slot]}</p>
              <dl className="mt-3 grid grid-cols-2 gap-3 pc-num">
                <Stat label="Sets done" value={String(s.sets)} />
                <Stat label="Total kg moved" value={s.kg ? `${s.kg.toLocaleString("en-NZ")} kg` : "—"} />
                <Stat label="Working time" value={fmt(s.seconds)} />
                <Stat label="Effort minutes" value={h ? String(h.effortMinutes) : "—"} />
                <Stat label="Avg HR" value={h ? `${h.avg} bpm` : "—"} />
                <Stat label="Max HR" value={h ? `${h.max} bpm` : "—"} />
              </dl>
            </div>
          );
        })}
      </div>
      <label className="flex items-center gap-3 text-base">
        <input type="checkbox" className="h-5 w-5 accent-[#2ee6c5]" checked={countAsDone} onChange={e => setCountAsDone(e.target.checked)} />
        Tick off {session.title} in the 8-week plan
      </label>
      {!countAsDone && <p className="pc-sub pc-muted -mt-3">Saved to your log and loads, but the plan keeps offering this session.</p>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="button" className="pc-btn pc-btn-primary min-h-[56px] flex-1 text-lg" disabled={saving} onClick={() => onSave(countAsDone)} data-testid="class-save">
          {saving ? "Saving…" : "Save session"}
        </button>
        {onBack && <button type="button" className="pc-btn min-h-[56px] flex-1" onClick={onBack}>Back to class</button>}
      </div>
      {confirmDiscard ? (
        <div className="flex flex-wrap items-center gap-2">
          <p className="pc-sub">Discard this class? Nothing will be saved.</p>
          <button type="button" className="pc-btn" onClick={onDiscard}>Discard</button>
          <button type="button" className="pc-btn" onClick={() => setConfirmDiscard(false)}>Keep it</button>
        </div>
      ) : (
        <button type="button" className="pc-sub pc-muted self-start underline" onClick={() => setConfirmDiscard(true)}>Discard without saving</button>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider opacity-70">{label}</dt>
      <dd className="text-2xl font-extrabold">{value}</dd>
    </div>
  );
}

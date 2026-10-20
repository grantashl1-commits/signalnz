/**
 * Tiny WebAudio cue player for class mode: short beeps on 3-2-1 and a
 * two-tone chime on each swap. The AudioContext is created (or resumed) on a
 * user gesture — Start class, or the first tap or key press inside class mode
 * after a reload — so autoplay rules are satisfied. Cues mix with the
 * member's own music instead of pausing it where the browser allows.
 */
type Ctx = AudioContext;
let ctx: Ctx | null = null;

export function unlockClassAudio(): void {
  try {
    // iOS 16.4+: "ambient" cues mix with music rather than interrupting it.
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "ambient") session.type = "ambient";
  } catch { /* not supported */ }
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === "suspended") void ctx.resume();
  } catch { /* audio unavailable */ }
}

/** Pause the audio clock when class mode closes (resumed by the next gesture). */
export function suspendClassAudio(): void {
  try { if (ctx && ctx.state === "running") void ctx.suspend(); } catch { /* ignore */ }
}

function tone(freq: number, start: number, duration: number, gain = 0.18) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.015);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(amp).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function countdownBeep(): void {
  if (!ctx) return;
  try { tone(880, ctx.currentTime, 0.14); } catch { /* ignore */ }
}

export function swapChime(): void {
  if (!ctx) return;
  try {
    const t = ctx.currentTime;
    tone(660, t, 0.16, 0.2);
    tone(990, t + 0.17, 0.28, 0.22);
  } catch { /* ignore */ }
}

export function buzz(pattern: number | number[]): void {
  try { navigator.vibrate?.(pattern); } catch { /* ignore */ }
}

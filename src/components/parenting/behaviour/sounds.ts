// Tiny WebAudio chime / buzzer — no asset deps.
let ctx: AudioContext | null = null;
function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try { ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch { return null; }
  }
  return ctx;
}

export function playChime() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  [880, 1320].forEach((freq, i) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, now + i * 0.08);
    g.gain.exponentialRampToValueAtTime(0.18, now + i * 0.08 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.45);
    o.connect(g).connect(c.destination);
    o.start(now + i * 0.08);
    o.stop(now + i * 0.08 + 0.5);
  });
}

export function playBuzz() {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "square";
  o.frequency.setValueAtTime(180, now);
  o.frequency.linearRampToValueAtTime(120, now + 0.25);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
  o.connect(g).connect(c.destination);
  o.start(now);
  o.stop(now + 0.32);
}

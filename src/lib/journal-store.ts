// Shared journal data types and localStorage helpers

export const PROMPTS = [
  { key: "proud", label: "Today I was proud of...", ph: "Even the smallest thing counts. What showed up in you today that deserves acknowledgement?", rows: 3 },
  { key: "feeling", label: "Today I felt...", ph: "What emotions visited you? Where did you feel them in your body?", rows: 3 },
  { key: "grateful", label: "Today I was grateful for...", ph: "What moments, people or small things brought a sense of thankfulness?", rows: 3 },
  { key: "working_towards", label: "Right now I am working towards...", ph: "What intention, goal or change are you nurturing in yourself?", rows: 3 },
  { key: "challenge", label: "Today didn't go well when...", ph: "What felt hard? Which part of you struggled?", rows: 3 },
  { key: "body", label: "In my body today I noticed...", ph: "Where did you hold tension or ease? What was your body communicating?", rows: 3 },
  { key: "inner_voice", label: "My inner voice said today...", ph: "What did the self-critic, the worrier, or the inner child say?", rows: 3 },
  { key: "desire", label: "Something I secretly want...", ph: "What do you yearn for but haven't let yourself fully claim yet?", rows: 3 },
  { key: "tomorrow", label: "Tomorrow I will...", ph: "One intention. One act of self-care or courage.", rows: 2 },
  { key: "free", label: "Anything on my mind...", ph: "This space belongs entirely to you.", rows: 5 },
];

export const TRACKING = [
  { key: "mood", label: "Mood", max: 10 },
  { key: "energy", label: "Energy", max: 10 },
];

export const MILESTONES = [
  { count: 7, label: "1-Week Reflection", type: "weekly" },
  { count: 14, label: "2-Week Reflection", type: "weekly" },
  { count: 21, label: "3-Week Reflection", type: "weekly" },
  { count: 30, label: "Monthly Reflection", type: "monthly" },
  { count: 90, label: "3-Month Reflection", type: "quarterly" },
  { count: 180, label: "6-Month Reflection", type: "biannual" },
  { count: 365, label: "Yearly Reflection", type: "yearly" },
];

// ── Entry Types ───────────────────────────────────────────────
export const ENTRY_TYPES = [
  { key: "free-write", label: "Free Write", desc: "Write whatever is on your mind", tone: "reflection" },
  { key: "guided-prompt", label: "Guided Prompt", desc: "Use reflective prompts", tone: "reflection" },
  { key: "tiny-win", label: "Tiny Win", desc: "Celebrate a small victory", tone: "celebrate" },
  { key: "funny-moment", label: "Funny Moment", desc: "Capture something that made you laugh", tone: "joy" },
  { key: "gratitude-note", label: "Gratitude Note", desc: "Acknowledge what you are grateful for", tone: "gratitude" },
  { key: "letter-future-self", label: "Letter to Future Self", desc: "Write to who you are becoming", tone: "dream" },
  { key: "dream-entry", label: "Dream Entry", desc: "Record a dream or aspiration", tone: "dream" },
  { key: "goal-reflection", label: "Goal Reflection", desc: "Reflect on your goals and progress", tone: "growth" },
  { key: "release", label: "Release", desc: "Let go of something weighing on you", tone: "release" },
  { key: "lesson-learned", label: "Lesson Learned", desc: "Reflect on something you discovered", tone: "lesson" },
];

export const EMOTIONAL_TONES: Record<string, { label: string; color: string }> = {
  reflection: { label: "Reflection", color: "bg-primary/10 text-primary" },
  celebrate: { label: "Celebrate", color: "bg-phase-follicular/10 text-phase-follicular" },
  joy: { label: "Joy", color: "bg-accent/10 text-accent" },
  gratitude: { label: "Gratitude", color: "bg-phase-ovulatory/10 text-phase-ovulatory" },
  dream: { label: "Dream", color: "bg-primary/10 text-primary" },
  growth: { label: "Growth", color: "bg-phase-follicular/10 text-phase-follicular" },
  release: { label: "Release", color: "bg-phase-menstrual/10 text-phase-menstrual" },
  lesson: { label: "Lesson", color: "bg-accent/10 text-accent" },
};

// ── Core Types ────────────────────────────────────────────────
export interface JournalEntry {
  id: string;
  date: string;
  timestamp: number;
  prompts: Record<string, string>;
  tracking: Record<string, number>;
  tags: string[];
  ai: any | null;
  entryType?: string;
  title?: string;
  emotionalTone?: string;
  savedToVault?: boolean;
  pinnedToDreamStudio?: boolean;
  vaultCategory?: string;
}

export interface MilestoneAnalysis {
  milestoneType: string;
  count: number;
  date: string;
  analysis: any;
}

export interface VaultEntry {
  id: string;
  entryId: string;
  category: string;
  title: string;
  preview: string;
  date: string;
  timestamp: number;
}

export interface DreamElement {
  id: string;
  type: "image" | "text" | "quote" | "goal" | "affirmation" | "label" | "prompt";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  linkedEntryId?: string;
  imageUrl?: string;
  styleVariant?: string;
  targetDate?: string;
  status?: string;
  color?: string;
}

export interface DreamConnection {
  id: string;
  fromId: string;
  toId: string;
  label?: string;
  color?: string;
}

export interface DreamBoard {
  id: string;
  title: string;
  elements: DreamElement[];
  connections: DreamConnection[];
  zoom: number;
  panX: number;
  panY: number;
  createdAt: number;
  coverColor?: string;
}

// ── Storage Helpers ───────────────────────────────────────────
export function loadEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem("mindcast_journal_v2");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveEntries(entries: JournalEntry[]) {
  localStorage.setItem("mindcast_journal_v2", JSON.stringify(entries));
}

export function loadMilestones(): MilestoneAnalysis[] {
  try {
    const raw = localStorage.getItem("mindcast_milestones");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveMilestones(milestones: MilestoneAnalysis[]) {
  localStorage.setItem("mindcast_milestones", JSON.stringify(milestones));
}

export function getNextMilestone(entryCount: number, completedMilestones: MilestoneAnalysis[]) {
  const completedCounts = new Set(completedMilestones.map((m) => m.count));
  return MILESTONES.find((m) => entryCount >= m.count && !completedCounts.has(m.count)) || null;
}

export function loadVault(): VaultEntry[] {
  try {
    const raw = localStorage.getItem("signal_vault");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveVault(entries: VaultEntry[]) {
  localStorage.setItem("signal_vault", JSON.stringify(entries));
}

export function loadDreamBoard(): DreamElement[] {
  try {
    const raw = localStorage.getItem("signal_dream_board");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveDreamBoard(elements: DreamElement[]) {
  localStorage.setItem("signal_dream_board", JSON.stringify(elements));
}

// ── Resurfacing helpers ───────────────────────────────────────
export function getResurfacingMemories(vault: VaultEntry[]): { label: string; entry: VaultEntry }[] {
  if (vault.length === 0) return [];
  const now = Date.now();
  const results: { label: string; entry: VaultEntry }[] = [];

  // On this day (within 2 days of same month/day from previous years)
  const today = new Date();
  for (const v of vault) {
    const d = new Date(v.timestamp);
    if (d.getMonth() === today.getMonth() && d.getDate() === today.getDate() && d.getFullYear() < today.getFullYear()) {
      results.push({ label: "On this day", entry: v });
      break;
    }
  }

  // A memory from ~3 months ago
  const threeMonthsAgo = now - 90 * 24 * 60 * 60 * 1000;
  const nearThreeMonths = vault.find((v) => Math.abs(v.timestamp - threeMonthsAgo) < 14 * 24 * 60 * 60 * 1000);
  if (nearThreeMonths) results.push({ label: "A memory from 3 months ago", entry: nearThreeMonths });

  // Random past note
  if (vault.length > 3 && results.length < 2) {
    const older = vault.filter((v) => now - v.timestamp > 30 * 24 * 60 * 60 * 1000);
    if (older.length > 0) {
      const random = older[Math.floor(Math.random() * older.length)];
      results.push({ label: "A note your past self left you", entry: random });
    }
  }

  return results;
}

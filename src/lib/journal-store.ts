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
  type: "image" | "text" | "quote" | "goal" | "affirmation";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

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

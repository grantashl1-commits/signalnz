/**
 * Persistent feed theme weights. Users can mark themes as "more" or "less".
 * Stored in localStorage as a Record<theme, 1 | -1>.
 */
const KEY = "signal_feed_theme_weights";

export type ThemeWeight = 1 | -1;
export type ThemeWeights = Record<string, ThemeWeight>;

export function loadThemeWeights(): ThemeWeights {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveThemeWeights(w: ThemeWeights) {
  try {
    localStorage.setItem(KEY, JSON.stringify(w));
  } catch {}
}

export function setThemeWeight(theme: string, weight: ThemeWeight | 0): ThemeWeights {
  const cur = loadThemeWeights();
  if (weight === 0) {
    delete cur[theme];
  } else {
    cur[theme] = weight;
  }
  saveThemeWeights(cur);
  return cur;
}

/** Score: sum of weights across post.themes. Higher = more wanted. */
export function scorePost(themes: string[] | undefined, weights: ThemeWeights): number {
  if (!themes || !themes.length) return 0;
  let s = 0;
  for (const t of themes) s += weights[t] || 0;
  return s;
}

export const COMMON_THEMES = [
  "sleep",
  "hormones",
  "nutrition",
  "exercise",
  "mental-health",
  "mindfulness",
  "relationships",
  "habits",
  "self-care",
  "stress",
  "women",
  "parenting",
  "spirituality",
  "career",
];

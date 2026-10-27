export const OWNER_KEY = "signal_device_owner";

// Personal content and preferences written by Signal (journal, cycle, meals, habits…).
const PERSONAL = [
  /^signal_/,
  /^mindcast/,
  /^(cycleStartDate|cycleMode|cycleModeSelected|periodIrregularFlag|weightUnit|workoutSessions|measurementDates|mealPrepPreferences|pantry_staples|disliked_recipes|shopping_hide_pantry)$/,
  /^(weeklyPlan|eaten|symptoms|periodEnd|mood|notes|weight|measurements|progressPhoto|seedCycling):/,
  /^(supplements_done_|plant_log_|prep_dismissed_|welcome_sent_)/,
];

export const isPersonal = (key: string) => key !== OWNER_KEY && key !== "signal_device_switch_pending" && PERSONAL.some(re => re.test(key));


const ARCHIVE_PREFIX = "signal-account-cache:";
let epoch = 0;

/** Capture before an await or debounce; never apply its result to a new account. */
export function captureDeviceScope() {
  const owner = localStorage.getItem(OWNER_KEY);
  const version = epoch;
  return {
    owner,
    valid: () => version === epoch && localStorage.getItem(OWNER_KEY) === owner,
    matches: (uid: string | null | undefined) => !!uid && owner === uid && version === epoch && localStorage.getItem(OWNER_KEY) === owner,
  };
}

/** Swap the active legacy cache, preserving offline data in an account-owned archive.
 * Unowned legacy data is quarantined rather than silently uploaded to the first login.
 * Storage failures propagate: callers must not render another account's cache.
 */
export function claimDevice(userId: string | null, _isAnonymous = false): boolean {
  const nextOwner = userId ?? 'guest';
  const owner = localStorage.getItem(OWNER_KEY);
  const pending = localStorage.getItem("signal_device_switch_pending");
  if (owner === nextOwner && !pending) return false;
  epoch++;
  const keys = Array.from({length: localStorage.length}, (_, i) => localStorage.key(i)).filter((k): k is string => !!k && isPersonal(k));
  const snapshot = Object.fromEntries(keys.map(k => [k, localStorage.getItem(k)]));
  // Archive first. If quota is exhausted, keep the current data and block the switch.
  if (keys.length && !pending) localStorage.setItem(ARCHIVE_PREFIX + (owner ?? 'unassigned'), JSON.stringify(snapshot));
  const raw = localStorage.getItem(ARCHIVE_PREFIX + nextOwner);
  const restored: Record<string, unknown> = raw ? JSON.parse(raw) : {};
  localStorage.setItem("signal_device_switch_pending", "1");
  keys.forEach(k => localStorage.removeItem(k));
  for (const [key, value] of Object.entries(restored)) {
    if (isPersonal(key) && typeof value === 'string') localStorage.setItem(key, value);
  }
  localStorage.setItem(OWNER_KEY, nextOwner);
  localStorage.removeItem("signal_device_switch_pending");
  return true;
}

/**
 * Signal keeps a lot on the device so it works offline (journal, cycle logs,
 * meals, habits). On a shared phone or iPad that would let the next person who
 * signs in read the last person's entries. The device remembers whose data it
 * holds; when a *different* account signs in, the previous account's personal
 * data is removed first. The same person signing back in keeps everything.
 */
const OWNER_KEY = "signal_device_owner";

// Personal content and preferences written by Signal (journal, cycle, meals, habits…).
const PERSONAL = [
  /^signal_/,
  /^mindcast/,
  /^(cycleStartDate|cycleModeSelected|periodIrregularFlag|weightUnit|workoutSessions|measurementDates|mealPrepPreferences|pantry_staples|disliked_recipes|shopping_hide_pantry)$/,
  /^(eaten|symptoms|periodEnd|mood|notes|weight|measurements|progressPhoto|seedCycling):/,
  /^(supplements_done_|plant_log_|prep_dismissed_|welcome_sent_)/,
];

const isPersonal = (key: string) => key !== OWNER_KEY && PERSONAL.some(re => re.test(key));

/** Returns true when another account's data was cleared (the caller should reload). */
export function claimDevice(userId: string, isAnonymous = false): boolean {
  try {
    // A Connect partner's private sign-in never claims or clears the device.
    if (isAnonymous) return false;
    const owner = localStorage.getItem(OWNER_KEY);
    localStorage.setItem(OWNER_KEY, userId);
    if (!owner || owner === userId) return false;
    const keys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)).filter((k): k is string => !!k);
    keys.filter(isPersonal).forEach(k => localStorage.removeItem(k));
    return true;
  } catch {
    return false;
  }
}

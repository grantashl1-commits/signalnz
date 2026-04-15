import { AIMealPlan, AIMeal, AIPlannedDay, PrepPreferences } from "./weekly-planner";

// ─── Types ─────────────────────────────────────────────────

export interface PrepTask {
  id: string;
  description: string;
  /** Which meal this supports */
  mealName: string;
  /** Day the meal is served */
  servingDay: string;
  /** Date string ISO */
  servingDate: string;
  /** Hours before serving this should be done */
  hoursInAdvance: number;
  /** When the task should be performed (ISO date string) */
  prepDate: string;
  /** Time of day hint */
  timeHint: string;
  /** Category: batch | advance | morning | defrost */
  category: "batch" | "advance" | "morning" | "defrost";
}

export interface PrepDayPlan {
  dayName: string;
  date: string;
  isPrepDay: boolean;
  tasks: PrepTask[];
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ─── Keyword-based prep detection ─────────────────────────

interface PrepHint {
  keyword: RegExp;
  category: PrepTask["category"];
  hoursInAdvance: number;
  taskTemplate: (mealName: string) => string;
  timeHint: string;
}

const PREP_HINTS: PrepHint[] = [
  { keyword: /slow\s*cook/i, category: "morning", hoursInAdvance: 8, taskTemplate: (m) => `Put ingredients in slow cooker for ${m}`, timeHint: "Morning" },
  { keyword: /marinat/i, category: "advance", hoursInAdvance: 4, taskTemplate: (m) => `Start marinating for ${m}`, timeHint: "Lunchtime" },
  { keyword: /overnight/i, category: "advance", hoursInAdvance: 12, taskTemplate: (m) => `Prepare ${m} (soak overnight)`, timeHint: "Night before" },
  { keyword: /soak/i, category: "advance", hoursInAdvance: 8, taskTemplate: (m) => `Soak ingredients for ${m}`, timeHint: "Morning" },
  { keyword: /defrost|thaw/i, category: "defrost", hoursInAdvance: 12, taskTemplate: (m) => `Move ingredients to fridge to defrost for ${m}`, timeHint: "Night before" },
  { keyword: /ferment|culture/i, category: "advance", hoursInAdvance: 24, taskTemplate: (m) => `Start fermenting for ${m}`, timeHint: "Day before" },
  { keyword: /dough|rise/i, category: "advance", hoursInAdvance: 3, taskTemplate: (m) => `Make dough and let it rise for ${m}`, timeHint: "Afternoon" },
  { keyword: /chill|set|refrigerat/i, category: "advance", hoursInAdvance: 4, taskTemplate: (m) => `Prepare ${m} and refrigerate to set`, timeHint: "Afternoon" },
  { keyword: /broth|stock/i, category: "batch", hoursInAdvance: 0, taskTemplate: (m) => `Make broth/stock for ${m}`, timeHint: "Prep day" },
];

// Detect if a meal can be batch-prepped (appears multiple times or is inherently batchable)
const BATCH_KEYWORDS = /overnight\s*oat|bliss\s*ball|energy\s*ball|granola|muesli|hummus|pesto|dressing|sauce|ice\s*cream|nice\s*cream|dip|batch|muffin|bar|slice|cookie|cracker/i;

function parsePrepMinutes(prepTime: string): number {
  const match = prepTime.match(/(\d+)/);
  return match ? parseInt(match[1]) : 15;
}

// ─── Generator ────────────────────────────────────────────

export function generatePrepGuide(
  plan: AIMealPlan,
  weekNumber: number,
  weekDates: { date: Date; dateStr: string; dayName: string }[]
): PrepDayPlan[] {
  const prefs = plan.prepPreferences;
  const prepDayNames = prefs.prepDays || ["Sunday"];

  const startDay = (weekNumber - 1) * 7 + 1;
  const endDay = weekNumber * 7;
  const weekMeals = plan.days.filter(d => d.cycleDay >= startDay && d.cycleDay <= endDay);

  const allTasks: PrepTask[] = [];
  let taskId = 0;

  // Map cycle days to calendar dates
  const cycleDayToDate = new Map<number, { date: string; dayName: string }>();
  weekDates.forEach((wd, i) => {
    const cd = startDay + i;
    if (cd <= endDay) {
      cycleDayToDate.set(cd, { date: wd.dateStr, dayName: wd.dayName });
    }
  });

  // Find the prep day date (first prep day in the week)
  const prepDayDate = weekDates.find(wd => prepDayNames.includes(wd.dayName));

  // 1. Detect batch-prep items (same breakfast repeated, batchable snacks, etc.)
  const breakfastCounts = new Map<string, number>();
  const snackCounts = new Map<string, number>();
  weekMeals.forEach(day => {
    if (!day.breakfast.isLeftover) {
      const n = day.breakfast.name;
      breakfastCounts.set(n, (breakfastCounts.get(n) || 0) + 1);
    }
    [day.morningSnack, day.afternoonSnack].forEach(s => {
      if (s && !s.isLeftover) {
        snackCounts.set(s.name, (snackCounts.get(s.name) || 0) + 1);
      }
    });
  });

  // Batch breakfasts appearing 3+ times
  breakfastCounts.forEach((count, name) => {
    if (count >= 3 || BATCH_KEYWORDS.test(name)) {
      allTasks.push({
        id: `prep-${taskId++}`,
        description: `Make ${count} serves of ${name}`,
        mealName: name,
        servingDay: weekDates[0]?.dayName || "Monday",
        servingDate: weekDates[0]?.dateStr || "",
        hoursInAdvance: 0,
        prepDate: prepDayDate?.dateStr || weekDates[0]?.dateStr || "",
        timeHint: "Prep day",
        category: "batch",
      });
    }
  });

  // Batch snacks appearing 3+ times or matching batch keywords
  snackCounts.forEach((count, name) => {
    if (count >= 3 || BATCH_KEYWORDS.test(name)) {
      allTasks.push({
        id: `prep-${taskId++}`,
        description: `Make a batch of ${name} (${count} serves)`,
        mealName: name,
        servingDay: weekDates[0]?.dayName || "Monday",
        servingDate: weekDates[0]?.dateStr || "",
        hoursInAdvance: 0,
        prepDate: prepDayDate?.dateStr || weekDates[0]?.dateStr || "",
        timeHint: "Prep day",
        category: "batch",
      });
    }
  });

  // 2. Check each meal for advance-prep keywords
  weekMeals.forEach(day => {
    const dateInfo = cycleDayToDate.get(day.cycleDay);
    if (!dateInfo) return;

    const meals: { meal: AIMeal; label: string }[] = [
      { meal: day.breakfast, label: "breakfast" },
      { meal: day.lunch, label: "lunch" },
      { meal: day.dinner, label: "dinner" },
    ];

    meals.forEach(({ meal, label }) => {
      if (meal.isLeftover) return;

      // Check ingredients and method for prep hints
      const allText = [...meal.ingredients, ...meal.method].join(" ");

      PREP_HINTS.forEach(hint => {
        if (hint.keyword.test(allText) || hint.keyword.test(meal.name)) {
          // Calculate prep date
          const servingDate = new Date(dateInfo.date + "T12:00:00");
          const prepDate = new Date(servingDate.getTime() - hint.hoursInAdvance * 3600000);
          const prepDateStr = prepDate.toISOString().split("T")[0];

          // Avoid duplicating batch items
          const isDuplicate = allTasks.some(t =>
            t.mealName === meal.name && t.category === hint.category
          );
          if (isDuplicate) return;

          allTasks.push({
            id: `prep-${taskId++}`,
            description: hint.taskTemplate(meal.name),
            mealName: meal.name,
            servingDay: dateInfo.dayName,
            servingDate: dateInfo.date,
            hoursInAdvance: hint.hoursInAdvance,
            prepDate: prepDateStr,
            timeHint: hint.timeHint,
            category: hint.category,
          });
        }
      });
    });

    // 3. Dinner that should be frozen from prep day
    if (day.dinner && !day.dinner.isLeftover) {
      const prepMins = parsePrepMinutes(day.dinner.prepTime);
      if (prepMins >= 45 && prepDayDate && dateInfo.date !== prepDayDate.dateStr) {
        // Long-prep dinner — suggest cooking on prep day and freezing
        const exists = allTasks.some(t => t.mealName === day.dinner.name && t.category === "batch");
        if (!exists) {
          allTasks.push({
            id: `prep-${taskId++}`,
            description: `Cook ${day.dinner.name} and freeze for ${dateInfo.dayName}`,
            mealName: day.dinner.name,
            servingDay: dateInfo.dayName,
            servingDate: dateInfo.date,
            hoursInAdvance: 0,
            prepDate: prepDayDate.dateStr,
            timeHint: "Prep day",
            category: "batch",
          });
        }
      }
    }
  });

  // Group tasks by date
  const dateMap = new Map<string, PrepTask[]>();
  allTasks.forEach(task => {
    const existing = dateMap.get(task.prepDate) || [];
    existing.push(task);
    dateMap.set(task.prepDate, existing);
  });

  // Build output: one entry per day of the week
  const result: PrepDayPlan[] = weekDates.map(wd => ({
    dayName: wd.dayName,
    date: wd.dateStr,
    isPrepDay: prepDayNames.includes(wd.dayName),
    tasks: dateMap.get(wd.dateStr) || [],
  }));

  return result;
}

/** Generate todo title strings from prep tasks for auto-adding to the todo list */
export function prepTaskToTodoTitle(task: PrepTask): string {
  if (task.timeHint === "Morning") {
    return `🍳 ${task.description}`;
  }
  if (task.timeHint === "Night before") {
    return `🌙 ${task.description}`;
  }
  if (task.category === "batch") {
    return `📦 ${task.description}`;
  }
  return `🔪 ${task.description}`;
}

---
name: Meal Prep Guide
description: Weekly prep guide that analyzes meal plan for batch-prep, advance-prep, and time-sensitive tasks with auto-add to To-Do list
type: feature
---
The Meal Prep Guide (`src/lib/prep-guide.ts` + `src/components/nutrition/MealPrepGuide.tsx`) analyzes the AI meal plan and generates:
- **Batch tasks** for prep day: repeated breakfasts (3+ times), batchable snacks (bliss balls, granola, etc.), long-prep dinners (45+ min) to cook & freeze
- **Advance prep** tasks: marinating, soaking, dough rising, fermenting
- **Morning prep**: slow cooker setup (8h before)
- **Defrost** reminders: night-before defrost tasks

Tasks are auto-grouped by calendar date. Users can add individual tasks or all tasks at once to their To-Do list via `useTodos.addTodo()`. Emoji prefixes: 📦 batch, 🍳 morning, 🌙 night-before, 🔪 general.

Accessed via "Prep guide" link in MyWeekTab (step: "prepguide"). Requires an AI plan to be generated first.

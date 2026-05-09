/**
 * One-shot ingest: read the three Supabase CSV exports
 *   - program_phases-export-*.csv
 *   - workout_templates-export-*.csv
 *   - workout_exercises-export-*.csv
 *
 * Join them by phase_id and workout_id, group by program_id, and emit
 * src/data/training-csv-enrichment.json. The runtime helper in
 * src/lib/training-csv-enrichment.ts merges this onto the SIGNAL paths.
 *
 * Usage (CSVs in ~/Downloads):
 *   node scripts/ingest-training-csvs.mjs \
 *     "C:/Users/grant/Downloads/program_phases-export-2026-05-10_00-04-23.csv" \
 *     "C:/Users/grant/Downloads/workout_templates-export-2026-05-10_00-02-45.csv" \
 *     "C:/Users/grant/Downloads/workout_exercises-export-2026-05-10_00-03-42.csv"
 *
 * If no args are passed, the latest matching files in ~/Downloads are picked up.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

// CSV uses ; as separator and contains commas/quotes inside fields.
// This parser handles RFC 4180-style double-quoted fields with embedded ;.
function parseCsv(text) {
  const rows = [];
  let cur = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ";") { cur.push(field); field = ""; }
      else if (c === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; }
      else if (c === "\r") {/* skip */}
      else field += c;
    }
  }
  if (field.length || cur.length) { cur.push(field); rows.push(cur); }
  if (!rows.length) return [];
  const headers = rows[0];
  return rows.slice(1).filter(r => r.some(v => v !== "")).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""])));
}

function findLatest(dir, prefix) {
  const matches = readdirSync(dir).filter(f => f.startsWith(prefix) && f.endsWith(".csv")).sort();
  return matches.length ? join(dir, matches[matches.length - 1]) : null;
}

function resolveArgs() {
  const args = process.argv.slice(2);
  if (args.length === 3) return args;
  const downloads = join(homedir(), "Downloads");
  return [
    findLatest(downloads, "program_phases-export-"),
    findLatest(downloads, "workout_templates-export-"),
    findLatest(downloads, "workout_exercises-export-"),
  ];
}

const [phasesPath, templatesPath, exercisesPath] = resolveArgs();
if (!phasesPath || !templatesPath || !exercisesPath) {
  console.error("Could not locate all three CSVs. Pass paths as args or place them in ~/Downloads.");
  process.exit(1);
}

const phases = parseCsv(readFileSync(phasesPath, "utf8"));
const templates = parseCsv(readFileSync(templatesPath, "utf8"));
const exerciseRows = parseCsv(readFileSync(exercisesPath, "utf8"));

console.log(`Loaded ${phases.length} phases, ${templates.length} templates, ${exerciseRows.length} exercise rows.`);

// Build lookup tables.
const phasesById = new Map(phases.map(p => [p.id, p]));
const exercisesByWorkoutId = exerciseRows.reduce((acc, e) => {
  const k = e.workout_id;
  if (!acc[k]) acc[k] = [];
  acc[k].push(e);
  return acc;
}, /** @type {Record<string, any[]>} */ ({}));
for (const k of Object.keys(exercisesByWorkoutId)) {
  exercisesByWorkoutId[k].sort((a, b) => Number(a.order_index) - Number(b.order_index));
}

// Group templates by program_id, then attach phase + exercises.
const programs = {};
for (const tpl of templates) {
  const pid = tpl.program_id;
  if (!pid) continue;
  if (!programs[pid]) programs[pid] = { id: pid, phases: {}, sessions: [] };
  const phase = phasesById.get(tpl.phase_id) || null;
  if (phase && !programs[pid].phases[phase.id]) {
    programs[pid].phases[phase.id] = {
      id: phase.id,
      number: Number(phase.phase_number) || 0,
      title: phase.title || "",
      goal: phase.phase_goal || "",
      rpeMin: phase.rpe_target_min ? Number(phase.rpe_target_min) : null,
      rpeMax: phase.rpe_target_max ? Number(phase.rpe_target_max) : null,
      weekStart: phase.week_start ? Number(phase.week_start) : null,
      weekEnd: phase.week_end ? Number(phase.week_end) : null,
    };
  }
  const exercises = (exercisesByWorkoutId[tpl.id] || []).map(e => ({
    orderIndex: Number(e.order_index) || 0,
    sets: e.sets ? Number(e.sets) : null,
    reps: e.reps || "",
    restSeconds: e.rest_seconds ? Number(e.rest_seconds) : null,
    rpeTarget: e.rpe_target ? Number(e.rpe_target) : null,
    loadGuidance: e.load_guidance || "",
    progressionNotes: e.progression_notes || "",
    isSuperset: e.is_superset === "true",
    supersetGroup: e.superset_group || "",
    tempo: e.tempo || "",
    tip: e.tip || "",
    weightKgMin: e.weight_kg_min ? Number(e.weight_kg_min) : null,
    weightKgMax: e.weight_kg_max ? Number(e.weight_kg_max) : null,
    exerciseId: e.exercise_id || "",
  }));
  programs[pid].sessions.push({
    id: tpl.id,
    phaseId: tpl.phase_id,
    sessionNumber: tpl.session_number ? Number(tpl.session_number) : null,
    dayLabel: tpl.day_label || "",
    title: tpl.title || "",
    type: tpl.session_type || "",
    estimatedMinutes: tpl.estimated_duration_mins ? Number(tpl.estimated_duration_mins) : null,
    warmupNotes: tpl.warmup_notes || "",
    cooldownNotes: tpl.cooldown_notes || "",
    sessionNotes: tpl.session_notes || "",
    exercises,
  });
}

// Sort sessions within each program by session_number.
for (const p of Object.values(programs)) {
  p.sessions.sort((a, b) => (a.sessionNumber ?? 0) - (b.sessionNumber ?? 0));
  p.phases = Object.values(p.phases).sort((a, b) => a.number - b.number);
}

// Drop the bogus header-row program (programs.json may include "program_id" key).
delete programs["program_id"];

// Mapping from CSV program_id → SIGNAL TrainingPath.id
const SIGNAL_MAPPING = {
  "prog-001": "glute-power",          // NEW SIGNAL path (8th)
  "prog-004": "muscle-building",      // The Forge
  "prog-005": "rest-and-restore",     // The Unfolding
  "prog-006": "learn-to-run",         // The Path That Becomes a Run
  "prog-007": "strength-foundations", // Strength from the Ground Up
  // prog-002, 003, 008 not currently mapped — left in CSV
};

const out = {
  generatedAt: new Date().toISOString(),
  mapping: SIGNAL_MAPPING,
  programs: Object.fromEntries(
    Object.entries(SIGNAL_MAPPING).map(([progId, signalId]) => [signalId, programs[progId] || null])
  ),
};

writeFileSync("src/data/training-csv-enrichment.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Wrote enrichment for ${Object.keys(SIGNAL_MAPPING).length} programs to src/data/training-csv-enrichment.json`);
console.log("Programs covered:", Object.keys(SIGNAL_MAPPING).join(", "));

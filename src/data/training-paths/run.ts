import type { TrainingPath } from "./types";

// ═══════════════════════════════════════════════════════════
// 7. LEARN TO RUN – 8-WEEK C25K-STYLE PROGRESSION
// ═══════════════════════════════════════════════════════════
export const learnToRun: TrainingPath = {
  id: "learn-to-run",
  name: "The Path That Becomes a Run",
  subtitle: "For the woman who was told she wasn't a runner",
  focus: "run",
  description:
    "Running is rhythm – the steady beat of your feet, the rise and fall of your breath, the quiet that settles when you simply move. This path meets you exactly where you are. If you can walk, you can begin.",
  whoItIsFor:
    "Anyone who wants to run – gently, slowly, and for the joy of it. No pace targets. No judgment.",
  weeks: [
    { week: 1, theme: "Introduction", progression: "3 run-walk days, 1 strength day, 3 rest days.",
      sessions: [
        { day: 1, name: "Run-Walk 1", focus: "Interval introduction", durationMin: 25, equipment: "Good shoes", feel: "Curious, not pressured", structure: ["5 min brisk walk", "Repeat 5×: 1 min light jog / 2 min walk", "5 min walk cool-down"], coachingNote: "One minute is not a test. It is an invitation." },
        { day: 2, name: "Strength for Runners", focus: "Glutes, core, stability", durationMin: 30, equipment: "Mat, light dumbbells", feel: "Steady and supportive", structure: ["5 min warm-up: glute bridges, hip circles", "Circuit 3 rounds: Single-Leg Deadlift (BW) ×10/side, Step-Up ×10/side, Side Plank 25 sec/side, Dead Bug 10/side", "5 min stretch"], coachingNote: "Running is a single-leg sport. Build stability now." },
        { day: 3, name: "Rest", durationMin: 0, structure: ["Rest"] },
        { day: 4, name: "Run-Walk 2", focus: "Repeat intervals", durationMin: 25, equipment: "Good shoes", feel: "Beginning to trust", structure: ["5 min walk", "6×: 1 min jog / 90 sec walk", "5 min walk"] },
        { day: 5, name: "Rest", durationMin: 0, structure: ["Rest"] },
        { day: 6, name: "Run-Walk 3", focus: "Longer session", durationMin: 28, equipment: "Good shoes", feel: "Building", structure: ["5 min walk", "5×: 1 min jog / 2 min walk (consistency is the growth)", "5 min walk"] },
        { day: 7, name: "Rest", durationMin: 0, structure: ["Rest"] }
      ] },
    { week: 2, theme: "Extending the Run", progression: "Increase run interval to 90 sec.",
      sessions: [
        { day: 1, name: "Run-Walk 4", durationMin: 28, equipment: "Good shoes", feel: "A little braver", structure: ["5 min walk", "5×: 90 sec jog / 2 min walk", "5 min walk"], coachingNote: "Ninety seconds. Your body is learning that it can do this." },
        { day: 2, name: "Strength for Runners", durationMin: 30, equipment: "Mat, dumbbells", feel: "Steady", structure: ["Same as Week 1, add light dumbbells to Step-Up and Single-Leg Deadlift"] },
        { day: 3, name: "Rest", structure: ["Rest"] },
        { day: 4, name: "Run-Walk 5", durationMin: 28, equipment: "Good shoes", feel: "Flowing", structure: ["5 min walk", "6×: 90 sec jog / 90 sec walk", "5 min walk"] },
        { day: 5, name: "Rest", structure: ["Rest"] },
        { day: 6, name: "Run-Walk 6", durationMin: 30, equipment: "Good shoes", feel: "Building", structure: ["5 min walk", "5×: 90 sec jog / 2 min walk, then finish with 3 min jog", "5 min walk"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 3, theme: "Two Minutes and Beyond", progression: "Increase run interval to 2 min.",
      sessions: [
        { day: 1, name: "Run-Walk 7", durationMin: 30, equipment: "Good shoes", feel: "Finding rhythm", structure: ["5 min walk", "5×: 2 min jog / 2 min walk", "5 min walk"] },
        { day: 2, name: "Strength for Runners", durationMin: 30, equipment: "Mat, dumbbells", feel: "Strong", structure: ["As Week 2, increase reps by 2 on each exercise"] },
        { day: 3, name: "Rest", structure: ["Rest"] },
        { day: 4, name: "Run-Walk 8", durationMin: 30, equipment: "Good shoes", feel: "Consistent", structure: ["5 min walk", "4×: 2 min jog / 90 sec walk, then 3 min jog", "5 min walk"] },
        { day: 5, name: "Rest", structure: ["Rest"] },
        { day: 6, name: "Run-Walk 9", durationMin: 32, equipment: "Good shoes", feel: "Enduring", structure: ["5 min walk", "4×: 3 min jog / 2 min walk", "5 min walk"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 4, theme: "Consolidation", progression: "Repeat Week 3; aim to feel smoother.",
      sessions: [
        { day: 1, name: "Run-Walk 10", durationMin: 30, equipment: "Good shoes", feel: "Familiar", structure: ["5 min walk", "5×: 2 min jog / 2 min walk", "5 min walk"] },
        { day: 2, name: "Strength for Runners", durationMin: 30, equipment: "Mat, dumbbells", feel: "Solid", structure: ["Same as Week 3"] },
        { day: 3, name: "Rest", structure: ["Rest"] },
        { day: 4, name: "Run-Walk 11", durationMin: 30, equipment: "Good shoes", feel: "Smooth", structure: ["5 min walk", "4×: 2 min jog / 90 sec walk, then 3 min jog", "5 min walk"] },
        { day: 5, name: "Rest", structure: ["Rest"] },
        { day: 6, name: "Run-Walk 12", durationMin: 32, equipment: "Good shoes", feel: "Confident", structure: ["5 min walk", "4×: 3 min jog / 2 min walk", "5 min walk"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 5, theme: "Longer Intervals", progression: "Run intervals increase to 4-5 min.",
      sessions: [
        { day: 1, name: "Run-Walk 13", durationMin: 32, equipment: "Good shoes", feel: "Stronger", structure: ["5 min walk", "4×: 4 min jog / 2 min walk", "5 min walk"] },
        { day: 2, name: "Strength for Runners", durationMin: 30, equipment: "Mat, dumbbells", feel: "Powerful", structure: ["Add Bulgarian Split Squat 3×8/side, Plank 3×45 sec to circuit"] },
        { day: 3, name: "Rest", structure: ["Rest"] },
        { day: 4, name: "Run-Walk 14", durationMin: 32, equipment: "Good shoes", feel: "Enduring", structure: ["5 min walk", "3×: 5 min jog / 2 min walk", "5 min walk"] },
        { day: 5, name: "Rest", structure: ["Rest"] },
        { day: 6, name: "Run-Walk 15", durationMin: 35, equipment: "Good shoes", feel: "Alive", structure: ["5 min walk", "3×: 5 min jog / 90 sec walk", "5 min walk"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 6, theme: "Almost There", progression: "Run intervals reach 8 min.",
      sessions: [
        { day: 1, name: "Run-Walk 16", durationMin: 35, equipment: "Good shoes", feel: "Determined", structure: ["5 min walk", "2×: 8 min jog / 3 min walk", "5 min walk"], coachingNote: "Eight minutes. You are a runner now." },
        { day: 2, name: "Strength for Runners", durationMin: 30, equipment: "Mat, dumbbells", feel: "Strong", structure: ["Same as Week 5"] },
        { day: 3, name: "Rest", structure: ["Rest"] },
        { day: 4, name: "Run-Walk 17", durationMin: 35, equipment: "Good shoes", feel: "Smooth", structure: ["5 min walk", "2×: 10 min jog / 3 min walk", "5 min walk"], coachingNote: "Ten minutes without stopping. Let that sink in." },
        { day: 5, name: "Rest", structure: ["Rest"] },
        { day: 6, name: "Run-Walk 18", durationMin: 38, equipment: "Good shoes", feel: "Resilient", structure: ["5 min walk", "1×: 15 min jog continuous", "5 min walk"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 7, theme: "Continuous", progression: "Run 20-25 min continuous.",
      sessions: [
        { day: 1, name: "Run 1", durationMin: 35, equipment: "Good shoes", feel: "Free", structure: ["5 min walk", "Run 20 min continuous", "5 min walk"], coachingNote: "Twenty minutes. You have arrived." },
        { day: 2, name: "Strength for Runners", durationMin: 30, equipment: "Mat, dumbbells", feel: "Capable", structure: ["Same circuit, aim for 4 rounds"] },
        { day: 3, name: "Rest", structure: ["Rest"] },
        { day: 4, name: "Run 2", durationMin: 35, equipment: "Good shoes", feel: "Smooth", structure: ["5 min walk", "Run 25 min continuous", "5 min walk"] },
        { day: 5, name: "Rest", structure: ["Rest"] },
        { day: 6, name: "Run 3", durationMin: 30, equipment: "Good shoes", feel: "Peaceful", structure: ["5 min walk", "Easy 20 min run – enjoy it", "5 min walk"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 8, theme: "Celebration", progression: "Run 30 min continuously (or your longest yet).",
      sessions: [
        { day: 1, name: "Celebration Run", durationMin: 40, equipment: "Good shoes", feel: "Triumphant", structure: ["5 min walk", "Run 30 min (or as long as feels good)", "5 min walk"], coachingNote: "Eight weeks ago, one minute felt long. Look at you now. This is who you are." },
        { day: 2, name: "Strength for Runners", durationMin: 30, equipment: "Mat, dumbbells", feel: "Grateful", structure: ["Light session – your favourite exercises, 2 sets each"] },
        { day: 3, name: "Rest", structure: ["Rest"] },
        { day: 4, name: "Easy Run or Walk", durationMin: 30, equipment: "Good shoes", feel: "Peaceful", structure: ["Whatever your body wants – a gentle run or a long walk."] },
        { day: 5, name: "Rest", structure: ["Rest"] },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Reflect", durationMin: 0, equipment: "None", feel: "Complete", structure: ["Write down how you feel. What has changed in your body, your mind, your sense of what is possible?"], coachingNote: "This path is yours forever. Run whenever you need to come home to yourself." }
      ] }
  ]
};

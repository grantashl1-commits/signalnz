import type { TrainingPath } from "./types";

// ═══════════════════════════════════════════════════════════
// 8. THE 8-MOVE CIRCUIT PATH – 8-WEEK CARDIO + ENDURANCE
// ═══════════════════════════════════════════════════════════
export const cardioCircuit: TrainingPath = {
  id: "signal-circuit-progressive",
  name: "The 8-Move Circuit Path",
  subtitle: "Two rounds. Eight moves. Eight weeks of quiet power.",
  focus: "cardio",
  description:
    "This is not random work. It is a conversation between you and your body – a steady climb from beginner-friendly reps and simple jumps to explosive intervals and long cardio bursts. Each workout lists 8 exercises. You complete the list once, rest 90 seconds, then do it again. The themes change every day so you never burn out the same muscles twice.",
  whoItIsFor:
    "The woman who wants clear structure, visible progress, and a workout that fits inside 30 minutes. She is ready to sweat, but she also wants to feel her heart grow stronger week by week.",
  weeks: [
    { week: 1, theme: "Easy Rhythm", progression: "All exercises bodyweight. Low reps. No plyometrics.",
      sessions: [
        { day: 1, name: "Lower Body & Cardio (Easy)", durationMin: 25, equipment: "None (optional: skipping rope)", feel: "Conversational",
          structure: ["Circuit – 2 rounds (rest 90 sec between rounds):", "1. Bodyweight Squats – 12 reps", "2. Stationary Lunges – 8 reps per leg", "3. Step Ups (low bench) – 8 reps per leg", "4. Knee Ups (marching in place) – 16 reps total", "5. Glute Bridges – 12 reps", "6. Toe Taps (light) – 12 reps", "7. Walking Lunges – 8 reps per leg", "8. Slow Mountain Climbers – 15 reps total"],
          coachingNote: "Move slowly. Feel each rep. If you are not sweating, that is fine – this week is about learning the pattern." },
        { day: 2, name: "Upper Body & Cardio (Easy)", durationMin: 25, equipment: "Optional: light dumbbells (1-3 kg)", feel: "Steady",
          structure: ["Circuit – 2 rounds:", "1. Incline Push Ups (hands on bench) – 10 reps", "2. Tricep Dips (feet on floor) – 10 reps", "3. Arm Circles (small) – 20 reps forward + 20 back", "4. Plank – 20 seconds", "5. Bent-over Rows (no weight or water bottles) – 12 reps", "6. Shoulder Press (light) – 10 reps", "7. Bird Dog – 8 reps per side", "8. Jumping Jacks – 30 reps"],
          coachingNote: "Keep your shoulders relaxed. Do not rush the plank – it is okay to drop to your knees." },
        { day: 3, name: "Core & Cardio (Easy)", durationMin: 25, equipment: "None", feel: "Light burn",
          structure: ["Circuit – 2 rounds:", "1. Standing Toe Taps – 12 reps per leg", "2. Dead Bug – 8 reps per side", "3. Straight Leg Raises – 10 reps total", "4. Seated Knee Tucks (on mat) – 12 reps", "5. Heel Taps (lying down) – 12 reps per side", "6. Marching in Place (high knees, slow) – 30 sec", "7. Side Plank (knee down) – 15 sec per side", "8. Bicycle Crunches (slow) – 10 reps per side"],
          coachingNote: "This is not about speed. Keep your lower back pressed into the floor for all lying moves." },
        { day: 4, name: "Rest or Easy Walk", structure: ["Rest, gentle stretching, or 20-30 min walk"] },
        { day: 5, name: "Full Body (Easy Cardio Mix)", durationMin: 28, equipment: "Optional: skipping rope", feel: "Energised",
          structure: ["Circuit – 2 rounds:", "1. Squat to Stand (slow) – 10 reps", "2. Push Ups (knees or incline) – 8 reps", "3. Reverse Lunges – 8 reps per leg", "4. Lying Tricep Extensions (no weight) – 10 reps", "5. Plank Shoulder Taps – 8 reps per side", "6. Butt Kicks (slow) – 20 reps total", "7. Supine Leg Lowering – 8 reps per leg", "8. Skipping (or imaginary skipping) – 40 reps"],
          coachingNote: "You should finish feeling like you could do another round – but save that for next week." },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 2, theme: "Increase Reps Slightly", progression: "Add 3-5 reps per move. Introduce a light skipping rope.",
      sessions: [
        { day: 1, name: "Lower Body & Cardio (Week 2)", durationMin: 28, equipment: "Skipping rope (optional)", feel: "Building rhythm",
          structure: ["Circuit – 2 rounds:", "1. Squats – 15 reps", "2. Walking Lunges – 10 reps per leg", "3. Step Ups – 10 reps per leg", "4. Sumo Squats – 12 reps", "5. Donkey Kicks – 12 reps per leg", "6. Knee Ups (controlled) – 16 reps total", "7. Glute Bridge with 3 sec hold – 12 reps", "8. Skipping (easy pace) – 50 reps"],
          coachingNote: "The skipping can be broken into 25 + 25. Land softly on the balls of your feet." },
        { day: 2, name: "Upper Body & Cardio (Week 2)", durationMin: 28, equipment: "Light dumbbells (2-4 kg) or water bottles", feel: "Steady effort",
          structure: ["Circuit – 2 rounds:", "1. Knee Push Ups – 12 reps", "2. Tricep Dips (feet on floor) – 12 reps", "3. Lateral Raises (light) – 10 reps", "4. Plank – 30 seconds", "5. Dumbbell Rows – 12 reps per side", "6. Overhead Press – 10 reps", "7. Arm Scissors (lying) – 20 reps total", "8. High Knees (slow to moderate) – 20 reps per leg"],
          coachingNote: "Focus on lowering the weights slowly – that is where the strength builds." },
        { day: 3, name: "Core & Cardio (Week 2)", durationMin: 28, equipment: "None or mat", feel: "Controlled",
          structure: ["Circuit – 2 rounds:", "1. Plank – 30 sec", "2. Toe Taps (lying, legs up) – 14 reps", "3. Reverse Crunches – 12 reps", "4. Side Plank (knee allowed) – 20 sec per side", "5. Mountain Climbers (slow cadence) – 20 reps total", "6. Windshield Wipers (small range) – 12 reps total", "7. Leg Lowers (straight) – 10 reps", "8. Russian Twists (feet on floor) – 16 reps total (8/side)"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Full Body (Week 2)", durationMin: 30, equipment: "Skipping rope, light weights", feel: "Balanced",
          structure: ["Circuit – 2 rounds:", "1. Goblet Squats (hold one weight) – 12 reps", "2. Push Ups (knees or full) – 10 reps", "3. Reverse Lunges with Knee Drive – 8 reps per leg", "4. Tricep Kickbacks – 12 reps per arm", "5. Lying Leg Raises – 12 reps", "6. Plank Jacks – 15 reps total", "7. Box Step Overs (low bench) – 10 reps per leg", "8. Burpees (no push up, no jump) – 6 reps"],
          coachingNote: "The burpees are slow – stand up, squat back, kick feet out, step back in, stand. No rush." },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 3, theme: "Introduce Tempo", progression: "Faster pace on cardio moves. First small jumps.",
      sessions: [
        { day: 1, name: "Lower Body & Cardio (Tempo)", durationMin: 30, equipment: "Skipping rope, low bench", feel: "Moderate effort",
          structure: ["Circuit – 2 rounds:", "1. Jumping Jacks – 40 reps", "2. Split Squats (stationary) – 10 reps per leg", "3. Alternating Reverse Lunges – 14 reps total", "4. Step Ups with Knee Lift – 10 reps per leg", "5. Skater Hops (small) – 12 reps per side", "6. Skipping – 80 reps", "7. Sumo Squats with Pulse – 12 reps + 8 pulses", "8. Calf Raises – 20 reps"],
          coachingNote: "Skater hops = jump side to side like a speed skater. Keep the jump low. Land softly." },
        { day: 2, name: "Upper Body & Cardio (Tempo)", durationMin: 30, equipment: "Light dumbbells (3-5 kg), bench", feel: "Building",
          structure: ["Circuit – 2 rounds:", "1. Push Ups (full or knees) – 12 reps", "2. Tricep Dips (feet on floor) – 14 reps", "3. Bent Over Rows – 12 reps", "4. Plank with Arm Reach – 8 reps per side", "5. Dumbbell Punch (alternating) – 20 reps total", "6. Incline Push Ups (feet on bench) – 10 reps", "7. Bear Crawl (forward & back) – 4 crawls each way", "8. Fast Feet (in place) – 30 seconds"] },
        { day: 3, name: "Core & Cardio (Tempo)", durationMin: 30, equipment: "Mat, skipping rope", feel: "Core fatigue",
          structure: ["Circuit – 2 rounds:", "1. Plank – 40 seconds", "2. Bicycle Crunches – 16 reps per side", "3. Scissor Kicks – 20 reps total", "4. Hollow Body Hold – 20 seconds", "5. Mountain Climbers (moderate pace) – 30 reps total", "6. V-Ups (bent knees) – 12 reps", "7. Side Plank Dips – 8 reps per side", "8. Skipping (fast feet style) – 100 reps"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Full Body (Tempo)", durationMin: 32, equipment: "Dumbbells (3-5 kg), skipping rope", feel: "Sweaty",
          structure: ["Circuit – 2 rounds:", "1. Burpees (regular, no push up) – 8 reps", "2. Walking Lunges with Twist – 12 reps total (6/leg)", "3. Push Up to Downward Dog – 8 reps", "4. Squat to Overhead Press – 12 reps", "5. Plank Walk (hand to elbow) – 12 reps total", "6. Butt Kicks (fast) – 30 seconds", "7. Box Jumps (low bench, step down) – 8 reps", "8. Skipping – 120 reps"],
          coachingNote: "Box jumps step down, do not jump down – your knees will thank you." },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 4, theme: "Consolidation with Small Jumps", progression: "Repeat Week 3 but reduce rest between rounds to 75 sec.",
      sessions: [
        { day: 1, name: "Lower Body & Cardio (Week 4)", durationMin: 30, equipment: "Skipping rope", feel: "Stronger",
          structure: ["Circuit – 2 rounds (rest 75 sec):", "1. Jump Squats (low jump) – 10 reps", "2. Alternating Jump Lunges (small) – 8 reps per leg", "3. Speed Skaters – 15 reps per side", "4. Step Ups with Hop (low bench) – 8 reps per leg", "5. Skipping – 120 reps", "6. Single Leg Glute Bridge – 10 reps per leg", "7. Lateral Lunges – 10 reps per side", "8. High Knees (in place) – 40 reps total"],
          coachingNote: "The jump is small – think 'springy', not 'explosive'. Protect your knees." },
        { day: 2, name: "Upper Body & Cardio (Week 4)", durationMin: 30, equipment: "Dumbbells (4-6 kg), bench", feel: "Controlled power",
          structure: ["Circuit – 2 rounds (rest 75 sec):", "1. Decline Push Ups (feet on bench) – 10 reps", "2. Tricep Dips (feet elevated) – 12 reps", "3. Renegade Rows (knees down) – 6 reps per arm", "4. Plank Up-Downs – 10 reps total", "5. Dumbbell Floor Press – 12 reps", "6. Lateral Raises – 12 reps", "7. Arm Circles with small weight – 15 forward/back", "8. Jumping Jacks – 50 reps"] },
        { day: 3, name: "Core & Cardio (Week 4)", durationMin: 30, equipment: "Mat, skipping rope", feel: "Deep core work",
          structure: ["Circuit – 2 rounds:", "1. Plank with Knee Taps – 16 reps total", "2. Leg Lowers (straight, slow) – 12 reps", "3. Toe Taps (lying, legs vertical) – 20 reps", "4. Side Plank (full or knee) – 25 sec per side", "5. Cross Body Mountain Climbers – 20 reps total", "6. Russian Twists (feet up) – 20 reps total (10/side)", "7. Flutter Kicks – 30 seconds", "8. Skipping (alternating feet) – 150 reps"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Full Body (Week 4)", durationMin: 32, equipment: "Dumbbells, skipping rope, bench", feel: "Complete",
          structure: ["Circuit – 2 rounds:", "1. Burpee with Push Up – 8 reps", "2. Dumbbell Squat to Press – 12 reps", "3. Reverse Lunge with Bicep Curl – 10 reps per leg", "4. Tricep Dips (feet on floor) – 15 reps", "5. Plank Shoulder Taps – 16 reps total", "6. Box Step Over with Knee Drive – 10 reps per leg", "7. Tuck Jumps (low) – 8 reps", "8. Skipping – 150 reps"],
          coachingNote: "Tuck jumps = jump and pull knees toward chest. Land like a cat – soft and quiet." },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 5, theme: "Plyometric Introduction", progression: "Add tuck jumps, broad jumps. Skipping to 200 reps.",
      sessions: [
        { day: 1, name: "Lower Body & Cardio (Plyo Start)", durationMin: 32, equipment: "Skipping rope, low bench/box", feel: "Powerful",
          structure: ["Circuit – 2 rounds:", "1. Broad Jumps (standing long jump) – 6 reps", "2. Tuck Jumps – 8 reps", "3. Alternating Jump Lunges – 12 reps total (6/leg)", "4. Box Jumps (step down) – 10 reps", "5. Skipping – 200 reps", "6. Single Leg Squat to Bench (touch and stand) – 8 reps per leg", "7. Lateral Hops over line – 15 reps per side", "8. Ice Skaters (large lateral jumps) – 10 reps per side"] },
        { day: 2, name: "Upper Body & Cardio (Plyo Upper)", durationMin: 32, equipment: "Dumbbells, bench, medicine ball (optional)", feel: "Explosive push",
          structure: ["Circuit – 2 rounds:", "1. Plyo Push Ups (clap or just explosive) – 6 reps", "2. Medicine Ball Slams (or squat jump toss) – 12 reps", "3. Tricep Dips with Leg Lift – 12 reps", "4. Commando Plank (fast) – 16 reps total", "5. Dumbbell Snatch (single arm) – 6 reps per arm", "6. Bear Crawl (fast) – 10 steps forward/back", "7. Mountain Climbers (fast) – 40 reps total", "8. Skipping (double unders or fast singles) – 150 reps"] },
        { day: 3, name: "Core & Cardio (Plyo Core)", durationMin: 32, equipment: "Mat, skipping rope", feel: "Core endurance",
          structure: ["Circuit – 2 rounds:", "1. Plank Jacks – 20 reps", "2. V-Up Tucks – 12 reps", "3. Leg Throw Downs – 10 reps per leg", "4. Side Plank with Knee Drive – 10 reps per side", "5. Mountain Climber Cross – 30 reps total", "6. Hollow Body Rocks – 15 rocks", "7. Russian Twist with Pulse – 20 reps per side", "8. Fast Feet + Sprint in Place – 20 sec fast feet, 10 sec sprint, repeat 2x"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Full Body (Plyo Mix)", durationMin: 35, equipment: "Skipping rope, box/bench, light dumbbells", feel: "Full throttle",
          structure: ["Circuit – 2 rounds:", "1. Burpee to Tuck Jump – 8 reps", "2. Dumbbell Thrusters (squat to press) – 12 reps", "3. Broad Jump Burpee (no push up) – 6 reps", "4. Decline Push Up to Side Plank – 6 reps per side", "5. Box Jump to Step Down – 10 reps", "6. Skater Hops with Touch – 16 reps total", "7. Plank to Pike – 10 reps", "8. Skipping – 250 reps (or 1 minute fast)"] },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 6, theme: "Increase Volume", progression: "Same structure, increase reps by 20%.",
      sessions: [
        { day: 1, name: "Lower Body & Cardio (Week 6)", durationMin: 35, equipment: "Skipping rope, box", feel: "Hard endurance",
          structure: ["Circuit – 2 rounds:", "1. Box Jumps (jump up, step down) – 12 reps", "2. Split Jumps (switch lunge jump) – 16 reps total (8/leg)", "3. Broad Jumps – 10 reps", "4. Single Leg Box Step Ups with Hop – 10 reps per leg", "5. Skipping (alternating fast/slow) – 300 reps total", "6. Cossack Squats – 12 reps per side", "7. Lateral Hops over bench – 20 reps total", "8. Sprint in Place (high knees) – 45 seconds"] },
        { day: 2, name: "Upper Body & Cardio (Week 6)", durationMin: 35, equipment: "Dumbbells (5-8 kg), bench, medicine ball", feel: "Pushing limits",
          structure: ["Circuit – 2 rounds:", "1. Explosive Push Ups (hands off) – 8 reps", "2. Medicine Ball Chest Pass (against wall) – 15 reps", "3. Tricep Dips (feet elevated on second bench) – 15 reps", "4. Renegade Rows (plank, no knees) – 8 reps per arm", "5. Dumbbell Cleans – 10 reps", "6. Plank with Row – 10 reps per arm", "7. Burpee to Pull Up (if no bar, burpee to jump) – 6 reps", "8. Skipping (double unders attempts) – 100 reps"] },
        { day: 3, name: "Core & Cardio (Week 6)", durationMin: 35, equipment: "Mat, medicine ball (2-4 kg), skipping rope", feel: "Burning",
          structure: ["Circuit – 2 rounds:", "1. Plank with Medicine Ball Rollout – 10 reps", "2. V-Up with Twist – 12 reps per side", "3. Leg Lift to Hip Lift – 12 reps", "4. Side Plank with Leg Abduction – 10 reps per side", "5. Mountain Climbers (fast, cross body) – 50 reps total", "6. Russian Twist with Weight – 30 reps total (15/side)", "7. Hollow Body Hold – 45 seconds", "8. Skipping (one foot then the other) – 200 reps"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Full Body (Week 6 – Peak)", durationMin: 35, equipment: "Full set: skipping rope, dumbbells, bench, medicine ball", feel: "Exhausting but liberating",
          structure: ["Circuit – 2 rounds:", "1. Burpee to Box Jump – 10 reps", "2. Thruster + Push Press – 15 reps", "3. Depth Jump to Broad Jump – 6 reps (soft landing)", "4. Dumbbell Snatch (alternating) – 8 reps per arm", "5. Plank to Tuck Jump – 12 reps", "6. Lunge Jump Switch + Hop – 12 reps total", "7. Med Ball Slam to Squat Jump – 10 reps", "8. Skipping – 300 reps (or 2 minutes non-stop)"] },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 7, theme: "Peak Week – Maximum Effort", progression: "Shortest rest (60 sec). Highest reps and hardest plyos.",
      sessions: [
        { day: 1, name: "Lower Body & Cardio (Peak)", durationMin: 35, equipment: "Skipping rope, plyo box", feel: "Intense",
          structure: ["Circuit – 2 rounds (rest 60 sec):", "1. Depth Jumps (from 20-30 cm) – 8 reps", "2. Tuck Jumps – 20 reps", "3. Broad Jump to Sprint (in place) – 6 reps", "4. Single Leg Box Jumps (low box) – 6 reps per leg", "5. Skipping – 300 reps (as fast as possible)", "6. Bulgarian Split Squats (jump optional) – 12 reps per leg", "7. Lateral Hops over bench – 30 reps total", "8. High Knees Sprint – 60 seconds"],
          coachingNote: "Peak week is hard by design. If you need an extra 15 sec rest, take it – but keep moving." },
        { day: 2, name: "Upper Body & Cardio (Peak)", durationMin: 35, equipment: "Dumbbells, medicine ball, bench", feel: "Explosive",
          structure: ["Circuit – 2 rounds (rest 60 sec):", "1. Plyo Push Ups (clap or high) – 10 reps", "2. Medicine Ball Burpees (slam at bottom) – 12 reps", "3. Tricep Dips with Knee Raise – 20 reps", "4. Commando Plank (fast) – 30 reps total", "5. Dumbbell Clean to Press – 10 reps", "6. Plank with Single Arm Row – 12 reps per arm", "7. Mountain Climber Burpee (no jump) – 10 reps", "8. Skipping (double unders) – 100 reps or 2 min singles"] },
        { day: 3, name: "Core & Cardio (Peak)", durationMin: 35, equipment: "Weighted ball (3-5 kg), skipping rope", feel: "Deep fatigue",
          structure: ["Circuit – 2 rounds:", "1. Weighted Sit Ups (ball overhead) – 20 reps", "2. Hanging Knee Raises (or lying leg lifts) – 15 reps", "3. Plank with Feet on Bench – 1 minute", "4. Side Plank with Weighted Reach – 12 reps per side", "5. V-Up to Jackknife – 15 reps", "6. Russian Twist (heavy) – 30 reps per side", "7. Toe Touches (lying, legs up) – 30 reps", "8. Sprint Intervals: 20 sec on / 10 sec off, 8 rounds"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Full Body (Peak – Finale)", durationMin: 38, equipment: "All available", feel: "Victorious",
          structure: ["Circuit – 2 rounds (rest 75 sec – you earned it):", "1. Burpee Box Jump Over – 10 reps", "2. Dumbbell Snatch to Thruster – 8 reps per arm", "3. Broad Jump Burpee with Push Up – 8 reps", "4. Plyo Push Up to Side Plank – 8 reps per side", "5. Tuck Jump to Squat – 15 reps", "6. Lunge Jump to Knee Drive – 12 reps per leg", "7. Med Ball Slams (fast) – 20 reps", "8. Skipping (250 reps) + 50 Mountain Climbers (finisher)"],
          coachingNote: "This is the hardest workout of the 8 weeks. Trust your fitness." },
        { day: 6, name: "Rest", structure: ["Rest"] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] },
    { week: 8, theme: "Deload & Celebrate", progression: "Reduce volume by 30-40%. No plyometrics. Focus on enjoyment.",
      sessions: [
        { day: 1, name: "Lower Body & Cardio (Deload)", durationMin: 25, equipment: "Skipping rope (optional)", feel: "Easy flow",
          structure: ["Circuit – 2 rounds (rest as needed):", "1. Bodyweight Squats – 12 reps", "2. Walking Lunges – 8 reps per leg", "3. Step Ups – 8 reps per leg (low bench)", "4. Glute Bridges – 15 reps", "5. Knee Ups (slow) – 20 reps total", "6. Skipping – 80 reps (easy pace)", "7. Calf Raises – 20 reps", "8. Slow Mountain Climbers – 20 reps total"],
          coachingNote: "No jumps. No rush. Feel how easy these moves have become compared to Week 1." },
        { day: 2, name: "Upper Body & Cardio (Deload)", durationMin: 25, equipment: "Light weights (2-4 kg) or none", feel: "Relaxed",
          structure: ["Circuit – 2 rounds:", "1. Incline Push Ups – 12 reps", "2. Tricep Dips (feet on floor) – 12 reps", "3. Bent Over Rows (light) – 12 reps", "4. Plank – 30 seconds", "5. Arm Circles – 20 each direction", "6. Standing Shoulder Press – 10 reps", "7. Jumping Jacks – 40 reps", "8. Slow Bear Crawl – 8 steps"] },
        { day: 3, name: "Core & Cardio (Deload)", durationMin: 25, equipment: "Mat", feel: "Gentle",
          structure: ["Circuit – 2 rounds:", "1. Plank – 30 sec", "2. Dead Bug – 10 reps per side", "3. Straight Leg Raises – 12 reps", "4. Bird Dog – 10 reps per side", "5. Seated Knee Tucks – 15 reps", "6. Heel Taps – 15 reps per side", "7. Bicycle Crunches (slow) – 12 reps per side", "8. Marching in Place – 1 minute"] },
        { day: 4, name: "Rest", structure: ["Rest"] },
        { day: 5, name: "Full Body (Deload – Fun Day)", durationMin: 25, equipment: "Skipping rope (optional)", feel: "Playful",
          structure: ["Circuit – 2 rounds:", "1. Squat to Stand – 10 reps", "2. Knee Push Ups – 10 reps", "3. Reverse Lunges – 8 reps per leg", "4. Tricep Extensions (no weight) – 12 reps", "5. Plank Shoulder Taps – 10 reps total", "6. Butt Kicks – 30 seconds", "7. Toe Taps (standing) – 20 reps per leg", "8. Skipping or Dancing – 2 minutes"],
          coachingNote: "Pick your favourite music for the last set. You made it through 8 weeks. That is a win." },
        { day: 6, name: "Reflect & Stretch", structure: ["Write down three things your body can do now that it could not do in Week 1. Then 15 minutes of full-body stretching."] },
        { day: 7, name: "Rest", structure: ["Rest"] }
      ] }
  ]
};

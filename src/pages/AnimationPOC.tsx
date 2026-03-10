import { useState } from "react";
import ExerciseRig, { EXERCISE_ANIMATIONS } from "@/components/movement/ExerciseRig";

export default function AnimationPOC() {
  const [selected, setSelected] = useState(EXERCISE_ANIMATIONS[0].id);
  const [playing, setPlaying] = useState(true);
  const exercise = EXERCISE_ANIMATIONS.find((e) => e.id === selected)!;

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-2xl md:text-3xl font-bold italic text-foreground mb-1">
          Exercise Animation POC
        </h1>
        <p className="font-mono text-xs text-muted-foreground mb-8">
          SVG skeletal rig · single reusable figure · pose-driven keyframes
        </p>

        {/* Exercise selector */}
        <div className="flex flex-wrap gap-2 mb-8">
          {EXERCISE_ANIMATIONS.map((ex) => (
            <button
              key={ex.id}
              onClick={() => setSelected(ex.id)}
              className={`px-4 py-2 rounded-full text-sm font-body transition-all ${
                selected === ex.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {ex.name}
            </button>
          ))}
        </div>

        {/* Main animation display */}
        <div className="flex flex-col items-center">
          <div className="bg-card rounded-2xl border border-border p-8 md:p-12 shadow-sm flex items-center justify-center min-h-[380px]">
            <ExerciseRig exercise={exercise} size={140} playing={playing} />
          </div>

          <button
            onClick={() => setPlaying(!playing)}
            className="mt-4 px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm font-body"
          >
            {playing ? "Pause" : "Play"}
          </button>

          <p className="mt-2 font-display text-lg italic text-foreground">{exercise.name}</p>
        </div>

        {/* Grid view — all 4 at once */}
        <h2 className="font-display text-xl font-bold italic text-foreground mt-12 mb-4">
          All exercises · card preview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {EXERCISE_ANIMATIONS.map((ex) => (
            <div
              key={ex.id}
              className="bg-card rounded-xl border border-border p-4 flex flex-col items-center gap-2 shadow-sm"
            >
              <ExerciseRig exercise={ex} size={70} playing={true} />
              <span className="font-body text-xs text-foreground text-center mt-1">{ex.name}</span>
            </div>
          ))}
        </div>

        {/* Feasibility report */}
        <div className="mt-12 bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
          <h2 className="font-display text-xl font-bold italic text-foreground mb-4">
            Feasibility Report
          </h2>
          <div className="font-body text-sm text-foreground/80 space-y-4">
            <div>
              <h3 className="font-bold text-foreground mb-1">Recommended approach: SVG Skeletal Rig</h3>
              <p>
                A single reusable female figure defined by joint positions (head, shoulders, elbows, hands, hips, knees, feet).
                Each exercise is just an array of pose keyframes — the rig interpolates between them with eased timing.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-foreground mb-1">What works</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>One rig drives unlimited exercises — only pose data changes</li>
                <li>Pure SVG: no external dependencies, ~3KB per exercise definition</li>
                <li>60fps on mobile via requestAnimationFrame</li>
                <li>Consistent branded aesthetic — violet/skin palette baked in</li>
                <li>Scales to 100+ exercises with only data additions</li>
                <li>Works in cards, modals, full-screen — responsive SVG viewBox</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-foreground mb-1">Alternatives assessed</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Lottie:</strong> Beautiful but requires After Effects workflow per exercise — not scalable without a motion designer</li>
                <li><strong>Canvas:</strong> Same result as SVG but loses DOM accessibility and React integration benefits</li>
                <li><strong>3D/pseudo-3D:</strong> Three.js adds ~150KB bundle weight; overkill for line-art exercises</li>
                <li><strong>GIF/Video:</strong> ~200KB–2MB per exercise, no dynamic theming, poor scaling</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-foreground mb-1">Limitations</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Stick-figure fidelity — not photorealistic (appropriate for SIGNAL's sketch aesthetic)</li>
                <li>Complex rotational movements (e.g. Turkish Get-up) need more keyframes</li>
                <li>No muscle/anatomy detail — educational diagrams would need a separate overlay system</li>
                <li>Initial pose authoring requires manual coordinate work (can build a pose editor tool)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-foreground mb-1">Production path</h3>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Build a visual pose editor (drag joints → export JSON) for rapid exercise authoring</li>
                <li>Add secondary motion: ponytail, breathing chest, slight hand wobble</li>
                <li>Add equipment overlays: dumbbell, kettlebell, band (as separate SVG layers)</li>
                <li>Add rep counter + tempo guide integration</li>
                <li>Create all 12 requested exercises, then expand to full library</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

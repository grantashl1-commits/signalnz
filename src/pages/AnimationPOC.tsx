import { useState } from "react";
import { Navigate } from "react-router-dom";
import ExerciseRig from "@/components/movement/ExerciseRig";
import { ANIMATION_REGISTRY } from "@/data/exercise-animations";

export default function AnimationPOC() {
  if (import.meta.env.PROD) return <Navigate to="/" replace />;

  const [selected, setSelected] = useState(ANIMATION_REGISTRY[0].key);
  const [playing, setPlaying] = useState(true);
  const animation = ANIMATION_REGISTRY.find((e) => e.key === selected)!;

  return (
    <div className="min-h-screen bg-background px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-2xl md:text-3xl font-bold italic text-foreground mb-1">
          Exercise Animation Library
        </h1>
        <p className="font-body text-xs text-muted-foreground mb-8">
          SVG skeletal rig · {ANIMATION_REGISTRY.length} exercises · pose-driven keyframes
        </p>

        {/* Exercise selector */}
        <div className="flex flex-wrap gap-2 mb-8">
          {ANIMATION_REGISTRY.map((ex) => (
            <button
              key={ex.key}
              onClick={() => setSelected(ex.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-body transition-all ${
                selected === ex.key
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
            <ExerciseRig animation={animation} size={140} playing={playing} />
          </div>

          <button
            onClick={() => setPlaying(!playing)}
            className="mt-4 px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm font-body"
          >
            {playing ? "Pause" : "Play"}
          </button>

          <p className="mt-2 font-display text-lg italic text-foreground">{animation.name}</p>
          <div className="flex gap-2 mt-1">
            <span className="rounded-full px-2 py-0.5 bg-secondary font-body text-[9px] text-muted-foreground">{animation.movementType}</span>
            <span className="rounded-full px-2 py-0.5 bg-secondary font-body text-[9px] text-muted-foreground">{animation.orientation}</span>
            {animation.unilateral && <span className="rounded-full px-2 py-0.5 bg-primary/10 font-body text-[9px] text-primary">unilateral</span>}
            {animation.holdable && <span className="rounded-full px-2 py-0.5 bg-primary/10 font-body text-[9px] text-primary">holdable</span>}
          </div>
        </div>

        {/* Grid view */}
        <h2 className="font-display text-xl font-bold italic text-foreground mt-12 mb-4">
          Full library · {ANIMATION_REGISTRY.length} exercises
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {ANIMATION_REGISTRY.map((ex) => (
            <div
              key={ex.key}
              onClick={() => setSelected(ex.key)}
              className={`bg-card rounded-xl border border-border p-3 flex flex-col items-center gap-2 shadow-sm cursor-pointer transition-all ${
                selected === ex.key ? "ring-2 ring-primary/40" : "hover:bg-accent/5"
              }`}
            >
              <ExerciseRig animation={ex} size={55} playing={true} />
              <span className="font-body text-[10px] text-foreground text-center leading-tight">{ex.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

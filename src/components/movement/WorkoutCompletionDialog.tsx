import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { extractExerciseName } from '@/lib/exercise-image-lookup';
import type { WorkoutActual } from '@/lib/training-path-utils';

export default function WorkoutCompletionDialog({structure, name, onSave, onClose}: {structure:string[];name:string;onSave:(actual:WorkoutActual)=>void;onClose:()=>void}) {
 const [duration,setDuration] = useState('');
 const [notes,setNotes] = useState('');
 const [exercises,setExercises] = useState(() => [...new Set(structure.map(extractExerciseName).filter(Boolean))].map(exercise_name => ({exercise_name,sets:'',reps:'',weight_kg:''})));
 const [error,setError] = useState('');
 const number = (value:string) => value.trim() ? Number(value) : undefined;
 const save = () => {
  const durationMinutes = number(duration);
  const actual = exercises.map(e => ({exercise_name:e.exercise_name,sets:number(e.sets),reps:number(e.reps),weight_kg:number(e.weight_kg)}));
  if (durationMinutes !== undefined && (!Number.isFinite(durationMinutes) || durationMinutes <= 0) || actual.some(e => [e.sets,e.reps,e.weight_kg].some(n => n !== undefined && (!Number.isFinite(n) || n < 0)))) {
   setError('Use positive numbers for duration and non-negative numbers for your exercise log.'); return;
  }
  onSave({durationMinutes,notes:notes.trim(),exercises:actual});
 };
 return <Dialog open onOpenChange={open => {if(!open) onClose();}}><DialogContent className="max-h-[85vh] overflow-y-auto"><DialogHeader><DialogTitle>Finish {name}</DialogTitle><DialogDescription>Record what you did. Leave fields blank if you did not track them.</DialogDescription></DialogHeader>
  <label className="text-sm space-y-1">Duration (minutes)<Input type="number" min="1" value={duration} onChange={e=>setDuration(e.target.value)} /></label>
  <div className="space-y-4">{exercises.map((exercise,i)=><fieldset key={exercise.exercise_name} className="space-y-2"><legend className="text-sm font-medium">{exercise.exercise_name}</legend><div className="grid grid-cols-3 gap-2">{(['sets','reps','weight_kg'] as const).map(field=><label className="text-xs" key={field}>{field==='weight_kg'?'Weight (kg)':field==='reps'?'Reps per set':'Sets'}<Input type="number" min="0" step={field==='weight_kg'?'0.5':'1'} value={exercise[field]} onChange={e=>setExercises(rows=>rows.map((row,index)=>index===i?{...row,[field]:e.target.value}:row))}/></label>)}</div></fieldset>)}</div>
  <label className="text-sm">Notes<textarea value={notes} onChange={e=>setNotes(e.target.value)} className="w-full rounded-md border bg-background p-2" /></label>
  {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  <Button onClick={save}>Save completed workout</Button>
 </DialogContent></Dialog>;
}

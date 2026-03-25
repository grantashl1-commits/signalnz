import { cn } from "@/lib/utils";

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl animate-shimmer bg-gradient-to-r from-[#E8E0F0] via-[#F3EEF8] to-[#E8E0F0] bg-[length:200%_100%]",
        className
      )}
    />
  );
}

/** Skeleton that looks like a recipe/meal card */
export function MealCardSkeleton() {
  return (
    <div className="rounded-[22px] bg-card shadow-soft overflow-hidden">
      <Shimmer className="h-[180px] w-full rounded-none" />
      <div className="p-6 space-y-3">
        <Shimmer className="h-3 w-20" />
        <Shimmer className="h-6 w-3/4" />
        <Shimmer className="h-4 w-full" />
        <Shimmer className="h-10 w-full rounded-full mt-4" />
      </div>
    </div>
  );
}

/** Skeleton that looks like a habit card */
export function HabitCardSkeleton() {
  return (
    <div className="rounded-[18px] bg-card p-6 flex items-center gap-5 shadow-soft">
      <Shimmer className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-5 w-2/3" />
        <Shimmer className="h-3 w-1/3" />
      </div>
    </div>
  );
}

/** Skeleton for a journal entry card */
export function JournalEntrySkeleton() {
  return (
    <div className="card-warm p-5 space-y-3">
      <div className="flex justify-between">
        <div className="space-y-2 flex-1">
          <Shimmer className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Shimmer className="h-5 w-16 rounded-full" />
            <Shimmer className="h-5 w-12 rounded-full" />
          </div>
        </div>
        <Shimmer className="h-6 w-20 rounded-full" />
      </div>
      <Shimmer className="h-4 w-full" />
      <Shimmer className="h-4 w-4/5" />
    </div>
  );
}

/** Skeleton for a focus card on homepage */
export function FocusCardSkeleton() {
  return (
    <div className="rounded-[22px] bg-card p-7 flex items-start gap-6 shadow-soft">
      <Shimmer className="h-11 w-11 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-3 w-20" />
        <Shimmer className="h-4 w-full" />
        <Shimmer className="h-4 w-3/4" />
      </div>
    </div>
  );
}

/** Skeleton for movement/workout card */
export function WorkoutCardSkeleton() {
  return (
    <div className="card-warm p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Shimmer className="h-5 w-2/3" />
          <Shimmer className="h-3 w-1/3" />
          <Shimmer className="h-3 w-full" />
        </div>
        <Shimmer className="h-7 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <Shimmer key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/** Skeleton for calendar grid */
export function CalendarSkeleton() {
  return (
    <div className="card-warm p-3 space-y-2">
      <Shimmer className="h-5 w-32 mx-auto" />
      <div className="grid grid-cols-7 gap-1">
        {[...Array(35)].map((_, i) => (
          <Shimmer key={i} className="h-11 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/** Generic content skeleton lines */
export function ContentSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(lines)].map((_, i) => (
        <Shimmer key={i} className="h-4" style={{ width: `${85 - i * 10}%` }} />
      ))}
    </div>
  );
}

export { Shimmer };

import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
  variant?: "line" | "block" | "circle" | "card";
}

const shimmer = {
  animate: {
    backgroundPosition: ["200% center", "-200% center"],
  },
  transition: {
    duration: 1.8,
    repeat: Infinity,
    ease: "linear" as const,
  },
};

export function Skeleton({ className = "", variant = "block" }: SkeletonProps) {
  const base = "rounded-lg overflow-hidden";
  const sizes = {
    line: "h-3 rounded-full",
    block: "h-10",
    circle: "rounded-full",
    card: "h-24",
  };

  return (
    <motion.div
      className={`${base} ${sizes[variant]} ${className}`}
      style={{
        background:
          "linear-gradient(90deg, hsl(var(--muted) / 0.3) 25%, hsl(var(--muted) / 0.5) 50%, hsl(var(--muted) / 0.3) 75%)",
        backgroundSize: "400% 100%",
      }}
      animate={shimmer.animate}
      transition={shimmer.transition}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card-warm p-4 space-y-3">
      <Skeleton variant="line" className="w-1/3" />
      <Skeleton variant="line" className="w-full" />
      <Skeleton variant="line" className="w-2/3" />
    </div>
  );
}

export function ListRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton variant="circle" className="w-10 h-10 flex-none" />
      <div className="flex-1 space-y-2">
        <Skeleton variant="line" className="w-1/2" />
        <Skeleton variant="line" className="w-3/4" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="px-5 pt-8 pb-6 space-y-3">
      <Skeleton variant="line" className="w-16 h-2" />
      <Skeleton variant="line" className="w-1/2 h-8" />
      <Skeleton variant="line" className="w-3/4 h-3" />
    </div>
  );
}

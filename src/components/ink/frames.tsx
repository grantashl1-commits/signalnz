import type { ReactNode } from "react";

/**
 * Journal frames: a hand-drawn solid box and a dotted box, as in a printed
 * guided journal. The SVG stretches to the container while the stroke keeps
 * its weight (non-scaling-stroke).
 */

interface FrameProps {
  children: ReactNode;
  className?: string;
  /** Tailwind padding etc. for the inner content. */
  innerClassName?: string;
  color?: string;
}

export function InkFrame({ children, className = "", innerClassName = "p-5", color = "hsl(var(--foreground) / 0.75)" }: FrameProps) {
  return (
    <div className={`relative ${className}`}>
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M6 1.2 C30 0.4 70 1.6 94.2 0.9 C98.6 1.3 99.3 4 99.1 8 C98.6 35 99.6 65 99 92.5 C98.8 97.6 96.4 99.2 92 99.1 C66 98.4 34 99.6 7.5 98.9 C2.6 98.7 0.8 96.3 1 92 C1.5 64 0.6 36 1.1 7.4 C1.2 3 2.8 1.4 6 1.2 Z"
          fill="none"
          stroke={color}
          strokeWidth={1.4}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className={`relative ${innerClassName}`}>{children}</div>
    </div>
  );
}

export function DottedFrame({ children, className = "", innerClassName = "p-5", color = "hsl(var(--foreground) / 0.55)" }: FrameProps) {
  return (
    <div className={`relative ${className}`}>
      <svg className="pointer-events-none absolute inset-[1.5px] h-[calc(100%-3px)] w-[calc(100%-3px)] overflow-visible" aria-hidden="true">
        <rect
          width="100%" height="100%" rx="14"
          fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeDasharray="0 7"
        />
      </svg>
      <div className={`relative ${innerClassName}`}>{children}</div>
    </div>
  );
}

/** A printed-journal section heading: spaced serif capitals. */
export function JournalHeading({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`ink-caps text-foreground/80 ${className}`}>{children}</p>;
}

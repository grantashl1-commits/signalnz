import { interpolate, motion, type MotionValue, useTransform } from "framer-motion";
import type { ReactNode } from "react";

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Line-by-line masked reveal for display type. */
export function RevealLines({
  lines,
  className = "",
  delay = 0,
  as: Tag = "h2",
}: {
  lines: ReactNode[];
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "p";
}) {
  const MotionTag = motion[Tag];
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
    >
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em]">
          <motion.span
            className="block"
            variants={{
              hidden: { y: "110%" },
              show: { y: "0%", transition: { duration: 1.1, delay: delay + i * 0.09, ease: EASE } },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

export function FadeUp({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** The Signal ring: dots of varying size on a single orbit. */
export function SignalRing({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  const dots: [number, number][] = [
    [348, 1.5], [7, 2.8], [27, 4.2], [43, 1.5], [57, 8.5], [77, 2.5], [92, 1.5], [108, 5.5], [126, 2], [142, 3.4],
    [160, 1.4], [178, 6.5], [198, 2.2], [214, 1.4], [230, 4.6], [250, 2.6], [268, 7.4], [290, 1.6], [306, 3.8], [326, 2.4],
  ];
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      {dots.map(([deg, r], i) => {
        const a = ((deg - 90) * Math.PI) / 180;
        return <circle key={i} cx={50 + 36 * Math.cos(a)} cy={50 + 36 * Math.sin(a)} r={r} fill={color} />;
      })}
    </svg>
  );
}

/**
 * Scroll-linked ramp computed on the JS thread.
 * Framer's accelerated ScrollTimeline path doesn't reliably drive `opacity`
 * for target-offset scroll progress, so we opt out with a function transform.
 */
export function useRamp(mv: MotionValue<number>, input: number[], output: number[]) {
  const f = interpolate(input, output, { clamp: true });
  return useTransform(mv, (v) => f(v));
}

import { memo, useRef } from "react";
import { motion } from "framer-motion";

/* ── Animated Dot Pattern SVG — slow drifting atmospheric texture ── */
let dotId = 0;
export const DotPattern = memo(function DotPattern({
  color = "hsl(284 30% 75%)",
  opacity = 0.1,
  size = 32,
  animate = false,
}: {
  color?: string;
  opacity?: number;
  size?: number;
  animate?: boolean;
}) {
  const id = useRef(`dots-${++dotId}`);
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity }}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={id.current}
          x="0"
          y="0"
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
        >
          {animate && (
            <animateTransform
              attributeName="patternTransform"
              type="translate"
              from="0 0"
              to={`${size} ${size}`}
              dur="80s"
              repeatCount="indefinite"
            />
          )}
          <circle cx={size / 8} cy={size / 8} r={1.5} fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id.current})`} />
    </svg>
  );
});

/* ── Atmospheric Hero Section — Evolved Signal ──
   An inset aubergine panel: slow aurora light, film grain and the concentric
   Signal ring motif. Heading <h1>s inside are set in the editorial serif. */
interface AtmosphericHeroProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const HERO_MIN_H: Record<NonNullable<AtmosphericHeroProps["size"]>, string> = {
  sm: "min-h-[180px]",
  md: "min-h-[220px] md:min-h-[260px]",
  lg: "min-h-[360px] md:min-h-[440px]",
};

export function AtmosphericHero({
  children,
  className = "",
  size = "md",
}: AtmosphericHeroProps) {
  return (
    <div className="px-3 pt-3 md:px-6 md:pt-5">
      <motion.section
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className={`atmo-hero relative isolate overflow-hidden rounded-[28px] md:rounded-[36px] flex flex-col justify-center px-6 py-10 md:py-14 ${HERO_MIN_H[size]} ${className}`}
      >
        <div className="aurora" aria-hidden="true">
          <span /><span /><span />
        </div>

        {/* Concentric Signal ring motif */}
        <svg
          className="absolute -right-24 -top-24 w-[420px] h-[420px] pointer-events-none sketch-rotate"
          viewBox="0 0 400 400"
          style={{ opacity: 0.09 }}
          aria-hidden="true"
        >
          {[60, 95, 130, 165, 195].map((r, ri) => {
            const dotCount = 14 + ri * 9;
            return Array.from({ length: dotCount }, (_, di) => {
              const angle = (2 * Math.PI * di) / dotCount;
              return (
                <circle
                  key={`${ri}-${di}`}
                  cx={200 + r * Math.cos(angle)}
                  cy={200 + r * Math.sin(angle)}
                  r={Math.max(2.6 - ri * 0.35, 0.9)}
                  fill="hsl(36 33% 97%)"
                />
              );
            });
          })}
        </svg>

        <div className="grain" aria-hidden="true" />

        <div className="relative z-10 max-w-3xl mx-auto w-full">{children}</div>
      </motion.section>
    </div>
  );
}

/* ── Cream Content Section — warm card area with extra spacing ── */
interface ContentSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function ContentSection({ children, className = "" }: ContentSectionProps) {
  return (
    <section className={`relative ${className}`} style={{ paddingTop: 'var(--section-gap)', paddingBottom: 'var(--section-gap)' }}>
      <div className="content-section-inner relative z-10 max-w-3xl mx-auto">{children}</div>
    </section>
  );
}

/* ── Page Section Divider — elegant transition ── */
export function SectionDivider() {
  return (
    <div className="flex justify-center py-6 md:py-8">
      <div className="w-16 h-[1px] rounded-full bg-border/60" />
    </div>
  );
}

/* ── Animated card entrance wrapper ── */
export function AnimatedCard({
  children,
  index = 0,
  className = "",
}: {
  children: React.ReactNode;
  index?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.07 * index, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

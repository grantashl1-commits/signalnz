import { memo, useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

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

/* ── Atmospheric Hero Section — deep violet with animated dot grid ── */
interface AtmosphericHeroProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  dotColor?: string;
  dotOpacity?: number;
}

export function AtmosphericHero({
  children,
  className = "",
  size = "md",
  dotColor = "hsl(30 33% 98%)",
  dotOpacity = 0.06,
}: AtmosphericHeroProps) {
  const paddingClass = {
    sm: "py-12 md:py-16",
    md: "py-16 md:py-24",
    lg: "py-24 md:py-32",
  }[size];

  return (
    <section
      className={`relative overflow-hidden -mx-5 md:-mx-4 px-5 md:px-4 ${paddingClass} ${className}`}
      style={{
        background: "linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(284 22% 40%) 100%)",
      }}
    >
      {/* Drifting dot grid */}
      <DotPattern color={dotColor} opacity={dotOpacity} animate />

      {/* Soft radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 40%, hsl(284 30% 64% / 0.12), transparent)",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">{children}</div>
    </section>
  );
}

/* ── Cream Content Section — warm card area with extra spacing ── */
interface ContentSectionProps {
  children: React.ReactNode;
  className?: string;
  withDots?: boolean;
}

export function ContentSection({ children, className = "", withDots = false }: ContentSectionProps) {
  return (
    <section className={`relative px-0 py-10 md:py-14 ${className}`}>
      {withDots && <DotPattern color="hsl(25 25% 75%)" opacity={0.06} />}
      <div className="relative z-10 max-w-3xl mx-auto">{children}</div>
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

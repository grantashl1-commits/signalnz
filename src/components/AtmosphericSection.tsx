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
}

export function AtmosphericHero({
  children,
  className = "",
  size = "md",
}: AtmosphericHeroProps) {
  const heroStyle = {
    minHeight: '220px',
    paddingTop: '48px',
    paddingBottom: '32px',
    paddingLeft: '24px',
    paddingRight: '24px',
    background: "linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(284 22% 40%) 100%)",
  };

  return (
    <section
      className={`relative overflow-hidden -mx-5 md:-mx-4 ${className}`}
      style={heroStyle}
    >
      {/* Radial dot cluster overlay — concentric brand motif for depth */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid slice"
        style={{ opacity: 0.04 }}
        aria-hidden="true"
      >
        {[40, 70, 100, 130, 160].map((r, ri) => {
          const dotCount = 10 + ri * 8;
          const dotR = 2.5 - ri * 0.3;
          return Array.from({ length: dotCount }, (_, di) => {
            const angle = (2 * Math.PI * di) / dotCount - Math.PI / 2;
            return (
              <circle
                key={`${ri}-${di}`}
                cx={200 + r * Math.cos(angle)}
                cy={200 + r * Math.sin(angle)}
                r={Math.max(dotR, 0.8)}
                fill="hsl(30 33% 98%)"
                opacity={0.8 - ri * 0.12}
              />
            );
          });
        })}
      </svg>

      {/* Soft radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 40%, hsl(284 30% 64% / 0.12), transparent)",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">{children}</div>

      {/* Bottom vignette — soft dissolve into page content */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-10"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, hsl(var(--background) / 0.15) 40%, hsl(var(--background) / 0.6) 70%, hsl(var(--background)) 100%)",
        }}
      />
    </section>
  );
}

/* ── Cream Content Section — warm card area with extra spacing ── */
interface ContentSectionProps {
  children: React.ReactNode;
  className?: string;
  withDots?: boolean;
}

export function ContentSection({ children, className = "" }: ContentSectionProps) {
  return (
    <section className={`relative ${className}`} style={{ paddingTop: 'var(--section-gap)', paddingBottom: 'var(--section-gap)' }}>
      <div className="relative z-10 max-w-3xl mx-auto">{children}</div>
    </section>
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

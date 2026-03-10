import { memo, useRef } from "react";
import { motion } from "framer-motion";

/* ── Dot Pattern SVG — reusable atmospheric texture ── */
let dotId = 0;
export const DotPattern = memo(function DotPattern({
  color = "hsl(284 30% 75%)",
  opacity = 0.1,
  size = 32,
}: {
  color?: string;
  opacity?: number;
  size?: number;
}) {
  const id = useRef(`dots-${++dotId}`);
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} aria-hidden="true">
      <defs>
        <pattern id={id.current} x="0" y="0" width={size} height={size} patternUnits="userSpaceOnUse">
          <circle cx={size / 8} cy={size / 8} r={1.5} fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id.current})`} />
    </svg>
  );
});

/* ── Atmospheric Hero Section — deep violet with dot grid ── */
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
  dotOpacity = 0.07,
}: AtmosphericHeroProps) {
  const paddingClass = {
    sm: "py-10 md:py-14",
    md: "py-14 md:py-20",
    lg: "py-20 md:py-28",
  }[size];

  return (
    <section
      className={`relative overflow-hidden -mx-5 md:-mx-4 px-5 md:px-4 ${paddingClass} ${className}`}
      style={{ backgroundColor: "hsl(var(--primary))" }}
    >
      <DotPattern color={dotColor} opacity={dotOpacity} />
      <div className="relative z-10 max-w-3xl mx-auto">{children}</div>
    </section>
  );
}

/* ── Cream Content Section — warm card area ── */
interface ContentSectionProps {
  children: React.ReactNode;
  className?: string;
  withDots?: boolean;
}

export function ContentSection({ children, className = "", withDots = false }: ContentSectionProps) {
  return (
    <section className={`relative px-0 py-8 md:py-12 ${className}`}>
      {withDots && <DotPattern color="hsl(25 25% 75%)" opacity={0.08} />}
      <div className="relative z-10 max-w-3xl mx-auto">{children}</div>
    </section>
  );
}

/* ── Page Section Divider — elegant transition ── */
export function SectionDivider() {
  return (
    <div className="flex justify-center py-4 md:py-6">
      <div className="w-12 h-[2px] rounded-full bg-border" />
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 * index, duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MOTIFS, type InkMotif, type InkName } from "./motifs";

export type { InkName } from "./motifs";

interface InkProps {
  name: InkName;
  className?: string;
  /** Stroke colour; defaults to currentColor so it follows text colour. */
  color?: string;
  /** Visual stroke width at a 64px render. Scales with the SVG. */
  weight?: number;
  /** Draw the lines on as the motif scrolls into view. */
  draw?: boolean;
  /** Seconds before the draw starts. */
  delay?: number;
  title?: string;
}

/**
 * A fine-line ink illustration. Decorative by default (aria-hidden) unless a
 * `title` is supplied.
 */
function InkBase({ name, className = "", color = "currentColor", weight = 1.5, draw = false, delay = 0, title }: InkProps) {
  const reduced = useReducedMotion();
  const motif: InkMotif = MOTIFS[name];
  const animate = draw && !reduced;
  const per = motif.paths.length > 1 ? 0.9 / motif.paths.length : 0;

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke={color}
      strokeWidth={weight}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {motif.paths.map((d, i) =>
        animate ? (
          <motion.path
            key={i}
            d={d}
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, margin: "-5% 0px" }}
            transition={{ pathLength: { duration: 1.4, delay: delay + i * per, ease: [0.65, 0, 0.35, 1] }, opacity: { duration: 0.2, delay: delay + i * per } }}
          />
        ) : (
          <path key={i} d={d} />
        ),
      )}
      {motif.dots?.map(([cx, cy, r], i) =>
        animate ? (
          <motion.circle
            key={`d${i}`}
            cx={cx} cy={cy} r={r}
            fill={color} stroke="none"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: delay + 1 + i * 0.04 }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        ) : (
          <circle key={`d${i}`} cx={cx} cy={cy} r={r} fill={color} stroke="none" />
        ),
      )}
    </svg>
  );
}

export const Ink = memo(InkBase);
export default Ink;

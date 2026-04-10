import { motion } from "framer-motion";

/**
 * Inline SVG brand logo — precisely matches the SIGNAL ring icon.
 * Ring of circles with dramatically varying sizes (large, medium, small, tiny)
 * arranged at a single orbit radius. No centre dot. No concentric rings.
 *
 * Dot positions and sizes reverse-engineered from public/logos/Icon.png.
 */

// Each entry: [clockwise degrees from 12 o'clock, orbit radius, dot radius]
// All in a 100×100 viewBox (centre = 50,50)
const RAW_DOTS: [number, number, number][] = [
  [348, 37, 1.5],  // tiny  — just before 12
  [7,   35, 2.8],  // small — just after 12
  [27,  34, 4.2],  // medium
  [43,  37, 1.5],  // tiny
  [57,  30, 8.5],  // LARGE  ~2 o'clock
  [77,  36, 2.5],  // small
  [92,  37, 1.5],  // tiny
  [107, 30, 8.0],  // LARGE  ~3 o'clock
  [128, 35, 3.0],  // medium-small
  [147, 37, 1.5],  // tiny
  [163, 34, 4.0],  // medium
  [184, 30, 7.5],  // LARGE  ~5 o'clock
  [208, 28, 9.5],  // LARGEST ~6 o'clock
  [232, 32, 5.5],  // medium-large
  [250, 36, 2.5],  // small
  [262, 37, 1.5],  // tiny
  [279, 30, 8.5],  // LARGE  ~9 o'clock
  [297, 34, 3.5],  // medium
  [310, 37, 1.8],  // tiny
  [324, 35, 2.8],  // small
  [338, 30, 7.5],  // LARGE  ~11 o'clock
];

function degToXY(deg: number, r: number) {
  const rad = (deg - 90) * (Math.PI / 180);
  return { x: 50 + r * Math.cos(rad), y: 50 + r * Math.sin(rad) };
}

const DOTS = RAW_DOTS.map(([deg, r, dotR]) => ({ ...degToXY(deg, r), dotR }));

export default function SignalLogo({
  size = 32,
  animated = false,
  className = "",
  color = "currentColor",
}: {
  size?: number;
  animated?: boolean;
  className?: string;
  color?: string;
}) {
  const Wrapper = animated ? motion.g : "g";
  const motionProps = animated
    ? {
        animate: { rotate: [0, 360] },
        transition: {
          duration: 80,
          repeat: Infinity,
          ease: "linear" as const,
        },
        style: { transformOrigin: "50px 50px" },
      }
    : {};

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-label="Signal logo"
      fill="none"
    >
      {/* @ts-expect-error — Wrapper is either motion.g or "g" */}
      <Wrapper {...motionProps}>
        {DOTS.map((dot, i) => (
          <circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={dot.dotR}
            fill={color}
          />
        ))}
      </Wrapper>
    </svg>
  );
}

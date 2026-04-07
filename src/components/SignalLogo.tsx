import { motion } from "framer-motion";

/**
 * Inline SVG brand logo — dotted concentric rings with a solid centre dot.
 * Matches the favicon / PWA icon aesthetic.
 */
export default function SignalLogo({
  size = 32,
  animated = false,
  className = "",
}: {
  size?: number;
  animated?: boolean;
  className?: string;
}) {
  const cx = 50;
  const cy = 50;
  const rings = [
    { r: 12, dots: 12, dotR: 2.8 },
    { r: 22, dots: 20, dotR: 2.2 },
    { r: 32, dots: 28, dotR: 1.8 },
    { r: 42, dots: 36, dotR: 1.4 },
  ];

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-label="Signal logo"
    >
      {/* Centre dot */}
      <circle cx={cx} cy={cy} r={5} fill="currentColor" opacity={0.9} />

      {/* Dotted rings */}
      {rings.map((ring, ri) => {
        const dots = Array.from({ length: ring.dots }, (_, i) => {
          const angle = (2 * Math.PI * i) / ring.dots - Math.PI / 2;
          return {
            x: cx + ring.r * Math.cos(angle),
            y: cy + ring.r * Math.sin(angle),
          };
        });

        const Wrapper = animated ? motion.g : "g";
        const animProps = animated
          ? {
              animate: { rotate: [0, ri % 2 === 0 ? 360 : -360] },
              transition: {
                duration: 60 + ri * 20,
                repeat: Infinity,
                ease: "linear" as const,
              },
              style: { transformOrigin: "50px 50px" },
            }
          : {};

        return (
          <Wrapper key={ri} {...animProps}>
            {dots.map((d, di) => (
              <circle
                key={di}
                cx={d.x}
                cy={d.y}
                r={ring.dotR}
                fill="currentColor"
                opacity={0.7 - ri * 0.1}
              />
            ))}
          </Wrapper>
        );
      })}
    </svg>
  );
}

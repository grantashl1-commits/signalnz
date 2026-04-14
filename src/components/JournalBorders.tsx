import React from "react";

/**
 * Hand-drawn SVG border elements inspired by Year of Coming Home journal.
 * Use these to wrap sections in a journal-like aesthetic.
 */

/* ── Hand-drawn rounded box ── */
export function HandDrawnBox({
  children,
  className = "",
  strokeColor = "hsl(var(--foreground) / 0.12)",
}: {
  children: React.ReactNode;
  className?: string;
  strokeColor?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M18 6 C18 6 382 4 384 6 C386 8 394 12 394 18 L396 182 C396 188 392 194 386 194 L14 196 C8 196 4 192 4 186 L6 18 C6 12 10 6 18 6Z"
          stroke={strokeColor}
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}

/* ── Dotted circle divider (○ ○ ○ ○ ○) ── */
export function DottedDivider({
  count = 20,
  className = "",
  color = "hsl(var(--foreground) / 0.1)",
}: {
  count?: number;
  className?: string;
  color?: string;
}) {
  return (
    <svg
      className={`w-full h-3 ${className}`}
      viewBox={`0 0 ${count * 14} 10`}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
    >
      {Array.from({ length: count }).map((_, i) => (
        <circle
          key={i}
          cx={7 + i * 14}
          cy={5}
          r={2 + Math.sin(i * 0.7) * 0.3}
          fill={color}
        />
      ))}
    </svg>
  );
}

/* ── Celestial header (stars + moon) ── */
export function CelestialHeader({
  className = "",
  color = "hsl(var(--foreground) / 0.15)",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      className={`w-20 h-8 mx-auto ${className}`}
      viewBox="0 0 80 30"
      fill="none"
    >
      {/* Stars */}
      <path d="M12 8 L13 12 L17 12 L14 15 L15 19 L12 16 L9 19 L10 15 L7 12 L11 12Z" fill={color} />
      <path d="M68 8 L69 12 L73 12 L70 15 L71 19 L68 16 L65 19 L66 15 L63 12 L67 12Z" fill={color} />
      <path d="M28 4 L29 6 L31 6 L29.5 8 L30 10 L28 8.5 L26 10 L26.5 8 L25 6 L27 6Z" fill={color} />
      <path d="M52 4 L53 6 L55 6 L53.5 8 L54 10 L52 8.5 L50 10 L50.5 8 L49 6 L51 6Z" fill={color} />
      {/* Moon */}
      <path
        d="M40 5 C40 5 44 8 44 14 C44 20 40 23 36 23 C42 22 46 17 46 12 C46 7 42 4 40 5Z"
        fill={color}
      />
      {/* Tiny dots */}
      <circle cx={22} cy={14} r={1} fill={color} />
      <circle cx={58} cy={14} r={1} fill={color} />
      <circle cx={35} cy={26} r={0.8} fill={color} />
      <circle cx={45} cy={26} r={0.8} fill={color} />
    </svg>
  );
}

/* ── Botanical corner accent ── */
export function BotanicalCorner({
  className = "",
  color = "hsl(var(--foreground) / 0.12)",
  mirror = false,
}: {
  className?: string;
  color?: string;
  mirror?: boolean;
}) {
  return (
    <svg
      className={`w-10 h-10 ${className}`}
      viewBox="0 0 40 40"
      fill="none"
      style={mirror ? { transform: "scaleX(-1)" } : undefined}
    >
      {/* Stem */}
      <path d="M35 38 Q28 30 24 20 Q22 14 26 8" stroke={color} strokeWidth="1" strokeLinecap="round" />
      {/* Leaves */}
      <path d="M26 8 Q22 4 18 8 Q22 10 26 8" fill={color} opacity={0.5} />
      <path d="M24 16 Q18 14 16 18 Q20 18 24 16" fill={color} opacity={0.4} />
      <path d="M28 24 Q24 22 22 26 Q26 26 28 24" fill={color} opacity={0.3} />
      {/* Small flower */}
      <path d="M18 6 Q16 3 14 6 Q16 8 18 6" fill={color} opacity={0.3} />
    </svg>
  );
}

/* ── Small decorative flower/sun icon ── */
export function JournalFlower({
  className = "",
  color = "hsl(var(--foreground) / 0.15)",
  size = 24,
}: {
  className?: string;
  color?: string;
  size?: number;
}) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx={12} cy={12} r={3} fill={color} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x = 12 + Math.cos(rad) * 7;
        const y = 12 + Math.sin(rad) * 7;
        return (
          <ellipse
            key={angle}
            cx={x}
            cy={y}
            rx={2.5}
            ry={4}
            transform={`rotate(${angle} ${x} ${y})`}
            fill={color}
            opacity={0.4}
          />
        );
      })}
    </svg>
  );
}

/* ── Full journal section wrapper ── */
export function JournalSection({
  children,
  title,
  className = "",
  showCorners = true,
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
  showCorners?: boolean;
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Hand-drawn border */}
      <HandDrawnBox className="p-4 md:p-5">
        {showCorners && (
          <>
            <BotanicalCorner className="absolute -top-1 -left-1 opacity-60" />
            <BotanicalCorner className="absolute -top-1 -right-1 opacity-60" mirror />
          </>
        )}
        {title && (
          <div className="text-center mb-3">
            <p className="font-hand text-sm text-muted-foreground/50 uppercase tracking-[0.2em]">
              {title}
            </p>
            <DottedDivider count={12} className="mt-2" />
          </div>
        )}
        <div className="relative">{children}</div>
      </HandDrawnBox>
    </div>
  );
}

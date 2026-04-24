/**
 * Hand-drawn YOCH-style SVG icons for the Appreciation Panel.
 * Style: Thin sienna/brown pen outlines, organic wobble, celestial + botanical
 * motifs. Designed to feel like they were drawn into a wellness journal.
 *
 * All icons share a 48x48 viewBox and use `currentColor` for stroke so they
 * inherit the warm-stone/brown tone from the parent element.
 */

interface IconProps {
  className?: string;
}

const baseStroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** "I see you" — gentle eye with eyelashes + tiny stars */
export const YochEye = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className} {...baseStroke}>
    <path d="M6 24c4-7 11-11 18-11s14 4 18 11c-4 7-11 11-18 11S10 31 6 24z" />
    <circle cx="24" cy="24" r="5" />
    <circle cx="24" cy="24" r="1.6" fill="currentColor" />
    {/* lashes */}
    <path d="M10 18l-2-2M16 14l-1-2.5M24 12.5V10M32 14l1-2.5M38 18l2-2" />
    {/* sparkle */}
    <path d="M41 10l.7 1.5L43 12l-1.3.5L41 14l-.7-1.5L39 12l1.3-.5z" />
  </svg>
);

/** "You are enough" — five-point star with radiating dots */
export const YochStar = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className} {...baseStroke}>
    <path d="M24 8l4.6 9.4 10.4 1.5-7.5 7.3 1.8 10.3L24 31.6 14.7 36.5l1.8-10.3L9 18.9l10.4-1.5z" />
    {/* radiating dots */}
    <circle cx="6" cy="24" r="0.8" fill="currentColor" />
    <circle cx="42" cy="24" r="0.8" fill="currentColor" />
    <circle cx="24" cy="4" r="0.8" fill="currentColor" />
    <circle cx="24" cy="44" r="0.8" fill="currentColor" />
    <circle cx="10" cy="10" r="0.6" fill="currentColor" />
    <circle cx="38" cy="10" r="0.6" fill="currentColor" />
  </svg>
);

/** "I'm listening" — ear with little sound waves and a leaf */
export const YochEar = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className} {...baseStroke}>
    <path d="M18 36c-3-1-5-4-5-9 0-7 5-13 12-13s11 5 11 11c0 5-3 7-6 8-2 .7-3 2-3 4 0 2-1 4-4 4s-5-2-5-5z" />
    <path d="M22 22c0-2 2-4 4-4s4 2 4 4-2 4-4 4" />
    {/* sound waves */}
    <path d="M40 18c1.5 1.5 1.5 4 0 6M44 14c3 3 3 9 0 12" />
    {/* leaf accent */}
    <path d="M10 14c2-2 5-2 6 0-2 1-5 1-6 0z" />
  </svg>
);

/** "You don't have to do it all" — open hand cradling a small flower */
export const YochHand = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className} {...baseStroke}>
    <path d="M14 28V14c0-1.5 1-2.5 2.5-2.5S19 12.5 19 14v10" />
    <path d="M19 24V10.5c0-1.5 1-2.5 2.5-2.5S24 9 24 10.5V24" />
    <path d="M24 24V11.5c0-1.5 1-2.5 2.5-2.5S29 10 29 11.5V24" />
    <path d="M29 24V14c0-1.5 1-2.5 2.5-2.5S34 12.5 34 14v14c0 6-4 12-10 12s-10-4-10-12" />
    {/* flower in palm */}
    <circle cx="24" cy="30" r="1.2" />
    <path d="M24 27.5v-1M24 33.5v1M21.5 30h-1M27.5 30h1" />
  </svg>
);

/** "I'm here for you" — shield with a small heart inside */
export const YochShield = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className} {...baseStroke}>
    <path d="M24 6c5 2 10 3 15 3-1 14-6 24-15 30-9-6-14-16-15-30 5 0 10-1 15-3z" />
    <path d="M24 28c-3-2-5-4-5-7 0-2 1.5-3.5 3.5-3.5 1 0 1.5.5 1.5 1 0-.5.5-1 1.5-1 2 0 3.5 1.5 3.5 3.5 0 3-2 5-5 7z" />
  </svg>
);

/** "I'm proud of you" — sparkles cluster, hand-drawn */
export const YochSparkles = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className} {...baseStroke}>
    {/* main sparkle */}
    <path d="M22 8l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
    {/* small sparkle top right */}
    <path d="M37 14l1.3 3 3 1.3-3 1.3L37 23l-1.3-3-3-1.3 3-1.3z" />
    {/* small sparkle bottom right */}
    <path d="M34 32l1 2.5 2.5 1-2.5 1L34 39l-1-2.5-2.5-1 2.5-1z" />
    {/* tiny dot */}
    <circle cx="42" cy="38" r="0.8" fill="currentColor" />
  </svg>
);

/** "I trust you" — knot / interlocking circles */
export const YochTrust = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className} {...baseStroke}>
    <circle cx="18" cy="24" r="10" />
    <circle cx="30" cy="24" r="10" />
    {/* botanical dots */}
    <circle cx="24" cy="8" r="0.8" fill="currentColor" />
    <circle cx="24" cy="40" r="0.8" fill="currentColor" />
    <path d="M6 24c-1-1-1-2 0-3M42 24c1-1 1-2 0-3" />
  </svg>
);

/** "You make me feel safe" — heart with small home/roof line */
export const YochHomeHeart = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className} {...baseStroke}>
    <path d="M24 38c-7-5-14-10-14-18 0-4 3-7 7-7 3 0 5 1.5 7 4 2-2.5 4-4 7-4 4 0 7 3 7 7 0 8-7 13-14 18z" />
    {/* tiny door */}
    <path d="M22 30v-4h4v4" />
    {/* roof line above */}
    <path d="M14 18l10-7 10 7" />
  </svg>
);

/** "I believe in you" — sun with rays and a small mountain */
export const YochSun = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className} {...baseStroke}>
    <circle cx="24" cy="22" r="7" />
    {/* rays */}
    <path d="M24 8v4M24 32v4M10 22h4M34 22h4M14 12l3 3M34 12l-3 3M14 32l3-3M34 32l-3-3" />
    {/* horizon dots */}
    <circle cx="8" cy="40" r="0.7" fill="currentColor" />
    <circle cx="16" cy="40" r="0.7" fill="currentColor" />
    <circle cx="24" cy="40" r="0.7" fill="currentColor" />
    <circle cx="32" cy="40" r="0.7" fill="currentColor" />
    <circle cx="40" cy="40" r="0.7" fill="currentColor" />
  </svg>
);

/** "Thank you for being you" — botanical flower sprig */
export const YochFlower = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className} {...baseStroke}>
    <circle cx="24" cy="18" r="3" />
    {/* petals */}
    <path d="M24 11c-2-2-2-5 0-7 2 2 2 5 0 7zM24 25c-2 2-2 5 0 7 2-2 2-5 0-7zM17 18c-2-2-5-2-7 0 2 2 5 2 7 0zM31 18c2-2 5-2 7 0-2 2-5 2-7 0z" />
    {/* stem + leaves */}
    <path d="M24 21v18" />
    <path d="M24 28c-3 0-5-2-6-4 3 0 5 2 6 4zM24 34c3 0 5-2 6-4-3 0-5 2-6 4z" />
  </svg>
);

/** "I love you — even when I forget" — heart with loose stitch line */
export const YochHeart = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className} {...baseStroke}>
    <path d="M24 40c-9-6-17-12-17-21 0-5 4-9 9-9 3 0 6 1.5 8 4 2-2.5 5-4 8-4 5 0 9 4 9 9 0 9-8 15-17 21z" />
    {/* dotted inner line */}
    <path d="M16 17c2 0 3 1 4 2M28 19c1-1 2-2 4-2" strokeDasharray="1 2" />
  </svg>
);

/** "I'd choose you again" — crescent moon with stars */
export const YochMoon = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className} {...baseStroke}>
    <path d="M30 8a14 14 0 1 0 10 24 11 11 0 0 1-10-24z" />
    {/* stars */}
    <path d="M12 14l.7 1.5L14 16l-1.3.5L12 18l-.7-1.5L10 16l1.3-.5z" />
    <path d="M8 28l.6 1.2 1.2.6-1.2.6L8 31.6l-.6-1.2L6.2 30l1.2-.6z" />
    <circle cx="16" cy="36" r="0.7" fill="currentColor" />
  </svg>
);

/** Icon used on the floating "send" / sent affirmation pill — heart in a wreath */
export const YochSentHeart = ({ className }: IconProps) => (
  <svg viewBox="0 0 48 48" className={className} {...baseStroke}>
    <path d="M24 36c-6-4-11-8-11-14 0-3 2.5-5.5 5.5-5.5 2 0 4 1 5.5 3 1.5-2 3.5-3 5.5-3 3 0 5.5 2.5 5.5 5.5 0 6-5 10-11 14z" fill="currentColor" fillOpacity="0.15" />
    <path d="M24 36c-6-4-11-8-11-14 0-3 2.5-5.5 5.5-5.5 2 0 4 1 5.5 3 1.5-2 3.5-3 5.5-3 3 0 5.5 2.5 5.5 5.5 0 6-5 10-11 14z" />
    {/* wreath dots */}
    <circle cx="8" cy="24" r="0.7" fill="currentColor" />
    <circle cx="40" cy="24" r="0.7" fill="currentColor" />
    <circle cx="14" cy="10" r="0.7" fill="currentColor" />
    <circle cx="34" cy="10" r="0.7" fill="currentColor" />
    <circle cx="14" cy="38" r="0.7" fill="currentColor" />
    <circle cx="34" cy="38" r="0.7" fill="currentColor" />
  </svg>
);

export const YOCH_ICON_MAP = {
  "see-you": YochEye,
  "enough": YochStar,
  "listening": YochEar,
  "not-alone": YochHand,
  "here-for-you": YochShield,
  "proud": YochSparkles,
  "trust": YochTrust,
  "safe": YochHomeHeart,
  "believe": YochSun,
  "thank-you": YochFlower,
  "love-unsaid": YochHeart,
  "choose-you": YochMoon,
} as const;

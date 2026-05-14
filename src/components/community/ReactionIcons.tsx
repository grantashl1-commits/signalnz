// Custom hand-drawn mini reaction icons (no emoji).
// Stroke style matches BotanicalElements — thin, slightly imperfect.
const STROKE = "currentColor";

interface IconProps {
  size?: number;
  className?: string;
}

export function IconHands({ size = 18, className = "" }: IconProps) {
  // Two cupped palms — gratitude / 🙏 stand-in
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}
      stroke={STROKE} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13c0-3 1-5 2.4-6.5.6-.6 1.6-.4 1.7.5L10 13" />
      <path d="M19 13c0-3-1-5-2.4-6.5-.6-.6-1.6-.4-1.7.5L14 13" />
      <path d="M9 13c-1 0-2 1-2 2.5C7 18 9 20 12 20s5-2 5-4.5c0-1.5-1-2.5-2-2.5" />
      <path d="M10.5 13.2 12 14.5l1.5-1.3" />
    </svg>
  );
}

export function IconStrong({ size = 18, className = "" }: IconProps) {
  // Flexed arm — strength / 💪 stand-in
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}
      stroke={STROKE} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 13c2-1 4-1 6 0" />
      <path d="M10 13c2-.5 3.5-2 4-4 .3-1.4 1.6-1.8 2.4-.7.7 1 .8 2.6.4 4.2-.6 2.4-2.5 4.5-5 5" />
      <path d="M11 18c2.5 0 4.5-.8 5.8-2.3" />
      <path d="M4.5 16.5c1.5-.4 2.6-1.4 3-2.8" />
    </svg>
  );
}

export function IconHeart({ size = 18, className = "" }: IconProps) {
  // Gentle hand-drawn heart
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}
      stroke={STROKE} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19c-3-2-7-5-7-9 0-2.2 1.7-4 3.8-4 1.4 0 2.6.8 3.2 2 .6-1.2 1.8-2 3.2-2 2.1 0 3.8 1.8 3.8 4 0 4-4 7-7 9z" />
    </svg>
  );
}

export function IconHug({ size = 18, className = "" }: IconProps) {
  // Two arms wrapping — hug / 🤗 stand-in
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}
      stroke={STROKE} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="2.4" />
      <path d="M5 19c1-3 4-4.5 7-4.5s6 1.5 7 4.5" />
      <path d="M3.5 12.5c1.5 1 3 1.8 4.5 2.2" />
      <path d="M20.5 12.5c-1.5 1-3 1.8-4.5 2.2" />
    </svg>
  );
}

export function IconWarmth({ size = 18, className = "" }: IconProps) {
  // Sun with rays — "send warmth"
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}
      stroke={STROKE} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 4v2.5" />
      <path d="M12 17.5V20" />
      <path d="M4 12h2.5" />
      <path d="M17.5 12H20" />
      <path d="M6.3 6.3l1.8 1.8" />
      <path d="M15.9 15.9l1.8 1.8" />
      <path d="M6.3 17.7l1.8-1.8" />
      <path d="M15.9 8.1l1.8-1.8" />
    </svg>
  );
}

export const REACTIONS = [
  { key: "thanks", label: "Thanks", Icon: IconHands },
  { key: "strong", label: "Strong", Icon: IconStrong },
  { key: "love",   label: "Love",   Icon: IconHeart },
  { key: "hug",    label: "Hug",    Icon: IconHug },
] as const;

export type ReactionKey = typeof REACTIONS[number]["key"] | "warmth";

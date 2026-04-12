import { type HabitCarouselCard } from "@/data/habit-carousel-data";

/* Hand-drawn style SVG motifs inspired by the Musings from the Moon aesthetic */
const motifs: Record<string, React.FC<{ className?: string }>> = {
  moon: ({ className }) => (
    <svg viewBox="0 0 80 80" className={className} fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round">
      <path d="M45 18c-8 0-14.5 6.5-14.5 14.5S37 47 45 47c-4.5 0-9.5-4-9.5-14.5S40.5 18 45 18z" />
      <circle cx="30" cy="16" r="1" fill="currentColor" />
      <circle cx="55" cy="22" r="0.8" fill="currentColor" />
      <circle cx="25" cy="38" r="0.6" fill="currentColor" />
      <circle cx="58" cy="40" r="1" fill="currentColor" />
      <circle cx="38" cy="50" r="0.7" fill="currentColor" />
      <path d="M50 14l1 2.5 2.5 0.5-2 1.8 0.5 2.5-2.2-1.3-2.3 1.2 0.6-2.5-1.9-1.8 2.5-0.4z" fill="currentColor" strokeWidth="0" />
      <path d="M22 28l0.7 1.5 1.6 0.3-1.2 1.1 0.3 1.6-1.4-0.8-1.5 0.7 0.4-1.6-1.1-1.2 1.6-0.2z" fill="currentColor" strokeWidth="0" />
    </svg>
  ),
  sun: ({ className }) => (
    <svg viewBox="0 0 80 80" className={className} fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round">
      <circle cx="40" cy="35" r="8" />
      <line x1="40" y1="22" x2="40" y2="18" />
      <line x1="40" y1="48" x2="40" y2="52" />
      <line x1="27" y1="35" x2="23" y2="35" />
      <line x1="53" y1="35" x2="57" y2="35" />
      <line x1="31" y1="26" x2="28" y2="23" />
      <line x1="49" y1="26" x2="52" y2="23" />
      <line x1="31" y1="44" x2="28" y2="47" />
      <line x1="49" y1="44" x2="52" y2="47" />
      <circle cx="30" cy="52" r="0.6" fill="currentColor" />
      <circle cx="54" cy="50" r="0.8" fill="currentColor" />
    </svg>
  ),
  flower: ({ className }) => (
    <svg viewBox="0 0 80 80" className={className} fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round">
      <circle cx="40" cy="30" r="3" fill="currentColor" opacity="0.3" />
      <ellipse cx="40" cy="22" rx="3" ry="5" />
      <ellipse cx="47" cy="26" rx="3" ry="5" transform="rotate(60 47 26)" />
      <ellipse cx="47" cy="34" rx="3" ry="5" transform="rotate(120 47 34)" />
      <ellipse cx="40" cy="38" rx="3" ry="5" />
      <ellipse cx="33" cy="34" rx="3" ry="5" transform="rotate(60 33 34)" />
      <ellipse cx="33" cy="26" rx="3" ry="5" transform="rotate(120 33 26)" />
      <path d="M40 42v14" />
      <path d="M40 48c3-2 6-1 8 1" />
      <path d="M40 52c-2-2-5-2-7 0" />
    </svg>
  ),
  leaf: ({ className }) => (
    <svg viewBox="0 0 80 80" className={className} fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round">
      <path d="M28 50C28 30 40 18 55 18c0 15-10 28-27 32z" />
      <path d="M30 48c5-6 12-14 24-28" />
      <path d="M36 42c2-3 4-5 7-8" />
      <path d="M33 46c1-2 3-4 5-5" />
      <circle cx="25" cy="22" r="0.6" fill="currentColor" />
      <circle cx="58" cy="45" r="0.7" fill="currentColor" />
    </svg>
  ),
  star: ({ className }) => (
    <svg viewBox="0 0 80 80" className={className} fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round">
      <path d="M40 15l3 9h9l-7 5.5 2.5 9-7.5-5.5-7.5 5.5 2.5-9-7-5.5h9z" fill="currentColor" opacity="0.15" />
      <path d="M40 15l3 9h9l-7 5.5 2.5 9-7.5-5.5-7.5 5.5 2.5-9-7-5.5h9z" />
      <circle cx="25" cy="42" r="0.6" fill="currentColor" />
      <circle cx="56" cy="20" r="0.5" fill="currentColor" />
      <circle cx="20" cy="25" r="0.7" fill="currentColor" />
      <path d="M52 42l0.5 1.2 1.2 0.2-0.9 0.8 0.2 1.2-1-0.6-1.1 0.5 0.3-1.2-0.8-0.9 1.2-0.1z" fill="currentColor" strokeWidth="0" />
      <path d="M28 48l0.4 1 1 0.2-0.7 0.7 0.2 1-0.9-0.5-0.9 0.4 0.2-1-0.7-0.7 1-0.1z" fill="currentColor" strokeWidth="0" />
    </svg>
  ),
  crystal: ({ className }) => (
    <svg viewBox="0 0 80 80" className={className} fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round">
      <path d="M33 20l7-4 7 4v18l-7 8-7-8z" fill="currentColor" opacity="0.08" />
      <path d="M33 20l7-4 7 4v18l-7 8-7-8z" />
      <line x1="40" y1="16" x2="40" y2="42" />
      <line x1="33" y1="20" x2="40" y2="42" />
      <line x1="47" y1="20" x2="40" y2="42" />
      <circle cx="26" cy="30" r="0.6" fill="currentColor" />
      <circle cx="54" cy="26" r="0.5" fill="currentColor" />
      <circle cx="28" cy="44" r="0.7" fill="currentColor" />
    </svg>
  ),
  wave: ({ className }) => (
    <svg viewBox="0 0 80 80" className={className} fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round">
      <path d="M15 30c5-4 10-4 15 0s10 4 15 0 10-4 15 0" />
      <path d="M15 38c5-4 10-4 15 0s10 4 15 0 10-4 15 0" opacity="0.6" />
      <path d="M15 46c5-4 10-4 15 0s10 4 15 0 10-4 15 0" opacity="0.3" />
      <circle cx="20" cy="22" r="0.6" fill="currentColor" />
      <circle cx="58" cy="25" r="0.5" fill="currentColor" />
    </svg>
  ),
  seed: ({ className }) => (
    <svg viewBox="0 0 80 80" className={className} fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round">
      <path d="M40 50c0-12 0-20 0-30" />
      <path d="M40 35c-4 4-10 3-12-2" />
      <path d="M40 28c4 4 10 2 11-3" />
      <ellipse cx="40" cy="55" rx="5" ry="3" fill="currentColor" opacity="0.2" />
      <ellipse cx="40" cy="55" rx="5" ry="3" />
      <circle cx="28" cy="18" r="0.6" fill="currentColor" />
      <circle cx="55" cy="42" r="0.5" fill="currentColor" />
    </svg>
  ),
  feather: ({ className }) => (
    <svg viewBox="0 0 80 80" className={className} fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round">
      <path d="M25 55c8-10 18-22 28-35" />
      <path d="M25 55c2-6 8-14 16-20" />
      <path d="M25 55c6-4 14-8 22-14" />
      <path d="M53 20c-2 4-6 10-12 16" />
      <path d="M53 20c-4 2-10 6-16 12" />
      <circle cx="56" cy="18" r="0.8" fill="currentColor" />
      <circle cx="22" cy="58" r="1" fill="currentColor" />
    </svg>
  ),
  flame: ({ className }) => (
    <svg viewBox="0 0 80 80" className={className} fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round">
      <path d="M40 16c-3 8-10 14-10 24 0 7 4.5 12 10 12s10-5 10-12c0-10-7-16-10-24z" fill="currentColor" opacity="0.08" />
      <path d="M40 16c-3 8-10 14-10 24 0 7 4.5 12 10 12s10-5 10-12c0-10-7-16-10-24z" />
      <path d="M40 30c-1 4-4 6-4 10 0 3 1.8 5 4 5s4-2 4-5c0-4-3-6-4-10z" />
      <circle cx="28" cy="22" r="0.5" fill="currentColor" />
      <circle cx="54" cy="28" r="0.6" fill="currentColor" />
    </svg>
  ),
};

export function CardMotif({ motif, className }: { motif: string; className?: string }) {
  const Motif = motifs[motif] || motifs.star;
  return <Motif className={className} />;
}

/** Hand-drawn style prep category icons matching YOCM illustration guidelines */

interface IconProps {
  className?: string;
  style?: React.CSSProperties;
  size?: number;
}

/** Batch prep — a jar with ingredients */
export function BatchPrepIcon({ className, style, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} fill="none">
      <path d="M8 4h8v2c0 .5-.2 1-.8 1.2L14 7.5V19c0 1-1 2-2 2h0c-1 0-2-1-2-2V7.5l-1.2-.3C8.2 7 8 6.5 8 6V4z" 
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 11h4M10 14h4M10 17h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      <path d="M7.5 4.5h9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="12" cy="9" r="0.5" fill="currentColor" opacity="0.4"/>
    </svg>
  );
}

/** Advance prep — a clock with a knife */
export function AdvancePrepIcon({ className, style, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 3"/>
      <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 17l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
      <path d="M19.5 19.5l1.5-1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );
}

/** Morning prep — sunrise over a pan */
export function MorningPrepIcon({ className, style, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} fill="none">
      <path d="M4 16h16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M7 16c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M12 8V6M8 9.5L6.5 8M16 9.5l1.5-1.5M5 13H3M21 13h-2" 
        stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      <path d="M6 19h12c.5 0 1 .2 1 .5v.5H5v-.5c0-.3.5-.5 1-.5z" 
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** Defrost — a snowflake melting */
export function DefrostIcon({ className, style, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} fill="none">
      <path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M7.8 7.8l8.4 8.4M16.2 7.8L7.8 16.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
      <path d="M12 4l-1.5 2.5h3L12 4z" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round" opacity="0.5"/>
      <path d="M12 20l-1.5-2.5h3L12 20z" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round" opacity="0.5"/>
      <circle cx="15" cy="19" r="1" stroke="currentColor" strokeWidth="0.8" opacity="0.3"/>
      <circle cx="17" cy="20.5" r="0.6" stroke="currentColor" strokeWidth="0.6" opacity="0.2"/>
    </svg>
  );
}

/** Night before — crescent moon */
export function NightPrepIcon({ className, style, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} fill="none">
      <path d="M20 14.5A8 8 0 019.5 4c0-.3 0-.6.1-.9A8 8 0 1020 14.5z" 
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="15" cy="7" r="0.5" fill="currentColor" opacity="0.3"/>
      <circle cx="18" cy="10" r="0.4" fill="currentColor" opacity="0.25"/>
      <circle cx="16.5" cy="5" r="0.3" fill="currentColor" opacity="0.2"/>
    </svg>
  );
}

/** General prep — chopping board with knife */
export function GeneralPrepIcon({ className, style, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} fill="none">
      <rect x="5" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M9 10v4M12 9v6M15 10v4" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.3"/>
      <path d="M3 10l2-1M3 14l2 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );
}

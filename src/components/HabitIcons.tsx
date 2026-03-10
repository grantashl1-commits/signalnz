import React from "react";

const C = "#7f5b87"; // Deep violet matching --primary

interface IconProps {
  size?: number;
  color?: string;
}

// ── Nutrition Icons ──

export function PlantBasketIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 14c0 0 1-6 8-6s8 6 8 6" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M6 14h20l-2 12H8L6 14z" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="11" r="1.5" stroke={color} strokeWidth="1" />
      <circle cx="16" cy="9" r="1.5" stroke={color} strokeWidth="1" />
      <circle cx="20" cy="11" r="1.5" stroke={color} strokeWidth="1" />
      <path d="M16 9V6" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <path d="M16 6c-1-2 1-3 2-2" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

export function FermentedJarIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="8" width="12" height="3" rx="1" stroke={color} strokeWidth="1.3" />
      <path d="M10 11v14c0 1 1 2 2 2h8c1 0 2-1 2-2V11" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="14" cy="17" r="1" stroke={color} strokeWidth="0.8" />
      <circle cx="18" cy="20" r="1" stroke={color} strokeWidth="0.8" />
      <circle cx="15" cy="22" r="0.8" stroke={color} strokeWidth="0.8" />
      <circle cx="17" cy="15" r="0.8" stroke={color} strokeWidth="0.8" />
    </svg>
  );
}

export function FishIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 16c3-5 10-6 16-3-6 3-13 2-16 3z" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 16c3 5 10 6 16 3" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M24 13l4-3v12l-4-3" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="15" r="1" fill={color} />
    </svg>
  );
}

export function SeedIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="11" cy="18" rx="3" ry="5" transform="rotate(-20 11 18)" stroke={color} strokeWidth="1.3" />
      <ellipse cx="21" cy="18" rx="3" ry="5" transform="rotate(20 21 18)" stroke={color} strokeWidth="1.3" />
      <path d="M16 6v8" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <path d="M16 6c-2 1-3 4-3 6" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <path d="M16 6c2 1 3 4 3 6" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function BroccoliIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="13" cy="12" r="4" stroke={color} strokeWidth="1.3" />
      <circle cx="19" cy="12" r="4" stroke={color} strokeWidth="1.3" />
      <circle cx="16" cy="9" r="3.5" stroke={color} strokeWidth="1.3" />
      <path d="M16 16v10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 20c-1 1-2 2-2 3" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <path d="M18 20c1 1 2 2 2 3" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function ProteinPlateIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="16" cy="20" rx="12" ry="5" stroke={color} strokeWidth="1.3" />
      <ellipse cx="13" cy="18" rx="3" ry="2" stroke={color} strokeWidth="1" />
      <ellipse cx="19" cy="18" rx="2.5" ry="2" stroke={color} strokeWidth="1" />
      <path d="M10 13c1-3 4-4 6-4s5 1 6 4" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function NoProcessedIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="12" height="14" rx="1.5" stroke={color} strokeWidth="1.3" />
      <line x1="12" y1="14" x2="20" y2="14" stroke={color} strokeWidth="0.8" />
      <line x1="12" y1="17" x2="18" y2="17" stroke={color} strokeWidth="0.8" />
      <line x1="7" y1="7" x2="25" y2="25" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function WaterGlassIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 6h12l-2 22H12L10 6z" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 14c2 1 4-1 6 0s4 1 5 0" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function LeafIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 24C8 24 8 10 22 8c0 0 2 14-12 16" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M8 24c4-4 8-8 14-14" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <path d="M14 18c-2 0-3 1-4 2" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
      <path d="M16 15c1-2 3-3 4-3" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

export function NoSugarIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="11" y="12" width="10" height="10" rx="1" stroke={color} strokeWidth="1.3" />
      <rect x="13" y="14" width="6" height="6" rx="0.5" stroke={color} strokeWidth="0.8" />
      <line x1="7" y1="7" x2="25" y2="25" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function MealPrepIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="14" width="9" height="10" rx="1.5" stroke={color} strokeWidth="1.3" />
      <rect x="18" y="14" width="9" height="10" rx="1.5" stroke={color} strokeWidth="1.3" />
      <rect x="11" y="8" width="10" height="8" rx="1.5" stroke={color} strokeWidth="1.3" />
      <line x1="7" y1="18" x2="12" y2="18" stroke={color} strokeWidth="0.8" />
      <line x1="20" y1="18" x2="25" y2="18" stroke={color} strokeWidth="0.8" />
    </svg>
  );
}

export function RecipeBookIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 6h16c1 0 2 1 2 2v16c0 1-1 2-2 2H8V6z" stroke={color} strokeWidth="1.3" />
      <line x1="12" y1="6" x2="12" y2="26" stroke={color} strokeWidth="1" />
      <line x1="15" y1="12" x2="21" y2="12" stroke={color} strokeWidth="0.8" />
      <line x1="15" y1="15" x2="20" y2="15" stroke={color} strokeWidth="0.8" />
      <line x1="15" y1="18" x2="19" y2="18" stroke={color} strokeWidth="0.8" />
    </svg>
  );
}

export function AvocadoIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4c-5 0-9 6-9 13 0 5 4 11 9 11s9-6 9-11c0-7-4-13-9-13z" stroke={color} strokeWidth="1.3" />
      <circle cx="16" cy="18" r="4" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}

export function NoAlcoholIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 6h8l-1 10h-6L12 6z" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="16" y1="16" x2="16" y2="24" stroke={color} strokeWidth="1.3" />
      <line x1="12" y1="24" x2="20" y2="24" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="7" y1="7" x2="25" y2="25" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function MindfulPlateIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="16" cy="20" rx="10" ry="4" stroke={color} strokeWidth="1.3" />
      <path d="M13 10c0-2 1-3 3-3s3 1 3 3" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <circle cx="14" cy="13" r="0.8" fill={color} />
      <circle cx="18" cy="13" r="0.8" fill={color} />
      <path d="M14 15c1 1 3 1 4 0" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

// ── Movement Icons ──

export function StepsIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="12" cy="10" rx="2.5" ry="4" transform="rotate(-15 12 10)" stroke={color} strokeWidth="1.3" />
      <ellipse cx="20" cy="16" rx="2.5" ry="4" transform="rotate(15 20 16)" stroke={color} strokeWidth="1.3" />
      <ellipse cx="12" cy="23" rx="2.5" ry="4" transform="rotate(-15 12 23)" stroke={color} strokeWidth="1.3" />
    </svg>
  );
}

export function MorningWalkIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="6" r="2" stroke={color} strokeWidth="1.2" />
      <path d="M16 8v6" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M16 14l-4 8" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M16 14l4 8" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M13 10l-3 4" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M19 10l3 4" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M4 6c2-2 4-2 6 0" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
      <line x1="7" y1="3" x2="7" y2="1" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
      <line x1="4" y1="4" x2="3" y2="3" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
      <line x1="10" y1="4" x2="11" y2="3" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

export function DumbbellIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="12" width="4" height="8" rx="1" stroke={color} strokeWidth="1.3" />
      <rect x="23" y="12" width="4" height="8" rx="1" stroke={color} strokeWidth="1.3" />
      <line x1="9" y1="16" x2="23" y2="16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3" y1="14" x2="5" y2="14" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <line x1="3" y1="18" x2="5" y2="18" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <line x1="27" y1="14" x2="29" y2="14" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <line x1="27" y1="18" x2="29" y2="18" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function HIITIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4l2 8h-4l2 8h-4l3 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 12l-2 4" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <path d="M22 12l2 4" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function YogaPoseIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="6" r="2.5" stroke={color} strokeWidth="1.2" />
      <path d="M16 8.5v8" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M16 16.5l-5 7" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M16 16.5l5 7" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M10 12l6 1 6-1" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function StretchIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="7" r="2.5" stroke={color} strokeWidth="1.2" />
      <path d="M16 9.5v6" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M16 15.5l-6 8" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M16 15.5l6 3" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M10 11l6 2" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M22 9l-6 4" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function SwimIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="12" r="2" stroke={color} strokeWidth="1.2" />
      <path d="M12 14l6-2 4 2" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M10 14l-2 3" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M4 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0 4 2 6 0" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M4 24c2-2 4-2 6 0s4 2 6 0 4-2 6 0 4 2 6 0" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function CycleIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="22" r="5" stroke={color} strokeWidth="1.3" />
      <circle cx="22" cy="22" r="5" stroke={color} strokeWidth="1.3" />
      <path d="M15 22l5-12h4" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 10h8" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function DanceIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="6" r="2.5" stroke={color} strokeWidth="1.2" />
      <path d="M16 8.5v6" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M16 14.5l-5 9" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M16 14.5l4 8" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M10 10l6 3" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M22 8l-6 5" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M8 9l-1-2" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
      <path d="M24 7l1-2" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

export function RestDayIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 18c0-5 4-9 9-9 1 0 1.5 0 2 .2-3 1-5 4-5 7.5 0 3.5 2 6.5 5 7.5-.5.2-1.3.3-2 .3-5 0-9-3-9-6.5z" stroke={color} strokeWidth="1.3" />
      <path d="M22 8l1-2" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
      <path d="M25 11l2-1" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
      <path d="M26 15h2" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

export function ClockBreakIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="10" stroke={color} strokeWidth="1.3" />
      <line x1="16" y1="16" x2="16" y2="10" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="16" y1="16" x2="21" y2="16" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="16" cy="16" r="1" fill={color} />
    </svg>
  );
}

export function LunchWalkIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="5" r="2" stroke={color} strokeWidth="1.2" />
      <path d="M16 7v6" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M16 13l-3 8" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M16 13l3 8" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M13 9l-3 3" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M19 9l3 3" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <path d="M5 26h22" stroke={color} strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2" />
    </svg>
  );
}

export function TwoStrengthIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="3" height="6" rx="0.8" stroke={color} strokeWidth="1.2" />
      <rect x="25" y="8" width="3" height="6" rx="0.8" stroke={color} strokeWidth="1.2" />
      <line x1="7" y1="11" x2="25" y2="11" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <rect x="4" y="20" width="3" height="6" rx="0.8" stroke={color} strokeWidth="1.2" />
      <rect x="25" y="20" width="3" height="6" rx="0.8" stroke={color} strokeWidth="1.2" />
      <line x1="7" y1="23" x2="25" y2="23" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function HeartPulseIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 26s-10-6-10-13c0-4 3-7 6-7 2 0 3 1 4 3 1-2 2-3 4-3 3 0 6 3 6 7 0 7-10 13-10 13z" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 16h4l2-4 2 8 2-4h4" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Supplement Icons ──

export function CapsuleIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="6" width="8" height="20" rx="4" stroke={color} strokeWidth="1.3" />
      <line x1="12" y1="16" x2="20" y2="16" stroke={color} strokeWidth="1" />
    </svg>
  );
}

export function SunVitaminIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="5" stroke={color} strokeWidth="1.3" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
        <line
          key={angle}
          x1={16 + 7 * Math.cos((angle * Math.PI) / 180)}
          y1={16 + 7 * Math.sin((angle * Math.PI) / 180)}
          x2={16 + 10 * Math.cos((angle * Math.PI) / 180)}
          y2={16 + 10 * Math.sin((angle * Math.PI) / 180)}
          stroke={color}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

export function DropletIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4c-6 8-9 12-9 17 0 4 4 7 9 7s9-3 9-7c0-5-3-9-9-17z" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PillBottleIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="4" width="12" height="4" rx="1" stroke={color} strokeWidth="1.3" />
      <rect x="9" y="8" width="14" height="18" rx="2" stroke={color} strokeWidth="1.3" />
      <line x1="16" y1="14" x2="16" y2="20" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="13" y1="17" x2="19" y2="17" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function PowderScoopIcon({ size = 28, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 22c0-5 4-10 8-10s8 5 8 10" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <line x1="6" y1="22" x2="26" y2="22" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M20 12l6-6" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="12" cy="18" r="1" stroke={color} strokeWidth="0.8" />
      <circle cx="16" cy="16" r="1" stroke={color} strokeWidth="0.8" />
      <circle cx="20" cy="18" r="1" stroke={color} strokeWidth="0.8" />
    </svg>
  );
}

// ── Icon Registry ──

export const HABIT_ICONS: Record<string, React.FC<IconProps>> = {
  // Nutrition
  plantBasket: PlantBasketIcon,
  fermentedJar: FermentedJarIcon,
  fish: FishIcon,
  seed: SeedIcon,
  broccoli: BroccoliIcon,
  proteinPlate: ProteinPlateIcon,
  noProcessed: NoProcessedIcon,
  waterGlass: WaterGlassIcon,
  leaf: LeafIcon,
  noSugar: NoSugarIcon,
  mealPrep: MealPrepIcon,
  recipeBook: RecipeBookIcon,
  avocado: AvocadoIcon,
  noAlcohol: NoAlcoholIcon,
  mindfulPlate: MindfulPlateIcon,
  // Movement
  steps: StepsIcon,
  morningWalk: MorningWalkIcon,
  dumbbell: DumbbellIcon,
  hiit: HIITIcon,
  yogaPose: YogaPoseIcon,
  stretch: StretchIcon,
  swim: SwimIcon,
  cycle: CycleIcon,
  dance: DanceIcon,
  restDay: RestDayIcon,
  clockBreak: ClockBreakIcon,
  lunchWalk: LunchWalkIcon,
  twoStrength: TwoStrengthIcon,
  heartPulse: HeartPulseIcon,
  // Supplements
  capsule: CapsuleIcon,
  sunVitamin: SunVitaminIcon,
  droplet: DropletIcon,
  pillBottle: PillBottleIcon,
  powderScoop: PowderScoopIcon,
};

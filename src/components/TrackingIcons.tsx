// Hand-drawn SVG icons for tracking tiles

const C = "#8B6F5E"; // sketch color

export function ScaleIcon({ size = 24, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M12 20V6" /><path d="M6 10l6-4 6 4" /><rect x={4} y={18} width={16} height={2} rx={1} />
      <circle cx={12} cy={6} r={1.5} />
    </svg>
  );
}

export function MoodFaceIcon({ size = 24, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <circle cx={12} cy={12} r={9} /><circle cx={9} cy={10} r={0.8} fill={color} /><circle cx={15} cy={10} r={0.8} fill={color} />
      <path d="M9 15q3 2 6 0" />
    </svg>
  );
}

export function SpiralSymptomIcon({ size = 24, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M12 12c0-2 2-4 4-4s4 2 4 4-2 4-4 4c-3 0-6-2-6-6s3-8 8-8" />
      <path d="M8 16l-2 2" strokeDasharray="2 2" />
    </svg>
  );
}

export function QuillIcon({ size = 24, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M20 4c-4 2-8 8-10 14" /><path d="M20 4c-2 4-6 6-10 6" /><path d="M10 18l-4 2 1-4" />
    </svg>
  );
}

// ─── Mood Icons (single-stroke minimalist faces) ────────────
export function RadiantIcon({ size = 32, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <circle cx={16} cy={16} r={10} /><circle cx={12} cy={14} r={1} fill={color} /><circle cx={20} cy={14} r={1} fill={color} />
      <path d="M11 19q5 4 10 0" />{[0,45,90,135,180,225,270,315].map(a=><line key={a} x1={16+14*Math.cos(a*Math.PI/180)} y1={16+14*Math.sin(a*Math.PI/180)} x2={16+12*Math.cos(a*Math.PI/180)} y2={16+12*Math.sin(a*Math.PI/180)} />)}
    </svg>
  );
}

export function CalmIcon({ size = 32, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <circle cx={16} cy={16} r={10} /><path d="M11 14h3" /><path d="M18 14h3" /><path d="M12 19q4 2 8 0" />
    </svg>
  );
}

export function ContentIcon({ size = 32, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <circle cx={16} cy={16} r={10} /><circle cx={12} cy={14} r={0.8} fill={color} /><circle cx={20} cy={14} r={0.8} fill={color} />
      <path d="M12 19h8" />
    </svg>
  );
}

export function GratefulIcon({ size = 32, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <circle cx={16} cy={16} r={10} /><path d="M10 13q2-2 4 0" /><path d="M18 13q2-2 4 0" /><path d="M11 19q5 3 10 0" />
    </svg>
  );
}

export function TiredIcon({ size = 32, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <circle cx={16} cy={16} r={10} /><path d="M10 15h4" /><path d="M18 15h4" /><path d="M12 20q4 1 8 0" />
    </svg>
  );
}

export function AnxiousIcon({ size = 32, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <circle cx={16} cy={16} r={10} /><circle cx={12} cy={14} r={1.2} /><circle cx={20} cy={14} r={1.2} />
      <ellipse cx={16} cy={20} rx={2.5} ry={1.5} />
    </svg>
  );
}

export function IrritableIcon({ size = 32, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <circle cx={16} cy={16} r={10} /><path d="M10 13l4 1" /><path d="M22 13l-4 1" /><path d="M12 20q4-2 8 0" />
    </svg>
  );
}

export function SadIcon({ size = 32, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <circle cx={16} cy={16} r={10} /><circle cx={12} cy={14} r={0.8} fill={color} /><circle cx={20} cy={14} r={0.8} fill={color} />
      <path d="M12 21q4-3 8 0" />
    </svg>
  );
}

export function OverwhelmedIcon({ size = 32, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <circle cx={16} cy={16} r={10} /><circle cx={12} cy={14} r={1.5} /><circle cx={20} cy={14} r={1.5} />
      <path d="M13 20h6" /><path d="M14 8l-1-2" /><path d="M18 8l1-2" />
    </svg>
  );
}

export function FoggyIcon({ size = 32, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <circle cx={16} cy={16} r={10} /><path d="M10 14h4" strokeDasharray="1.5 1.5" /><path d="M18 14h4" strokeDasharray="1.5 1.5" />
      <path d="M13 20h6" strokeDasharray="2 2" />
    </svg>
  );
}

export function SensitiveIcon({ size = 32, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <circle cx={16} cy={16} r={10} /><circle cx={12} cy={14} r={0.8} fill={color} /><circle cx={20} cy={14} r={0.8} fill={color} />
      <path d="M12 19q4 2 8 0" /><path d="M21 12l1-2" />
    </svg>
  );
}

export function EnergisedIcon({ size = 32, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <circle cx={16} cy={16} r={10} /><circle cx={12} cy={13} r={1} fill={color} /><circle cx={20} cy={13} r={1} fill={color} />
      <path d="M10 18q6 5 12 0" />{[30,60,120,150].map(a=><line key={a} x1={16+13*Math.cos(a*Math.PI/180)} y1={16+13*Math.sin(a*Math.PI/180)} x2={16+11.5*Math.cos(a*Math.PI/180)} y2={16+11.5*Math.sin(a*Math.PI/180)} />)}
    </svg>
  );
}

// ─── Symptom Icons ──────────────────────────────────────────
export function CrampsIcon({ size = 28, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth={1.2} strokeLinecap="round">
      <path d="M14 4l-2 8 4-3-2 10" /><path d="M10 22l-1 2" /><path d="M18 22l1 2" />
    </svg>
  );
}

export function BloatingIcon({ size = 28, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M6 18q4-12 16-2" /><path d="M6 18q8 6 16-2" />
    </svg>
  );
}

export function HeadacheIcon({ size = 28, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M8 18a8 8 0 0 1 12-7" />{[200,230,260].map(a=><line key={a} x1={14+10*Math.cos(a*Math.PI/180)} y1={14+10*Math.sin(a*Math.PI/180)} x2={14+13*Math.cos(a*Math.PI/180)} y2={14+13*Math.sin(a*Math.PI/180)} />)}
    </svg>
  );
}

export function FatigueIcon({ size = 28, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M8 16q2-4 6-2" /><path d="M16 16q2-4 6-2" /><path d="M10 12l-2-1" /><path d="M20 12l2-1" />
    </svg>
  );
}

export function TenderIcon({ size = 28, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <circle cx={14} cy={14} r={4} />{[0,60,120,180,240,300].map(a=><line key={a} x1={14+6*Math.cos(a*Math.PI/180)} y1={14+6*Math.sin(a*Math.PI/180)} x2={14+8*Math.cos(a*Math.PI/180)} y2={14+8*Math.sin(a*Math.PI/180)} />)}
    </svg>
  );
}

export function BackPainIcon({ size = 28, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth={1.2} strokeLinecap="round">
      <path d="M14 4q-2 6 0 12q2 6 0 10" />
    </svg>
  );
}

export function MoodSwingsIcon({ size = 28, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M4 14q3-6 6 0q3 6 6 0q3-6 6 0" />
    </svg>
  );
}

export function CravingsIcon({ size = 28, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M8 20q4-2 12 0" /><path d="M7 20v4h14v-4" /><path d="M12 16q0-3 2-5" /><path d="M16 17q0-4 2-6" />
    </svg>
  );
}

export function SpottingIcon({ size = 28, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M14 6q-4 6-4 10a4 4 0 0 0 8 0q0-4-4-10z" />
    </svg>
  );
}

export function InsomniaIcon({ size = 28, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M18 6a8 8 0 1 0 0 16 6 6 0 0 1 0-16z" /><path d="M20 12h-4" strokeDasharray="2 2" />
    </svg>
  );
}

export function BrainFogIcon({ size = 28, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M6 18q4-10 16-4" /><path d="M6 18q6 4 16-4" /><circle cx={12} cy={14} r={0.8} fill={color} /><circle cx={16} cy={12} r={0.8} fill={color} /><circle cx={20} cy={14} r={0.8} fill={color} />
    </svg>
  );
}

export function AcneIcon({ size = 28, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <circle cx={10} cy={12} r={2} /><circle cx={16} cy={10} r={1.5} /><circle cx={18} cy={16} r={2.5} /><circle cx={12} cy={18} r={1.5} />
    </svg>
  );
}

export function NauseaIcon({ size = 28, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M4 14q3-4 6 0q3 4 6 0q3-4 6 0" /><path d="M4 18q3-4 6 0q3 4 6 0q3-4 6 0" />
    </svg>
  );
}

export function LowLibidoIcon({ size = 28, color = C }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M14 10l-2 4h4l-2 4" strokeDasharray="2 2" opacity={0.5} />
      <circle cx={14} cy={14} r={8} strokeDasharray="3 3" />
    </svg>
  );
}

// ─── Mood icon map ──────────────────────────────────────────
export const MOOD_ICONS: Record<string, React.FC<{ size?: number; color?: string }>> = {
  radiant: RadiantIcon,
  calm: CalmIcon,
  content: ContentIcon,
  grateful: GratefulIcon,
  tired: TiredIcon,
  anxious: AnxiousIcon,
  irritable: IrritableIcon,
  sad: SadIcon,
  overwhelmed: OverwhelmedIcon,
  foggy: FoggyIcon,
  sensitive: SensitiveIcon,
  energised: EnergisedIcon,
};

export const SYMPTOM_ICONS: Record<string, React.FC<{ size?: number; color?: string }>> = {
  cramps: CrampsIcon,
  bloating: BloatingIcon,
  headache: HeadacheIcon,
  fatigue: FatigueIcon,
  tender: TenderIcon,
  "back pain": BackPainIcon,
  "mood swings": MoodSwingsIcon,
  cravings: CravingsIcon,
  spotting: SpottingIcon,
  insomnia: InsomniaIcon,
  "brain fog": BrainFogIcon,
  acne: AcneIcon,
  nausea: NauseaIcon,
  "low libido": LowLibidoIcon,
};

export const MOODS = [
  "radiant", "calm", "content", "grateful",
  "tired", "anxious", "irritable", "sad",
  "overwhelmed", "foggy", "sensitive", "energised",
];

export const SYMPTOM_LIST = [
  "cramps", "bloating", "headache", "fatigue",
  "tender", "back pain", "mood swings", "cravings",
  "spotting", "insomnia", "brain fog", "acne",
  "nausea", "low libido",
];

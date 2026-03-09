const C = "#8B6F5E";

interface IconProps {
  size?: number;
  color?: string;
}

// Open palm with radiating lines — category icon
export function SelfCareHandIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M16 28 C16 28 10 22 10 16 L10 8 C10 7 11 6 12 7 L12 14" />
      <path d="M12 14 L12 6 C12 5 13 4 14 5 L14 14" />
      <path d="M14 14 L14 5 C14 4 15 3 16 4 L16 14" />
      <path d="M16 14 L16 6 C16 5 17 4 18 5 L18 14" />
      <path d="M18 14 C18 14 20 12 21 13 C22 14 20 16 20 16" />
      {/* Radiating lines */}
      <path d="M8 10 L6 8" opacity={0.5} />
      <path d="M7 14 L4 14" opacity={0.5} />
      <path d="M24 10 L26 8" opacity={0.5} />
      <path d="M25 14 L28 14" opacity={0.5} />
      <path d="M16 2 L16 0" opacity={0.5} />
    </svg>
  );
}

// Ritual-specific icons
export function RedLightMaskIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <ellipse cx={16} cy={15} rx={9} ry={11} />
      <circle cx={12} cy={13} r={2} />
      <circle cx={20} cy={13} r={2} />
      <path d="M13 19 Q16 21 19 19" />
      <path d="M8 8 L6 5" opacity={0.4} />
      <path d="M24 8 L26 5" opacity={0.4} />
      <path d="M16 4 L16 2" opacity={0.4} />
    </svg>
  );
}

export function PemfMatIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <rect x={4} y={12} width={24} height={10} rx={2} />
      <path d="M8 16 Q12 12 16 16 Q20 20 24 16" opacity={0.6} />
      <path d="M8 20 Q12 16 16 20 Q20 24 24 20" opacity={0.4} />
    </svg>
  );
}

export function OzoneSaunaIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M8 26 Q8 10 16 8 Q24 10 24 26" />
      <path d="M12 6 Q12 3 14 2" opacity={0.5} />
      <path d="M16 5 Q16 2 18 1" opacity={0.5} />
      <path d="M20 6 Q20 3 22 2" opacity={0.5} />
    </svg>
  );
}

export function InfraredSaunaIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <rect x={6} y={10} width={20} height={18} rx={2} />
      <path d="M10 10 L10 6 L22 6 L22 10" />
      <path d="M12 4 Q12 1 14 0" opacity={0.5} />
      <path d="M16 4 Q16 1 18 0" opacity={0.5} />
      <path d="M20 4 Q20 1 22 0" opacity={0.5} />
    </svg>
  );
}

export function RedLightPanelIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <rect x={8} y={4} width={16} height={24} rx={2} />
      {[8, 12, 16, 20, 24].map(y => [12, 16, 20].map(x => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={1} opacity={0.5} />
      )))}
    </svg>
  );
}

export function IcePlungeIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M6 12 L6 26 Q6 28 8 28 L24 28 Q26 28 26 26 L26 12" />
      <path d="M4 12 L28 12" />
      <path d="M12 18 L10 16 L12 14" opacity={0.5} />
      <path d="M18 16 L20 18 L22 16" opacity={0.5} />
      <path d="M15 20 L14 18 L16 17" opacity={0.5} />
    </svg>
  );
}

export function ColdShowerIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <circle cx={16} cy={6} r={4} />
      <path d="M12 12 L12 28" opacity={0.3} />
      <path d="M14 10 L14 26" opacity={0.4} />
      <path d="M16 10 L16 28" opacity={0.5} />
      <path d="M18 10 L18 26" opacity={0.4} />
      <path d="M20 12 L20 28" opacity={0.3} />
    </svg>
  );
}

export function MassageGunIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M8 14 L20 14 Q22 14 22 12 L22 8 Q22 6 24 6 L26 6" />
      <path d="M8 14 L8 22 Q8 24 10 24 L12 24 Q14 24 14 22 L14 14" />
      <circle cx={27} cy={6} r={1.5} opacity={0.5} />
      <path d="M28 4 L30 2" opacity={0.3} />
      <path d="M29 6 L31 6" opacity={0.3} />
    </svg>
  );
}

export function FoamRollerIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <ellipse cx={16} cy={16} rx={12} ry={5} />
      <path d="M4 16 L4 18 Q4 22 16 22 Q28 22 28 18 L28 16" opacity={0.4} />
      <path d="M10 13 L10 19" opacity={0.3} />
      <path d="M16 12 L16 20" opacity={0.3} />
      <path d="M22 13 L22 19" opacity={0.3} />
    </svg>
  );
}

export function LymphaticDrainageIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M16 4 Q14 8 14 12 Q14 16 16 20 Q18 24 16 28" />
      <path d="M12 6 Q10 10 12 14" opacity={0.5} />
      <path d="M20 6 Q22 10 20 14" opacity={0.5} />
      <path d="M10 16 Q12 20 14 22" opacity={0.4} />
      <path d="M22 16 Q20 20 18 22" opacity={0.4} />
    </svg>
  );
}

export function ProfessionalMassageIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M8 20 Q12 14 16 14 Q20 14 24 20" />
      <path d="M10 18 Q12 16 14 16" />
      <path d="M22 18 Q20 16 18 16" />
      <path d="M6 22 Q8 18 10 18" opacity={0.6} />
      <path d="M26 22 Q24 18 22 18" opacity={0.6} />
    </svg>
  );
}

export function GuaShaIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M12 6 Q8 12 10 20 Q12 26 18 28 Q24 26 22 18 Q20 10 16 6 Z" />
      <path d="M14 12 Q16 14 18 12" opacity={0.4} />
      <path d="M13 18 Q16 20 19 18" opacity={0.4} />
    </svg>
  );
}

export function DryBrushingIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <circle cx={16} cy={14} r={8} />
      <path d="M16 22 L16 30" />
      <path d="M12 10 Q16 8 20 10" opacity={0.4} />
      <path d="M10 14 Q16 12 22 14" opacity={0.4} />
      <path d="M12 18 Q16 16 20 18" opacity={0.4} />
    </svg>
  );
}

export function EpsomBathIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M4 16 L28 16" />
      <path d="M6 16 L6 24 Q6 28 10 28 L22 28 Q26 28 26 24 L26 16" />
      <circle cx={12} cy={20} r={1} opacity={0.4} />
      <circle cx={18} cy={22} r={1} opacity={0.4} />
      <circle cx={15} cy={18} r={0.8} opacity={0.3} />
      <circle cx={21} cy={19} r={0.8} opacity={0.3} />
    </svg>
  );
}

export function MagnesiumBathIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M4 16 L28 16" />
      <path d="M6 16 L6 24 Q6 28 10 28 L22 28 Q26 28 26 24 L26 16" />
      <path d="M11 20 L13 18 L11 22" opacity={0.4} />
      <path d="M17 19 L19 17 L17 21" opacity={0.4} />
      <path d="M22 20 L24 18" opacity={0.3} />
    </svg>
  );
}

export function CastorOilPackIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <ellipse cx={16} cy={18} rx={8} ry={6} />
      <rect x={10} y={14} width={12} height={8} rx={2} opacity={0.4} />
      <path d="M14 12 L14 10" opacity={0.3} />
      <path d="M18 12 L18 10" opacity={0.3} />
    </svg>
  );
}

export function FaceMaskIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <ellipse cx={16} cy={15} rx={9} ry={11} />
      <path d="M10 12 Q12 10 14 12" opacity={0.5} />
      <path d="M18 12 Q20 10 22 12" opacity={0.5} />
      <path d="M12 18 Q16 22 20 18" opacity={0.4} />
    </svg>
  );
}

export function FacialMassageIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <ellipse cx={16} cy={16} rx={8} ry={10} />
      <path d="M10 14 Q12 10 16 10 Q20 10 22 14" opacity={0.4} />
      <path d="M10 18 Q12 16 14 18" opacity={0.3} />
      <path d="M18 18 Q20 16 22 18" opacity={0.3} />
      <path d="M12 22 Q16 24 20 22" opacity={0.3} />
    </svg>
  );
}

export function ScalpMassageIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M8 20 Q8 8 16 6 Q24 8 24 20" />
      <circle cx={12} cy={12} r={1} opacity={0.5} />
      <circle cx={16} cy={10} r={1} opacity={0.5} />
      <circle cx={20} cy={12} r={1} opacity={0.5} />
      <path d="M10 14 L8 12" opacity={0.3} />
      <path d="M22 14 L24 12" opacity={0.3} />
      <path d="M16 8 L16 6" opacity={0.3} />
    </svg>
  );
}

export function YinYogaIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <circle cx={16} cy={8} r={3} />
      <path d="M16 11 L16 18" />
      <path d="M16 18 Q10 22 8 26" />
      <path d="M16 18 Q22 22 24 26" />
      <path d="M12 14 L20 14" opacity={0.5} />
    </svg>
  );
}

export function StretchingIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <circle cx={14} cy={6} r={3} />
      <path d="M14 9 L14 18" />
      <path d="M14 18 L8 26" />
      <path d="M14 18 L22 26" />
      <path d="M10 13 L14 12 L22 8" />
    </svg>
  );
}

export function SpaDayIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M16 16 Q12 10 8 14 Q4 18 8 22 Q12 26 16 22" />
      <path d="M16 16 Q20 10 24 14 Q28 18 24 22 Q20 26 16 22" />
      <path d="M16 16 Q14 8 16 4 Q18 8 16 16" />
    </svg>
  );
}

export function FloatTankIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <ellipse cx={16} cy={18} rx={12} ry={6} />
      <path d="M4 18 Q4 12 10 10 Q16 8 22 10 Q28 12 28 18" />
      <path d="M12 16 L12 14" opacity={0.3} />
      <path d="M16 15 L16 13" opacity={0.3} />
      <path d="M20 16 L20 14" opacity={0.3} />
    </svg>
  );
}

export function AcupunctureIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <circle cx={16} cy={6} r={3} />
      <path d="M16 9 L16 26" />
      <path d="M12 14 L20 14" opacity={0.4} />
      <path d="M10 12 L10 10" strokeWidth={0.8} />
      <path d="M22 12 L22 10" strokeWidth={0.8} />
      <path d="M14 20 L14 18" strokeWidth={0.8} />
    </svg>
  );
}

export function SoundBathIcon({ size = 32, color = C }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
      <path d="M8 22 Q8 16 16 16 Q24 16 24 22" />
      <path d="M6 22 L26 22" />
      <path d="M12 14 Q16 10 20 14" opacity={0.4} />
      <path d="M10 12 Q16 6 22 12" opacity={0.3} />
      <path d="M8 10 Q16 2 24 10" opacity={0.2} />
    </svg>
  );
}

// Icon lookup map
export const RITUAL_ICONS: Record<string, React.FC<IconProps>> = {
  redLightMask: RedLightMaskIcon,
  pemfMat: PemfMatIcon,
  ozoneSauna: OzoneSaunaIcon,
  infraredSauna: InfraredSaunaIcon,
  redLightPanel: RedLightPanelIcon,
  icePlunge: IcePlungeIcon,
  coldShower: ColdShowerIcon,
  massageGun: MassageGunIcon,
  foamRoller: FoamRollerIcon,
  lymphaticDrainage: LymphaticDrainageIcon,
  professionalMassage: ProfessionalMassageIcon,
  guaSha: GuaShaIcon,
  dryBrushing: DryBrushingIcon,
  epsomBath: EpsomBathIcon,
  magnesiumBath: MagnesiumBathIcon,
  castorOilPack: CastorOilPackIcon,
  faceMask: FaceMaskIcon,
  facialMassage: FacialMassageIcon,
  scalpMassage: ScalpMassageIcon,
  yinYoga: YinYogaIcon,
  stretching: StretchingIcon,
  spaDay: SpaDayIcon,
  floatTank: FloatTankIcon,
  acupuncture: AcupunctureIcon,
  soundBath: SoundBathIcon,
  selfCareHand: SelfCareHandIcon,
};

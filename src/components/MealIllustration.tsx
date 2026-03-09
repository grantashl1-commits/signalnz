import { Phase } from "@/lib/cycle-utils";

const MEAL_GRADIENTS: Record<string, [string, string]> = {
  breakfast: ["hsl(20, 70%, 92%)", "hsl(40, 60%, 96%)"],
  "morning snack": ["hsl(270, 30%, 93%)", "hsl(40, 60%, 96%)"],
  lunch: ["hsl(130, 25%, 90%)", "hsl(40, 60%, 96%)"],
  "afternoon snack": ["hsl(270, 30%, 93%)", "hsl(40, 60%, 96%)"],
  dinner: ["hsl(140, 20%, 82%)", "hsl(130, 18%, 90%)"],
};

const STROKE = "#8B6F5E";

function OatsIllustration() {
  return (
    <g>
      {/* Bowl */}
      <ellipse cx="150" cy="120" rx="60" ry="20" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path d="M90 120 Q90 160 150 165 Q210 160 210 120" fill="none" stroke={STROKE} strokeWidth="1.2" />
      {/* Grain sprigs */}
      <path d="M120 100 Q115 80 120 65" fill="none" stroke={STROKE} strokeWidth="0.8" />
      <path d="M117 75 L120 65 L123 75" fill="none" stroke={STROKE} strokeWidth="0.8" />
      <path d="M115 82 L120 72 L125 82" fill="none" stroke={STROKE} strokeWidth="0.8" />
      {/* Blueberries */}
      <circle cx="170" cy="105" r="5" fill="none" stroke={STROKE} strokeWidth="0.8" />
      <circle cx="180" cy="110" r="4.5" fill="none" stroke={STROKE} strokeWidth="0.8" />
      <circle cx="175" cy="115" r="4" fill="none" stroke={STROKE} strokeWidth="0.8" />
    </g>
  );
}

function LentilBowlIllustration() {
  return (
    <g>
      {/* Bowl */}
      <ellipse cx="150" cy="115" rx="55" ry="18" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path d="M95 115 Q95 155 150 160 Q205 155 205 115" fill="none" stroke={STROKE} strokeWidth="1.2" />
      {/* Capsicum half */}
      <path d="M175 85 Q190 85 190 100 Q190 115 175 115 Q168 100 175 85Z" fill="none" stroke={STROKE} strokeWidth="0.8" />
      <line x1="178" y1="90" x2="178" y2="110" stroke={STROKE} strokeWidth="0.5" />
      {/* Leaf sprig */}
      <path d="M115 95 Q105 80 115 65" fill="none" stroke={STROKE} strokeWidth="0.8" />
      <path d="M115 80 Q108 76 105 80" fill="none" stroke={STROKE} strokeWidth="0.8" />
      <path d="M115 72 Q110 68 107 72" fill="none" stroke={STROKE} strokeWidth="0.8" />
    </g>
  );
}

function MisoIllustration() {
  return (
    <g>
      {/* Rectangular bowl */}
      <rect x="100" y="90" width="100" height="60" rx="8" fill="none" stroke={STROKE} strokeWidth="1.2" />
      {/* Tofu blocks */}
      <rect x="115" y="105" width="18" height="14" rx="2" fill="none" stroke={STROKE} strokeWidth="0.8" />
      <rect x="140" y="108" width="16" height="12" rx="2" fill="none" stroke={STROKE} strokeWidth="0.8" />
      {/* Chopsticks */}
      <line x1="185" y1="75" x2="155" y2="135" stroke={STROKE} strokeWidth="0.8" />
      <line x1="192" y1="78" x2="162" y2="138" stroke={STROKE} strokeWidth="0.8" />
      {/* Nori rectangle */}
      <rect x="170" y="105" width="15" height="20" rx="1" fill="none" stroke={STROKE} strokeWidth="0.6" />
    </g>
  );
}

function NiceCreamIllustration() {
  return (
    <g>
      {/* Banana curve */}
      <path d="M100 100 Q115 70 140 75 Q160 78 165 95" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path d="M100 100 Q115 80 140 82 Q160 84 165 95" fill="none" stroke={STROKE} strokeWidth="0.6" />
      {/* Cacao pod */}
      <ellipse cx="185" cy="100" rx="15" ry="22" fill="none" stroke={STROKE} strokeWidth="0.8" transform="rotate(-20 185 100)" />
      <line x1="185" y1="80" x2="185" y2="120" stroke={STROKE} strokeWidth="0.5" />
      {/* Scoop */}
      <circle cx="145" cy="125" r="18" fill="none" stroke={STROKE} strokeWidth="1" />
    </g>
  );
}

function SushiIllustration() {
  return (
    <g>
      {/* Roll slices */}
      <circle cx="125" cy="110" r="14" fill="none" stroke={STROKE} strokeWidth="1" />
      <circle cx="125" cy="110" r="8" fill="none" stroke={STROKE} strokeWidth="0.5" />
      <circle cx="155" cy="105" r="14" fill="none" stroke={STROKE} strokeWidth="1" />
      <circle cx="155" cy="105" r="8" fill="none" stroke={STROKE} strokeWidth="0.5" />
      {/* Avocado half */}
      <ellipse cx="185" cy="110" rx="12" ry="18" fill="none" stroke={STROKE} strokeWidth="0.8" />
      <ellipse cx="185" cy="112" rx="5" ry="8" fill="none" stroke={STROKE} strokeWidth="0.5" />
      {/* Seed dots */}
      <circle cx="130" cy="135" r="1.5" fill={STROKE} />
      <circle cx="140" cy="138" r="1.5" fill={STROKE} />
      <circle cx="150" cy="134" r="1.5" fill={STROKE} />
    </g>
  );
}

function CurryIllustration() {
  return (
    <g>
      {/* Bowl */}
      <ellipse cx="150" cy="115" rx="55" ry="18" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path d="M95 115 Q95 155 150 160 Q205 155 205 115" fill="none" stroke={STROKE} strokeWidth="1.2" />
      {/* Steam lines */}
      <path d="M130 100 Q128 88 132 78" fill="none" stroke={STROKE} strokeWidth="0.6" opacity="0.6" />
      <path d="M150 95 Q148 83 152 73" fill="none" stroke={STROKE} strokeWidth="0.6" opacity="0.6" />
      <path d="M170 100 Q168 88 172 78" fill="none" stroke={STROKE} strokeWidth="0.6" opacity="0.6" />
      {/* Leaf cluster */}
      <path d="M185 90 Q195 80 190 70" fill="none" stroke={STROKE} strokeWidth="0.8" />
      <path d="M190 80 Q198 78 195 72" fill="none" stroke={STROKE} strokeWidth="0.6" />
      <path d="M188 85 Q196 82 193 76" fill="none" stroke={STROKE} strokeWidth="0.6" />
    </g>
  );
}

function SoupIllustration() {
  return (
    <g>
      {/* Bowl */}
      <ellipse cx="150" cy="115" rx="55" ry="18" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path d="M95 115 Q95 155 150 160 Q205 155 205 115" fill="none" stroke={STROKE} strokeWidth="1.2" />
      {/* Steam */}
      <path d="M135 98 Q130 85 138 72" fill="none" stroke={STROKE} strokeWidth="0.6" opacity="0.5" />
      <path d="M155 95 Q150 82 158 68" fill="none" stroke={STROKE} strokeWidth="0.6" opacity="0.5" />
      {/* Root vegetable cross-sections */}
      <circle cx="130" cy="108" r="6" fill="none" stroke={STROKE} strokeWidth="0.6" />
      <circle cx="130" cy="108" r="3" fill="none" stroke={STROKE} strokeWidth="0.4" />
      <circle cx="165" cy="110" r="5" fill="none" stroke={STROKE} strokeWidth="0.6" />
    </g>
  );
}

function StirFryIllustration() {
  return (
    <g>
      {/* Wok shape */}
      <path d="M90 100 Q90 150 150 155 Q210 150 210 100" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <line x1="85" y1="100" x2="215" y2="100" stroke={STROKE} strokeWidth="0.8" />
      {/* Handle */}
      <line x1="210" y1="100" x2="235" y2="85" stroke={STROKE} strokeWidth="1" />
      {/* Diagonal vegetable sketches */}
      <line x1="120" y1="105" x2="135" y2="125" stroke={STROKE} strokeWidth="0.8" />
      <line x1="145" y1="102" x2="155" y2="130" stroke={STROKE} strokeWidth="0.8" />
      <path d="M165 108 Q170 115 168 128" fill="none" stroke={STROKE} strokeWidth="0.8" />
      <line x1="185" y1="105" x2="178" y2="120" stroke={STROKE} strokeWidth="0.8" />
    </g>
  );
}

function SmoothieBowlIllustration() {
  return (
    <g>
      {/* Wide shallow bowl */}
      <ellipse cx="150" cy="110" rx="60" ry="16" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path d="M90 110 Q95 145 150 148 Q205 145 210 110" fill="none" stroke={STROKE} strokeWidth="1.2" />
      {/* Berry clusters */}
      <circle cx="125" cy="105" r="4" fill="none" stroke={STROKE} strokeWidth="0.7" />
      <circle cx="133" cy="103" r="3.5" fill="none" stroke={STROKE} strokeWidth="0.7" />
      <circle cx="129" cy="98" r="3" fill="none" stroke={STROKE} strokeWidth="0.7" />
      {/* Granola lines */}
      <line x1="155" y1="103" x2="165" y2="107" stroke={STROKE} strokeWidth="0.5" />
      <line x1="160" y1="100" x2="170" y2="104" stroke={STROKE} strokeWidth="0.5" />
      <line x1="168" y1="102" x2="178" y2="106" stroke={STROKE} strokeWidth="0.5" />
    </g>
  );
}

function SaladIllustration() {
  return (
    <g>
      {/* Plate */}
      <ellipse cx="150" cy="120" rx="65" ry="22" fill="none" stroke={STROKE} strokeWidth="1.2" />
      {/* Leaves */}
      <path d="M120 110 Q110 95 120 85 Q130 95 120 110Z" fill="none" stroke={STROKE} strokeWidth="0.7" />
      <path d="M145 108 Q138 90 148 80 Q155 90 145 108Z" fill="none" stroke={STROKE} strokeWidth="0.7" />
      {/* Cherry tomatoes */}
      <circle cx="170" cy="108" r="5" fill="none" stroke={STROKE} strokeWidth="0.7" />
      <circle cx="180" cy="112" r="4" fill="none" stroke={STROKE} strokeWidth="0.7" />
      {/* Seeds */}
      <circle cx="135" cy="118" r="1.5" fill={STROKE} />
      <circle cx="160" cy="120" r="1.5" fill={STROKE} />
    </g>
  );
}

function DefaultIllustration() {
  return (
    <g>
      {/* Generic bowl with sprig */}
      <ellipse cx="150" cy="115" rx="50" ry="16" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path d="M100 115 Q100 150 150 155 Q200 150 200 115" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <path d="M150 100 Q148 85 155 70" fill="none" stroke={STROKE} strokeWidth="0.7" />
      <path d="M155 80 Q160 76 158 70" fill="none" stroke={STROKE} strokeWidth="0.6" />
    </g>
  );
}

// Map meal names (lowercase keywords) to illustrations
function getIllustration(mealName: string) {
  const name = mealName.toLowerCase();
  if (name.includes("oat") || name.includes("porridge") || name.includes("muesli") || name.includes("granola") || name.includes("chia"))
    return <OatsIllustration />;
  if (name.includes("lentil") || name.includes("dhal") || name.includes("dal"))
    return <LentilBowlIllustration />;
  if (name.includes("miso") || name.includes("tofu") || name.includes("soba") || name.includes("noodle") || name.includes("pad thai"))
    return <MisoIllustration />;
  if (name.includes("nice cream") || name.includes("ice cream") || name.includes("banana") && name.includes("choc"))
    return <NiceCreamIllustration />;
  if (name.includes("sushi") || name.includes("rice paper") || name.includes("roll"))
    return <SushiIllustration />;
  if (name.includes("curry") || name.includes("tikka") || name.includes("masala") || name.includes("thai"))
    return <CurryIllustration />;
  if (name.includes("soup") || name.includes("chilli") || name.includes("chili") || name.includes("stew") || name.includes("casserole"))
    return <SoupIllustration />;
  if (name.includes("stir") || name.includes("wok"))
    return <StirFryIllustration />;
  if (name.includes("smoothie") || name.includes("acai") || name.includes("bowl") && name.includes("rainbow"))
    return <SmoothieBowlIllustration />;
  if (name.includes("salad") || name.includes("zucchini noodle") || name.includes("tabbouleh") || name.includes("wrap") || name.includes("taco"))
    return <SaladIllustration />;
  return <DefaultIllustration />;
}

interface MealIllustrationProps {
  mealName: string;
  mealType?: string;
  phase?: Phase;
  height?: number;
  className?: string;
}

export default function MealIllustration({ mealName, mealType = "lunch", phase, height = 200, className = "" }: MealIllustrationProps) {
  const type = mealType.toLowerCase();
  const [from, to] = MEAL_GRADIENTS[type] || MEAL_GRADIENTS.lunch;
  const gradientId = `meal-grad-${mealName.replace(/\s/g, "-").slice(0, 12)}`;

  return (
    <div className={`relative w-full overflow-hidden rounded-t-[18px] ${className}`} style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <rect width="300" height="200" fill={`url(#${gradientId})`} />
        <g opacity="0.6">{getIllustration(mealName)}</g>
      </svg>
      {/* Labels overlaid */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-4 pb-3">
        <span className="font-hand text-sm text-card font-bold drop-shadow-sm">{mealType.toLowerCase()}</span>
      </div>
    </div>
  );
}

// Compact illustration for recipe grid cards
export function RecipeIllustration({ recipeName, height = 120, className = "" }: { recipeName: string; height?: number; className?: string }) {
  const gradientId = `recipe-grad-${recipeName.replace(/\s/g, "-").slice(0, 10)}`;
  return (
    <div className={`relative w-full overflow-hidden rounded-t-[16px] ${className}`} style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="hsl(30, 33%, 92%)" />
            <stop offset="100%" stopColor="hsl(40, 60%, 96%)" />
          </linearGradient>
        </defs>
        <rect width="300" height="200" fill={`url(#${gradientId})`} />
        <g opacity="0.5">{getIllustration(recipeName)}</g>
      </svg>
    </div>
  );
}

import { Phase } from "@/lib/cycle-utils";
import { CymatiSketch, CymaticMini as BotanicalMini } from "@/components/BotanicalElements";

// Re-export everything from BotanicalElements for backward compatibility
export { CymatiSketch as CymaticMenstrual } from "@/components/BotanicalElements";
export { CymatiSketch as CymaticFollicular } from "@/components/BotanicalElements";
export { CymatiSketch as CymaticOvulatory } from "@/components/BotanicalElements";
export { CymatiSketch as CymaticLuteal } from "@/components/BotanicalElements";
export { BotanicalMini as CymaticMini };

export default function CymaticPattern({ phase, size = 400, opacity, className = "", active = false }: { phase: Phase; size?: number; opacity?: number; className?: string; active?: boolean }) {
  const defaultOpacity = active ? 0.15 : 0.1;
  return <CymatiSketch phase={phase} size={size} opacity={opacity ?? defaultOpacity} className={className} />;
}

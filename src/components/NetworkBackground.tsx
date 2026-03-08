// NetworkBackground is replaced by RootSystem in the botanical design
// This component is kept as a thin wrapper for backward compatibility
import { RootSystem } from "@/components/BotanicalElements";

interface Props {
  opacity?: number;
  nodeCount?: number;
  className?: string;
}

export default function NetworkBackground({ opacity = 0.08 }: Props) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity }}>
      <div className="absolute -bottom-20 -left-20">
        <RootSystem size={400} opacity={1} />
      </div>
      <div className="absolute -top-20 -right-20 rotate-180">
        <RootSystem size={300} opacity={0.6} />
      </div>
    </div>
  );
}

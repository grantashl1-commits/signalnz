import { motion } from "framer-motion";

interface Props {
  icon?: React.ReactNode;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon, title, message, action }: Props) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center text-center px-6 py-12"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
    >
      {icon && (
        <div className="w-12 h-12 rounded-full bg-secondary/60 flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <p className="font-display text-xl italic text-foreground/60 mb-2">{title}</p>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px] mb-5">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="font-mono text-xs text-muted-foreground border border-border rounded-full px-4 py-2 hover:border-foreground/25 transition-all"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}

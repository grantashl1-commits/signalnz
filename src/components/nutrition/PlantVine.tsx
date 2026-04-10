/**
 * Plant Vine Animation — grows up the right side of the page as meals are logged.
 * 7-day vine; each day shades 1/7. Shows total plant count at completion.
 */
import { motion } from "framer-motion";
import { usePlantTracker } from "@/hooks/usePlantTracker";

interface PlantVineProps {
  /** Number of meals logged today (0-5) */
  mealsLoggedToday: number;
  /** Total plant count this week from tracker */
  plantCount: number;
  /** Current day of the week (0=Mon, 6=Sun) */
  dayOfWeek: number;
}

export default function PlantVine({ mealsLoggedToday, plantCount, dayOfWeek }: PlantVineProps) {
  const totalSegments = 7;
  const filledSegments = dayOfWeek + 1; // Mon=1 through Sun=7
  const isComplete = filledSegments >= 7;

  // Vine path segments — SVG coords going from bottom to top
  const segmentHeight = 100 / totalSegments;

  return (
    <div className="absolute right-0 top-0 bottom-0 w-10 pointer-events-none z-0 overflow-hidden opacity-60">
      <svg
        viewBox="0 0 40 700"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        {/* Background vine path (unshaded) */}
        <path
          d="M20 700 C20 650, 30 600, 20 550 C10 500, 30 450, 20 400 C10 350, 30 300, 20 250 C10 200, 30 150, 20 100 C10 50, 20 20, 20 0"
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* Filled vine path */}
        <motion.path
          d="M20 700 C20 650, 30 600, 20 550 C10 500, 30 450, 20 400 C10 350, 30 300, 20 250 C10 200, 30 150, 20 100 C10 50, 20 20, 20 0"
          fill="none"
          stroke="#4CAF50"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: filledSegments / totalSegments }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Leaf nodes at each day */}
        {Array.from({ length: filledSegments }).map((_, i) => {
          const y = 700 - ((i + 1) / totalSegments) * 680 - 10;
          const side = i % 2 === 0 ? 28 : 12;
          const leafRotate = i % 2 === 0 ? -30 : 30;
          const isFilled = i < filledSegments;

          return (
            <motion.g
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.4 }}
            >
              <ellipse
                cx={side}
                cy={y}
                rx="6"
                ry="3.5"
                fill={isFilled ? "#4CAF50" : "hsl(var(--secondary))"}
                opacity={isFilled ? 0.7 : 0.3}
                transform={`rotate(${leafRotate} ${side} ${y})`}
              />
            </motion.g>
          );
        })}
      </svg>

      {/* Week summary at top */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-2 right-1 text-center"
        >
          <span className="font-body text-[8px] font-bold text-foreground block">{plantCount}</span>
          <span className="font-body text-[6px] text-muted-foreground">plants</span>
        </motion.div>
      )}
    </div>
  );
}

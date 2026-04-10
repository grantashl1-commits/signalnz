/**
 * Plant Vine Animation — grows up the right side of the page as meals are logged.
 * 7-day vine; each day shades 1/7. Shows total plant count + Dr Will B quote at completion.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf } from "lucide-react";

interface PlantVineProps {
  /** Number of meals logged today (0-6) */
  mealsLoggedToday: number;
  /** Total unique plant count this week */
  plantCount: number;
  /** Current day of the week (0=Mon, 6=Sun) */
  dayOfWeek: number;
  /** All plant names logged this week */
  plants?: string[];
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export default function PlantVine({ mealsLoggedToday, plantCount, dayOfWeek, plants = [] }: PlantVineProps) {
  const [showDetail, setShowDetail] = useState(false);
  const totalSegments = 7;
  const filledSegments = dayOfWeek + 1; // Mon=1 through Sun=7
  const isComplete = filledSegments >= 7;
  const todayHasLogs = mealsLoggedToday > 0;

  return (
    <>
      {/* Vine along right edge */}
      <div
        className="absolute right-0 top-0 bottom-0 w-12 z-0 overflow-hidden"
        style={{ pointerEvents: "auto" }}
        onClick={() => setShowDetail(!showDetail)}
      >
        <svg
          viewBox="0 0 48 700"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          {/* Background vine (dashed) */}
          <path
            d="M24 700 C24 650, 34 600, 24 550 C14 500, 34 450, 24 400 C14 350, 34 300, 24 250 C14 200, 34 150, 24 100 C14 50, 24 20, 24 0"
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />

          {/* Filled vine path — grows with days */}
          <motion.path
            d="M24 700 C24 650, 34 600, 24 550 C14 500, 34 450, 24 400 C14 350, 34 300, 24 250 C14 200, 34 150, 24 100 C14 50, 24 20, 24 0"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: filledSegments / totalSegments }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Day nodes — leaf shapes */}
          {Array.from({ length: totalSegments }).map((_, i) => {
            const y = 700 - ((i + 1) / totalSegments) * 670 - 15;
            const side = i % 2 === 0 ? 33 : 15;
            const leafRotate = i % 2 === 0 ? -35 : 35;
            const isFilled = i < filledSegments;
            const isToday = i === dayOfWeek;

            return (
              <motion.g
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }}
              >
                {/* Leaf */}
                <ellipse
                  cx={side}
                  cy={y}
                  rx="7"
                  ry="4"
                  fill={isFilled ? "hsl(var(--primary))" : "hsl(var(--secondary))"}
                  opacity={isFilled ? (isToday ? 0.9 : 0.6) : 0.25}
                  transform={`rotate(${leafRotate} ${side} ${y})`}
                />
                {/* Day label */}
                <text
                  x={i % 2 === 0 ? side + 9 : side - 9}
                  y={y + 3}
                  fill={isFilled ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))"}
                  fontSize="7"
                  fontFamily="sans-serif"
                  textAnchor="middle"
                  opacity={isFilled ? 0.7 : 0.3}
                >
                  {DAY_LABELS[i]}
                </text>
                {/* Pulse on today's leaf when meals logged */}
                {isToday && todayHasLogs && (
                  <motion.circle
                    cx={side}
                    cy={y}
                    r="10"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="1"
                    initial={{ opacity: 0.6, r: 6 }}
                    animate={{ opacity: 0, r: 14 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
              </motion.g>
            );
          })}

          {/* Plant count badge at top */}
          <motion.g
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <circle cx="24" cy="12" r="10" fill="hsl(var(--primary))" opacity="0.15" />
            <text x="24" y="14" fill="hsl(var(--primary))" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              {plantCount}
            </text>
          </motion.g>
        </svg>
      </div>

      {/* Week summary card — shown when vine is tapped or week is complete */}
      <AnimatePresence>
        {(showDetail || isComplete) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div
              className="rounded-[18px] bg-card p-4 shadow-soft space-y-3 mr-14 cursor-pointer"
              onClick={() => setShowDetail(!showDetail)}
            >
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-primary" />
                <span className="font-body text-sm font-medium text-foreground">
                  {plantCount} plant{plantCount !== 1 ? "s" : ""} this week
                </span>
                {plantCount >= 30 && (
                  <span className="ml-auto font-body text-[10px] font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5">
                    🌿 Goal reached!
                  </span>
                )}
              </div>

              {/* Mini progress bar */}
              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (plantCount / 30) * 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>

              {/* Quote */}
              <p className="font-editorial text-[11px] italic text-muted-foreground leading-relaxed">
                {plantCount >= 30
                  ? `"The single greatest predictor of a healthy gut microbiome is the diversity of plants in your diet." — Dr Will Bulsiewicz`
                  : `Aiming for 30 different plants a week supports your gut microbiome diversity. — Dr Will Bulsiewicz`}
              </p>

              {/* Plant chips */}
              {plants.length > 0 && showDetail && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-wrap gap-1 pt-1"
                >
                  {plants.map(p => (
                    <span key={p} className="rounded-full px-2 py-0.5 font-body text-[9px] bg-secondary text-muted-foreground capitalize">
                      {p}
                    </span>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

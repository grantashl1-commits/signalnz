import { motion } from "framer-motion";

/** Two soft figures sitting close, holding the same shape between them.
 *  Hand-drawn watercolor feel, transparent. */
export default function ConnectIntroHero({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Soft warmth wash behind both figures */}
      <motion.ellipse
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 0.55, scale: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
        cx="160"
        cy="125"
        rx="120"
        ry="55"
        fill="hsl(var(--primary) / 0.08)"
      />

      {/* Left figure */}
      <motion.g
        initial={{ x: -8, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.15 }}
      >
        <circle cx="105" cy="75" r="18" fill="hsl(28 30% 70% / 0.55)" stroke="hsl(25 35% 35%)" strokeWidth="1.2" />
        <path d="M75 175 Q75 120 105 115 Q135 120 135 175 Z" fill="hsl(28 30% 76% / 0.55)" stroke="hsl(25 35% 35%)" strokeWidth="1.2" strokeLinejoin="round" />
        {/* arm reaching across */}
        <path d="M132 130 Q150 122 160 122" stroke="hsl(25 35% 35%)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      </motion.g>

      {/* Right figure */}
      <motion.g
        initial={{ x: 8, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.25 }}
      >
        <circle cx="215" cy="75" r="18" fill="hsl(330 25% 78% / 0.55)" stroke="hsl(25 35% 35%)" strokeWidth="1.2" />
        <path d="M185 175 Q185 120 215 115 Q245 120 245 175 Z" fill="hsl(330 25% 82% / 0.55)" stroke="hsl(25 35% 35%)" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M188 130 Q172 122 160 122" stroke="hsl(25 35% 35%)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      </motion.g>

      {/* Shared heart between them */}
      <motion.path
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.55, type: "spring", damping: 14 }}
        d="M160 118 C 154 110, 142 110, 142 122 C 142 132, 152 138, 160 144 C 168 138, 178 132, 178 122 C 178 110, 166 110, 160 118 Z"
        fill="hsl(var(--primary) / 0.25)"
        stroke="hsl(var(--primary))"
        strokeWidth="1.2"
        strokeLinejoin="round"
        style={{ transformOrigin: "160px 125px" }}
      />

      {/* Quiet dots — like breath / safety */}
      {[140, 160, 180].map((cx, i) => (
        <motion.circle
          key={cx}
          cx={cx}
          cy={102}
          r="1.4"
          fill="hsl(var(--primary) / 0.55)"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: [0, 0.8, 0], y: [-2, -8, -14] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: 0.8 + i * 0.3, ease: "easeOut" }}
        />
      ))}
    </svg>
  );
}

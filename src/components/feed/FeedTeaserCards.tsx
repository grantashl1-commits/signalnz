import { motion } from "framer-motion";
import { Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { haptic } from "@/hooks/use-mobile";

const TEASER_POSTS = [
  {
    title: "The Power of Cyclical Living",
    themes: ["hormones", "wellbeing"],
    book: "In the Flo — Alisa Vitti",
  },
  {
    title: "Why Your Morning Routine Isn't Working",
    themes: ["habits", "energy"],
    book: "Atomic Habits — James Clear",
  },
  {
    title: "The Gut-Brain Connection You're Missing",
    themes: ["nutrition", "neuroscience"],
    book: "Gut — Giulia Enders",
  },
];

export default function FeedTeaserCards() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {TEASER_POSTS.map((post, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="relative rounded-2xl bg-card p-5 overflow-hidden"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          {/* Blurred content */}
          <div className="blur-[6px] select-none pointer-events-none">
            <p className="font-body text-[11px] text-muted-foreground mb-2">
              {post.book}
            </p>
            <div className="flex gap-1.5 mb-3">
              {post.themes.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-primary/10 px-2.5 py-0.5 font-body text-[10px] text-primary"
                >
                  {t}
                </span>
              ))}
            </div>
            <p className="font-display text-base italic text-foreground mb-2">
              {post.title}
            </p>
            <p className="font-body text-sm text-foreground/70 line-clamp-3">
              {post.description}
            </p>
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent flex items-end justify-center pb-5">
            <div className="flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2">
              <Lock className="h-3.5 w-3.5 text-primary" />
              <span className="font-body text-xs font-semibold text-primary">
                Subscribe to unlock
              </span>
            </div>
          </div>
        </motion.div>
      ))}

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={() => {
          haptic("medium");
          navigate("/auth");
        }}
        className="w-full rounded-2xl bg-primary/10 border border-primary/20 p-5 text-center space-y-2"
      >
        <Sparkles className="h-5 w-5 text-primary mx-auto" />
        <p className="font-display text-sm italic text-foreground">
          5 curated insights every day
        </p>
        <p className="font-body text-xs text-muted-foreground">
          Sign up and subscribe to unlock your daily knowledge feed
        </p>
      </motion.button>
    </div>
  );
}

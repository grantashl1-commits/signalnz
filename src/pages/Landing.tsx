import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import Lenis from "lenis";
import { useAuth } from "@/contexts/AuthContext";
import SignalLogo from "@/components/SignalLogo";
import Hero from "@/components/landing/Hero";
import NoiseToSignal from "@/components/landing/NoiseToSignal";
import DayStory from "@/components/landing/DayStory";
import Pillars from "@/components/landing/Pillars";
import CycleLens from "@/components/landing/CycleLens";
import { FinalCTA, Marquee, Principles } from "@/components/landing/Closing";
import Pricing from "@/components/landing/Pricing";

/** Lenis smooth scroll on the window, only while the landing page is mounted. */
function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("landing-scroll");
    if (!enabled) return () => root.classList.remove("landing-scroll");

    const lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), anchors: true });
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      root.classList.remove("landing-scroll");
    };
  }, [enabled]);
}

function LandingNav() {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setSolid(v > 40));
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="fixed inset-x-0 top-0 z-50 px-3 md:px-6"
      style={{ paddingTop: "calc(var(--safe-top) + 12px)" }}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 ${
          solid ? "bg-background/75 text-foreground shadow-soft backdrop-blur-xl border border-border/60" : "text-background border border-transparent"
        }`}
      >
        <Link to="/welcome" className="flex items-center gap-2" aria-label="Signal">
          <SignalLogo size={24} color={solid ? "hsl(var(--primary))" : "hsl(36 33% 97%)"} />
          <span className="text-[13px] font-semibold uppercase tracking-[0.2em]">Signal</span>
        </Link>
        <nav className="flex items-center gap-1.5">
          <a href="#story" className="hidden md:inline-flex rounded-full px-4 py-2 text-[13px] opacity-80 hover:opacity-100">How it works</a>
          <a href="#pricing" className="hidden md:inline-flex rounded-full px-4 py-2 text-[13px] opacity-80 hover:opacity-100">Membership</a>
          <Link to="/auth" className="rounded-full px-4 py-2 text-[13px] opacity-80 hover:opacity-100">Sign in</Link>
          <Link
            to="/auth"
            className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${
              solid ? "bg-foreground text-background" : "bg-background text-foreground"
            }`}
          >
            Start free
          </Link>
        </nav>
      </div>
    </motion.header>
  );
}

export default function Landing() {
  const { user, loading } = useAuth();
  const reduced = useReducedMotion();
  useSmoothScroll(!reduced);

  // Members go straight to their day.
  if (!loading && user) return <Navigate to="/" replace />;

  return (
    <div className="bg-background text-foreground">
      <LandingNav />
      <main>
        <Hero />
        <NoiseToSignal />
        <DayStory />
        <Pillars />
        <Marquee />
        <CycleLens />
        <Principles />
        <Pricing />
        <FinalCTA />
      </main>
    </div>
  );
}

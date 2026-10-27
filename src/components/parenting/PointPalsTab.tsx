/**
 * Parenting → Behaviour: introduces PointPals (pointpals.co.nz), the family
 * chore and behaviour app, instead of a chart built into Signal. Links carry
 * ?source=signal so PointPals can see which families came from here.
 */
import { motion } from "framer-motion";
import { ArrowUpRight, Hand, Heart, Sparkles, Baby, Gift, Printer, Users, ShieldCheck, Smartphone } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";
import logo from "@/assets/parenting/pointpals/pointpals-logo.webp";
import jar from "@/assets/parenting/pointpals/pointpals-jar.webp";

const SITE = "https://pointpals.co.nz";
const link = (path: string) => `${SITE}${path}?source=signal`;

// PointPals' own palette: cream paper, cocoa ink, marble pastels.
const INK = "#3B2316";
const MARBLES = ["#F3D375", "#8FC7EA", "#9CD08C", "#F2A7B8", "#B79BE0", "#84CFCB"];

const STEPS = [
  { icon: Hand, title: "Tap a Pal to give a marble", body: "Spot something good: a chore done, a kind word, a brave try. One tap, and a chime tells your child you noticed." },
  { icon: Baby, title: "Or hand the phone over", body: "Kids' mode turns your phone into big picture buttons, so little ones don't need to read. They pick what they did; you hold to approve." },
  { icon: Sparkles, title: "Fill the jar, celebrate together", body: "Everyone's marbles go into one family jar. No rankings, no losers. When it's full, you celebrate together." },
];

const FEATURES = [
  { icon: Heart, label: "Chore and behaviour chart" },
  { icon: Gift, label: "Rewards you choose together" },
  { icon: Users, label: "Friends visiting can earn too" },
  { icon: Printer, label: "Printable fridge chart" },
  { icon: Smartphone, label: "Works on any phone" },
  { icon: ShieldCheck, label: "Children's data never used for ads" },
];

const RESEARCH = [
  { point: "Rewards work inside a warm relationship. Every marble is a small “I noticed you”.", source: "Neufeld & Maté, Hold On to Your Kids" },
  { point: "Seeing progress add up helps children build everyday habits. A jar you watch fill beats a number in an app.", source: "Kazdin's reviews of token systems" },
  { point: "Marbles carry the dull bits while habits form, then targets come down. The goal is graduation, not dependence.", source: "Cameron, Banko & Pierce; Deci, Koestner & Ryan" },
];

function Cta({ path, children, primary = false }: { path: string; children: React.ReactNode; primary?: boolean }) {
  return (
    <a
      href={link(path)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => haptic("light")}
      className={`touch-btn inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-full px-6 font-body text-sm font-semibold transition-transform active:scale-[0.98] ${
        primary ? "text-white shadow-sm" : "border bg-white/70"
      }`}
      style={primary ? { backgroundColor: INK } : { color: INK, borderColor: `${INK}26` }}
    >
      {children}
      <ArrowUpRight className="h-4 w-4" aria-hidden />
    </a>
  );
}

/** A few glassy marbles drifting round the edge of the hero. */
function Marble({ color, size, style }: { color: string; size: number; style: React.CSSProperties }) {
  return (
    <span
      aria-hidden
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 32% 28%, #ffffffd9 0 14%, ${color} 46%, ${color} 70%, color-mix(in srgb, ${color} 70%, #3b2316) 100%)`,
        opacity: 0.85,
        ...style,
      }}
    />
  );
}

export default function PointPalsTab() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-[24px] px-5 pb-6 pt-7 text-center"
        style={{ background: "linear-gradient(160deg, #FFF8EC 0%, #FBF1F6 55%, #EDF5FB 100%)", boxShadow: "var(--shadow-soft)" }}
      >
        <Marble color={MARBLES[0]} size={26} style={{ top: 14, left: 18 }} />
        <Marble color={MARBLES[1]} size={16} style={{ top: 58, left: 46 }} />
        <Marble color={MARBLES[3]} size={30} style={{ top: 22, right: 20 }} />
        <Marble color={MARBLES[2]} size={14} style={{ bottom: 70, right: 34 }} />
        <Marble color={MARBLES[4]} size={20} style={{ bottom: 26, left: 22 }} />

        <img src={logo} alt="PointPals" className="relative mx-auto h-16 w-auto" width={280} height={88} />
        <h2 className="relative mt-4 font-display text-[1.6rem] font-bold leading-tight" style={{ color: INK }}>
          Every good thing drops a marble.
        </h2>
        <p className="relative mx-auto mt-2 max-w-md font-body text-sm leading-relaxed" style={{ color: `${INK}cc` }}>
          A family chore and behaviour chart where chores, kind words and brave tries fill one shared jar, and you celebrate together when it's full.
        </p>
        <div className="relative mt-5 flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
          <Cta path="/sign-up" primary>Create your free family</Cta>
          <Cta path="/welcome">See how it works</Cta>
        </div>
        <p className="relative mt-3 font-body text-[11px]" style={{ color: `${INK}99` }}>
          Free for every family · Made in New Zealand
        </p>
      </motion.section>

      {/* Why it's a link */}
      <p className="px-1 font-body text-sm leading-relaxed text-muted-foreground">
        For chores, rewards and behaviour we recommend PointPals rather than a chart inside Signal: it's a full app made just for
        this, with kids' mode, rewards and a family jar. It opens in your browser and adds to your home screen, with its own free
        account. Nothing from Signal is shared with it.
      </p>

      {/* How it works */}
      <section className="space-y-3">
        <h3 className="px-1 font-display text-lg italic text-foreground">How it works</h3>
        <ol className="space-y-2.5">
          {STEPS.map((s, i) => (
            <li key={s.title} className="card-warm flex gap-3 p-4">
              <span
                className="flex h-9 w-9 flex-none items-center justify-center rounded-full"
                style={{ backgroundColor: `${MARBLES[i + 1]}40`, color: INK }}
              >
                <s.icon className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="font-body text-sm font-semibold text-foreground">{s.title}</p>
                <p className="mt-0.5 font-body text-[13px] leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* What's inside */}
      <section className="card-warm flex flex-col items-center gap-4 p-5 sm:flex-row sm:items-start">
        <img src={jar} alt="" aria-hidden className="h-28 w-28 flex-none rounded-[22px] shadow-sm" width={112} height={112} />
        <ul className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <li key={f.label} className="flex items-center gap-2 font-body text-[13px] text-foreground">
              <f.icon className="h-4 w-4 flex-none text-muted-foreground" aria-hidden />
              {f.label}
            </li>
          ))}
        </ul>
      </section>

      {/* Research */}
      <section className="space-y-3">
        <h3 className="px-1 font-display text-lg italic text-foreground">Built on what the research says</h3>
        <div className="space-y-2.5">
          {RESEARCH.map((r) => (
            <figure key={r.source} className="rounded-2xl border border-border/60 bg-card/60 p-4">
              <blockquote className="font-body text-[13px] leading-relaxed text-foreground">{r.point}</blockquote>
              <figcaption className="mt-1.5 font-body text-[11px] text-muted-foreground">{r.source}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Closing call */}
      <section className="rounded-[24px] px-5 py-6 text-center" style={{ background: "#FFF8EC", boxShadow: "var(--shadow-soft)" }}>
        <p className="font-display text-xl font-bold" style={{ color: INK }}>Your family jar is waiting.</p>
        <p className="mt-1 font-body text-[13px]" style={{ color: `${INK}b3` }}>Set it up in a few minutes. It's free.</p>
        <div className="mt-4 flex justify-center">
          <Cta path="/sign-up" primary>Start free on PointPals</Cta>
        </div>
      </section>
    </div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Target, TrendingUp, Globe, Users, DollarSign, Calendar,
  Lightbulb, ShoppingBag, Heart, Award, ChevronDown, ChevronUp,
  Rocket, Building2, Megaphone, Handshake, BarChart3, MapPin
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/* ────────────────────────── CONSTANTS ────────────────────────── */

const NZ_WOMEN_18_65 = 1_700_000;
const TARGET_VALUATION = 400_000_000;
const REVENUE_MULTIPLE = 15; // typical SaaS multiple
const REQUIRED_ARR = Math.round(TARGET_VALUATION / REVENUE_MULTIPLE);

const ARPU_BLENDED = 22; // NZD/mo weighted avg across tiers
const ANNUAL_ARPU = ARPU_BLENDED * 12;
const SUBSCRIBERS_NEEDED = Math.round(REQUIRED_ARR / ANNUAL_ARPU);
const NZ_PERCENT = ((SUBSCRIBERS_NEEDED / NZ_WOMEN_18_65) * 100);

/* ────────────────────────── REVENUE STREAMS ────────────────────────── */

const REVENUE_MODEL = [
  { stream: "Subscriptions (Rooted $9 / Nourished $19 / Thriving $39)", pctOfArr: 60, notes: "Core recurring revenue — target blended ARPU of ~$22/mo" },
  { stream: "One-off course purchases (Connect, Parenting, etc.)", pctOfArr: 10, notes: "Expand to 8–12 standalone courses at $29–$79 each" },
  { stream: "Brand sponsorship & affiliate", pctOfArr: 15, notes: "Supplement brands, self-care products, NZ supermarket partnerships" },
  { stream: "Therapist directory & referral fees", pctOfArr: 8, notes: "Vetted practitioner marketplace — commission on bookings" },
  { stream: "Enterprise / B2B wellness licences", pctOfArr: 7, notes: "Corporate wellness packages for NZ & AU employers" },
];

/* ────────────────────────── MILESTONES ────────────────────────── */

const MILESTONES = [
  {
    date: "Q3 2026",
    label: "Product-Market Fit",
    target: "1,000 paying subscribers",
    arr: "$264K",
    strategies: [
      "Launch referral incentive programme (free month for both parties)",
      "Partner with 5 NZ wellness influencers for content co-creation",
      "Run targeted Meta/Instagram ads to NZ women 25–45",
      "Pitch NZ media: Stuff, NZ Herald lifestyle sections, The Spinoff",
      "Exhibit at Women's Lifestyle Expo (Auckland, Wellington, Christchurch)",
    ],
  },
  {
    date: "Q1 2027",
    label: "Revenue Traction",
    target: "5,000 subscribers + 2 brand partners",
    arr: "$1.32M",
    strategies: [
      "Launch therapist directory with 50 vetted NZ practitioners",
      "Secure first supplement brand sponsorship (e.g., BePure, Clinicians)",
      "Release Parenting & Connect courses as standalone purchases",
      "Implement annual billing with 33% discount to improve LTV",
      "Begin collecting NPS + case studies for investor deck",
    ],
  },
  {
    date: "Q3 2027",
    label: "Market Leadership (NZ)",
    target: "15,000 subscribers",
    arr: "$3.96M",
    strategies: [
      "Capture 0.9% of NZ women 18–65 — become the #1 women's wellness app in NZ",
      "Launch B2B corporate wellness tier (target 20 NZ employers)",
      "Build API integrations with Apple Health, Fitbit, Garmin",
      "Hire head of growth + 2 content creators",
      "Begin Series A fundraising conversations",
    ],
  },
  {
    date: "Q1 2028",
    label: "International Expansion",
    target: "50,000 subscribers (AU + UK launch)",
    arr: "$13.2M",
    strategies: [
      "Localise content for Australia (supermarket links, practitioner directory)",
      "Launch UK market — partner with NHS-adjacent wellness programmes",
      "Raise Series A ($5–8M) to fund international growth",
      "Expand course library to 12 courses",
      "Hire country managers for AU and UK",
    ],
  },
  {
    date: "Q1 2029",
    label: "Scale & Diversify",
    target: "200,000 subscribers globally",
    arr: "$52.8M",
    strategies: [
      "Enter US market — partner with major women's health brands",
      "Launch enterprise API for health insurers and corporate wellness",
      "Expand therapist marketplace internationally (commission model)",
      "Build AI-powered personalisation engine (cycle-aware recommendations)",
      "Secure 10+ brand sponsorship deals across all markets",
    ],
  },
  {
    date: "Q4 2029",
    label: "$400M Valuation",
    target: "~100K subscribers + diversified revenue",
    arr: "$26.7M+ (at 15× multiple)",
    strategies: [
      "Achieve $26.7M ARR minimum (or higher at lower multiple)",
      "Demonstrate strong unit economics: LTV:CAC > 5:1, churn < 3%/mo",
      "Show international traction across 4+ markets",
      "Build strategic acquisition interest from Headspace, Flo Health, Apple",
      "Prepare for Series B or strategic acquisition at $400M valuation",
    ],
  },
];

/* ────────────────────────── SPONSORSHIP PROPOSALS ────────────────────────── */

const SPONSORSHIPS = [
  {
    category: "Supplements",
    icon: <Heart className="w-5 h-5" />,
    brands: ["BePure", "Clinicians", "Good Health", "Artemis", "Solgar"],
    model: "Sponsored 'Recommended For You' placement in Supplement Recommender + affiliate links",
    potentialRevenue: "$5K–$25K/mo per brand at scale",
  },
  {
    category: "Self-Care Products",
    icon: <ShoppingBag className="w-5 h-5" />,
    brands: ["Weleda", "Trilogy", "Ethique", "Antipodes", "Go-To Skincare"],
    model: "Curated 'Self-Care Ritual' boxes aligned to cycle phases + in-app product features",
    potentialRevenue: "$3K–$15K/mo per brand partnership",
  },
  {
    category: "Supermarket / Food Brands",
    icon: <MapPin className="w-5 h-5" />,
    brands: ["Countdown/Woolworths", "New World", "Pic's Peanut Butter", "Eat My Lunch"],
    model: "Shopping list integration with 'buy now' links + recipe ingredient sponsorship",
    potentialRevenue: "$10K–$50K/mo at scale (affiliate + sponsored placements)",
  },
  {
    category: "Therapists & Practitioners",
    icon: <Users className="w-5 h-5" />,
    brands: ["Independent NZ therapists", "Psychology clinics", "Naturopaths", "Physiotherapists"],
    model: "Verified directory listing ($49/mo) + booking commission (10–15%)",
    potentialRevenue: "$2K–$20K/mo (scales with directory size)",
  },
];

/* ────────────────────────── FUTURE FEATURES ────────────────────────── */

const FUTURE_FEATURES = [
  { phase: "2026 H2", items: ["Wearable sync (Apple Watch, Garmin, Fitbit)", "AI cycle predictions with ML model", "Group challenges with leaderboards", "Therapist directory MVP"] },
  { phase: "2027 H1", items: ["Video workout library", "Live group meditation sessions", "Partner app for Connect module", "Corporate wellness dashboard"] },
  { phase: "2027 H2", items: ["Australia localisation", "Telehealth integration", "Fertility tracking module", "Podcast integration"] },
  { phase: "2028", items: ["UK & US market launch", "Pregnancy & postpartum journey", "Insurance partnership integrations", "Advanced AI coaching (voice)"] },
  { phase: "2029", items: ["Men's wellness module", "Family wellness plans", "Health data export for GPs", "White-label enterprise product"] },
];

/* ────────────────────────── COMPONENTS ────────────────────────── */

const MilestoneCard = ({ m, index }: { m: typeof MILESTONES[0]; index: number }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => setOpen(!open)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-primary uppercase tracking-wider">{m.date}</p>
                <CardTitle className="text-base font-display">{m.label}</CardTitle>
              </div>
            </div>
            {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-4 text-sm mb-2">
            <span className="text-muted-foreground">🎯 {m.target}</span>
            <span className="text-primary font-semibold">ARR: {m.arr}</span>
          </div>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-3 space-y-2"
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">How to achieve this:</p>
              <ul className="space-y-1.5">
                {m.strategies.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                    <Lightbulb className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

/* ────────────────────────── PAGE ────────────────────────── */

const FutureReleases = () => {
  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-5 pt-8 pb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold mb-1">Strategic Roadmap</p>
        <h1 className="font-display text-2xl font-bold text-foreground leading-tight">
          Path to $400M
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-body">
          Signal's 3-year growth strategy — from NZ market leader to global wellness platform.
        </p>
      </div>

      <div className="px-5 space-y-8">

        {/* ─── VALUATION MODEL ─── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Valuation Model</h2>
          </div>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-xl bg-background/60">
                  <p className="text-2xl font-bold text-primary">$400M</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Target Valuation</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-background/60">
                  <p className="text-2xl font-bold text-foreground">15×</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Revenue Multiple</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-background/60">
                  <p className="text-xl font-bold text-foreground">${(REQUIRED_ARR / 1_000_000).toFixed(1)}M</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Required ARR</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-background/60">
                  <p className="text-xl font-bold text-foreground">{(SUBSCRIBERS_NEEDED).toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Subscribers Needed</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-background/60 text-center">
                <p className="text-sm text-muted-foreground">
                  At blended ARPU of ${ARPU_BLENDED}/mo, this requires <span className="font-bold text-foreground">{SUBSCRIBERS_NEEDED.toLocaleString()}</span> subscribers — 
                  or <span className="font-bold text-primary">{NZ_PERCENT.toFixed(0)}%</span> of NZ women 18–65.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 This is why international expansion is essential — NZ alone cannot sustain $400M. 
                  Target: {Math.round(SUBSCRIBERS_NEEDED * 0.15).toLocaleString()} NZ + {Math.round(SUBSCRIBERS_NEEDED * 0.85).toLocaleString()} international.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ─── REVENUE STREAMS ─── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Revenue Breakdown</h2>
          </div>
          <div className="space-y-2">
            {REVENUE_MODEL.map((r, i) => (
              <Card key={i} className="border-border/40">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-foreground">{r.stream}</p>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{r.pctOfArr}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 mb-1.5">
                    <div className="bg-primary rounded-full h-1.5 transition-all" style={{ width: `${r.pctOfArr}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{r.notes}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ─── NZ MARKET CONTEXT ─── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Market Sizing</h2>
          </div>
          <Card className="border-border/40">
            <CardContent className="pt-5 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold text-foreground">2.6M</p>
                  <p className="text-[9px] text-muted-foreground uppercase">NZ Women</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-lg font-bold text-foreground">1.7M</p>
                  <p className="text-[9px] text-muted-foreground uppercase">Ages 18–65</p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <p className="text-lg font-bold text-primary">{NZ_PERCENT.toFixed(0)}%</p>
                  <p className="text-[9px] text-muted-foreground uppercase">Needed (NZ only)</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-2 pt-2">
                <p><strong>NZ-only is unrealistic</strong> for $400M — {NZ_PERCENT.toFixed(0)}% penetration would be extraordinary for any app. For comparison, Headspace has ~3% penetration in its core US market.</p>
                <p><strong>Realistic split:</strong> ~15% of subscribers from NZ (~{Math.round(SUBSCRIBERS_NEEDED * 0.15).toLocaleString()}), 40% Australia, 25% UK, 20% US/Other.</p>
                <p><strong>Addressable market globally:</strong> ~500M women 18–65 across target English-speaking markets. You need just <span className="font-bold text-primary">{((SUBSCRIBERS_NEEDED / 500_000_000) * 100).toFixed(3)}%</span> global penetration.</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ─── MILESTONES ─── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Rocket className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Growth Milestones</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Tap each milestone for actionable strategies.</p>

          {/* Timeline line */}
          <div className="relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-primary/20" />
            <div className="space-y-4 relative">
              {MILESTONES.map((m, i) => (
                <div key={i} className="pl-12 relative">
                  <div className="absolute left-3.5 top-4 w-3 h-3 rounded-full bg-primary border-2 border-background z-10" />
                  <MilestoneCard m={m} index={i} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── BRAND SPONSORSHIP ─── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Handshake className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Sponsorship Proposals</h2>
          </div>
          <div className="space-y-3">
            {SPONSORSHIPS.map((s, i) => (
              <Card key={i} className="border-border/40">
                <CardContent className="py-4 px-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">{s.icon}</div>
                    <h3 className="font-semibold text-foreground">{s.category}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {s.brands.map((b) => (
                      <span key={b} className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{b}</span>
                    ))}
                  </div>
                  <p className="text-xs text-foreground/80 mb-1"><strong>Model:</strong> {s.model}</p>
                  <p className="text-xs text-primary font-medium">💰 {s.potentialRevenue}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ─── FUTURE FEATURES ─── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Feature Roadmap</h2>
          </div>
          <div className="space-y-3">
            {FUTURE_FEATURES.map((phase, i) => (
              <Card key={i} className="border-border/40">
                <CardContent className="py-3 px-4">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">{phase.phase}</p>
                  <ul className="space-y-1">
                    {phase.items.map((item, j) => (
                      <li key={j} className="text-sm text-foreground/80 flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ─── KEY METRICS TO TRACK ─── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-display text-lg font-bold text-foreground">Key Metrics for Investors</h2>
          </div>
          <Card className="border-border/40">
            <CardContent className="pt-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { metric: "Monthly Churn", target: "< 3%", why: "Industry benchmark for premium wellness apps" },
                  { metric: "LTV : CAC Ratio", target: "> 5 : 1", why: "Proves sustainable growth economics" },
                  { metric: "Net Revenue Retention", target: "> 110%", why: "Upsells from Rooted → Thriving" },
                  { metric: "DAU / MAU Ratio", target: "> 40%", why: "Shows strong daily engagement (habit loops)" },
                  { metric: "NPS Score", target: "> 60", why: "Top-quartile product satisfaction" },
                  { metric: "Payback Period", target: "< 6 months", why: "Fast CAC recovery enables growth spend" },
                ].map((m, i) => (
                  <div key={i} className="p-3 rounded-xl bg-muted/30 space-y-1">
                    <p className="text-xs font-semibold text-foreground">{m.metric}</p>
                    <p className="text-sm font-bold text-primary">{m.target}</p>
                    <p className="text-[10px] text-muted-foreground">{m.why}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ─── DISCLAIMER ─── */}
        <div className="text-center py-6">
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
            Internal strategic planning document — not for public distribution
          </p>
        </div>
      </div>
    </div>
  );
};

export default FutureReleases;

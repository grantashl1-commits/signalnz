import { useEffect, useRef, useState, memo } from "react";
import SignalRingAnimation from "@/components/SignalRingAnimation";

/* ── brand tokens (updated) ── */
const C = {
  brandPurple: "#5B2D72",
  deepNavy: "#1A0F2E",
  warmIvory: "#F5EFE8",
  lavender: "#9B7BB0",
  dustyRose: "#C9A0A0",
  black: "#0C0C0C",
  pearl: "#FDFCFB",
  body: "#444444",
};

const SECTIONS = [
  { id: "cover", label: "Cover" },
  { id: "story", label: "Story" },
  { id: "brand-mark", label: "Brand Mark" },
  { id: "colours", label: "Colours" },
  { id: "typography", label: "Type" },
  { id: "motion", label: "Motion" },
  { id: "voice", label: "Voice" },
  { id: "applications", label: "Apps" },
  { id: "download", label: "Download" },
];

const PALETTE = [
  { name: "Brand Purple", hex: "#5B2D72", rgb: "91, 45, 114", usage: "Primary · Headings · Logo · Key accents" },
  { name: "Deep Navy", hex: "#1A0F2E", rgb: "26, 15, 46", usage: "Dark backgrounds · Premium cards" },
  { name: "Warm Ivory", hex: "#F5EFE8", rgb: "245, 239, 232", usage: "Page background · Cards · Light surfaces" },
  { name: "Lavender", hex: "#9B7BB0", rgb: "155, 123, 176", usage: "Subheadings · Secondary accents · Icons" },
  { name: "Dusty Rose", hex: "#C9A0A0", rgb: "201, 160, 160", usage: "Soft accents · Phase menstrual" },
  { name: "Ink Black", hex: "#0C0C0C", rgb: "12, 12, 12", usage: "Body text · Dark mode foreground" },
];

const LOGOS = [
  { file: "Signal_Logo_Header.png", label: "App Header", desc: "Ring icon + SIGNAL wordmark, no tagline" },
  { file: "Landscape_Logo_-_Signal.png", label: "Landscape Light", desc: "Purple logo on cream" },
  { file: "Landscape_Logo_-_Signal__2_.png", label: "Landscape Dark", desc: "Cream logo on purple" },
  { file: "Square_Logo_-_Signal.png", label: "Square Light", desc: "Purple logo on cream" },
  { file: "Square_Logo_-_Signal__2_.png", label: "Square Dark", desc: "Cream logo on purple" },
  { file: "Icon_1.png", label: "Icon Purple", desc: "Brand purple ring mark" },
  { file: "Icon_2.png", label: "Icon Cream", desc: "Cream ring mark" },
];

/* ── dot pattern SVG ── */
let dotId = 0;
const DotPattern = memo(function DotPattern({ color = C.lavender, opacity = 0.08 }: { color?: string; opacity?: number }) {
  const id = useRef(`dots-${++dotId}`);
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} aria-hidden="true">
      <defs>
        <pattern id={id.current} x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="2" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id.current})`} />
    </svg>
  );
});

function Section({ id, bg = C.pearl, children, className = "" }: { id: string; bg?: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`relative flex items-center justify-center px-5 py-16 md:px-16 md:py-24 lg:px-24 overflow-hidden ${className}`} style={{ backgroundColor: bg, minHeight: "auto" }}>
      {children}
    </section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl md:text-[32px] tracking-tight mb-2" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, color: C.brandPurple }}>
      {children}
    </h2>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, fontSize: 11, color: C.lavender, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 8 }}>
      {children}
    </p>
  );
}

function Divider() {
  return <div className="w-12 h-[2px] rounded-full my-4 md:my-6" style={{ backgroundColor: C.warmIvory }} />;
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════ */
export default function BrandGuidelines() {
  const [active, setActive] = useState("cover");
  const observer = useRef<IntersectionObserver | null>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }); },
      { rootMargin: "-35% 0px -35% 0px", threshold: 0 }
    );
    SECTIONS.forEach(({ id }) => { const el = document.getElementById(id); if (el) observer.current?.observe(el); });
    return () => observer.current?.disconnect();
  }, []);

  useEffect(() => {
    if (!mobileNavRef.current) return;
    const activeBtn = mobileNavRef.current.querySelector(`[data-section="${active}"]`) as HTMLElement;
    if (activeBtn) activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="relative overflow-x-hidden" style={{ fontFamily: "'Montserrat', sans-serif", backgroundColor: C.pearl }}>
      {/* ── sticky side nav (desktop) ── */}
      <nav className="fixed left-0 top-0 bottom-0 z-50 hidden lg:flex flex-col justify-center pl-6 gap-3">
        {SECTIONS.map(({ id, label }) => (
          <button key={id} onClick={() => scrollTo(id)} className="text-left text-xs uppercase tracking-[0.18em] transition-all duration-300 min-h-[44px] flex items-center"
            style={{ fontWeight: active === id ? 800 : 500, color: active === id ? C.brandPurple : C.lavender, transform: active === id ? "translateX(4px)" : "translateX(0)" }}>
            {label}
          </button>
        ))}
      </nav>

      {/* ── mobile top nav ── */}
      <nav ref={mobileNavRef} className="fixed top-0 left-0 right-0 z-50 lg:hidden flex gap-1.5 px-4 py-2.5 overflow-x-auto scrollbar-none"
        style={{ backgroundColor: `${C.pearl}ee`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", paddingTop: "max(env(safe-area-inset-top), 10px)", scrollbarWidth: "none" }}>
        {SECTIONS.map(({ id, label }) => (
          <button key={id} data-section={id} onClick={() => scrollTo(id)}
            className="flex-shrink-0 px-3 py-2 rounded-full text-[10px] uppercase tracking-[0.12em] transition-all duration-200 min-h-[36px] active:scale-95"
            style={{ fontWeight: active === id ? 800 : 500, color: active === id ? C.pearl : C.brandPurple, backgroundColor: active === id ? C.brandPurple : "transparent", border: `1px solid ${active === id ? C.brandPurple : C.lavender}` }}>
            {label}
          </button>
        ))}
      </nav>

      {/* ═══════════  1. COVER  ═══════════ */}
      <section id="cover" className="relative min-h-screen flex items-center justify-center px-5 py-20 md:px-16 overflow-hidden"
        style={{ backgroundColor: C.brandPurple, paddingTop: "max(env(safe-area-inset-top, 60px), 80px)" }}>
        <DotPattern color={C.pearl} opacity={0.05} />
        <div className="relative z-10 flex flex-col items-center text-center gap-6 md:gap-8 w-full max-w-lg md:max-w-xl">
          <div className="w-[240px] sm:w-[320px] md:w-[480px] lg:w-[560px]">
            <img src="/logos/Signal_Logo_cream.png" alt="Signal — Landscape Dark Logo" className="w-full h-auto" width={560} height={200} loading="eager"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <p className="text-[11px] md:text-xs uppercase tracking-[0.25em]" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontStyle: "italic", color: C.warmIvory, fontSize: 14 }}>
            Tune into your inner self
          </p>
          <div className="w-10 h-[2px] rounded-full" style={{ backgroundColor: C.warmIvory, opacity: 0.4 }} />
          <p className="text-sm" style={{ fontWeight: 500, color: `${C.warmIvory}cc`, lineHeight: 1.8 }}>
            Brand Guidelines — 2025
          </p>
        </div>
      </section>

      {/* ═══════════  2. BRAND STORY  ═══════════ */}
      <Section id="story" bg={C.warmIvory}>
        <div className="max-w-xl md:max-w-2xl mx-auto text-center">
          <SectionLabel>01 — The Signal</SectionLabel>
          <SectionTitle>Brand Story</SectionTitle>
          <Divider />
          <p style={{ fontWeight: 500, fontSize: 15, color: C.body, lineHeight: 1.8 }} className="mb-5">
            Signal is a sanctuary for women seeking clarity, calm, and a deeper connection to themselves.
            Born from the belief that every woman carries an inner knowing — a signal — that guides her
            through each phase of life.
          </p>
          <p style={{ fontWeight: 500, fontSize: 15, color: C.body, lineHeight: 1.8 }} className="mb-5">
            Our brand speaks in soft tones and grounded textures. We use rich violets for depth,
            warm ivories for comfort, and clean typography to create space. Every touchpoint should
            feel like a deep breath — intentional, warm, and trustworthy.
          </p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 400, fontSize: 18, color: C.brandPurple, marginTop: 24 }}>
            "The spiral ring should always feel like it's breathing or becoming — never spinning like a mechanical loader."
          </p>
          <p className="text-[11px] uppercase tracking-[0.2em] mt-6" style={{ fontWeight: 600, color: C.lavender }}>
            Clarity · Calm · Connection
          </p>
        </div>
      </Section>

      {/* ═══════════  3. BRAND MARK  ═══════════ */}
      <Section id="brand-mark" bg={C.pearl}>
        <div className="relative z-10 max-w-5xl mx-auto w-full">
          <SectionLabel>02 — Brand Mark</SectionLabel>
          <SectionTitle>The SIGNAL Logo</SectionTitle>
          <Divider />

          {/* App header format */}
          <div className="rounded-xl p-6 md:p-8 mb-8" style={{ backgroundColor: C.warmIvory }}>
            <p style={{ fontWeight: 600, fontSize: 11, color: C.lavender, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12 }}>
              App Header Format
            </p>
            <p style={{ fontWeight: 500, fontSize: 13, color: C.body, marginBottom: 16, lineHeight: 1.6 }}>
              Ring Icon + SIGNAL wordmark only, no tagline. Used in the app header across all screens.
            </p>
            <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: C.pearl }}>
              <img src="/logos/Icon_1.png" alt="Signal ring icon" className="w-10 h-10 object-contain" />
              <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: 20, color: C.brandPurple, letterSpacing: "0.1em" }}>SIGNAL</span>
            </div>
          </div>

          {/* Logo grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-10">
            {LOGOS.map((logo) => {
              const isDark = logo.label.includes("Dark") || logo.label.includes("Cream");
              return (
                <div key={logo.file} className="flex flex-col gap-1.5">
                  <div className="rounded-xl overflow-hidden flex items-center justify-center p-4 md:p-8 aspect-[4/3]"
                    style={{ backgroundColor: isDark ? C.deepNavy : C.warmIvory }}>
                    <img src={`/logos/${logo.file}`} alt={`Signal — ${logo.label}`} className="w-full h-full object-contain max-h-[80px] md:max-h-[120px]" width={200} height={120} loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                  <p style={{ fontWeight: 800, fontSize: 12, color: C.brandPurple }}>{logo.label}</p>
                  <p style={{ fontWeight: 500, fontSize: 11, color: C.lavender }}>{logo.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Usage rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="rounded-xl p-5 md:p-6" style={{ backgroundColor: C.warmIvory }}>
              <h3 style={{ fontWeight: 800, fontSize: 16, color: C.brandPurple, marginBottom: 10 }}>✓ Do</h3>
              <ul className="space-y-2" style={{ fontWeight: 500, fontSize: 14, color: C.body, lineHeight: 1.7 }}>
                <li>Use approved logo files only.</li>
                <li>Maintain minimum clear space equal to the height of the "S".</li>
                <li>Minimum size: 120px wide (digital), 30mm (print).</li>
                <li>Use the dark version on light backgrounds and vice versa.</li>
              </ul>
            </div>
            <div className="rounded-xl p-5 md:p-6" style={{ backgroundColor: C.warmIvory }}>
              <h3 style={{ fontWeight: 800, fontSize: 16, color: C.brandPurple, marginBottom: 10 }}>✗ Don't</h3>
              <ul className="space-y-2" style={{ fontWeight: 500, fontSize: 14, color: C.body, lineHeight: 1.7 }}>
                <li>Stretch, rotate, or distort the logo.</li>
                <li>Change the logo colours.</li>
                <li>Place the logo on busy or low-contrast backgrounds.</li>
                <li>Add drop shadows, outlines, or effects.</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════  4. COLOUR PALETTE  ═══════════ */}
      <Section id="colours" bg={C.warmIvory}>
        <div className="max-w-5xl mx-auto w-full">
          <SectionLabel>03 — Palette</SectionLabel>
          <SectionTitle>Colour Palette</SectionTitle>
          <Divider />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            {PALETTE.map((c) => {
              const isLight = ["#F5EFE8", "#FDFCFB"].includes(c.hex);
              return (
                <div key={c.hex} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.lavender}33` }}>
                  <div className="h-20 md:h-36 flex items-end p-3 md:p-4" style={{ backgroundColor: c.hex }}>
                    <span className="text-[10px] md:text-xs uppercase tracking-[0.12em]" style={{ fontWeight: 800, color: isLight ? C.brandPurple : C.warmIvory }}>
                      {c.name}
                    </span>
                  </div>
                  <div className="p-3 md:p-4 space-y-0.5" style={{ backgroundColor: C.pearl }}>
                    <p style={{ fontWeight: 800, fontSize: 12, color: C.brandPurple }}>{c.hex.toUpperCase()}</p>
                    <p style={{ fontWeight: 500, fontSize: 11, color: C.lavender }}>RGB {c.rgb}</p>
                    <p style={{ fontWeight: 500, fontSize: 11, color: C.body, marginTop: 4 }}>{c.usage}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ═══════════  5. TYPOGRAPHY  ═══════════ */}
      <Section id="typography" bg={C.pearl}>
        <DotPattern color={C.lavender} opacity={0.06} />
        <div className="relative z-10 max-w-4xl mx-auto w-full">
          <SectionLabel>04 — Typography</SectionLabel>
          <SectionTitle>Type System</SectionTitle>
          <Divider />

          <div className="space-y-4 md:space-y-8">
            {/* Montserrat */}
            <div className="rounded-xl p-5 md:p-8" style={{ backgroundColor: C.warmIvory }}>
              <SectionLabel>Primary — Montserrat</SectionLabel>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: "clamp(32px, 8vw, 72px)", color: C.brandPurple, letterSpacing: "0.1em", lineHeight: 1.1 }}>
                SIGNAL
              </p>
              <p style={{ fontWeight: 500, fontSize: 13, color: C.body, marginTop: 12, lineHeight: 1.7 }}>
                Montserrat is used for the wordmark, UI labels, headings, and all structural text.
              </p>
              <div className="mt-4 space-y-2">
                <p style={{ fontWeight: 500, fontSize: 12, color: C.lavender }}>Weight 800 / 600 / 400 · Track: +10 to +35em · Case: Uppercase / Mixed</p>
                <div className="flex flex-wrap gap-3 mt-3">
                  <span className="rounded-full px-3 py-1.5 text-xs" style={{ backgroundColor: C.brandPurple, color: C.warmIvory, fontWeight: 800, letterSpacing: "0.1em" }}>EXTRABOLD 800</span>
                  <span className="rounded-full px-3 py-1.5 text-xs" style={{ backgroundColor: `${C.brandPurple}20`, color: C.brandPurple, fontWeight: 600 }}>SEMIBOLD 600</span>
                  <span className="rounded-full px-3 py-1.5 text-xs" style={{ backgroundColor: `${C.brandPurple}10`, color: C.brandPurple, fontWeight: 400 }}>Regular 400</span>
                </div>
              </div>
            </div>

            {/* Cormorant Garamond */}
            <div className="rounded-xl p-5 md:p-8" style={{ backgroundColor: C.warmIvory }}>
              <SectionLabel>Editorial — Cormorant Garamond</SectionLabel>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontStyle: "italic", fontSize: "clamp(22px, 5vw, 40px)", color: C.brandPurple, lineHeight: 1.3 }}>
                Tune into your inner self
              </p>
              <p style={{ fontWeight: 500, fontSize: 13, color: C.body, marginTop: 12, lineHeight: 1.7 }}>
                Cormorant Garamond is reserved for taglines, pull quotes, and editorial captions. It provides warmth and intimacy.
              </p>
              <div className="mt-4">
                <p style={{ fontWeight: 500, fontSize: 12, color: C.lavender }}>Weight 400 / 600 Italic · Track: 0 to +5em · Case: Mixed</p>
              </div>
            </div>

            {/* Type scale */}
            <div className="rounded-xl p-5 md:p-8" style={{ backgroundColor: C.warmIvory }}>
              <SectionLabel>Scale</SectionLabel>
              <div className="space-y-4">
                <div>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: 28, color: C.brandPurple }}>Home Hero — 28px</p>
                  <p style={{ fontWeight: 500, fontSize: 11, color: C.lavender }}>Montserrat 800</p>
                </div>
                <div>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: 20, color: C.brandPurple }}>Card Title — 20px</p>
                  <p style={{ fontWeight: 500, fontSize: 11, color: C.lavender }}>Montserrat 800</p>
                </div>
                <div>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500, fontSize: 15, color: C.body, lineHeight: 1.6 }}>Body copy — 15px / 1.6 line height</p>
                  <p style={{ fontWeight: 500, fontSize: 11, color: C.lavender }}>Montserrat 500</p>
                </div>
                <div>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, fontSize: 11, color: C.lavender, textTransform: "uppercase", letterSpacing: "0.12em" }}>Section label — 11px / 0.12em</p>
                  <p style={{ fontWeight: 500, fontSize: 11, color: C.lavender }}>Montserrat 600 · Uppercase · +12em tracking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════  6. MOTION  ═══════════ */}
      <Section id="motion" bg={C.deepNavy}>
        <div className="relative z-10 max-w-4xl mx-auto w-full">
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 600, fontSize: 11, color: C.lavender, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 8 }}>
            05 — Motion
          </p>
          <h2 className="text-2xl md:text-[32px] tracking-tight mb-2" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, color: C.warmIvory }}>
            Loading Animations
          </h2>
          <div className="w-12 h-[2px] rounded-full my-4 md:my-6" style={{ backgroundColor: `${C.warmIvory}40` }} />

          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 400, fontSize: 16, color: C.lavender, lineHeight: 1.7, marginBottom: 32 }}>
            The spiral ring should always feel like it's breathing or becoming — never spinning like a mechanical loader. Favour ease-in-out timing and never use abrupt cuts.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* A — Sequential Ripple */}
            <div className="rounded-xl p-6 flex flex-col items-center text-center gap-4" style={{ backgroundColor: `${C.warmIvory}08`, border: `1px solid ${C.warmIvory}15` }}>
              <SignalRingAnimation variant="ripple" size={100} color={C.lavender} />
              <div>
                <p style={{ fontWeight: 800, fontSize: 14, color: C.warmIvory, marginBottom: 4 }}>A — Sequential Ripple</p>
                <p style={{ fontWeight: 500, fontSize: 12, color: C.lavender, lineHeight: 1.6 }}>
                  Dots reveal clockwise with 75ms stagger. 2.4s loop, ease-in-out.
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                  {["App launch", "Page load", "Fetch"].map(t => (
                    <span key={t} className="rounded-full px-2 py-0.5 text-[10px]" style={{ backgroundColor: `${C.brandPurple}40`, color: C.warmIvory, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* B — Breathing Pulse */}
            <div className="rounded-xl p-6 flex flex-col items-center text-center gap-4" style={{ backgroundColor: `${C.warmIvory}08`, border: `1px solid ${C.warmIvory}15` }}>
              <SignalRingAnimation variant="pulse" size={100} color={C.lavender} />
              <div>
                <p style={{ fontWeight: 800, fontSize: 14, color: C.warmIvory, marginBottom: 4 }}>B — Breathing Pulse</p>
                <p style={{ fontWeight: 500, fontSize: 12, color: C.lavender, lineHeight: 1.6 }}>
                  Whole ring inhales/exhales with 0.15s stagger. 2s loop, ease-in-out.
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                  {["Idle", "Thinking", "Mic active"].map(t => (
                    <span key={t} className="rounded-full px-2 py-0.5 text-[10px]" style={{ backgroundColor: `${C.brandPurple}40`, color: C.warmIvory, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* C — Orbit Spin */}
            <div className="rounded-xl p-6 flex flex-col items-center text-center gap-4" style={{ backgroundColor: `${C.warmIvory}08`, border: `1px solid ${C.warmIvory}15` }}>
              <SignalRingAnimation variant="orbit" size={100} color={C.lavender} />
              <div>
                <p style={{ fontWeight: 800, fontSize: 14, color: C.warmIvory, marginBottom: 4 }}>C — Orbit Spin</p>
                <p style={{ fontWeight: 500, fontSize: 12, color: C.lavender, lineHeight: 1.6 }}>
                  Entire ring rotates continuously. 3s loop, linear easing.
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center mt-3">
                  {["Processing", "Syncing", "Background"].map(t => (
                    <span key={t} className="rounded-full px-2 py-0.5 text-[10px]" style={{ backgroundColor: `${C.brandPurple}40`, color: C.warmIvory, fontWeight: 600 }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════  7. VOICE & TONE  ═══════════ */}
      <Section id="voice" bg={C.warmIvory}>
        <div className="max-w-3xl mx-auto w-full">
          <SectionLabel>06 — Voice & Tone</SectionLabel>
          <SectionTitle>How Signal Speaks</SectionTitle>
          <Divider />

          <div className="space-y-3 mb-8">
            {[
              "Intimate but never intrusive.",
              "Grounded but never clinical.",
              "Always in service of the listener's inner experience.",
            ].map((line, i) => (
              <p key={i} style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 400, fontSize: 18, color: C.brandPurple, lineHeight: 1.6 }}>
                {line}
              </p>
            ))}
          </div>

          <div className="space-y-4">
            {[
              { label: "Onboarding Prompt", text: "\"Find a quiet place, take a slow breath — and let's begin. Signal will guide you gently — there's nowhere to rush.\"" },
              { label: "Error Message", text: "\"Something interrupted us. Take a moment, and we'll try again together when you're ready.\"" },
              { label: "Push Notification", text: "\"Your evening check-in is waiting — just three minutes for yourself.\"" },
            ].map((example) => (
              <div key={example.label} className="rounded-xl p-5 md:p-6" style={{ backgroundColor: C.pearl, borderLeft: `3px solid ${C.brandPurple}` }}>
                <p style={{ fontWeight: 600, fontSize: 11, color: C.lavender, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>
                  {example.label}
                </p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 400, fontSize: 16, color: C.body, lineHeight: 1.7 }}>
                  {example.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════  8. BRAND APPLICATIONS  ═══════════ */}
      <Section id="applications" bg={C.pearl}>
        <div className="max-w-5xl mx-auto w-full">
          <SectionLabel>07 — Applications</SectionLabel>
          <SectionTitle>Brand Applications</SectionTitle>
          <Divider />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {/* Business Card */}
            <div className="space-y-3">
              <p style={{ fontWeight: 800, fontSize: 13, color: C.brandPurple }}>Business Card</p>
              <div className="rounded-xl aspect-[1.6/1] p-5 md:p-6 flex flex-col justify-between" style={{ backgroundColor: C.deepNavy }}>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 16, color: C.warmIvory, letterSpacing: "0.1em" }}>SIGNAL</p>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 400, fontSize: 9, color: C.lavender, marginTop: 4 }}>Tune into your inner self</p>
                </div>
                <div>
                  <p style={{ fontWeight: 500, fontSize: 10, color: C.warmIvory }}>hello@signal.com</p>
                  <p style={{ fontWeight: 500, fontSize: 10, color: C.lavender }}>signalnz.lovable.app</p>
                </div>
              </div>
            </div>

            {/* Social Media Post */}
            <div className="space-y-3">
              <p style={{ fontWeight: 800, fontSize: 13, color: C.brandPurple }}>Social Media Post</p>
              <div className="rounded-xl aspect-square p-6 md:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden" style={{ backgroundColor: C.brandPurple }}>
                <DotPattern color={C.pearl} opacity={0.05} />
                <div className="relative z-10 space-y-3">
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 400, fontSize: "clamp(18px, 4vw, 22px)", color: C.warmIvory, lineHeight: 1.3 }}>
                    Your body already knows.
                  </p>
                  <div className="w-8 h-[2px] mx-auto rounded-full" style={{ backgroundColor: C.warmIvory, opacity: 0.5 }} />
                  <p style={{ fontWeight: 600, fontSize: 10, color: C.warmIvory, textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.7 }}>
                    @signal.wellness
                  </p>
                </div>
              </div>
            </div>

            {/* Email Header */}
            <div className="space-y-3">
              <p style={{ fontWeight: 800, fontSize: 13, color: C.brandPurple }}>Email Header</p>
              <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.lavender}33` }}>
                <div className="p-4 md:p-6 flex items-center justify-between" style={{ backgroundColor: C.deepNavy }}>
                  <p style={{ fontWeight: 800, fontSize: 14, color: C.warmIvory, letterSpacing: "0.08em" }}>SIGNAL</p>
                  <p style={{ fontWeight: 600, fontSize: 9, color: C.lavender, textTransform: "uppercase", letterSpacing: "0.12em" }}>Newsletter</p>
                </div>
                <div className="p-4 md:p-6" style={{ backgroundColor: C.pearl }}>
                  <p style={{ fontWeight: 800, fontSize: 16, color: C.brandPurple, marginBottom: 6 }}>This week's signal</p>
                  <p style={{ fontWeight: 500, fontSize: 13, color: C.body, lineHeight: 1.6 }}>
                    Nourish your follicular phase with fresh greens, gentle movement, and creative energy…
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════  9. DOWNLOAD  ═══════════ */}
      <Section id="download" bg={C.warmIvory}>
        <DotPattern color={C.lavender} opacity={0.06} />
        <div className="relative z-10 max-w-3xl mx-auto w-full text-center">
          <SectionLabel>08 — Assets</SectionLabel>
          <SectionTitle>Download</SectionTitle>
          <Divider />
          <p style={{ fontWeight: 500, fontSize: 15, color: C.body, lineHeight: 1.8, marginBottom: 24 }}>
            All approved logo files are listed below. Save them to your device for use across print and digital assets.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LOGOS.map((logo) => (
              <a key={logo.file} href={`/logos/${logo.file}`} download={logo.file}
                className="rounded-xl p-3.5 flex items-center gap-3 transition-all duration-200 active:scale-[0.97] min-h-[56px]"
                style={{ backgroundColor: C.pearl, border: `1px solid ${C.lavender}33` }}>
                <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: logo.label.includes("Dark") || logo.label.includes("Cream") ? C.deepNavy : C.warmIvory }}>
                  <span style={{ fontWeight: 800, fontSize: 10, color: logo.label.includes("Dark") || logo.label.includes("Cream") ? C.warmIvory : C.brandPurple }}>S</span>
                </div>
                <div className="text-left min-w-0">
                  <p className="truncate" style={{ fontWeight: 800, fontSize: 12, color: C.brandPurple }}>{logo.label}</p>
                  <p className="truncate" style={{ fontWeight: 500, fontSize: 10, color: C.lavender }}>{logo.file}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-12 pt-6" style={{ borderTop: `1px solid ${C.lavender}33` }}>
            <p style={{ fontWeight: 800, fontSize: 24, color: C.brandPurple, letterSpacing: "0.1em" }}>SIGNAL</p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 400, fontSize: 13, color: C.lavender, marginTop: 6 }}>
              Tune into your inner self
            </p>
            <p style={{ fontWeight: 500, fontSize: 11, color: C.lavender, marginTop: 12, opacity: 0.6 }}>© 2025 Signal. All rights reserved.</p>
          </div>
        </div>
      </Section>
    </div>
  );
}

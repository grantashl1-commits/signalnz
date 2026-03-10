import { useEffect, useRef, useState, memo } from "react";

/* ── brand tokens ── */
const C = {
  deepViolet: "#7f5b87",
  signalPurple: "#9974a1",
  lavender: "#af92b6",
  petalCream: "#ebe1da",
  warmSand: "#d9c6b9",
  pearl: "#fdfcfb",
  body: "#444444",
};

const SECTIONS = [
  { id: "cover", label: "Cover" },
  { id: "story", label: "Story" },
  { id: "logos", label: "Logos" },
  { id: "colours", label: "Colours" },
  { id: "typography", label: "Type" },
  { id: "applications", label: "Apps" },
  { id: "download", label: "Download" },
];

const PALETTE = [
  { name: "Deep Violet", hex: "#7f5b87", rgb: "127, 91, 135", usage: "Primary · Headings · Dark backgrounds" },
  { name: "Signal Purple", hex: "#9974a1", rgb: "153, 116, 161", usage: "Logo colour · Icons · Key accents" },
  { name: "Lavender", hex: "#af92b6", rgb: "175, 146, 182", usage: "Subheadings · Secondary accents" },
  { name: "Petal Cream", hex: "#ebe1da", rgb: "235, 225, 218", usage: "Light backgrounds · Cards" },
  { name: "Warm Sand", hex: "#d9c6b9", rgb: "217, 198, 185", usage: "Borders · Subtle accents" },
  { name: "Pearl White", hex: "#fdfcfb", rgb: "253, 252, 251", usage: "Page background · White space" },
];

const LOGOS = [
  { file: "Landscape_Logo_-_Signal.png", label: "Landscape Light", desc: "Purple logo on cream" },
  { file: "Landscape_Logo_-_Signal__2_.png", label: "Landscape Dark", desc: "Cream logo on purple" },
  { file: "Square_Logo_-_Signal.png", label: "Square Light", desc: "Purple logo on cream" },
  { file: "Square_Logo_-_Signal__2_.png", label: "Square Dark", desc: "Cream logo on purple" },
  { file: "Icon.png", label: "Icon Light", desc: "Icon on light" },
  { file: "Icon__2_.png", label: "Icon Dark", desc: "Icon on dark" },
];

/* ── dot pattern SVG — unique IDs to avoid conflicts ── */
let dotId = 0;
const DotPattern = memo(function DotPattern({ color = C.lavender, opacity = 0.12 }: { color?: string; opacity?: number }) {
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

/* ── section wrapper — mobile-optimised padding ── */
function Section({
  id,
  bg = C.pearl,
  children,
  className = "",
}: {
  id: string;
  bg?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`relative flex items-center justify-center px-5 py-16 md:px-16 md:py-24 lg:px-24 overflow-hidden ${className}`}
      style={{ backgroundColor: bg, minHeight: "auto" }}
    >
      {children}
    </section>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-2xl md:text-[32px] tracking-tight mb-2"
      style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, color: C.deepViolet }}
    >
      {children}
    </h2>
  );
}

function Divider() {
  return <div className="w-12 h-[2px] rounded-full my-4 md:my-6" style={{ backgroundColor: C.petalCream }} />;
}

/* ── placeholder for logos not yet uploaded ── */
function LogoPlaceholder({ dark }: { dark?: boolean }) {
  return (
    <div
      className="w-full aspect-[4/3] rounded-xl flex items-center justify-center"
      style={{ backgroundColor: dark ? C.deepViolet : C.petalCream }}
    >
      <span
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 800,
          fontSize: 20,
          color: dark ? C.petalCream : C.signalPurple,
          letterSpacing: "0.12em",
        }}
      >
        SIGNAL
      </span>
    </div>
  );
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
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-35% 0px -35% 0px", threshold: 0 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.current?.observe(el);
    });
    return () => observer.current?.disconnect();
  }, []);

  // Auto-scroll active pill into view on mobile nav
  useEffect(() => {
    if (!mobileNavRef.current) return;
    const activeBtn = mobileNavRef.current.querySelector(`[data-section="${active}"]`) as HTMLElement;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [active]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="relative overflow-x-hidden"
      style={{ fontFamily: "'Montserrat', sans-serif", backgroundColor: C.pearl }}
    >
      {/* ── sticky side nav (desktop) ── */}
      <nav className="fixed left-0 top-0 bottom-0 z-50 hidden lg:flex flex-col justify-center pl-6 gap-3">
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className="text-left text-xs uppercase tracking-[0.18em] transition-all duration-300 min-h-[44px] flex items-center"
            style={{
              fontWeight: active === id ? 800 : 500,
              color: active === id ? C.deepViolet : C.warmSand,
              transform: active === id ? "translateX(4px)" : "translateX(0)",
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* ── mobile top nav — scrollable pills with safe area ── */}
      <nav
        ref={mobileNavRef}
        className="fixed top-0 left-0 right-0 z-50 lg:hidden flex gap-1.5 px-4 py-2.5 overflow-x-auto scrollbar-none"
        style={{
          backgroundColor: `${C.pearl}ee`,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          paddingTop: "max(env(safe-area-inset-top), 10px)",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            data-section={id}
            onClick={() => scrollTo(id)}
            className="flex-shrink-0 px-3 py-2 rounded-full text-[10px] uppercase tracking-[0.12em] transition-all duration-200 min-h-[36px] active:scale-95"
            style={{
              fontWeight: active === id ? 800 : 500,
              color: active === id ? C.pearl : C.signalPurple,
              backgroundColor: active === id ? C.signalPurple : "transparent",
              border: `1px solid ${active === id ? C.signalPurple : C.warmSand}`,
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* ═══════════  1. COVER  ═══════════ */}
      <section
        id="cover"
        className="relative min-h-screen flex items-center justify-center px-5 py-20 md:px-16 overflow-hidden"
        style={{ backgroundColor: C.signalPurple, paddingTop: "max(env(safe-area-inset-top, 60px), 80px)" }}
      >
        <DotPattern color={C.pearl} opacity={0.08} />
        <div className="relative z-10 flex flex-col items-center text-center gap-6 md:gap-8 w-full max-w-lg md:max-w-xl">
          {/* Dark landscape logo */}
          <div className="w-[240px] sm:w-[320px] md:w-[480px] lg:w-[560px]">
            <img
              src="/logos/Landscape_Logo_-_Signal__2_.png"
              alt="Signal — Landscape Dark Logo"
              className="w-full h-auto"
              width={560}
              height={200}
              loading="eager"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
              }}
            />
            <div className="hidden">
              <LogoPlaceholder dark />
            </div>
          </div>
          <p
            className="text-[11px] md:text-xs uppercase tracking-[0.25em]"
            style={{ fontWeight: 500, color: C.petalCream }}
          >
            Tune into your inner self
          </p>
          <div className="w-10 h-[2px] rounded-full" style={{ backgroundColor: C.petalCream, opacity: 0.4 }} />
          <p className="text-sm" style={{ fontWeight: 500, color: `${C.petalCream}cc`, lineHeight: 1.8 }}>
            Brand Guidelines — 2025
          </p>
        </div>
      </section>

      {/* ═══════════  2. BRAND STORY  ═══════════ */}
      <Section id="story">
        <div className="max-w-xl md:max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <img
              src="/logos/Square_Logo_-_Signal.png"
              alt="Signal — Square Light Logo"
              className="w-16 h-16 md:w-28 md:h-28 object-contain"
              width={112}
              height={112}
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
          <SectionTitle>Brand Story</SectionTitle>
          <Divider />
          <p style={{ fontWeight: 500, fontSize: 15, color: C.body, lineHeight: 1.8 }} className="mb-5">
            Signal is a sanctuary for women seeking clarity, calm, and a deeper connection to themselves.
            Born from the belief that every woman carries an inner knowing — a signal — that guides her
            through each phase of life.
          </p>
          <p style={{ fontWeight: 500, fontSize: 15, color: C.body, lineHeight: 1.8 }} className="mb-5">
            Our brand speaks in soft tones and grounded textures. We use rich violets for depth,
            warm creams for comfort, and clean typography to create space. Every touchpoint should
            feel like a deep breath — intentional, warm, and trustworthy.
          </p>
          <p
            className="text-[11px] uppercase tracking-[0.2em] mt-6"
            style={{ fontWeight: 500, color: C.signalPurple }}
          >
            Clarity · Calm · Connection
          </p>
        </div>
      </Section>

      {/* ═══════════  3. LOGO USAGE  ═══════════ */}
      <Section id="logos" bg={C.petalCream}>
        <DotPattern color={C.warmSand} opacity={0.15} />
        <div className="relative z-10 max-w-5xl mx-auto w-full">
          <SectionTitle>Logo Usage</SectionTitle>
          <Divider />

          {/* Logo grid — 1 col on tiny, 2 on mobile, 3 on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-10">
            {LOGOS.map((logo) => {
              const isDark = logo.label.includes("Dark");
              return (
                <div key={logo.file} className="flex flex-col gap-1.5">
                  <div
                    className="rounded-xl overflow-hidden flex items-center justify-center p-4 md:p-8 aspect-[4/3]"
                    style={{ backgroundColor: isDark ? C.deepViolet : C.pearl }}
                  >
                    <img
                      src={`/logos/${logo.file}`}
                      alt={`Signal — ${logo.label}`}
                      className="w-full h-full object-contain max-h-[80px] md:max-h-[120px]"
                      width={200}
                      height={120}
                      loading="lazy"
                      onError={(e) => {
                        const parent = (e.target as HTMLImageElement).parentElement!;
                        (e.target as HTMLImageElement).style.display = "none";
                        const placeholder = document.createElement("span");
                        placeholder.textContent = "SIGNAL";
                        placeholder.style.cssText = `font-family:'Montserrat',sans-serif;font-weight:800;font-size:14px;color:${isDark ? C.petalCream : C.signalPurple};letter-spacing:0.12em`;
                        parent.appendChild(placeholder);
                      }}
                    />
                  </div>
                  <p style={{ fontWeight: 800, fontSize: 12, color: C.deepViolet }}>{logo.label}</p>
                  <p style={{ fontWeight: 500, fontSize: 11, color: C.signalPurple }}>{logo.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Usage rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="rounded-xl p-5 md:p-6" style={{ backgroundColor: C.pearl }}>
              <h3 style={{ fontWeight: 800, fontSize: 16, color: C.deepViolet, marginBottom: 10 }}>
                ✓ Do
              </h3>
              <ul className="space-y-2" style={{ fontWeight: 500, fontSize: 14, color: C.body, lineHeight: 1.7 }}>
                <li>Use approved logo files only.</li>
                <li>Maintain minimum clear space equal to the height of the "S" in Signal.</li>
                <li>Minimum size: 120px wide (digital), 30mm (print).</li>
                <li>Use the dark version on light backgrounds and vice versa.</li>
              </ul>
            </div>
            <div className="rounded-xl p-5 md:p-6" style={{ backgroundColor: C.pearl }}>
              <h3 style={{ fontWeight: 800, fontSize: 16, color: C.deepViolet, marginBottom: 10 }}>
                ✗ Don't
              </h3>
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
      <Section id="colours">
        <div className="max-w-5xl mx-auto w-full">
          <SectionTitle>Colour Palette</SectionTitle>
          <Divider />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            {PALETTE.map((c) => {
              const isLight = ["#ebe1da", "#d9c6b9", "#fdfcfb"].includes(c.hex);
              return (
                <div key={c.hex} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.warmSand}` }}>
                  <div
                    className="h-20 md:h-36 flex items-end p-3 md:p-4"
                    style={{ backgroundColor: c.hex }}
                  >
                    <span
                      className="text-[10px] md:text-xs uppercase tracking-[0.12em]"
                      style={{ fontWeight: 800, color: isLight ? C.deepViolet : C.pearl }}
                    >
                      {c.name}
                    </span>
                  </div>
                  <div className="p-3 md:p-4 space-y-0.5" style={{ backgroundColor: C.pearl }}>
                    <p style={{ fontWeight: 800, fontSize: 12, color: C.deepViolet }}>{c.hex.toUpperCase()}</p>
                    <p style={{ fontWeight: 500, fontSize: 11, color: C.signalPurple }}>RGB {c.rgb}</p>
                    <p style={{ fontWeight: 500, fontSize: 11, color: C.body, marginTop: 4 }}>{c.usage}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ═══════════  5. TYPOGRAPHY  ═══════════ */}
      <Section id="typography" bg={C.petalCream}>
        <DotPattern color={C.warmSand} opacity={0.12} />
        <div className="relative z-10 max-w-4xl mx-auto w-full">
          <SectionTitle>Typography</SectionTitle>
          <Divider />

          <div className="space-y-4 md:space-y-8">
            {/* Display */}
            <div className="rounded-xl p-5 md:p-8" style={{ backgroundColor: C.pearl }}>
              <p style={{ fontWeight: 500, fontSize: 11, color: C.signalPurple, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>
                Display / Logo name
              </p>
              <p style={{ fontWeight: 800, fontSize: "clamp(32px, 8vw, 72px)", color: C.deepViolet, letterSpacing: "0.08em", lineHeight: 1.1 }}>
                SIGNAL
              </p>
              <p style={{ fontWeight: 500, fontSize: 11, color: C.body, marginTop: 10 }}>
                Montserrat 800 · 72px · {C.deepViolet}
              </p>
            </div>

            {/* H1 */}
            <div className="rounded-xl p-5 md:p-8" style={{ backgroundColor: C.pearl }}>
              <p style={{ fontWeight: 500, fontSize: 11, color: C.signalPurple, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>
                Heading 1
              </p>
              <p style={{ fontWeight: 800, fontSize: "clamp(24px, 5vw, 48px)", color: C.deepViolet, lineHeight: 1.15 }}>
                Tune Into Your Inner Self
              </p>
              <p style={{ fontWeight: 500, fontSize: 11, color: C.body, marginTop: 10 }}>
                Montserrat 800 · 48px · {C.deepViolet}
              </p>
            </div>

            {/* H2 */}
            <div className="rounded-xl p-5 md:p-8" style={{ backgroundColor: C.pearl }}>
              <p style={{ fontWeight: 500, fontSize: 11, color: C.signalPurple, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>
                Heading 2
              </p>
              <p style={{ fontWeight: 800, fontSize: "clamp(20px, 4vw, 32px)", color: C.signalPurple, lineHeight: 1.2 }}>
                A Space for Clarity and Calm
              </p>
              <p style={{ fontWeight: 500, fontSize: 11, color: C.body, marginTop: 10 }}>
                Montserrat 800 · 32px · {C.signalPurple}
              </p>
            </div>

            {/* H3 */}
            <div className="rounded-xl p-5 md:p-8" style={{ backgroundColor: C.pearl }}>
              <p style={{ fontWeight: 500, fontSize: 11, color: C.signalPurple, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>
                Heading 3
              </p>
              <p style={{ fontWeight: 800, fontSize: "clamp(18px, 3vw, 22px)", color: C.lavender, lineHeight: 1.3 }}>
                Your Cycle, Your Rhythm
              </p>
              <p style={{ fontWeight: 500, fontSize: 11, color: C.body, marginTop: 10 }}>
                Montserrat 800 · 22px · {C.lavender}
              </p>
            </div>

            {/* Body */}
            <div className="rounded-xl p-5 md:p-8" style={{ backgroundColor: C.pearl }}>
              <p style={{ fontWeight: 500, fontSize: 11, color: C.signalPurple, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>
                Body
              </p>
              <p style={{ fontWeight: 500, fontSize: 15, color: C.body, lineHeight: 1.7 }}>
                Signal helps women reconnect with their natural rhythms through cycle-synced wellness,
                mindful nutrition, and nervous system regulation.
              </p>
              <p style={{ fontWeight: 500, fontSize: 11, color: C.body, marginTop: 10 }}>
                Montserrat 500 · 16px · #444444 · Line-height 1.6
              </p>
            </div>

            {/* Tagline / Caption */}
            <div className="rounded-xl p-5 md:p-8" style={{ backgroundColor: C.pearl }}>
              <p style={{ fontWeight: 500, fontSize: 11, color: C.signalPurple, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>
                Tagline / Caption
              </p>
              <p style={{ fontWeight: 500, fontSize: 12, color: C.signalPurple, textTransform: "uppercase", letterSpacing: "0.2em" }}>
                Tune into your inner self
              </p>
              <p style={{ fontWeight: 500, fontSize: 11, color: C.body, marginTop: 10 }}>
                Montserrat 500 · 12px · {C.signalPurple} · Uppercase
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════  6. BRAND APPLICATIONS  ═══════════ */}
      <Section id="applications">
        <div className="max-w-5xl mx-auto w-full">
          <SectionTitle>Brand Applications</SectionTitle>
          <Divider />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {/* Business Card */}
            <div className="space-y-3">
              <p style={{ fontWeight: 800, fontSize: 13, color: C.deepViolet }}>Business Card</p>
              <div
                className="rounded-xl aspect-[1.6/1] p-5 md:p-6 flex flex-col justify-between"
                style={{ backgroundColor: C.deepViolet }}
              >
                <div>
                  <p style={{ fontWeight: 800, fontSize: 16, color: C.petalCream, letterSpacing: "0.1em" }}>
                    SIGNAL
                  </p>
                  <p style={{ fontWeight: 500, fontSize: 8, color: C.lavender, textTransform: "uppercase", letterSpacing: "0.2em", marginTop: 4 }}>
                    Tune into your inner self
                  </p>
                </div>
                <div>
                  <p style={{ fontWeight: 500, fontSize: 10, color: C.petalCream }}>hello@signal.com</p>
                  <p style={{ fontWeight: 500, fontSize: 10, color: C.lavender }}>signal.com</p>
                </div>
              </div>
              <div
                className="rounded-xl aspect-[1.6/1] flex items-center justify-center"
                style={{ backgroundColor: C.petalCream }}
              >
                <p style={{ fontWeight: 800, fontSize: 22, color: C.signalPurple, letterSpacing: "0.12em" }}>
                  S
                </p>
              </div>
            </div>

            {/* Social Media Post */}
            <div className="space-y-3">
              <p style={{ fontWeight: 800, fontSize: 13, color: C.deepViolet }}>Social Media Post</p>
              <div
                className="rounded-xl aspect-square p-6 md:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden"
                style={{ backgroundColor: C.signalPurple }}
              >
                <DotPattern color={C.pearl} opacity={0.06} />
                <div className="relative z-10 space-y-3">
                  <p style={{ fontWeight: 800, fontSize: "clamp(18px, 4vw, 22px)", color: C.pearl, letterSpacing: "0.06em", lineHeight: 1.3 }}>
                    Your body already knows.
                  </p>
                  <div className="w-8 h-[2px] mx-auto rounded-full" style={{ backgroundColor: C.petalCream, opacity: 0.5 }} />
                  <p style={{ fontWeight: 500, fontSize: 10, color: C.petalCream, textTransform: "uppercase", letterSpacing: "0.2em" }}>
                    @signal.wellness
                  </p>
                </div>
              </div>
            </div>

            {/* Email Header */}
            <div className="space-y-3">
              <p style={{ fontWeight: 800, fontSize: 13, color: C.deepViolet }}>Email Header</p>
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: `1px solid ${C.warmSand}` }}
              >
                <div
                  className="p-4 md:p-6 flex items-center justify-between"
                  style={{ backgroundColor: C.deepViolet }}
                >
                  <p style={{ fontWeight: 800, fontSize: 14, color: C.petalCream, letterSpacing: "0.08em" }}>
                    SIGNAL
                  </p>
                  <p style={{ fontWeight: 500, fontSize: 9, color: C.lavender, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                    Newsletter
                  </p>
                </div>
                <div className="p-4 md:p-6" style={{ backgroundColor: C.pearl }}>
                  <p style={{ fontWeight: 800, fontSize: 16, color: C.deepViolet, marginBottom: 6 }}>
                    This week's signal
                  </p>
                  <p style={{ fontWeight: 500, fontSize: 13, color: C.body, lineHeight: 1.6 }}>
                    Nourish your follicular phase with fresh greens, gentle movement, and creative energy…
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ═══════════  7. DOWNLOAD  ═══════════ */}
      <Section id="download" bg={C.petalCream}>
        <DotPattern color={C.warmSand} opacity={0.1} />
        <div className="relative z-10 max-w-3xl mx-auto w-full text-center">
          <SectionTitle>Download</SectionTitle>
          <Divider />
          <p style={{ fontWeight: 500, fontSize: 15, color: C.body, lineHeight: 1.8, marginBottom: 24 }}>
            All approved logo files are listed below. Save them to your device for use across print and digital assets.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LOGOS.map((logo) => (
              <a
                key={logo.file}
                href={`/logos/${logo.file}`}
                download={logo.file}
                className="rounded-xl p-3.5 flex items-center gap-3 transition-all duration-200 active:scale-[0.97] min-h-[56px]"
                style={{ backgroundColor: C.pearl, border: `1px solid ${C.warmSand}` }}
              >
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: logo.label.includes("Dark") ? C.deepViolet : C.petalCream }}
                >
                  <span style={{ fontWeight: 800, fontSize: 10, color: logo.label.includes("Dark") ? C.petalCream : C.signalPurple }}>
                    S
                  </span>
                </div>
                <div className="text-left min-w-0">
                  <p className="truncate" style={{ fontWeight: 800, fontSize: 12, color: C.deepViolet }}>{logo.label}</p>
                  <p className="truncate" style={{ fontWeight: 500, fontSize: 10, color: C.signalPurple }}>{logo.file}</p>
                </div>
              </a>
            ))}
          </div>

          <div className="mt-12 pt-6" style={{ borderTop: `1px solid ${C.warmSand}` }}>
            <p style={{ fontWeight: 800, fontSize: 24, color: C.deepViolet, letterSpacing: "0.1em" }}>
              SIGNAL
            </p>
            <p style={{ fontWeight: 500, fontSize: 10, color: C.signalPurple, textTransform: "uppercase", letterSpacing: "0.2em", marginTop: 6 }}>
              Tune into your inner self
            </p>
            <p style={{ fontWeight: 500, fontSize: 11, color: C.warmSand, marginTop: 12 }}>
              © 2025 Signal. All rights reserved.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}

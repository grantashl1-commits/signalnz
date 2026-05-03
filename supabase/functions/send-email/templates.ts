// Signal email templates — Year of Coming Home aesthetic
// Brand: Signal by Mindcast · signal.mindcast.co.nz
// Fonts: Cormorant Garamond (headings) + Reddit Sans (body)
// Colors: #7F5B87 (violet) · #C4526E (rose) · #FAF8F5 (cream) · #F5F0EC (stone)

const APP_URL = "https://signal.mindcast.co.nz";
const SUPPORT_EMAIL = "support@mindcast.co.nz";
const LOGO_URL = "https://signal.mindcast.co.nz/logos/Signal_Logo_Purple_Text.png";

const TIER_DETAILS: Record<string, { label: string; credits: number; tagline: string }> = {
  rooted:    { label: "Rooted",    credits: 30,  tagline: "Your first step into AI-guided wellness" },
  nourished: { label: "Nourished", credits: 150, tagline: "Daily guidance, deeper insights, real momentum" },
  thriving:  { label: "Thriving",  credits: 500, tagline: "Full access to everything Signal has to offer" },
};

// ─── Botanical SVG elements ────────────────────────────────────────────────

function botanicalDivider() {
  return `
    <tr>
      <td style="text-align:center;padding:4px 40px 12px;">
        <svg width="120" height="16" viewBox="0 0 120 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="8" x2="50" y2="8" stroke="#DDD6CC" stroke-width="0.8"/>
          <circle cx="57" cy="8" r="2.5" fill="#C4A8D4" opacity="0.7"/>
          <circle cx="63" cy="8" r="1.5" fill="#C4526E" opacity="0.5"/>
          <line x1="70" y1="8" x2="120" y2="8" stroke="#DDD6CC" stroke-width="0.8"/>
        </svg>
      </td>
    </tr>`;
}

function leafSprig() {
  return `<svg width="28" height="32" viewBox="0 0 28 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;">
    <path d="M14 28 Q13 20 11 14 Q8 8 10 3 Q14 7 15 14 Q16 20 14 28Z" fill="#C4A8D4" opacity="0.45"/>
    <path d="M14 28 Q15 20 17 14 Q20 8 18 3 Q14 7 13 14 Q12 20 14 28Z" fill="#E8D5EC" opacity="0.5"/>
    <line x1="14" y1="3" x2="14" y2="28" stroke="#9974A1" stroke-width="0.8" stroke-linecap="round"/>
  </svg>`;
}

// ─── Shared layout wrappers ────────────────────────────────────────────────

function header() {
  return `
    <tr>
      <td style="background:#F5F0EC;padding:40px 40px 28px;text-align:center;border-bottom:1px solid #E8DED4;">
        <img src="${LOGO_URL}" alt="Signal" width="148" height="auto" style="display:block;margin:0 auto 14px;max-width:148px;height:auto;">
        <div style="margin:0 auto 14px;width:48px;height:1px;background:linear-gradient(to right,transparent,#B89FCA,transparent);"></div>
        <p style="margin:0;font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;font-size:12px;font-style:italic;color:#9974A1;letter-spacing:0.09em;">by Mindcast &nbsp;·&nbsp; tune into your inner self</p>
      </td>
    </tr>`;
}

function footer() {
  return `
    <tr>
      <td style="padding:32px 40px 40px;background:#F5F0EC;text-align:center;border-top:1px solid #E8DED4;">
        <div style="margin:0 auto 16px;">${leafSprig()}</div>
        <p style="color:#B0A898;font-size:11px;margin:0 0 6px;line-height:1.6;">
          Signal by Mindcast &nbsp;·&nbsp; <a href="mailto:${SUPPORT_EMAIL}" style="color:#7F5B87;text-decoration:none;">${SUPPORT_EMAIL}</a>
        </p>
        <p style="color:#B0A898;font-size:11px;margin:0 0 12px;">
          <a href="${APP_URL}" style="color:#7F5B87;text-decoration:none;">signal.mindcast.co.nz</a>
        </p>
        <p style="color:#C9C2B8;font-size:10px;margin:0;line-height:1.6;">
          You're receiving this because you have a Signal account.<br>
          To manage your subscription, visit your <a href="${APP_URL}/membership" style="color:#7F5B87;text-decoration:none;">membership settings</a>.
        </p>
      </td>
    </tr>`;
}

function fontStyles() {
  return `<style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Reddit+Sans:wght@400;500;600&display=swap');
    body { font-family: 'Reddit Sans', 'Helvetica Neue', Arial, sans-serif; }
    h1, h2, .serif { font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif; }
  </style>`;
}

function wrap(body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>Signal</title>
  ${fontStyles()}
</head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FAF8F5;min-height:100vh;">
    <tr>
      <td align="center" style="padding:32px 16px 48px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(127,91,135,0.09);">
          ${header()}
          ${body}
          ${footer()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(text: string, url: string, color?: string) {
  const bg = color === "rose"
    ? "linear-gradient(135deg,#C4526E,#D4728A)"
    : "linear-gradient(135deg,#7F5B87,#9974A1)";
  return `<a href="${url}" style="display:inline-block;background:${bg};color:#ffffff;text-decoration:none;font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:600;padding:14px 40px;border-radius:50px;letter-spacing:0.04em;">${text}</a>`;
}

function sectionLabel(text: string) {
  return `<p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#1A1523;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;margin:0 0 20px;">${text}</p>`;
}

// ─── 1. Welcome email (new signup) ────────────────────────────────────────

export function welcomeEmail(name?: string) {
  const greeting = name ? `Hi ${name},` : "Welcome to Signal,";
  const body = `
    <tr>
      <td style="padding:44px 40px 12px;">
        <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:36px;font-weight:600;color:#2D1B3D;margin:0 0 16px;line-height:1.15;">
          You're in. ✨
        </h1>
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:15px;line-height:1.75;margin:0 0 12px;">${greeting}</p>
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:15px;line-height:1.75;margin:0 0 28px;">
          Signal is your personal wellness companion — designed around <em>your</em> body, your cycle, and your life.
          We're so glad you're here.
        </p>
      </td>
    </tr>
    ${botanicalDivider()}
    <tr>
      <td style="padding:16px 40px 8px;">
        ${sectionLabel("What's waiting for you")}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${featureRow("🌙", "Cycle Syncing", "Track your cycle and get personalised nutrition, movement, and mood insights for every phase.")}
          ${featureRow("✍️", "AI Journal", "Write, reflect, and process — your entries stay private and safe in your Memory Vault.")}
          ${featureRow("🥗", "Nutrition Guidance", "Meal plans, plant diversity tracking, and fridge-to-recipe magic.")}
          ${featureRow("📖", "Feed Your Mind", "Curated wisdom from books on wellness, relationships, and personal growth — fresh daily.")}
          ${featureRow("🧘", "Mindfulness & Movement", "Workouts, breathwork, and nervous system tools tailored to where you are today.")}
          ${featureRow("👨‍👩‍👧", "Parenting Course & Behaviour Chart", "Evidence-based parenting guidance plus a visual tool to understand your child's patterns.")}
          ${featureRow("💞", "Connect Course", "A relationship course built on Gottman and attachment science — do it solo or with your partner.")}
        </table>
      </td>
    </tr>
    ${botanicalDivider()}
    <tr>
      <td style="padding:28px 40px 44px;text-align:center;">
        <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;font-style:italic;color:#9974A1;margin:0 0 24px;line-height:1.5;">Ready to come home to yourself?</p>
        ${ctaButton("Open Signal", APP_URL)}
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#B0A898;font-size:12px;margin:24px 0 0;">
          Questions? Reply to this email or reach us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#7F5B87;text-decoration:none;">${SUPPORT_EMAIL}</a>
        </p>
      </td>
    </tr>`;

  return {
    subject: "Welcome to Signal — you're in ✨",
    html: wrap(body),
  };
}

// ─── 2. Subscription confirmed ─────────────────────────────────────────────

export function subscriptionConfirmedEmail(tier: string, name?: string) {
  const t = TIER_DETAILS[tier] ?? { label: tier, credits: 0, tagline: "" };
  const greeting = name ? `Hi ${name},` : "Great news —";
  const body = `
    <tr>
      <td style="padding:44px 40px 12px;">
        <div style="display:inline-block;background:rgba(127,91,135,0.08);border-radius:50px;padding:5px 16px;margin-bottom:20px;">
          <span style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#7F5B87;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">${t.label} Plan</span>
        </div>
        <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:34px;font-weight:600;color:#2D1B3D;margin:0 0 16px;line-height:1.15;">
          Your subscription is live 🎉
        </h1>
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:15px;line-height:1.75;margin:0 0 8px;">${greeting}</p>
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:15px;line-height:1.75;margin:0 0 28px;">
          Your <strong style="color:#2D1B3D;">${t.label}</strong> plan is now active. ${t.tagline}.
        </p>
      </td>
    </tr>
    ${botanicalDivider()}
    <tr>
      <td style="padding:16px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0EC;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 20px;">
              ${sectionLabel("Your plan includes")}
              ${creditRow(t.credits)}
              ${planFeatureRow("✓", "All AI-guided tools — journal, cycle, nutrition, movement")}
              ${planFeatureRow("✓", "Feed Your Mind — curated daily book wisdom")}
              ${planFeatureRow("✓", "Memory Vault — your private reflections, saved forever")}
              ${planFeatureRow("✓", "Parenting Course, Behaviour Chart & Connect Course")}
              ${planFeatureRow("✓", "Cancel or change your plan anytime")}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 40px 44px;text-align:center;">
        ${ctaButton("Start exploring Signal", APP_URL)}
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#B0A898;font-size:12px;margin:20px 0 0;">
          Manage your billing anytime at <a href="${APP_URL}/membership" style="color:#7F5B87;text-decoration:none;">membership settings</a>
        </p>
      </td>
    </tr>`;

  return {
    subject: `Your Signal ${t.label} plan is live 🎉`,
    html: wrap(body),
  };
}

// ─── 3. Top-up confirmed ───────────────────────────────────────────────────

export function topupConfirmedEmail(name?: string) {
  const greeting = name ? `Hi ${name},` : "Good news —";
  const body = `
    <tr>
      <td style="padding:44px 40px 12px;">
        <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:34px;font-weight:600;color:#2D1B3D;margin:0 0 16px;line-height:1.15;">
          Credits topped up ⚡
        </h1>
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:15px;line-height:1.75;margin:0 0 12px;">${greeting}</p>
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:15px;line-height:1.75;margin:0 0 28px;">
          <strong style="color:#2D1B3D;">50 AI credits</strong> have been added to your account. They're ready to use right now.
        </p>
      </td>
    </tr>
    ${botanicalDivider()}
    <tr>
      <td style="padding:16px 40px;">
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:14px;line-height:1.75;margin:0 0 16px;">Your credits power everything AI in Signal — from journal insights and cycle guidance to meal planning and mindfulness scripts.</p>
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:14px;line-height:1.75;margin:0;">Need a regular supply? Upgrade your plan for a monthly credit refresh at a better rate.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 40px 44px;text-align:center;">
        ${ctaButton("Use my credits", APP_URL)}
      </td>
    </tr>`;

  return {
    subject: "50 Signal credits added to your account ⚡",
    html: wrap(body),
  };
}

// ─── 4. Renewal confirmed ──────────────────────────────────────────────────

export function renewalEmail(tier: string, nextBillingDate: string, name?: string) {
  const t = TIER_DETAILS[tier] ?? { label: tier, credits: 0, tagline: "" };
  const greeting = name ? `Hi ${name},` : "Good news —";
  const body = `
    <tr>
      <td style="padding:44px 40px 12px;">
        <div style="display:inline-block;background:rgba(127,91,135,0.08);border-radius:50px;padding:5px 16px;margin-bottom:20px;">
          <span style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#7F5B87;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">${t.label} Plan · Renewed</span>
        </div>
        <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:34px;font-weight:600;color:#2D1B3D;margin:0 0 16px;line-height:1.15;">
          Your subscription has renewed 🌿
        </h1>
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:15px;line-height:1.75;margin:0 0 12px;">${greeting}</p>
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:15px;line-height:1.75;margin:0 0 28px;">
          Your <strong style="color:#2D1B3D;">${t.label}</strong> plan has renewed and your <strong style="color:#7F5B87;">${t.credits} AI credits</strong> have been refreshed for the month ahead.
        </p>
      </td>
    </tr>
    ${botanicalDivider()}
    <tr>
      <td style="padding:16px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0EC;border-radius:16px;">
          <tr>
            <td style="padding:24px 28px;">
              ${renewalDetailRow("Plan", `${t.label}`)}
              ${renewalDetailRow("Credits refreshed", `${t.credits} AI credits`)}
              ${renewalDetailRow("Next billing", nextBillingDate)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 40px 44px;text-align:center;">
        ${ctaButton("Open Signal", APP_URL)}
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#B0A898;font-size:12px;margin:20px 0 0;">
          Manage your plan at <a href="${APP_URL}/membership" style="color:#7F5B87;text-decoration:none;">Membership Settings</a>
        </p>
      </td>
    </tr>`;

  return {
    subject: `Your Signal ${t.label} plan has renewed`,
    html: wrap(body),
  };
}

// ─── 5. Plan changed ───────────────────────────────────────────────────────

export function planChangedEmail(newTier: string, oldTier: string, name?: string) {
  const t = TIER_DETAILS[newTier] ?? { label: newTier, credits: 0, tagline: "" };
  const oldT = TIER_DETAILS[oldTier] ?? { label: oldTier, credits: 0, tagline: "" };
  const isUpgrade = (TIER_DETAILS[newTier]?.credits ?? 0) > (TIER_DETAILS[oldTier]?.credits ?? 0);
  const greeting = name ? `Hi ${name},` : "Your plan has been updated.";
  const body = `
    <tr>
      <td style="padding:44px 40px 12px;">
        <div style="display:inline-block;background:${isUpgrade ? "rgba(127,91,135,0.08)" : "rgba(196,82,110,0.08)"};border-radius:50px;padding:5px 16px;margin-bottom:20px;">
          <span style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:${isUpgrade ? "#7F5B87" : "#C4526E"};font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;">${isUpgrade ? "Plan Upgraded" : "Plan Changed"}</span>
        </div>
        <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:34px;font-weight:600;color:#2D1B3D;margin:0 0 16px;line-height:1.15;">
          ${isUpgrade ? "You've upgraded 🚀" : "Your plan has changed"}
        </h1>
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:15px;line-height:1.75;margin:0 0 12px;">${greeting}</p>
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:15px;line-height:1.75;margin:0 0 28px;">
          Your Signal plan has moved from <strong>${oldT.label}</strong> to <strong style="color:#7F5B87;">${t.label}</strong>.
          ${isUpgrade ? "Enjoy your expanded access!" : "Your updated plan takes effect immediately."}
        </p>
      </td>
    </tr>
    ${botanicalDivider()}
    <tr>
      <td style="padding:16px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0EC;border-radius:16px;">
          <tr>
            <td style="padding:24px 28px;">
              ${renewalDetailRow("Previous plan", oldT.label)}
              ${renewalDetailRow("New plan", t.label)}
              ${renewalDetailRow("AI credits per month", `${t.credits} credits`)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 40px 44px;text-align:center;">
        ${ctaButton("Open Signal", APP_URL)}
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#B0A898;font-size:12px;margin:20px 0 0;">
          Manage your plan at <a href="${APP_URL}/membership" style="color:#7F5B87;text-decoration:none;">Membership Settings</a>
        </p>
      </td>
    </tr>`;

  return {
    subject: isUpgrade ? `You've upgraded to Signal ${t.label} 🚀` : `Your Signal plan has been updated`,
    html: wrap(body),
  };
}

// ─── 6. Subscription cancelled ────────────────────────────────────────────

export function cancellationEmail(tier: string, endDate: string, name?: string) {
  const t = TIER_DETAILS[tier] ?? { label: tier, credits: 0, tagline: "" };
  const greeting = name ? `Hi ${name},` : "We're sorry to see you go.";
  const body = `
    <tr>
      <td style="padding:44px 40px 12px;">
        <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:34px;font-weight:600;color:#2D1B3D;margin:0 0 16px;line-height:1.15;">
          Your subscription has been cancelled
        </h1>
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:15px;line-height:1.75;margin:0 0 12px;">${greeting}</p>
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:15px;line-height:1.75;margin:0 0 28px;">
          Your <strong>${t.label}</strong> subscription has been cancelled. You'll still have full access to Signal until <strong style="color:#2D1B3D;">${endDate}</strong>.
        </p>
      </td>
    </tr>
    ${botanicalDivider()}
    <tr>
      <td style="padding:16px 40px;">
        ${sectionLabel("What happens next")}
        ${planFeatureRow("·", `Access continues until ${endDate}`)}
        ${planFeatureRow("·", "Your journal entries and Memory Vault remain safe")}
        ${planFeatureRow("·", "Your course progress is saved")}
        ${planFeatureRow("·", "You can resubscribe at any time")}
      </td>
    </tr>
    ${botanicalDivider()}
    <tr>
      <td style="padding:16px 40px 44px;">
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:14px;line-height:1.75;margin:0 0 24px;">
          Changed your mind? We'd love to have you back. Your data is still here whenever you're ready.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td>${ctaButton("Resubscribe", `${APP_URL}/membership`)}</td>
          </tr>
        </table>
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#B0A898;font-size:12px;margin:20px 0 0;">
          If you have feedback on why you cancelled, we'd genuinely love to hear it — reply to this email or write to <a href="mailto:${SUPPORT_EMAIL}" style="color:#7F5B87;text-decoration:none;">${SUPPORT_EMAIL}</a>
        </p>
      </td>
    </tr>`;

  return {
    subject: `Your Signal subscription has been cancelled`,
    html: wrap(body),
  };
}

// ─── 7. Drip Day 2 — Start with your cycle ────────────────────────────────

export function dripCycleSyncingEmail(name?: string) {
  const greeting = name ? `Hi ${name},` : "Hello,";
  const body = `
    <tr>
      <td style="padding:44px 40px 12px;">
        <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:34px;font-weight:600;color:#2D1B3D;margin:0 0 16px;line-height:1.15;">
          Your cycle is your compass 🌙
        </h1>
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:15px;line-height:1.75;margin:0 0 12px;">${greeting}</p>
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:15px;line-height:1.75;margin:0 0 28px;">
          Most wellness apps give you generic advice. Signal gives you <em>your</em> advice —
          personalised to your cycle phase, so every recommendation meets you where you actually are.
        </p>
      </td>
    </tr>
    ${botanicalDivider()}
    <tr>
      <td style="padding:16px 40px;">
        ${sectionLabel("What cycle syncing unlocks")}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${featureRow("🌱", "Follicular phase", "Energy rising — best time for bold decisions, new starts, and strength training.")}
          ${featureRow("☀️", "Ovulatory phase", "Peak confidence — lean into connection, creativity, and high-intensity movement.")}
          ${featureRow("🍂", "Luteal phase", "Turning inward — nourish with slow food, gentle movement, and deep reflection.")}
          ${featureRow("🌑", "Menstrual phase", "Rest and restore — your body is doing profound work. Honour it.")}
        </table>
      </td>
    </tr>
    ${botanicalDivider()}
    <tr>
      <td style="padding:24px 40px 44px;text-align:center;">
        <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:17px;font-style:italic;color:#9974A1;margin:0 0 24px;line-height:1.5;">Set up your cycle today — it takes less than two minutes.</p>
        ${ctaButton("Set up Cycle Syncing", `${APP_URL}/cycle`)}
      </td>
    </tr>`;

  return {
    subject: "Your cycle is your compass 🌙",
    html: wrap(body),
  };
}

// ─── 8. Drip Day 4 — Feed Your Mind ───────────────────────────────────────

export function dripFeedYourMindEmail(name?: string) {
  const greeting = name ? `Hi ${name},` : "Hello,";
  const body = `
    <tr>
      <td style="padding:44px 40px 12px;">
        <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:34px;font-weight:600;color:#2D1B3D;margin:0 0 16px;line-height:1.15;">
          Nourish your mind, too 📖
        </h1>
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:15px;line-height:1.75;margin:0 0 12px;">${greeting}</p>
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:15px;line-height:1.75;margin:0 0 28px;">
          Signal's <strong style="color:#2D1B3D;">Feed Your Mind</strong> section surfaces five curated insights every day,
          drawn from the best books on wellness, relationships, nervous system healing, and personal growth.
        </p>
      </td>
    </tr>
    ${botanicalDivider()}
    <tr>
      <td style="padding:16px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0EC;border-radius:16px;">
          <tr>
            <td style="padding:28px 28px 20px;">
              ${sectionLabel("Why it's different")}
              ${planFeatureRow("✓", "5 fresh book insights every day — never repeated")}
              ${planFeatureRow("✓", "Themes: nervous system, relationships, nutrition, mindfulness, parenting")}
              ${planFeatureRow("✓", "Actionable takeaways you can use today")}
              ${planFeatureRow("✓", "Sourced from evidence-based authors and researchers")}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${botanicalDivider()}
    <tr>
      <td style="padding:24px 40px 44px;text-align:center;">
        <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:17px;font-style:italic;color:#9974A1;margin:0 0 24px;line-height:1.5;">What are you curious about today?</p>
        ${ctaButton("Explore Feed Your Mind", `${APP_URL}/feed`)}
      </td>
    </tr>`;

  return {
    subject: "Five ideas for your mind today 📖",
    html: wrap(body),
  };
}

// ─── 9. Drip Day 7 — AI Journal ───────────────────────────────────────────

export function dripJournalEmail(name?: string) {
  const greeting = name ? `Hi ${name},` : "Hello,";
  const body = `
    <tr>
      <td style="padding:44px 40px 12px;">
        <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:34px;font-weight:600;color:#2D1B3D;margin:0 0 16px;line-height:1.15;">
          A space just for you ✍️
        </h1>
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:15px;line-height:1.75;margin:0 0 12px;">${greeting}</p>
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:15px;line-height:1.75;margin:0 0 28px;">
          One week in — how are you feeling? Your Signal journal is a private, safe space to write,
          reflect, and process. And when you're ready, the AI can offer gentle insights from what you've shared.
        </p>
      </td>
    </tr>
    ${botanicalDivider()}
    <tr>
      <td style="padding:16px 40px;">
        ${sectionLabel("What the journal can do")}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${featureRow("🧠", "AI Insights", "Ask the AI about patterns in your writing — emotions, themes, growth.")}
          ${featureRow("🔒", "Memory Vault", "Everything you write is encrypted and private. Only you can see it.")}
          ${featureRow("📅", "Daily check-ins", "A simple prompt each day to keep you grounded and present.")}
          ${featureRow("🌿", "Trauma-informed", "Built on nervous system science — gentle, not prescriptive.")}
        </table>
      </td>
    </tr>
    ${botanicalDivider()}
    <tr>
      <td style="padding:24px 40px 44px;text-align:center;">
        <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:17px;font-style:italic;color:#9974A1;margin:0 0 24px;line-height:1.5;">What's on your mind today?</p>
        ${ctaButton("Open my journal", `${APP_URL}/journal`)}
      </td>
    </tr>`;

  return {
    subject: "A space just for you — your Signal journal ✍️",
    html: wrap(body),
  };
}

// ─── 10. Drip Day 14 — Parenting Course & Behaviour Chart ─────────────────

export function dripParentingEmail(name?: string) {
  const greeting = name ? `Hi ${name},` : "Hello,";
  const body = `
    <tr>
      <td style="padding:44px 40px 12px;">
        <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:34px;font-weight:600;color:#2D1B3D;margin:0 0 16px;line-height:1.15;">
          Parenting with presence 👨‍👩‍👧
        </h1>
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:15px;line-height:1.75;margin:0 0 12px;">${greeting}</p>
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:15px;line-height:1.75;margin:0 0 28px;">
          Signal's parenting tools are built for real families — not perfect ones.
          Whether you're navigating big emotions, building connection, or just trying to stay regulated yourself,
          we've got something for you.
        </p>
      </td>
    </tr>
    ${botanicalDivider()}
    <tr>
      <td style="padding:16px 40px;">
        ${sectionLabel("Two tools you'll love")}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${featureRow("📊", "Behaviour Chart", "Track and visualise your child's behaviour patterns over time. Spot triggers, celebrate wins, and respond — not just react.")}
          ${featureRow("📚", "Parenting Course", "Evidence-based lessons on attachment, co-regulation, nervous system development, and gentle discipline. Work through it at your own pace.")}
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0EC;border-radius:16px;">
          <tr>
            <td style="padding:24px 28px;">
              <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:16px;font-style:italic;color:#6B6070;margin:0;line-height:1.7;">
                "The goal isn't to raise a perfect child. It's to raise a child who knows they are loved —
                especially in their hardest moments."
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${botanicalDivider()}
    <tr>
      <td style="padding:24px 40px 44px;text-align:center;">
        ${ctaButton("Explore Parenting tools", `${APP_URL}/parenting`)}
      </td>
    </tr>`;

  return {
    subject: "Parenting with presence — tools to help 👨‍👩‍👧",
    html: wrap(body),
  };
}

// ─── 11. Drip Day 30 — One month in ───────────────────────────────────────

export function dripOneMonthEmail(name?: string) {
  const greeting = name ? `Hi ${name},` : "Hello,";
  const body = `
    <tr>
      <td style="padding:44px 40px 12px;text-align:center;">
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#9974A1;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;margin:0 0 12px;">One month with Signal</p>
        <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-size:36px;font-weight:600;color:#2D1B3D;margin:0 0 16px;line-height:1.15;">
          Coming home to yourself 🌿
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding:0 40px 12px;">
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:15px;line-height:1.75;margin:0 0 12px;">${greeting}</p>
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:15px;line-height:1.75;margin:0 0 28px;">
          You've been with Signal for a month. That means a month of showing up for yourself —
          through cycles, through busy days, through the hard and the beautiful.
          That matters more than you know.
        </p>
      </td>
    </tr>
    ${botanicalDivider()}
    <tr>
      <td style="padding:16px 40px;">
        ${sectionLabel("Have you explored everything?")}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${featureRow("🌙", "Cycle Syncing", "Personalised guidance for every phase of your cycle.")}
          ${featureRow("📖", "Feed Your Mind", "5 fresh book insights every day.")}
          ${featureRow("✍️", "AI Journal", "Private reflection with gentle AI support.")}
          ${featureRow("📊", "Behaviour Chart", "Track your child's patterns with clarity.")}
          ${featureRow("📚", "Parenting Course", "Evidence-based lessons at your pace.")}
          ${featureRow("💞", "Connect Course", "Deepen your most important relationship.")}
        </table>
      </td>
    </tr>
    ${botanicalDivider()}
    <tr>
      <td style="padding:24px 40px 44px;text-align:center;">
        <p style="font-family:'Cormorant Garamond',Georgia,serif;font-size:17px;font-style:italic;color:#9974A1;margin:0 0 24px;line-height:1.5;">We're so glad you're here. Keep going.</p>
        ${ctaButton("Open Signal", APP_URL)}
        <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#B0A898;font-size:12px;margin:24px 0 0;">
          Any feedback? We read every reply — reach us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#7F5B87;text-decoration:none;">${SUPPORT_EMAIL}</a>
        </p>
      </td>
    </tr>`;

  return {
    subject: "One month with Signal 🌿",
    html: wrap(body),
  };
}

// ─── Helper row components ─────────────────────────────────────────────────

function featureRow(emoji: string, title: string, desc: string) {
  return `
    <tr>
      <td style="padding:0 0 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:36px;vertical-align:top;padding-top:2px;">
              <span style="font-size:18px;">${emoji}</span>
            </td>
            <td style="padding-left:10px;vertical-align:top;">
              <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#2D1B3D;font-size:14px;font-weight:600;margin:0 0 3px;">${title}</p>
              <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#8A8090;font-size:13px;margin:0;line-height:1.55;">${desc}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function planFeatureRow(check: string, text: string) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
      <tr>
        <td style="width:20px;color:#7F5B87;font-weight:700;font-size:14px;vertical-align:top;">${check}</td>
        <td style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#6B6070;font-size:14px;line-height:1.55;padding-left:8px;">${text}</td>
      </tr>
    </table>`;
}

function creditRow(credits: number) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr>
        <td style="background:linear-gradient(135deg,#7F5B87,#9974A1);border-radius:12px;padding:16px 20px;">
          <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:rgba(255,255,255,0.7);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px;">Monthly AI Credits</p>
          <p style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#ffffff;font-size:28px;font-weight:700;margin:0;line-height:1;">${credits} <span style="font-size:14px;opacity:0.7;font-weight:400;">credits / month</span></p>
        </td>
      </tr>
    </table>`;
}

function renewalDetailRow(label: string, value: string) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
      <tr>
        <td style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#8A8090;font-size:13px;width:50%;">${label}</td>
        <td style="font-family:'Reddit Sans','Helvetica Neue',Arial,sans-serif;color:#2D1B3D;font-size:13px;font-weight:600;text-align:right;">${value}</td>
      </tr>
    </table>`;
}

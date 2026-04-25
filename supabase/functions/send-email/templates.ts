// Signal email templates — sent from support@mindcast.co.nz via Resend
// Brand: Signal by Mindcast · signal.mindcast.co.nz
// Primary: #5C4A9E (purple) · Accent: #C4526E (rose) · BG: #FAF8F5 (cream)

const APP_URL = "https://signal.mindcast.co.nz";
const SUPPORT_EMAIL = "support@mindcast.co.nz";

const TIER_DETAILS: Record<string, { label: string; credits: number; tagline: string }> = {
  rooted:    { label: "Rooted",    credits: 30,  tagline: "Your first step into AI-guided wellness" },
  nourished: { label: "Nourished", credits: 150, tagline: "Daily guidance, deeper insights, real momentum" },
  thriving:  { label: "Thriving",  credits: 500, tagline: "Full access to everything Signal has to offer" },
};

// ─── Shared layout wrappers ────────────────────────────────────────────────

function header() {
  return `
    <tr>
      <td style="background:linear-gradient(135deg,#5C4A9E 0%,#7B5EA8 60%,#C4526E 100%);padding:44px 40px 36px;text-align:center;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:34px;font-weight:700;color:#ffffff;letter-spacing:3px;">Signal</div>
        <div style="color:rgba(255,255,255,0.55);font-size:11px;margin-top:6px;letter-spacing:0.15em;text-transform:uppercase;">by Mindcast · Tune Into Your Inner Self</div>
      </td>
    </tr>`;
}

function footer() {
  return `
    <tr>
      <td style="padding:32px 40px 40px;background:#FAF8F5;text-align:center;border-top:1px solid #EDE9E3;">
        <p style="color:#B0A898;font-size:11px;margin:0 0 6px;line-height:1.6;">
          Signal by Mindcast &nbsp;·&nbsp; <a href="mailto:${SUPPORT_EMAIL}" style="color:#5C4A9E;text-decoration:none;">${SUPPORT_EMAIL}</a>
        </p>
        <p style="color:#B0A898;font-size:11px;margin:0 0 12px;">
          <a href="${APP_URL}" style="color:#5C4A9E;text-decoration:none;">signal.mindcast.co.nz</a>
        </p>
        <p style="color:#C9C2B8;font-size:10px;margin:0;line-height:1.6;">
          You're receiving this because you have a Signal account.<br>
          To manage your subscription, visit your <a href="${APP_URL}/membership" style="color:#5C4A9E;text-decoration:none;">membership settings</a>.
        </p>
      </td>
    </tr>`;
}

function wrap(body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>Signal</title>
</head>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FAF8F5;min-height:100vh;">
    <tr>
      <td align="center" style="padding:32px 16px 48px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
          style="max-width:600px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(92,74,158,0.08);">
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

function ctaButton(text: string, url: string) {
  return `<a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#5C4A9E,#7B5EA8);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:50px;letter-spacing:0.03em;">${text}</a>`;
}

function divider() {
  return `<tr><td style="padding:0 40px;"><div style="height:1px;background:#EDE9E3;"></div></td></tr>`;
}

// ─── 1. Welcome email (new signup) ────────────────────────────────────────

export function welcomeEmail(name?: string) {
  const greeting = name ? `Hi ${name},` : "Welcome to Signal,";
  const body = `
    <tr>
      <td style="padding:40px 40px 8px;">
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;color:#1A1523;margin:0 0 12px;line-height:1.2;">
          You're in. ✨
        </h1>
        <p style="color:#6B6070;font-size:15px;line-height:1.7;margin:0 0 24px;">${greeting}</p>
        <p style="color:#6B6070;font-size:15px;line-height:1.7;margin:0 0 24px;">
          Signal is your personal wellness companion — designed around <em>your</em> cycle, your body, and your life.
          We're so glad you're here.
        </p>
      </td>
    </tr>
    ${divider()}
    <tr>
      <td style="padding:32px 40px 8px;">
        <p style="color:#1A1523;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 20px;">What's waiting for you</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${featureRow("🌙", "Cycle Syncing", "Track your cycle and get personalised nutrition, movement, and mood insights for every phase.")}
          ${featureRow("✍️", "AI Journal", "Write, reflect, and process — your entries stay private and safe in your Memory Vault.")}
          ${featureRow("🥗", "Nutrition Guidance", "Meal plans, plant diversity tracking, and fridge-to-recipe magic.")}
          ${featureRow("🧘", "Mindfulness & Movement", "Workouts, breathwork, and nervous system tools tailored to where you are today.")}
          ${featureRow("💞", "Connect Course", "A relationship course built on Gottman and attachment science — do it solo or with your partner.")}
        </table>
      </td>
    </tr>
    ${divider()}
    <tr>
      <td style="padding:36px 40px 40px;text-align:center;">
        <p style="color:#6B6070;font-size:14px;margin:0 0 24px;">Ready to tune in?</p>
        ${ctaButton("Open Signal", APP_URL)}
        <p style="color:#B0A898;font-size:12px;margin:24px 0 0;">
          Questions? Reply to this email or reach us at <a href="mailto:${SUPPORT_EMAIL}" style="color:#5C4A9E;text-decoration:none;">${SUPPORT_EMAIL}</a>
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
      <td style="padding:40px 40px 8px;">
        <div style="display:inline-block;background:rgba(92,74,158,0.08);border-radius:50px;padding:6px 16px;margin-bottom:20px;">
          <span style="color:#5C4A9E;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${t.label} Plan</span>
        </div>
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;color:#1A1523;margin:0 0 12px;line-height:1.2;">
          Your subscription is live 🎉
        </h1>
        <p style="color:#6B6070;font-size:15px;line-height:1.7;margin:0 0 8px;">${greeting}</p>
        <p style="color:#6B6070;font-size:15px;line-height:1.7;margin:0 0 24px;">
          Your <strong style="color:#1A1523;">${t.label}</strong> plan is now active. ${t.tagline}.
        </p>
      </td>
    </tr>
    ${divider()}
    <tr>
      <td style="padding:32px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F5;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 20px;">
              <p style="color:#1A1523;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 20px;">Your plan includes</p>
              ${creditRow(t.credits)}
              ${planFeatureRow("✓", "All AI-guided tools — journal, cycle, nutrition, movement")}
              ${planFeatureRow("✓", "Memory Vault — your private reflections, saved forever")}
              ${planFeatureRow("✓", "Parenting & relationship courses with interactive lessons")}
              ${planFeatureRow("✓", "Cancel or change your plan anytime")}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 40px 40px;text-align:center;">
        ${ctaButton("Start exploring Signal", APP_URL)}
        <p style="color:#B0A898;font-size:12px;margin:20px 0 0;">
          Manage your billing anytime at <a href="${APP_URL}/membership" style="color:#5C4A9E;text-decoration:none;">signal.mindcast.co.nz/membership</a>
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
      <td style="padding:40px 40px 8px;">
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;color:#1A1523;margin:0 0 12px;line-height:1.2;">
          Credits topped up ⚡
        </h1>
        <p style="color:#6B6070;font-size:15px;line-height:1.7;margin:0 0 24px;">${greeting}</p>
        <p style="color:#6B6070;font-size:15px;line-height:1.7;margin:0 0 24px;">
          <strong style="color:#1A1523;">50 AI credits</strong> have been added to your account. They're ready to use right now.
        </p>
      </td>
    </tr>
    ${divider()}
    <tr>
      <td style="padding:32px 40px;">
        <p style="color:#6B6070;font-size:14px;line-height:1.7;margin:0 0 16px;">Your credits power everything AI in Signal — from journal insights and cycle guidance to meal planning and mindfulness scripts.</p>
        <p style="color:#6B6070;font-size:14px;line-height:1.7;margin:0;">Need a regular supply? Upgrade your plan for a monthly credit refresh at a better rate.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 40px 40px;text-align:center;">
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
      <td style="padding:40px 40px 8px;">
        <div style="display:inline-block;background:rgba(92,74,158,0.08);border-radius:50px;padding:6px 16px;margin-bottom:20px;">
          <span style="color:#5C4A9E;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${t.label} Plan · Renewed</span>
        </div>
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;color:#1A1523;margin:0 0 12px;line-height:1.2;">
          Your subscription has renewed 🔄
        </h1>
        <p style="color:#6B6070;font-size:15px;line-height:1.7;margin:0 0 24px;">${greeting}</p>
        <p style="color:#6B6070;font-size:15px;line-height:1.7;margin:0 0 24px;">
          Your <strong style="color:#1A1523;">${t.label}</strong> plan has renewed and your <strong style="color:#5C4A9E;">${t.credits} AI credits</strong> have been refreshed for the month ahead.
        </p>
      </td>
    </tr>
    ${divider()}
    <tr>
      <td style="padding:32px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F5;border-radius:16px;">
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
      <td style="padding:24px 40px 40px;text-align:center;">
        ${ctaButton("Open Signal", APP_URL)}
        <p style="color:#B0A898;font-size:12px;margin:20px 0 0;">
          Manage your plan at <a href="${APP_URL}/membership" style="color:#5C4A9E;text-decoration:none;">Membership Settings</a>
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
      <td style="padding:40px 40px 8px;">
        <div style="display:inline-block;background:${isUpgrade ? "rgba(92,74,158,0.08)" : "rgba(196,82,110,0.08)"};border-radius:50px;padding:6px 16px;margin-bottom:20px;">
          <span style="color:${isUpgrade ? "#5C4A9E" : "#C4526E"};font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${isUpgrade ? "Plan Upgraded" : "Plan Changed"}</span>
        </div>
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;color:#1A1523;margin:0 0 12px;line-height:1.2;">
          ${isUpgrade ? "You've upgraded 🚀" : "Your plan has changed"}
        </h1>
        <p style="color:#6B6070;font-size:15px;line-height:1.7;margin:0 0 24px;">${greeting}</p>
        <p style="color:#6B6070;font-size:15px;line-height:1.7;margin:0 0 24px;">
          Your Signal plan has moved from <strong>${oldT.label}</strong> to <strong style="color:#5C4A9E;">${t.label}</strong>.
          ${isUpgrade ? "Enjoy your expanded access!" : "Your updated plan takes effect immediately."}
        </p>
      </td>
    </tr>
    ${divider()}
    <tr>
      <td style="padding:32px 40px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F5;border-radius:16px;">
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
      <td style="padding:24px 40px 40px;text-align:center;">
        ${ctaButton("Open Signal", APP_URL)}
        <p style="color:#B0A898;font-size:12px;margin:20px 0 0;">
          Manage your plan at <a href="${APP_URL}/membership" style="color:#5C4A9E;text-decoration:none;">Membership Settings</a>
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
      <td style="padding:40px 40px 8px;">
        <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;color:#1A1523;margin:0 0 12px;line-height:1.2;">
          Your subscription has been cancelled
        </h1>
        <p style="color:#6B6070;font-size:15px;line-height:1.7;margin:0 0 24px;">${greeting}</p>
        <p style="color:#6B6070;font-size:15px;line-height:1.7;margin:0 0 24px;">
          Your <strong>${t.label}</strong> subscription has been cancelled. You'll still have full access to Signal until <strong style="color:#1A1523;">${endDate}</strong>.
        </p>
      </td>
    </tr>
    ${divider()}
    <tr>
      <td style="padding:32px 40px;">
        <p style="color:#1A1523;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;margin:0 0 16px;">What happens next</p>
        ${planFeatureRow("·", `Access continues until ${endDate}`)}
        ${planFeatureRow("·", "Your journal entries and Memory Vault remain safe")}
        ${planFeatureRow("·", "Your progress on courses is saved")}
        ${planFeatureRow("·", "You can resubscribe at any time")}
      </td>
    </tr>
    ${divider()}
    <tr>
      <td style="padding:32px 40px 40px;">
        <p style="color:#6B6070;font-size:14px;line-height:1.7;margin:0 0 24px;">
          Changed your mind? We'd love to have you back. Your data is still here whenever you're ready.
        </p>
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding-right:12px;">
              ${ctaButton("Resubscribe", `${APP_URL}/membership`)}
            </td>
          </tr>
        </table>
        <p style="color:#B0A898;font-size:12px;margin:20px 0 0;">
          If you have feedback on why you cancelled, we'd genuinely love to hear it — reply to this email or write to <a href="mailto:${SUPPORT_EMAIL}" style="color:#5C4A9E;text-decoration:none;">${SUPPORT_EMAIL}</a>
        </p>
      </td>
    </tr>`;

  return {
    subject: `Your Signal subscription has been cancelled`,
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
            <td style="padding-left:8px;vertical-align:top;">
              <p style="color:#1A1523;font-size:14px;font-weight:600;margin:0 0 2px;">${title}</p>
              <p style="color:#8A8090;font-size:13px;margin:0;line-height:1.5;">${desc}</p>
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
        <td style="width:20px;color:#5C4A9E;font-weight:700;font-size:14px;vertical-align:top;">${check}</td>
        <td style="color:#6B6070;font-size:14px;line-height:1.5;padding-left:8px;">${text}</td>
      </tr>
    </table>`;
}

function creditRow(credits: number) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr>
        <td style="background:linear-gradient(135deg,#5C4A9E,#7B5EA8);border-radius:12px;padding:16px 20px;">
          <p style="color:rgba(255,255,255,0.7);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 4px;">Monthly AI Credits</p>
          <p style="color:#ffffff;font-size:28px;font-weight:700;margin:0;line-height:1;">${credits} <span style="font-size:14px;opacity:0.7;font-weight:400;">credits / month</span></p>
        </td>
      </tr>
    </table>`;
}

function renewalDetailRow(label: string, value: string) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
      <tr>
        <td style="color:#8A8090;font-size:13px;width:50%;">${label}</td>
        <td style="color:#1A1523;font-size:13px;font-weight:600;text-align:right;">${value}</td>
      </tr>
    </table>`;
}

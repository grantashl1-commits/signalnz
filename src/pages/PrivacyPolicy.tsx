import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-muted">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Privacy Policy</h1>
      </div>

      <article className="max-w-2xl mx-auto px-5 py-8 prose prose-sm text-muted-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_strong]:text-foreground">
        <p className="text-xs text-muted-foreground/60">Last updated: 12 April 2026</p>

        <h2>1. Who We Are</h2>
        <p>
          Signal is operated by <strong>Signal by Mindcast</strong>, based in New Zealand.
          Contact: <a href="mailto:hello@mindcast.co.nz" className="text-primary underline">hello@mindcast.co.nz</a>
        </p>

        <h2>2. Information We Collect</h2>
        <h3>Account information</h3>
        <p>Email address, display name, and optional profile details (date of birth, suburb, profession).</p>

        <h3>Health & wellness data</h3>
        <p>
          Cycle tracking data, mood logs, journal entries, workout logs, sleep data, body measurements, and
          nutrition preferences. This data is collected only when you actively log it.
        </p>

        <h3>Usage data</h3>
        <p>Feature usage patterns, AI credit consumption, and session information to improve the App.</p>

        <h3>Payment data</h3>
        <p>
          Payments are processed by <strong>Stripe</strong>. We do not store your full card details —
          Stripe handles this securely under PCI-DSS compliance.
        </p>

        <h2>3. How We Use Your Data</h2>
        <ul>
          <li>Provide personalised cycle, nutrition, movement, and wellness insights</li>
          <li>Generate AI-powered coaching responses and plans</li>
          <li>Process membership payments</li>
          <li>Improve and maintain the App</li>
          <li>Send essential account communications</li>
        </ul>

        <h2>4. Data Storage & Security</h2>
        <p>
          Your data is stored securely using cloud infrastructure with encryption at rest and in transit.
          We use industry-standard security practices to protect your information.
        </p>

        <h2>5. Data Sharing</h2>
        <p>We do <strong>not</strong> sell your personal data. We share data only with:</p>
        <ul>
          <li><strong>Stripe</strong> — for payment processing</li>
          <li><strong>AI providers</strong> — anonymised/pseudonymised data for generating insights (never raw journal content)</li>
          <li><strong>Legal requirements</strong> — if required by New Zealand law</li>
        </ul>

        <h2>6. Community Features</h2>
        <p>
          Posts and comments shared in community features are visible to other members.
          Anonymous posting is available. You can delete your own posts at any time.
        </p>

        <h2>7. Your Rights (NZ Privacy Act 2020)</h2>
        <p>Under New Zealand law you have the right to:</p>
        <ul>
          <li>Access your personal information</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your account and data</li>
        </ul>
        <p>
          To exercise these rights, email{" "}
          <a href="mailto:hello@mindcast.co.nz" className="text-primary underline">hello@mindcast.co.nz</a>.
        </p>

        <h2>8. Cookies & Local Storage</h2>
        <p>
          Signal uses browser local storage and cookies for authentication and preferences.
          We do not use third-party tracking cookies.
        </p>

        <h2>9. Children's Privacy</h2>
        <p>
          Signal is designed for adults (18+). We do not knowingly collect data from children under 18.
        </p>

        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy periodically. Material changes will be communicated via the App.
        </p>

        <h2>11. Contact</h2>
        <p>
          Privacy concerns? Contact us at{" "}
          <a href="mailto:hello@mindcast.co.nz" className="text-primary underline">hello@mindcast.co.nz</a>.
        </p>
      </article>
    </div>
  );
};

export default PrivacyPolicy;

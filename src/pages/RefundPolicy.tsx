import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RefundPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-muted">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Refund & Cancellation Policy</h1>
      </div>

      <article className="max-w-2xl mx-auto px-5 py-8 prose prose-sm text-muted-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_strong]:text-foreground">
        <p className="text-xs text-muted-foreground/60">Last updated: 12 April 2026</p>

        <h2>1. Free Tier</h2>
        <p>
          The Free tier requires no payment. You can use it indefinitely with no obligation.
        </p>

        <h2>2. Paid Subscriptions</h2>
        <p>
          Signal offers three paid membership tiers: <strong>Rooted</strong>, <strong>Nourished</strong>,
          and <strong>Thriving</strong>. Subscriptions are billed monthly or annually through Stripe.
        </p>

        <h2>3. Cancellation</h2>
        <p>
          You may cancel your subscription at any time from your Account page. Upon cancellation:
        </p>
        <ul>
          <li>You retain access to your paid tier until the end of your current billing period</li>
          <li>Your account will revert to the Free tier after the billing period ends</li>
          <li>Your data (journal entries, logs, etc.) is preserved</li>
        </ul>

        <h2>4. Refunds</h2>
        <p>
          Because Signal provides immediate access to digital content upon subscription, refunds are generally
          not provided. However, we will consider refunds in the following circumstances:
        </p>
        <ul>
          <li><strong>Accidental purchase</strong> — requested within 48 hours of payment</li>
          <li><strong>Technical issues</strong> — if the App was significantly unavailable during your billing period</li>
          <li><strong>Duplicate charges</strong> — billing errors on our end</li>
        </ul>

        <h2>5. How to Request a Refund</h2>
        <p>
          Email <a href="mailto:hello@mindcast.co.nz" className="text-primary underline">hello@mindcast.co.nz</a> with
          your account email and reason for the refund request. We aim to respond within 2 business days.
        </p>

        <h2>6. Promotional & Discount Codes</h2>
        <p>
          Subscriptions activated with promotional or discount codes are subject to the same cancellation terms.
          Promotional pricing applies for the specified duration only.
        </p>

        <h2>7. Changes</h2>
        <p>
          We may update this policy. Material changes will be communicated via the App or email.
        </p>

        <h2>8. Contact</h2>
        <p>
          Questions? Reach us at{" "}
          <a href="mailto:hello@mindcast.co.nz" className="text-primary underline">hello@mindcast.co.nz</a>{" "}
          or call <a href="tel:+6402041728392" className="text-primary underline">020 4172 8392</a>.
        </p>
      </article>
    </div>
  );
};

export default RefundPolicy;

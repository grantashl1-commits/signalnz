import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-muted">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Terms & Conditions</h1>
      </div>

      <article className="max-w-2xl mx-auto px-5 py-8 prose prose-sm text-muted-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_strong]:text-foreground">
        <p className="text-xs text-muted-foreground/60">Last updated: 12 April 2026</p>

        <h2>1. About Signal</h2>
        <p>
          Signal ("the App") is operated by <strong>Signal by Mindcast</strong>, a New Zealand–based wellness platform.
          By creating an account or using the App you agree to these Terms & Conditions.
        </p>

        <h2>2. Health & Wellness Disclaimer</h2>
        <p>
          <strong>Signal is not a medical service.</strong> All content — including cycle tracking, nutrition plans, movement
          programs, breathwork guides, and AI-generated insights — is provided for <em>informational and educational purposes only</em>.
          It does not constitute medical advice, diagnosis, or treatment.
        </p>
        <p>
          Always consult a qualified healthcare professional before starting any new exercise, diet, or wellness programme,
          especially if you are pregnant, nursing, have a medical condition, or are taking medication.
        </p>

        <h2>3. Accounts</h2>
        <p>
          You must provide accurate information when creating an account. You are responsible for maintaining the security
          of your login credentials and for all activity under your account.
        </p>

        <h2>4. Membership & Subscriptions</h2>
        <p>
          Signal offers free and paid membership tiers (Rooted, Nourished, Thriving). Paid subscriptions are billed
          through Stripe. By subscribing you authorise recurring charges at the rate displayed at checkout.
        </p>
        <p>
          See our <a href="/refund-policy" className="text-primary underline">Refund & Cancellation Policy</a> for details
          on cancellations, downgrades, and refunds.
        </p>

        <h2>5. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the App for any unlawful purpose</li>
          <li>Post harmful, abusive, or misleading content in community features</li>
          <li>Attempt to reverse-engineer, scrape, or exploit the App</li>
          <li>Share your account credentials with others</li>
        </ul>

        <h2>6. Intellectual Property</h2>
        <p>
          All content, design, and software within Signal are owned by Signal by Mindcast or its licensors.
          You may not reproduce, redistribute, or create derivative works without written permission.
        </p>

        <h2>7. User Content</h2>
        <p>
          Content you create (journal entries, community posts, dream boards) remains yours. By posting publicly
          in community features you grant Signal a non-exclusive licence to display that content within the App.
        </p>

        <h2>8. AI Features</h2>
        <p>
          Signal uses AI to generate personalised insights, meal plans, and coaching responses. AI-generated content
          may contain inaccuracies and should not be relied upon as professional advice. You use AI features at your own discretion.
        </p>

        <h2>9. Privacy</h2>
        <p>
          Your use of Signal is also governed by our <a href="/privacy-policy" className="text-primary underline">Privacy Policy</a>.
        </p>

        <h2>10. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by New Zealand law, Signal by Mindcast shall not be liable for any indirect,
          incidental, or consequential damages arising from your use of the App or reliance on its content.
        </p>

        <h2>11. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of the App after changes constitutes acceptance
          of the revised Terms.
        </p>

        <h2>12. Governing Law</h2>
        <p>
          These Terms are governed by the laws of New Zealand. Any disputes will be subject to the exclusive
          jurisdiction of the New Zealand courts.
        </p>

        <h2>13. Contact</h2>
        <p>
          Questions about these Terms? Contact us at{" "}
          <a href="mailto:hello@mindcast.co.nz" className="text-primary underline">hello@mindcast.co.nz</a>.
        </p>
      </article>
    </div>
  );
};

export default Terms;

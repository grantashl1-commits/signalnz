import { ArrowLeft, Mail, Phone, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-muted">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Contact & Support</h1>
      </div>

      <div className="max-w-md mx-auto px-5 py-10 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">We'd love to hear from you</h2>
          <p className="text-sm text-muted-foreground">
            Whether you have a question, feedback, or need support — reach out anytime.
          </p>
        </div>

        <div className="space-y-4">
          <a
            href="mailto:hello@mindcast.co.nz"
            className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
          >
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Email</p>
              <p className="text-sm text-muted-foreground">hello@mindcast.co.nz</p>
            </div>
          </a>

          <a
            href="tel:+6402041728392"
            className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors"
          >
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Phone</p>
              <p className="text-sm text-muted-foreground">020 4172 8392</p>
            </div>
          </a>

          <button
            onClick={() => navigate("/feedback")}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors text-left"
          >
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">In-App Feedback</p>
              <p className="text-sm text-muted-foreground">Submit a bug report or feature request</p>
            </div>
          </button>
        </div>

        <div className="pt-4 border-t border-border space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Quick Links</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Terms & Conditions", path: "/terms" },
              { label: "Privacy Policy", path: "/privacy-policy" },
              { label: "Refund Policy", path: "/refund-policy" },
              { label: "Membership", path: "/membership" },
            ].map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 pt-4">
          Signal by Mindcast · New Zealand
        </p>
      </div>
    </div>
  );
};

export default Contact;

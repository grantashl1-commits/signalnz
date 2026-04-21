import "./instrument"; // ← Sentry MUST init before everything else

import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import { initPostHog } from "./lib/analytics";
import App from "./App.tsx";
import "./index.css";

// Initialize PostHog analytics
initPostHog();

const ErrorFallback = ({ error, resetError }: { error: unknown; resetError: () => void }) => {
  const message = error instanceof Error ? error.message : String(error ?? "Unknown error");
  const stack = error instanceof Error ? error.stack : undefined;

  const handleReload = () => {
    try {
      // Clear potentially corrupt local state, but keep auth session
      const authKey = Object.keys(localStorage).find(k => k.startsWith("sb-") && k.endsWith("-auth-token"));
      const authValue = authKey ? localStorage.getItem(authKey) : null;
      // Clear caches that often cause boot crashes after schema/code changes
      ["signal_meal_plan", "signal_training_plan", "signal_dream_board_cache"].forEach(k => localStorage.removeItem(k));
      if (authKey && authValue) localStorage.setItem(authKey, authValue);
    } catch {}
    resetError();
    window.location.href = "/";
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      backgroundColor: "#F5F0EC",
      fontFamily: "system-ui, -apple-system, sans-serif",
      color: "#3C2E2A",
      textAlign: "center",
    }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Something went wrong</h1>
      <p style={{ fontSize: 14, opacity: 0.7, maxWidth: 320, marginBottom: 20 }}>
        The app hit an unexpected error. Tap below to reload — your data is safe.
      </p>
      <button
        onClick={handleReload}
        style={{
          padding: "12px 24px",
          borderRadius: 999,
          backgroundColor: "#7f5b87",
          color: "#fff",
          fontSize: 15,
          fontWeight: 600,
          border: "none",
          minHeight: 44,
          cursor: "pointer",
        }}
      >
        Reload app
      </button>
      <details style={{ marginTop: 24, maxWidth: 320, fontSize: 11, opacity: 0.5 }}>
        <summary style={{ cursor: "pointer" }}>Error details</summary>
        <pre style={{
          textAlign: "left",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          marginTop: 8,
          padding: 8,
          backgroundColor: "rgba(0,0,0,0.04)",
          borderRadius: 6,
        }}>{message}{stack ? `\n\n${stack}` : ""}</pre>
      </details>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary
    fallback={({ error, resetError }) => <ErrorFallback error={error} resetError={resetError} />}
  >
    <App />
  </Sentry.ErrorBoundary>
);

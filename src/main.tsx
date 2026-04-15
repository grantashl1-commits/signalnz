import "./instrument"; // ← Sentry MUST init before everything else

import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import { initPostHog } from "./lib/analytics";
import App from "./App.tsx";
import "./index.css";

// Initialize PostHog analytics
initPostHog();

createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary fallback={<p>Something went wrong</p>}>
    <App />
  </Sentry.ErrorBoundary>
);

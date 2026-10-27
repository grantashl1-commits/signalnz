import { createRoot } from "react-dom/client";
import { initPostHog } from "./lib/analytics";
import App from "./App.tsx";
import AppErrorBoundary from "./components/AppErrorBoundary";
import "./index.css";

// Initialize PostHog analytics
initPostHog();

createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);

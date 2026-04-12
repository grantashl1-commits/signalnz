import { createRoot } from "react-dom/client";
import { initPostHog } from "./lib/analytics";
import { initSentry } from "./lib/error-monitoring";
import App from "./App.tsx";
import "./index.css";

// Initialize observability before rendering
initSentry();
initPostHog();

createRoot(document.getElementById("root")!).render(<App />);

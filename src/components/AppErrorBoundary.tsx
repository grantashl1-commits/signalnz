import { Component, type ErrorInfo, type ReactNode } from "react";
import CrashScreen from "@/components/CrashScreen";
import { reportError } from "@/lib/error-monitoring";

/** Catches a render error anywhere in the app and offers a way back. */
export default class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, { componentStack: info.componentStack });
  }

  render() {
    return this.state.failed ? <CrashScreen resetError={() => this.setState({ failed: false })} /> : this.props.children;
  }
}

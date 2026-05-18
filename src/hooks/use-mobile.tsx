import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

// Haptic feedback utility — uses native Capacitor Haptics when running
// in the iOS/Android shell, falls back to navigator.vibrate on web.
export type HapticType = "light" | "medium" | "heavy" | "success" | "warning" | "error" | "selection";

export function haptic(type: HapticType = "light") {
  // Native path (Capacitor)
  try {
    const cap = (window as any).Capacitor;
    if (cap?.isNativePlatform?.()) {
      import("@capacitor/haptics")
        .then(({ Haptics, ImpactStyle, NotificationType }) => {
          switch (type) {
            case "light":
              Haptics.impact({ style: ImpactStyle.Light });
              break;
            case "medium":
              Haptics.impact({ style: ImpactStyle.Medium });
              break;
            case "heavy":
              Haptics.impact({ style: ImpactStyle.Heavy });
              break;
            case "success":
              Haptics.notification({ type: NotificationType.Success });
              break;
            case "warning":
              Haptics.notification({ type: NotificationType.Warning });
              break;
            case "error":
              Haptics.notification({ type: NotificationType.Error });
              break;
            case "selection":
              Haptics.selectionStart().then(() => Haptics.selectionEnd());
              break;
          }
        })
        .catch(() => {});
      return;
    }
  } catch {
    /* ignore — fall through to web */
  }

  // Web fallback
  if (!("vibrate" in navigator)) return;
  switch (type) {
    case "light":
    case "selection":
      navigator.vibrate(8);
      break;
    case "medium":
      navigator.vibrate(20);
      break;
    case "heavy":
      navigator.vibrate(35);
      break;
    case "success":
      navigator.vibrate([10, 50, 10]);
      break;
    case "warning":
      navigator.vibrate([15, 60, 15, 60]);
      break;
    case "error":
      navigator.vibrate([40, 60, 40]);
      break;
  }
}

// Keyboard visibility hook
export function useKeyboardVisible() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const onResize = () => {
      // If viewport height is significantly less than window height, keyboard is open
      setVisible(vv.height < window.innerHeight * 0.75);
    };

    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, []);

  return visible;
}

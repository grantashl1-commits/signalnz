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

// Haptic feedback utility
export function haptic(type: "light" | "medium" | "success" = "light") {
  if (!("vibrate" in navigator)) return;
  switch (type) {
    case "light":
      navigator.vibrate(8);
      break;
    case "medium":
      navigator.vibrate(20);
      break;
    case "success":
      navigator.vibrate([10, 50, 10]);
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

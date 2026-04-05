import { useEffect } from "react";

export function useAndroidBack(onBack: () => boolean | void) {
  useEffect(() => {
    const handler = (e: PopStateEvent) => {
      const handled = onBack();
      if (handled) {
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handler);

    return () => {
      window.removeEventListener("popstate", handler);
    };
  }, [onBack]);
}

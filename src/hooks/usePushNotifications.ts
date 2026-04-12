import { useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

/**
 * Registers the device for push notifications via Capacitor.
 * On native: requests permission, gets FCM token, stores in push_tokens table.
 * On web: no-op (web push not implemented yet).
 */
export function usePushNotifications() {
  const { user } = useAuth();

  const registerToken = useCallback(
    async (token: string, platform: "android" | "ios") => {
      if (!user) return;

      // Upsert: if token already exists for this user, just ensure it's active
      const { error } = await supabase.from("push_tokens").upsert(
        {
          user_id: user.id,
          token,
          platform,
          active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,token" }
      );

      if (error) console.error("[Push] Failed to register token:", error.message);
      else console.log("[Push] Token registered for", platform);
    },
    [user]
  );

  useEffect(() => {
    if (!user) return;

    // Only run on native Capacitor
    const isNative =
      typeof (window as any).Capacitor !== "undefined" &&
      (window as any).Capacitor.isNativePlatform?.();
    if (!isNative) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        const { PushNotifications } = await import("@capacitor/push-notifications");

        // Request permission
        const permResult = await PushNotifications.requestPermissions();
        if (permResult.receive !== "granted") {
          console.log("[Push] Permission not granted");
          return;
        }

        // Register with APNs / FCM
        await PushNotifications.register();

        // Listen for the token
        const regListener = await PushNotifications.addListener("registration", (token) => {
          const platform =
            (window as any).Capacitor.getPlatform?.() === "ios" ? "ios" : "android";
          registerToken(token.value, platform as "android" | "ios");
        });

        const errListener = await PushNotifications.addListener("registrationError", (err) => {
          console.error("[Push] Registration error:", err);
        });

        // Handle notification taps (foreground)
        const tapListener = await PushNotifications.addListener(
          "pushNotificationActionPerformed",
          (notification) => {
            const route = notification.notification?.data?.route;
            if (route && typeof window !== "undefined") {
              window.location.href = route;
            }
          }
        );

        cleanup = () => {
          regListener.remove();
          errListener.remove();
          tapListener.remove();
        };
      } catch (e) {
        // Capacitor plugin not available (web preview)
        console.log("[Push] Not available:", e);
      }
    })();

    return () => cleanup?.();
  }, [user, registerToken]);
}

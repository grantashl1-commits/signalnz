import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import type { SuspensionInfo } from "@/hooks/useAccountStatus";

interface SuspensionBannerProps {
  suspension: SuspensionInfo;
}

/**
 * Shown at the top of Community when the current user has an active suspension.
 * Explains why they can't post and how to appeal. The DB also enforces this via RLS.
 */
export default function SuspensionBanner({ suspension }: SuspensionBannerProps) {
  const isPermanent = !suspension.expires_at;
  const expiresFormatted = suspension.expires_at
    ? new Date(suspension.expires_at).toLocaleDateString(undefined, {
        month: "short", day: "numeric", year: "numeric",
      })
    : null;

  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 mb-4">
      <div className="flex gap-3">
        <div className="p-2 rounded-full bg-destructive/10 h-fit flex-shrink-0">
          <ShieldAlert className="h-4 w-4 text-destructive" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-sm italic font-bold text-foreground mb-1">
            {suspension.scope === "all"
              ? "Your account is suspended"
              : "Your Community access is suspended"}
          </p>
          <p className="font-body text-xs text-muted-foreground leading-relaxed mb-2">
            {suspension.reason}
          </p>
          <p className="font-body text-[11px] text-muted-foreground">
            {isPermanent
              ? "This suspension is permanent."
              : `Active until ${expiresFormatted}.`}
            {" "}You can't post, message, or appear in Nearby until it's lifted.{" "}
            <Link to="/contact" className="text-primary underline">Contact us</Link> to appeal.
          </p>
        </div>
      </div>
    </div>
  );
}

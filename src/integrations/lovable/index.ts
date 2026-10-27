// Local OAuth shim — replaces the Lovable-generated helper.
//
// The original file imported @lovable.dev/cloud-auth-js, which brokers Google/
// Apple sign-in through Lovable's own service. That cannot work off Lovable, so
// this delegates to Supabase's native OAuth instead. The exported shape is
// unchanged so existing call sites keep working.

import { supabase } from "../supabase/client";
import type { Provider } from "@supabase/supabase-js";

/** Providers this app offers, narrowed from Supabase's Provider union. */
type OAuthProvider = Extract<Provider, "google" | "apple" | "azure">;

type SignInOptions = {
  redirect_uri?: string;
  extraParams?: Record<string, string>;
};

type SignInResult = {
  error?: Error;
  redirected?: boolean;
  url?: string;
};

export const lovable = {
  auth: {
    signInWithOAuth: async (
      provider: OAuthProvider,
      opts?: SignInOptions,
    ): Promise<SignInResult> => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: opts?.redirect_uri,
          queryParams: opts?.extraParams,
        },
      });

      if (error) return { error };

      // Supabase performs a full-page redirect to the provider.
      return { redirected: true, url: data?.url };
    },
  },
};

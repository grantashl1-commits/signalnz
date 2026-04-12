import { useState, useCallback, useRef } from "react";
import type { SignalResponse, SignalMode } from "./useSignalContext";
import type { SignalContext } from "./useSignalContext";
import { supabase } from "@/integrations/supabase/client";

interface UseSignalAIReturn {
  response: SignalResponse | null;
  loading: boolean;
  error: string | null;
  generate: (prompt: string, mode: SignalMode, context: SignalContext) => Promise<void>;
  reset: () => void;
  rawText: string;
}

async function getAuthUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function fetchInsightProfile(userId: string) {
  try {
    const { data } = await supabase
      .from("user_insight_profiles")
      .select("*")
      .eq("user_identifier", userId)
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}

async function fetchRecentSignals(userId: string) {
  try {
    const { data } = await supabase
      .from("signal_memory")
      .select("headline, theme, emotional_context, created_at")
      .eq("user_identifier", userId)
      .order("created_at", { ascending: false })
      .limit(5);
    return data || [];
  } catch {
    return [];
  }
}

async function saveSignalToMemory(userId: string, response: SignalResponse, prompt: string, mode: string) {
  try {
    await supabase.from("signal_memory").insert({
      user_identifier: userId,
      signal_text: response.interpretation || response.headline,
      headline: response.headline,
      theme: response.followUps?.[0] || null,
      emotional_context: response.interpretation?.slice(0, 200) || null,
      prompt,
      mode,
    });
  } catch {
    // Silent fail
  }
}

export function useSignalAI(): UseSignalAIReturn {
  const [response, setResponse] = useState<SignalResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawText, setRawText] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setResponse(null);
    setLoading(false);
    setError(null);
    setRawText("");
  }, []);

  const generate = useCallback(async (prompt: string, mode: SignalMode, context: SignalContext) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setResponse(null);
    setRawText("");

    const userId = await getAuthUserId();
    if (!userId) {
      setError("Please sign in to use Signal AI.");
      setLoading(false);
      return;
    }

    try {
      // Fetch profile + recent signals + AI call in parallel, with min 1.8s delay
      const [insightProfile, recentSignals] = await Promise.all([
        fetchInsightProfile(userId),
        fetchRecentSignals(userId),
      ]);

      const minDelay = new Promise((r) => setTimeout(r, 1800));

      const fetchCall = fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/signal-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            prompt,
            mode,
            context,
            userIdentifier: userId,
            insightProfile: insightProfile || undefined,
            recentSignals: recentSignals.length > 0 ? recentSignals : undefined,
          }),
          signal: controller.signal,
        }
      );

      const [resp] = await Promise.all([fetchCall, minDelay]);

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed: ${resp.status}`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setRawText(fullText);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setRawText(fullText);
            }
          } catch {}
        }
      }

      // Parse the complete JSON response
      let signal: SignalResponse;
      try {
        let cleanText = fullText.trim();
        if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
        }
        signal = JSON.parse(cleanText) as SignalResponse;
      } catch {
        signal = {
          headline: "Your signal",
          interpretation: fullText.trim(),
          leanInto: "",
          soften: "",
          action: "",
          practice: null,
          followUps: [],
        };
      }

      setResponse(signal);

      // Save to signal memory in background
      saveSignalToMemory(userId, signal, prompt, mode);
    } catch (e: any) {
      if (e.name === "AbortError") return;
      console.error("Signal AI error:", e);
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { response, loading, error, generate, reset, rawText };
}

import { useState, useCallback, useRef } from "react";
import type { SignalResponse, SignalMode } from "./useSignalContext";
import type { SignalContext } from "./useSignalContext";

interface UseSignalAIReturn {
  response: SignalResponse | null;
  loading: boolean;
  error: string | null;
  generate: (prompt: string, mode: SignalMode, context: SignalContext) => Promise<void>;
  reset: () => void;
  rawText: string;
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

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/signal-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ prompt, mode, context }),
          signal: controller.signal,
        }
      );

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
      try {
        // Strip markdown code fences if present
        let cleanText = fullText.trim();
        if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
        }
        const signal = JSON.parse(cleanText) as SignalResponse;
        setResponse(signal);
      } catch {
        // If parsing fails, create a simple response from raw text
        setResponse({
          headline: "Your signal",
          interpretation: fullText.trim(),
          leanInto: "",
          soften: "",
          action: "",
          practice: null,
          followUps: [],
        });
      }
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

import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AMAResponse {
  answer: string;
  insights: string[];
  recommendations: { type: string; name: string; reason: string }[];
  followUps: string[];
}

function getUserIdentifier(): string {
  let id = localStorage.getItem("signal_user_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("signal_user_id", id);
  }
  return id;
}

export function useAMASignal() {
  const { user } = useAuth();
  const [response, setResponse] = useState<AMAResponse | null>(null);
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

  const ask = useCallback(async (question: string, context: any) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    setResponse(null);
    setRawText("");

    const userId = getUserIdentifier();

    try {
      // Gather user data from database
      let userData: any = { cycleContext: context };

      if (user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile) {
          const p = profile as any;
          let age: number | null = null;
          if (p.date_of_birth) {
            age = Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
          }
          userData.profile = {
            age,
            cycleMode: p.cycle_mode,
            fitnessLevel: p.fitness_level,
            dietaryPreferences: p.dietary_preferences,
            dietaryDislikes: p.dietary_dislikes,
            weightKg: p.weight_kg,
            heightCm: p.height_cm,
            movementGoals: p.movement_goals,
          };
        }

        // Fetch recent journal entries
        const { data: journals } = await supabase
          .from("journal_entries")
          .select("date, mood, content, entry_type")
          .eq("user_id", user.id)
          .order("date", { ascending: false })
          .limit(5);
        if (journals) userData.recentJournalEntries = journals;

        // Fetch recent cycle logs
        const { data: cycleLogs } = await supabase
          .from("cycle_logs")
          .select("log_date, cycle_day, phase, mood, energy, symptoms")
          .eq("user_id", user.id)
          .order("log_date", { ascending: false })
          .limit(7);
        if (cycleLogs) userData.recentCycleLogs = cycleLogs;

        // Fetch active habits
        try {
          const raw = localStorage.getItem("signal_habits");
          if (raw) {
            const habits = JSON.parse(raw);
            userData.habits = habits.map((h: any) => h.name || h.id);
          }
        } catch {}

        // Fetch supplements from habits
        try {
          const raw = localStorage.getItem("signal_habits");
          if (raw) {
            const habits = JSON.parse(raw);
            userData.supplements = habits
              .filter((h: any) => h.category === "supplements")
              .map((h: any) => h.name || h.id);
          }
        } catch {}
      }

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/signal-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            prompt: question,
            mode: "ama",
            context,
            userIdentifier: userId,
            isAMA: true,
            userData,
          }),
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
      let amaResponse: AMAResponse;
      try {
        let cleanText = fullText.trim();
        if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
        }
        amaResponse = JSON.parse(cleanText) as AMAResponse;
      } catch {
        amaResponse = {
          answer: fullText.trim(),
          insights: [],
          recommendations: [],
          followUps: [],
        };
      }

      setResponse(amaResponse);
    } catch (e: any) {
      if (e.name === "AbortError") return;
      console.error("AMA AI error:", e);
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { response, loading, error, ask, reset, rawText };
}

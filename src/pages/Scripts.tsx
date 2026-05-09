import { useMemo, useState } from "react";
import { Upload, Search, CheckCircle2, Volume2, Trash2 } from "lucide-react";
import { AtmosphericHero, ContentSection } from "@/components/AtmosphericSection";
import SignalPulse from "@/components/SignalPulse";
import { BREATHWORK_PRACTICES } from "@/data/practices";
import { somaticScripts } from "@/data/somatic-scripts";
import {
  MEDITATION_SCRIPTS,
  READING_SCRIPTS,
  INNER_WORK_SCRIPTS,
  SLEEP_SCRIPTS,
  PHASE_SCRIPTS,
  type MeditationScript,
} from "@/data/meditation-scripts";
import { QUICK_PRACTICES, GROUNDING_PRACTICES, PRESENCE_PRACTICES } from "@/data/mindfulness-exercises";
import { GEN_MEDITATION_SCRIPTS, GEN_SLEEP_SCRIPTS, GEN_INNER_WORK_SCRIPTS } from "@/data/generated-mindfulness-scripts";
import { FASCIA_EXERCISES } from "@/data/fascia-release-exercises";
import { supabase } from "@/integrations/supabase/client";
import { haptic } from "@/hooks/use-mobile";
import { getScriptAudioOverrides, removeScriptAudioOverride, setScriptAudioOverride } from "@/lib/script-audio";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type ScriptItem = {
  id: string;
  title: string;
  category: string;
  durationLabel: string;
  script: string;
};

function formatDuration(seconds?: number) {
  if (!seconds) return "Short cue";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins} min`;
  return `${mins}m ${secs}s`;
}

function meditationItems(items: MeditationScript[], category: string): ScriptItem[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    category,
    durationLabel: formatDuration(item.durationSec),
    script: item.ttsScript,
  }));
}

export default function ScriptsPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [overrideUrls, setOverrideUrls] = useState<Record<string, string>>(() => getScriptAudioOverrides());

  const scriptItems = useMemo<ScriptItem[]>(() => {
    const practiceItems: ScriptItem[] = BREATHWORK_PRACTICES.map((item) => ({
      id: item.id,
      title: item.title,
      category: "Breathwork",
      durationLabel: formatDuration(item.durationSec),
      script: item.ttsScript || "",
    }));

    const somaticItems: ScriptItem[] = somaticScripts.map((item) => ({
      id: item.id,
      title: item.title,
      category: "Somatic",
      durationLabel: formatDuration(item.durationSec),
      script: item.ttsScript || item.narration,
    }));

    const fasciaItems: ScriptItem[] = FASCIA_EXERCISES.map((item) => ({
      id: `fascia-${item.id}`,
      title: `Morning Fascia Release · ${item.name}`,
      category: "Fascia cue",
      durationLabel: formatDuration(item.durationSec),
      script: item.ttsScript,
    }));

    return [
      ...practiceItems,
      ...somaticItems,
      ...fasciaItems,
      ...meditationItems(MEDITATION_SCRIPTS, "Meditation"),
      ...meditationItems(READING_SCRIPTS, "Reading"),
      ...meditationItems(INNER_WORK_SCRIPTS, "Inner Work"),
      ...meditationItems(SLEEP_SCRIPTS, "Sleep"),
      ...meditationItems(PHASE_SCRIPTS, "Phase Practice"),
      ...meditationItems(QUICK_PRACTICES, "Quick Practice"),
      ...meditationItems(GROUNDING_PRACTICES, "Grounding"),
      ...meditationItems(PRESENCE_PRACTICES, "Presence"),
      ...meditationItems(GEN_MEDITATION_SCRIPTS, "PDF Meditation"),
      ...meditationItems(GEN_SLEEP_SCRIPTS, "PDF Sleep"),
      ...meditationItems(GEN_INNER_WORK_SCRIPTS, "PDF Inner Work"),
    ].filter((item) => item.script.trim().length > 0);
  }, []);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return scriptItems;
    return scriptItems.filter((item) =>
      [item.title, item.category, item.script].some((value) => value.toLowerCase().includes(normalized))
    );
  }, [query, scriptItems]);

  const readFileAsBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const handleUpload = async (scriptId: string, file: File) => {
    if (!user) {
      toast.error("Come in first, then upload your recording.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error("That file is a little big — try a recording under 50 MB.");
      return;
    }

    setUploadingId(scriptId);

    try {
      const base64Data = await readFileAsBase64(file);
      const { data, error } = await supabase.functions.invoke("script-audio-upload", {
        body: {
          scriptId,
          fileName: file.name,
          contentType: file.type || "audio/mpeg",
          base64Data,
        },
      });

      if (error || !data?.audioUrl) {
        throw new Error(error?.message || "Upload failed");
      }

      setScriptAudioOverride(scriptId, data.audioUrl);
      setOverrideUrls((prev) => ({ ...prev, [scriptId]: data.audioUrl }));
      toast.success("Held. Your voice will guide this one now.");
    } catch (error: any) {
      toast.error(error.message || "The upload didn't land — try again in a moment.");
    } finally {
      setUploadingId(null);
    }
  };

  const clearOverride = (scriptId: string) => {
    haptic("light");
    removeScriptAudioOverride(scriptId);
    setOverrideUrls((prev) => {
      const next = { ...prev };
      delete next[scriptId];
      return next;
    });
  };

  return (
    <div>
      <AtmosphericHero size="md">
        <SignalPulse />
        <div className="text-center relative z-10 px-6">
          <p className="font-body text-xs uppercase tracking-[0.3em] text-primary-foreground/40 mb-4">Scripts</p>
          <h1 className="font-display text-[3rem] md:text-[4rem] font-extrabold text-primary-foreground leading-[1.02] mb-4">Reader Studio</h1>
          <p className="font-editorial text-base md:text-lg italic text-primary-foreground/60 max-w-2xl mx-auto">
            Read each script in your own voice, upload the audio, and the app will use your recording instead of generated narration.
          </p>
        </div>
      </AtmosphericHero>

      <ContentSection className="px-5 md:px-4 space-y-6">
        <div className="card-warm p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search scripts"
              className="w-full rounded-2xl border border-border bg-background pl-10 pr-4 py-3 font-body text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>
          <p className="font-body text-xs text-muted-foreground">
            Upload MP3, WAV, or M4A. Once uploaded, that script uses your recording on this device.
          </p>
        </div>

        <div className="space-y-3">
          {filteredItems.map((item) => {
            const hasOverride = !!overrideUrls[item.id];

            return (
              <div key={item.id} className="card-warm p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-body text-[11px] uppercase tracking-[0.2em] text-primary mb-1">{item.category}</p>
                    <h2 className="font-display text-lg italic text-foreground">{item.title}</h2>
                    <p className="font-body text-xs text-muted-foreground mt-1">{item.durationLabel}</p>
                  </div>
                  {hasOverride && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-body text-[11px] text-primary">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Custom audio
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className="font-body text-xs text-primary"
                >
                  {expandedId === item.id ? "Hide script" : "Show script"}
                </button>

                {expandedId === item.id && (
                  <div className="rounded-2xl bg-background/70 border border-border p-4 whitespace-pre-wrap font-body text-sm leading-relaxed text-foreground/80 max-h-72 overflow-y-auto">
                    {item.script}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 font-body text-sm font-medium text-primary-foreground cursor-pointer active:scale-[0.98] transition-transform">
                    <Upload className="h-4 w-4" />
                    {uploadingId === item.id ? "Uploading..." : "Upload audio"}
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      disabled={uploadingId === item.id}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        haptic("medium");
                        handleUpload(item.id, file);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>

                  {hasOverride && (
                    <>
                      <a
                        href={overrideUrls[item.id]}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 font-body text-sm text-foreground"
                      >
                        <Volume2 className="h-4 w-4" /> Listen
                      </a>
                      <button
                        onClick={() => clearOverride(item.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2.5 font-body text-sm text-muted-foreground"
                      >
                        <Trash2 className="h-4 w-4" /> Clear local override
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ContentSection>
    </div>
  );
}
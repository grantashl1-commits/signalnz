import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Sparkles, Image as ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const STYLE_OPTIONS = [
  { id: "dreamy-editorial", label: "Dreamy editorial" },
  { id: "soft-cinematic", label: "Soft cinematic" },
  { id: "warm-lifestyle", label: "Warm lifestyle" },
  { id: "feminine-wellness", label: "Feminine wellness" },
  { id: "minimal-aspirational", label: "Minimal aspirational" },
  { id: "magazine-moodboard", label: "Magazine moodboard" },
];

const EXAMPLE_PROMPTS = [
  "My dream home in nature",
  "A peaceful morning routine",
  "A creative studio filled with sunlight",
  "The version of me who feels confident and free",
  "My soft life",
  "The future I am building",
];

interface Props {
  open: boolean;
  onClose: () => void;
  onImageReady: (url: string, prompt?: string) => void;
}

export default function AddImageModal({ open, onClose, onImageReady }: Props) {
  const [tab, setTab] = useState<"upload" | "generate">("upload");
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("dreamy-editorial");
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onImageReady(url, file.name);
    onClose();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    onImageReady(url, file.name);
    onClose();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError(null);
    setGeneratedUrl(null);

    try {
      const stylePrompt = `${prompt}, ${style.replace(/-/g, " ")} photography style, beautiful, high quality`;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dream-image-generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ prompt: stylePrompt }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Image generation failed");
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      if (imageUrl) {
        setGeneratedUrl(imageUrl);
      } else {
        throw new Error("No image returned");
      }
    } catch (err: any) {
      console.error("Image generation error:", err);
      setError(err.message || "Failed to generate image");
    } finally {
      setGenerating(false);
    }
  };

  const handleUseGenerated = () => {
    if (generatedUrl) {
      onImageReady(generatedUrl, prompt);
      onClose();
      setGeneratedUrl(null);
      setPrompt("");
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h3 className="font-display text-lg italic text-foreground">Add Image</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-5 mb-4">
            <button
              onClick={() => setTab("upload")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-display text-sm italic transition-all ${tab === "upload" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
            >
              <Upload className="h-4 w-4" /> Upload
            </button>
            <button
              onClick={() => setTab("generate")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-display text-sm italic transition-all ${tab === "generate" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
            >
              <Sparkles className="h-4 w-4" /> Generate
            </button>
          </div>

          <div className="px-5 pb-5">
            {tab === "upload" && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => fileRef.current?.click()}
              >
                <ImageIcon className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-display text-sm italic text-foreground mb-1">Drop an image here</p>
                <p className="font-mono text-[11px] text-muted-foreground">or click to browse your device</p>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </div>
            )}

            {tab === "generate" && (
              <div className="space-y-4">
                {/* Prompt */}
                <div>
                  <label className="font-mono text-[11px] text-muted-foreground block mb-1.5">Describe your dream image</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="My dream home surrounded by nature..."
                    rows={3}
                    className="w-full font-display text-sm italic text-foreground bg-secondary/30 border border-border rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/40"
                    style={{ fontSize: "16px" }}
                  />
                </div>

                {/* Quick prompts */}
                <div className="flex flex-wrap gap-1.5">
                  {EXAMPLE_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPrompt(p)}
                      className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Style */}
                <div>
                  <label className="font-mono text-[11px] text-muted-foreground block mb-1.5">Style</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {STYLE_OPTIONS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setStyle(s.id)}
                        className={`font-mono text-[11px] px-3 py-2 rounded-xl border transition-all text-left ${style === s.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generated preview */}
                {generatedUrl && (
                  <div className="rounded-xl overflow-hidden border border-border">
                    <img src={generatedUrl} alt="Generated" className="w-full max-h-64 object-cover" />
                  </div>
                )}

                {error && (
                  <p className="font-mono text-[11px] text-destructive">{error}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {generatedUrl ? (
                    <>
                      <button onClick={handleGenerate} disabled={generating} className="flex-1 rounded-xl border border-border py-3 font-display text-sm italic text-muted-foreground hover:bg-secondary transition-colors disabled:opacity-50">
                        Regenerate
                      </button>
                      <button onClick={handleUseGenerated} className="flex-1 rounded-xl bg-primary py-3 font-display text-sm italic text-primary-foreground hover:opacity-90 transition-opacity">
                        Add to board
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleGenerate}
                      disabled={generating || !prompt.trim()}
                      className="w-full rounded-xl bg-primary py-3 font-display text-sm italic text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {generating ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
                      ) : (
                        <><Sparkles className="h-4 w-4" /> Generate image</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, Video, Upload, CheckCircle2 } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  type: "image_upload" | "video_upload";
  content: { prompt: string; maxSeconds?: number };
  onComplete: (response: any) => void;
}

export default function MediaUpload({ type, content, onComplete }: Props) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const isVideo = type === "video_upload";
  const accept = isVideo ? "video/*" : "image/*";

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    haptic("medium");
    const url = URL.createObjectURL(file);
    setPreview(url);

    if (user) {
      setUploading(true);
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage.from("connect-media").upload(path, file);
      setUploading(false);
      if (!error && data) {
        setUploaded(true);
        onComplete({ mediaPath: data.path, type: isVideo ? "video" : "image" });
        return;
      }
    }
    // Fallback: complete without cloud upload
    setUploaded(true);
    onComplete({ localPreview: true, type: isVideo ? "video" : "image" });
  };

  return (
    <div className="space-y-4">
      <p className="font-body text-sm text-foreground leading-relaxed">{content.prompt}</p>
      {content.maxSeconds && isVideo && (
        <p className="font-body text-xs text-muted-foreground">Max {content.maxSeconds} seconds</p>
      )}
      <input ref={inputRef} type="file" accept={accept} capture="environment" onChange={handleFile} className="hidden" />
      {!preview ? (
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => inputRef.current?.click()}
          className="w-full py-12 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center gap-3 hover:border-primary/50 transition-colors">
          {isVideo ? <Video className="h-8 w-8 text-primary/60" /> : <Camera className="h-8 w-8 text-primary/60" />}
          <span className="font-body text-sm text-primary/60">Tap to {isVideo ? "record or upload video" : "take photo or upload"}</span>
        </motion.button>
      ) : (
        <div className="space-y-3">
          {isVideo ? (
            <video src={preview} controls className="w-full rounded-2xl border border-border" />
          ) : (
            <img src={preview} alt="Upload" className="w-full rounded-2xl border border-border object-cover max-h-64" />
          )}
          {uploading && <p className="font-body text-xs text-muted-foreground text-center animate-pulse">Uploading...</p>}
          {uploaded && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 justify-center">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="font-body text-xs text-primary font-bold">Uploaded & saved</span>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

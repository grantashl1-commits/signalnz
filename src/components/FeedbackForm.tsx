import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Bug, MessageSquare, Lightbulb, Upload, X, Loader2, CheckCircle2, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const CATEGORIES = [
  { value: "bug", label: "Bug Report", icon: Bug, color: "text-destructive" },
  { value: "feedback", label: "General Feedback", icon: MessageSquare, color: "text-primary" },
  { value: "feature", label: "Feature Request", icon: Lightbulb, color: "text-amber-500" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
const MAX_FILES = 5;

interface FilePreview {
  file: File;
  url: string;
}

export default function FeedbackForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const { user } = useAuth();
  const { displayName } = useProfile();
  const fileRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState("feedback");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const userName = displayName || user?.user_metadata?.full_name || "";
  const userEmail = user?.email || "";

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const current = [...files];
    for (let i = 0; i < newFiles.length; i++) {
      if (current.length >= MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} files allowed`);
        break;
      }
      const f = newFiles[i];
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name} exceeds 10MB limit`);
        continue;
      }
      current.push({ file: f, url: URL.createObjectURL(f) });
    }
    setFiles(current);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[idx].url);
      next.splice(idx, 1);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Please describe your feedback");
      return;
    }

    setSubmitting(true);
    try {
      // Upload all files
      const uploadedUrls: string[] = [];
      for (const fp of files) {
        const ext = fp.file.name.split(".").pop() || "png";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("feedback-screenshots")
          .upload(path, fp.file, { contentType: fp.file.type });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage
          .from("feedback-screenshots")
          .getPublicUrl(path);
        uploadedUrls.push(urlData.publicUrl);
      }

      const subject = `[${category}] ${description.trim().slice(0, 80)}`;

      const { error } = await supabase.from("feedback").insert({
        user_id: user?.id ?? null,
        user_email: userEmail || null,
        category,
        subject: subject,
        description: description.trim(),
        screenshot_url: uploadedUrls[0] || null,
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Thank you! Your feedback has been submitted.");
      setTimeout(() => {
        setDescription("");
        setCategory("feedback");
        files.forEach((fp) => URL.revokeObjectURL(fp.url));
        setFiles([]);
        setSubmitted(false);
        onSubmitted?.();
      }, 2500);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-8 text-center"
          >
            <CheckCircle2 className="h-10 w-10 text-primary" />
            <p className="font-body text-foreground font-medium">Feedback received!</p>
            <p className="text-sm text-muted-foreground">We'll review it shortly.</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Auto-filled user info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input value={userName} disabled className="bg-muted/50 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Email</Label>
                <Input value={userEmail} disabled className="bg-muted/50 text-sm truncate" />
              </div>
            </div>

            {/* Timestamp */}
            <div className="text-[10px] text-muted-foreground/60 font-body">
              {format(new Date(), "dd MMM yyyy · h:mm a")}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="fb-category" className="text-xs">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="fb-category" className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <span className="flex items-center gap-2">
                        <c.icon className={`h-3.5 w-3.5 ${c.color}`} />
                        {c.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="fb-desc" className="text-xs">What's on your mind?</Label>
              <Textarea
                id="fb-desc"
                placeholder="Tell us what's working, what's not, or what you'd love to see…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                maxLength={2000}
              />
            </div>

            {/* File attachments */}
            <div className="space-y-2">
              <Label className="text-xs">Attachments</Label>
              <p className="text-[10px] text-muted-foreground/70">
                Screenshots help us understand the issue — attach up to {MAX_FILES} images or files (max 10MB each)
              </p>

              {files.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {files.map((fp, i) => (
                    <div key={i} className="relative group">
                      {fp.file.type.startsWith("image/") ? (
                        <img
                          src={fp.url}
                          alt={fp.file.name}
                          className="h-16 w-16 object-cover rounded-md border border-border"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-md border border-border flex flex-col items-center justify-center bg-muted/50">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <span className="text-[8px] text-muted-foreground truncate max-w-[56px] mt-1">
                            {fp.file.name.split(".").pop()}
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {files.length < MAX_FILES && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-lg py-4 flex flex-col items-center gap-1.5 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span className="text-xs font-body">Click to upload</span>
                </button>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx,.txt"
                multiple
                className="hidden"
                onChange={(e) => {
                  addFiles(e.target.files);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting…
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

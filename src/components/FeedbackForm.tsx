import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Bug, MessageSquare, Lightbulb, Upload, X, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { value: "bug", label: "Bug Report", icon: Bug, color: "text-destructive" },
  { value: "feedback", label: "General Feedback", icon: MessageSquare, color: "text-primary" },
  { value: "feature", label: "Feature Request", icon: Lightbulb, color: "text-amber-500" },
];

export default function FeedbackForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState("bug");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5MB");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const clearFile = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error("Please fill in subject and description");
      return;
    }

    setSubmitting(true);
    try {
      let screenshotUrl: string | null = null;

      if (file) {
        const ext = file.name.split(".").pop() || "png";
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("feedback-screenshots")
          .upload(path, file, { contentType: file.type });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage
          .from("feedback-screenshots")
          .getPublicUrl(path);
        screenshotUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("feedback").insert({
        user_id: user?.id ?? null,
        user_email: user?.email ?? null,
        category,
        subject: subject.trim(),
        description: description.trim(),
        screenshot_url: screenshotUrl,
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Thank you! Your feedback has been submitted.");
      setTimeout(() => {
        setSubject("");
        setDescription("");
        setCategory("bug");
        clearFile();
        setSubmitted(false);
        onSubmitted?.();
      }, 2000);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="font-display text-lg">Send Feedback</CardTitle>
        <CardDescription>Report a bug, suggest a feature, or share your thoughts.</CardDescription>
      </CardHeader>
      <CardContent>
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
              <div className="space-y-1.5">
                <Label htmlFor="fb-category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="fb-category">
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

              <div className="space-y-1.5">
                <Label htmlFor="fb-subject">Subject</Label>
                <Input
                  id="fb-subject"
                  placeholder="Brief summary of the issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={200}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fb-desc">Description</Label>
                <Textarea
                  id="fb-desc"
                  placeholder="Describe the issue or feedback in detail…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={2000}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Screenshot (optional)</Label>
                {preview ? (
                  <div className="relative rounded-lg overflow-hidden border border-border">
                    <img src={preview} alt="Screenshot preview" className="w-full max-h-48 object-cover" />
                    <button
                      type="button"
                      onClick={clearFile}
                      className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1 hover:bg-background transition-colors"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-lg py-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                  >
                    <Upload className="h-5 w-5" />
                    <span className="text-xs font-body">Click to upload (max 5MB)</span>
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
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
      </CardContent>
    </Card>
  );
}

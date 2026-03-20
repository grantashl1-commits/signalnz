import { useState } from "react";
import { Camera } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";

type PhotoView = "front" | "side" | "back";
type PhotoSet = { front?: string; side?: string; back?: string };

const SECTIONS = [
  { key: "start", label: "Starting point" },
  { key: "week4", label: "After 4 weeks" },
  { key: "week8", label: "After 8 weeks" },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

function loadPhotos(): Record<SectionKey, PhotoSet> {
  const result: Record<string, PhotoSet> = {};
  for (const s of SECTIONS) {
    const set: PhotoSet = {};
    for (const view of ["front", "side", "back"] as PhotoView[]) {
      const stored = localStorage.getItem(`progressPhoto:${s.key}:${view}`);
      if (stored) set[view] = stored;
    }
    result[s.key] = set;
  }
  return result as Record<SectionKey, PhotoSet>;
}

export default function ProgressTab() {
  const [photos, setPhotos] = useState<Record<SectionKey, PhotoSet>>(loadPhotos);

  const handlePhotoUpload = (section: SectionKey, view: PhotoView, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    haptic("light");
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      localStorage.setItem(`progressPhoto:${section}:${view}`, dataUrl);
      setPhotos(prev => ({
        ...prev,
        [section]: { ...prev[section], [view]: dataUrl },
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {SECTIONS.map(section => (
        <div key={section.key} className="space-y-2">
          <h3 className="font-hand text-sm font-bold text-foreground">{section.label}</h3>
          <div className="grid grid-cols-3 gap-3">
            {(["front", "side", "back"] as const).map(view => (
              <label key={view} className="cursor-pointer">
                <div className="aspect-[7/9] rounded-2xl border-2 border-dashed border-border/40 flex flex-col items-center justify-center bg-secondary/30 overflow-hidden relative">
                  {photos[section.key]?.[view] ? (
                    <img src={photos[section.key][view]} alt={view} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Camera className="h-5 w-5 text-muted-foreground/40 mb-1" />
                      <span className="font-hand text-[10px] text-muted-foreground capitalize">{view}</span>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handlePhotoUpload(section.key, view, e)} />
              </label>
            ))}
          </div>
        </div>
      ))}
      <p className="font-body text-[10px] italic text-muted-foreground text-center">
        Your photos are stored only on this device. They are never uploaded or shared.
      </p>
    </div>
  );
}

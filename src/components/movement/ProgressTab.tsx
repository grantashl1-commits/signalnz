import { useState, useMemo } from "react";
import { Camera, ArrowLeftRight } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";

type PhotoView = "front" | "side" | "back";
type PhotoSet = { front?: string; side?: string; back?: string };

const SECTIONS = [
  { key: "start", label: "Starting point" },
  { key: "week4", label: "4 weeks" },
  { key: "week8", label: "8 weeks" },
  { key: "week12", label: "12 weeks" },
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

function hasAnyPhotos(photos: Record<SectionKey, PhotoSet>, section: SectionKey): boolean {
  const set = photos[section];
  return !!(set?.front || set?.side || set?.back);
}

export default function ProgressTab() {
  const [photos, setPhotos] = useState<Record<SectionKey, PhotoSet>>(loadPhotos);
  const [compareMode, setCompareMode] = useState(false);
  const [compareA, setCompareA] = useState<SectionKey>("start");
  const [compareB, setCompareB] = useState<SectionKey>("week4");
  const [compareView, setCompareView] = useState<PhotoView>("front");

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

  // Count sections with photos for comparison
  const sectionsWithPhotos = useMemo(
    () => SECTIONS.filter(s => hasAnyPhotos(photos, s.key)),
    [photos],
  );

  const canCompare = sectionsWithPhotos.length >= 2;

  return (
    <div className="space-y-6">
      {/* Compare toggle */}
      {canCompare && (
        <button
          onClick={() => { haptic("light"); setCompareMode(!compareMode); }}
          className={`touch-btn w-full rounded-xl p-3 min-h-[44px] flex items-center justify-center gap-2 font-body text-xs font-medium transition-all ${
            compareMode ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          }`}
        >
          <ArrowLeftRight className="h-4 w-4" />
          {compareMode ? "Exit comparison" : "Compare side by side"}
        </button>
      )}

      {/* Comparison view */}
      {compareMode && canCompare && (
        <div className="card-warm p-4 rounded-2xl space-y-3">
          <div className="flex gap-2">
            {(["front", "side", "back"] as const).map(v => (
              <button key={v} onClick={() => { haptic("light"); setCompareView(v); }}
                className={`flex-1 rounded-full px-2 py-1.5 font-body text-[10px] font-medium capitalize transition-all ${
                  compareView === v ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
              >{v}</button>
            ))}
          </div>

          <div className="flex gap-2">
            {/* Left selector */}
            <div className="flex-1 space-y-1">
              <select value={compareA} onChange={e => setCompareA(e.target.value as SectionKey)}
                className="w-full rounded-lg bg-background border border-border px-2 py-1.5 font-body text-[10px] text-foreground"
              >
                {sectionsWithPhotos.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <div className="aspect-[7/9] rounded-xl overflow-hidden bg-secondary/30">
                {photos[compareA]?.[compareView] ? (
                  <img src={photos[compareA][compareView]} alt={compareView} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-body text-[10px] text-muted-foreground">No photo</span>
                  </div>
                )}
              </div>
            </div>
            {/* Right selector */}
            <div className="flex-1 space-y-1">
              <select value={compareB} onChange={e => setCompareB(e.target.value as SectionKey)}
                className="w-full rounded-lg bg-background border border-border px-2 py-1.5 font-body text-[10px] text-foreground"
              >
                {sectionsWithPhotos.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <div className="aspect-[7/9] rounded-xl overflow-hidden bg-secondary/30">
                {photos[compareB]?.[compareView] ? (
                  <img src={photos[compareB][compareView]} alt={compareView} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-body text-[10px] text-muted-foreground">No photo</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo upload grid */}
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

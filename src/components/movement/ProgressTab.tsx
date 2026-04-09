import { useState, useEffect, useRef } from "react";
import { Camera, ArrowLeftRight, ExternalLink, X, Maximize2 } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type PhotoView = "front" | "side" | "back" | "3d";

const SECTIONS = [
  { key: "start", label: "Starting point", textClass: "font-display text-base font-bold" },
  { key: "week4", label: "4 weeks", textClass: "font-display text-sm font-semibold" },
  { key: "week8", label: "8 weeks", textClass: "font-display text-xs font-semibold" },
  { key: "week12", label: "12 weeks", textClass: "font-display text-[11px] font-medium" },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

type PhotoSet = Record<PhotoView, string | null>;

const EMPTY_SET: PhotoSet = { front: null, side: null, back: null, "3d": null };

const BODY_VIS_URL = "https://bodyvisualizer.is.tue.mpg.de/";

export default function ProgressTab() {
  const [photos, setPhotos] = useState<Record<SectionKey, PhotoSet>>({
    start: { ...EMPTY_SET }, week4: { ...EMPTY_SET }, week8: { ...EMPTY_SET }, week12: { ...EMPTY_SET },
  });
  const [loading, setLoading] = useState<string | null>(null);
  const [fullScreenImg, setFullScreenImg] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareA, setCompareA] = useState<SectionKey>("start");
  const [compareB, setCompareB] = useState<SectionKey>("week4");
  const [compareView, setCompareView] = useState<PhotoView>("front");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingUpload, setPendingUpload] = useState<{ section: SectionKey; view: PhotoView } | null>(null);

  // Load photos from Supabase on mount
  useEffect(() => {
    loadPhotosFromStorage();
  }, []);

  async function loadPhotosFromStorage() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Fall back to localStorage for non-authenticated users
      loadFromLocalStorage();
      return;
    }

    const result: Record<string, PhotoSet> = {};
    for (const s of SECTIONS) {
      const set: PhotoSet = { ...EMPTY_SET };
      for (const view of ["front", "side", "back", "3d"] as PhotoView[]) {
        const path = `${user.id}/${s.key}_${view}`;
        const { data } = supabase.storage.from("progress-photos").getPublicUrl(path);
        // Check if the file exists by trying to download metadata
        const { data: fileData } = await supabase.storage.from("progress-photos").list(user.id, {
          search: `${s.key}_${view}`,
        });
        if (fileData && fileData.length > 0) {
          set[view] = data.publicUrl + `?t=${Date.now()}`;
        }
      }
      result[s.key] = set;
    }
    setPhotos(result as Record<SectionKey, PhotoSet>);
  }

  function loadFromLocalStorage() {
    const result: Record<string, PhotoSet> = {};
    for (const s of SECTIONS) {
      const set: PhotoSet = { ...EMPTY_SET };
      for (const view of ["front", "side", "back", "3d"] as PhotoView[]) {
        const stored = localStorage.getItem(`progressPhoto:${s.key}:${view}`);
        if (stored) set[view] = stored;
      }
      result[s.key] = set;
    }
    setPhotos(result as Record<SectionKey, PhotoSet>);
  }

  const triggerUpload = (section: SectionKey, view: PhotoView) => {
    haptic("light");
    setPendingUpload({ section, view });
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingUpload) return;
    const { section, view } = pendingUpload;
    setPendingUpload(null);

    setLoading(`${section}:${view}`);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const path = `${user.id}/${section}_${view}`;
      const { error } = await supabase.storage.from("progress-photos").upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });
      if (!error) {
        const { data } = supabase.storage.from("progress-photos").getPublicUrl(path);
        setPhotos(prev => ({
          ...prev,
          [section]: { ...prev[section], [view]: data.publicUrl + `?t=${Date.now()}` },
        }));
      }
    } else {
      // Fallback to localStorage
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
    }

    setLoading(null);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const hasAnyPhotos = (section: SectionKey) => {
    const set = photos[section];
    return !!(set?.front || set?.side || set?.back || set?.["3d"]);
  };

  const sectionsWithPhotos = SECTIONS.filter(s => hasAnyPhotos(s.key));
  const canCompare = sectionsWithPhotos.length >= 2;

  const VIEWS: { key: PhotoView; label: string }[] = [
    { key: "front", label: "Front" },
    { key: "side", label: "Side" },
    { key: "back", label: "Back" },
    { key: "3d", label: "3D Body" },
  ];

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 3D Body Visualiser Banner */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
        <h3 className="font-display text-base font-bold text-foreground">3D Body Visualiser</h3>
        <p className="font-body text-xs text-muted-foreground leading-relaxed">
          To create your 3D body snapshot, visit the body visualiser, enter your measurements, take a screenshot, and upload it below.
        </p>
        <a
          href={BODY_VIS_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => haptic("light")}
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 min-h-[44px] font-body text-xs font-semibold transition-all active:scale-[0.97]"
        >
          <ExternalLink className="h-4 w-4" />
          Open Body Visualiser
        </a>
      </div>

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
            {VIEWS.map(v => (
              <button key={v.key} onClick={() => { haptic("light"); setCompareView(v.key); }}
                className={`flex-1 rounded-full px-2 py-1.5 font-body text-[10px] font-medium transition-all ${
                  compareView === v.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
              >{v.label}</button>
            ))}
          </div>

          <div className="flex gap-2">
            {[{ val: compareA, set: setCompareA }, { val: compareB, set: setCompareB }].map(({ val, set }, idx) => (
              <div key={idx} className="flex-1 space-y-1">
                <select value={val} onChange={e => set(e.target.value as SectionKey)}
                  className="w-full rounded-lg bg-background border border-border px-2 py-1.5 font-body text-[10px] text-foreground"
                >
                  {sectionsWithPhotos.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
                <div className="aspect-[7/9] rounded-xl overflow-hidden bg-secondary/30">
                  {photos[val]?.[compareView] ? (
                    <img src={photos[val][compareView]!} alt={compareView} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-body text-[10px] text-muted-foreground">No photo</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo upload grid */}
      {SECTIONS.map(section => (
        <div key={section.key} className="space-y-2">
          <h3 className="font-hand text-sm font-bold text-foreground">{section.label}</h3>
          <div className="grid grid-cols-4 gap-2">
            {VIEWS.map(view => {
              const photo = photos[section.key]?.[view.key];
              const isLoading = loading === `${section.key}:${view.key}`;
              const is3D = view.key === "3d";

              return (
                <div key={view.key} className="space-y-1">
                  <div
                    onClick={() => {
                      if (photo) {
                        haptic("light");
                        setFullScreenImg(photo);
                      } else {
                        triggerUpload(section.key, view.key);
                      }
                    }}
                    className={`aspect-[7/9] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden relative cursor-pointer active:scale-[0.97] transition-transform ${
                      is3D ? "border-primary/30 bg-primary/5" : "border-border/40 bg-secondary/30"
                    }`}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : photo ? (
                      <>
                        <img src={photo} alt={view.label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                          <Maximize2 className="h-4 w-4 text-white" />
                        </div>
                        {/* Re-upload button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerUpload(section.key, view.key);
                          }}
                          className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-background/80 flex items-center justify-center"
                        >
                          <Camera className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Camera className={`h-5 w-5 mb-1 ${is3D ? "text-primary/40" : "text-muted-foreground/40"}`} />
                        <span className={`font-hand text-[10px] ${is3D ? "text-primary/60" : "text-muted-foreground"}`}>
                          {view.label}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <p className="font-body text-[10px] italic text-muted-foreground text-center">
        Photos are stored securely in your account when signed in.
      </p>

      {/* Full screen image viewer */}
      <Dialog open={!!fullScreenImg} onOpenChange={() => setFullScreenImg(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black border-none">
          <button
            onClick={() => setFullScreenImg(null)}
            className="absolute top-3 right-3 z-50 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"
          >
            <X className="h-4 w-4 text-white" />
          </button>
          {fullScreenImg && (
            <img
              src={fullScreenImg}
              alt="Progress photo"
              className="w-full h-full object-contain max-h-[90vh]"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Sparkles, X, ArrowRight, LayoutGrid, Check, Loader2 } from "lucide-react";
import { haptic } from "@/hooks/use-mobile";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDreamBoard, type SaveStatus } from "@/hooks/useDreamBoard";
import BoardCanvas from "./dream/BoardCanvas";
import BoardToolbar from "./dream/BoardToolbar";
import BoardEmptyState from "./dream/BoardEmptyState";
import BoardSwitcher from "./dream/BoardSwitcher";
import MobileBoardView from "./dream/MobileBoardView";
import AddImageModal from "./dream/AddImageModal";
import type { DreamElement } from "@/lib/journal-store";
import { WildStar, HandDrawnSparkle } from "@/components/BotanicalElements";

// ── Save Status Indicator ────────────────────────────────────
function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        className="fixed bottom-5 left-5 z-[60] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/80 border border-border backdrop-blur-sm shadow-sm"
      >
        {status === "saving" ? (
          <>
            <Loader2 className="h-3 w-3 text-muted-foreground animate-spin" />
            <span className="font-body text-[10px] text-muted-foreground">Saving…</span>
          </>
        ) : (
          <>
            <Check className="h-3 w-3 text-primary/60" />
            <span className="font-body text-[10px] text-muted-foreground/60">Saved</span>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Dream Rituals (guided flow) ──────────────────────────────
const DREAM_RITUALS = [
  { id: "dream-morning", title: "Build Your Dream Morning", desc: "Visualise your ideal morning from the moment you open your eyes.", prompts: ["What time do you wake up?", "What does the light look like?", "What do you do first?", "What do you eat?", "How do you feel?"] },
  { id: "next-chapter", title: "Design Your Next Chapter", desc: "What does the next season of your life look like?", prompts: ["What are you letting go of?", "What are you welcoming in?", "Where are you?", "Who is with you?", "What does it feel like?"] },
  { id: "safe-home", title: "Create Your Safe Home Energy", desc: "Design the feeling of home that you carry with you.", prompts: ["What does your space smell like?", "What textures surround you?", "What sounds are in the background?", "What objects bring you comfort?"] },
  { id: "grounded-self", title: "Visualise Your Most Grounded Self", desc: "Meet the version of you who moves through life with ease.", prompts: ["How does she hold her body?", "What does she wear?", "How does she respond to stress?", "What does she protect?", "What does she no longer tolerate?"] },
  { id: "creative-life", title: "Build Your Creative Life", desc: "Imagine a life where creativity flows freely.", prompts: ["What do you create?", "Where do you create?", "What inspires you?", "Who are you creating for?"] },
  { id: "romanticise-future", title: "Romanticise Your Future", desc: "Find the beauty in the life you are building.", prompts: ["What small pleasures fill your days?", "What makes you laugh?", "What traditions do you keep?", "What legacy are you leaving?"] },
];

const FUTURE_SELF_PROMPTS = [
  "Who are you becoming?", "What does she protect?", "What does she no longer tolerate?",
  "What does her life feel like?", "What does she choose?", "How does she spend her mornings?", "What brings her peace?",
];

// ── Guided Ritual Flow ───────────────────────────────────────
function DreamRitualFlow({ ritual, onComplete, onBack }: { ritual: typeof DREAM_RITUALS[0]; onComplete: (elements: Omit<DreamElement, "id" | "zIndex">[]) => void; onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(ritual.prompts.map(() => ""));
  const isLast = step === ritual.prompts.length - 1;

  const complete = () => {
    const els: Omit<DreamElement, "id" | "zIndex">[] = [];
    els.push({ type: "label", content: ritual.title, x: 100, y: 80, width: 300, height: 50 });
    answers.filter(Boolean).forEach((a, i) => {
      els.push({ type: "text", content: `${ritual.prompts[i]}\n${a}`, x: 100 + (i % 3) * 260, y: 150 + Math.floor(i / 3) * 170, width: 240, height: 140 });
    });
    onComplete(els);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-background flex items-center justify-center p-4" style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="w-full max-w-lg">
        <button onClick={onBack} className="flex items-center gap-1.5 font-body text-xs text-muted-foreground mb-4 active:opacity-70"><X className="h-3.5 w-3.5" /> Exit ritual</button>
        <div className="text-center mb-6">
          <p className="font-body text-[11px] text-primary uppercase tracking-wider mb-2">Dream Ritual</p>
          <h2 className="font-display text-2xl italic text-foreground mb-1">{ritual.title}</h2>
          <p className="font-body text-sm text-muted-foreground">{ritual.desc}</p>
          <div className="flex gap-1 justify-center mt-3">
            {ritual.prompts.map((_, i) => (<div key={i} className={`w-8 h-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`} />))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="card-warm p-6">
            <p className="font-display text-xl italic text-foreground mb-4">{ritual.prompts[step]}</p>
            <textarea value={answers[step]} onChange={(e) => { const next = [...answers]; next[step] = e.target.value; setAnswers(next); }} rows={5} placeholder="Close your eyes and imagine..." className="w-full font-display text-[15px] italic text-foreground bg-transparent resize-none focus:outline-none leading-[1.9] placeholder:text-muted-foreground/30" style={{ fontSize: "16px" }} autoFocus />
          </motion.div>
        </AnimatePresence>
        <div className="flex gap-3 mt-4">
          {step > 0 && <button onClick={() => setStep(step - 1)} className="flex-1 rounded-card border border-border py-3.5 font-display text-sm italic text-muted-foreground">Back</button>}
          {isLast ? (
            <button onClick={complete} className="flex-1 rounded-card bg-primary py-3.5 font-display text-sm italic text-primary-foreground active:opacity-90 flex items-center justify-center gap-2"><Sparkles className="h-4 w-4" /> Add to board</button>
          ) : (
            <button onClick={() => setStep(step + 1)} className="flex-1 rounded-card bg-primary py-3.5 font-display text-sm italic text-primary-foreground active:opacity-90 flex items-center justify-center gap-2">Next <ArrowRight className="h-4 w-4" /></button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Future Self Mode ─────────────────────────────────────────
function FutureSelfMode({ onComplete, onBack }: { onComplete: (elements: Omit<DreamElement, "id" | "zIndex">[]) => void; onBack: () => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const complete = () => {
    const els: Omit<DreamElement, "id" | "zIndex">[] = [];
    els.push({ type: "label", content: "Future Self", x: 100, y: 80, width: 260, height: 50 });
    Object.entries(answers).filter(([, v]) => v.trim()).forEach(([k, v], i) => {
      els.push({ type: "affirmation", content: `${FUTURE_SELF_PROMPTS[parseInt(k)]}\n${v}`, x: 100 + (i % 3) * 260, y: 150 + Math.floor(i / 3) * 170, width: 240, height: 140 });
    });
    onComplete(els);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-background overflow-y-auto p-4" style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="max-w-lg mx-auto pb-10">
        <button onClick={onBack} className="flex items-center gap-1.5 font-body text-xs text-muted-foreground mb-4 active:opacity-70"><X className="h-3.5 w-3.5" /> Exit</button>
        <div className="text-center mb-6">
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}><WildStar size={36} className="mx-auto mb-3" /></motion.div>
          <p className="font-body text-[11px] text-primary uppercase tracking-wider mb-2">Future Self Mode</p>
          <h2 className="font-display text-2xl italic text-foreground mb-1">Who are you becoming?</h2>
          <p className="font-body text-sm text-muted-foreground">Build your vision from identity, not just aesthetics.</p>
        </div>
        <div className="space-y-4">
          {FUTURE_SELF_PROMPTS.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-warm p-5">
              <p className="font-display text-[15px] italic text-foreground mb-2">{p}</p>
              <textarea value={answers[i] || ""} onChange={(e) => setAnswers((a) => ({ ...a, [i]: e.target.value }))} rows={2} placeholder="..." className="w-full font-display text-sm italic text-foreground bg-secondary/30 border border-border rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/30" style={{ fontSize: "16px" }} />
            </motion.div>
          ))}
        </div>
        <button onClick={complete} className="w-full rounded-card bg-primary py-3.5 font-display text-base italic text-primary-foreground active:opacity-90 mt-4 flex items-center justify-center gap-2"><Sparkles className="h-4 w-4" /> Add to board</button>
      </div>
    </div>
  );
}

// ── Rituals Panel ────────────────────────────────────────────
function RitualsPanel({ onStartRitual, onStartFutureSelf, onClose }: { onStartRitual: (r: typeof DREAM_RITUALS[0]) => void; onStartFutureSelf: () => void; onClose: () => void }) {
  return (
    <div className="absolute top-0 right-0 w-80 h-full z-40 bg-card/95 backdrop-blur-xl border-l border-border shadow-2xl overflow-y-auto">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-display text-lg italic text-foreground">Rituals</p>
          <button onClick={onClose} className="touch-btn p-2 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <button onClick={onStartFutureSelf} className="w-full rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/15 p-4 text-left mb-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-2 mb-1.5">
            <HandDrawnSparkle size={16} color="hsl(var(--primary))" />
            <p className="font-body text-[10px] text-primary uppercase tracking-wider">Featured</p>
          </div>
          <h3 className="font-display text-[15px] italic text-foreground mb-0.5">Future Self Mode</h3>
          <p className="font-body text-[12px] text-muted-foreground leading-relaxed">Build your vision from identity.</p>
        </button>
        <div className="space-y-2">
          {DREAM_RITUALS.map((r) => (
            <button key={r.id} onClick={() => onStartRitual(r)} className="w-full card-warm p-4 text-left hover:shadow-sm transition-shadow">
              <p className="font-display text-[14px] italic text-foreground mb-0.5">{r.title}</p>
              <p className="font-body text-[10px] text-muted-foreground">{r.prompts.length} steps</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────
export default function DreamStudio({ pinnedEntry }: { pinnedEntry?: { id: string; content: string } | null }) {
  const board = useDreamBoard();
  const isMobile = useIsMobile();
  const [showImageModal, setShowImageModal] = useState(false);
  const [showRituals, setShowRituals] = useState(false);
  const [showBoards, setShowBoards] = useState(false);
  const [activeRitual, setActiveRitual] = useState<typeof DREAM_RITUALS[0] | null>(null);
  const [showFutureSelf, setShowFutureSelf] = useState(false);

  // Auto-create a default board if none exist
  useEffect(() => {
    if (board.boards.length === 0) {
      board.createBoard("My Dream Board", "hsl(284 22% 44%)");
    }
  }, [board.boards.length]);

  // Handle pinned entry from journal
  useEffect(() => {
    if (pinnedEntry) {
      board.addElement({
        type: "text",
        content: pinnedEntry.content.slice(0, 200),
        x: Math.random() * 400 + 100,
        y: Math.random() * 300 + 100,
        width: 240, height: 140,
        linkedEntryId: pinnedEntry.id,
      });
    }
  }, [pinnedEntry?.id]);

  // Escape key cancels connecting mode
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && board.connectingFrom) {
        board.setConnectingFrom(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [board.connectingFrom]);

  const handleAddElement = useCallback((type: string) => {
    haptic("medium");
    const centerX = (-board.panX + 400) / board.zoom;
    const centerY = (-board.panY + 300) / board.zoom;
    const defaults: Record<string, { w: number; h: number }> = {
      text: { w: 240, h: 160 }, quote: { w: 280, h: 140 }, goal: { w: 240, h: 160 },
      affirmation: { w: 260, h: 120 }, label: { w: 300, h: 50 }, prompt: { w: 280, h: 100 },
    };
    const d = defaults[type] || { w: 240, h: 160 };
    board.addElement({ type: type as DreamElement["type"], content: "", x: centerX + Math.random() * 60 - 30, y: centerY + Math.random() * 60 - 30, width: d.w, height: d.h });
  }, [board]);

  const handleImageReady = useCallback((url: string, prompt?: string) => {
    haptic("medium");
    const centerX = (-board.panX + 400) / board.zoom;
    const centerY = (-board.panY + 300) / board.zoom;
    board.addElement({ type: "image", content: prompt || "", imageUrl: url, x: centerX + Math.random() * 60 - 30, y: centerY + Math.random() * 60 - 30, width: 280, height: 280 });
  }, [board]);

  const handleStarterRitual = useCallback((elements: Array<{ type: string; content: string; x: number; y: number; width: number; height: number; imageUrl?: string }>) => {
    haptic("medium");
    board.addBulk(elements.map((e) => ({ ...e, type: e.type as DreamElement["type"], imageUrl: e.imageUrl || undefined })));
  }, [board]);

  const handleRitualComplete = useCallback((els: Omit<DreamElement, "id" | "zIndex">[]) => { board.addBulk(els); setActiveRitual(null); }, [board]);
  const handleFutureSelfComplete = useCallback((els: Omit<DreamElement, "id" | "zIndex">[]) => { board.addBulk(els); setShowFutureSelf(false); }, [board]);

  const handleZoomIn = () => board.setZoom(Math.min(3, board.zoom + 0.15));
  const handleZoomOut = () => board.setZoom(Math.max(0.25, board.zoom - 0.15));
  const handleFit = () => { board.setZoom(1); board.setPanX(0); board.setPanY(0); };

  const handleStartConnect = (id: string) => {
    haptic("light");
    board.setConnectingFrom(id);
  };

  const handleCompleteConnect = (toId: string) => {
    if (board.connectingFrom) {
      board.addConnection(board.connectingFrom, toId);
      board.setConnectingFrom(null);
      haptic("medium");
    }
  };

  // Ritual flows
  if (activeRitual) return <DreamRitualFlow ritual={activeRitual} onComplete={handleRitualComplete} onBack={() => setActiveRitual(null)} />;
  if (showFutureSelf) return <FutureSelfMode onComplete={handleFutureSelfComplete} onBack={() => setShowFutureSelf(false)} />;

  // Mobile: full canvas (same as desktop)
  if (isMobile) {
    return (
      <div className="relative w-full" style={{ height: "calc(100vh - 220px)" }}>
        <BoardCanvas
          elements={board.elements}
          connections={board.connections}
          zoom={board.zoom}
          panX={board.panX}
          panY={board.panY}
          selectedId={board.selectedId}
          connectingFrom={board.connectingFrom}
          onSelect={board.setSelectedId}
          onUpdate={board.updateElement}
          onDelete={board.deleteElement}
          onDuplicate={board.duplicateElement}
          onBringForward={board.bringForward}
          onSendBackward={board.sendBackward}
          onStartConnect={handleStartConnect}
          onCompleteConnect={handleCompleteConnect}
          onRemoveConnection={board.removeConnection}
          setPanX={board.setPanX}
          setPanY={board.setPanY}
          setZoom={board.setZoom}
        >
          {board.elements.length === 0 && (
            <BoardEmptyState
              onAddNote={() => handleAddElement("text")}
              onAddImage={() => setShowImageModal(true)}
              onStartRitual={handleStarterRitual}
            />
          )}

          <BoardToolbar
            zoom={board.zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFit={handleFit}
            onAddElement={handleAddElement}
            onAddImage={() => setShowImageModal(true)}
          />

          <button
            onClick={() => setShowBoards(!showBoards)}
            className="absolute top-3 right-[100px] z-50 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border shadow-lg font-display text-[12px] italic text-foreground"
          >
            <LayoutGrid className="h-3.5 w-3.5 text-primary/60" />
            {board.activeBoard?.title || "Boards"}
          </button>

          <button
            onClick={() => setShowRituals(!showRituals)}
            className="absolute top-3 right-3 z-50 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border shadow-lg font-display text-[12px] italic text-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Rituals
          </button>

          {board.elements.length > 0 && (
            <div className="absolute bottom-3 right-3 z-50 font-body text-[10px] text-muted-foreground/60 bg-card/80 border border-border rounded-lg px-2.5 py-1 backdrop-blur-sm">
              {board.elements.length} elements
            </div>
          )}

          {showRituals && (
            <div className="absolute inset-0 z-[100] bg-background/95 overflow-y-auto p-4">
              <RitualsPanel
                onStartRitual={(r) => { setActiveRitual(r); setShowRituals(false); }}
                onStartFutureSelf={() => { setShowFutureSelf(true); setShowRituals(false); }}
                onClose={() => setShowRituals(false)}
              />
            </div>
          )}

          {showBoards && (
            <BoardSwitcher
              boards={board.boards}
              activeBoardId={board.activeBoardId}
              onSwitch={(id) => { board.switchBoard(id); setShowBoards(false); }}
              onCreate={(title, color) => board.createBoard(title, color)}
              onRename={board.renameBoard}
              onDelete={board.deleteBoard}
              onClose={() => setShowBoards(false)}
            />
          )}
        </BoardCanvas>

        <AddImageModal open={showImageModal} onClose={() => setShowImageModal(false)} onImageReady={handleImageReady} />
        <SaveIndicator status={board.saveStatus} />
      </div>
    );
  }

  // Desktop: full canvas
  return (
    <div className="relative w-full" style={{ height: "calc(100vh - 160px)" }}>
      <BoardCanvas
        elements={board.elements}
        connections={board.connections}
        zoom={board.zoom}
        panX={board.panX}
        panY={board.panY}
        selectedId={board.selectedId}
        connectingFrom={board.connectingFrom}
        onSelect={board.setSelectedId}
        onUpdate={board.updateElement}
        onDelete={board.deleteElement}
        onDuplicate={board.duplicateElement}
        onBringForward={board.bringForward}
        onSendBackward={board.sendBackward}
        onStartConnect={handleStartConnect}
        onCompleteConnect={handleCompleteConnect}
        onRemoveConnection={board.removeConnection}
        setPanX={board.setPanX}
        setPanY={board.setPanY}
        setZoom={board.setZoom}
      >
        {board.elements.length === 0 && (
          <BoardEmptyState
            onAddNote={() => handleAddElement("text")}
            onAddImage={() => setShowImageModal(true)}
            onStartRitual={handleStarterRitual}
          />
        )}

        <BoardToolbar
          zoom={board.zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFit={handleFit}
          onAddElement={handleAddElement}
          onAddImage={() => setShowImageModal(true)}
        />

        {/* Board switcher button */}
        <button
          onClick={() => setShowBoards(!showBoards)}
          className="absolute top-4 right-[140px] z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border shadow-lg font-display text-sm italic text-foreground hover:bg-secondary transition-colors"
        >
          <LayoutGrid className="h-4 w-4 text-primary/60" />
          {board.activeBoard?.title || "Boards"}
        </button>

        {/* Rituals button */}
        <button
          onClick={() => setShowRituals(!showRituals)}
          className="absolute top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border shadow-lg font-display text-sm italic text-foreground hover:bg-secondary transition-colors"
        >
          <Sparkles className="h-4 w-4 text-primary" /> Rituals
        </button>

        {board.elements.length > 0 && (
          <div className="absolute bottom-4 right-4 z-50 font-body text-[11px] text-muted-foreground/60 bg-card/80 border border-border rounded-lg px-3 py-1.5 backdrop-blur-sm">
            {board.elements.length} elements · {board.connections.length} connections
          </div>
        )}

        {showRituals && (
          <RitualsPanel
            onStartRitual={(r) => { setActiveRitual(r); setShowRituals(false); }}
            onStartFutureSelf={() => { setShowFutureSelf(true); setShowRituals(false); }}
            onClose={() => setShowRituals(false)}
          />
        )}

        {showBoards && (
          <BoardSwitcher
            boards={board.boards}
            activeBoardId={board.activeBoardId}
            onSwitch={(id) => { board.switchBoard(id); setShowBoards(false); }}
            onCreate={(title, color) => board.createBoard(title, color)}
            onRename={board.renameBoard}
            onDelete={board.deleteBoard}
            onClose={() => setShowBoards(false)}
          />
        )}
      </BoardCanvas>

      <AddImageModal open={showImageModal} onClose={() => setShowImageModal(false)} onImageReady={handleImageReady} />
      <SaveIndicator status={board.saveStatus} />
    </div>
  );
}

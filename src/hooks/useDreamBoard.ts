import { useState, useCallback, useRef, useEffect } from "react";
import { loadDreamBoard, saveDreamBoard, type DreamElement } from "@/lib/journal-store";

const BOARD_STORAGE_KEY = "signal_dream_board_state";

interface BoardState {
  zoom: number;
  panX: number;
  panY: number;
}

function loadBoardState(): BoardState {
  try {
    const raw = localStorage.getItem(BOARD_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { zoom: 1, panX: 0, panY: 0 };
  } catch {
    return { zoom: 1, panX: 0, panY: 0 };
  }
}

function saveBoardState(state: BoardState) {
  localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(state));
}

export function useDreamBoard() {
  const [elements, setElements] = useState<DreamElement[]>(() => loadDreamBoard());
  const [zoom, setZoom] = useState(() => loadBoardState().zoom);
  const [panX, setPanX] = useState(() => loadBoardState().panX);
  const [panY, setPanY] = useState(() => loadBoardState().panY);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Auto-persist with debounce
  const persist = useCallback((els: DreamElement[]) => {
    setElements(els);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => saveDreamBoard(els), 300);
  }, []);

  // Save board view state
  useEffect(() => {
    saveBoardState({ zoom, panX, panY });
  }, [zoom, panX, panY]);

  const addElement = useCallback((partial: Omit<DreamElement, "id" | "zIndex">) => {
    const maxZ = elements.reduce((max, e) => Math.max(max, e.zIndex), 0);
    const el: DreamElement = {
      ...partial,
      id: `dream-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      zIndex: maxZ + 1,
    };
    persist([...elements, el]);
    setSelectedId(el.id);
    return el;
  }, [elements, persist]);

  const updateElement = useCallback((id: string, updates: Partial<DreamElement>) => {
    persist(elements.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  }, [elements, persist]);

  const deleteElement = useCallback((id: string) => {
    persist(elements.filter((e) => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [elements, persist, selectedId]);

  const duplicateElement = useCallback((id: string) => {
    const el = elements.find((e) => e.id === id);
    if (!el) return;
    const maxZ = elements.reduce((max, e) => Math.max(max, e.zIndex), 0);
    const dup: DreamElement = {
      ...el,
      id: `dream-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      x: el.x + 30,
      y: el.y + 30,
      zIndex: maxZ + 1,
    };
    persist([...elements, dup]);
    setSelectedId(dup.id);
  }, [elements, persist]);

  const bringForward = useCallback((id: string) => {
    const maxZ = elements.reduce((max, e) => Math.max(max, e.zIndex), 0);
    updateElement(id, { zIndex: maxZ + 1 });
  }, [elements, updateElement]);

  const sendBackward = useCallback((id: string) => {
    const minZ = elements.reduce((min, e) => Math.min(min, e.zIndex), Infinity);
    updateElement(id, { zIndex: Math.max(0, minZ - 1) });
  }, [elements, updateElement]);

  const addBulk = useCallback((newEls: Omit<DreamElement, "id" | "zIndex">[]) => {
    const maxZ = elements.reduce((max, e) => Math.max(max, e.zIndex), 0);
    const created = newEls.map((partial, i) => ({
      ...partial,
      id: `dream-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      zIndex: maxZ + 1 + i,
    }));
    persist([...elements, ...created]);
  }, [elements, persist]);

  return {
    elements,
    zoom, setZoom,
    panX, setPanX,
    panY, setPanY,
    selectedId, setSelectedId,
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    bringForward,
    sendBackward,
    addBulk,
  };
}

import { useState, useCallback, useRef, useEffect } from "react";
import {
  loadDreamBoards, saveDreamBoards, getActiveBoardId, setActiveBoardId,
  type DreamElement, type DreamBoard, type DreamConnection,
} from "@/lib/journal-store";

const uid = () => `dream-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
const GRID = 16;
const snap = (v: number) => Math.round(v / GRID) * GRID;

export function useDreamBoard() {
  const [boards, setBoards] = useState<DreamBoard[]>(() => loadDreamBoards());
  const [activeBoardId, setActiveId] = useState<string | null>(() => {
    const saved = getActiveBoardId();
    const bs = loadDreamBoards();
    if (saved && bs.find((b) => b.id === saved)) return saved;
    return bs[0]?.id ?? null;
  });

  const saveTimeout = useRef<ReturnType<typeof setTimeout>>();

  const persist = useCallback((next: DreamBoard[]) => {
    setBoards(next);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => saveDreamBoards(next), 300);
  }, []);

  const activeBoard = boards.find((b) => b.id === activeBoardId) ?? null;
  const elements = activeBoard?.elements ?? [];
  const connections = activeBoard?.connections ?? [];
  const zoom = activeBoard?.zoom ?? 1;
  const panX = activeBoard?.panX ?? 0;
  const panY = activeBoard?.panY ?? 0;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);

  const updateBoard = useCallback((updates: Partial<DreamBoard>) => {
    if (!activeBoardId) return;
    persist(boards.map((b) => b.id === activeBoardId ? { ...b, ...updates } : b));
  }, [boards, activeBoardId, persist]);

  // Board CRUD
  const createBoard = useCallback((title: string, coverColor?: string) => {
    const board: DreamBoard = {
      id: uid(),
      title,
      elements: [],
      connections: [],
      zoom: 1, panX: 0, panY: 0,
      createdAt: Date.now(),
      coverColor,
    };
    const next = [...boards, board];
    persist(next);
    setActiveId(board.id);
    setActiveBoardId(board.id);
    return board;
  }, [boards, persist]);

  const switchBoard = useCallback((id: string) => {
    setActiveId(id);
    setActiveBoardId(id);
    setSelectedId(null);
  }, []);

  const renameBoard = useCallback((id: string, title: string) => {
    persist(boards.map((b) => b.id === id ? { ...b, title } : b));
  }, [boards, persist]);

  const deleteBoard = useCallback((id: string) => {
    const next = boards.filter((b) => b.id !== id);
    persist(next);
    if (activeBoardId === id) {
      const newActive = next[0]?.id ?? null;
      setActiveId(newActive);
      if (newActive) setActiveBoardId(newActive);
    }
  }, [boards, activeBoardId, persist]);

  // Element ops
  const addElement = useCallback((partial: Omit<DreamElement, "id" | "zIndex">) => {
    const maxZ = elements.reduce((max, e) => Math.max(max, e.zIndex), 0);
    const el: DreamElement = { ...partial, id: uid(), zIndex: maxZ + 1, x: snap(partial.x), y: snap(partial.y), width: snap(partial.width), height: snap(partial.height) };
    updateBoard({ elements: [...elements, el] });
    setSelectedId(el.id);
    return el;
  }, [elements, updateBoard]);

  const updateElement = useCallback((id: string, updates: Partial<DreamElement>) => {
    updateBoard({ elements: elements.map((e) => e.id === id ? { ...e, ...updates } : e) });
  }, [elements, updateBoard]);

  const deleteElement = useCallback((id: string) => {
    updateBoard({
      elements: elements.filter((e) => e.id !== id),
      connections: connections.filter((c) => c.fromId !== id && c.toId !== id),
    });
    if (selectedId === id) setSelectedId(null);
  }, [elements, connections, updateBoard, selectedId]);

  const duplicateElement = useCallback((id: string) => {
    const el = elements.find((e) => e.id === id);
    if (!el) return;
    const maxZ = elements.reduce((max, e) => Math.max(max, e.zIndex), 0);
    const dup: DreamElement = { ...el, id: uid(), x: el.x + 30, y: el.y + 30, zIndex: maxZ + 1 };
    updateBoard({ elements: [...elements, dup] });
    setSelectedId(dup.id);
  }, [elements, updateBoard]);

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
    const created = newEls.map((p, i) => ({ ...p, id: uid(), zIndex: maxZ + 1 + i }));
    updateBoard({ elements: [...elements, ...created] });
  }, [elements, updateBoard]);

  // Connection ops
  const addConnection = useCallback((fromId: string, toId: string, label?: string) => {
    if (fromId === toId) return;
    if (connections.find((c) => c.fromId === fromId && c.toId === toId)) return;
    const conn: DreamConnection = { id: uid(), fromId, toId, label };
    updateBoard({ connections: [...connections, conn] });
  }, [connections, updateBoard]);

  const removeConnection = useCallback((id: string) => {
    updateBoard({ connections: connections.filter((c) => c.id !== id) });
  }, [connections, updateBoard]);

  // Pan/zoom
  const setZoom = useCallback((v: number) => updateBoard({ zoom: v }), [updateBoard]);
  const setPanX = useCallback((v: number) => updateBoard({ panX: v }), [updateBoard]);
  const setPanY = useCallback((v: number) => updateBoard({ panY: v }), [updateBoard]);

  return {
    boards, activeBoard, activeBoardId,
    createBoard, switchBoard, renameBoard, deleteBoard,
    elements, connections,
    zoom, setZoom, panX, setPanX, panY, setPanY,
    selectedId, setSelectedId,
    connectingFrom, setConnectingFrom,
    addElement, updateElement, deleteElement, duplicateElement,
    bringForward, sendBackward, addBulk,
    addConnection, removeConnection,
  };
}

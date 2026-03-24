import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  loadEntries, saveEntries,
  loadVault, saveVault,
  loadMilestones, saveMilestones,
  type JournalEntry, type VaultEntry, type MilestoneAnalysis,
} from "@/lib/journal-store";

// Converts JournalEntry to DB row shape
function entryToRow(entry: JournalEntry, userId: string) {
  return {
    id: entry.id,
    user_id: userId,
    date: entry.date,
    timestamp: entry.timestamp,
    prompts: entry.prompts as any,
    tracking: entry.tracking as any,
    tags: (entry.tags || []) as any,
    ai: entry.ai as any,
    entry_type: entry.entryType || null,
    title: entry.title || null,
    emotional_tone: entry.emotionalTone || null,
    saved_to_vault: entry.savedToVault || false,
    pinned_to_dream_studio: entry.pinnedToDreamStudio || false,
    vault_category: entry.vaultCategory || null,
  };
}

function rowToEntry(row: any): JournalEntry {
  return {
    id: row.id,
    date: row.date,
    timestamp: Number(row.timestamp),
    prompts: row.prompts || {},
    tracking: row.tracking || {},
    tags: row.tags || [],
    ai: row.ai || null,
    entryType: row.entry_type,
    title: row.title,
    emotionalTone: row.emotional_tone,
    savedToVault: row.saved_to_vault,
    pinnedToDreamStudio: row.pinned_to_dream_studio,
    vaultCategory: row.vault_category,
  };
}

function vaultToRow(entry: VaultEntry, userId: string) {
  return {
    id: entry.id,
    user_id: userId,
    entry_id: entry.entryId || null,
    category: entry.category,
    title: entry.title,
    preview: entry.preview || null,
    date: entry.date,
    timestamp: entry.timestamp,
  };
}

function rowToVault(row: any): VaultEntry {
  return {
    id: row.id,
    entryId: row.entry_id || "",
    category: row.category,
    title: row.title,
    preview: row.preview || "",
    date: row.date,
    timestamp: Number(row.timestamp),
  };
}

export function useJournalSync() {
  const [entries, setEntries] = useState<JournalEntry[]>(() => loadEntries());
  const [vault, setVault] = useState<VaultEntry[]>(() => loadVault());
  const [milestones, setMilestones] = useState<MilestoneAnalysis[]>(() => loadMilestones());
  const [syncing, setSyncing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const initialSyncDone = useRef(false);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
      initialSyncDone.current = false; // re-sync on auth change
    });
    return () => subscription.unsubscribe();
  }, []);

  // Initial sync: pull from cloud, merge with local, push any local-only entries
  useEffect(() => {
    if (!userId || initialSyncDone.current) return;
    initialSyncDone.current = true;

    const sync = async () => {
      setSyncing(true);
      try {
        // Sync journal entries
        const { data: cloudEntries } = await supabase
          .from("journal_entries")
          .select("*")
          .eq("user_id", userId)
          .order("timestamp", { ascending: false });

        const cloudMap = new Map((cloudEntries || []).map((r: any) => [r.id, r]));
        const localEntries = loadEntries();
        const merged: JournalEntry[] = [];
        const toUpsert: any[] = [];

        // Add all cloud entries
        for (const row of cloudEntries || []) {
          merged.push(rowToEntry(row));
        }

        // Add local-only entries and push them to cloud
        for (const local of localEntries) {
          if (!cloudMap.has(local.id)) {
            merged.push(local);
            toUpsert.push(entryToRow(local, userId));
          }
        }

        // Sort by timestamp desc
        merged.sort((a, b) => b.timestamp - a.timestamp);
        setEntries(merged);
        saveEntries(merged);

        // Push local-only to cloud
        if (toUpsert.length > 0) {
          await supabase.from("journal_entries").upsert(toUpsert);
        }

        // Sync vault
        const { data: cloudVault } = await supabase
          .from("vault_entries")
          .select("*")
          .eq("user_id", userId)
          .order("timestamp", { ascending: false });

        const vaultCloudMap = new Map((cloudVault || []).map((r: any) => [r.id, r]));
        const localVault = loadVault();
        const mergedVault: VaultEntry[] = [];
        const vaultToUpsert: any[] = [];

        for (const row of cloudVault || []) {
          mergedVault.push(rowToVault(row));
        }
        for (const local of localVault) {
          if (!vaultCloudMap.has(local.id)) {
            mergedVault.push(local);
            vaultToUpsert.push(vaultToRow(local, userId));
          }
        }
        mergedVault.sort((a, b) => b.timestamp - a.timestamp);
        setVault(mergedVault);
        saveVault(mergedVault);

        if (vaultToUpsert.length > 0) {
          await supabase.from("vault_entries").upsert(vaultToUpsert);
        }

        // Sync milestones
        const { data: cloudMilestones } = await supabase
          .from("journal_milestones")
          .select("*")
          .eq("user_id", userId);

        if (cloudMilestones && cloudMilestones.length > 0) {
          const ms: MilestoneAnalysis[] = cloudMilestones.map((r: any) => ({
            milestoneType: r.milestone_type,
            count: r.count,
            date: r.date,
            analysis: r.analysis,
          }));
          setMilestones(ms);
          saveMilestones(ms);
        }
      } catch (err) {
        console.error("Journal sync error:", err);
      }
      setSyncing(false);
    };

    sync();
  }, [userId]);

  // Save entry (local + cloud)
  const saveEntry = useCallback(async (entry: JournalEntry) => {
    const updated = [entry, ...entries.filter(e => e.id !== entry.id)];
    setEntries(updated);
    saveEntries(updated);

    if (userId) {
      await supabase.from("journal_entries").upsert(entryToRow(entry, userId));
    }
  }, [entries, userId]);

  // Update entries list (local + cloud)
  const updateEntries = useCallback(async (updated: JournalEntry[]) => {
    setEntries(updated);
    saveEntries(updated);
  }, []);

  // Update a single entry
  const updateEntry = useCallback(async (entry: JournalEntry) => {
    const updated = entries.map(e => e.id === entry.id ? entry : e);
    setEntries(updated);
    saveEntries(updated);

    if (userId) {
      await supabase.from("journal_entries").upsert(entryToRow(entry, userId));
    }
  }, [entries, userId]);

  // Save vault entry (local + cloud)
  const saveVaultEntry = useCallback(async (entry: VaultEntry) => {
    const updated = [entry, ...vault.filter(v => v.id !== entry.id)];
    setVault(updated);
    saveVault(updated);

    if (userId) {
      await supabase.from("vault_entries").upsert(vaultToRow(entry, userId));
    }
  }, [vault, userId]);

  // Remove vault entry
  const removeVaultEntry = useCallback(async (id: string) => {
    const updated = vault.filter(v => v.id !== id);
    setVault(updated);
    saveVault(updated);

    if (userId) {
      await supabase.from("vault_entries").delete().eq("id", id).eq("user_id", userId);
    }
  }, [vault, userId]);

  // Save milestone
  const saveMilestone = useCallback(async (milestone: MilestoneAnalysis) => {
    const updated = [...milestones, milestone];
    setMilestones(updated);
    saveMilestones(updated);

    if (userId) {
      await supabase.from("journal_milestones").insert({
        user_id: userId,
        milestone_type: milestone.milestoneType,
        count: milestone.count,
        date: milestone.date,
        analysis: milestone.analysis as any,
      });
    }
  }, [milestones, userId]);

  return {
    entries,
    vault,
    milestones,
    syncing,
    userId,
    saveEntry,
    updateEntries,
    updateEntry,
    saveVaultEntry,
    removeVaultEntry,
    saveMilestone,
    setEntries,
    setVault,
  };
}

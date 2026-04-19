import { useState, useRef, useEffect, lazy, Suspense, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HandDrawnChart, HandDrawnCalendar, HandDrawnImage, HandDrawnMic, HandDrawnSend, HandDrawnHand } from "@/components/BotanicalElements";
import { Square, MoreVertical, Flag, Trash2, Play, Pause, Reply, SmilePlus, X, Pencil, AtSign } from "lucide-react";
import { toast } from "sonner";

const MemberProfileSheet = lazy(() => import("@/components/community/MemberProfileSheet"));

interface DBMessage {
  id: string;
  group_id: string;
  user_id: string;
  message_type: "text" | "poll" | "event" | "image" | "voice";
  content: string | null;
  media_path: string | null;
  metadata: any;
  is_removed?: boolean;
  reply_to_id?: string | null;
  mentions?: string[];
  edited_at?: string | null;
  original_content?: string | null;
  created_at: string;
}

interface Reaction { id: string; message_id: string; user_id: string; emoji: string; }

interface ChatRoomProps {
  group: { id: string; name?: string; suburb: string; city?: string | null; members_count?: number | null; challenges?: any; [key: string]: any };
  initialDmUserId?: string | null;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VOICE_SECONDS = 60;
const EDIT_WINDOW_MS = 15 * 60 * 1000;
const QUICK_EMOJIS = ["❤️", "🌱", "🙏", "👏", "😂", "🤔"];

function initialsOf(name: string | null | undefined) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function Avatar({ initials, size = 28 }: { initials: string; size?: number }) {
  return (
    <div className="rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <span className="font-body font-bold text-primary" style={{ fontSize: size * 0.33 }}>{initials}</span>
    </div>
  );
}

function ImageBubble({ path, isMe }: { path: string; isMe: boolean }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    supabase.storage.from("community-media").createSignedUrl(path, 3600).then(({ data }) => {
      if (active && data?.signedUrl) setUrl(data.signedUrl);
    });
    return () => { active = false; };
  }, [path]);
  return (
    <div className={`overflow-hidden ${isMe ? "rounded-[14px_14px_4px_14px]" : "rounded-[14px_14px_14px_4px]"} max-w-[260px] bg-secondary/40`}>
      {url ? <img src={url} alt="Shared in chat" loading="lazy" className="block w-full h-auto" /> : <div className="aspect-square animate-pulse bg-muted/40" />}
    </div>
  );
}

function VoiceBubble({ path, durationSec, isMe }: { path: string; durationSec?: number; isMe: boolean }) {
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    let active = true;
    supabase.storage.from("community-media").createSignedUrl(path, 3600).then(({ data }) => {
      if (active && data?.signedUrl) setUrl(data.signedUrl);
    });
    return () => { active = false; };
  }, [path]);
  const toggle = () => { if (!audioRef.current) return; if (playing) audioRef.current.pause(); else audioRef.current.play(); };
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2.5 ${isMe ? "bg-primary text-primary-foreground rounded-[14px_14px_4px_14px]" : "bg-card border border-border rounded-[14px_14px_14px_4px]"}`}>
      <button onClick={toggle} disabled={!url} className="touch-btn flex-shrink-0 w-8 h-8 rounded-full bg-background/20 flex items-center justify-center disabled:opacity-50" aria-label={playing ? "Pause" : "Play"}>
        {playing ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="w-[2px] rounded-full bg-current/60" style={{ height: 4 + Math.abs(Math.sin(i * 1.7)) * 14 }} />
        ))}
      </div>
      <span className="font-body text-[10px] opacity-70">{durationSec ? `${Math.round(durationSec)}s` : "voice"}</span>
      {url && <audio ref={audioRef} src={url} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} preload="none" />}
    </div>
  );
}

function ReactionsRow({ msgId, reactions, me, onToggle }: { msgId: string; reactions: Reaction[]; me: string | null; onToggle: (emoji: string) => void; }) {
  const grouped = useMemo(() => {
    const map = new Map<string, { count: number; mine: boolean }>();
    for (const r of reactions) {
      const cur = map.get(r.emoji) || { count: 0, mine: false };
      cur.count += 1;
      if (r.user_id === me) cur.mine = true;
      map.set(r.emoji, cur);
    }
    return Array.from(map.entries());
  }, [reactions, me]);
  if (grouped.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {grouped.map(([emoji, { count, mine }]) => (
        <button key={emoji} onClick={() => onToggle(emoji)} className={`touch-btn px-2 py-0.5 rounded-full border text-[11px] flex items-center gap-1 ${mine ? "bg-primary/15 border-primary/40 text-primary" : "bg-card border-border text-foreground"}`}>
          <span>{emoji}</span><span className="font-body font-medium">{count}</span>
        </button>
      ))}
    </div>
  );
}

export default function ChatRoom({ group, initialDmUserId }: ChatRoomProps) {
  const [me, setMe] = useState<string | null>(null);
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { display_name: string; avatar_url: string | null }>>({});
  const [memberDirectory, setMemberDirectory] = useState<{ user_id: string; display_name: string }[]>([]);
  const [input, setInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [sending, setSending] = useState(false);
  const [blocked, setBlocked] = useState<{ reflection: string; suggested_rewrite?: string } | null>(null);
  const [showPoll, setShowPoll] = useState(false);
  const [showEvent, setShowEvent] = useState(false);
  const [pollQ, setPollQ] = useState("");
  const [pollOpts, setPollOpts] = useState(["", ""]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLoc, setEventLoc] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openReactionPickerFor, setOpenReactionPickerFor] = useState<string | null>(null);
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Map<string, number>>(new Map());
  const [replyTo, setReplyTo] = useState<DBMessage | null>(null);
  const [editing, setEditing] = useState<DBMessage | null>(null);
  const [mentionPickerOpen, setMentionPickerOpen] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const recordingStartRef = useRef<number>(0);
  const presenceChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastTypingSentRef = useRef<number>(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [viewingMember, setViewingMember] = useState<{ userId: string; name: string } | null>(null);

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null)); }, []);

  // Mark group as read whenever messages arrive
  useEffect(() => {
    if (!me || !group?.id) return;
    const t = setTimeout(() => {
      supabase
        .from("community_last_reads")
        .upsert({ user_id: me, group_id: group.id, last_read_at: new Date().toISOString() }, { onConflict: "user_id,group_id" })
        .then(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [me, group?.id, messages.length]);

  useEffect(() => {
    if (!group?.id || !me) return;
    let messageChannel: ReturnType<typeof supabase.channel> | null = null;
    let reactionChannel: ReturnType<typeof supabase.channel> | null = null;
    let presenceChannel: ReturnType<typeof supabase.channel> | null = null;

    const load = async () => {
      const [{ data: msgs }, { data: members }] = await Promise.all([
        supabase.from("community_messages").select("*").eq("group_id", group.id).eq("is_removed", false).order("created_at", { ascending: true }).limit(200),
        supabase.from("community_memberships").select("user_id").eq("group_id", group.id),
      ]);
      if (msgs) {
        setMessages(msgs as DBMessage[]);
        const ids = new Set<string>();
        for (const m of msgs as DBMessage[]) { ids.add(m.user_id); (m.mentions || []).forEach((mid) => ids.add(mid)); }
        await loadProfilesFor(Array.from(ids));
        const messageIds = (msgs as DBMessage[]).map((m) => m.id);
        if (messageIds.length > 0) {
          const { data: rx } = await supabase.from("message_reactions").select("*").in("message_id", messageIds);
          if (rx) setReactions(rx as Reaction[]);
        }
      }
      if (members) {
        const memberIds = members.map((m: any) => m.user_id);
        await loadProfilesFor(memberIds);
        const { data: profs } = await supabase.from("profiles").select("user_id, display_name").in("user_id", memberIds);
        if (profs) setMemberDirectory(profs.map((p: any) => ({ user_id: p.user_id, display_name: p.display_name || "Member" })));
      }
    };
    load();

    messageChannel = supabase
      .channel(`community-msg-${group.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "community_messages", filter: `group_id=eq.${group.id}` }, async (payload) => {
        const m = payload.new as DBMessage;
        if (m.is_removed) return;
        setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
        const ids = new Set<string>([m.user_id, ...(m.mentions || [])]);
        await loadProfilesFor(Array.from(ids));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "community_messages", filter: `group_id=eq.${group.id}` }, (payload) => {
        const m = payload.new as DBMessage;
        setMessages((prev) => m.is_removed ? prev.filter((x) => x.id !== m.id) : prev.map((x) => (x.id === m.id ? m : x)));
      })
      .subscribe();

    reactionChannel = supabase
      .channel(`community-rx-${group.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "message_reactions" }, (payload) => {
        const r = payload.new as Reaction;
        setReactions((prev) => (prev.some((x) => x.id === r.id) ? prev : [...prev, r]));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "message_reactions" }, (payload) => {
        const r = payload.old as Reaction;
        setReactions((prev) => prev.filter((x) => x.id !== r.id));
      })
      .subscribe();

    presenceChannel = supabase.channel(`community-presence-${group.id}`, { config: { presence: { key: me }, broadcast: { self: false } } });
    presenceChannelRef.current = presenceChannel;
    presenceChannel
      .on("presence", { event: "sync" }, () => { setOnlineIds(new Set(Object.keys(presenceChannel!.presenceState()))); })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const uid = payload?.user_id as string | undefined;
        if (!uid || uid === me) return;
        setTypingUsers((prev) => { const next = new Map(prev); next.set(uid, Date.now() + 4000); return next; });
      })
      .subscribe(async (status) => { if (status === "SUBSCRIBED") await presenceChannel!.track({ online_at: new Date().toISOString() }); });

    return () => {
      if (messageChannel) supabase.removeChannel(messageChannel);
      if (reactionChannel) supabase.removeChannel(reactionChannel);
      if (presenceChannel) supabase.removeChannel(presenceChannel);
      presenceChannelRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group?.id, me]);

  useEffect(() => {
    const t = window.setInterval(() => {
      setTypingUsers((prev) => {
        const now = Date.now(); let changed = false; const next = new Map(prev);
        for (const [k, expiry] of next) if (expiry < now) { next.delete(k); changed = true; }
        return changed ? next : prev;
      });
    }, 1500);
    return () => window.clearInterval(t);
  }, []);

  const loadProfilesFor = async (ids: string[]) => {
    const unique = Array.from(new Set(ids)).filter((id) => id && !profiles[id]);
    if (unique.length === 0) return;
    const { data } = await supabase.from("profiles").select("user_id, display_name, avatar_url").in("user_id", unique);
    if (data) {
      setProfiles((prev) => {
        const next = { ...prev };
        for (const p of data) next[p.user_id] = { display_name: p.display_name || "Member", avatar_url: p.avatar_url };
        return next;
      });
    }
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  useEffect(() => {
    if (!initialDmUserId || !memberDirectory.length) return;
    const found = memberDirectory.find((m) => m.user_id === initialDmUserId);
    if (found && !input) {
      setInput(`@${found.display_name.split(" ")[0]} `);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDmUserId, memberDirectory.length]);

  useEffect(() => {
    if (!openMenuId && !openReactionPickerFor) return;
    const handler = () => { setOpenMenuId(null); setOpenReactionPickerFor(null); };
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [openMenuId, openReactionPickerFor]);

  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("en-NZ", { hour: "numeric", minute: "2-digit", hour12: true });

  const parseMentions = (text: string): string[] => {
    const ids: string[] = [];
    for (const m of memberDirectory) {
      const first = m.display_name.split(" ")[0];
      const re = new RegExp(`@${first.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (re.test(text)) ids.push(m.user_id);
    }
    return Array.from(new Set(ids));
  };

  const renderMessageContent = (text: string) => {
    const parts: (string | { mention: string })[] = [];
    const re = /@(\w+)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
      parts.push({ mention: match[1] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex));
    return parts.map((p, i) => {
      if (typeof p === "string") return <span key={i}>{p}</span>;
      const memberMatch = memberDirectory.find((m) => m.display_name.toLowerCase().startsWith(p.mention.toLowerCase()));
      const isMyMention = memberMatch?.user_id === me;
      return (
        <span key={i} className={`font-body font-semibold ${isMyMention ? "bg-primary/20 text-primary px-1 rounded" : "text-primary"}`}>@{p.mention}</span>
      );
    });
  };

  const insertMessage = async (type: DBMessage["message_type"], content: string | null, metadata: any = {}, media_path: string | null = null, extras: { reply_to_id?: string | null; mentions?: string[] } = {}) => {
    if (!me) return;
    setSending(true);
    const { error } = await supabase.from("community_messages").insert({
      group_id: group.id, user_id: me, message_type: type, content, metadata, media_path,
      reply_to_id: extras.reply_to_id ?? null, mentions: extras.mentions ?? [],
    });
    setSending(false);
    if (error) { console.error("Failed to send:", error); toast.error("Couldn't send message"); }
  };

  const send = async () => {
    if (!input.trim() || !me) return;
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("community-moderate", { body: { text: input } });
      if (error) throw error;
      if (!data?.safe) { setBlocked(data); setChecking(false); return; }
    } catch {}
    const text = input;
    const mentions = parseMentions(text);
    const replyId = replyTo?.id ?? null;
    const editingMsg = editing;
    setInput(""); setReplyTo(null); setEditing(null); setChecking(false);

    if (editingMsg) {
      const { error } = await supabase.from("community_messages").update({
        content: text, mentions, edited_at: new Date().toISOString(),
        original_content: editingMsg.original_content ?? editingMsg.content,
      }).eq("id", editingMsg.id);
      if (error) { console.error(error); toast.error("Couldn't save edit"); }
      return;
    }
    await insertMessage("text", text, {}, null, { reply_to_id: replyId, mentions });
  };

  const sendPoll = async () => {
    if (!pollQ.trim()) return;
    const opts = pollOpts.filter((o) => o.trim());
    if (opts.length < 2) return;
    await insertMessage("poll", pollQ, { options: opts, votes: opts.map(() => 0), voters: {} });
    setPollQ(""); setPollOpts(["", ""]); setShowPoll(false);
  };

  const sendEvent = async () => {
    if (!eventTitle.trim()) return;
    await insertMessage("event", eventTitle, { date: eventDate, location: eventLoc, going: [] });
    setEventTitle(""); setEventDate(""); setEventLoc(""); setShowEvent(false);
  };

  const votePoll = async (msg: DBMessage, optionIndex: number) => {
    if (!me) return;
    const voters = msg.metadata?.voters || {};
    if (voters[me] !== undefined) return;
    const newVotes = [...(msg.metadata?.votes || [])];
    newVotes[optionIndex] = (newVotes[optionIndex] || 0) + 1;
    const newMetadata = { ...msg.metadata, votes: newVotes, voters: { ...voters, [me]: optionIndex } };
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, metadata: newMetadata } : m)));
    await supabase.from("community_messages").update({ metadata: newMetadata }).eq("id", msg.id);
  };

  const toggleRSVP = async (msg: DBMessage) => {
    if (!me) return;
    const going: string[] = msg.metadata?.going || [];
    const next = going.includes(me) ? going.filter((u) => u !== me) : [...going, me];
    const newMetadata = { ...msg.metadata, going: next };
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, metadata: newMetadata } : m)));
    await supabase.from("community_messages").update({ metadata: newMetadata }).eq("id", msg.id);
  };

  const handleImage = () => fileRef.current?.click();
  const onImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file || !me) return;
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image"); return; }
    if (file.size > MAX_IMAGE_BYTES) { toast.error("Image must be under 5MB"); return; }
    setSending(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${group.id}/${me}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("community-media").upload(path, file, { contentType: file.type });
    if (upErr) { setSending(false); console.error(upErr); toast.error("Image upload failed"); return; }
    await insertMessage("image", null, { mime: file.type, size: file.size }, path, { reply_to_id: replyTo?.id ?? null });
    setReplyTo(null);
  };

  const startRecording = async () => {
    if (!me) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const seconds = Math.min(MAX_VOICE_SECONDS, (Date.now() - recordingStartRef.current) / 1000);
        const blob = new Blob(audioChunksRef.current, { type: mr.mimeType || "audio/webm" });
        if (blob.size === 0) return;
        if (blob.size > MAX_IMAGE_BYTES) { toast.error("Recording too large"); return; }
        const ext = (mr.mimeType || "audio/webm").includes("mp4") ? "mp4" : "webm";
        const path = `${group.id}/${me}/${Date.now()}.${ext}`;
        setSending(true);
        const { error: upErr } = await supabase.storage.from("community-media").upload(path, blob, { contentType: blob.type });
        if (upErr) { setSending(false); console.error(upErr); toast.error("Voice upload failed"); return; }
        await insertMessage("voice", null, { mime: blob.type, duration_sec: seconds }, path);
      };
      mediaRecorderRef.current = mr;
      recordingStartRef.current = Date.now();
      setRecordingSeconds(0);
      recordingTimerRef.current = window.setInterval(() => {
        const s = (Date.now() - recordingStartRef.current) / 1000;
        setRecordingSeconds(s);
        if (s >= MAX_VOICE_SECONDS) stopRecording();
      }, 250);
      mr.start();
      setRecording(true);
    } catch (err) { console.error(err); toast.error("Microphone permission needed"); }
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) { window.clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleVoice = () => { if (recording) stopRecording(); else startRecording(); };

  const reportMessage = async (msg: DBMessage) => {
    setOpenMenuId(null);
    const reason = window.prompt("Why are you reporting this message? (optional)") ?? null;
    const { error } = await supabase.from("moderation_queue").insert({ message_id: msg.id, reporter_id: me, reason, status: "pending" });
    if (error) { console.error(error); toast.error("Couldn't report"); } else toast.success("Reported. Our team will review.");
  };

  const deleteOwnMessage = async (msg: DBMessage) => {
    setOpenMenuId(null);
    const { error } = await supabase.from("community_messages").update({ is_removed: true }).eq("id", msg.id);
    if (error) { console.error(error); toast.error("Couldn't delete"); }
    else setMessages((prev) => prev.filter((x) => x.id !== msg.id));
  };

  const startEdit = (msg: DBMessage) => { setOpenMenuId(null); setEditing(msg); setReplyTo(null); setInput(msg.content || ""); setTimeout(() => inputRef.current?.focus(), 50); };
  const cancelEdit = () => { setEditing(null); setInput(""); };

  const toggleReaction = async (msgId: string, emoji: string) => {
    if (!me) return;
    setOpenReactionPickerFor(null);
    const existing = reactions.find((r) => r.message_id === msgId && r.user_id === me && r.emoji === emoji);
    if (existing) {
      setReactions((prev) => prev.filter((r) => r.id !== existing.id));
      const { error } = await supabase.from("message_reactions").delete().eq("id", existing.id);
      if (error) console.error(error);
    } else {
      const tempId = `tmp-${Date.now()}`;
      setReactions((prev) => [...prev, { id: tempId, message_id: msgId, user_id: me, emoji }]);
      const { data, error } = await supabase.from("message_reactions").insert({ message_id: msgId, user_id: me, emoji }).select().single();
      if (error) { console.error(error); setReactions((prev) => prev.filter((r) => r.id !== tempId)); }
      else if (data) setReactions((prev) => prev.map((r) => (r.id === tempId ? (data as Reaction) : r)));
    }
  };

  const scrollToMessage = (id: string) => {
    const el = messageRefs.current.get(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedMsgId(id);
    setTimeout(() => setHighlightedMsgId(null), 1500);
  };

  const sendTyping = () => {
    if (!presenceChannelRef.current || !me) return;
    const now = Date.now();
    if (now - lastTypingSentRef.current < 2000) return;
    lastTypingSentRef.current = now;
    presenceChannelRef.current.send({ type: "broadcast", event: "typing", payload: { user_id: me } });
  };

  const onInputChange = (val: string) => {
    setInput(val);
    sendTyping();
    const lastAt = val.lastIndexOf("@");
    if (lastAt >= 0) {
      const after = val.slice(lastAt + 1);
      if (!after.includes(" ") && after.length <= 15) { setMentionFilter(after); setMentionPickerOpen(true); return; }
    }
    setMentionPickerOpen(false);
  };

  const insertMention = (displayName: string) => {
    const lastAt = input.lastIndexOf("@");
    const before = input.slice(0, lastAt);
    const first = displayName.split(" ")[0];
    setInput(`${before}@${first} `);
    setMentionPickerOpen(false);
    inputRef.current?.focus();
  };

  const challenge = Array.isArray(group.challenges) ? group.challenges[0] : null;
  const onlineCount = onlineIds.size;
  const typingNames = useMemo(() => {
    const names: string[] = [];
    for (const uid of typingUsers.keys()) { const p = profiles[uid]; if (p) names.push(p.display_name.split(" ")[0]); }
    return names;
  }, [typingUsers, profiles]);

  const filteredMentionMembers = memberDirectory
    .filter((m) => m.user_id !== me && m.display_name.toLowerCase().includes(mentionFilter.toLowerCase()))
    .slice(0, 6);

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 280px)", minHeight: 400 }}>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImageSelected} />

      <div className="pb-3 border-b border-border mb-3 flex-shrink-0">
        <h3 className="font-display text-lg font-bold italic text-foreground">{group.suburb} Community</h3>
        <p className="font-body text-[11px] text-muted-foreground flex items-center gap-1.5">
          {group.members_count || 0} neighbours · {group.city || group.suburb}
          {onlineCount > 0 && (
            <>
              <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/40 mx-0.5" />
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {onlineCount} online
              </span>
            </>
          )}
        </p>
      </div>

      {challenge && (
        <div className="bg-amber-50 rounded-[10px] px-3 py-2 mb-3 flex-shrink-0">
          <span className="font-body text-[10px] text-primary mr-1.5">Challenge</span>
          <span className="font-display text-xs italic text-foreground/70">{challenge}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-0.5 scroll-y">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="font-display text-sm italic text-muted-foreground">No messages yet. Be the first to say hello.</p>
          </div>
        )}
        {messages.map((m) => {
          const isMe = m.user_id === me;
          const profile = profiles[m.user_id];
          const name = isMe ? "You" : profile?.display_name || "Member";
          const avatar = isMe ? "ME" : initialsOf(profile?.display_name);
          const time = fmtTime(m.created_at);
          const isOnline = onlineIds.has(m.user_id);
          const msgReactions = reactions.filter((r) => r.message_id === m.id);
          const replyTarget = m.reply_to_id ? messages.find((x) => x.id === m.reply_to_id) : null;
          const replyTargetName = replyTarget ? (replyTarget.user_id === me ? "you" : profiles[replyTarget.user_id]?.display_name || "Member") : null;
          const canEdit = isMe && m.message_type === "text" && (Date.now() - new Date(m.created_at).getTime() < EDIT_WINDOW_MS);
          const isMentioned = me && (m.mentions || []).includes(me);
          const isHighlighted = highlightedMsgId === m.id;

          return (
            <div
              key={m.id}
              ref={(el) => { messageRefs.current.set(m.id, el); }}
              className={`flex gap-2 mb-3.5 items-start ${isMe ? "flex-row-reverse" : ""} transition-colors rounded-lg ${isHighlighted ? "bg-primary/10" : ""} ${isMentioned && !isMe ? "bg-primary/5" : ""}`}
            >
              {!isMe && (
                <div className="cursor-pointer relative pt-0.5" onClick={() => setViewingMember({ userId: m.user_id, name })}>
                  <Avatar initials={avatar} />
                  {isOnline && <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-primary border border-card" />}
                </div>
              )}
              <div className={`max-w-[78%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && (<span className="font-body text-[10px] text-muted-foreground mb-0.5">{name} · {time}</span>)}

                {replyTarget && (
                  <button onClick={() => scrollToMessage(replyTarget.id)} className={`touch-btn text-left max-w-full mb-1 px-2.5 py-1.5 rounded-lg border-l-2 border-primary bg-secondary/40 ${isMe ? "self-end" : "self-start"}`}>
                    <p className="font-body text-[10px] text-primary mb-0.5">↳ {replyTargetName}</p>
                    <p className="font-display text-[11px] italic text-muted-foreground line-clamp-1">
                      {replyTarget.is_removed ? "(deleted)" : replyTarget.content || (replyTarget.message_type === "image" ? "📷 image" : replyTarget.message_type === "voice" ? "🎙 voice" : replyTarget.message_type)}
                    </p>
                  </button>
                )}

                <div className="relative group">
                  {m.message_type === "text" && (
                    <div className={`px-3.5 py-2.5 shadow-sm ${isMe ? "bg-primary rounded-[14px_14px_4px_14px]" : "bg-card border border-border rounded-[14px_14px_14px_4px]"}`}>
                      <span className={`font-display text-sm italic leading-relaxed whitespace-pre-wrap ${isMe ? "text-primary-foreground" : "text-foreground"}`}>
                        {renderMessageContent(m.content || "")}
                      </span>
                      {m.edited_at && (
                        <span className={`font-body text-[9px] ml-1.5 italic ${isMe ? "text-primary-foreground/60" : "text-muted-foreground"}`}>(edited)</span>
                      )}
                    </div>
                  )}

                  {m.message_type === "image" && m.media_path && <ImageBubble path={m.media_path} isMe={isMe} />}
                  {m.message_type === "voice" && m.media_path && <VoiceBubble path={m.media_path} durationSec={m.metadata?.duration_sec} isMe={isMe} />}

                  {m.message_type === "poll" && (
                    <div className="card-warm p-3.5 min-w-[210px] w-full">
                      <p className="font-body text-[10px] text-primary mb-1 flex items-center gap-1">
                        <HandDrawnChart size={12} color="hsl(var(--primary))" /> poll
                      </p>
                      <p className="font-display text-sm italic text-foreground mb-2">{m.content}</p>
                      {(m.metadata?.options || []).map((opt: string, i: number) => {
                        const votes: number[] = m.metadata?.votes || [];
                        const total = votes.reduce((a, b) => a + b, 0);
                        const pct = total ? Math.round(((votes[i] || 0) / total) * 100) : 0;
                        const myVote = me ? m.metadata?.voters?.[me] : undefined;
                        const hasVoted = myVote !== undefined;
                        const isMine = myVote === i;
                        return (
                          <button key={i} onClick={() => votePoll(m, i)} disabled={hasVoted} className={`touch-btn flex items-center w-full mb-1 px-2.5 py-2 rounded-lg border relative overflow-hidden ${isMine ? "border-primary bg-primary/10" : hasVoted ? "border-border bg-primary/5" : "border-border bg-card active:bg-secondary/50"}`}>
                            {hasVoted && <div className="absolute left-0 top-0 bottom-0 bg-primary/10 rounded-lg" style={{ width: `${pct}%` }} />}
                            <span className="font-display text-[13px] italic text-foreground flex-1 relative text-left">{opt}</span>
                            {hasVoted && <span className="font-body text-[11px] text-muted-foreground relative">{pct}%</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {m.message_type === "event" && (
                    <div className="card-warm p-3.5 min-w-[230px] w-full border-l-[3px] border-l-primary">
                      <p className="font-body text-[10px] text-primary mb-1 flex items-center gap-1">
                        <HandDrawnCalendar size={12} color="hsl(var(--primary))" /> event
                      </p>
                      <p className="font-display text-[15px] font-bold italic text-foreground mb-0.5">{m.content}</p>
                      {m.metadata?.date && <p className="font-body text-[11px] text-muted-foreground mb-0.5">{m.metadata.date}</p>}
                      {m.metadata?.location && <p className="font-body text-[11px] text-muted-foreground mb-2">{m.metadata.location}</p>}
                      <button onClick={() => toggleRSVP(m)} className="touch-btn font-display text-[13px] italic rounded-full px-4 py-2 bg-primary text-primary-foreground">
                        {me && (m.metadata?.going || []).includes(me) ? `✓ Going (${(m.metadata?.going || []).length})` : `I'm going (${(m.metadata?.going || []).length})`}
                      </button>
                    </div>
                  )}

                  <div className={`absolute top-1 ${isMe ? "-left-16" : "-right-16"} flex items-center gap-0.5 opacity-60 hover:opacity-100`}>
                    <button onClick={(e) => { e.stopPropagation(); setOpenReactionPickerFor(openReactionPickerFor === m.id ? null : m.id); setOpenMenuId(null); }} className="touch-btn p-1 rounded-full" aria-label="React">
                      <SmilePlus size={14} className="text-muted-foreground" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setReplyTo(m); setEditing(null); inputRef.current?.focus(); }} className="touch-btn p-1 rounded-full" aria-label="Reply">
                      <Reply size={14} className="text-muted-foreground" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === m.id ? null : m.id); setOpenReactionPickerFor(null); }} className="touch-btn p-1 rounded-full" aria-label="More">
                      <MoreVertical size={14} className="text-muted-foreground" />
                    </button>
                  </div>

                  {openReactionPickerFor === m.id && (
                    <div onClick={(e) => e.stopPropagation()} className={`absolute z-30 ${isMe ? "right-0" : "left-0"} -top-10 bg-card border border-border rounded-full shadow-lg px-2 py-1 flex gap-0.5`}>
                      {QUICK_EMOJIS.map((e) => (
                        <button key={e} onClick={() => toggleReaction(m.id, e)} className="touch-btn w-7 h-7 rounded-full hover:bg-secondary text-base flex items-center justify-center">
                          {e}
                        </button>
                      ))}
                    </div>
                  )}

                  {openMenuId === m.id && (
                    <div onClick={(e) => e.stopPropagation()} className={`absolute z-20 ${isMe ? "right-0" : "left-0"} top-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden min-w-[140px]`}>
                      {canEdit && (
                        <button onClick={() => startEdit(m)} className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-secondary/50 font-body text-xs text-foreground">
                          <Pencil size={12} /> Edit
                        </button>
                      )}
                      {isMe ? (
                        <button onClick={() => deleteOwnMessage(m)} className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-secondary/50 font-body text-xs text-destructive">
                          <Trash2 size={12} /> Delete
                        </button>
                      ) : (
                        <button onClick={() => reportMessage(m)} className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-secondary/50 font-body text-xs text-foreground">
                          <Flag size={12} /> Report
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <ReactionsRow msgId={m.id} reactions={msgReactions} me={me} onToggle={(emoji) => toggleReaction(m.id, emoji)} />

                {isMe && <span className="font-body text-[10px] text-muted-foreground mt-0.5">{time}{m.edited_at ? " · edited" : ""}</span>}
              </div>
            </div>
          );
        })}
        {typingNames.length > 0 && (
          <div className="flex items-center gap-2 mb-2 ml-9 text-muted-foreground">
            <div className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <span className="font-display text-[11px] italic">
              {typingNames.length === 1 ? `${typingNames[0]} is typing…` : `${typingNames.slice(0, 2).join(", ")} are typing…`}
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {blocked && (
        <div className="bg-amber-50 border border-primary/20 rounded-card p-4 mb-2.5 flex-shrink-0">
          <p className="font-body text-[11px] text-primary mb-1.5 flex items-center gap-1">
            <HandDrawnHand size={14} color="hsl(var(--primary))" /> Pause for a moment
          </p>
          <p className="font-display text-sm italic text-foreground leading-relaxed mb-2.5">{blocked.reflection}</p>
          {blocked.suggested_rewrite && (
            <div className="bg-primary/10 rounded-[10px] p-2.5 mb-2.5">
              <p className="font-body text-[10px] text-primary mb-0.5">Suggested response</p>
              <p className="font-display text-[13px] italic text-primary leading-relaxed">{blocked.suggested_rewrite}</p>
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            {blocked.suggested_rewrite && (
              <button onClick={async () => { const rewrite = blocked.suggested_rewrite!; setInput(""); setBlocked(null); await insertMessage("text", rewrite); }} className="touch-btn font-display text-[13px] italic text-primary-foreground bg-primary rounded-full px-4 py-2">Send this instead</button>
            )}
            <button onClick={() => { setBlocked(null); setInput(""); }} className="touch-btn font-display text-[13px] italic text-muted-foreground bg-secondary rounded-full px-3.5 py-2">Discard</button>
          </div>
        </div>
      )}

      {showPoll && (
        <div className="card-warm p-3.5 mb-2 flex-shrink-0">
          <p className="font-body text-[11px] text-primary mb-2">Create a poll</p>
          <input value={pollQ} onChange={(e) => setPollQ(e.target.value)} placeholder="Your question…" className="w-full px-3 py-2.5 rounded-[10px] border border-border bg-secondary/30 font-display text-sm italic text-foreground mb-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30" style={{ fontSize: "16px" }} inputMode="text" autoComplete="off" />
          {pollOpts.map((o, i) => (
            <input key={i} value={o} onChange={(e) => { const n = [...pollOpts]; n[i] = e.target.value; setPollOpts(n); }} placeholder={`Option ${i + 1}`} className="w-full px-3 py-2 rounded-[10px] border border-border bg-secondary/30 font-display text-sm italic text-foreground mb-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30" style={{ fontSize: "16px" }} inputMode="text" autoComplete="off" />
          ))}
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setPollOpts((o) => [...o, ""])} className="touch-btn font-body text-[11px] text-muted-foreground border border-border rounded-full px-2.5 py-1.5">+ option</button>
            <button onClick={sendPoll} className="touch-btn font-display text-[13px] italic text-primary-foreground bg-primary rounded-full px-4 py-2">Send poll</button>
            <button onClick={() => setShowPoll(false)} className="touch-btn font-body text-[11px] text-muted-foreground py-1.5">Cancel</button>
          </div>
        </div>
      )}

      {showEvent && (
        <div className="card-warm p-3.5 mb-2 flex-shrink-0">
          <p className="font-body text-[11px] text-primary mb-2">Create an event</p>
          <input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Event name…" className="w-full px-3 py-2.5 rounded-[10px] border border-border bg-secondary/30 font-display text-sm italic text-foreground mb-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30" style={{ fontSize: "16px" }} inputMode="text" autoComplete="off" />
          <input value={eventDate} onChange={(e) => setEventDate(e.target.value)} placeholder="Date and time…" className="w-full px-3 py-2 rounded-[10px] border border-border bg-secondary/30 font-display text-sm italic text-foreground mb-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30" style={{ fontSize: "16px" }} inputMode="text" autoComplete="off" />
          <input value={eventLoc} onChange={(e) => setEventLoc(e.target.value)} placeholder="Location…" className="w-full px-3 py-2 rounded-[10px] border border-border bg-secondary/30 font-display text-sm italic text-foreground mb-2 focus:outline-none focus:ring-2 focus:ring-primary/30" style={{ fontSize: "16px" }} inputMode="text" autoComplete="off" />
          <div className="flex gap-2 flex-wrap">
            <button onClick={sendEvent} className="touch-btn font-display text-[13px] italic text-primary-foreground bg-primary rounded-full px-4 py-2">Post event</button>
            <button onClick={() => setShowEvent(false)} className="touch-btn font-body text-[11px] text-muted-foreground py-1.5">Cancel</button>
          </div>
        </div>
      )}

      {recording && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 mb-2 rounded-full bg-destructive/10 border border-destructive/30 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="font-body text-xs text-destructive">Recording · {Math.floor(recordingSeconds)}s / {MAX_VOICE_SECONDS}s</span>
          </div>
          <button onClick={stopRecording} className="touch-btn font-body text-[11px] text-destructive font-semibold">Stop & send</button>
        </div>
      )}

      {(replyTo || editing) && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 mb-2 rounded-lg border-l-[3px] border-primary bg-secondary/40 flex-shrink-0">
          <div className="min-w-0">
            <p className="font-body text-[10px] text-primary uppercase tracking-wide">
              {editing ? "Editing message" : `Replying to ${replyTo?.user_id === me ? "yourself" : (profiles[replyTo!.user_id]?.display_name || "Member")}`}
            </p>
            <p className="font-display text-[12px] italic text-muted-foreground truncate">
              {(editing?.content || replyTo?.content || "").slice(0, 90)}
            </p>
          </div>
          <button onClick={() => editing ? cancelEdit() : setReplyTo(null)} className="touch-btn p-1 text-muted-foreground" aria-label="Cancel">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="border-t border-border pt-2.5 flex-shrink-0 relative">
        {mentionPickerOpen && filteredMentionMembers.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-30 max-h-48 overflow-y-auto">
            {filteredMentionMembers.map((m) => (
              <button key={m.user_id} onClick={() => insertMention(m.display_name)} className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-secondary/50">
                <Avatar initials={initialsOf(m.display_name)} size={22} />
                <span className="font-display text-sm italic text-foreground">{m.display_name}</span>
              </button>
            ))}
          </div>
        )}

        {!editing && (
          <div className="flex gap-1.5 mb-1.5 overflow-x-auto scroll-snap-x pb-0.5">
            {[
              { icon: <HandDrawnChart size={13} color="hsl(var(--muted-foreground))" />, label: "poll", action: () => { setShowPoll((p) => !p); setShowEvent(false); } },
              { icon: <HandDrawnCalendar size={13} color="hsl(var(--muted-foreground))" />, label: "event", action: () => { setShowEvent((e) => !e); setShowPoll(false); } },
              { icon: <HandDrawnImage size={13} color="hsl(var(--muted-foreground))" />, label: "image", action: handleImage },
              { icon: recording ? <Square size={13} color="hsl(var(--destructive))" /> : <HandDrawnMic size={13} color="hsl(var(--muted-foreground))" />, label: recording ? "stop" : "voice", action: handleVoice },
              { icon: <AtSign size={13} color="hsl(var(--muted-foreground))" />, label: "mention", action: () => { setInput((v) => `${v}${v && !v.endsWith(" ") ? " " : ""}@`); setMentionFilter(""); setMentionPickerOpen(true); inputRef.current?.focus(); } },
            ].map((b) => (
              <button key={b.label} onClick={b.action} className={`touch-btn font-body text-[11px] bg-secondary/50 border-none rounded-full px-2.5 py-1.5 flex-shrink-0 scroll-snap-item flex items-center gap-1 ${recording && b.label === "stop" ? "text-destructive" : "text-muted-foreground"}`}>
                {b.icon}{b.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } if (e.key === "Escape") { setMentionPickerOpen(false); cancelEdit(); setReplyTo(null); } }}
            placeholder={editing ? "Edit your message…" : "Share something with your neighbours…"}
            rows={1}
            className="flex-1 px-3.5 py-2.5 rounded-[14px] border border-border bg-secondary/30 font-display text-sm italic text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-24"
            style={{ fontSize: "16px" }}
          />
          <button onClick={send} disabled={!input.trim() || checking || sending} className="touch-btn flex-shrink-0 bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center active:scale-[0.94] disabled:opacity-40" aria-label={editing ? "Save edit" : "Send message"}>
            <HandDrawnSend size={18} color="hsl(var(--primary-foreground))" />
          </button>
        </div>
        {checking && <p className="font-body text-[10px] text-muted-foreground mt-1.5 italic">Checking message…</p>}
      </div>

      {viewingMember && (
        <Suspense fallback={null}>
          <MemberProfileSheet userId={viewingMember.userId} displayName={viewingMember.name} onClose={() => setViewingMember(null)} />
        </Suspense>
      )}
    </div>
  );
}

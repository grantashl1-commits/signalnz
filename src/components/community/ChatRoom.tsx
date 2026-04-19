import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { HandDrawnChart, HandDrawnCalendar, HandDrawnImage, HandDrawnMic, HandDrawnSend, HandDrawnHand } from "@/components/BotanicalElements";
import { Square, MoreVertical, Flag, Trash2, Play, Pause } from "lucide-react";
import { toast } from "sonner";

const MemberProfileSheet = lazy(() => import("@/components/community/MemberProfileSheet"));

// ── Types ─────────────────────────────────────────────────────
interface DBMessage {
  id: string;
  group_id: string;
  user_id: string;
  message_type: "text" | "poll" | "event" | "image" | "voice";
  content: string | null;
  media_path: string | null;
  metadata: any;
  is_removed?: boolean;
  created_at: string;
}

interface ChatRoomProps {
  group: { id: string; name?: string; suburb: string; city?: string | null; members_count?: number | null; challenges?: any; [key: string]: any };
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_VOICE_SECONDS = 60;

// ── Avatar helpers ───────────────────────────────────────────
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

// ── Media bubble: signed-URL image ──
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

// ── Media bubble: signed-URL voice with simple play/pause ──
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
  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
  };
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

export default function ChatRoom({ group }: ChatRoomProps) {
  const [me, setMe] = useState<string | null>(null);
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { display_name: string; avatar_url: string | null }>>({});
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
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);
  const recordingStartRef = useRef<number>(0);
  const [viewingMember, setViewingMember] = useState<{ userId: string; name: string } | null>(null);

  // ── Load current user ──
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  }, []);

  // ── Load messages + subscribe to realtime + presence ──
  useEffect(() => {
    if (!group?.id || !me) return;

    let messageChannel: ReturnType<typeof supabase.channel> | null = null;
    let presenceChannel: ReturnType<typeof supabase.channel> | null = null;

    const load = async () => {
      const { data, error } = await supabase
        .from("community_messages")
        .select("*")
        .eq("group_id", group.id)
        .eq("is_removed", false)
        .order("created_at", { ascending: true })
        .limit(200);
      if (!error && data) {
        setMessages(data as DBMessage[]);
        await loadProfilesFor(data.map((d) => d.user_id));
      }
    };

    load();

    messageChannel = supabase
      .channel(`community-msg-${group.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_messages", filter: `group_id=eq.${group.id}` },
        async (payload) => {
          const m = payload.new as DBMessage;
          if (m.is_removed) return;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
          await loadProfilesFor([m.user_id]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "community_messages", filter: `group_id=eq.${group.id}` },
        (payload) => {
          const m = payload.new as DBMessage;
          setMessages((prev) =>
            m.is_removed ? prev.filter((x) => x.id !== m.id) : prev.map((x) => (x.id === m.id ? m : x))
          );
        }
      )
      .subscribe();

    // Real online presence
    presenceChannel = supabase.channel(`community-presence-${group.id}`, {
      config: { presence: { key: me } },
    });
    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel!.presenceState();
        setOnlineIds(new Set(Object.keys(state)));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel!.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      if (messageChannel) supabase.removeChannel(messageChannel);
      if (presenceChannel) supabase.removeChannel(presenceChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group?.id, me]);

  // ── Resolve user_id → display_name from profiles ──
  const loadProfilesFor = async (ids: string[]) => {
    const unique = Array.from(new Set(ids)).filter((id) => id && !profiles[id]);
    if (unique.length === 0) return;
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .in("user_id", unique);
    if (data) {
      setProfiles((prev) => {
        const next = { ...prev };
        for (const p of data) {
          next[p.user_id] = { display_name: p.display_name || "Member", avatar_url: p.avatar_url };
        }
        return next;
      });
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Close menu on outside click
  useEffect(() => {
    if (!openMenuId) return;
    const handler = () => setOpenMenuId(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [openMenuId]);

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-NZ", { hour: "numeric", minute: "2-digit", hour12: true });

  // ── Insert helper ──
  const insertMessage = async (
    type: DBMessage["message_type"],
    content: string | null,
    metadata: any = {},
    media_path: string | null = null
  ) => {
    if (!me) return;
    setSending(true);
    const { error } = await supabase.from("community_messages").insert({
      group_id: group.id,
      user_id: me,
      message_type: type,
      content,
      metadata,
      media_path,
    });
    setSending(false);
    if (error) {
      console.error("Failed to send message:", error);
      toast.error("Couldn't send message");
    }
  };

  const send = async () => {
    if (!input.trim() || !me) return;
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("community-moderate", { body: { text: input } });
      if (error) throw error;
      if (!data?.safe) {
        setBlocked(data);
        setChecking(false);
        return;
      }
    } catch {
      /* allow on moderation error */
    }
    const text = input;
    setInput("");
    setChecking(false);
    await insertMessage("text", text);
  };

  const sendPoll = async () => {
    if (!pollQ.trim()) return;
    const opts = pollOpts.filter((o) => o.trim());
    if (opts.length < 2) return;
    await insertMessage("poll", pollQ, { options: opts, votes: opts.map(() => 0), voters: {} });
    setPollQ("");
    setPollOpts(["", ""]);
    setShowPoll(false);
  };

  const sendEvent = async () => {
    if (!eventTitle.trim()) return;
    await insertMessage("event", eventTitle, { date: eventDate, location: eventLoc, going: [] });
    setEventTitle("");
    setEventDate("");
    setEventLoc("");
    setShowEvent(false);
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

  // ── Image upload ──
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
    if (upErr) {
      setSending(false);
      console.error("Upload failed:", upErr);
      toast.error("Image upload failed");
      return;
    }
    await insertMessage("image", null, { mime: file.type, size: file.size }, path);
  };

  // ── Voice recording ──
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
        if (upErr) {
          setSending(false);
          console.error("Voice upload failed:", upErr);
          toast.error("Voice upload failed");
          return;
        }
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
    } catch (err) {
      console.error("Mic permission denied:", err);
      toast.error("Microphone permission needed for voice notes");
    }
  };

  const stopRecording = () => {
    if (recordingTimerRef.current) { window.clearInterval(recordingTimerRef.current); recordingTimerRef.current = null; }
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleVoice = () => { if (recording) stopRecording(); else startRecording(); };

  // ── Moderation: report / delete ──
  const reportMessage = async (msg: DBMessage) => {
    setOpenMenuId(null);
    const reason = window.prompt("Why are you reporting this message? (optional)") ?? null;
    const { error } = await supabase.from("moderation_queue").insert({
      message_id: msg.id,
      reporter_id: me,
      reason,
      status: "pending",
    });
    if (error) { console.error(error); toast.error("Couldn't report message"); }
    else toast.success("Reported. Our team will review.");
  };

  const deleteOwnMessage = async (msg: DBMessage) => {
    setOpenMenuId(null);
    const { error } = await supabase.from("community_messages").update({ is_removed: true }).eq("id", msg.id);
    if (error) { console.error(error); toast.error("Couldn't delete"); }
    else setMessages((prev) => prev.filter((x) => x.id !== msg.id));
  };

  const challenge = Array.isArray(group.challenges) ? group.challenges[0] : null;
  const onlineCount = onlineIds.size;

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 280px)", minHeight: 400 }}>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImageSelected} />

      {/* Header */}
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

      {/* Challenge banner */}
      {challenge && (
        <div className="bg-amber-50 rounded-[10px] px-3 py-2 mb-3 flex-shrink-0">
          <span className="font-body text-[10px] text-primary mr-1.5">Challenge</span>
          <span className="font-display text-xs italic text-foreground/70">{challenge}</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pr-0.5 scroll-y">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="font-display text-sm italic text-muted-foreground">
              No messages yet. Be the first to say hello.
            </p>
          </div>
        )}
        {messages.map((m) => {
          const isMe = m.user_id === me;
          const profile = profiles[m.user_id];
          const name = isMe ? "You" : profile?.display_name || "Member";
          const avatar = isMe ? "ME" : initialsOf(profile?.display_name);
          const time = fmtTime(m.created_at);
          const isOnline = onlineIds.has(m.user_id);

          return (
            <div key={m.id} className={`flex gap-2 mb-3.5 items-start ${isMe ? "flex-row-reverse" : ""}`}>
              {!isMe && (
                <div className="cursor-pointer relative" onClick={() => setViewingMember({ userId: m.user_id, name })}>
                  <Avatar initials={avatar} />
                  {isOnline && <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-primary border border-card" />}
                </div>
              )}
              <div className={`max-w-[78%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && (
                  <span className="font-body text-[10px] text-muted-foreground mb-0.5">
                    {name} · {time}
                  </span>
                )}

                <div className="relative group">
                  {m.message_type === "text" && (
                    <div className={`px-3.5 py-2.5 shadow-sm ${isMe ? "bg-primary rounded-[14px_14px_4px_14px]" : "bg-card border border-border rounded-[14px_14px_14px_4px]"}`}>
                      <span className={`font-display text-sm italic leading-relaxed whitespace-pre-wrap ${isMe ? "text-primary-foreground" : "text-foreground"}`}>
                        {m.content}
                      </span>
                    </div>
                  )}

                  {m.message_type === "image" && m.media_path && (
                    <ImageBubble path={m.media_path} isMe={isMe} />
                  )}

                  {m.message_type === "voice" && m.media_path && (
                    <VoiceBubble path={m.media_path} durationSec={m.metadata?.duration_sec} isMe={isMe} />
                  )}

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
                          <button
                            key={i}
                            onClick={() => votePoll(m, i)}
                            disabled={hasVoted}
                            className={`touch-btn flex items-center w-full mb-1 px-2.5 py-2 rounded-lg border relative overflow-hidden transition-all ${
                              isMine ? "border-primary bg-primary/10" : hasVoted ? "border-border bg-primary/5" : "border-border bg-card active:bg-secondary/50"
                            }`}
                          >
                            {hasVoted && (
                              <div className="absolute left-0 top-0 bottom-0 bg-primary/10 rounded-lg" style={{ width: `${pct}%` }} />
                            )}
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
                        {me && (m.metadata?.going || []).includes(me)
                          ? `✓ Going (${(m.metadata?.going || []).length})`
                          : `I'm going (${(m.metadata?.going || []).length})`}
                      </button>
                    </div>
                  )}

                  {/* Message menu trigger */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === m.id ? null : m.id); }}
                    className={`absolute top-1 ${isMe ? "-left-7" : "-right-7"} touch-btn opacity-60 hover:opacity-100 p-1 rounded-full`}
                    aria-label="Message options"
                  >
                    <MoreVertical size={14} className="text-muted-foreground" />
                  </button>
                  {openMenuId === m.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className={`absolute z-20 ${isMe ? "right-0" : "left-0"} top-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden min-w-[140px]`}
                    >
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

                {isMe && <span className="font-body text-[10px] text-muted-foreground mt-0.5">{time}</span>}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Moderation block */}
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
              <button
                onClick={async () => {
                  const rewrite = blocked.suggested_rewrite!;
                  setInput("");
                  setBlocked(null);
                  await insertMessage("text", rewrite);
                }}
                className="touch-btn font-display text-[13px] italic text-primary-foreground bg-primary rounded-full px-4 py-2"
              >
                Send this instead
              </button>
            )}
            <button onClick={() => { setBlocked(null); setInput(""); }} className="touch-btn font-display text-[13px] italic text-muted-foreground bg-secondary rounded-full px-3.5 py-2">
              Discard
            </button>
          </div>
        </div>
      )}

      {/* Poll builder */}
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

      {/* Event builder */}
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

      {/* Recording indicator */}
      {recording && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 mb-2 rounded-full bg-destructive/10 border border-destructive/30 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="font-body text-xs text-destructive">Recording · {Math.floor(recordingSeconds)}s / {MAX_VOICE_SECONDS}s</span>
          </div>
          <button onClick={stopRecording} className="touch-btn font-body text-[11px] text-destructive font-semibold">Stop & send</button>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-border pt-2.5 flex-shrink-0">
        <div className="flex gap-1.5 mb-1.5 overflow-x-auto scroll-snap-x pb-0.5">
          {[
            { icon: <HandDrawnChart size={13} color="hsl(var(--muted-foreground))" />, label: "poll", action: () => { setShowPoll((p) => !p); setShowEvent(false); } },
            { icon: <HandDrawnCalendar size={13} color="hsl(var(--muted-foreground))" />, label: "event", action: () => { setShowEvent((e) => !e); setShowPoll(false); } },
            { icon: <HandDrawnImage size={13} color="hsl(var(--muted-foreground))" />, label: "image", action: handleImage },
            { icon: recording ? <Square size={13} color="hsl(var(--destructive))" /> : <HandDrawnMic size={13} color="hsl(var(--muted-foreground))" />, label: recording ? "stop" : "voice", action: handleVoice },
          ].map((b) => (
            <button key={b.label} onClick={b.action} className={`touch-btn font-body text-[11px] bg-secondary/50 border-none rounded-full px-2.5 py-1.5 flex-shrink-0 scroll-snap-item flex items-center gap-1 ${recording && b.label === "stop" ? "text-destructive" : "text-muted-foreground"}`}>
              {b.icon}
              {b.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-end">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Share something with your neighbours…" rows={1} className="flex-1 px-3.5 py-2.5 rounded-[14px] border border-border bg-secondary/30 font-display text-sm italic text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 max-h-24" style={{ fontSize: "16px" }} />
          <button onClick={send} disabled={!input.trim() || checking || sending} className="touch-btn flex-shrink-0 bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center active:scale-[0.94] disabled:opacity-40" aria-label="Send message">
            <HandDrawnSend size={18} color="hsl(var(--primary-foreground))" />
          </button>
        </div>
        {checking && <p className="font-body text-[10px] text-muted-foreground mt-1.5 italic">Checking message…</p>}
      </div>

      {/* Member profile sheet */}
      {viewingMember && (
        <Suspense fallback={null}>
          <MemberProfileSheet userId={viewingMember.userId} displayName={viewingMember.name} onClose={() => setViewingMember(null)} />
        </Suspense>
      )}
    </div>
  );
}

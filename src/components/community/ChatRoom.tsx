import { useState, useRef, useEffect, lazy, Suspense, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import type { ChatMessage } from "@/data/community-data";
import { HandDrawnChart, HandDrawnCalendar, HandDrawnImage, HandDrawnMic, HandDrawnSend, HandDrawnHand } from "@/components/BotanicalElements";
import { Square } from "lucide-react";

const MemberProfileSheet = lazy(() => import("@/components/community/MemberProfileSheet"));

function Avatar({ initials, size = 28 }: { initials: string; size?: number }) {
  return (
    <div className="rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <span className="font-body font-bold text-primary" style={{ fontSize: size * 0.33 }}>{initials}</span>
    </div>
  );
}

interface ChatRoomProps {
  group: { id: string; name?: string; suburb: string; city?: string | null; members_count?: number | null; challenges?: string[]; [key: string]: any };
}

interface DBMessage {
  id: string;
  user_id: string;
  group_id: string;
  content: string | null;
  message_type: string; // text | poll | event | image | voice
  metadata: any;
  created_at: string;
  is_removed: boolean;
}

const MEDIA_BUCKET = "community-media";

const initialsFrom = (name?: string | null, fallback = "?") => {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || fallback;
};

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-NZ", { hour: "numeric", minute: "2-digit", hour12: true });

export default function ChatRoom({ group }: ChatRoomProps) {
  const { user } = useAuth();
  const { displayName: myDisplayName } = useProfile();

  const [rows, setRows] = useState<DBMessage[]>([]);
  const [authorMap, setAuthorMap] = useState<Record<string, { name: string; initials: string }>>({});
  const [loading, setLoading] = useState(true);

  const [input, setInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [blocked, setBlocked] = useState<{ reflection: string; suggested_rewrite?: string } | null>(null);
  const [showPoll, setShowPoll] = useState(false);
  const [showEvent, setShowEvent] = useState(false);
  const [pollQ, setPollQ] = useState("");
  const [pollOpts, setPollOpts] = useState(["", ""]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLoc, setEventLoc] = useState("");
  // votes: msgId -> { myChoice?: number, tallies: number[] }
  const [votes, setVotes] = useState<Record<string, { myChoice?: number; tallies: number[] }>>({});
  // rsvps: msgId -> { mine: boolean, count: number }
  const [rsvps, setRsvps] = useState<Record<string, { mine: boolean; count: number }>>({});
  const [recording, setRecording] = useState(false);
  // mediaUrls: msgId -> resolved signed URL (for image/audio)
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});

  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [viewingMember, setViewingMember] = useState<{ userId: string; name: string } | null>(null);

  const myInitials = useMemo(() => initialsFrom(myDisplayName, "ME"), [myDisplayName]);

  // Helpers to fold raw vote/RSVP rows into our state shape
  const applyVoteRows = (
    rowsIn: Array<{ message_id: string; user_id: string; option_index: number }>,
    optionCounts: Record<string, number>
  ) => {
    const next: Record<string, { myChoice?: number; tallies: number[] }> = {};
    for (const v of rowsIn) {
      const optsLen = optionCounts[v.message_id] ?? 0;
      const cur: { myChoice?: number; tallies: number[] } =
        next[v.message_id] ?? { tallies: new Array(optsLen).fill(0) as number[] };
      // grow tallies if needed
      while (cur.tallies.length <= v.option_index) cur.tallies.push(0);
      cur.tallies[v.option_index] = (cur.tallies[v.option_index] ?? 0) + 1;
      if (v.user_id === user?.id) cur.myChoice = v.option_index;
      next[v.message_id] = cur;
    }
    return next;
  };

  // Resolve signed URL for a media message and cache it
  const resolveMediaUrl = async (msgId: string, path: string) => {
    if (!path) return;
    const { data } = await supabase.storage.from(MEDIA_BUCKET).createSignedUrl(path, 60 * 60);
    if (data?.signedUrl) {
      setMediaUrls((prev) => (prev[msgId] ? prev : { ...prev, [msgId]: data.signedUrl }));
    }
  };

  // Load history + subscribe to realtime
  useEffect(() => {
    if (!group.id) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const { data: msgs, error } = await supabase
        .from("community_messages")
        .select("id, user_id, group_id, content, message_type, metadata, created_at, is_removed")
        .eq("group_id", group.id)
        .eq("is_removed", false)
        .order("created_at", { ascending: true })
        .limit(200);
      if (cancelled) return;
      if (error || !msgs) { setLoading(false); return; }

      setRows(msgs as DBMessage[]);
      await hydrateAuthors((msgs as DBMessage[]).map((d) => d.user_id));

      const ids = (msgs as DBMessage[]).map((m) => m.id);
      const pollIds = (msgs as DBMessage[]).filter((m) => m.message_type === "poll").map((m) => m.id);
      const eventIds = (msgs as DBMessage[]).filter((m) => m.message_type === "event").map((m) => m.id);
      const optionCounts: Record<string, number> = {};
      for (const m of msgs as DBMessage[]) {
        if (m.message_type === "poll") {
          optionCounts[m.id] = Array.isArray(m.metadata?.options) ? m.metadata.options.length : 0;
        }
      }

      // Votes
      if (pollIds.length) {
        const { data: vrows } = await supabase
          .from("community_message_votes")
          .select("message_id, user_id, option_index")
          .in("message_id", pollIds);
        if (!cancelled && vrows) setVotes(applyVoteRows(vrows as any, optionCounts));
      }

      // RSVPs
      if (eventIds.length) {
        const { data: rrows } = await supabase
          .from("community_message_rsvps")
          .select("message_id, user_id")
          .in("message_id", eventIds);
        if (!cancelled && rrows) {
          const next: Record<string, { mine: boolean; count: number }> = {};
          for (const r of rrows as Array<{ message_id: string; user_id: string }>) {
            const cur = next[r.message_id] ?? { mine: false, count: 0 };
            cur.count += 1;
            if (r.user_id === user?.id) cur.mine = true;
            next[r.message_id] = cur;
          }
          setRsvps(next);
        }
      }

      // Resolve signed URLs for media messages already in history
      for (const m of msgs as DBMessage[]) {
        if ((m.message_type === "image" || m.message_type === "voice") && m.metadata?.path) {
          resolveMediaUrl(m.id, m.metadata.path);
        }
      }

      setLoading(false);
      void ids;
    })();

    const channel = supabase
      .channel(`community_messages:${group.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "community_messages", filter: `group_id=eq.${group.id}` },
        async (payload) => {
          const m = payload.new as DBMessage;
          if (m.is_removed) return;
          setRows((prev) => (prev.some((p) => p.id === m.id) ? prev : [...prev, m]));
          if (!authorMap[m.user_id]) await hydrateAuthors([m.user_id]);
          if ((m.message_type === "image" || m.message_type === "voice") && m.metadata?.path) {
            resolveMediaUrl(m.id, m.metadata.path);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "community_messages", filter: `group_id=eq.${group.id}` },
        (payload) => {
          const m = payload.new as DBMessage;
          setRows((prev) => prev.map((p) => (p.id === m.id ? m : p)).filter((p) => !p.is_removed));
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_message_votes" },
        (payload) => {
          const newRow = (payload.new ?? payload.old) as { message_id: string; user_id: string; option_index: number };
          if (!newRow?.message_id) return;
          // Recompute the affected message's tally by refetching its votes
          (async () => {
            const { data } = await supabase
              .from("community_message_votes")
              .select("message_id, user_id, option_index")
              .eq("message_id", newRow.message_id);
            if (!data) return;
            setRows((prev) => {
              const target = prev.find((p) => p.id === newRow.message_id);
              const optsLen = Array.isArray(target?.metadata?.options) ? target!.metadata.options.length : 0;
              const next: Record<string, { myChoice?: number; tallies: number[] }> = applyVoteRows(
                data as any,
                { [newRow.message_id]: optsLen }
              );
              setVotes((prevVotes) => ({ ...prevVotes, [newRow.message_id]: next[newRow.message_id] ?? { tallies: new Array(optsLen).fill(0) } }));
              return prev;
            });
          })();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "community_message_rsvps" },
        (payload) => {
          const row = (payload.new ?? payload.old) as { message_id: string; user_id: string };
          if (!row?.message_id) return;
          (async () => {
            const { data } = await supabase
              .from("community_message_rsvps")
              .select("user_id")
              .eq("message_id", row.message_id);
            if (!data) return;
            const mine = (data as Array<{ user_id: string }>).some((d) => d.user_id === user?.id);
            setRsvps((prev) => ({ ...prev, [row.message_id]: { mine, count: data.length } }));
          })();
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group.id, user?.id]);

  const hydrateAuthors = async (userIds: string[]) => {
    const unique = Array.from(new Set(userIds)).filter((id) => id && !authorMap[id]);
    if (!unique.length) return;
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", unique);
    if (!data) return;
    setAuthorMap((prev) => {
      const next = { ...prev };
      for (const p of data as Array<{ user_id: string; display_name: string | null }>) {
        const name = p.display_name || "Neighbour";
        next[p.user_id] = { name, initials: initialsFrom(name) };
      }
      // anyone we couldn't resolve still gets a placeholder so we don't refetch
      for (const id of unique) if (!next[id]) next[id] = { name: "Neighbour", initials: "?" };
      return next;
    });
  };

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [rows.length]);

  // Map DB rows → render shape
  const messages: ChatMessage[] = useMemo(() => {
    return rows.map((r) => {
      const isMe = r.user_id === user?.id;
      const author = isMe
        ? { name: "You", initials: myInitials }
        : authorMap[r.user_id] ?? { name: "Neighbour", initials: "?" };
      const meta = r.metadata || {};
      const base: ChatMessage = {
        id: r.id,
        user: isMe ? "You" : author.name,
        avatar: author.initials,
        time: fmtTime(r.created_at),
        type: (r.message_type === "poll" || r.message_type === "event" ? r.message_type : "text") as ChatMessage["type"],
      };
      if (base.type === "text") {
        return { ...base, text: r.content || "" };
      }
      if (base.type === "poll") {
        return {
          ...base,
          question: meta.question || r.content || "",
          options: Array.isArray(meta.options) ? meta.options : [],
          votes: Array.isArray(meta.votes) ? meta.votes : (meta.options || []).map(() => 0),
        };
      }
      // event
      return {
        ...base,
        title: meta.title || r.content || "",
        date: meta.date || "",
        location: meta.location || "",
        going: typeof meta.going === "number" ? meta.going : 0,
      };
    });
  }, [rows, authorMap, user?.id, myInitials]);

  const insertMessage = async (payload: {
    message_type: "text" | "poll" | "event";
    content: string;
    metadata?: Record<string, any>;
  }) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("community_messages")
      .insert({
        group_id: group.id,
        user_id: user.id,
        message_type: payload.message_type,
        content: payload.content,
        metadata: payload.metadata ?? {},
      })
      .select("id, user_id, group_id, content, message_type, metadata, created_at, is_removed")
      .single();
    if (error) {
      console.error("[ChatRoom] insert failed", error);
      return null;
    }
    // Optimistic add (realtime will dedupe)
    setRows((prev) => (prev.some((p) => p.id === (data as any).id) ? prev : [...prev, data as DBMessage]));
    return data as DBMessage;
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !user) return;
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("community-moderate", { body: { text } });
      if (error) throw error;
      if (data && !data.safe) { setBlocked(data); setChecking(false); return; }
    } catch { /* allow on error */ }
    await insertMessage({ message_type: "text", content: text });
    setInput("");
    setChecking(false);
  };

  const sendPoll = async () => {
    if (!pollQ.trim()) return;
    const opts = pollOpts.filter((o) => o.trim());
    if (opts.length < 2) return;
    await insertMessage({
      message_type: "poll",
      content: pollQ.trim(),
      metadata: { question: pollQ.trim(), options: opts, votes: opts.map(() => 0) },
    });
    setPollQ(""); setPollOpts(["", ""]); setShowPoll(false);
  };

  const sendEvent = async () => {
    if (!eventTitle.trim()) return;
    await insertMessage({
      message_type: "event",
      content: eventTitle.trim(),
      metadata: { title: eventTitle.trim(), date: eventDate, location: eventLoc, going: 0 },
    });
    setEventTitle(""); setEventDate(""); setEventLoc(""); setShowEvent(false);
  };

  // Note: voting/RSVP/image/voice still local to the device for now
  // (full multi-user persistence for those is tracked separately).
  const toggleRSVP = (msgId: string) => {
    setRsvpd(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) {
        next.delete(msgId);
        setRows(rs => rs.map(r => r.id !== msgId ? r : ({ ...r, metadata: { ...(r.metadata || {}), going: Math.max(0, ((r.metadata?.going ?? 1) - 1)) } })));
      } else {
        next.add(msgId);
        setRows(rs => rs.map(r => r.id !== msgId ? r : ({ ...r, metadata: { ...(r.metadata || {}), going: ((r.metadata?.going ?? 0) + 1) } })));
      }
      return next;
    });
  };

  const handleImage = () => fileRef.current?.click();

  const onImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      const inserted = await insertMessage({ message_type: "text", content: "[Image shared]" });
      if (inserted) setLocalMedia((prev) => ({ ...prev, [inserted.id]: { imageUrl: dataUrl } }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleVoice = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        const inserted = await insertMessage({ message_type: "text", content: "Voice note" });
        if (inserted) setLocalMedia((prev) => ({ ...prev, [inserted.id]: { audioUrl } }));
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start();
      setRecording(true);
      setTimeout(() => {
        if (mediaRecorder.state === "recording") { mediaRecorder.stop(); setRecording(false); }
      }, 60000);
    } catch { /* permission denied */ }
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 280px)", minHeight: 400 }}>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImageSelected} />

      {/* Header */}
      <div className="pb-3 border-b border-border mb-3 flex-shrink-0">
        <h3 className="font-display text-lg font-bold italic text-foreground">{group.suburb} Community</h3>
        <p className="font-body text-[11px] text-muted-foreground">{group.members_count || 0} neighbours · {group.city || group.suburb}</p>
      </div>

      {/* Challenge banner */}
      {group.challenges?.[0] && (
        <div className="bg-amber-50 rounded-[10px] px-3 py-2 mb-3 flex-shrink-0">
          <span className="font-body text-[10px] text-primary mr-1.5">Challenge</span>
          <span className="font-display text-xs italic text-foreground/70">{group.challenges[0]}</span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pr-0.5 scroll-y">
        {loading && (
          <p className="font-body text-[11px] text-muted-foreground text-center py-6">Loading conversation…</p>
        )}
        {!loading && messages.length === 0 && (
          <p className="font-display text-sm italic text-muted-foreground text-center py-6">
            No messages yet. Say something kind to break the ice.
          </p>
        )}
        {messages.map((m) => {
          const isMe = m.user === "You";
          const dbRow = rows.find((r) => r.id === m.id);
          const media = localMedia[m.id];
          return (
            <div key={m.id} className={`flex gap-2 mb-3.5 items-start ${isMe ? "flex-row-reverse" : ""}`}>
              {!isMe && (
                <div
                  className="cursor-pointer"
                  onClick={() => dbRow && setViewingMember({ userId: dbRow.user_id, name: m.user })}
                >
                  <Avatar initials={m.avatar} />
                </div>
              )}
              <div className={`max-w-[78%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && <span className="font-body text-[10px] text-muted-foreground mb-0.5">{m.user} · {m.time}</span>}

                {m.type === "text" && (
                  <div className={`px-3.5 py-2.5 shadow-sm ${isMe ? "bg-primary rounded-[14px_14px_4px_14px]" : "bg-card border border-border rounded-[14px_14px_14px_4px]"}`}>
                    {media?.imageUrl && (
                      <img src={media.imageUrl} alt="Shared" className="rounded-lg mb-1.5 max-w-[200px]" loading="lazy" />
                    )}
                    {media?.audioUrl ? (
                      <audio src={media.audioUrl} controls className="max-w-[200px] h-8" />
                    ) : (
                      <span className={`font-display text-sm italic leading-relaxed ${isMe ? "text-primary-foreground" : "text-foreground"}`}>{m.text}</span>
                    )}
                  </div>
                )}

                {m.type === "poll" && (
                  <div className="card-warm p-3.5 min-w-[210px] w-full">
                    <p className="font-body text-[10px] text-primary mb-1 flex items-center gap-1">
                      <HandDrawnChart size={12} color="hsl(var(--primary))" /> poll
                    </p>
                    <p className="font-display text-sm italic text-foreground mb-2">{m.question}</p>
                    {m.options?.map((opt, i) => {
                      const total = (m.votes || []).reduce((a, b) => a + b, 0);
                      const pct = total ? Math.round(((m.votes?.[i] || 0) / total) * 100) : 0;
                      const hasVoted = voted[m.id] !== undefined;
                      const myVote = voted[m.id] === i;
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            if (hasVoted) return;
                            setVoted((v) => ({ ...v, [m.id]: i }));
                            setRows((rs) => rs.map((r) => {
                              if (r.id !== m.id) return r;
                              const cur = Array.isArray(r.metadata?.votes) ? r.metadata.votes : (r.metadata?.options || []).map(() => 0);
                              const nextVotes = cur.map((v: number, vi: number) => vi === i ? v + 1 : v);
                              return { ...r, metadata: { ...(r.metadata || {}), votes: nextVotes } };
                            }));
                          }}
                          className={`touch-btn flex items-center w-full mb-1 px-2.5 py-2 rounded-lg border relative overflow-hidden transition-all ${
                            myVote ? "border-primary bg-primary/10" : hasVoted ? "border-border bg-primary/5" : "border-border bg-card active:bg-secondary/50"
                          }`}
                        >
                          {hasVoted && <div className="absolute left-0 top-0 bottom-0 bg-primary/10 rounded-lg" style={{ width: `${pct}%` }} />}
                          <span className="font-display text-[13px] italic text-foreground flex-1 relative text-left">{opt}</span>
                          {hasVoted && <span className="font-body text-[11px] text-muted-foreground relative">{pct}%</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                {m.type === "event" && (
                  <div className="card-warm p-3.5 min-w-[230px] w-full border-l-[3px] border-l-primary">
                    <p className="font-body text-[10px] text-primary mb-1 flex items-center gap-1">
                      <HandDrawnCalendar size={12} color="hsl(var(--primary))" /> event
                    </p>
                    <p className="font-display text-[15px] font-bold italic text-foreground mb-0.5">{m.title}</p>
                    {m.date && <p className="font-body text-[11px] text-muted-foreground mb-0.5">{m.date}</p>}
                    {m.location && <p className="font-body text-[11px] text-muted-foreground mb-2">{m.location}</p>}
                    <button
                      onClick={() => toggleRSVP(m.id)}
                      className="touch-btn font-display text-[13px] italic rounded-full px-4 py-2 bg-primary text-primary-foreground"
                    >
                      {rsvpd.has(m.id) ? `✓ Going (${m.going})` : `I'm going (${m.going})`}
                    </button>
                  </div>
                )}

                {isMe && <span className="font-body text-[10px] text-muted-foreground mt-0.5">{m.time}</span>}
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
                  await insertMessage({ message_type: "text", content: blocked.suggested_rewrite! });
                  setInput(""); setBlocked(null);
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
          <input value={pollQ} onChange={(e) => setPollQ(e.target.value)} placeholder="Your question…"
            className="w-full px-3 py-2.5 rounded-[10px] border border-border bg-secondary/30 font-display text-sm italic text-foreground mb-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30" style={{ fontSize: "16px" }}
            inputMode="text" autoComplete="off" />
          {pollOpts.map((o, i) => (
            <input key={i} value={o} onChange={(e) => { const n = [...pollOpts]; n[i] = e.target.value; setPollOpts(n); }}
              placeholder={`Option ${i + 1}`}
              className="w-full px-3 py-2 rounded-[10px] border border-border bg-secondary/30 font-display text-sm italic text-foreground mb-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30" style={{ fontSize: "16px" }}
              inputMode="text" autoComplete="off" />
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
          <input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Event name…"
            className="w-full px-3 py-2.5 rounded-[10px] border border-border bg-secondary/30 font-display text-sm italic text-foreground mb-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30" style={{ fontSize: "16px" }}
            inputMode="text" autoComplete="off" />
          <input value={eventDate} onChange={(e) => setEventDate(e.target.value)} placeholder="Date and time…"
            className="w-full px-3 py-2 rounded-[10px] border border-border bg-secondary/30 font-display text-sm italic text-foreground mb-1.5 focus:outline-none focus:ring-2 focus:ring-primary/30" style={{ fontSize: "16px" }}
            inputMode="text" autoComplete="off" />
          <input value={eventLoc} onChange={(e) => setEventLoc(e.target.value)} placeholder="Location…"
            className="w-full px-3 py-2 rounded-[10px] border border-border bg-secondary/30 font-display text-sm italic text-foreground mb-2 focus:outline-none focus:ring-2 focus:ring-primary/30" style={{ fontSize: "16px" }}
            inputMode="text" autoComplete="off" />
          <div className="flex gap-2 flex-wrap">
            <button onClick={sendEvent} className="touch-btn font-display text-[13px] italic text-primary-foreground bg-primary rounded-full px-4 py-2">Post event</button>
            <button onClick={() => setShowEvent(false)} className="touch-btn font-body text-[11px] text-muted-foreground py-1.5">Cancel</button>
          </div>
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
            <button key={b.label} onClick={b.action} className={`touch-btn font-body text-[11px] bg-secondary/50 border-none rounded-full px-2.5 py-1.5 flex-shrink-0 scroll-snap-item flex items-center gap-1 ${
              recording && b.label === "stop" ? "text-destructive" : "text-muted-foreground"
            }`}>
              {b.icon} {b.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Say something kind…"
            rows={1}
            className="flex-1 px-3 py-2.5 rounded-[10px] border border-border bg-secondary/30 font-display text-sm italic text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed placeholder:text-muted-foreground/40"
            style={{ fontSize: "16px" }}
            inputMode="text"
            autoComplete="off"
          />
          <button
            onClick={send}
            disabled={checking || !input.trim() || !user}
            className={`touch-btn w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
              input.trim() ? "bg-primary" : "bg-secondary"
            }`}
          >
            {checking ? (
              <span className="font-body text-[10px] text-muted-foreground">…</span>
            ) : (
              <HandDrawnSend size={16} color={input.trim() ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))"} />
            )}
          </button>
        </div>
        <p className="font-body text-[10px] text-muted-foreground mt-1 text-center">Moderated for kindness, not censored for truth.</p>
      </div>

      {viewingMember && (
        <Suspense fallback={null}>
          <MemberProfileSheet
            userId={viewingMember.userId}
            displayName={viewingMember.name}
            onClose={() => setViewingMember(null)}
          />
        </Suspense>
      )}
    </div>
  );
}

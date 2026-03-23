import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MOCK_MESSAGES, type ChatMessage } from "@/data/community-data";
import { HandDrawnChart, HandDrawnCalendar, HandDrawnImage, HandDrawnMic, HandDrawnSend, HandDrawnHand } from "@/components/BotanicalElements";
import { Play, Square } from "lucide-react";

const MemberProfileSheet = lazy(() => import("@/components/community/MemberProfileSheet"));

function Avatar({ initials, size = 28 }: { initials: string; size?: number }) {
  return (
    <div className="rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <span className="font-mono font-bold text-primary" style={{ fontSize: size * 0.33 }}>{initials}</span>
    </div>
  );
}

interface ChatRoomProps {
  group: { id: string; name?: string; suburb: string; city?: string | null; members_count?: number | null; [key: string]: any };
}

export default function ChatRoom({ group }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
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
  const [voted, setVoted] = useState<Record<string, number>>({});
  const [rsvpd, setRsvpd] = useState<Set<string>>(new Set());
  const [recording, setRecording] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [viewingMember, setViewingMember] = useState<{ userId: string; name: string } | null>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const now = () => new Date().toLocaleTimeString("en-NZ", { hour: "numeric", minute: "2-digit", hour12: true });

  const send = async () => {
    if (!input.trim()) return;
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("community-moderate", { body: { text: input } });
      if (error) throw error;
      if (!data.safe) { setBlocked(data); setChecking(false); return; }
    } catch { /* allow on error */ }
    setMessages((m) => [...m, { id: Date.now().toString(), user: "You", avatar: "ME", time: now(), type: "text", text: input }]);
    setInput("");
    setChecking(false);
  };

  const sendPoll = () => {
    if (!pollQ.trim()) return;
    const opts = pollOpts.filter((o) => o.trim());
    if (opts.length < 2) return;
    setMessages((m) => [...m, { id: Date.now().toString(), user: "You", avatar: "ME", time: now(), type: "poll", question: pollQ, options: opts, votes: opts.map(() => 0) }]);
    setPollQ(""); setPollOpts(["", ""]); setShowPoll(false);
  };

  const sendEvent = () => {
    if (!eventTitle.trim()) return;
    setMessages((m) => [...m, { id: Date.now().toString(), user: "You", avatar: "ME", time: now(), type: "event", title: eventTitle, date: eventDate, location: eventLoc, going: 0 }]);
    setEventTitle(""); setEventDate(""); setEventLoc(""); setShowEvent(false);
  };

  const toggleRSVP = (msgId: string) => {
    setRsvpd(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) {
        next.delete(msgId);
        setMessages(msgs => msgs.map(m => m.id === msgId ? { ...m, going: Math.max(0, (m.going || 1) - 1) } : m));
      } else {
        next.add(msgId);
        setMessages(msgs => msgs.map(m => m.id === msgId ? { ...m, going: (m.going || 0) + 1 } : m));
      }
      return next;
    });
  };

  const handleImage = () => {
    fileRef.current?.click();
  };

  const onImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setMessages(m => [...m, {
        id: Date.now().toString(), user: "You", avatar: "ME", time: now(),
        type: "text", text: `📷 [Image shared]`, imageUrl: dataUrl,
      } as any]);
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

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setMessages(m => [...m, {
          id: Date.now().toString(), user: "You", avatar: "ME", time: now(),
          type: "text", text: "🎤 Voice note", audioUrl,
        } as any]);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setRecording(true);

      // Auto-stop after 60 seconds
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          setRecording(false);
        }
      }, 60000);
    } catch {
      // Permission denied or not supported
    }
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 280px)", minHeight: 400 }}>
      {/* Hidden file input for images */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onImageSelected} />

      {/* Header */}
      <div className="pb-3 border-b border-border mb-3 flex-shrink-0">
        <h3 className="font-display text-lg font-bold italic text-foreground">{group.suburb} Community</h3>
        <p className="font-mono text-[11px] text-muted-foreground">{group.members_count || 0} neighbours · {group.city || group.suburb}</p>
      </div>

      {/* Challenge banner */}
      <div className="bg-amber-50 rounded-[10px] px-3 py-2 mb-3 flex-shrink-0">
        <span className="font-mono text-[10px] text-primary mr-1.5">Challenge</span>
        <span className="font-display text-xs italic text-foreground/70">{group.challenges[0]}</span>
      </div>

      {/* Messages — momentum scrolling */}
      <div className="flex-1 overflow-y-auto pr-0.5 scroll-y">
        {messages.map((m) => {
          const isMe = m.user === "You";
          const msg = m as any;
          return (
            <div key={m.id} className={`flex gap-2 mb-3.5 items-start ${isMe ? "flex-row-reverse" : ""}`}>
              {!isMe && <div className="cursor-pointer" onClick={() => setViewingMember({ userId: m.id, name: m.user })}><Avatar initials={m.avatar} /></div>}
              <div className={`max-w-[78%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && <span className="font-mono text-[10px] text-muted-foreground mb-0.5">{m.user} · {m.time}</span>}

                {m.type === "text" && (
                  <div className={`px-3.5 py-2.5 shadow-sm ${isMe ? "bg-primary rounded-[14px_14px_4px_14px]" : "bg-card border border-border rounded-[14px_14px_14px_4px]"}`}>
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="Shared" className="rounded-lg mb-1.5 max-w-[200px]" loading="lazy" />
                    )}
                    {msg.audioUrl ? (
                      <audio src={msg.audioUrl} controls className="max-w-[200px] h-8" />
                    ) : (
                      <span className={`font-display text-sm italic leading-relaxed ${isMe ? "text-primary-foreground" : "text-foreground"}`}>{m.text}</span>
                    )}
                  </div>
                )}

                {m.type === "poll" && (
                  <div className="card-warm p-3.5 min-w-[210px] w-full">
                    <p className="font-mono text-[10px] text-primary mb-1 flex items-center gap-1">
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
                            setMessages((msgs) => msgs.map((x) => x.id !== m.id ? x : { ...x, votes: (x.votes || []).map((v, vi) => vi === i ? v + 1 : v) }));
                          }}
                          className={`touch-btn flex items-center w-full mb-1 px-2.5 py-2 rounded-lg border relative overflow-hidden transition-all ${
                            myVote ? "border-primary bg-primary/10" : hasVoted ? "border-border bg-primary/5" : "border-border bg-card active:bg-secondary/50"
                          }`}
                        >
                          {hasVoted && <div className="absolute left-0 top-0 bottom-0 bg-primary/10 rounded-lg" style={{ width: `${pct}%` }} />}
                          <span className="font-display text-[13px] italic text-foreground flex-1 relative text-left">{opt}</span>
                          {hasVoted && <span className="font-mono text-[11px] text-muted-foreground relative">{pct}%</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                {m.type === "event" && (
                  <div className="card-warm p-3.5 min-w-[230px] w-full border-l-[3px] border-l-primary">
                    <p className="font-mono text-[10px] text-primary mb-1 flex items-center gap-1">
                      <HandDrawnCalendar size={12} color="hsl(var(--primary))" /> event
                    </p>
                    <p className="font-display text-[15px] font-bold italic text-foreground mb-0.5">{m.title}</p>
                    {m.date && <p className="font-mono text-[11px] text-muted-foreground mb-0.5">{m.date}</p>}
                    {m.location && <p className="font-mono text-[11px] text-muted-foreground mb-2">{m.location}</p>}
                    <button
                      onClick={() => toggleRSVP(m.id)}
                      className={`touch-btn font-display text-[13px] italic rounded-full px-4 py-2 transition-colors ${
                        rsvpd.has(m.id)
                          ? "bg-phase-follicular text-primary-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {rsvpd.has(m.id) ? `✓ Going (${m.going})` : `I'm going (${m.going})`}
                    </button>
                  </div>
                )}

                {isMe && <span className="font-mono text-[10px] text-muted-foreground mt-0.5">{m.time}</span>}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Moderation block */}
      {blocked && (
        <div className="bg-amber-50 border border-primary/20 rounded-[14px] p-4 mb-2.5 flex-shrink-0">
          <p className="font-mono text-[11px] text-primary mb-1.5 flex items-center gap-1">
            <HandDrawnHand size={14} color="hsl(var(--primary))" /> Pause for a moment
          </p>
          <p className="font-display text-sm italic text-foreground leading-relaxed mb-2.5">{blocked.reflection}</p>
          {blocked.suggested_rewrite && (
            <div className="bg-phase-follicular/10 rounded-[10px] p-2.5 mb-2.5">
              <p className="font-mono text-[10px] text-phase-follicular mb-0.5">Suggested response</p>
              <p className="font-display text-[13px] italic text-phase-follicular leading-relaxed">{blocked.suggested_rewrite}</p>
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            {blocked.suggested_rewrite && (
              <button
                onClick={() => {
                  setMessages((m) => [...m, { id: Date.now().toString(), user: "You", avatar: "ME", time: now(), type: "text", text: blocked.suggested_rewrite! }]);
                  setInput(""); setBlocked(null);
                }}
                className="touch-btn font-display text-[13px] italic text-primary-foreground bg-phase-follicular rounded-full px-4 py-2"
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
          <p className="font-mono text-[11px] text-primary mb-2">Create a poll</p>
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
            <button onClick={() => setPollOpts((o) => [...o, ""])} className="touch-btn font-mono text-[11px] text-muted-foreground border border-border rounded-full px-2.5 py-1.5">+ option</button>
            <button onClick={sendPoll} className="touch-btn font-display text-[13px] italic text-primary-foreground bg-primary rounded-full px-4 py-2">Send poll</button>
            <button onClick={() => setShowPoll(false)} className="touch-btn font-mono text-[11px] text-muted-foreground py-1.5">Cancel</button>
          </div>
        </div>
      )}

      {/* Event builder */}
      {showEvent && (
        <div className="card-warm p-3.5 mb-2 flex-shrink-0">
          <p className="font-mono text-[11px] text-primary mb-2">Create an event</p>
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
            <button onClick={() => setShowEvent(false)} className="touch-btn font-mono text-[11px] text-muted-foreground py-1.5">Cancel</button>
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
            <button key={b.label} onClick={b.action} className={`touch-btn font-mono text-[11px] bg-secondary/50 border-none rounded-full px-2.5 py-1.5 flex-shrink-0 scroll-snap-item flex items-center gap-1 ${
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
            disabled={checking || !input.trim()}
            className={`touch-btn w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
              input.trim() ? "bg-primary" : "bg-secondary"
            }`}
          >
            {checking ? (
              <span className="font-mono text-[10px] text-muted-foreground">…</span>
            ) : (
              <HandDrawnSend size={16} color={input.trim() ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))"} />
            )}
          </button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground mt-1 text-center">Moderated for kindness, not censored for truth.</p>
      </div>

      {/* Member profile sheet */}
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

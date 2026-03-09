import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MOCK_MESSAGES, type CommunityGroup, type ChatMessage } from "@/data/community-data";

function Avatar({ initials, size = 28 }: { initials: string; size?: number }) {
  return (
    <div className="rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <span className="font-mono font-bold text-primary" style={{ fontSize: size * 0.33 }}>{initials}</span>
    </div>
  );
}

interface ChatRoomProps {
  group: CommunityGroup;
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
  const bottomRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 280px)", minHeight: 400 }}>
      {/* Header */}
      <div className="pb-3 border-b border-border mb-3 flex-shrink-0">
        <h3 className="font-display text-lg font-bold italic text-foreground">{group.suburb} Community</h3>
        <p className="font-mono text-[11px] text-muted-foreground">{group.members} neighbours · {group.city}</p>
      </div>

      {/* Challenge banner */}
      <div className="bg-amber-50 rounded-[10px] px-3 py-2 mb-3 flex-shrink-0">
        <span className="font-mono text-[10px] text-primary mr-1.5">challenge</span>
        <span className="font-display text-xs italic text-foreground/70">{group.challenges[0]}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pr-0.5">
        {messages.map((m) => {
          const isMe = m.user === "You";
          return (
            <div key={m.id} className={`flex gap-2 mb-3.5 items-start ${isMe ? "flex-row-reverse" : ""}`}>
              {!isMe && <Avatar initials={m.avatar} />}
              <div className={`max-w-[78%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && <span className="font-mono text-[10px] text-muted-foreground mb-0.5">{m.user} · {m.time}</span>}

                {m.type === "text" && (
                  <div className={`px-3.5 py-2.5 shadow-sm ${isMe ? "bg-primary rounded-[14px_14px_4px_14px]" : "bg-card border border-border rounded-[14px_14px_14px_4px]"}`}>
                    <span className={`font-display text-sm italic leading-relaxed ${isMe ? "text-primary-foreground" : "text-foreground"}`}>{m.text}</span>
                  </div>
                )}

                {m.type === "poll" && (
                  <div className="card-warm p-3.5 min-w-[210px]">
                    <p className="font-mono text-[10px] text-primary mb-1">📊 poll</p>
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
                          className={`flex items-center w-full mb-1 px-2.5 py-1.5 rounded-lg border relative overflow-hidden transition-all ${
                            myVote ? "border-primary bg-primary/10" : hasVoted ? "border-border bg-primary/5" : "border-border bg-card hover:bg-secondary/50"
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
                  <div className="card-warm p-3.5 min-w-[230px] border-l-[3px] border-l-primary">
                    <p className="font-mono text-[10px] text-primary mb-1">📅 event</p>
                    <p className="font-display text-[15px] font-bold italic text-foreground mb-0.5">{m.title}</p>
                    {m.date && <p className="font-mono text-[11px] text-muted-foreground mb-0.5">🕐 {m.date}</p>}
                    {m.location && <p className="font-mono text-[11px] text-muted-foreground mb-2">📍 {m.location}</p>}
                    <button className="font-display text-[13px] italic text-primary-foreground bg-primary rounded-full px-4 py-1.5">
                      I'm going ({m.going})
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
          <p className="font-mono text-[11px] text-primary mb-1.5">✋ pause for a moment</p>
          <p className="font-display text-sm italic text-foreground leading-relaxed mb-2.5">{blocked.reflection}</p>
          {blocked.suggested_rewrite && (
            <div className="bg-phase-follicular/10 rounded-[10px] p-2.5 mb-2.5">
              <p className="font-mono text-[10px] text-phase-follicular mb-0.5">suggested response</p>
              <p className="font-display text-[13px] italic text-phase-follicular leading-relaxed">{blocked.suggested_rewrite}</p>
            </div>
          )}
          <div className="flex gap-2">
            {blocked.suggested_rewrite && (
              <button
                onClick={() => {
                  setMessages((m) => [...m, { id: Date.now().toString(), user: "You", avatar: "ME", time: now(), type: "text", text: blocked.suggested_rewrite! }]);
                  setInput(""); setBlocked(null);
                }}
                className="font-display text-[13px] italic text-primary-foreground bg-phase-follicular rounded-full px-4 py-2"
              >
                send this instead
              </button>
            )}
            <button onClick={() => { setBlocked(null); setInput(""); }} className="font-display text-[13px] italic text-muted-foreground bg-secondary rounded-full px-3.5 py-2">
              discard
            </button>
          </div>
        </div>
      )}

      {/* Poll builder */}
      {showPoll && (
        <div className="card-warm p-3.5 mb-2 flex-shrink-0">
          <p className="font-mono text-[11px] text-primary mb-2">create a poll</p>
          <input value={pollQ} onChange={(e) => setPollQ(e.target.value)} placeholder="Your question…"
            className="w-full px-3 py-2.5 rounded-[10px] border border-border bg-secondary/30 font-display text-sm italic text-foreground mb-1.5 focus:outline-none" style={{ fontSize: "16px" }} />
          {pollOpts.map((o, i) => (
            <input key={i} value={o} onChange={(e) => { const n = [...pollOpts]; n[i] = e.target.value; setPollOpts(n); }}
              placeholder={`Option ${i + 1}`}
              className="w-full px-3 py-2 rounded-[10px] border border-border bg-secondary/30 font-display text-sm italic text-foreground mb-1.5 focus:outline-none" style={{ fontSize: "16px" }} />
          ))}
          <div className="flex gap-2">
            <button onClick={() => setPollOpts((o) => [...o, ""])} className="font-mono text-[11px] text-muted-foreground border border-border rounded-full px-2.5 py-1">+ option</button>
            <button onClick={sendPoll} className="font-display text-[13px] italic text-primary-foreground bg-primary rounded-full px-4 py-1.5">send poll</button>
            <button onClick={() => setShowPoll(false)} className="font-mono text-[11px] text-muted-foreground">cancel</button>
          </div>
        </div>
      )}

      {/* Event builder */}
      {showEvent && (
        <div className="card-warm p-3.5 mb-2 flex-shrink-0">
          <p className="font-mono text-[11px] text-primary mb-2">create an event</p>
          <input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Event name…"
            className="w-full px-3 py-2.5 rounded-[10px] border border-border bg-secondary/30 font-display text-sm italic text-foreground mb-1.5 focus:outline-none" style={{ fontSize: "16px" }} />
          <input value={eventDate} onChange={(e) => setEventDate(e.target.value)} placeholder="Date and time…"
            className="w-full px-3 py-2 rounded-[10px] border border-border bg-secondary/30 font-display text-sm italic text-foreground mb-1.5 focus:outline-none" style={{ fontSize: "16px" }} />
          <input value={eventLoc} onChange={(e) => setEventLoc(e.target.value)} placeholder="Location…"
            className="w-full px-3 py-2 rounded-[10px] border border-border bg-secondary/30 font-display text-sm italic text-foreground mb-2 focus:outline-none" style={{ fontSize: "16px" }} />
          <div className="flex gap-2">
            <button onClick={sendEvent} className="font-display text-[13px] italic text-primary-foreground bg-primary rounded-full px-4 py-1.5">post event</button>
            <button onClick={() => setShowEvent(false)} className="font-mono text-[11px] text-muted-foreground">cancel</button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-border pt-2.5 flex-shrink-0">
        <div className="flex gap-1.5 mb-1.5">
          {[
            { icon: "📊", label: "poll", action: () => { setShowPoll((p) => !p); setShowEvent(false); } },
            { icon: "📅", label: "event", action: () => { setShowEvent((e) => !e); setShowPoll(false); } },
            { icon: "🖼️", label: "image", action: () => {} },
            { icon: "🎤", label: "voice", action: () => {} },
          ].map((b) => (
            <button key={b.label} onClick={b.action} className="font-mono text-[11px] text-muted-foreground bg-secondary/50 border-none rounded-full px-2.5 py-1">
              {b.icon} {b.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="say something kind…"
            rows={1}
            className="flex-1 px-3 py-2.5 rounded-[10px] border border-border bg-secondary/30 font-display text-sm italic text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 leading-relaxed placeholder:text-muted-foreground/40"
            style={{ fontSize: "16px" }}
          />
          <button
            onClick={send}
            disabled={checking || !input.trim()}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
              input.trim() ? "bg-primary" : "bg-secondary"
            }`}
          >
            {checking ? (
              <span className="font-mono text-[10px] text-muted-foreground">…</span>
            ) : (
              <span className="text-primary-foreground text-[15px] ml-0.5">➤</span>
            )}
          </button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground mt-1 text-center">moderated for kindness, not censored for truth.</p>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { ChatMessage } from "../../types/index.ts";
import { MessageSquare, Send } from "lucide-react";

interface Props {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export const AuctionChat: React.FC<Props> = ({ messages, onSendMessage }) => {
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText("");
  };

  return (
    <div className="flex h-72 flex-col rounded-2xl border border-white/5 bg-[#080C16] shadow-xl overflow-hidden p-4">
      {/* Header */}
      <h3 className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] mb-3 flex items-center gap-2">
        <MessageSquare className="h-3.5 w-3.5 text-orange-500" /> War Room Live Activity
      </h3>

      {/* Messages / Activity Feed */}
      <div className="flex-1 overflow-y-auto space-y-2.5 font-mono text-[11px] pr-1">
        {messages.length === 0 ? (
          <p className="text-slate-500 italic text-center py-8">No messages yet. Send a message or place a bid!</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="leading-snug">
              {m.isSystem ? (
                <p className="text-slate-400">
                  <span className="text-blue-400 font-bold">
                    [{new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}]
                  </span>{" "}
                  {m.text}
                </p>
              ) : (
                <p className="text-white">
                  <span className="text-orange-500 font-bold uppercase">[BID/CHAT]</span>{" "}
                  <span className="text-slate-400 font-bold">{m.userName} ({m.teamName}):</span> {m.text}
                </p>
              )}
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="mt-3 pt-2.5 border-t border-white/5 flex gap-2">
        <input
          type="text"
          placeholder="Send strategic message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none font-sans"
        />
        <button
          type="submit"
          className="rounded-xl bg-orange-500 px-3.5 py-1.5 text-xs font-black text-black hover:bg-orange-400 transition"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
};

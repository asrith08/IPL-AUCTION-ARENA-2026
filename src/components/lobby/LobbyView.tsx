import React, { useState } from "react";
import { Room, RoomParticipant } from "../../types/index.ts";
import { Copy, Share2, Play, Users, Shield, CheckCircle2, UserX, Edit2, Check, X } from "lucide-react";

interface Props {
  room: Room;
  currentUserId: string;
  onStartAuction: () => void;
  onKickParticipant: (targetUserId: string) => void;
  onUpdateName?: (data: { userName?: string; teamName?: string; managerName?: string }) => void;
}

export const LobbyView: React.FC<Props> = ({
  room,
  currentUserId,
  onStartAuction,
  onKickParticipant,
  onUpdateName,
}) => {
  const [copied, setCopied] = useState(false);
  const [editingSelf, setEditingSelf] = useState(false);
  const me = room.participants[currentUserId];

  const [editUserName, setEditUserName] = useState(me?.userName || "");
  const [editTeamName, setEditTeamName] = useState(me?.teamName || "");
  const [editManagerName, setEditManagerName] = useState(me?.managerName || "");

  const isHost = room.hostId === currentUserId;
  const participants: RoomParticipant[] = Object.values(room.participants);

  const handleSaveName = () => {
    if (onUpdateName) {
      onUpdateName({
        userName: editUserName,
        teamName: editTeamName,
        managerName: editManagerName,
      });
    }
    setEditingSelf(false);
  };

  const roomUrl = typeof window !== "undefined" ? `${window.location.origin}?room=${room.id}` : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🏏 Join my IPL 2026 Auction Room "${room.name}"!\n\nRoom Code: ${room.code}\nJoin Link: ${roomUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0D121F] p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3.5 py-1 text-[10px] font-black text-orange-400 border border-orange-500/30 uppercase tracking-widest mb-3">
              <Shield className="h-3.5 w-3.5" /> AUCTION LOBBY
            </div>
            <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter uppercase text-white">{room.name}</h1>
            <p className="text-xs text-slate-400 mt-2 font-mono">
              Room Code: <span className="text-orange-400 font-bold">{room.code}</span> • Status: <span className="text-green-400 font-bold uppercase">{room.status}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 hover:bg-white/10 transition"
            >
              <Copy className="h-4 w-4 text-orange-400" />
              {copied ? "Copied!" : "Copy Link"}
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-green-500 transition shadow-[0_0_15px_rgba(34,197,94,0.3)]"
            >
              <Share2 className="h-4 w-4" />
              WhatsApp Share
            </button>
          </div>
        </div>
      </div>

      {/* Grid Layout: Settings + Participants */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Settings Box */}
        <div className="rounded-2xl border border-white/10 bg-[#0D121F] p-6 space-y-4 shadow-xl">
          <h3 className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">Auction Config</h3>

          <div className="space-y-3 text-xs font-sans">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Total Purse:</span>
              <span className="font-bold text-white">₹{room.settings.totalPurse} Crore</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Max Squad Size:</span>
              <span className="font-bold text-white">{room.settings.maxSquadSize} Players</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Overseas Limit:</span>
              <span className="font-bold text-blue-400">8 Overseas Max</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-slate-400">Timer Duration:</span>
              <span className="font-bold text-orange-400">{room.settings.timerDuration} Seconds</span>
            </div>
          </div>

          {isHost ? (
            <button
              onClick={onStartAuction}
              disabled={participants.length < 1}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black py-3.5 text-xs font-black uppercase italic tracking-wider shadow-[0_0_20px_rgba(249,115,22,0.4)] disabled:opacity-50 transition"
            >
              <Play className="h-4 w-4 fill-black" />
              START AUCTION NOW
            </button>
          ) : (
            <div className="rounded-xl bg-white/5 p-3 text-center text-xs text-slate-400 border border-white/5">
              Waiting for host (<span className="text-orange-400 font-bold">{participants.find((p) => p.isHost)?.userName}</span>) to start...
            </div>
          )}
        </div>

        {/* Participants Grid */}
        <div className="md:col-span-2 rounded-2xl border border-white/10 bg-[#0D121F] p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-500" /> Participants ({participants.length} / 10 Max)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {participants.map((p) => {
              const isMe = p.userId === currentUserId;
              return (
                <div
                  key={p.userId}
                  className="rounded-xl border border-white/5 bg-white/5 p-4 hover:border-white/10 transition space-y-3"
                >
                  {isMe && editingSelf ? (
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                        Edit Your Name & Team
                      </div>
                      <input
                        type="text"
                        value={editTeamName}
                        onChange={(e) => setEditTeamName(e.target.value)}
                        placeholder="Team Name (e.g., Chennai Super Kings)"
                        className="w-full rounded-lg bg-black/50 border border-white/20 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                      />
                      <input
                        type="text"
                        value={editManagerName}
                        onChange={(e) => setEditManagerName(e.target.value)}
                        placeholder="Manager Name"
                        className="w-full rounded-lg bg-black/50 border border-white/20 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                      />
                      <input
                        type="text"
                        value={editUserName}
                        onChange={(e) => setEditUserName(e.target.value)}
                        placeholder="User Display Name"
                        className="w-full rounded-lg bg-black/50 border border-white/20 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                      />
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={handleSaveName}
                          className="flex items-center gap-1 rounded-md bg-orange-500 px-3 py-1 text-[11px] font-bold text-black hover:bg-orange-400 transition uppercase"
                        >
                          <Check className="h-3 w-3" /> Save
                        </button>
                        <button
                          onClick={() => setEditingSelf(false)}
                          className="flex items-center gap-1 rounded-md bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-300 hover:bg-white/20 transition uppercase"
                        >
                          <X className="h-3 w-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 font-black italic text-orange-400 border border-white/10">
                          {p.userName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                            {p.teamName}
                            {p.isHost && (
                              <span className="rounded bg-orange-500/20 px-1.5 py-0.5 text-[9px] font-black text-orange-400 border border-orange-500/30 uppercase tracking-widest">
                                HOST
                              </span>
                            )}
                            {isMe && (
                              <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-black text-blue-400 border border-blue-500/30 uppercase tracking-widest">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">
                            Manager: {p.managerName} • Purse: ₹{p.purseRemaining.toFixed(2)} Cr
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {isMe && (
                          <button
                            onClick={() => {
                              setEditUserName(p.userName);
                              setEditTeamName(p.teamName);
                              setEditManagerName(p.managerName);
                              setEditingSelf(true);
                            }}
                            title="Edit Display Name & Team"
                            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                        {isHost && !p.isHost && (
                          <button
                            onClick={() => onKickParticipant(p.userId)}
                            title="Kick Participant"
                            className="rounded-lg p-2 text-red-400 hover:bg-red-950/50 hover:text-red-300 transition"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { Room } from "../../types/index.ts";
import { Pause, Play, Square, Volume2, VolumeX, Mic, MicOff, Shield, Radio } from "lucide-react";

interface Props {
  room: Room;
  currentUserId: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  micEnabled: boolean;
  onToggleMic: () => void;
  onPauseAuction: () => void;
  onResumeAuction: () => void;
  onEndAuction: () => void;
}

export const AuctionHeader: React.FC<Props> = ({
  room,
  currentUserId,
  soundEnabled,
  onToggleSound,
  micEnabled,
  onToggleMic,
  onPauseAuction,
  onResumeAuction,
  onEndAuction,
}) => {
  const isHost = room.hostId === currentUserId;
  const participantCount = Object.keys(room.participants).length;

  return (
    <header className="h-16 flex items-center justify-between px-6 sm:px-8 bg-[#0D121F] border-b border-white/10 shadow-2xl z-20">
      {/* Left Branding */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            {room.name || "Auction Arena Pro"}
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-orange-500 font-bold">
            IPL 2026 Live Session • {room.status}
          </p>
        </div>
      </div>

      {/* Right Controls & Room Status */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[10px] uppercase text-slate-500 font-semibold tracking-wider">Room Code</span>
          <span className="text-xs sm:text-sm font-mono text-orange-400 font-bold">{room.id}</span>
        </div>

        {/* Audio & Mic controls */}
        <div className="flex gap-2">
          <button
            onClick={onToggleSound}
            title="Toggle Sound Effects"
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all uppercase border ${
              soundEnabled
                ? "bg-orange-500/10 border-orange-500/40 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.2)]"
                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
            }`}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          <button
            onClick={onToggleMic}
            title="Toggle Voice Mic"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all uppercase border ${
              micEnabled
                ? "bg-green-500/10 border-green-500/40 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
            }`}
          >
            {micEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            <span className="hidden md:inline">{micEnabled ? "Mic On" : "Muted"}</span>
          </button>
        </div>

        {/* Host Admin Controls */}
        {isHost && (
          <div className="flex gap-2 border-l border-white/10 pl-4">
            {room.status === "COMPLETED" || room.status === "ENDED" ? (
              <span className="px-3.5 py-1.5 bg-red-950/40 border border-red-500/30 text-red-400 rounded-md text-xs font-bold uppercase tracking-wider">
                Auction Ended
              </span>
            ) : room.status === "PAUSED" ? (
              <>
                <button
                  onClick={onResumeAuction}
                  className="px-3.5 py-1.5 bg-green-600/20 border border-green-500/50 text-green-400 rounded-md text-xs font-bold hover:bg-green-600/30 transition-colors uppercase flex items-center gap-1"
                >
                  <Play className="h-3.5 w-3.5" /> Resume
                </button>
                <button
                  onClick={onEndAuction}
                  className="px-3.5 py-1.5 bg-red-600/20 border border-red-600/50 text-red-500 rounded-md text-xs font-bold hover:bg-red-600/30 transition-colors uppercase flex items-center gap-1"
                >
                  <Square className="h-3.5 w-3.5" /> End
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onPauseAuction}
                  className="px-3.5 py-1.5 bg-white/5 border border-white/10 text-slate-300 rounded-md text-xs font-bold hover:bg-white/10 transition-colors uppercase flex items-center gap-1"
                >
                  <Pause className="h-3.5 w-3.5" /> Pause
                </button>
                <button
                  onClick={onEndAuction}
                  className="px-3.5 py-1.5 bg-red-600/20 border border-red-600/50 text-red-500 rounded-md text-xs font-bold hover:bg-red-600/30 transition-colors uppercase flex items-center gap-1"
                >
                  <Square className="h-3.5 w-3.5" /> End
                </button>
              </>
            )}
          </div>
        )}

        {/* Online Indicator Badge */}
        <div className="flex items-center gap-2.5 ml-2 border-l border-white/10 pl-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
          <span className="text-xs font-bold text-slate-200">{participantCount}/10 Online</span>
        </div>
      </div>
    </header>
  );
};

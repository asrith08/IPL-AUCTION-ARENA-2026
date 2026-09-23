import React from "react";
import { Trophy, Users, Shield, Zap, Globe, Flame, Award, Play } from "lucide-react";

interface Props {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onBrowsePublic: () => void;
  onOpenDatabase: () => void;
}

export const LandingPage: React.FC<Props> = ({
  onCreateRoom,
  onJoinRoom,
  onBrowsePublic,
  onOpenDatabase,
}) => {
  return (
    <div className="relative min-h-screen bg-[#050810] text-slate-100 overflow-hidden font-sans">
      {/* Stadium Light Radial Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[1000px] rounded-full bg-orange-600/10 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/3 -left-40 h-[500px] w-[500px] rounded-full bg-red-600/10 blur-[140px]" />

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-white/10 bg-[#0D121F]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                Auction Arena Pro
              </span>
              <p className="text-[10px] uppercase tracking-widest text-orange-500 font-bold">IPL 2026 EDITION</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenDatabase}
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-200 hover:bg-white/10 transition"
            >
              <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-400" />
              <span>Player DB</span>
            </button>
            <button
              onClick={onCreateRoom}
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-orange-500 px-3.5 sm:px-5 py-2 text-[11px] sm:text-xs font-black uppercase italic text-black shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:bg-orange-400 transition"
            >
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Create Room
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-bold text-orange-400 uppercase tracking-widest backdrop-blur-md mb-8">
          <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
          AUTHORITATIVE IPL 2026 MULTIPLAYER AUCTION ENGINE
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black italic tracking-tighter uppercase text-white max-w-5xl mx-auto leading-none">
          BUILD YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-200 to-red-500">DREAM XI</span> IN REAL-TIME
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
          Multiplayer live bidding, team purse management, 8-overseas restrictions, WebRTC voice communication, playing XI selector, and AI cricket analysis.
        </p>

        {/* Hero Actions */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onCreateRoom}
            className="flex items-center gap-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black px-8 py-4 text-sm font-black uppercase italic tracking-wider shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:scale-105 transition transform"
          >
            <Trophy className="h-5 w-5" />
            CREATE AUCTION ROOM
          </button>

          <button
            onClick={onJoinRoom}
            className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white px-8 py-4 text-sm font-black uppercase italic tracking-wider transition"
          >
            <Users className="h-5 w-5 text-orange-400" />
            JOIN PRIVATE ROOM
          </button>

          <button
            onClick={onBrowsePublic}
            className="flex items-center gap-2.5 rounded-xl border border-green-500/30 bg-green-500/10 hover:bg-green-500/20 text-green-400 px-6 py-4 text-sm font-black uppercase italic tracking-wider transition"
          >
            <Play className="h-5 w-5" />
            BROWSE PUBLIC ROOMS
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="rounded-2xl border border-white/10 bg-[#0D121F] p-6 shadow-2xl">
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl border border-orange-500/30 flex items-center justify-center text-orange-400 mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-black italic uppercase text-white tracking-tight">Server-Authoritative Bidding</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Atomic bid validation, strict timer race condition handling, team purse deductions, and non-repeating randomized player queue.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0D121F] p-6 shadow-2xl">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl border border-green-500/30 flex items-center justify-center text-green-400 mb-4">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-base font-black italic uppercase text-white tracking-tight">Up to 10 Participants</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Host controls, live WebRTC voice communication, real-time chat, and shareable WhatsApp private room invite links.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0D121F] p-6 shadow-2xl">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="text-base font-black italic uppercase text-white tracking-tight">Best XI AI & Team Rankings</h3>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Automatic Best XI generator, 4-overseas limit enforcement, opener/pace/spin category comparison, and bench strength score.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

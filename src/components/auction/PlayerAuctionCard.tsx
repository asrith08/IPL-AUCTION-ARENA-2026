import React from "react";
import { Player, Room } from "../../types/index.ts";
import { Clock, Shield, Award, Activity, Flame, Zap, Home } from "lucide-react";

interface Props {
  player: Player | null;
  room: Room;
  onReturnHome?: () => void;
}

export const PlayerAuctionCard: React.FC<Props> = ({ player, room, onReturnHome }) => {
  if (!player || room.status === "COMPLETED" || room.status === "ENDED") {
    return (
      <div className="flex h-96 items-center justify-center rounded-[2rem] border border-white/10 bg-[#0D121F] p-8 text-center shadow-2xl">
        <div>
          <Shield className="mx-auto h-12 w-12 text-orange-500 mb-3 animate-pulse" />
          <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-wider text-white">
            AUCTION CONCLUDED
          </h2>
          <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
            All players have been auctioned or the live session has been officially ended by the host.
          </p>
          <p className="text-xs text-orange-400 font-bold mt-3 uppercase tracking-widest">
            Check "My Squad & XI" to view final rosters & AI Team Analysis
          </p>
          {onReturnHome && (
            <button
              onClick={onReturnHome}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-xs font-black uppercase italic tracking-wider text-black shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:bg-orange-400 transition"
            >
              <Home className="h-4 w-4" />
              Return to Home
            </button>
          )}
        </div>
      </div>
    );
  }

  const isSold = room.status === "SOLD";
  const isUnsold = room.status === "UNSOLD";
  const isUrgent = room.timerRemaining <= 3 && room.status === "BIDDING";

  return (
    <div className="bg-[#0D121F] border border-white/10 rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col">
      {/* Top Gradient Ribbon */}
      <div className="h-2 w-full bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500"></div>

      {/* SOLD Banner Overlay */}
      {isSold && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050810]/95 backdrop-blur-md animate-bounceIn p-6">
          <div className="rounded-2xl border-2 border-orange-500 bg-[#0D121F] px-10 py-8 text-center shadow-[0_0_30px_rgba(249,115,22,0.4)]">
            <div className="text-4xl sm:text-6xl font-black italic text-orange-400 tracking-tighter uppercase">SOLD!</div>
            <div className="text-2xl sm:text-4xl font-black text-white mt-3 italic">₹{room.currentBid.toFixed(2)} Cr</div>
            <div className="text-sm font-bold uppercase tracking-wider text-green-400 mt-2">
              Buyer: {room.highestBidderTeam}
            </div>
          </div>
        </div>
      )}

      {/* UNSOLD Banner Overlay */}
      {isUnsold && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050810]/95 backdrop-blur-md animate-fadeIn p-6">
          <div className="rounded-2xl border-2 border-red-600/60 bg-[#0D121F] px-10 py-8 text-center shadow-2xl">
            <div className="text-4xl sm:text-6xl font-black italic text-red-500 tracking-tighter uppercase">UNSOLD</div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">
              Passed with no valid bids
            </div>
          </div>
        </div>
      )}

      {/* Main Card Content */}
      <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 sm:gap-8">
        {/* Left: Player Avatar Container */}
        <div className="w-full md:w-48 h-56 md:h-64 bg-[#1A2333] rounded-2xl flex-shrink-0 border-4 border-[#1A2333] shadow-inner flex flex-col items-center justify-center overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70"></div>
          
          <div className="text-5xl font-black italic text-orange-400 tracking-tighter z-10">
            {player.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)}
          </div>

          <div className="absolute top-2 right-2 bg-black/60 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-white/20 text-slate-200">
            {player.nationality.substring(0, 3)}
          </div>

          {player.isOverseas && (
            <div className="absolute bottom-2 left-2 bg-blue-600/90 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest text-white shadow">
              OVERSEAS
            </div>
          )}
        </div>

        {/* Right: Info & Pricing */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-block px-3 py-1 bg-orange-500 text-black text-[10px] font-black uppercase rounded-full">
              {player.setName}
            </span>
            <span className="inline-block px-3 py-1 bg-white/10 text-slate-300 text-[10px] font-bold uppercase rounded-full border border-white/10">
              {player.category}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white mb-1">
            {player.name}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">
            <span>
              Role:{" "}
              <span className="text-white">
                {player.role === "BAT"
                  ? "Batsman"
                  : player.role === "BOWL"
                  ? "Bowler"
                  : player.role === "AR"
                  ? "All-Rounder"
                  : "Wicketkeeper"}{" "}
                {player.canKeepWickets && "(WK)"}
              </span>
            </span>
            <span className="text-orange-500">•</span>
            <span>
              Prev Team: <span className="text-white">{player.previousTeam}</span>
            </span>
          </div>

          {/* Price Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
              <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Base Price</p>
              <p className="text-xl sm:text-2xl font-black text-white">₹{player.basePrice.toFixed(2)} Cr</p>
            </div>
            <div className="bg-white/5 p-3.5 rounded-xl border border-white/5">
              <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Current Bid</p>
              <p className="text-xl sm:text-2xl font-black text-orange-500">
                ₹{room.currentBid.toFixed(2)} Cr
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Closing / Timer & Highest Bidder Section */}
      <div className="px-6 sm:px-8 py-4 bg-black/40 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl font-black transition-all ${
              isUrgent
                ? "border-red-500 text-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                : "border-orange-500 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]"
            }`}
          >
            {room.timerRemaining < 10 ? `0${room.timerRemaining}` : room.timerRemaining}
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {isUrgent ? "GOING ONCE..." : "Closing in..."}
            </p>
            <p className="text-sm font-bold text-white uppercase italic">
              High Bidder: <span className="text-orange-400">{room.highestBidderTeam || "None (Base)"}</span>
            </p>
          </div>
        </div>

        {/* Evaluation Metrics Mini-Grid */}
        <div className="flex gap-6 text-center border-l border-white/10 pl-6">
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-500 tracking-[0.2em] mb-0.5">Bat</p>
            <p className="text-lg font-black italic text-amber-400">{player.battingRating}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-500 tracking-[0.2em] mb-0.5">Bowl</p>
            <p className="text-lg font-black italic text-blue-400">{player.bowlingRating}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-500 tracking-[0.2em] mb-0.5">Impact</p>
            <p className="text-lg font-black italic text-emerald-400">{player.impactRating}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase font-bold text-slate-500 tracking-[0.2em] mb-0.5">Overall</p>
            <p className="text-lg font-black italic text-purple-400">{player.overallRating}</p>
          </div>
        </div>
      </div>

      {/* Footer Career Statistics Bar */}
      <div className="px-6 sm:px-8 py-3 bg-[#080C16] border-t border-white/5 grid grid-cols-4 gap-2 text-center">
        <div>
          <p className="text-[9px] uppercase font-bold text-slate-500 tracking-[0.2em]">Matches</p>
          <p className="text-sm font-black italic text-white">{player.stats.matches}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase font-bold text-slate-500 tracking-[0.2em]">Runs</p>
          <p className="text-sm font-black italic text-white">{player.stats.runs}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase font-bold text-slate-500 tracking-[0.2em]">SR / Avg</p>
          <p className="text-sm font-black italic text-orange-400">
            {player.stats.strikeRate} / {player.stats.battingAverage}
          </p>
        </div>
        <div>
          <p className="text-[9px] uppercase font-bold text-slate-500 tracking-[0.2em]">Wickets</p>
          <p className="text-sm font-black italic text-white">{player.stats.wickets}</p>
        </div>
      </div>
    </div>
  );
};

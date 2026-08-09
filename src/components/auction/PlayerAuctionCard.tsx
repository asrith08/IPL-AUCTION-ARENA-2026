import React, { useEffect, useState } from "react";
import { Player, Room, TeamAnalysisScore } from "../../types/index.ts";
import { Clock, Shield, Award, Activity, Flame, Zap, Home, Trophy } from "lucide-react";

interface Props {
  player: Player | null;
  room: Room;
  onReturnHome?: () => void;
}

export const PlayerAuctionCard: React.FC<Props> = ({ player, room, onReturnHome }) => {
  const [fetchedAnalyses, setFetchedAnalyses] = useState<TeamAnalysisScore[]>([]);

  useEffect(() => {
    if (
      (room.status === "COMPLETED" || room.status === "ENDED") &&
      (!room.squadAnalyses || room.squadAnalyses.length === 0)
    ) {
      fetch(`/api/analysis/${room.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.rankings) {
            setFetchedAnalyses(data.rankings);
          }
        })
        .catch(() => {});
    }
  }, [room.status, room.id, room.squadAnalyses]);

  if (!player || room.status === "COMPLETED" || room.status === "ENDED") {
    const analyses =
      room.squadAnalyses && room.squadAnalyses.length > 0
        ? room.squadAnalyses
        : fetchedAnalyses;

    return (
      <div className="rounded-[2rem] border border-white/10 bg-[#0D121F] p-6 shadow-2xl space-y-6">
        <div className="text-center border-b border-white/10 pb-5">
          <Shield className="mx-auto h-12 w-12 text-orange-500 mb-2 animate-pulse" />
          <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-wider text-white">
            AUCTION CONCLUDED
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
            All players have been auctioned. AI Team & Best Playing XI Analysis generated for every franchise squad.
          </p>
          {onReturnHome && (
            <button
              onClick={onReturnHome}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-xs font-black uppercase italic tracking-wider text-black shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:bg-orange-400 transition"
            >
              <Home className="h-4 w-4" />
              Return to Home
            </button>
          )}
        </div>

        {/* Squad XI Analysis Cards for ALL Teams */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
          <h3 className="text-xs font-black uppercase tracking-widest text-orange-400 flex items-center gap-2">
            <Trophy className="h-4 w-4" /> Franchise Squad XI Analysis & Rankings ({analyses.length} Teams)
          </h3>

          {analyses.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              Calculating final team ratings & Best Playing XIs...
            </div>
          ) : (
            analyses.map((team, idx) => (
              <div key={team.userId || idx} className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400 font-mono font-black text-xs border border-orange-500/30">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-lg font-black text-white italic uppercase">{team.teamName}</h4>
                      <p className="text-xs text-emerald-400 font-semibold">{team.verdict}</p>
                    </div>
                  </div>
                  <div className="text-right bg-black/40 px-4 py-2 rounded-xl border border-white/10">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Overall Score</div>
                    <div className="text-2xl font-black text-orange-400">{team.overallScore} <span className="text-xs font-normal text-slate-400">/100</span></div>
                  </div>
                </div>

                {/* Category Scores */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Batting</span>
                    <div className="font-bold text-orange-400">{team.battingScore}/100</div>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Bowling</span>
                    <div className="font-bold text-orange-400">{team.bowlingScore}/100</div>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Openers</span>
                    <div className="font-bold text-orange-400">{team.openersScore}/100</div>
                  </div>
                  <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Spin/Pace</span>
                    <div className="font-bold text-orange-400">{team.spinScore}/{team.paceScore}</div>
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {team.strengths && team.strengths.length > 0 && (
                    <div className="bg-green-950/20 border border-green-500/20 rounded-xl p-3 space-y-1">
                      <span className="text-[10px] uppercase font-black text-green-400 tracking-wider">Strengths</span>
                      <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                        {team.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {team.weaknesses && team.weaknesses.length > 0 && (
                    <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-3 space-y-1">
                      <span className="text-[10px] uppercase font-black text-red-400 tracking-wider">Weaknesses</span>
                      <ul className="list-disc list-inside text-slate-300 text-[11px] space-y-0.5">
                        {team.weaknesses.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Best Playing XI Roster */}
                {team.bestXI && team.bestXI.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Recommended Best Playing XI ({team.bestXI.length} Players)</span>
                    <div className="flex flex-wrap gap-1.5">
                      {team.bestXI.map((p) => (
                        <span key={p.id} className="inline-flex items-center gap-1 bg-black/60 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-slate-200">
                          <span className="font-bold text-orange-400">{p.name}</span>
                          <span className="text-[9px] px-1 bg-white/10 rounded text-slate-400">{p.role}</span>
                          {p.isOverseas && <span className="text-[9px] text-blue-400 font-bold">✈</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {onReturnHome && (
          <div className="text-center pt-2">
            <button
              onClick={onReturnHome}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-xs font-black uppercase italic tracking-wider text-black shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:bg-orange-400 transition"
            >
              <Home className="h-4 w-4" />
              Return to Home
            </button>
          </div>
        )}
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

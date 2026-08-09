import React from "react";
import { Player } from "../../types/index.ts";
import { X, Award, Shield, Zap, Activity } from "lucide-react";

interface Props {
  player: Player | null;
  onClose: () => void;
}

export const PlayerDetailModal: React.FC<Props> = ({ player, onClose }) => {
  if (!player) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-amber-500/30 bg-slate-900 text-slate-100 shadow-2xl">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-emerald-900 via-slate-900 to-amber-950 p-6 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-slate-800/80 p-2 text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 text-2xl font-black text-white shadow-lg border border-amber-300/40">
              {player.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold tracking-tight text-white">{player.name}</h2>
                {player.isOverseas && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-950 px-2.5 py-0.5 text-xs font-semibold text-blue-300 border border-blue-700">
                    🌎 OS
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-amber-400">
                {player.setName} • {player.role === "BAT" ? "Batsman" : player.role === "BOWL" ? "Bowler" : player.role === "AR" ? "All-Rounder" : "Wicketkeeper"} {player.canKeepWickets && "(WK)"}
              </p>
              <p className="text-xs text-slate-400">
                Nationality: {player.nationality} • Prev Team: <span className="font-bold text-slate-200">{player.previousTeam}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
          {/* Auction Financial Info */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-xl bg-slate-800/60 p-4 border border-slate-700/60 text-center">
            <div>
              <div className="text-xs text-slate-400 font-medium">Base Price</div>
              <div className="text-lg font-bold text-amber-400">₹{player.basePrice.toFixed(2)} Cr</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Hist. Sold Price</div>
              <div className="text-lg font-bold text-emerald-400">₹{player.historicalSoldPrice.toFixed(2)} Cr</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Hist. Status</div>
              <div className="text-sm font-semibold text-slate-200 mt-1">{player.historicalStatus}</div>
            </div>
          </div>

          {/* Skill Ratings Grid */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-slate-300 uppercase mb-3">
              <Activity className="h-4 w-4 text-amber-400" /> Evaluation Ratings (0-100)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-lg bg-slate-800/40 p-3 border border-slate-700/40">
                <span className="text-slate-400">Batting</span>
                <div className="text-base font-bold text-amber-400">{player.battingRating}</div>
              </div>
              <div className="rounded-lg bg-slate-800/40 p-3 border border-slate-700/40">
                <span className="text-slate-400">Bowling</span>
                <div className="text-base font-bold text-blue-400">{player.bowlingRating}</div>
              </div>
              <div className="rounded-lg bg-slate-800/40 p-3 border border-slate-700/40">
                <span className="text-slate-400">Impact</span>
                <div className="text-base font-bold text-emerald-400">{player.impactRating}</div>
              </div>
              <div className="rounded-lg bg-slate-800/40 p-3 border border-slate-700/40">
                <span className="text-slate-400">Overall</span>
                <div className="text-base font-bold text-purple-400">{player.overallRating}</div>
              </div>
            </div>
          </div>

          {/* Official Stored IPL Statistics */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-slate-300 uppercase mb-3">
              <Award className="h-4 w-4 text-emerald-400" /> Stored IPL Career Statistics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl bg-slate-800/30 p-4 border border-slate-700/40 text-xs">
              <div>
                <span className="text-slate-400">Matches</span>
                <div className="font-bold text-slate-100 text-sm">{player.stats.matches}</div>
              </div>
              <div>
                <span className="text-slate-400">Runs</span>
                <div className="font-bold text-slate-100 text-sm">{player.stats.runs}</div>
              </div>
              <div>
                <span className="text-slate-400">Batting Avg</span>
                <div className="font-bold text-slate-100 text-sm">{player.stats.battingAverage}</div>
              </div>
              <div>
                <span className="text-slate-400">Strike Rate</span>
                <div className="font-bold text-slate-100 text-sm">{player.stats.strikeRate}</div>
              </div>
              <div>
                <span className="text-slate-400">Wickets</span>
                <div className="font-bold text-slate-100 text-sm">{player.stats.wickets}</div>
              </div>
              <div>
                <span className="text-slate-400">Economy</span>
                <div className="font-bold text-slate-100 text-sm">{player.stats.economy || "N/A"}</div>
              </div>
              <div>
                <span className="text-slate-400">50s / 100s</span>
                <div className="font-bold text-slate-100 text-sm">{player.stats.fifties} / {player.stats.hundreds}</div>
              </div>
              <div>
                <span className="text-slate-400">Catches / St.</span>
                <div className="font-bold text-slate-100 text-sm">{player.stats.catches} / {player.stats.stumpings}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

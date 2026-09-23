import React, { useEffect, useState } from "react";
import { TeamAnalysisScore } from "../../types/index.ts";
import { X, Award, Shield, CheckCircle, AlertTriangle, Trophy } from "lucide-react";

interface Props {
  isOpen: boolean;
  roomId: string;
  onClose: () => void;
}

export const TeamAnalysisModal: React.FC<Props> = ({ isOpen, roomId, onClose }) => {
  const [rankings, setRankings] = useState<TeamAnalysisScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(`/api/analysis/${roomId}`)
        .then((res) => res.json())
        .then((data) => {
          setRankings(data.rankings || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, roomId]);

  if (!isOpen) return null;

  const currentTeam = rankings[activeTab] || rankings[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative flex h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 p-5">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-400" />
            <h2 className="text-xl font-bold text-white">IPL Auction Team Rankings & Best XI AI</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-1 items-center justify-center text-slate-400 p-8 text-center text-sm">
            Calculating cricket rating scores & Best XIs...
          </div>
        ) : (
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Left Sidebar: Team Rankings List (Horizontal on mobile, vertical on desktop) */}
            <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/60 p-3 sm:p-4 overflow-x-auto md:overflow-y-auto space-y-0 md:space-y-2 flex md:flex-col gap-2 shrink-0">
              <h3 className="hidden md:block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">Franchise Leaderboard</h3>
              {rankings.map((t, idx) => (
                <div
                  key={t.userId}
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center justify-between rounded-xl border p-2.5 sm:p-3 text-xs cursor-pointer transition shrink-0 min-w-[140px] md:min-w-0 ${
                    activeTab === idx
                      ? "border-amber-500 bg-amber-950/30 text-amber-300 font-bold"
                      : "border-slate-800 bg-slate-900/40 text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="font-mono text-slate-500 font-bold text-[11px] sm:text-xs">#{idx + 1}</span>
                    <span className="truncate max-w-[90px] md:max-w-none">{t.teamName}</span>
                  </div>
                  <span className="font-extrabold text-emerald-400 text-[11px] sm:text-xs ml-2">{t.overallScore}/100</span>
                </div>
              ))}
            </div>

            {/* Right: Detailed Breakdown */}
            {currentTeam && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Score Spotlight */}
                <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">{currentTeam.teamName}</h3>
                    <p className="text-xs text-amber-300 font-semibold mt-1">{currentTeam.verdict}</p>
                  </div>
                  <div className="text-center bg-slate-950/80 rounded-2xl border border-amber-500/40 px-4 sm:px-5 py-2.5 sm:py-3 shadow-lg">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Overall Score</div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-400">{currentTeam.overallScore}</div>
                  </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-xl bg-slate-800/40 p-3 border border-slate-700/40">
                    <span className="text-slate-400">Batting</span>
                    <div className="text-base font-bold text-amber-400">{currentTeam.battingScore}/100</div>
                  </div>
                  <div className="rounded-xl bg-slate-800/40 p-3 border border-slate-700/40">
                    <span className="text-slate-400">Bowling</span>
                    <div className="text-base font-bold text-blue-400">{currentTeam.bowlingScore}/100</div>
                  </div>
                  <div className="rounded-xl bg-slate-800/40 p-3 border border-slate-700/40">
                    <span className="text-slate-400">Openers</span>
                    <div className="text-base font-bold text-emerald-400">{currentTeam.openersScore}/100</div>
                  </div>
                  <div className="rounded-xl bg-slate-800/40 p-3 border border-slate-700/40">
                    <span className="text-slate-400">Finishing</span>
                    <div className="text-base font-bold text-purple-400">{currentTeam.finishingScore}/100</div>
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2">
                    <h4 className="font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                      <CheckCircle className="h-4 w-4" /> Team Strengths
                    </h4>
                    <ul className="space-y-1 text-emerald-200">
                      {currentTeam.strengths.map((s, idx) => (
                        <li key={idx}>• {s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-2">
                    <h4 className="font-bold text-amber-400 flex items-center gap-1.5 uppercase">
                      <AlertTriangle className="h-4 w-4" /> Vulnerabilities
                    </h4>
                    <ul className="space-y-1 text-amber-200">
                      {currentTeam.weaknesses.map((w, idx) => (
                        <li key={idx}>• {w}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Best XI List */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    Optimal Best Possible XI Lineup
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {currentTeam.bestXI.map((p, idx) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between rounded-lg bg-slate-800/50 p-2.5 border border-slate-700/50"
                      >
                        <span className="font-mono text-slate-500 font-bold">{idx + 1}.</span>
                        <span className="font-bold text-slate-200 flex-1 ml-2">
                          {p.name} {p.isOverseas && <span className="text-blue-400 text-[10px]">🌎 OS</span>}
                        </span>
                        <span className="text-slate-400">{p.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

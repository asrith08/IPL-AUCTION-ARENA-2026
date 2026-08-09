import React, { useState } from "react";
import { Player, Room, SquadPlayer } from "../../types/index.ts";
import { Shield, Award, Users, Trophy, CheckCircle, BarChart2 } from "lucide-react";

interface Props {
  room: Room;
  currentUserId: string;
  onOpenAnalysis: () => void;
  onOpenDatabase: () => void;
}

export const SquadView: React.FC<Props> = ({
  room,
  currentUserId,
  onOpenAnalysis,
  onOpenDatabase,
}) => {
  const participant = room.participants[currentUserId];
  const [selectedXIIds, setSelectedXIIds] = useState<string[]>([]);

  if (!participant) return null;

  const squad = participant.squad;
  const overseasCount = squad.filter((s) => s.player.isOverseas).length;

  const toggleSelectXI = (playerId: string) => {
    if (selectedXIIds.includes(playerId)) {
      setSelectedXIIds(selectedXIIds.filter((id) => id !== playerId));
    } else {
      if (selectedXIIds.length >= 11) return;
      setSelectedXIIds([...selectedXIIds, playerId]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Franchise Summary Header */}
      <div className="rounded-[2rem] border border-white/10 bg-[#0D121F] p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-[10px] font-black text-orange-400 border border-orange-500/30 uppercase tracking-widest mb-2">
            <Trophy className="h-3.5 w-3.5" /> FRANCHISE SQUAD HUB
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white">{participant.teamName}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manager: <span className="text-orange-400 font-bold">{participant.managerName}</span> • Total Spent: ₹{participant.purseSpent.toFixed(2)} Cr
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="text-right pr-4 border-r border-white/10">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Purse Left</div>
            <div className="text-xl font-black font-mono text-green-400">₹{participant.purseRemaining.toFixed(2)} Cr</div>
          </div>

          <div className="text-right pr-4 border-r border-white/10">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Squad Count</div>
            <div className="text-xl font-black font-mono text-white">{squad.length} / {room.settings.maxSquadSize}</div>
          </div>

          <div className="text-right pr-4 border-r border-white/10">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Overseas</div>
            <div className="text-xl font-black font-mono text-blue-400">{overseasCount} / 8 OS</div>
          </div>

          <button
            onClick={onOpenAnalysis}
            className="flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black px-5 py-3 text-xs font-black uppercase italic tracking-wider shadow-[0_0_15px_rgba(249,115,22,0.4)] transition"
          >
            <BarChart2 className="h-4 w-4" />
            ANALYZE TEAM & RANKINGS
          </button>
        </div>
      </div>

      {/* Playing XI Selection Guidance */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0D121F] p-4 text-xs">
        <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">
          Custom Playing XI ({selectedXIIds.length}/11 Selected)
        </span>

        <button
          onClick={onOpenDatabase}
          className="text-orange-400 font-bold hover:text-orange-300 transition uppercase tracking-widest text-[11px]"
        >
          + Browse All Players Database
        </button>
      </div>

      {/* Squad Players Grid */}
      {squad.length === 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-[#0D121F] p-12 text-center text-slate-400">
          <Shield className="mx-auto h-12 w-12 text-slate-600 mb-3 animate-pulse" />
          <h3 className="text-lg font-black italic uppercase text-slate-400 tracking-wider">No Players Bought Yet</h3>
          <p className="text-xs text-slate-500 mt-1">Participate in live bidding to build your franchise squad!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {squad.map(({ player, soldPrice }) => {
            const isSelectedInXI = selectedXIIds.includes(player.id);

            return (
              <div
                key={player.id}
                onClick={() => toggleSelectXI(player.id)}
                className={`relative rounded-2xl border p-4 transition cursor-pointer ${
                  isSelectedInXI
                    ? "border-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                    : "border-white/10 bg-[#0D121F] hover:border-white/20"
                }`}
              >
                {isSelectedInXI && (
                  <div className="absolute top-3 right-3 rounded-full bg-orange-500 p-1 text-black">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1A2333] text-sm font-black italic text-orange-400 border border-white/10">
                    {player.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      {player.name}
                      {player.isOverseas && <span className="text-[10px] text-blue-400 font-bold">OS</span>}
                    </div>
                    <div className="text-xs text-slate-400">
                      {player.role} • Prev: {player.previousTeam}
                    </div>
                    <div className="text-xs font-mono font-bold text-orange-400 mt-1">
                      Bought for ₹{soldPrice.toFixed(2)} Cr
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

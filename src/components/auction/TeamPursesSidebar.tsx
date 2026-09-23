import React, { useState } from "react";
import { Room, RoomParticipant } from "../../types/index.ts";
import { Users, Shield, Award, CheckCircle2 } from "lucide-react";

interface Props {
  room: Room;
  currentUserId: string;
}

export const TeamPursesSidebar: React.FC<Props> = ({ room, currentUserId }) => {
  const participants: RoomParticipant[] = Object.values(room.participants);
  // Default to showing all teams, or filter by specific participant
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>("ALL");

  const totalSold = participants.reduce((sum, p) => sum + p.squad.length, 0);

  const filteredParticipants =
    selectedTeamFilter === "ALL"
      ? participants
      : selectedTeamFilter === "OTHERS"
      ? participants.filter((p) => p.userId !== currentUserId)
      : participants.filter((p) => p.userId === selectedTeamFilter);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "BAT":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "BOWL":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
      case "AR":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "WK":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-white/10 text-slate-300 border-white/10";
    }
  };

  return (
    <aside className="bg-[#080C16] border border-white/5 rounded-2xl flex flex-col p-3.5 sm:p-4 gap-3 shadow-xl h-full max-h-[500px] lg:max-h-[820px]">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div>
          <h3 className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-orange-500" />
            Purchased Players by Team
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
            {totalSold} total {totalSold === 1 ? "player" : "players"} sold across franchises
          </p>
        </div>
      </div>

      {/* Team Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px] font-bold uppercase tracking-wider">
        <button
          onClick={() => setSelectedTeamFilter("ALL")}
          className={`px-2.5 py-1 rounded-lg transition shrink-0 ${
            selectedTeamFilter === "ALL"
              ? "bg-orange-500 text-black font-black"
              : "bg-white/5 text-slate-400 hover:text-white"
          }`}
        >
          All Teams ({participants.length})
        </button>
        <button
          onClick={() => setSelectedTeamFilter("OTHERS")}
          className={`px-2.5 py-1 rounded-lg transition shrink-0 ${
            selectedTeamFilter === "OTHERS"
              ? "bg-orange-500 text-black font-black"
              : "bg-white/5 text-slate-400 hover:text-white"
          }`}
        >
          Other Teams ({participants.filter((p) => p.userId !== currentUserId).length})
        </button>
        {participants.map((p) => (
          <button
            key={p.userId}
            onClick={() => setSelectedTeamFilter(p.userId)}
            className={`px-2.5 py-1 rounded-lg transition shrink-0 truncate max-w-[130px] ${
              selectedTeamFilter === p.userId
                ? "bg-orange-500 text-black font-black"
                : "bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            {p.teamName} ({p.squad.length})
          </button>
        ))}
      </div>

      {/* Team Cards & Purchased Players List */}
      <div className="space-y-3 overflow-y-auto pr-1 flex-1">
        {filteredParticipants.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 italic">
            No teams found for the selected view
          </div>
        ) : (
          filteredParticipants.map((p) => {
            const isYou = p.userId === currentUserId;
            const overseasBought = p.squad.filter((s) => s.player.isOverseas).length;

            return (
              <div
                key={p.userId}
                className={`rounded-xl border p-3.5 space-y-2.5 transition-all ${
                  isYou
                    ? "bg-gradient-to-r from-[#1A2234] to-[#0D121F] border-orange-500/40 shadow-lg"
                    : "bg-white/[0.03] border-white/5 hover:border-white/15"
                }`}
              >
                {/* Team Header */}
                <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-xs uppercase italic text-white tracking-wide">
                        {p.teamName}
                      </h4>
                      {isYou ? (
                        <span className="px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[9px] font-black uppercase tracking-wider">
                          YOU
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded bg-white/10 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                          Rival
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Manager: <span className="text-slate-300 font-semibold">{p.managerName}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-mono font-bold text-orange-400">
                      ₹{p.purseSpent.toFixed(2)} Cr Spent
                    </div>
                    <div className="text-[9px] text-slate-400">
                      {p.squad.length}/{room.settings.maxSquadSize} ({overseasBought} OS)
                    </div>
                  </div>
                </div>

                {/* Purchased Players */}
                {p.squad.length === 0 ? (
                  <div className="py-2.5 text-center text-[11px] text-slate-500 italic bg-black/20 rounded-lg border border-dashed border-white/5">
                    No players purchased yet
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {p.squad.map(({ player, soldPrice }, idx) => (
                      <div
                        key={player.id || idx}
                        className="flex items-center justify-between gap-2 bg-black/40 rounded-lg px-2.5 py-1.5 border border-white/5 hover:border-white/15 transition text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white/10 font-mono text-[9px] font-bold text-slate-300">
                            {idx + 1}
                          </span>
                          <div className="min-w-0 truncate">
                            <span className="font-bold text-white tracking-tight truncate block text-xs">
                              {player.name}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span
                                className={`text-[8px] px-1 py-0.2 rounded border font-bold uppercase tracking-wider ${getRoleBadgeColor(
                                  player.role
                                )}`}
                              >
                                {player.role}
                              </span>
                              {player.isOverseas && (
                                <span className="text-[8px] px-1 py-0.2 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold uppercase tracking-wider">
                                  OS ✈
                                </span>
                              )}
                              <span className="text-[9px] text-slate-500 truncate">
                                {player.previousTeam}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-mono font-black text-orange-400 text-xs block">
                            ₹{soldPrice.toFixed(2)} Cr
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

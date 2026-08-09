import React, { useState, useMemo } from "react";
import { Player } from "../../types/index.ts";
import { MASTER_PLAYER_DATASET } from "../../data/players.ts";
import { PlayerDetailModal } from "./PlayerDetailModal.tsx";
import { Search, Filter, X, Eye } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PlayerDatabaseModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [overseasFilter, setOverseasFilter] = useState<string>("ALL");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const filteredPlayers = useMemo(() => {
    return MASTER_PLAYER_DATASET.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.previousTeam.toLowerCase().includes(search.toLowerCase()) ||
        p.nationality.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "ALL" || p.role === roleFilter;
      const matchesCategory = categoryFilter === "ALL" || p.category === categoryFilter;
      const matchesOS =
        overseasFilter === "ALL" ||
        (overseasFilter === "OVERSEAS" && p.isOverseas) ||
        (overseasFilter === "INDIAN" && !p.isOverseas);

      return matchesSearch && matchesRole && matchesCategory && matchesOS;
    });
  }, [search, roleFilter, categoryFilter, overseasFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0D121F] text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-[#080C16] p-6">
          <div>
            <h2 className="text-xl font-black italic uppercase text-white tracking-tight">IPL 2026 Player Database</h2>
            <p className="text-xs text-slate-400 mt-1">
              Showing {filteredPlayers.length} of {MASTER_PLAYER_DATASET.length} authoritative players
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-white/5 p-2.5 text-slate-400 hover:bg-white/10 hover:text-white transition border border-white/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 border-b border-white/5 bg-[#0D121F] p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search player, team..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-xs text-slate-200 focus:border-orange-500 focus:outline-none"
          >
            <option value="ALL" className="bg-[#0D121F]">All Roles</option>
            <option value="BAT" className="bg-[#0D121F]">Batsman (BAT)</option>
            <option value="BOWL" className="bg-[#0D121F]">Bowler (BOWL)</option>
            <option value="AR" className="bg-[#0D121F]">All-Rounder (AR)</option>
            <option value="WK" className="bg-[#0D121F]">Wicketkeeper (WK)</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-xs text-slate-200 focus:border-orange-500 focus:outline-none"
          >
            <option value="ALL" className="bg-[#0D121F]">All Categories</option>
            <option value="MARQUEE" className="bg-[#0D121F]">Marquee Players</option>
            <option value="BATSMAN" className="bg-[#0D121F]">Batsmen Sets</option>
            <option value="BOWLER" className="bg-[#0D121F]">Bowlers Sets</option>
            <option value="ALL_ROUNDER" className="bg-[#0D121F]">All-Rounders Sets</option>
            <option value="WICKETKEEPER" className="bg-[#0D121F]">Wicketkeepers Sets</option>
          </select>

          <select
            value={overseasFilter}
            onChange={(e) => setOverseasFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 py-2 px-3 text-xs text-slate-200 focus:border-orange-500 focus:outline-none"
          >
            <option value="ALL" className="bg-[#0D121F]">All Nationalities</option>
            <option value="INDIAN" className="bg-[#0D121F]">Indian Players</option>
            <option value="OVERSEAS" className="bg-[#0D121F]">Overseas Players 🌎</option>
          </select>
        </div>

        {/* Player List Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filteredPlayers.map((player) => (
              <div
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                className="group relative flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3.5 hover:border-orange-500/50 hover:bg-white/10 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A2333] text-xs font-black italic text-orange-400 border border-white/10">
                    {player.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-sm text-white group-hover:text-orange-400 transition">
                      {player.name}
                      {player.isOverseas && (
                        <span className="text-[10px] text-blue-400 font-bold">OS</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      {player.role} • {player.previousTeam} • Base: ₹{player.basePrice.toFixed(2)} Cr
                    </div>
                  </div>
                </div>

                <Eye className="h-4 w-4 text-slate-500 group-hover:text-orange-400 transition" />
              </div>
            ))}
          </div>
        </div>

        <PlayerDetailModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      </div>
    </div>
  );
};

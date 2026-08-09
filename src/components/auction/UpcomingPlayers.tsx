import React from "react";
import { Player, Room } from "../../types/index.ts";
import { ListFilter, Globe } from "lucide-react";

interface Props {
  room: Room;
}

export const UpcomingPlayers: React.FC<Props> = ({ room }) => {
  const currentIndex = room.currentAuctionIndex;
  const upcoming = room.auctionQueue.slice(currentIndex + 1, currentIndex + 8);

  return (
    <aside className="bg-[#080C16] border border-white/5 rounded-2xl flex flex-col p-4 gap-4 shadow-xl">
      <h3 className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">
        Upcoming Queue ({upcoming.length})
      </h3>

      <div className="space-y-3 overflow-hidden">
        {upcoming.length === 0 ? (
          <div className="text-xs text-slate-500 py-6 text-center italic">No more players in upcoming set</div>
        ) : (
          upcoming.map((p, idx) => (
            <div
              key={p.id}
              className={`p-3 rounded-lg border border-white/5 relative overflow-hidden transition-all ${
                idx === 0
                  ? "bg-white/10 text-white shadow-lg"
                  : "bg-white/5 text-slate-300 opacity-70 hover:opacity-100"
              }`}
            >
              <div
                className={`absolute left-0 top-0 w-1 h-full ${
                  p.isOverseas ? "bg-blue-500" : "bg-orange-500"
                }`}
              ></div>

              <div className="flex justify-between items-start pl-1">
                <div>
                  <p className="text-[9px] text-orange-400 font-bold uppercase tracking-wider">
                    {p.setName} • {p.role}
                  </p>
                  <p className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 mt-0.5">
                    {p.name}
                    {p.isOverseas && <span className="text-[9px] text-blue-400 font-bold">OS</span>}
                  </p>
                  <p className="text-[11px] text-slate-400 italic">Prev: {p.previousTeam}</p>
                </div>
                <p className="text-xs font-mono font-bold text-orange-400">
                  ₹{p.basePrice.toFixed(2)} Cr
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-auto p-3.5 bg-gradient-to-b from-blue-900/20 to-transparent rounded-xl border border-blue-500/20">
        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mb-1">Queue Strategy Tip</p>
        <p className="text-[11px] text-slate-400 leading-relaxed italic">
          Keep an eye on overseas player limits for upcoming sets to maintain tactical squad depth.
        </p>
      </div>
    </aside>
  );
};

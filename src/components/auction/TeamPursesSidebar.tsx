import React from "react";
import { Room, RoomParticipant } from "../../types/index.ts";
import { Users, DollarSign, Shield } from "lucide-react";

interface Props {
  room: Room;
  currentUserId: string;
}

export const TeamPursesSidebar: React.FC<Props> = ({ room, currentUserId }) => {
  const participants: RoomParticipant[] = Object.values(room.participants);

  return (
    <aside className="bg-[#080C16] border border-white/5 rounded-2xl flex flex-col p-5 shadow-xl space-y-4">
      <h3 className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em]">
        Team Overview ({participants.length})
      </h3>

      <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
        {participants.map((p) => {
          const overseasCount = p.squad.filter((s) => s.player.isOverseas).length;
          const isYou = p.userId === currentUserId;
          const pursePercent = Math.max(0, Math.min(100, (p.purseRemaining / room.settings.totalPurse) * 100));

          return (
            <div
              key={p.userId}
              className={`p-4 rounded-2xl border transition-all ${
                isYou
                  ? "bg-gradient-to-r from-[#1E293B] to-[#0F172A] border-orange-500/50 shadow-xl"
                  : "bg-white/5 border-white/5 opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex justify-between items-start mb-2.5">
                <div>
                  <h4 className="font-black text-sm uppercase italic text-white flex items-center gap-1.5">
                    {p.teamName}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold">Manager: {p.managerName}</p>
                </div>
                {isYou && (
                  <div className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-[10px] font-black uppercase tracking-wider">
                    YOU
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Purse Remaining</span>
                  <span className="font-mono font-black text-green-400">
                    ₹{p.purseRemaining.toFixed(2)} Cr
                  </span>
                </div>

                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pursePercent}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-[10px] font-bold pt-1 uppercase">
                  <div className="flex gap-1">
                    <span className="text-slate-500">Squad:</span>
                    <span className="text-white">
                      {p.squad.length}/{room.settings.maxSquadSize}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <span className="text-slate-500">OS:</span>
                    <span className="text-blue-400">{overseasCount}/8</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

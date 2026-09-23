import React, { useState } from "react";
import { X, Shield, DollarSign, Clock, Users } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: {
    roomName: string;
    hostUserName: string;
    hostTeamName: string;
    hostManagerName: string;
    isPublic: boolean;
    totalPurse: number;
    maxSquadSize: number;
    timerDuration: number;
  }) => void;
}

export const CreateRoomModal: React.FC<Props> = ({ isOpen, onClose, onCreate }) => {
  const [roomName, setRoomName] = useState("IPL 2026 Championship Auction");
  const [hostUserName, setHostUserName] = useState("Manager 1");
  const [hostTeamName, setHostTeamName] = useState("Royal Strikers XI");
  const [hostManagerName, setHostManagerName] = useState("Asrith");
  const [isPublic, setIsPublic] = useState(true);
  const [totalPurse, setTotalPurse] = useState(100);
  const [maxSquadSize, setMaxSquadSize] = useState(18);
  const [timerDuration, setTimerDuration] = useState(10);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      roomName,
      hostUserName,
      hostTeamName,
      hostManagerName,
      isPublic,
      totalPurse,
      maxSquadSize,
      timerDuration,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 p-5">
          <h2 className="text-xl font-bold text-amber-400">Create IPL Auction Room</h2>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name</label>
              <input
                type="text"
                required
                value={hostUserName}
                onChange={(e) => setHostUserName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Franchise Team Name</label>
              <input
                type="text"
                required
                value={hostTeamName}
                onChange={(e) => setHostTeamName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Auction Room Name</label>
            <input
              type="text"
              required
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Purse (Cr)</label>
              <select
                value={totalPurse}
                onChange={(e) => setTotalPurse(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
              >
                <option value={100}>₹100 Crore</option>
                <option value={120}>₹120 Crore</option>
                <option value={150}>₹150 Crore</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Max Squad</label>
              <select
                value={maxSquadSize}
                onChange={(e) => setMaxSquadSize(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
              >
                <option value={15}>15 Players</option>
                <option value={18}>18 Players</option>
                <option value={25}>25 Players</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bid Timer</label>
              <select
                value={timerDuration}
                onChange={(e) => setTimerDuration(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
              >
                <option value={8}>8 Seconds</option>
                <option value={10}>10 Seconds</option>
                <option value={15}>15 Seconds</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/40 p-3.5">
            <div>
              <div className="text-sm font-bold text-slate-200">Public Discoverable Room</div>
              <div className="text-xs text-slate-400">Allow users to discover and join from public rooms list</div>
            </div>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500"
            >
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

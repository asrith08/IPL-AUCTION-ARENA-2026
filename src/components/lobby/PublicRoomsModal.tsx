import React, { useEffect, useState } from "react";
import { Room } from "../../types/index.ts";
import { X, Users, Trophy, Play } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoom: (roomId: string) => void;
}

export const PublicRoomsModal: React.FC<Props> = ({ isOpen, onClose, onSelectRoom }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch("/api/rooms")
        .then((res) => res.json())
        .then((data) => {
          setRooms(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
      <div className="relative flex h-[70vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 p-5">
          <h2 className="text-xl font-bold text-amber-400">Discover Public Auction Rooms</h2>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading public rooms...</div>
          ) : rooms.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Trophy className="mx-auto h-12 w-12 text-slate-600 mb-3" />
              No public auction rooms currently active. Be the first to create one!
            </div>
          ) : (
            <div className="space-y-3">
              {rooms.map((room) => {
                const count = Object.keys(room.participants).length;
                return (
                  <div
                    key={room.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/40 p-4 hover:border-amber-500/50 transition"
                  >
                    <div>
                      <h3 className="font-bold text-slate-100">{room.name}</h3>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1 text-amber-400 font-medium">
                          <Users className="h-3.5 w-3.5" /> {count} / 10 Participants
                        </span>
                        <span>Purse: ₹{room.settings.totalPurse} Cr</span>
                        <span>Timer: {room.settings.timerDuration}s</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectRoom(room.id)}
                      disabled={count >= 10}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-50 transition"
                    >
                      <Play className="h-3.5 w-3.5" />
                      {count >= 10 ? "Full" : "Join"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

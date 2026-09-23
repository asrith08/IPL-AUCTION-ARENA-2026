import React from "react";
import { Player, Room } from "../../types/index.ts";
import { Gavel, AlertCircle, TrendingUp } from "lucide-react";

interface Props {
  room: Room;
  currentUserId: string;
  onPlaceBid: (amount?: number) => void;
}

export const BidActionBar: React.FC<Props> = ({ room, currentUserId, onPlaceBid }) => {
  const participant = room.participants[currentUserId];
  const player = room.currentPlayer;

  if (!participant) return null;

  if (!player || room.status === "COMPLETED" || room.status === "ENDED") {
    return (
      <div className="bg-[#0D121F] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] mb-0.5">Final Franchise Purse</div>
          <div className="text-xl font-black text-green-400 italic">
            ₹{participant.purseRemaining.toFixed(2)} Cr <span className="text-xs font-bold text-slate-400 uppercase italic">remaining</span>
          </div>
        </div>
        <div className="px-5 py-2.5 bg-red-950/40 border border-red-500/30 rounded-xl text-xs font-bold text-red-400 uppercase tracking-wider">
          Auction Concluded • Bidding Closed
        </div>
      </div>
    );
  }

  const isHighestBidder = room.highestBidderId === currentUserId;
  const isBiddingActive = room.status === "BIDDING";

  // Calculated next bid amount based on increment rules
  let increment = 0.25;
  if (room.currentBid >= 20.0) increment = 2.0;
  else if (room.currentBid >= 10.0) increment = 1.0;
  else if (room.currentBid >= 5.0) increment = 0.5;

  const nextBidAmount = room.highestBidderId !== null
    ? Math.round((room.currentBid + increment) * 100) / 100
    : room.currentBid;

  // Validation checks
  const squadFull = participant.squad.length >= room.settings.maxSquadSize;
  const overseasCount = participant.squad.filter((s) => s.player.isOverseas).length;
  const overseasFull = player.isOverseas && overseasCount >= room.settings.maxOverseas;
  const insufficientPurse = nextBidAmount > participant.purseRemaining;

  const canBid = isBiddingActive && !isHighestBidder && !squadFull && !overseasFull && !insufficientPurse;

  let disabledReason = "";
  if (!isBiddingActive) disabledReason = "Bidding paused / inactive";
  else if (isHighestBidder) disabledReason = "You are currently highest bidder";
  else if (squadFull) disabledReason = `Squad limit reached (${room.settings.maxSquadSize} max)`;
  else if (overseasFull) disabledReason = "Overseas limit reached (8 max)";
  else if (insufficientPurse) disabledReason = `Insufficient purse! Need ₹${nextBidAmount.toFixed(2)} Cr`;

  return (
    <div className="bg-[#0D121F] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
      {disabledReason && !canBid && (
        <div className="flex items-center gap-2 rounded-xl bg-orange-950/30 border border-orange-500/30 px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-bold text-orange-400 uppercase tracking-wider">
          <AlertCircle className="h-4 w-4 shrink-0 text-orange-500" />
          <span>{disabledReason}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em] mb-0.5">Your Franchise Purse</div>
          <div className="text-lg sm:text-xl font-black text-green-400 italic">
            ₹{participant.purseRemaining.toFixed(2)} Cr <span className="text-xs font-bold text-slate-400 uppercase italic">remaining</span>
          </div>
        </div>

        {/* Action Bidding Buttons */}
        <div className="w-full sm:w-auto flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
          {/* Main Quick Bid Button with Neon Glow */}
          <button
            onClick={() => onPlaceBid(nextBidAmount)}
            disabled={!canBid}
            className="flex-1 sm:flex-initial justify-center px-4 sm:px-8 py-3 sm:py-3.5 bg-orange-500 hover:bg-orange-400 text-black rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all transform active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:shadow-none flex items-center gap-2 min-w-[140px]"
          >
            <Gavel className="h-4 w-4 shrink-0" />
            <span>BID ₹{nextBidAmount.toFixed(2)} Cr</span>
          </button>

          {/* Aggressive Raise Buttons */}
          {canBid && (
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <button
                onClick={() => onPlaceBid(Math.round((nextBidAmount + 0.5) * 100) / 100)}
                className="flex-1 sm:flex-initial px-3 sm:px-5 py-3 sm:py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all text-center whitespace-nowrap"
              >
                + ₹0.50 Cr
              </button>
              <button
                onClick={() => onPlaceBid(Math.round((nextBidAmount + 1.0) * 100) / 100)}
                className="flex-1 sm:flex-initial px-3 sm:px-5 py-3 sm:py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all text-center whitespace-nowrap"
              >
                + ₹1.00 Cr
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import {
  AuctionSettings,
  Bid,
  Player,
  Room,
  RoomParticipant,
  SquadPlayer,
} from "../../types/index.ts";
import { MASTER_PLAYER_DATASET } from "../../data/players.ts";
import { calculateBestXIAndAnalysis } from "./bestXIService.ts";

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private transitionTimeouts: Map<string, NodeJS.Timeout> = new Map();

  private generateSquadAnalyses(room: Room) {
    const analyses = Object.values(room.participants).map((p) =>
      calculateBestXIAndAnalysis(p.userId, p.teamName, p.squad)
    );
    analyses.sort((a, b) => b.overallScore - a.overallScore);
    room.squadAnalyses = analyses;
  }

  // Helper: Secure Random Shuffle
  private shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private clearTransitionTimeout(roomId: string) {
    const t = this.transitionTimeouts.get(roomId);
    if (t) {
      clearTimeout(t);
      this.transitionTimeouts.delete(roomId);
    }
  }

  private setTransitionTimeout(roomId: string, fn: () => void, delay: number) {
    this.clearTransitionTimeout(roomId);
    const t = setTimeout(() => {
      this.transitionTimeouts.delete(roomId);
      fn();
    }, delay);
    this.transitionTimeouts.set(roomId, t);
  }

  public createRoom(
    hostUserId: string,
    hostUserName: string,
    hostTeamName: string,
    hostManagerName: string,
    roomName: string,
    isPublic: boolean,
    customSettings?: Partial<AuctionSettings>
  ): Room {
    const roomId = "room_" + Math.random().toString(36).substring(2, 9);
    const code = "IPL-" + Math.random().toString(36).substring(2, 7).toUpperCase();
    const token = Math.random().toString(36).substring(2, 15);

    const settings: AuctionSettings = {
      timerDuration: customSettings?.timerDuration || 10,
      timerMin: customSettings?.timerMin || 5,
      timerMax: customSettings?.timerMax || 15,
      totalPurse: customSettings?.totalPurse || 100, // 100 Crore default
      maxSquadSize: customSettings?.maxSquadSize || 18,
      maxOverseas: 8, // Hard restriction
    };

    const hostParticipant: RoomParticipant = {
      userId: hostUserId,
      userName: hostUserName,
      teamName: hostTeamName || `${hostUserName}'s XI`,
      managerName: hostManagerName || hostUserName,
      isHost: true,
      joinedAt: Date.now(),
      purseRemaining: settings.totalPurse,
      purseSpent: 0,
      squad: [],
    };

    // Marquee & High-Profile player pool guarantee:
    // Marquee players appear first in randomized order before regular players.
    const MARQUEE_NAMES = new Set([
      "Virat Kohli",
      "Rohit Sharma",
      "Travis Head",
      "Vaibhav Suryavanshi",
      "Abhishek Sharma",
      "Jasprit Bumrah",
      "Rishabh Pant",
      "Heinrich Klaasen",
      "Pat Cummins",
      "Shreyas Iyer",
      "Jos Buttler",
      "KL Rahul",
      "Mitchell Starc",
      "Rashid Khan",
      "Arshdeep Singh",
      "MS Dhoni",
      "Hardik Pandya",
      "Suryakumar Yadav",
      "Shubman Gill",
      "Yashasvi Jaiswal",
      "Sunil Narine",
      "Nicholas Pooran",
      "Glenn Maxwell",
      "Ravindra Jadeja",
      "Rinku Singh",
    ]);

    const isMarquee = (p: Player) =>
      MARQUEE_NAMES.has(p.name) || p.category === "MARQUEE" || p.tier === "MARQUEE";

    const marqueePool = MASTER_PLAYER_DATASET.filter(isMarquee);
    const regularPool = MASTER_PLAYER_DATASET.filter((p) => !isMarquee(p));

    const shuffledMarquee = this.shuffleArray(marqueePool);
    const shuffledRegular = this.shuffleArray(regularPool);
    const shuffledQueue = [...shuffledMarquee, ...shuffledRegular];

    const room: Room = {
      id: roomId,
      name: roomName || `${hostUserName}'s IPL Room`,
      code,
      isPublic,
      token,
      hostId: hostUserId,
      participants: {
        [hostUserId]: hostParticipant,
      },
      settings,
      status: "WAITING",
      currentAuctionIndex: 0,
      auctionQueue: shuffledQueue,
      currentPlayer: null,
      currentBid: 0,
      highestBidderId: null,
      highestBidderTeam: null,
      highestBidderName: null,
      timerRemaining: settings.timerDuration,
      history: [],
      soldPlayers: [],
      unsoldPlayers: [],
      createdAt: Date.now(),
    };

    this.rooms.set(roomId, room);
    return room;
  }

  public getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  public getAllPublicRooms(): Room[] {
    return Array.from(this.rooms.values()).filter(
      (r) => r.isPublic && r.status !== "ENDED" && r.status !== "COMPLETED"
    );
  }

  public joinRoom(
    roomId: string,
    userId: string,
    userName: string,
    teamName: string,
    managerName: string
  ): { room?: Room; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) return { error: "Room not found" };

    if (Object.keys(room.participants).length >= 10 && !room.participants[userId]) {
      return { error: "Room is full (Maximum 10 participants allowed)" };
    }

    if (!room.participants[userId]) {
      room.participants[userId] = {
        userId,
        userName,
        teamName: teamName || `${userName}'s XI`,
        managerName: managerName || userName,
        isHost: room.hostId === userId,
        joinedAt: Date.now(),
        purseRemaining: room.settings.totalPurse,
        purseSpent: 0,
        squad: [],
      };
    } else {
      // Reconnection
      room.participants[userId].isDisconnected = false;
      if (userName && userName !== "Guest Manager") room.participants[userId].userName = userName;
      if (teamName && teamName !== "Guest XI") room.participants[userId].teamName = teamName;
      if (managerName && managerName !== "Guest") room.participants[userId].managerName = managerName;
    }

    return { room };
  }

  public leaveRoom(roomId: string, userId: string): Room | undefined {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    if (room.participants[userId]) {
      room.participants[userId].isDisconnected = true;
    }
    return room;
  }

  public kickParticipant(
    roomId: string,
    hostId: string,
    targetUserId: string
  ): { room?: Room; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) return { error: "Room not found" };
    if (room.hostId !== hostId) return { error: "Only host can kick participants" };
    if (targetUserId === hostId) return { error: "Host cannot kick themselves" };

    delete room.participants[targetUserId];
    return { room };
  }

  // Auction Control Methods
  public startAuction(
    roomId: string,
    hostId: string,
    onTimerTick: (room: Room) => void,
    onPlayerResult: (room: Room, result: "SOLD" | "UNSOLD") => void
  ): { room?: Room; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) return { error: "Room not found" };
    if (room.hostId !== hostId) return { error: "Only host can start auction" };
    if (room.status === "COMPLETED" || room.status === "ENDED") {
      return { error: "Auction has already ended" };
    }

    if (room.auctionQueue.length === 0) {
      return { error: "No players in auction queue" };
    }

    this.clearTransitionTimeout(roomId);
    room.status = "PLAYER_INTRO";
    room.currentAuctionIndex = 0;
    room.currentPlayer = room.auctionQueue[0];
    room.currentBid = room.currentPlayer.basePrice;
    room.highestBidderId = null;
    room.highestBidderTeam = null;
    room.highestBidderName = null;
    room.timerRemaining = room.settings.timerDuration;

    // Transition from PLAYER_INTRO to BIDDING after short delay
    this.setTransitionTimeout(roomId, () => {
      const r = this.rooms.get(roomId);
      if (r && r.status === "PLAYER_INTRO") {
        r.status = "BIDDING";
        this.startTimer(roomId, onTimerTick, onPlayerResult);
      }
    }, 2500);

    return { room };
  }

  public pauseAuction(roomId: string, hostId: string): { room?: Room; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) return { error: "Room not found" };
    if (room.hostId !== hostId) return { error: "Only host can pause auction" };
    if (room.status === "COMPLETED" || room.status === "ENDED") {
      return { error: "Auction has already ended" };
    }

    this.stopTimer(roomId);
    this.clearTransitionTimeout(roomId);
    room.status = "PAUSED";
    return { room };
  }

  public resumeAuction(
    roomId: string,
    hostId: string,
    onTimerTick: (room: Room) => void,
    onPlayerResult: (room: Room, result: "SOLD" | "UNSOLD") => void
  ): { room?: Room; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) return { error: "Room not found" };
    if (room.hostId !== hostId) return { error: "Only host can resume auction" };
    if (room.status === "COMPLETED" || room.status === "ENDED") {
      return { error: "Auction has already ended" };
    }

    this.clearTransitionTimeout(roomId);
    room.status = "BIDDING";
    this.startTimer(roomId, onTimerTick, onPlayerResult);
    return { room };
  }

  public endAuction(roomId: string, hostId: string): { room?: Room; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) return { error: "Room not found" };
    if (room.hostId !== hostId) return { error: "Only host can end auction" };

    this.stopTimer(roomId);
    this.clearTransitionTimeout(roomId);

    if (room.currentPlayer && room.status !== "COMPLETED" && room.status !== "ENDED") {
      if (room.highestBidderId) {
        // Resolve active player as SOLD
        const buyer = room.participants[room.highestBidderId];
        if (buyer) {
          buyer.purseRemaining = Math.round((buyer.purseRemaining - room.currentBid) * 100) / 100;
          buyer.purseSpent = Math.round((buyer.purseSpent + room.currentBid) * 100) / 100;

          const squadItem: SquadPlayer = {
            player: room.currentPlayer,
            soldPrice: room.currentBid,
            boughtAt: Date.now(),
          };
          buyer.squad.push(squadItem);

          room.soldPlayers.push({
            player: room.currentPlayer,
            buyerId: room.highestBidderId,
            buyerTeam: buyer.teamName,
            price: room.currentBid,
          });
        }
      } else {
        // Resolve active player as UNSOLD
        room.unsoldPlayers.push(room.currentPlayer);
      }
      room.currentPlayer = null;
    }

    room.status = "COMPLETED";
    this.generateSquadAnalyses(room);
    return { room };
  }

  public updateParticipantName(
    roomId: string,
    userId: string,
    userName?: string,
    teamName?: string,
    managerName?: string
  ): { room?: Room; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) return { error: "Room not found" };

    const participant = room.participants[userId];
    if (!participant) return { error: "Participant not found" };

    if (userName && userName.trim()) participant.userName = userName.trim();
    if (teamName && teamName.trim()) participant.teamName = teamName.trim();
    if (managerName && managerName.trim()) participant.managerName = managerName.trim();

    return { room };
  }

  // Bidding Race-Condition & Validation Engine
  public placeBid(
    roomId: string,
    userId: string,
    requestedAmount?: number
  ): { room?: Room; bid?: Bid; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) return { error: "Room not found" };
    if (room.status !== "BIDDING") return { error: "Bidding is not currently active" };

    const participant = room.participants[userId];
    if (!participant) return { error: "Participant not found in room" };
    if (room.highestBidderId === userId) return { error: "You are already the highest bidder" };

    const player = room.currentPlayer;
    if (!player) return { error: "No active player for bidding" };

    // Squad size check
    if (participant.squad.length >= room.settings.maxSquadSize) {
      return { error: `Squad limit reached (${room.settings.maxSquadSize} max)` };
    }

    // Overseas restriction check
    if (player.isOverseas) {
      const overseasCount = participant.squad.filter((s) => s.player.isOverseas).length;
      if (overseasCount >= room.settings.maxOverseas) {
        return { error: `Overseas player limit reached (${room.settings.maxOverseas} max)` };
      }
    }

    // Calculate required next bid amount
    let nextBidAmount = room.currentBid;
    if (room.highestBidderId !== null) {
      // Increment rules: <5Cr (+0.25Cr), 5-10Cr (+0.50Cr), 10-20Cr (+1.00Cr), 20Cr+ (+2.00Cr)
      let increment = 0.25;
      if (room.currentBid >= 20.0) increment = 2.0;
      else if (room.currentBid >= 10.0) increment = 1.0;
      else if (room.currentBid >= 5.0) increment = 0.5;

      nextBidAmount = requestedAmount && requestedAmount > room.currentBid + increment
        ? requestedAmount
        : Math.round((room.currentBid + increment) * 100) / 100;
    } else {
      nextBidAmount = requestedAmount && requestedAmount >= room.currentBid
        ? requestedAmount
        : room.currentBid;
    }

    // Purse check
    if (nextBidAmount > participant.purseRemaining) {
      return {
        error: `Insufficient purse! Required: ₹${nextBidAmount.toFixed(2)} Cr, Available: ₹${participant.purseRemaining.toFixed(2)} Cr`,
      };
    }

    // Update Room State atomically
    room.currentBid = nextBidAmount;
    room.highestBidderId = userId;
    room.highestBidderTeam = participant.teamName;
    room.highestBidderName = participant.userName;
    room.timerRemaining = room.settings.timerDuration; // Reset timer on bid

    const bid: Bid = {
      id: "bid_" + Math.random().toString(36).substring(2, 9),
      roomId,
      playerId: player.id,
      userId,
      userName: participant.userName,
      teamName: participant.teamName,
      amount: nextBidAmount,
      timestamp: Date.now(),
    };

    room.history.push(bid);
    return { room, bid };
  }

  private startTimer(
    roomId: string,
    onTimerTick: (room: Room) => void,
    onPlayerResult: (room: Room, result: "SOLD" | "UNSOLD") => void
  ) {
    this.stopTimer(roomId);

    const timer = setInterval(() => {
      const room = this.rooms.get(roomId);
      if (!room || room.status !== "BIDDING") {
        this.stopTimer(roomId);
        return;
      }

      room.timerRemaining -= 1;
      onTimerTick(room);

      if (room.timerRemaining <= 0) {
        this.stopTimer(roomId);
        this.resolvePlayer(roomId, onTimerTick, onPlayerResult);
      }
    }, 1000);

    this.timers.set(roomId, timer);
  }

  private stopTimer(roomId: string) {
    const timer = this.timers.get(roomId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(roomId);
    }
  }

  private resolvePlayer(
    roomId: string,
    onTimerTick: (room: Room) => void,
    onPlayerResult: (room: Room, result: "SOLD" | "UNSOLD") => void
  ) {
    const room = this.rooms.get(roomId);
    if (!room || !room.currentPlayer) return;

    const player = room.currentPlayer;

    if (room.highestBidderId) {
      // SOLD!
      room.status = "SOLD";
      const buyer = room.participants[room.highestBidderId];
      if (buyer) {
        buyer.purseRemaining = Math.round((buyer.purseRemaining - room.currentBid) * 100) / 100;
        buyer.purseSpent = Math.round((buyer.purseSpent + room.currentBid) * 100) / 100;

        const squadItem: SquadPlayer = {
          player,
          soldPrice: room.currentBid,
          boughtAt: Date.now(),
        };
        buyer.squad.push(squadItem);

        room.soldPlayers.push({
          player,
          buyerId: room.highestBidderId,
          buyerTeam: buyer.teamName,
          price: room.currentBid,
        });
      }
      onPlayerResult(room, "SOLD");
    } else {
      // UNSOLD!
      room.status = "UNSOLD";
      room.unsoldPlayers.push(player);
      onPlayerResult(room, "UNSOLD");
    }

    // Move to next player in queue after 3 seconds banner display
    this.setTransitionTimeout(roomId, () => {
      const currentRoom = this.rooms.get(roomId);
      if (!currentRoom || currentRoom.status === "COMPLETED" || currentRoom.status === "ENDED" || currentRoom.status === "PAUSED") {
        return;
      }

      currentRoom.currentAuctionIndex += 1;

      if (currentRoom.currentAuctionIndex >= currentRoom.auctionQueue.length) {
        // Auction complete!
        currentRoom.status = "COMPLETED";
        currentRoom.currentPlayer = null;
        this.generateSquadAnalyses(currentRoom);
        onTimerTick(currentRoom);
      } else {
        // Next player!
        currentRoom.currentPlayer = currentRoom.auctionQueue[currentRoom.currentAuctionIndex];
        currentRoom.currentBid = currentRoom.currentPlayer.basePrice;
        currentRoom.highestBidderId = null;
        currentRoom.highestBidderTeam = null;
        currentRoom.highestBidderName = null;
        currentRoom.timerRemaining = currentRoom.settings.timerDuration;
        currentRoom.status = "PLAYER_INTRO";
        onTimerTick(currentRoom);

        this.setTransitionTimeout(roomId, () => {
          const activeRoom = this.rooms.get(roomId);
          if (activeRoom && activeRoom.status === "PLAYER_INTRO") {
            activeRoom.status = "BIDDING";
            this.startTimer(roomId, onTimerTick, onPlayerResult);
          }
        }, 2500);
      }
    }, 3200);
  }
}

export const roomManager = new RoomManager();

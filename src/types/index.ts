export type PlayerRole = "BAT" | "BOWL" | "AR" | "WK";

export type PlayerCategory =
  | "MARQUEE"
  | "BATSMAN"
  | "BOWLER"
  | "ALL_ROUNDER"
  | "WICKETKEEPER";

export type PlayerTier =
  | "MARQUEE"
  | "STAR"
  | "PREMIUM"
  | "STRONG"
  | "EMERGING"
  | "UNCAPPED";

export interface IPLStats {
  matches: number;
  runs: number;
  battingAverage: number;
  strikeRate: number;
  fifties: number;
  hundreds: number;
  wickets: number;
  bowlingAverage: number;
  economy: number;
  fourWickets: number;
  fiveWickets: number;
  catches: number;
  stumpings: number;
}

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  canKeepWickets?: boolean;
  nationality: string;
  isOverseas: boolean;
  basePrice: number; // in Crores
  historicalSoldPrice: number; // in Crores
  historicalStatus: "SOLD" | "UNSOLD" | "RETENT";
  previousTeam: string;
  category: PlayerCategory;
  tier: PlayerTier;
  setNumber: number;
  setName: string;
  battingRating: number;
  bowlingRating: number;
  allRoundRating: number;
  wicketkeepingRating: number;
  fieldingRating: number;
  experienceRating: number;
  impactRating: number;
  consistencyRating: number;
  overallRating: number;
  stats: IPLStats;
  imageUrl?: string;
}

export interface AuctionSettings {
  timerDuration: number; // e.g. 10 seconds
  timerMin: number;
  timerMax: number;
  totalPurse: number; // in Crores, e.g. 100, 120, 150
  maxSquadSize: number; // 15, 18, 25
  maxOverseas: number; // hard fixed to 8
}

export type AuctionStatus =
  | "WAITING"
  | "STARTING"
  | "PLAYER_INTRO"
  | "BIDDING"
  | "SOLD"
  | "UNSOLD"
  | "PAUSED"
  | "COMPLETED"
  | "ENDED";

export interface RoomParticipant {
  userId: string;
  userName: string;
  teamName: string;
  managerName: string;
  isHost: boolean;
  joinedAt: number;
  purseRemaining: number;
  purseSpent: number;
  squad: SquadPlayer[];
  socketId?: string;
  isDisconnected?: boolean;
}

export interface SquadPlayer {
  player: Player;
  soldPrice: number; // in Crores
  boughtAt: number;
}

export interface Bid {
  id: string;
  roomId: string;
  playerId: string;
  userId: string;
  userName: string;
  teamName: string;
  amount: number; // in Crores
  timestamp: number;
}

export interface Room {
  id: string;
  name: string;
  code: string;
  isPublic: boolean;
  token: string;
  hostId: string;
  participants: Record<string, RoomParticipant>;
  settings: AuctionSettings;
  status: AuctionStatus;
  currentAuctionIndex: number;
  auctionQueue: Player[];
  currentPlayer: Player | null;
  currentBid: number; // in Crores
  highestBidderId: string | null;
  highestBidderTeam: string | null;
  highestBidderName: string | null;
  timerRemaining: number;
  history: Bid[];
  soldPlayers: Array<{ player: Player; buyerId: string; buyerTeam: string; price: number }>;
  unsoldPlayers: Player[];
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  teamName?: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface PlayingXISelection {
  userId: string;
  teamName: string;
  selectedPlayerIds: string[];
  captainId: string | null;
  viceCaptainId: string | null;
  wicketkeeperId: string | null;
}

export interface TeamAnalysisScore {
  userId: string;
  teamName: string;
  overallScore: number;
  battingScore: number;
  bowlingScore: number;
  openersScore: number;
  middleOrderScore: number;
  finishingScore: number;
  paceScore: number;
  spinScore: number;
  wicketkeepingScore: number;
  captainScore: number;
  benchScore: number;
  overseasBalanceScore: number;
  strengths: string[];
  weaknesses: string[];
  verdict: string;
  bestXI: Player[];
  userXI: Player[];
}

import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ChatMessage, Room } from "./types/index.ts";
import { auctionSounds } from "./utils/sound.ts";

import { CricketCursor } from "./components/common/CricketCursor.tsx";
import { LandingPage } from "./components/landing/LandingPage.tsx";
import { CreateRoomModal } from "./components/lobby/CreateRoomModal.tsx";
import { JoinRoomModal } from "./components/lobby/JoinRoomModal.tsx";
import { PublicRoomsModal } from "./components/lobby/PublicRoomsModal.tsx";
import { PlayerDatabaseModal } from "./components/players/PlayerDatabaseModal.tsx";
import { LobbyView } from "./components/lobby/LobbyView.tsx";

import { AuctionHeader } from "./components/auction/AuctionHeader.tsx";
import { PlayerAuctionCard } from "./components/auction/PlayerAuctionCard.tsx";
import { BidActionBar } from "./components/auction/BidActionBar.tsx";
import { UpcomingPlayers } from "./components/auction/UpcomingPlayers.tsx";
import { TeamPursesSidebar } from "./components/auction/TeamPursesSidebar.tsx";
import { AuctionChat } from "./components/auction/AuctionChat.tsx";
import { VoiceChat } from "./components/auction/VoiceChat.tsx";

import { SquadView } from "./components/squad/SquadView.tsx";
import { TeamAnalysisModal } from "./components/squad/TeamAnalysisModal.tsx";

export const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [userId] = useState<string>(() => "user_" + Math.random().toString(36).substring(2, 9));
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<"AUCTION" | "SQUAD">("AUCTION");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showPublicModal, setShowPublicModal] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // Sound & WebRTC Voice States
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(false);

  // Socket Connection Setup
  useEffect(() => {
    const s = io("https://ipl-auction-arena-2026.onrender.com", {
  transports: ["websocket", "polling"],
});
    s.on("connect", () => {
      console.log("Connected to IPL Auction Socket Server");
    });

    s.on("room:state", (updatedRoom: Room) => {
      setRoom(updatedRoom);
    });

    s.on("chat:message", (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    s.on("auction:bid_placed", () => {
      auctionSounds.playBid();
    });

    s.on("auction:result", ({ result }: { result: "SOLD" | "UNSOLD" }) => {
      if (result === "SOLD") {
        auctionSounds.playSold();
      } else {
        auctionSounds.playUnsold();
      }
    });

    setSocket(s);

    // Auto-join room from URL query if present
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get("room");
    if (roomParam) {
      s.emit("room:join", {
        roomId: roomParam,
        userId,
        userName: "Guest Manager",
        teamName: "Guest XI",
        managerName: "Guest",
      });
    }

    return () => {
      s.disconnect();
    };
  }, [userId]);

  // Handle Room Actions
  const handleCreateRoom = (data: {
    roomName: string;
    hostUserName: string;
    hostTeamName: string;
    hostManagerName: string;
    isPublic: boolean;
    totalPurse: number;
    maxSquadSize: number;
    timerDuration: number;
  }) => {
    fetch("https://ipl-auction-arena-2026.onrender.com/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hostUserId: userId,
        ...data,
      }),
    })
      .then((res) => res.json())
      .then((createdRoom: Room) => {
        setShowCreateModal(false);
        if (socket) {
          socket.emit("room:join", {
            roomId: createdRoom.id,
            userId,
            userName: data.hostUserName,
            teamName: data.hostTeamName,
            managerName: data.hostManagerName,
          });
        }
      });
  };

  const handleJoinRoom = (data: {
    roomId: string;
    userName: string;
    teamName: string;
    managerName: string;
  }) => {
    setShowJoinModal(false);
    setShowPublicModal(false);
    if (socket) {
      socket.emit("room:join", {
        roomId: data.roomId,
        userId,
        userName: data.userName,
        teamName: data.teamName,
        managerName: data.managerName,
      });
    }
  };

  const handleStartAuction = () => {
    if (socket && room) {
      socket.emit("auction:start", { roomId: room.id, hostId: userId });
    }
  };

  const handlePauseAuction = () => {
    if (socket && room) {
      socket.emit("auction:pause", { roomId: room.id, hostId: userId });
    }
  };

  const handleResumeAuction = () => {
    if (socket && room) {
      socket.emit("auction:resume", { roomId: room.id, hostId: userId });
    }
  };

  const handleEndAuction = () => {
    if (socket && room) {
      socket.emit("auction:end", { roomId: room.id, hostId: userId });
    }
  };

  const handleReturnHome = () => {
    setRoom(null);
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  };

  const handleKickParticipant = (targetUserId: string) => {
    if (socket && room) {
      socket.emit("room:kick", { roomId: room.id, hostId: userId, targetUserId });
    }
  };

  const handlePlaceBid = (amount?: number) => {
    if (socket && room) {
      socket.emit("auction:bid", { roomId: room.id, userId, amount });
    }
  };

  const handleSendChatMessage = (text: string) => {
    if (socket && room) {
      socket.emit("chat:send", { roomId: room.id, userId, text });
    }
  };

  // Toggle Sound Utility
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    auctionSounds.enabled = !soundEnabled;
  };

  // If no room joined, show Landing Page
  if (!room) {
    return (
      <div className="min-h-screen bg-[#050810] font-sans text-slate-100 select-none">
        <CricketCursor />
        <LandingPage
          onCreateRoom={() => setShowCreateModal(true)}
          onJoinRoom={() => setShowJoinModal(true)}
          onBrowsePublic={() => setShowPublicModal(true)}
          onOpenDatabase={() => setShowDatabaseModal(true)}
        />

        <CreateRoomModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateRoom}
        />

        <JoinRoomModal
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          onJoin={handleJoinRoom}
        />

        <PublicRoomsModal
          isOpen={showPublicModal}
          onClose={() => setShowPublicModal(false)}
          onSelectRoom={(roomId) =>
            handleJoinRoom({
              roomId,
              userName: "Manager " + Math.floor(Math.random() * 100),
              teamName: "Franchise XI",
              managerName: "Manager",
            })
          }
        />

        <PlayerDatabaseModal
          isOpen={showDatabaseModal}
          onClose={() => setShowDatabaseModal(false)}
        />
      </div>
    );
  }

  // If room status is WAITING, render Lobby View
  if (room.status === "WAITING") {
    return (
      <div className="min-h-screen bg-[#050810] font-sans text-slate-100 pb-12 select-none">
        <CricketCursor />
        <LobbyView
          room={room}
          currentUserId={userId}
          onStartAuction={handleStartAuction}
          onKickParticipant={handleKickParticipant}
        />

        <PlayerDatabaseModal
          isOpen={showDatabaseModal}
          onClose={() => setShowDatabaseModal(false)}
        />
      </div>
    );
  }

  // Active Auction or Completed View Navigation
  return (
    <div className="min-h-screen bg-[#050810] font-sans text-slate-100 flex flex-col select-none">
      <CricketCursor />

      {/* Top Header */}
      <AuctionHeader
        room={room}
        currentUserId={userId}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        micEnabled={micEnabled}
        onToggleMic={() => setMicEnabled(!micEnabled)}
        onPauseAuction={handlePauseAuction}
        onResumeAuction={handleResumeAuction}
        onEndAuction={handleEndAuction}
      />

      {/* Navigation Sub-Bar */}
      <div className="border-b border-white/10 bg-[#080C16] px-6 py-2 flex items-center justify-between text-xs z-10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("AUCTION")}
            className={`rounded-lg px-4 py-2 font-black uppercase italic tracking-wider transition-all ${
              activeTab === "AUCTION"
                ? "bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                : "text-slate-400 hover:text-white bg-white/5 border border-white/5"
            }`}
          >
            🏏 Live Bidding Arena
          </button>
          <button
            onClick={() => setActiveTab("SQUAD")}
            className={`rounded-lg px-4 py-2 font-black uppercase italic tracking-wider transition-all ${
              activeTab === "SQUAD"
                ? "bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                : "text-slate-400 hover:text-white bg-white/5 border border-white/5"
            }`}
          >
            🛡️ My Squad & XI
          </button>
        </div>

        <button
          onClick={() => setShowDatabaseModal(true)}
          className="text-orange-400 font-bold hover:text-orange-300 transition uppercase tracking-widest text-[11px] flex items-center gap-1.5"
        >
          🔍 Player Database
        </button>
      </div>

      {/* WebRTC Voice Channel Status Bar */}
      <div className="px-6 pt-3">
        <VoiceChat socket={socket} roomId={room.id} userId={userId} enabled={micEnabled} />
      </div>

      {/* Tab Content */}
      {activeTab === "AUCTION" ? (
        <main className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full bg-[radial-gradient(circle_at_center,_#111827_0%,_#050810_100%)]">
          {/* Left: Upcoming Players Queue */}
          <div className="lg:col-span-3">
            <UpcomingPlayers room={room} />
          </div>

          {/* Center: Showcase Card + Bidding Actions */}
          <div className="lg:col-span-6 space-y-6">
            <PlayerAuctionCard player={room.currentPlayer} room={room} onReturnHome={handleReturnHome} />
            <BidActionBar room={room} currentUserId={userId} onPlaceBid={handlePlaceBid} />
          </div>

          {/* Right: Team Purses + Chat */}
          <div className="lg:col-span-3 space-y-6">
            <TeamPursesSidebar room={room} currentUserId={userId} />
            <AuctionChat messages={chatMessages} onSendMessage={handleSendChatMessage} />
          </div>
        </main>
      ) : (
        <SquadView
          room={room}
          currentUserId={userId}
          onOpenAnalysis={() => setShowAnalysisModal(true)}
          onOpenDatabase={() => setShowDatabaseModal(true)}
        />
      )}

      {/* Modals */}
      <PlayerDatabaseModal
        isOpen={showDatabaseModal}
        onClose={() => setShowDatabaseModal(false)}
      />

      <TeamAnalysisModal
        isOpen={showAnalysisModal}
        roomId={room.id}
        onClose={() => setShowAnalysisModal(false)}
      />
    </div>
  );
};

export default App;

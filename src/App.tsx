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
import { TeamsPurchasedPlayers } from "./components/auction/TeamsPurchasedPlayers.tsx";
import { TeamPursesSidebar } from "./components/auction/TeamPursesSidebar.tsx";
import { AuctionChat } from "./components/auction/AuctionChat.tsx";
import { VoiceChat } from "./components/auction/VoiceChat.tsx";

import { SquadView } from "./components/squad/SquadView.tsx";
import { TeamAnalysisModal } from "./components/squad/TeamAnalysisModal.tsx";

export const App: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [userId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      let stored = localStorage.getItem("ipl_auction_user_id");
      if (!stored) {
        stored = "user_" + Math.random().toString(36).substring(2, 9);
        localStorage.setItem("ipl_auction_user_id", stored);
      }
      return stored;
    }
    return "user_" + Math.random().toString(36).substring(2, 9);
  });
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
  const [socketConnected, setSocketConnected] = useState(false);

  const API_BASE =
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_URL ||
    "";

  // Initial load room check
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let targetRoomId = params.get("room");
    if (!targetRoomId && typeof window !== "undefined") {
      targetRoomId = localStorage.getItem("ipl_auction_active_room_id");
    }
    if (targetRoomId) {
      fetch(`${API_BASE}/api/rooms/${targetRoomId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((initialRoom: Room | null) => {
          if (initialRoom) {
            setRoom(initialRoom);
          }
        })
        .catch(() => {});
    }
  }, [API_BASE]);

  // Socket Connection Setup
  useEffect(() => {
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_BACKEND_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");

    const s = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    s.on("connect", () => {
      setSocketConnected(true);
      console.log("Connected to IPL Auction Socket Server");

      const params = new URLSearchParams(window.location.search);
      let targetRoomId = params.get("room");
      if (!targetRoomId && typeof window !== "undefined") {
        targetRoomId = localStorage.getItem("ipl_auction_active_room_id");
      }

      if (targetRoomId) {
        let profile = { userName: "Guest Manager", teamName: "Guest XI", managerName: "Guest" };
        try {
          const saved = localStorage.getItem("ipl_auction_user_profile");
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.userName) profile.userName = parsed.userName;
            if (parsed.teamName) profile.teamName = parsed.teamName;
            if (parsed.managerName) profile.managerName = parsed.managerName;
          }
        } catch (e) {}

        s.emit("room:join", {
          roomId: targetRoomId,
          userId,
          userName: profile.userName,
          teamName: profile.teamName,
          managerName: profile.managerName,
        });

        if (!params.get("room") && typeof window !== "undefined") {
          window.history.replaceState({}, "", `${window.location.pathname}?room=${targetRoomId}`);
        }
      }
    });

    s.on("disconnect", () => {
      setSocketConnected(false);
    });

    s.on("connect_error", (err) => {
      setSocketConnected(false);
      console.warn("Socket.IO connection attempt, fallback sync active:", err.message);
    });

    s.on("room:state", (updatedRoom: Room) => {
      setRoom(updatedRoom);
      if (typeof window !== "undefined" && updatedRoom.id) {
        localStorage.setItem("ipl_auction_active_room_id", updatedRoom.id);
        const p = updatedRoom.participants[userId];
        if (p) {
          localStorage.setItem(
            "ipl_auction_user_profile",
            JSON.stringify({
              userName: p.userName,
              teamName: p.teamName,
              managerName: p.managerName,
            })
          );
        }
      }
    });

    s.on("room:error", ({ message }: { message: string }) => {
      if (message && (message.includes("not found") || message.includes("full"))) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("ipl_auction_active_room_id");
        }
      }
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

    return () => {
      s.disconnect();
    };
  }, [userId]);

  // HTTP Fallback Polling when WebSockets are unavailable (e.g. serverless Vercel runtime)
  useEffect(() => {
    if (!room?.id || socketConnected) return;

    let isMounted = true;
    const interval = setInterval(() => {
      fetch(`${API_BASE}/api/rooms/${room.id}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((latestRoom: Room | null) => {
          if (!isMounted || !latestRoom) return;
          // Play bid sound if bid increased
          if (latestRoom.currentBid > (room?.currentBid || 0)) {
            auctionSounds.playBid();
          }
          // Play sound if status changed to SOLD or UNSOLD
          if (latestRoom.status === "SOLD" && room.status !== "SOLD") {
            auctionSounds.playSold();
          } else if (latestRoom.status === "UNSOLD" && room.status !== "UNSOLD") {
            auctionSounds.playUnsold();
          }
          setRoom(latestRoom);
        })
        .catch(() => {});
    }, room.status === "BIDDING" ? 1000 : 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [room?.id, room?.currentBid, room?.status, socketConnected, API_BASE]);

  // Action Dispatcher (Socket.IO with HTTP Fallback)
  const dispatchAuctionAction = async (action: string, payload: Record<string, any> = {}) => {
    if (socket && socket.connected && room) {
      if (action === "start") socket.emit("auction:start", { roomId: room.id, hostId: userId, ...payload });
      else if (action === "pause") socket.emit("auction:pause", { roomId: room.id, hostId: userId, ...payload });
      else if (action === "resume") socket.emit("auction:resume", { roomId: room.id, hostId: userId, ...payload });
      else if (action === "end") socket.emit("auction:end", { roomId: room.id, hostId: userId, ...payload });
      else if (action === "kick") socket.emit("room:kick", { roomId: room.id, hostId: userId, ...payload });
      else if (action === "bid") socket.emit("auction:bid", { roomId: room.id, userId, ...payload });
      else if (action === "update_name") socket.emit("participant:update_name", { roomId: room.id, userId, ...payload });
      else if (action === "chat") socket.emit("chat:send", { roomId: room.id, userId, ...payload });
      return;
    }

    if (!room?.id) return;
    try {
      const res = await fetch(`${API_BASE}/api/rooms/${room.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          userId,
          ...payload,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.room) {
          setRoom(data.room);
          if (action === "bid" && data.bid) {
            auctionSounds.playBid();
          }
        }
        if (action === "chat" && data.message) {
          setChatMessages((prev) => [...prev, data.message]);
        }
      }
    } catch (e) {
      console.error(`Failed to execute ${action}:`, e);
    }
  };

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
    fetch(`${API_BASE}/api/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hostUserId: userId,
        ...data,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          let err = `Server returned status ${res.status}`;
          try {
            const j = JSON.parse(text);
            if (j.error) err = j.error;
          } catch {}
          throw new Error(err);
        }
        return res.json();
      })
      .then((createdRoom: Room) => {
        setShowCreateModal(false);
        if (typeof window !== "undefined") {
          localStorage.setItem("ipl_auction_active_room_id", createdRoom.id);
          localStorage.setItem(
            "ipl_auction_user_profile",
            JSON.stringify({
              userName: data.hostUserName,
              teamName: data.hostTeamName,
              managerName: data.hostManagerName,
            })
          );
          window.history.replaceState({}, "", `${window.location.pathname}?room=${createdRoom.id}`);
        }
        setRoom(createdRoom);

        if (socket && socket.connected) {
          socket.emit("room:join", {
            roomId: createdRoom.id,
            userId,
            userName: data.hostUserName,
            teamName: data.hostTeamName,
            managerName: data.hostManagerName,
          });
        }
      })
      .catch((err) => {
        console.error("Room creation error:", err);
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
    if (typeof window !== "undefined") {
      localStorage.setItem("ipl_auction_active_room_id", data.roomId);
      localStorage.setItem(
        "ipl_auction_user_profile",
        JSON.stringify({
          userName: data.userName,
          teamName: data.teamName,
          managerName: data.managerName,
        })
      );
      window.history.replaceState({}, "", `${window.location.pathname}?room=${data.roomId}`);
    }

    if (socket && socket.connected) {
      socket.emit("room:join", {
        roomId: data.roomId,
        userId,
        userName: data.userName,
        teamName: data.teamName,
        managerName: data.managerName,
      });
    } else {
      fetch(`${API_BASE}/api/rooms/${data.roomId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          userName: data.userName,
          teamName: data.teamName,
          managerName: data.managerName,
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((joinedRoom: Room | null) => {
          if (joinedRoom) setRoom(joinedRoom);
        })
        .catch(() => {});
    }
  };

  const handleStartAuction = () => {
    dispatchAuctionAction("start");
  };

  const handlePauseAuction = () => {
    dispatchAuctionAction("pause");
  };

  const handleResumeAuction = () => {
    dispatchAuctionAction("resume");
  };

  const handleEndAuction = () => {
    dispatchAuctionAction("end");
  };

  const handleReturnHome = () => {
    setRoom(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("ipl_auction_active_room_id");
      if (window.location.search) {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  };

  const handleKickParticipant = (targetUserId: string) => {
    dispatchAuctionAction("kick", { targetUserId });
  };

  const handleUpdateName = (data: {
    userName?: string;
    teamName?: string;
    managerName?: string;
  }) => {
    if (!room) return;
    const me = room.participants[userId];
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "ipl_auction_user_profile",
        JSON.stringify({
          userName: data.userName || me?.userName || "Guest Manager",
          teamName: data.teamName || me?.teamName || "Guest XI",
          managerName: data.managerName || me?.managerName || "Guest",
        })
      );
    }
    dispatchAuctionAction("update_name", data);
  };

  const handlePlaceBid = (amount?: number) => {
    dispatchAuctionAction("bid", { amount });
  };

  const handleSendChatMessage = (text: string) => {
    dispatchAuctionAction("chat", { text });
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
          onUpdateName={handleUpdateName}
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
      <div className="border-b border-white/10 bg-[#080C16] px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs z-10">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab("AUCTION")}
            className={`rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-black uppercase italic tracking-wider transition-all ${
              activeTab === "AUCTION"
                ? "bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                : "text-slate-400 hover:text-white bg-white/5 border border-white/5"
            }`}
          >
            🏏 Live Bidding Arena
          </button>
          <button
            onClick={() => setActiveTab("SQUAD")}
            className={`rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-black uppercase italic tracking-wider transition-all ${
              activeTab === "SQUAD"
                ? "bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                : "text-slate-400 hover:text-white bg-white/5 border border-white/5"
            }`}
          >
            🛡️ My Squad & XI
          </button>
        </div>
      </div>

      {/* WebRTC Voice Channel Status Bar */}
      <div className="px-3 sm:px-6 pt-2 sm:pt-3">
        <VoiceChat socket={socket} roomId={room.id} userId={userId} enabled={micEnabled} />
      </div>

      {/* Tab Content */}
      {activeTab === "AUCTION" ? (
        <main className="flex-1 p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 max-w-[1600px] mx-auto w-full bg-[radial-gradient(circle_at_center,_#111827_0%,_#050810_100%)]">
          {/* Center (Order 1 on mobile, Order 2 on desktop): Showcase Card + Bidding Actions */}
          <div className="order-1 lg:order-2 lg:col-span-6 space-y-4 sm:space-y-6">
            <PlayerAuctionCard player={room.currentPlayer} room={room} onReturnHome={handleReturnHome} />
            <BidActionBar room={room} currentUserId={userId} onPlaceBid={handlePlaceBid} />
          </div>

          {/* Left (Order 2 on mobile, Order 1 on desktop): Other Teams' and Franchises' Purchased Players */}
          <div className="order-2 lg:order-1 lg:col-span-3">
            <TeamsPurchasedPlayers room={room} currentUserId={userId} />
          </div>

          {/* Right (Order 3 on mobile, Order 3 on desktop): Team Purses + Chat */}
          <div className="order-3 lg:order-3 lg:col-span-3 space-y-4 sm:space-y-6">
            <TeamPursesSidebar room={room} currentUserId={userId} />
            <AuctionChat messages={chatMessages} onSendMessage={handleSendChatMessage} />
          </div>
        </main>
      ) : (
        <SquadView
          room={room}
          currentUserId={userId}
          onOpenAnalysis={() => setShowAnalysisModal(true)}
        />
      )}

      {/* Modals */}
      <TeamAnalysisModal
        isOpen={showAnalysisModal}
        roomId={room.id}
        onClose={() => setShowAnalysisModal(false)}
      />
    </div>
  );
};

export default App;

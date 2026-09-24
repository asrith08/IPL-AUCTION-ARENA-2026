import { Router, Request, Response } from "express";
import { MASTER_PLAYER_DATASET } from "../../data/players.ts";
import { roomManager } from "../services/roomService.ts";
import { calculateBestXIAndAnalysis } from "../services/bestXIService.ts";
import {
  broadcastRoomState,
  broadcastBid,
  broadcastChatMessage,
  activeSocketIO,
} from "../socket/handler.ts";
import { ChatMessage, Room } from "../../types/index.ts";

const router = Router();

// Health check
router.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Players API with filtering and search
router.get("/players", (req: Request, res: Response) => {
  const { search, category, role, isOverseas, setNumber } = req.query;

  let result = [...MASTER_PLAYER_DATASET];

  if (search && typeof search === "string") {
    const query = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.previousTeam.toLowerCase().includes(query) ||
        p.nationality.toLowerCase().includes(query)
    );
  }

  if (category && typeof category === "string") {
    result = result.filter((p) => p.category === category);
  }

  if (role && typeof role === "string") {
    result = result.filter((p) => p.role === role);
  }

  if (isOverseas !== undefined) {
    const isOs = isOverseas === "true";
    result = result.filter((p) => p.isOverseas === isOs);
  }

  if (setNumber) {
    result = result.filter((p) => p.setNumber === Number(setNumber));
  }

  res.json({ total: result.length, players: result });
});

router.get("/players/:id", (req: Request, res: Response) => {
  const player = MASTER_PLAYER_DATASET.find((p) => p.id === req.params.id);
  if (!player) {
    res.status(404).json({ error: "Player not found" });
    return;
  }
  res.json(player);
});

// Public Rooms API
router.get("/rooms", (_req: Request, res: Response) => {
  const publicRooms = roomManager.getAllPublicRooms();
  res.json(publicRooms);
});

router.post("/rooms", (req: Request, res: Response) => {
  const {
    hostUserId,
    hostUserName,
    hostTeamName,
    hostManagerName,
    roomName,
    isPublic,
    settings,
    totalPurse,
    maxSquadSize,
    timerDuration,
  } = req.body;

  if (!hostUserId || !hostUserName) {
    res.status(400).json({ error: "hostUserId and hostUserName are required" });
    return;
  }

  const customSettings = settings || {
    totalPurse: totalPurse ? Number(totalPurse) : 100,
    maxSquadSize: maxSquadSize ? Number(maxSquadSize) : 18,
    timerDuration: timerDuration ? Number(timerDuration) : 10,
    timerMin: 5,
    timerMax: 15,
    maxOverseas: 8,
  };

  try {
    const room = roomManager.createRoom(
      hostUserId,
      hostUserName,
      hostTeamName,
      hostManagerName,
      roomName,
      isPublic !== false,
      customSettings
    );

    res.status(201).json(room);
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Failed to create room" });
  }
});

router.get("/rooms/:roomId", (req: Request, res: Response) => {
  const room = roomManager.getRoom(req.params.roomId);
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }
  res.json(room);
});

router.post("/rooms/:roomId/join", (req: Request, res: Response) => {
  const { userId, userName, teamName, managerName } = req.body;
  if (!userId || !userName) {
    res.status(400).json({ error: "userId and userName are required" });
    return;
  }

  const { room, error } = roomManager.joinRoom(
    req.params.roomId,
    userId,
    userName,
    teamName,
    managerName
  );

  if (error || !room) {
    res.status(400).json({ error: error || "Failed to join room" });
    return;
  }

  broadcastRoomState(room.id, room);
  res.json(room);
});

// Auction Actions REST API (HTTP Fallback for Serverless / Non-WebSocket environments)
router.post("/rooms/:roomId/action", (req: Request, res: Response) => {
  const { roomId } = req.params;
  const { action, userId, amount, targetUserId, userName, teamName, managerName, text } = req.body;

  const room = roomManager.getRoom(roomId);
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  const onTimerTick = (updatedRoom: Room) => {
    broadcastRoomState(roomId, updatedRoom);
  };

  const onPlayerResult = (updatedRoom: Room, result: "SOLD" | "UNSOLD") => {
    broadcastRoomState(roomId, updatedRoom);
    if (activeSocketIO) {
      activeSocketIO.to(roomId).emit("auction:result", {
        result,
        player: updatedRoom.currentPlayer,
        highestBidderTeam: updatedRoom.highestBidderTeam,
        amount: updatedRoom.currentBid,
      });
    }
  };

  switch (action) {
    case "start": {
      const result = roomManager.startAuction(roomId, userId, onTimerTick, onPlayerResult);
      if (result.error || !result.room) {
        res.status(400).json({ error: result.error || "Failed to start auction" });
        return;
      }
      broadcastRoomState(roomId, result.room);
      res.json({ success: true, room: result.room });
      return;
    }
    case "pause": {
      const result = roomManager.pauseAuction(roomId, userId);
      if (result.error || !result.room) {
        res.status(400).json({ error: result.error || "Failed to pause auction" });
        return;
      }
      broadcastRoomState(roomId, result.room);
      res.json({ success: true, room: result.room });
      return;
    }
    case "resume": {
      const result = roomManager.resumeAuction(roomId, userId, onTimerTick, onPlayerResult);
      if (result.error || !result.room) {
        res.status(400).json({ error: result.error || "Failed to resume auction" });
        return;
      }
      broadcastRoomState(roomId, result.room);
      res.json({ success: true, room: result.room });
      return;
    }
    case "end": {
      const result = roomManager.endAuction(roomId, userId);
      if (result.error || !result.room) {
        res.status(400).json({ error: result.error || "Failed to end auction" });
        return;
      }
      broadcastRoomState(roomId, result.room);
      res.json({ success: true, room: result.room });
      return;
    }
    case "bid": {
      const result = roomManager.placeBid(roomId, userId, amount);
      if (result.error || !result.room || !result.bid) {
        res.status(400).json({ error: result.error || "Failed to place bid" });
        return;
      }
      broadcastRoomState(roomId, result.room);
      broadcastBid(roomId, result.bid);
      res.json({ success: true, room: result.room, bid: result.bid });
      return;
    }
    case "kick": {
      const result = roomManager.kickParticipant(roomId, userId, targetUserId);
      if (result.error || !result.room) {
        res.status(400).json({ error: result.error || "Failed to kick participant" });
        return;
      }
      broadcastRoomState(roomId, result.room);
      res.json({ success: true, room: result.room });
      return;
    }
    case "update_name": {
      const result = roomManager.updateParticipantName(roomId, userId, userName, teamName, managerName);
      if (result.error || !result.room) {
        res.status(400).json({ error: result.error || "Failed to update participant" });
        return;
      }
      broadcastRoomState(roomId, result.room);
      res.json({ success: true, room: result.room });
      return;
    }
    case "chat": {
      const participant = room.participants[userId];
      const chatMsg: ChatMessage = {
        id: "chat_" + Math.random().toString(36).substring(2, 9),
        roomId,
        userId,
        userName: participant?.userName || "Participant",
        teamName: participant?.teamName,
        text: String(text || "").trim(),
        timestamp: Date.now(),
      };
      broadcastChatMessage(roomId, chatMsg);
      res.json({ success: true, message: chatMsg });
      return;
    }
    default:
      res.status(400).json({ error: `Unknown action: ${action}` });
      return;
  }
});

// Analysis & Rankings API
router.get("/analysis/:roomId", (req: Request, res: Response) => {
  const room = roomManager.getRoom(req.params.roomId);
  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  if (room.squadAnalyses && room.squadAnalyses.length > 0) {
    res.json({ roomId: room.id, roomName: room.name, rankings: room.squadAnalyses });
    return;
  }

  const analyses = Object.values(room.participants).map((p) =>
    calculateBestXIAndAnalysis(p.userId, p.teamName, p.squad)
  );

  // Rank teams by overall score descending
  analyses.sort((a, b) => b.overallScore - a.overallScore);
  room.squadAnalyses = analyses;

  res.json({ roomId: room.id, roomName: room.name, rankings: analyses });
});

export default router;

import { Router, Request, Response } from "express";
import { MASTER_PLAYER_DATASET } from "../../data/players.ts";
import { roomManager } from "../services/roomService.ts";
import { calculateBestXIAndAnalysis } from "../services/bestXIService.ts";

const router = Router();

// Health check
router.get("/health", (req: Request, res: Response) => {
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
router.get("/rooms", (req: Request, res: Response) => {
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
  } = req.body;

  if (!hostUserId || !hostUserName) {
    res.status(400).json({ error: "hostUserId and hostUserName are required" });
    return;
  }

  const room = roomManager.createRoom(
    hostUserId,
    hostUserName,
    hostTeamName,
    hostManagerName,
    roomName,
    isPublic !== false,
    settings
  );

  res.json(room);
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
  const { room, error } = roomManager.joinRoom(
    req.params.roomId,
    userId,
    userName,
    teamName,
    managerName
  );

  if (error) {
    res.status(400).json({ error });
    return;
  }
  res.json(room);
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

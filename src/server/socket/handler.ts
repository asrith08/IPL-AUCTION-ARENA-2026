import { Server, Socket } from "socket.io";
import { roomManager } from "../services/roomService.ts";
import { ChatMessage, Room } from "../../types/index.ts";

export function setupSocketHandler(io: Server) {
  io.on("connection", (socket: Socket) => {
    let currentRoomId: string | null = null;
    let currentUserId: string | null = null;

    // Room Join Event
    socket.on(
      "room:join",
      ({
        roomId,
        userId,
        userName,
        teamName,
        managerName,
      }: {
        roomId: string;
        userId: string;
        userName: string;
        teamName: string;
        managerName: string;
      }) => {
        const { room, error } = roomManager.joinRoom(
          roomId,
          userId,
          userName,
          teamName,
          managerName
        );

        if (error || !room) {
          socket.emit("room:error", { message: error || "Failed to join room" });
          return;
        }

        currentRoomId = roomId;
        currentUserId = userId;

        socket.join(roomId);

        // Notify room
        io.to(roomId).emit("room:state", room);

        const sysMsg: ChatMessage = {
          id: "sys_" + Math.random().toString(36).substring(2, 9),
          roomId,
          userId: "system",
          userName: "System",
          text: `🏏 ${userName} (${teamName || "New Team"}) joined the auction room!`,
          timestamp: Date.now(),
          isSystem: true,
        };

        io.to(roomId).emit("chat:message", sysMsg);
      }
    );

    // Host Actions
    socket.on("auction:start", ({ roomId, hostId }: { roomId: string; hostId: string }) => {
      const onTimerTick = (room: Room) => {
        io.to(roomId).emit("room:state", room);
      };

      const onPlayerResult = (room: Room, result: "SOLD" | "UNSOLD") => {
        io.to(roomId).emit("room:state", room);
        io.to(roomId).emit("auction:result", {
          result,
          player: room.currentPlayer,
          highestBidderTeam: room.highestBidderTeam,
          amount: room.currentBid,
        });

        const playerMsg = result === "SOLD"
          ? `🎉 SOLD! ${room.currentPlayer?.name} sold to ${room.highestBidderTeam} for ₹${room.currentBid.toFixed(2)} Cr!`
          : `⚠️ UNSOLD! ${room.currentPlayer?.name} passed with no bids.`;

        const sysMsg: ChatMessage = {
          id: "sys_" + Math.random().toString(36).substring(2, 9),
          roomId,
          userId: "system",
          userName: "System",
          text: playerMsg,
          timestamp: Date.now(),
          isSystem: true,
        };
        io.to(roomId).emit("chat:message", sysMsg);
      };

      const { room, error } = roomManager.startAuction(
        roomId,
        hostId,
        onTimerTick,
        onPlayerResult
      );

      if (error || !room) {
        socket.emit("room:error", { message: error });
        return;
      }

      io.to(roomId).emit("room:state", room);
    });

    socket.on("auction:pause", ({ roomId, hostId }: { roomId: string; hostId: string }) => {
      const { room, error } = roomManager.pauseAuction(roomId, hostId);
      if (error || !room) {
        socket.emit("room:error", { message: error });
        return;
      }
      io.to(roomId).emit("room:state", room);
    });

    socket.on("auction:resume", ({ roomId, hostId }: { roomId: string; hostId: string }) => {
      const onTimerTick = (room: Room) => {
        io.to(roomId).emit("room:state", room);
      };

      const onPlayerResult = (room: Room, result: "SOLD" | "UNSOLD") => {
        io.to(roomId).emit("room:state", room);
      };

      const { room, error } = roomManager.resumeAuction(
        roomId,
        hostId,
        onTimerTick,
        onPlayerResult
      );

      if (error || !room) {
        socket.emit("room:error", { message: error });
        return;
      }
      io.to(roomId).emit("room:state", room);
    });

    socket.on("auction:end", ({ roomId, hostId }: { roomId: string; hostId: string }) => {
      const { room, error } = roomManager.endAuction(roomId, hostId);
      if (error || !room) {
        socket.emit("room:error", { message: error });
        return;
      }
      io.to(roomId).emit("room:state", room);
    });

    socket.on(
      "room:kick",
      ({
        roomId,
        hostId,
        targetUserId,
      }: {
        roomId: string;
        hostId: string;
        targetUserId: string;
      }) => {
        const { room, error } = roomManager.kickParticipant(roomId, hostId, targetUserId);
        if (error || !room) {
          socket.emit("room:error", { message: error });
          return;
        }
        io.to(roomId).emit("room:state", room);
        io.to(roomId).emit("room:kicked_user", { userId: targetUserId });
      }
    );

    // Participant Update Name Event
    socket.on(
      "participant:update_name",
      ({
        roomId,
        userId,
        userName,
        teamName,
        managerName,
      }: {
        roomId: string;
        userId: string;
        userName?: string;
        teamName?: string;
        managerName?: string;
      }) => {
        const { room, error } = roomManager.updateParticipantName(
          roomId,
          userId,
          userName,
          teamName,
          managerName
        );
        if (error || !room) {
          socket.emit("room:error", { message: error || "Failed to update name" });
          return;
        }
        io.to(roomId).emit("room:state", room);
      }
    );

    // Bidding Event
    socket.on(
      "auction:bid",
      ({
        roomId,
        userId,
        amount,
      }: {
        roomId: string;
        userId: string;
        amount?: number;
      }) => {
        const { room, bid, error } = roomManager.placeBid(roomId, userId, amount);

        if (error || !room || !bid) {
          socket.emit("bid:error", { message: error || "Bid failed" });
          return;
        }

        io.to(roomId).emit("room:state", room);
        io.to(roomId).emit("auction:bid_placed", bid);
      }
    );

    // Chat Event
    socket.on("chat:send", ({ roomId, userId, text }: { roomId: string; userId: string; text: string }) => {
      const room = roomManager.getRoom(roomId);
      if (!room || !text.trim()) return;

      const participant = room.participants[userId];
      const msg: ChatMessage = {
        id: "msg_" + Math.random().toString(36).substring(2, 9),
        roomId,
        userId,
        userName: participant?.userName || "Guest",
        teamName: participant?.teamName,
        text: text.trim(),
        timestamp: Date.now(),
      };

      io.to(roomId).emit("chat:message", msg);
    });

    // WebRTC Voice Chat Signaling
    socket.on("voice:join", ({ roomId, userId }: { roomId: string; userId: string }) => {
      socket.to(roomId).emit("voice:user_joined", { socketId: socket.id, userId });
    });

    socket.on("voice:leave", ({ roomId, userId }: { roomId: string; userId: string }) => {
      socket.to(roomId).emit("voice:user_left", { socketId: socket.id, userId });
    });

    socket.on("voice:offer", ({ targetSocketId, offer }: { targetSocketId: string; offer: unknown }) => {
      io.to(targetSocketId).emit("voice:offer", { senderSocketId: socket.id, offer });
    });

    socket.on("voice:answer", ({ targetSocketId, answer }: { targetSocketId: string; answer: unknown }) => {
      io.to(targetSocketId).emit("voice:answer", { senderSocketId: socket.id, answer });
    });

    socket.on("voice:ice-candidate", ({ targetSocketId, candidate }: { targetSocketId: string; candidate: unknown }) => {
      io.to(targetSocketId).emit("voice:ice-candidate", { senderSocketId: socket.id, candidate });
    });

    // Disconnect
    socket.on("disconnect", () => {
      if (currentRoomId && currentUserId) {
        const room = roomManager.leaveRoom(currentRoomId, currentUserId);
        if (room) {
          io.to(currentRoomId).emit("room:state", room);
        }
      }
    });
  });
}

import React, { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { Mic, MicOff, Volume2 } from "lucide-react";

interface Props {
  socket: Socket | null;
  roomId: string;
  userId: string;
  enabled: boolean;
}

export const VoiceChat: React.FC<Props> = ({ socket, roomId, userId, enabled }) => {
  const [activeVoiceUsers, setActiveVoiceUsers] = useState<string[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  const iceServers = [{ urls: "stun:stun.l.google.com:19302" }];

  useEffect(() => {
    if (!socket || !enabled) {
      cleanupVoice();
      return;
    }

    // Acquire audio stream
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        localStreamRef.current = stream;
        socket.emit("voice:join", { roomId, userId });
      })
      .catch((err) => {
        console.warn("Voice microphone access failed/denied:", err);
      });

    // WebRTC Socket Listeners
    socket.on("voice:user_joined", async ({ socketId, userId: remoteUserId }) => {
      setActiveVoiceUsers((prev) => Array.from(new Set([...prev, remoteUserId])));
      await createOffer(socketId);
    });

    socket.on("voice:user_left", ({ socketId, userId: remoteUserId }) => {
      setActiveVoiceUsers((prev) => prev.filter((id) => id !== remoteUserId));
      closePeerConnection(socketId);
    });

    socket.on("voice:offer", async ({ senderSocketId, offer }) => {
      await handleOffer(senderSocketId, offer);
    });

    socket.on("voice:answer", async ({ senderSocketId, answer }) => {
      await handleAnswer(senderSocketId, answer);
    });

    socket.on("voice:ice-candidate", async ({ senderSocketId, candidate }) => {
      await handleCandidate(senderSocketId, candidate);
    });

    return () => {
      cleanupVoice();
      socket.off("voice:user_joined");
      socket.off("voice:user_left");
      socket.off("voice:offer");
      socket.off("voice:answer");
      socket.off("voice:ice-candidate");
    };
  }, [socket, enabled, roomId, userId]);

  const cleanupVoice = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();
    setActiveVoiceUsers([]);
  };

  const createPeerConnection = (targetSocketId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection({ iceServers });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.ontrack = (event) => {
      const remoteAudio = new Audio();
      remoteAudio.srcObject = event.streams[0];
      remoteAudio.play().catch(() => {});
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("voice:ice-candidate", {
          targetSocketId,
          candidate: event.candidate,
        });
      }
    };

    peerConnectionsRef.current.set(targetSocketId, pc);
    return pc;
  };

  const createOffer = async (targetSocketId: string) => {
    const pc = createPeerConnection(targetSocketId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    if (socket) {
      socket.emit("voice:offer", { targetSocketId, offer });
    }
  };

  const handleOffer = async (senderSocketId: string, offer: RTCSessionDescriptionInit) => {
    const pc = createPeerConnection(senderSocketId);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    if (socket) {
      socket.emit("voice:answer", { targetSocketId: senderSocketId, answer });
    }
  };

  const handleAnswer = async (senderSocketId: string, answer: RTCSessionDescriptionInit) => {
    const pc = peerConnectionsRef.current.get(senderSocketId);
    if (pc) {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    }
  };

  const handleCandidate = async (senderSocketId: string, candidate: RTCIceCandidateInit) => {
    const pc = peerConnectionsRef.current.get(senderSocketId);
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const closePeerConnection = (targetSocketId: string) => {
    const pc = peerConnectionsRef.current.get(targetSocketId);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(targetSocketId);
    }
  };

  if (!enabled) return null;

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2.5 text-xs text-emerald-300 flex items-center justify-between">
      <div className="flex items-center gap-2 font-bold">
        <Volume2 className="h-4 w-4 animate-pulse text-emerald-400" />
        <span>Voice Channel Active ({activeVoiceUsers.length + 1} Connected)</span>
      </div>
    </div>
  );
};

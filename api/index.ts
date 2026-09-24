import http from "node:http";
import { Server as SocketServer } from "socket.io";
import { createExpressApp } from "../src/server/app.ts";
import { setupSocketHandler } from "../src/server/socket/handler.ts";

const app = createExpressApp();

let server: http.Server | null = null;
let io: SocketServer | null = null;

function initSocketIO() {
  if (!server) {
    server = http.createServer(app);
    io = new SocketServer(server, {
      path: "/socket.io",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
    });
    setupSocketHandler(io);
  }
  return { server, io };
}

export default function handler(req: any, res: any) {
  const { io } = initSocketIO();

  // If request is directed to Socket.IO engine
  if (req.url && req.url.includes("/socket.io")) {
    if (io && (io.engine as any)) {
      (io.engine as any).handleRequest(req, res);
      return;
    }
  }

  // Delegate all HTTP /api requests directly to the Express application
  return app(req, res);
}

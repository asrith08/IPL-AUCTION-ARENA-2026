import express from "express";
import http from "http";
import path from "path";
import { Server as SocketServer } from "socket.io";
import { createServer as createViteServer } from "vite";
import { Request, Response } from "express";
import { createExpressApp } from "./src/server/app.ts";
import { setupSocketHandler } from "./src/server/socket/handler.ts";

async function startServer() {
  const app = createExpressApp();
  const server = http.createServer(app);

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Socket.IO Server
  const io = new SocketServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  setupSocketHandler(io);

  // Development vs Production Frontend Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🏏 IPL Auction Arena Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

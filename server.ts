import express from "express";
import http from "http";
import path from "path";
import { Server as SocketServer } from "socket.io";
import { createServer as createViteServer } from "vite";
import apiRoutes from "./src/server/routes/api.ts";
import { setupSocketHandler } from "./src/server/socket/handler.ts";

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  const PORT = Number(process.env.PORT) || 3000;

  // Middleware
  app.use(express.json());

  // Socket.IO Server
  const io = new SocketServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  setupSocketHandler(io);

  // Express API Routes
  app.use("/api", apiRoutes);

  // Development vs Production Frontend Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Health check endpoint for Render backend
    app.get("/", (req, res) => {
      res.send("🏏 IPL Auction Arena Backend is Live!");
    });
  }
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🏏 IPL Auction Arena Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

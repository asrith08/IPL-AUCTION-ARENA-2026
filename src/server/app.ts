import express from "express";
import cors from "cors";
import type { Express } from "express";
import apiRoutes from "./routes/api.ts";

export function createExpressApp(): Express {
  const app = express();

  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(express.json());

  app.use("/api", apiRoutes);

  return app;
}

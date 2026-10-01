import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import { connectDB } from "./src/config/db.js";
import { authLimiter } from "./src/middleware/rateLimiters.js";
import { checkOllamaHealth } from "./src/services/llmService.js";
import authRoutes from "./src/routes/authRoutes.js";
import documentRoutes from "./src/routes/documentRoutes.js";
import chatRoutes from "./src/routes/chatRoutes.js";

dotenv.config();

const app = express();

// --- Core middleware ---
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// --- Rate Limiting for Auth ---
app.use("/api/auth", authLimiter);

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api", chatRoutes);

// --- Health Check ---
app.get("/api/health", async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  const ollamaHealth = await checkOllamaHealth();

  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: mongoStatus,
        databaseName: mongoose.connection.name,
      },
      llm: ollamaHealth,
    },
  });
});

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// --- Central error handler ---
app.use((err, req, res, next) => {
  console.error("Central Error Handler:", err.stack || err.message);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

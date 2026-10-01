import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { chatLimiter } from "../middleware/rateLimiters.js";
import { handleChat } from "../controllers/chatController.js";

const router = express.Router();

router.post("/chat", protect, chatLimiter, handleChat);

export default router;

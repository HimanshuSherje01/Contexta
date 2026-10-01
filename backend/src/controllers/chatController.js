import mongoose from "mongoose";
import { answerQuestion } from "../services/ragService.js";

/**
 * Handle user questions scoped to a document
 * POST /api/chat
 */
export async function handleChat(req, res) {
  try {
    const { documentId, question } = req.body;

    if (!documentId) {
      return res.status(400).json({ message: "documentId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(documentId)) {
      return res.status(400).json({ message: "Invalid document ID format" });
    }

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return res.status(400).json({ message: "question is required" });
    }

    const trimmedQuestion = question.trim();

    if (trimmedQuestion.length < 2) {
      return res.status(400).json({ message: "Question is too short" });
    }

    if (trimmedQuestion.length > 1000) {
      return res.status(400).json({ message: "Question exceeds maximum length of 1000 characters" });
    }

    const result = await answerQuestion({
      question: trimmedQuestion,
      documentId,
      userId: req.user._id,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in handleChat:", error.message);
    const status = error.status || 500;
    return res.status(status).json({
      message: error.message || "An error occurred while answering your question",
    });
  }
}

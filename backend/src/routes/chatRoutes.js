import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * This is intentionally a stub.
 * You said you'll build the RAG pipeline yourself, so wire it up here:
 *
 *   1. Take req.body.question
 *   2. Generate an embedding for the question
 *   3. Run MongoDB Atlas Vector Search against your chunks collection
 *   4. Build a prompt with the top-K chunks + the question
 *   5. Call your LLM
 *   6. Return { answer, sources } to the frontend
 *
 * The route is already wrapped in `protect`, so req.user is guaranteed
 * to exist here — only logged-in users can reach this endpoint.
 */
router.post("/chat", protect, async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ message: "question is required" });
  }

  // TODO (you): replace this with the real RAG pipeline
  return res.status(200).json({
    answer: `(stub) You asked: "${question}". Wire up your RAG pipeline in src/routes/chatRoutes.js`,
    sources: [],
  });
});

export default router;

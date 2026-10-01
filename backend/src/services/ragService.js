import Document from "../models/Document.js";
import { generateEmbedding } from "../rag/semanticEmbedder.js";
import { searchMongoDB } from "../rag/mongoVectorSearch.js";
import { buildContext } from "../rag/contextBuilder.js";
import { buildRAGPrompt } from "../rag/promptBuilder.js";
import { generateAnswer } from "./llmService.js";

/**
 * Executes the scoped RAG pipeline for a given document and question.
 *
 * @param {Object} params
 * @param {string} params.question - User question
 * @param {string} params.documentId - Target document ID
 * @param {string} params.userId - Authenticated user ID
 * @param {number} [params.topK=3] - Number of chunks to retrieve
 * @returns {Promise<{ answer: string, sources: Array<{ page: number, score: number, text: string }> }>}
 */
export async function answerQuestion({ question, documentId, userId, topK = 3 }) {
  // 1. Validate document existence and ownership
  const document = await Document.findOne({ _id: documentId, userId });

  if (!document) {
    const error = new Error("Document not found or access denied");
    error.status = 404;
    throw error;
  }

  if (document.status === "processing") {
    const error = new Error("Document is still being processed. Please wait until status is ready.");
    error.status = 400;
    throw error;
  }

  if (document.status === "failed") {
    const error = new Error(
      `Document processing failed: ${document.errorMessage || "Unknown error"}. Please re-upload.`
    );
    error.status = 400;
    throw error;
  }

  // 2. Generate embedding for user question
  const queryEmbedding = await generateEmbedding(question);

  // 3. Search MongoDB with strict documentId and userId scoping
  const results = await searchMongoDB(queryEmbedding, documentId, userId, topK);

  if (!results || results.length === 0) {
    return {
      answer: "No relevant content was found in this document for your question.",
      sources: [],
    };
  }

  // 4. Build context
  const context = buildContext(results);

  // 5. Build prompt with boundaries and anti-injection instructions
  const prompt = buildRAGPrompt(question, context);

  // 6. Query Ollama model
  const answer = await generateAnswer(prompt);

  // 7. Format sources safely
  const sources = results.map((result) => ({
    page: result.page,
    score: typeof result.score === "number" ? Number(result.score.toFixed(3)) : null,
    text: result.text,
  }));

  return {
    answer,
    sources,
  };
}

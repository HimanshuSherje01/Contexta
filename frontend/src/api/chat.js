import api from "./axios.js";

/**
 * Send a question to the RAG pipeline scoped to a specific document
 * @param {Object} params
 * @param {string} params.question
 * @param {string} params.documentId
 */
export async function sendChatMessage({ question, documentId }) {
  const response = await api.post("/chat", {
    question,
    documentId,
  });
  return response.data;
}

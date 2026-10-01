import api from "./axios.js";

/**
 * Upload a PDF document
 * @param {File} file
 * @param {Function} [onUploadProgress]
 */
export async function uploadDocument(file, onUploadProgress) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/documents/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });

  return response.data;
}

/**
 * Get all documents for the authenticated user
 */
export async function getDocuments() {
  const response = await api.get("/documents");
  return response.data;
}

/**
 * Get document details and processing status
 * @param {string} id
 */
export async function getDocumentById(id) {
  const response = await api.get(`/documents/${id}`);
  return response.data;
}

/**
 * Delete a document and its associated chunks
 * @param {string} id
 */
export async function deleteDocument(id) {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
}

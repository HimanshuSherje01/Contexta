import mongoose from "mongoose";
import Document from "../models/Document.js";
import RagChunk from "../models/RagChunk.js";
import { processDocument } from "../services/documentProcessor.js";

/**
 * Handle PDF upload
 * POST /api/documents/upload
 */
export async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please provide a PDF file to upload" });
    }

    const doc = await Document.create({
      userId: req.user._id,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      status: "processing",
    });

    // Start asynchronous processing (non-blocking for the HTTP response)
    processDocument(req.file.buffer, doc._id, req.user._id).catch((err) => {
      console.error(`Unhandled error processing document ${doc._id}:`, err);
    });

    return res.status(201).json({
      documentId: doc._id,
      originalName: doc.originalName,
      fileSize: doc.fileSize,
      status: doc.status,
    });
  } catch (error) {
    console.error("Error in uploadDocument:", error);
    return res.status(500).json({ message: "Failed to initiate document upload" });
  }
}

/**
 * Get all documents for the authenticated user
 * GET /api/documents
 */
export async function getDocuments(req, res) {
  try {
    const documents = await Document.find({ userId: req.user._id })
      .select("_id originalName fileSize pageCount chunkCount status createdAt updatedAt")
      .sort({ createdAt: -1 });

    return res.status(200).json(documents);
  } catch (error) {
    console.error("Error in getDocuments:", error);
    return res.status(500).json({ message: "Failed to retrieve documents" });
  }
}

/**
 * Get single document status and metadata
 * GET /api/documents/:id
 */
export async function getDocumentById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid document ID format" });
    }

    const document = await Document.findOne({ _id: id, userId: req.user._id });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    return res.status(200).json(document);
  } catch (error) {
    console.error("Error in getDocumentById:", error);
    return res.status(500).json({ message: "Failed to retrieve document" });
  }
}

/**
 * Delete document and its associated vector chunks
 * DELETE /api/documents/:id
 */
export async function deleteDocument(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid document ID format" });
    }

    const document = await Document.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Safely delete associated chunks
    const deleteResult = await RagChunk.deleteMany({
      documentId: id,
      userId: req.user._id,
    });

    console.log(
      `Deleted document ${id} and ${deleteResult.deletedCount} associated RAG chunks.`
    );

    return res.status(200).json({
      message: "Document and associated chunks deleted successfully",
      deletedChunks: deleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Error in deleteDocument:", error);
    return res.status(500).json({ message: "Failed to delete document" });
  }
}

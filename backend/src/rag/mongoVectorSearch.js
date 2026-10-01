import mongoose from "mongoose";
import RagChunk from "../models/RagChunk.js";

export const searchMongoDB = async (
  queryEmbedding,
  documentId,
  userId,
  topK = 3
) => {
  if (!documentId || !userId) {
    throw new Error("documentId and userId are required for scoped vector search");
  }

  const docObjectId = mongoose.Types.ObjectId.isValid(documentId)
    ? new mongoose.Types.ObjectId(documentId)
    : documentId;

  const userObjectId = mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : userId;

  const numCandidates = Math.max(30, topK * 10);

  try {
    const results = await RagChunk.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          filter: {
            documentId: docObjectId,
            userId: userObjectId,
          },
          numCandidates: numCandidates,
          limit: topK,
        },
      },
      {
        $project: {
          _id: 0,
          text: 1,
          page: 1,
          score: {
            $meta: "vectorSearchScore",
          },
        },
      },
    ]);

    return results;
  } catch (error) {
    if (error.message && error.message.includes("Filter on path")) {
      console.error(
        "CRITICAL: MongoDB Atlas Vector Search index needs filter fields defined. See README / Atlas configuration."
      );
      throw new Error(
        "Atlas Vector Search filter error: please ensure 'documentId' and 'userId' are added as filter fields in your Atlas vector_index definition."
      );
    }
    throw error;
  }
};
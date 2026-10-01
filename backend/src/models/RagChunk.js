import mongoose from "mongoose";

const ragChunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    page: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast deletion and scoped queries
ragChunkSchema.index({ documentId: 1, userId: 1 });

const RagChunk = mongoose.model("RagChunk", ragChunkSchema);

export default RagChunk;

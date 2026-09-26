import mongoose from "mongoose";

const ragChunkSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: true
        },

        page: {
            type: Number,
            required: true
        },

        embedding: {
            type: [Number],
            required: true
        }
    },
    {
        timestamps: true
    }
);

const RagChunk = mongoose.model("RagChunk", ragChunkSchema);

export default RagChunk;

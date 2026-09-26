import "dotenv/config";
import fs from "fs";

import { connectDB } from "../config/db.js";
import RagChunk from "../models/RagChunk.js";


const embeddedChunks = JSON.parse(
    fs.readFileSync(
        "./src/rag/embeddedChunks.json",
        "utf-8"
    )
);


await connectDB();

console.log(`Found ${embeddedChunks.length} embedded chunks.`);

await RagChunk.deleteMany({});

await RagChunk.insertMany(embeddedChunks);

console.log("Embeddings stored successfully in MongoDB.");

process.exit(0);
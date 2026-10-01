import "dotenv/config";

import { connectDB } from "./src/config/db.js";

import {
    generateEmbedding
} from "./src/rag/semanticEmbedder.js";

import {
    searchMongoDB
} from "./src/rag/mongoVectorSearch.js";

import {
    buildContext
} from "./src/rag/contextBuilder.js";


await connectDB();


const question = "What is a process?";


console.log("Question:");
console.log(question);


console.log("\nGenerating query embedding...");

const queryEmbedding = await generateEmbedding(question);


console.log(
    "Query embedding length:",
    queryEmbedding.length
);


console.log("\nSearching MongoDB...");

const results = await searchMongoDB(
    queryEmbedding,
    3
);


console.log("\nRetrieved:", results.length, "chunks");


const context = buildContext(results);


console.log("\n========== GENERATED CONTEXT ==========\n");

console.log(context);


process.exit(0);

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

import {
    buildRAGPrompt
} from "./src/rag/promptBuilder.js";


await connectDB();


const question = "What is a process?";


console.log("Question:");
console.log(question);


console.log("\nGenerating query embedding...");

const queryEmbedding = await generateEmbedding(question);


console.log("\nSearching MongoDB...");

const results = await searchMongoDB(
    queryEmbedding,
    3
);


const context = buildContext(results);


const prompt = buildRAGPrompt(
    question,
    context
);


console.log("\n========== FINAL RAG PROMPT ==========\n");

console.log(prompt);


process.exit(0);

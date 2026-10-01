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


console.log("========================================");
console.log("          RAG PIPELINE START");
console.log("========================================");


console.log("\nQuestion:");
console.log(question);


// ----------------------------------------
// STEP 1: Generate query embedding
// ----------------------------------------

console.log("\n[1] Generating query embedding...");

const queryEmbedding = await generateEmbedding(question);

console.log(
    "Query embedding length:",
    queryEmbedding.length
);


// ----------------------------------------
// STEP 2: Search MongoDB
// ----------------------------------------

console.log("\n[2] Searching MongoDB Vector Search...");

const results = await searchMongoDB(
    queryEmbedding,
    3
);

console.log(
    "Retrieved chunks:",
    results.length
);


// ----------------------------------------
// STEP 3: Build context
// ----------------------------------------

console.log("\n[3] Building context...");

const context = buildContext(results);

console.log(
    "Context length:",
    context.length,
    "characters"
);


// ----------------------------------------
// STEP 4: Build RAG prompt
// ----------------------------------------

console.log("\n[4] Building RAG prompt...");

const prompt = buildRAGPrompt(
    question,
    context
);

console.log("RAG prompt created.");


// ----------------------------------------
// STEP 5: Send prompt to Ollama
// ----------------------------------------

console.log("\n[5] Sending prompt to Qwen...");

const response = await fetch(
    "http://localhost:11434/api/generate",
    {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            model: "qwen2.5:3b",
            prompt: prompt,
            stream: false
        })
    }
);


const data = await response.json();


// ----------------------------------------
// STEP 6: Print final answer
// ----------------------------------------

console.log("\n========================================");
console.log("             FINAL ANSWER");
console.log("========================================\n");

console.log(data.response);


// ----------------------------------------
// STEP 7: Print sources
// ----------------------------------------

console.log("\n========================================");
console.log("              SOURCES");
console.log("========================================\n");

results.forEach((result, index) => {

    console.log(
        `Source ${index + 1}: Page ${result.page}`
    );

    console.log(
        `Similarity Score: ${result.score}`
    );

    console.log();
});


process.exit(0);
import fs from "fs";

import {
    generateEmbedding
} from "./src/rag/semanticEmbedder.js";

import {
    searchChunks
} from "./src/rag/semanticSearch.js";


// Load our previously generated embeddings
const embeddedChunks = JSON.parse(
    fs.readFileSync(
        "./src/rag/embeddedChunks.json",
        "utf-8"
    )
);


const question = "What is a process?";


console.log("Question:");
console.log(question);


console.log("\nGenerating query embedding...");

const queryEmbedding = await generateEmbedding(question);


console.log("Query embedding length:");
console.log(queryEmbedding.length);


// Search
const results = searchChunks(
    queryEmbedding,
    embeddedChunks,
    3
);


// Display results
console.log("\n========== TOP 3 RESULTS ==========");

results.forEach((result, index) => {

    console.log(`\n--- Result ${index + 1} ---`);

    console.log("Page:", result.page);

    console.log("Score:", result.score);

    console.log("Text:");
    console.log(result.text);
});
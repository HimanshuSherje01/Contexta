import "dotenv/config";

import { connectDB } from "./src/config/db.js";

import {
    generateEmbedding
} from "./src/rag/semanticEmbedder.js";

import {
    searchMongoDB
} from "./src/rag/mongoVectorSearch.js";


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


console.log("\nSearching MongoDB Vector Search...");

const results = await searchMongoDB(
    queryEmbedding,
    3
);


console.log("\n========== TOP RESULTS ==========");

results.forEach((result, index) => {

    console.log(`\n--- Result ${index + 1} ---`);

    console.log("Page:", result.page);

    console.log("Score:", result.score);

    console.log("Text:");
    console.log(result.text);
});


process.exit(0);

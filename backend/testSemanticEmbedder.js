import { generateEmbedding } from "./src/rag/semanticEmbedder.js";

const text = "A process is basically a program in execution.";

const embedding = await generateEmbedding(text);

console.log("\nEmbedding length:");
console.log(embedding.length);

console.log("\nFirst 10 values:");
console.log(embedding.slice(0, 10));
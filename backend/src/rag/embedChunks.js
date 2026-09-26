import fs from "fs";
import path from "path";

import { extractTextFromPDF } from "./pdfLoader.js";
import { chunkPages } from "./chunker.js";
import { generateEmbedding } from "./semanticEmbedder.js";


const pdfPath = path.join(
    process.cwd(),
    "documents",
    "Operating_System.pdf"
);

// 1. Extract PDF
const pdfData = await extractTextFromPDF(pdfPath);

console.log("PDF Pages:", pdfData.pages);


// 2. Create chunks
const chunks = chunkPages(pdfData.pageTexts);

console.log("Total Chunks:", chunks.length);


// 3. Generate embeddings
const embeddedChunks = [];

for (let i = 0; i < chunks.length; i++) {

    const chunk = chunks[i];

    console.log(`Embedding chunk ${i + 1}/${chunks.length}`);

    const embedding = await generateEmbedding(chunk.text);

    embeddedChunks.push({
        text: chunk.text,
        page: chunk.page,
        embedding: embedding
    });
}


// 4. Inspect first result
console.log("\n========== FIRST EMBEDDED CHUNK ==========");

console.log("Page:", embeddedChunks[0].page);

console.log("Text:");
console.log(embeddedChunks[0].text);

console.log("\nEmbedding length:");
console.log(embeddedChunks[0].embedding.length);

console.log("\nFirst 10 embedding values:");
console.log(
    embeddedChunks[0].embedding.slice(0, 10)
);

fs.writeFileSync(
    "./src/rag/embeddedChunks.json",
    JSON.stringify(embeddedChunks, null, 2)
);

console.log("\nEmbeddings saved successfully!");
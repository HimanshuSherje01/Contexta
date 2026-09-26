import path from "path";
import { fileURLToPath } from "url";

import { extractTextFromPDF } from "./pdfLoader.js";
import { chunkPages } from "./chunker.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfPath = path.join(
    __dirname,
    "../../documents/Operating_System.pdf"
);

const test = async () => {
    try {

        // PDF → page-wise text
        const result = await extractTextFromPDF(pdfPath);

        console.log("PDF Pages:", result.pages);

        // Page-wise text → chunks
        const chunks = chunkPages(
            result.pageTexts,
            1000,
            200
        );

        console.log("Total Chunks:", chunks.length);

        // Show first 5 chunks
        chunks.slice(0, 5).forEach((chunk, index) => {

            console.log(
                `\n========== CHUNK ${index + 1} ==========`
            );

            console.log("Page:", chunk.page);
            console.log("Text:", chunk.text);
        });

    } catch (error) {
        console.error("Chunking failed:", error);
    }
};

test();
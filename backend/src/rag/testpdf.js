import path from "path";
import { fileURLToPath } from "url";
import { extractTextFromPDF } from "./pdfLoader.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfPath = path.join(
    __dirname,
    "../../documents/Operating_System.pdf"
);

const test = async () => {
    try {
        const result = await extractTextFromPDF(pdfPath);

        console.log("Number of pages:", result.pages);

        console.log("\n========== PDF TEXT ==========\n");
        console.log(result.text);
    } catch (error) {
        console.error("Failed to process PDF:", error);
    }
};

test();
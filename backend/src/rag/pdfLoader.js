import fs from "fs";
import { PDFParse } from "pdf-parse";

export const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);

        const parser = new PDFParse({
            data: dataBuffer
        });

        const result = await parser.getText();

        await parser.destroy();

        const pageTexts = result.pages.map((page) => ({
            page: page.num,
            text: page.text.trim()
        }));

        return {
            pages: result.total,
            pageTexts
        };

    } catch (error) {
        console.error("Error extracting PDF:", error);
        throw error;
    }
};
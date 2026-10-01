import Document from "../models/Document.js";
import RagChunk from "../models/RagChunk.js";
import { extractTextFromPDF } from "../rag/pdfLoader.js";
import { chunkPages } from "../rag/chunker.js";
import { generateEmbedding } from "../rag/semanticEmbedder.js";

/**
 * Process a PDF document buffer: extract text, chunk, generate embeddings,
 * insert into RagChunk, and update Document record.
 *
 * @param {Buffer} fileBuffer - The PDF file binary buffer
 * @param {string|mongoose.Types.ObjectId} documentId - The Document ID
 * @param {string|mongoose.Types.ObjectId} userId - The user ID who owns the document
 */
export async function processDocument(fileBuffer, documentId, userId) {
  try {
    console.log(`[DocumentProcessor] Starting processing for document ${documentId}`);

    // 1. Extract text and pages
    const pdfData = await extractTextFromPDF(fileBuffer);

    if (!pdfData.pageTexts || pdfData.pageTexts.length === 0) {
      throw new Error("No readable text found in PDF. The document may be scanned or empty.");
    }

    const totalChars = pdfData.pageTexts.reduce((acc, p) => acc + p.text.length, 0);
    if (totalChars === 0) {
      throw new Error("The PDF does not contain extractable text (it may be an image scan).");
    }

    // 2. Chunk pages
    const chunks = chunkPages(pdfData.pageTexts, 1000, 200);

    if (chunks.length === 0) {
      throw new Error("Could not produce any text chunks from this document.");
    }

    console.log(
      `[DocumentProcessor] Extracted ${pdfData.pages} pages, generated ${chunks.length} chunks. Generating embeddings...`
    );

    // 3. Generate embeddings in controlled batches to prevent event loop starvation and memory spikes
    const BATCH_SIZE = 5;
    const chunkDocs = [];

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);

      const batchPromises = batch.map(async (chunk, batchIdx) => {
        const globalIdx = i + batchIdx;
        const embedding = await generateEmbedding(chunk.text);
        return {
          documentId,
          userId,
          chunkIndex: globalIdx,
          page: chunk.page,
          text: chunk.text,
          embedding,
        };
      });

      const resolvedBatch = await Promise.all(batchPromises);
      chunkDocs.push(...resolvedBatch);
    }

    // 4. Bulk insert into RagChunk
    await RagChunk.insertMany(chunkDocs);

    // 5. Update Document to 'ready'
    await Document.findByIdAndUpdate(documentId, {
      pageCount: pdfData.pages,
      chunkCount: chunkDocs.length,
      status: "ready",
      errorMessage: null,
    });

    console.log(
      `[DocumentProcessor] Successfully processed document ${documentId} (${chunkDocs.length} chunks indexed).`
    );
  } catch (error) {
    console.error(`[DocumentProcessor] Failed to process document ${documentId}:`, error);

    await Document.findByIdAndUpdate(documentId, {
      status: "failed",
      errorMessage: error.message || "Failed to process PDF",
    }).catch((dbErr) => {
      console.error("[DocumentProcessor] Failed to mark document as failed:", dbErr);
    });
  }
}

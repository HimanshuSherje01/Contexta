import { pipeline } from "@huggingface/transformers";

let extractor = null;

const loadModel = async () => {
    if (!extractor) {
        console.log("Loading embedding model...");

        extractor = await pipeline(
            "feature-extraction",
            "Xenova/all-MiniLM-L6-v2"
        );

        console.log("Embedding model loaded.");
    }

    return extractor;
};


export const generateEmbedding = async (text) => {

    const model = await loadModel();

    const output = await model(text, {
        pooling: "mean",
        normalize: true
    });

    return Array.from(output.data);
};
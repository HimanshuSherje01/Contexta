import {
    generateEmbedding
} from "./src/rag/semanticEmbedder.js";

const textA =
    "A process is basically a program in execution.";

const textB =
    "A running program is called a process.";

const textC =
    "Mumbai is a major city in India.";


const vectorA = await generateEmbedding(textA);

const vectorB = await generateEmbedding(textB);

const vectorC = await generateEmbedding(textC);


const cosineSimilarity = (vectorA, vectorB) => {

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vectorA.length; i++) {

        dotProduct += vectorA[i] * vectorB[i];

        magnitudeA += vectorA[i] * vectorA[i];

        magnitudeB += vectorB[i] * vectorB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    return dotProduct / (magnitudeA * magnitudeB);
};


console.log("\nSimilarity A ↔ B:");

console.log(
    cosineSimilarity(vectorA, vectorB)
);


console.log("\nSimilarity A ↔ C:");

console.log(
    cosineSimilarity(vectorA, vectorC)
);
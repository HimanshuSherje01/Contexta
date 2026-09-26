export const cosineSimilarity = (vectorA, vectorB) => {

    if (vectorA.length !== vectorB.length) {
        throw new Error("Vectors must have the same dimensions");
    }

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

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
};

export const searchChunks = (
    queryEmbedding,
    chunks,
    topK = 3
) => {

    const results = chunks.map((chunk) => {

        const score = cosineSimilarity(
            queryEmbedding,
            chunk.embedding
        );

        return {
            text: chunk.text,
            page: chunk.page,
            score: score
        };
    });

    results.sort((a, b) => b.score - a.score);

    return results.slice(0, topK);
};
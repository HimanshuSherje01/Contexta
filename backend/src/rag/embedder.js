export const tokenize = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter(Boolean);
};


export const buildVocabulary = (texts) => {
    const vocabulary = new Set();

    for (const text of texts) {
        const tokens = tokenize(text);

        for (const token of tokens) {
            vocabulary.add(token);
        }
    }

    return [...vocabulary];
};


export const textToVector = (text, vocabulary) => {
    const tokens = tokenize(text);

    const vector = vocabulary.map((word) => {
        return tokens.filter((token) => token === word).length;
    });

    return vector;
};

export const cosineSimilarity = (vectorA, vectorB) => {

    if (vectorA.length !== vectorB.length) {
        throw new Error("Vectors must have the same length");
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
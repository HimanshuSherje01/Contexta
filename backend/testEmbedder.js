import {
    tokenize,
    buildVocabulary,
    textToVector,
    cosineSimilarity
} from "./src/rag/embedder.js";

const texts = [
    "A process is a program in execution.",
    "A process uses memory."
];


console.log("TOKENIZED TEXT:");

console.log(tokenize(texts[0]));


const vocabulary = buildVocabulary(texts);

console.log("\nVOCABULARY:");

console.log(vocabulary);


const vector1 = textToVector(texts[0], vocabulary);

const vector2 = textToVector(texts[1], vocabulary);


console.log("\nVECTOR 1:");

console.log(vector1);


console.log("\nVECTOR 2:");

console.log(vector2);

const similarity = cosineSimilarity(vector1, vector2);

console.log("\nCOSINE SIMILARITY:");

console.log(similarity);
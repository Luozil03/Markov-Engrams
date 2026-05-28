import {
  buildTransitionMatrix,
  generateText,
  serializeMatrix,
} from "./src/markov.js";

const sampleText = `
Il gatto si arrampica sul tetto e osserva il tramonto dorato.
Il cane corre nel giardino inseguendo una farfalla colorata.
Il gatto nel giardino gioca con il cane sotto il sole caldo.
Il sole splende alto nel cielo azzurro e illumina il paesaggio.
Il cane si sdraia sotto l'albero e dorme tranquillo nel pomeriggio.
`;

console.log("--- TEST ALGORITMO MARKOV ---");
console.log("Testo sorgente:", sampleText.trim());

// Test Ordine 1
const matrix1 = buildTransitionMatrix(sampleText, 1);
console.log(`\nMatrice ordine 1 creata: ${matrix1.size} stati`);

let count = 0;
for (const [state, transitions] of matrix1) {
  if (count >= 5) break;
  const transStr = Array.from(transitions.entries())
    .map(([word, prob]) => `${word}(${(prob * 100).toFixed(0)}%)`)
    .join(", ");
  console.log(`[${state}] -> ${transStr}`);
  count++;
}

console.log("\nGenerazione frasi (ordine 1):");
for (let i = 1; i <= 3; i++) {
  console.log(`${i}. ${generateText(matrix1, 15)}`);
}

// Test Ordine 2
const matrix2 = buildTransitionMatrix(sampleText, 2);
console.log(`\nMatrice ordine 2 creata: ${matrix2.size} stati`);
console.log("Generazione frasi (ordine 2):");
for (let i = 1; i <= 3; i++) {
  console.log(`${i}. ${generateText(matrix2, 15)}`);
}

// Test Serilizzazione
console.log(
  "\nTest serializzazione OK:",
  typeof serializeMatrix(matrix1) === "object",
);

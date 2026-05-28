// Script veloce per testare se Mongoose salva bene gli engrammi
import mongoose from "mongoose";
import {
  buildTransitionMatrix,
  generateText,
  serializeMatrix,
  deserializeMatrix,
  MarkovModel,
} from "./src/index.js";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/textgen_db";

async function runTest() {
  console.log("--- TEST DB MONGOOSE ---");

  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connesso a Mongo");
  } catch (err) {
    console.error("Errore connessione DB (Docker è acceso?):", err.message);
    process.exit(1);
  }

  try {
    const text =
      "Il gatto mangia il pesce. Il cane mangia la carne. Il gatto dorme.";
    const matrix = buildTransitionMatrix(text, 1);

    console.log("Salvataggio modello di test...");
    const savedModel = await MarkovModel.create({
      name: "Test Modello Veloce",
      description: "Test",
      order: 1,
      sourceLength: text.split(" ").length,
      transitionMatrix: serializeMatrix(matrix),
    });

    console.log(`Salvato con ID: ${savedModel._id}`);

    console.log("Rilettura dal DB...");
    const loadedModel = await MarkovModel.findById(savedModel._id);

    if (loadedModel) {
      console.log("Riletto correttamente:", loadedModel.name);
      const reloadedMatrix = deserializeMatrix(loadedModel.transitionMatrix);
      console.log("Testo generato dal DB:", generateText(reloadedMatrix, 10));
    }

    // Pulizia
    await MarkovModel.findByIdAndDelete(savedModel._id);
    console.log("Modello di test eliminato.");
  } catch (err) {
    console.error("Errore durante il test:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnesso.");
  }
}

runTest();

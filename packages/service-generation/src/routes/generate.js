import { Router } from "express";
import { MarkovModel, deserializeMatrix, generateText } from "@mvgc/shared";

const router = Router();

// POST /api/generate genera un nuovo engramma
router.post("/generate", async (req, res, next) => {
  try {
    const { modelId, length = 50, seed, temperature = 1.0 } = req.body;

    // Limitiamo la temperatura tra 0.1 e 3.0 per evitare output completamente senza senso
    const safeTemp = Math.min(3.0, Math.max(0.1, Number(temperature) || 1.0));

    if (!modelId) {
      return res
        .status(400)
        .json({ success: false, error: "Il modelId è obbligatorio" });
    }

    console.log(`[Generate] Richiesta generazione per modello: ${modelId}`);

    const model = await MarkovModel.findById(modelId);
    if (!model) {
      return res
        .status(404)
        .json({ success: false, error: "Modello non trovato" });
    }

    // generateText() lavora con le Map, quindi deserializzo il JSON salvato su Mongo
    const matrix = deserializeMatrix(model.transitionMatrix);
    // console.log("Matrice caricata:", matrix); // ATTENZIONE!!! non decommentare sennò esplode il terminale per testi lunghi

    const generatedText = generateText(matrix, length, seed, safeTemp);

    const wordCount = generatedText.split(/\s+/).filter(Boolean).length;

    console.log(
      `[Generate] Creato testo di ${wordCount} parole dal modello "${model.name}"`,
    );

    res.json({
      success: true,
      modelName: model.name,
      text: generatedText,
      wordCount,
    });
  } catch (error) {
    // Deleghiamo la gestione dell'errore all'error handler
    next(error);
  }
});

export default router;

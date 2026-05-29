import { Router } from "express";
import {
  buildTransitionMatrix,
  serializeMatrix,
  MarkovModel,
} from "@mvgc/shared";

const router = Router();

// Endpoint per analizzare il testo e salvare il modello (Engramma) su Mongo
router.post("/train", async (req, res, next) => {
  try {
    const { name, description, text, order = 1 } = req.body;

    // Validazione base
    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Manca il nome del modello" });
    }

    if (!text || !text.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Manca il testo sorgente" });
    }

    // TODO: il conteggio delle parole è un po' grezzo (conta solo gli spazi),
    // ma per bloccare testi vuoti o minuscoli va più che bene.
    const wordCount = text.trim().split(/\s+/).length;
    if (wordCount <= order) {
      return res.status(400).json({
        success: false,
        error: `Testo troppo corto (minimo ${order + 1} parole, trovate ${wordCount})`,
      });
    }

    console.log(
      `[Training] Inizio elaborazione per: "${name}" (ordine ${order}, parole: ${wordCount})`,
    );

    // Creazione e serializzazione
    const matrix = buildTransitionMatrix(text, order);
    const serialized = serializeMatrix(matrix);

    console.log(`[Training] Matrice costruita: ${matrix.size} stati`);

    // Salvataggio nel DB tramte Mongoose
    const model = await MarkovModel.create({
      name: name.trim(),
      description: description?.trim() || "",
      order,
      sourceLength: wordCount,
      transitionMatrix: serialized,
    });

    console.log(`[Training] Modello salvato con ID: ${model._id}`);

    // Ritorno solo i metadati al client.
    // NON ritorno tutta la matrice altrimenti il JSON esplode in dimensioni
    res.status(201).json({
      success: true,
      model: {
        _id: model._id,
        name: model.name,
        description: model.description,
        order: model.order,
        sourceLength: model.sourceLength,
        states: matrix.size,
        createdAt: model.createdAt,
      },
    });
  } catch (error) {
    // Passo l'errore al middleware centralizzato (in @mvgc/shared)
    next(error);
  }
});

export default router;

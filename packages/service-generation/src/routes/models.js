import { Router } from "express";
import { MarkovModel } from "@mvgc/shared";

const router = Router();

// Recupera la lista di tutti i modelli salvati
router.get("/models", async (req, res, next) => {
  try {
    // Escludo transitionMatrix perché pesa troppo e per la lista non serve
    const models = await MarkovModel.find()
      .select("-transitionMatrix")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: models.length,
      models,
    });
  } catch (error) {
    next(error);
  }
});

// Recupera un singolo modello (con matrice inclusa)
router.get("/models/:id", async (req, res, next) => {
  try {
    const model = await MarkovModel.findById(req.params.id).lean();

    if (!model) {
      return res
        .status(404)
        .json({ success: false, error: "Modello non trovato" });
    }

    res.json({ success: true, model });
  } catch (error) {
    next(error);
  }
});

// Aggiorna parzialmente un modello (solo nome o descrizione)
router.patch("/models/:id", async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: "Nessun campo valido da aggiornare",
      });
    }

    const model = await MarkovModel.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-transitionMatrix");

    if (!model) {
      return res
        .status(404)
        .json({ success: false, error: "Modello non trovato" });
    }

    console.log(`[Models] Aggiornato modello: ${model.name}`);
    res.json({ success: true, model });
  } catch (error) {
    next(error);
  }
});

// Elimina un modello
router.delete("/models/:id", async (req, res, next) => {
  try {
    const model = await MarkovModel.findByIdAndDelete(req.params.id);

    if (!model) {
      return res
        .status(404)
        .json({ success: false, error: "Modello non trovato" });
    }

    console.log(`[Models] Eliminato modello: ${model.name}`);

    res.json({
      success: true,
      message: `Modello eliminato con successo`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

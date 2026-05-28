import { Router } from "express";

const router = Router();

// TODO: Implementare qui la rotta POST /train per l'algoritmo di Markov
router.post("/train", (req, res) => {
  res.status(501).json({ error: "Rotta in fase di sviluppo" });
});

export default router;

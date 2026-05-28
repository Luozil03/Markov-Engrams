import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { errorHandler } from "@mvgc/shared";
import trainRouter from "./routes/train.js";

const PORT = process.env.PORT || 4001;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/textgen_db";

const app = express();

app.use(cors());
// Limite a 5MB per permettere l'upload di saggi o testi lunghi senza far crashare Express
app.use(express.json({ limit: "5mb" }));

app.use("/api", trainRouter);

// Endpoint di health check (utile per verificare se il container Docker è vivo)
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "training" });
});

app.use(errorHandler);

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[Training Service] Connesso a MongoDB su ${MONGO_URI}`);

    app.listen(PORT, () => {
      console.log(`[Training Service] Server in ascolto sulla porta ${PORT}`);
    });
  } catch (error) {
    console.error("Errore fatale all'avvio del server:", error.message);
    process.exit(1);
  }
}

start();

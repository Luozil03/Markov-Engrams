import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { errorHandler } from "@mvgc/shared";
import modelsRouter from "./routes/models.js";
import generateRouter from "./routes/generate.js";

const PORT = process.env.PORT || 4002;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/textgen_db";

const app = express();

app.use(cors());
app.use(express.json());

// Montiamo le rotte
app.use("/api", modelsRouter);
app.use("/api", generateRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "generation" });
});

// Error handler centralizzato sempre alla fine
app.use(errorHandler);

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[Generation Service] Connesso a MongoDB su ${MONGO_URI}`);

    app.listen(PORT, () => {
      console.log(`[Generation Service] Server in ascolto sulla porta ${PORT}`);
    });
  } catch (error) {
    console.error("Errore fatale all'avvio del server:", error.message);
    process.exit(1);
  }
}

start();

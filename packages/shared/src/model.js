import mongoose from "mongoose";

// Modello per il salvataggio engrammi
const markovModelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Inserisci un nome per il modello"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
      max: 3, // TODO: se aumentiamo l'ordine oltre il 3, il DB potrebbe esplodere per i testi lunghi
      default: 1,
    },
    sourceLength: {
      type: Number,
      required: true,
      min: 0,
    },
    // Mixed perché chiavi della matrice sono parole dinamiche
    transitionMatrix: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const MarkovModel = mongoose.model("MarkovModel", markovModelSchema);

export default MarkovModel;

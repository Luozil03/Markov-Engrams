// Export centralizzato per il modulo shared
export {
  buildTransitionMatrix,
  generateText,
  serializeMatrix,
  deserializeMatrix,
} from "./markov.js";

export { default as MarkovModel } from "./model.js";
export { default as errorHandler } from "./errorHandler.js";

// Tokenizza il testo: lowercase, stacca la punteggiatura e splitta.
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/([.!?,:;])/g, " $1 ")
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

export function buildTransitionMatrix(text, order = 1) {
  const tokens = tokenize(text);

  if (tokens.length <= order) {
    return new Map();
  }

  // Mappa delle frequenze assolute
  const freqMap = new Map();

  for (let i = 0; i <= tokens.length - order - 1; i++) {
    const state = tokens.slice(i, i + order).join(" ");
    const nextWord = tokens[i + order];

    if (!freqMap.has(state)) {
      freqMap.set(state, new Map());
    }

    const transitions = freqMap.get(state);
    transitions.set(nextWord, (transitions.get(nextWord) ?? 0) + 1);
  }

  // Normalizzo le frequenze in probabilità (0.0 - 1.0)
  const matrix = new Map();

  for (const [state, transitions] of freqMap) {
    const total = Array.from(transitions.values()).reduce((a, b) => a + b, 0);
    const probs = new Map();

    for (const [word, count] of transitions) {
      probs.set(word, count / total);
    }
    matrix.set(state, probs);
  }

  return matrix;
}

// Funzione di supporto per pescaggio pesato (con temperatura)
function weightedRandomPick(probabilities, temperature = 1.0) {
  let adjustedProbs = probabilities;

  if (temperature !== 1.0 && temperature > 0) {
    adjustedProbs = new Map();
    let sum = 0;

    for (const [word, prob] of probabilities) {
      const adjusted = Math.pow(prob, 1.0 / temperature);
      adjustedProbs.set(word, adjusted);
      sum += adjusted;
    }

    for (const [word, prob] of adjustedProbs) {
      adjustedProbs.set(word, prob / sum);
    }
  }

  const random = Math.random();
  let cumulative = 0;

  for (const [word, prob] of adjustedProbs) {
    cumulative += prob;
    if (random <= cumulative) return word;
  }

  // Fallback se qualcosa va storto con i float
  const entries = Array.from(adjustedProbs.keys());
  return entries[entries.length - 1];
}

export function generateText(matrix, length = 50, seed, temperature = 1.0) {
  if (matrix.size === 0) return "";

  const states = Array.from(matrix.keys());
  let currState;

  // Se passo un seed valido parto da lì, altrimenti a caso
  if (seed && matrix.has(seed.toLowerCase())) {
    currState = seed.toLowerCase();
  } else {
    currState = states[Math.floor(Math.random() * states.length)];
  }

  const words = currState.split(" ");

  // Random Walk
  while (words.length < length) {
    const transitions = matrix.get(currState);

    if (!transitions || transitions.size === 0) {
      // riparto da uno stato casuale
      currState = states[Math.floor(Math.random() * states.length)];
      const newTokens = currState.split(" ");
      words.push("—"); // separatore visivo
      words.push(...newTokens);
      continue;
    }

    const nextWord = weightedRandomPick(transitions, temperature);
    words.push(nextWord);

    // Faccio scorrere la finestra per il prossimo step
    const stateTokens = currState.split(" ");

    stateTokens.push(nextWord);
    stateTokens.shift();
    currState = stateTokens.join(" ");
  }

  return words.join(" ");
}

// Helpers per serializzare/deserializzare le map di js per mongodb
export function serializeMatrix(matrix) {
  const obj = {};
  for (const [state, transitions] of matrix) {
    obj[state] = {};
    for (const [word, prob] of transitions) {
      obj[state][word] = prob;
    }
  }
  return obj;
}

export function deserializeMatrix(obj) {
  const matrix = new Map();
  for (const state of Object.keys(obj)) {
    const transitions = new Map();
    for (const [word, prob] of Object.entries(obj[state])) {
      transitions.set(word, prob);
    }
    matrix.set(state, transitions);
  }
  return matrix;
}

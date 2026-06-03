// Funzioni per chiamare il backend (le API del progetto)
// Non so bene come funzioni il proxy di Vite ma coi percorsi /api/... dovrebbe andare

export async function trainModel(data) {
  const response = await fetch("/api/train", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

// restituisce tutti i modelli salvati
export async function getModels() {
  const response = await fetch("/api/models");
  return response.json();
}

// cancella un modello (per ora funziona)
export async function deleteModel(id) {
  const response = await fetch(`/api/models/${id}`, {
    method: "DELETE",
  });
  return response.json();
}

// aggiorna la descrizione o altre cose
export async function updateModel(id, data) {
  const response = await fetch(`/api/models/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function generateText(data) {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

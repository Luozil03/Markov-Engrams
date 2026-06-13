# Markov-Engrams

"Markov-Engrams" è una web-app che implementa un modello probabilistico basato
sulle **Catene di Markov** per la generazione procedurale del testo. L'utente
può caricare un testo sorgente (es. un saggio, una poesia o un articolo) per
"addestrare" un modello. Il sistema analizza le frequenze e le transizioni tra
le parole per costruire una matrice sparsa (salvata nel database). Tramite una
dashboard, è poi possibile far generare al sistema nuovi testi pseudo-casuali
impostando parametri come la _lunghezza_, il _seed_ di partenza e la
_temperatura_ (per variare il livello di "creatività" e casualità).

## Architettura

L'applicazione è strutturata secondo un'architettura a **microservizi**,
progettata per separare logicamente i carichi di lavoro computazionali (il
training matematico) da quelli di lettura (la generazione in tempo reale). Lo
stack comprende:

- **Frontend (React + Vite):** Interfaccia utente a singola pagina (SPA).
  Comunica con i microservizi tramite API RESTful (GET, POST, PATCH, DELETE).
  Gestisce lo stato globale e il routing dinamico lato client.
- **Backend - Training Service (Node.js/Express su porta 4001):** Microservizio
  dedicato all'analisi computazionale intensiva. Riceve il testo sorgente,
  esegue la tokenizzazione, calcola le probabilità della matrice di transizione
  e serializza i dati nel DB.
- **Backend - Generation Service (Node.js/Express su porta 4002):**
  Microservizio dedicato alla consultazione. Recupera i modelli dal database
  escludendo i payload troppo pesanti nelle query di lista
  (`.select("-transitionMatrix")` per ottimizzare la banda), ed esegue
  l'algoritmo di Random Walk ponderato per generare i nuovi testi.
- **Database (MongoDB):** Database NoSQL orientato ai documenti. È stato scelto
  perché le matrici di transizione di Markov (oggetti JSON profondamente
  annidati e molto sparsi) si mappano in modo nativo ed efficiente nei documenti
  BSON di Mongo rispetto alle tradizionali tabelle relazionali.

## Requisiti e Installazione

Per avviare il progetto sono necessari:

- **Node.js** (e il package manager `pnpm`)
- **Docker** (per l'istanza locale di MongoDB)

### Avvio Rapido

Per facilitare il testing del progetto:

1. Apri il terminale nella radice del progetto.
2. Rendi eseguibili gli script:
   ```bash
   chmod +x start.sh stop.sh
   ```

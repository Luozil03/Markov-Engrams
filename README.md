# Markov-Engrams

Markov-Engrams is a web application that uses **Markov Chains** to generate text
procedurally. You can provide any source text (via copy-paste, a `.txt` file
upload, or by fetching a **Wikipedia** article) to "train" a model. The app
analyzes word frequencies and transitions to build a sparse transition matrix.
Once trained, you can use the dashboard to generate new, pseudo-random text by
tweaking parameters like _length_, starting _seed_, and _temperature_ (which
controls how "creative" or random the output is).

## Architecture

I decided to use a **Microservices** architecture to keep the heavy math
(training) separate from the quick API calls (generation). The stack includes:

- **Frontend (React + Vite):** A Single Page Application (SPA) that talks to the
  backend via RESTful APIs and handles client-side routing.
- **Training Service (Node.js/Express on port 4001):** This service does the
  heavy lifting. It receives the text, tokenizes it, calculates the transition
  probabilities, and saves the model to the DB.
- **Generation Service (Node.js/Express on port 4002):** This service handles
  fetching models and generating text. To save bandwidth, it excludes the heavy
  transition matrix when just listing the saved models (using
  `.select("-transitionMatrix")`). It runs a weighted Random Walk algorithm to
  output the text.
- **Database (MongoDB):** I chose MongoDB because Markov transition matrices are
  basically large, sparse JSON objects. Storing them as BSON documents is much
  more natural and efficient than trying to force them into relational SQL
  tables.

## Requirements

To run the project locally, you need:

- **Node.js** (with `pnpm`)
- **Docker** (for the local MongoDB instance)

_(Side note: I originally developed this on NixOS, so I included a `flake.nix`
if you want a reproducible devshell with Node and pnpm already set up)._

### Quick Start

To get everything running without starting each service manually:

1. Open a terminal in the root directory.
2. Make the bash scripts executable (only needed the first time):
   ```bash
   chmod +x start.sh stop.sh
   ```
3. Run the startup script (this spins up the Docker container, installs
   dependencies, and starts the 3 Node servers in the background):
   ```bash
   ./start.sh
   ```
4. Open your browser at: http://localhost:5173
5. To stop the Express and Vite servers, just press `CTRL+C` in the terminal.
6. To shut down the database and remove the Docker container when you're done,
   run:
   ```bash
   ./stop.sh
   ```

## Usage

The UI is split into three main views:

- **Train:** Where you create a new "Engram". Paste text, upload a file, or
  search Wikipedia. Pick the chain order (1 to 3) and start training.
- **Dashboard:** The main hub. It lists your saved models (you can edit or
  delete them). From here, you set the generation parameters (Length, Seed,
  Temperature) and hit "Generate Text" to see the output in the console UI.
- **Info:** A quick recap on the math behind Markov Chains and a diagram of the
  architecture.

## Monorepo Structure

The project uses `pnpm workspaces` so I could share types and logic between the
frontend and backend without duplicating code.

```text
packages/
 ├── shared/               # Core logic (Markov Algorithm, Mongoose Schemas, Error Handling)
 ├── frontend/             # UI (React, Vite, CSS)
 ├── service-training/     # API for POST /train
 └── service-generation/   # API for models CRUD and POST /generate
```
